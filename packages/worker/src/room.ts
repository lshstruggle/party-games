import { DurableObject } from 'cloudflare:workers'
import {
  MAX_MEMBERS,
  ROOM_TTL_MS,
  normalizeRoomCode,
  randomRoomCode,
  randomToken,
  type ClientMsg,
  type Member,
  type Room,
  type ServerMsg,
} from '@pg/shared'
import {
  applyAction,
  applyTick,
  createGameState,
  nextDeadline,
  privateView,
  redactState,
  type GameContext,
} from '@pg/game-core'

interface Attachment {
  memberId: string
  token: string
}

export interface Env {
  ROOMS: DurableObjectNamespace<RoomDO>
}

const HEARTBEAT_TIMEOUT_MS = 30_000

export class RoomDO extends DurableObject<Env> {
  private room: Room | null = null
  private loaded = false

  /**
   * clientToken -> memberId 的稳定身份映射。
   *
   * 为什么必须独立于 Room 存储：Room 对象会被广播给所有客户端，
   * 一旦把 token 表塞进 Room，任何人都能读到别人的 token 并冒充其身份。
   * 因此这张表只存在 DO storage 的独立 key 中，永不出现在任何出站消息里。
   */
  private tokens: Map<string, string> | null = null

  // ---------- 持久化 ----------

  private async ensure(): Promise<Room | null> {
    if (!this.loaded) {
      this.room = (await this.ctx.storage.get<Room>('room')) ?? null
      this.loaded = true
    }
    return this.room
  }

  private async commit(): Promise<void> {
    if (this.room) {
      this.room.lastActiveAt = Date.now()
      await this.ctx.storage.put('room', this.room)
    }
  }

  private async ensureTokens(): Promise<Map<string, string>> {
    if (!this.tokens) {
      const raw = (await this.ctx.storage.get<Record<string, string>>('tokens')) ?? {}
      this.tokens = new Map(Object.entries(raw))
    }
    return this.tokens
  }

  private async commitTokens(): Promise<void> {
    if (this.tokens) {
      await this.ctx.storage.put('tokens', Object.fromEntries(this.tokens))
    }
  }

  /**
   * 房主离线时把操作权移交给最早加入的在线成员。
   *
   * 聚会场景下必须立即转移：房主手机锁屏/来电导致断线时，
   * 若还死守房主身份，一屋子人会卡在「等房主点开始」无法继续。
   * 原房主重连后作为普通成员回来，不夺回房主身份。
   *
   * @returns 是否发生了转移
   */
  private reassignHostIfNeeded(room: Room): boolean {
    const current = room.members.find((m) => m.id === room.hostId)
    if (current?.online) return false

    const candidates = room.members.filter((m) => m.online).sort((a, b) => a.joinedAt - b.joinedAt)
    // 全员离线时保留原房主，等有人重连再说
    if (candidates.length === 0) return false

    const next = candidates[0]
    if (next.id === room.hostId) return false

    for (const m of room.members) m.isHost = false
    next.isHost = true
    room.hostId = next.id
    return true
  }

  // ---------- HTTP 入口 ----------

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'POST' && url.pathname.endsWith('/init')) {
      const body = (await request.json()) as { code?: string }
      const existing = await this.ensure()
      if (existing) return json({ code: existing.code })
      const now = Date.now()
      const room: Room = {
        code: body.code ?? randomRoomCode(),
        // 首个通过 WebSocket 加入的人自动成为房主
        hostId: '',
        revision: 1,
        phase: 'lobby',
        members: [],
        gameId: null,
        gameState: null,
        settings: { spice: 'mild', gameOptions: {} },
        createdAt: now,
        lastActiveAt: now,
      }
      this.room = room
      await this.commit()
      return json({ code: room.code })
    }

    if (request.method === 'GET' && url.pathname.endsWith('/info')) {
      const room = await this.ensure()
      if (!room) return json({ exists: false }, 404)
      return json({
        exists: true,
        code: room.code,
        memberCount: room.members.length,
        phase: room.phase,
        gameId: room.gameId,
        spice: room.settings.spice,
      })
    }

    // WebSocket 升级
    const upgrade = request.headers.get('Upgrade')
    if (upgrade === 'websocket') {
      return this.handleUpgrade()
    }

    return json({ error: 'not_found' }, 404)
  }

  private handleUpgrade(): Response {
    const pair = new WebSocketPair()
    const server = pair[1]
    // 使用 Hibernatable WebSocket：连接期间不占用 DO 内存，成本极低
    this.ctx.acceptWebSocket(server)
    server.serializeAttachment({ memberId: '', token: '' } satisfies Attachment)
    return new Response(null, { status: 101, webSocket: pair[0] })
  }

  // ---------- WebSocket 生命周期 ----------

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string): Promise<void> {
    const room = await this.ensure()
    if (!room) {
      this.safeSend(ws, { t: 'error', revision: 0, payload: { code: 'ROOM_GONE', message: '房间已解散' } })
      return
    }

    let msg: ClientMsg
    try {
      msg = JSON.parse(typeof message === 'string' ? message : new TextDecoder().decode(message)) as ClientMsg
    } catch {
      return
    }
    if (!msg || typeof msg.t !== 'string') return

    const att = (ws.deserializeAttachment() as Attachment | null) ?? { memberId: '', token: '' }
    const now = Date.now()

    switch (msg.t) {
      case 'join':
      case 'rejoin': {
        await this.handleJoin(ws, room, msg, att, now)
        break
      }
      case 'heartbeat': {
        if (!att.memberId) return
        const m = room.members.find((x) => x.id === att.memberId)
        if (m) {
          m.lastSeenAt = now
          if (!m.online) {
            m.online = true
            room.revision++
            await this.commit()
            this.broadcastState()
          }
        }
        this.safeSend(ws, { t: 'event', roomCode: room.code, revision: room.revision, payload: { kind: 'pong' } })
        break
      }
      case 'resync': {
        this.sendWelcome(ws, room, att.memberId)
        break
      }
      case 'action': {
        if (!att.memberId || !room.gameId || !room.gameState) return
        const action = (msg.payload ?? {}) as { kind: string; [k: string]: unknown }
        if (!action.kind) return
        const ctx = this.gameCtx(room)

        // 笔画是高频消息：只转发增量，全量状态改为节流广播，避免每 50ms 重传整张画
        if (room.gameId === 'draw' && action.kind === 'stroke') {
          const applied = applyAction(room.gameId, room.gameState as { seed: number }, action, {
            playerId: att.memberId,
            now,
            memberIds: ctx.memberIds,
          })
          room.gameState = applied
          this.broadcastExcept(att.memberId, {
            t: 'event',
            roomCode: room.code,
            revision: room.revision,
            payload: { kind: 'stroke', stroke: action },
          })
          if (now - this.lastDrawBroadcast > 600) {
            this.lastDrawBroadcast = now
            room.revision++
            // 每次节流广播时一并落盘：DO 若被回收，未落盘的笔画会整张丢失
            await this.commit()
            this.broadcastState()
          }
          break
        }

        const next = applyAction(room.gameId, room.gameState as { seed: number }, action, {
          playerId: att.memberId,
          now,
          memberIds: ctx.memberIds,
        })
        if (next !== room.gameState) {
          room.gameState = next
          room.revision++
          await this.commit()
          await this.armAlarm()
        }
        this.broadcastState()
        break
      }
      case 'startGame': {
        await this.handleStartGame(room, msg, att.memberId, now)
        break
      }
      case 'endGame': {
        if (att.memberId !== room.hostId) return
        room.phase = 'lobby'
        room.gameId = null
        room.gameState = null
        room.revision++
        await this.commit()
        await this.ctx.storage.deleteAlarm()
        this.broadcastState()
        break
      }
      case 'updateSettings': {
        if (att.memberId !== room.hostId) return
        const patch = (msg.payload ?? {}) as { spice?: 'mild' | 'spicy'; gameOptions?: Record<string, Record<string, unknown>> }
        if (patch.spice) room.settings.spice = patch.spice
        if (patch.gameOptions) room.settings.gameOptions = { ...room.settings.gameOptions, ...patch.gameOptions }
        room.revision++
        await this.commit()
        this.broadcastState()
        break
      }
      case 'kick': {
        if (att.memberId !== room.hostId) return
        const targetId = (msg.payload as { memberId?: string } | undefined)?.memberId
        if (!targetId || targetId === room.hostId) return
        await this.dropMember(room, targetId)
        break
      }
      case 'transferHost': {
        if (att.memberId !== room.hostId) return
        const targetId = (msg.payload as { memberId?: string } | undefined)?.memberId
        const target = room.members.find((m) => m.id === targetId)
        if (!target) return
        const prev = room.members.find((m) => m.id === room.hostId)
        if (prev) prev.isHost = false
        target.isHost = true
        room.hostId = target.id
        room.revision++
        await this.commit()
        this.broadcastState()
        break
      }
      case 'leave': {
        if (att.memberId) await this.dropMember(room, att.memberId)
        break
      }
      default:
        break
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    const room = await this.ensure()
    const att = (ws.deserializeAttachment() as Attachment | null) ?? null
    if (!room || !att?.memberId) return
    const m = room.members.find((x) => x.id === att.memberId)
    if (m && m.online) {
      m.online = false
      // 房主掉线必须立刻移交，否则「等房主点开始」会让整局卡死
      const moved = this.reassignHostIfNeeded(room)
      room.revision++
      await this.commit()
      this.broadcastState()
      if (moved) {
        const host = room.members.find((x) => x.id === room.hostId)
        this.broadcast({
          t: 'event',
          roomCode: room.code,
          revision: room.revision,
          payload: { kind: 'hostChanged', message: `${host?.nickname ?? '新房主'} 成为房主` },
        })
      }
    }
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    await this.webSocketClose(ws)
  }

  // ---------- 具体业务 ----------

  private async handleJoin(
    ws: WebSocket,
    room: Room,
    msg: ClientMsg,
    att: Attachment,
    now: number,
  ): Promise<void> {
    const clientToken = typeof msg.clientToken === 'string' ? msg.clientToken.slice(0, 80) : ''
    const tokens = await this.ensureTokens()

    // ── 身份找回，按可靠性从高到低尝试 ──
    // 1) 同一条连接重复 join（attachment 已绑定）
    // 2) 换了连接但带着同一个 clientToken（真正的「掉线重连」路径：
    //    新 WebSocket 的 attachment 必然是空的，只能靠客户端持久化的 token 找回）
    let known = att.memberId ? room.members.find((x) => x.id === att.memberId) : undefined
    if (!known && clientToken) {
      const mappedId = tokens.get(clientToken)
      if (mappedId) known = room.members.find((x) => x.id === mappedId)
    }

    if (known) {
      known.online = true
      known.lastSeenAt = now
      // 重连的人若正是原房主，且期间已转给别人，则不夺回；
      // 但若房主位当前空悬（原房主就是他自己且无人接管），保持不变即可。
      ws.serializeAttachment({ memberId: known.id, token: clientToken } satisfies Attachment)
      if (clientToken) {
        tokens.set(clientToken, known.id)
        await this.commitTokens()
      }
      room.revision++
      await this.commit()
      this.sendWelcome(ws, room, known.id)
      this.broadcastState()
      return
    }

    const payload = (msg.payload ?? {}) as { nickname?: string; avatarSeed?: string }
    const existing = undefined as Member | undefined
    if (!existing && room.members.length >= MAX_MEMBERS) {
      this.safeSend(ws, {
        t: 'error',
        roomCode: room.code,
        revision: room.revision,
        payload: { code: 'ROOM_FULL', message: '房间已满' },
      })
      ws.close(1008, 'room full')
      return
    }

    const member: Member = existing ?? {
      id: crypto.randomUUID(),
      nickname: (payload.nickname ?? '玩家').slice(0, 12),
      avatarSeed: (payload.avatarSeed ?? '888888').slice(0, 32),
      isHost: false,
      online: true,
      score: 0,
      joinedAt: now,
      lastSeenAt: now,
    }
    if (!existing) {
      member.online = true
      member.lastSeenAt = now
      // 房间里的第一个人成为房主
      if (room.members.length === 0) {
        member.isHost = true
        room.hostId = member.id
      }
      room.members.push(member)
    }

    room.revision++
    const token = clientToken || randomToken()
    ws.serializeAttachment({ memberId: member.id, token } satisfies Attachment)
    // 记下 token→成员 的对应关系，这是下次掉线重连能找回同一身份的唯一依据
    tokens.set(token, member.id)
    await this.commitTokens()
    await this.commit()
    this.sendWelcome(ws, room, member.id)
    this.broadcastState()
  }

  private async handleStartGame(
    room: Room,
    msg: ClientMsg,
    memberId: string,
    now: number,
  ): Promise<void> {
    if (memberId !== room.hostId) return
    const payload = (msg.payload ?? {}) as { gameId?: string; options?: Record<string, unknown> }
    const gameId = payload.gameId
    if (!gameId) return

    const ctx = this.gameCtx(room)
    const state = createGameState(gameId, ctx, payload.options ?? {})
    if (!state) {
      this.broadcast({
        t: 'error',
        roomCode: room.code,
        revision: room.revision,
        payload: { code: 'GAME_NOT_FOUND', message: '游戏不存在' },
      })
      return
    }
    room.gameId = gameId
    room.gameState = state
    room.phase = 'playing'
    room.revision++
    await this.commit()
    await this.armAlarm()
    this.broadcastState()
  }

  private async dropMember(room: Room, memberId: string): Promise<void> {
    const before = room.members.length
    room.members = room.members.filter((m) => m.id !== memberId)
    if (room.members.length === before) return

    // 关闭该成员的所有连接
    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment() as Attachment | null
      if (att?.memberId === memberId) {
        try {
          ws.close(1000, 'removed')
        } catch {
          /* ignore */
        }
      }
    }

    // 房主离场 → 移交给最早加入的在线成员
    if (room.hostId === memberId && room.members.length > 0) {
      const online = room.members.filter((m) => m.online).sort((a, b) => a.joinedAt - b.joinedAt)
      const fallback = room.members.slice().sort((a, b) => a.joinedAt - b.joinedAt)
      const nextHost = online[0] ?? fallback[0]
      nextHost.isHost = true
      room.hostId = nextHost.id
    }

    // 房间空了 → 标记待回收
    if (room.members.length === 0) {
      room.lastActiveAt = now()
      await this.commit()
      await this.ctx.storage.setAlarm(Date.now() + 60_000)
      return
    }

    // 局内有人退出：直接结束当前对局，避免状态残缺
    if (room.gameId && room.gameState) {
      const st = room.gameState as { phase?: string }
      if (st.phase && st.phase !== 'result') {
        room.phase = 'lobby'
        room.gameId = null
        room.gameState = null
      }
    }

    room.revision++
    await this.commit()
    await this.armAlarm()
    this.broadcastState()
  }

  private gameCtx(room: Room): GameContext {
    return {
      memberIds: room.members.map((m) => m.id),
      hostId: room.hostId,
      settings: room.settings,
      now: Date.now(),
    }
  }

  // ---------- 广播 ----------

  private broadcastState(): void {
    const room = this.room
    if (!room) return

    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment() as Attachment | null
      const memberId = att?.memberId ?? ''
      const isPlaying = room.gameId !== null && room.gameState !== null

      const payload: Record<string, unknown> = { ...room }
      // 关键：广播的 gameState 必须先脱敏。
      // 私有信息（卧底词、狼人身份、光谱目标值）只通过下面的 private 消息单播。
      if (isPlaying) {
        payload.gameState = redactState(room.gameId as string, room.gameState as { seed: number })
      }

      this.safeSend(ws, {
        t: 'state',
        roomCode: room.code,
        revision: room.revision,
        payload,
      })

      if (isPlaying && memberId) {
        this.safeSend(ws, {
          t: 'private',
          roomCode: room.code,
          revision: room.revision,
          payload: {
            gameId: room.gameId,
            revision: room.revision,
            data: privateView(room.gameId as string, room.gameState as { seed: number }, memberId, this.gameCtx(room)),
          },
        })
      }
    }
  }

  private sendWelcome(ws: WebSocket, room: Room, memberId: string): void {
    this.safeSend(ws, {
      t: 'welcome',
      roomCode: room.code,
      revision: room.revision,
      payload: { memberId },
    })
    // 重连补发全量状态，同样必须脱敏
    const payload: Record<string, unknown> = { ...room }
    if (room.gameId && room.gameState) {
      payload.gameState = redactState(room.gameId, room.gameState as { seed: number })
    }
    this.safeSend(ws, {
      t: 'state',
      roomCode: room.code,
      revision: room.revision,
      payload,
    })
  }

  private lastDrawBroadcast = 0

  private broadcastExcept(excludeMemberId: string, msg: ServerMsg): void {
    const data = JSON.stringify(msg)
    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment() as Attachment | null
      if (att?.memberId === excludeMemberId) continue
      try {
        ws.send(data)
      } catch {
        /* 连接已断开，忽略 */
      }
    }
  }

  private broadcast(msg: ServerMsg): void {
    const data = JSON.stringify(msg)
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(data)
      } catch {
        /* 连接已断开，忽略 */
      }
    }
  }

  private safeSend(ws: WebSocket, msg: ServerMsg): void {
    try {
      ws.send(JSON.stringify(msg))
    } catch {
      /* ignore */
    }
  }

  // ---------- 定时推进 ----------

  private async armAlarm(): Promise<void> {
    const room = this.room
    if (!room || !room.gameId || !room.gameState) {
      await this.ctx.storage.deleteAlarm()
      return
    }
    const now = Date.now()
    const dl = nextDeadline(room.gameId, room.gameState as { seed: number }, now)
    if (dl === null) {
      await this.ctx.storage.deleteAlarm()
      return
    }
    await this.ctx.storage.setAlarm(Math.min(dl, now + ROOM_TTL_MS))
  }

  async alarm(): Promise<void> {
    const room = await this.ensure()
    if (!room) return
    const now = Date.now()

    // 空房间回收
    if (room.members.length === 0 || now - room.lastActiveAt > ROOM_TTL_MS) {
      await this.ctx.storage.deleteAll()
      this.room = null
      this.loaded = false
      return
    }

    // 清理超时未心跳的成员
    let changed = false
    for (const m of room.members) {
      if (m.online && now - m.lastSeenAt > HEARTBEAT_TIMEOUT_MS) {
        m.online = false
        changed = true
      }
    }

    if (room.gameId && room.gameState) {
      const before = room.gameState
      const next = applyTick(room.gameId, before as { seed: number }, now, this.gameCtx(room))
      if (next !== before) {
        room.gameState = next
        changed = true
      }
    }

    if (changed) {
      room.revision++
      await this.commit()
      this.broadcastState()
    }

    await this.armAlarm()
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function now(): number {
  return Date.now()
}

export { normalizeRoomCode }
