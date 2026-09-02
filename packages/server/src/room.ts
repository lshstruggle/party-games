import {
  MAX_MEMBERS,
  ROOM_TTL_MS,
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
import type { WebSocket } from 'ws'

interface Attachment {
  memberId: string
  token: string
}

const HEARTBEAT_TIMEOUT_MS = 30_000

/**
 * 单房间运行时（内存态，替代 Cloudflare Durable Object）。
 * 聚会场景重启丢房间可接受，但业务逻辑与前端协议 100% 兼容 room.ts。
 */
export class RoomRuntime {
  room: Room
  /** ws 连接 → 身份附件（替代 DO 的 serializeAttachment）*/
  clients = new Map<WebSocket, Attachment>()
  /** clientToken → memberId 的稳定身份映射（独立存储，绝不出现在广播里）*/
  private tokens = new Map<string, string>()
  private lastDrawBroadcast = 0

  constructor(code: string) {
    const now = Date.now()
    this.room = {
      code,
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
  }

  // ---------- 连接生命周期 ----------

  attach(ws: WebSocket): void {
    ws.on('message', (data) => this.onMessage(ws, data))
    ws.on('close', () => this.onClose(ws))
    ws.on('error', () => this.onClose(ws))
  }

  private onMessage(ws: WebSocket, data: WebSocket.RawData): void {
    let msg: ClientMsg
    try {
      msg = JSON.parse(data.toString()) as ClientMsg
    } catch {
      return
    }
    if (!msg || typeof msg.t !== 'string') return
    const att = this.clients.get(ws) ?? { memberId: '', token: '' }
    const now = Date.now()

    switch (msg.t) {
      case 'join':
      case 'rejoin':
        this.handleJoin(ws, msg, att, now)
        break
      case 'heartbeat': {
        if (!att.memberId) return
        const m = this.room.members.find((x) => x.id === att.memberId)
        if (m) {
          m.lastSeenAt = now
          if (!m.online) {
            m.online = true
            this.room.revision++
            this.broadcastState()
          }
        }
        this.safeSend(ws, {
          t: 'event',
          roomCode: this.room.code,
          revision: this.room.revision,
          payload: { kind: 'pong' },
        })
        break
      }
      case 'resync':
        this.sendWelcome(ws, att.memberId)
        break
      case 'action': {
        if (!att.memberId || !this.room.gameId || !this.room.gameState) return
        const action = (msg.payload ?? {}) as { kind: string; [k: string]: unknown }
        if (!action.kind) return
        const ctx = this.gameCtx()
        // 笔画高频：只转增量，全量节流广播，避免每 50ms 重传整张画
        if (this.room.gameId === 'draw' && action.kind === 'stroke') {
          const applied = applyAction(this.room.gameId, this.room.gameState as { seed: number }, action, {
            playerId: att.memberId,
            now,
            memberIds: ctx.memberIds,
          })
          this.room.gameState = applied
          this.broadcastExcept(att.memberId, {
            t: 'event',
            roomCode: this.room.code,
            revision: this.room.revision,
            payload: { kind: 'stroke', stroke: action },
          })
          if (now - this.lastDrawBroadcast > 600) {
            this.lastDrawBroadcast = now
            this.room.revision++
            this.broadcastState()
          }
          break
        }
        const next = applyAction(this.room.gameId, this.room.gameState as { seed: number }, action, {
          playerId: att.memberId,
          now,
          memberIds: ctx.memberIds,
        })
        if (next !== this.room.gameState) {
          this.room.gameState = next
          this.room.revision++
        }
        this.broadcastState()
        break
      }
      case 'startGame':
        this.handleStartGame(msg, att.memberId, now)
        break
      case 'endGame':
        if (att.memberId !== this.room.hostId) return
        this.room.phase = 'lobby'
        this.room.gameId = null
        this.room.gameState = null
        this.room.revision++
        this.broadcastState()
        break
      case 'updateSettings': {
        if (att.memberId !== this.room.hostId) return
        const patch = (msg.payload ?? {}) as {
          spice?: 'mild' | 'spicy'
          gameOptions?: Record<string, Record<string, unknown>>
        }
        if (patch.spice) this.room.settings.spice = patch.spice
        if (patch.gameOptions)
          this.room.settings.gameOptions = { ...this.room.settings.gameOptions, ...patch.gameOptions }
        this.room.revision++
        this.broadcastState()
        break
      }
      case 'kick': {
        if (att.memberId !== this.room.hostId) return
        const targetId = (msg.payload as { memberId?: string } | undefined)?.memberId
        if (!targetId || targetId === this.room.hostId) return
        this.dropMember(targetId)
        break
      }
      case 'transferHost': {
        if (att.memberId !== this.room.hostId) return
        const targetId = (msg.payload as { memberId?: string } | undefined)?.memberId
        const target = this.room.members.find((m) => m.id === targetId)
        if (!target) return
        const prev = this.room.members.find((m) => m.id === this.room.hostId)
        if (prev) prev.isHost = false
        target.isHost = true
        this.room.hostId = target.id
        this.room.revision++
        this.broadcastState()
        break
      }
      case 'leave':
        if (att.memberId) this.dropMember(att.memberId)
        break
      default:
        break
    }
  }

  private onClose(ws: WebSocket): void {
    const att = this.clients.get(ws)
    this.clients.delete(ws)
    if (!att?.memberId) return
    const m = this.room.members.find((x) => x.id === att.memberId)
    if (m && m.online) {
      m.online = false
      const moved = this.reassignHostIfNeeded()
      this.room.revision++
      this.broadcastState()
      if (moved) {
        const host = this.room.members.find((x) => x.id === this.room.hostId)
        this.broadcast({
          t: 'event',
          roomCode: this.room.code,
          revision: this.room.revision,
          payload: { kind: 'hostChanged', message: `${host?.nickname ?? '新房主'} 成为房主` },
        })
      }
    }
  }

  // ---------- 具体业务 ----------

  private handleJoin(ws: WebSocket, msg: ClientMsg, att: Attachment, now: number): void {
    const clientToken = typeof (msg as { clientToken?: string }).clientToken === 'string'
      ? (msg as { clientToken?: string }).clientToken!.slice(0, 80)
      : ''

    // 身份找回：1) 同连接重复 join 2) 换连接带同一 clientToken 的断线重连
    let known = att.memberId ? this.room.members.find((x) => x.id === att.memberId) : undefined
    if (!known && clientToken) {
      const mappedId = this.tokens.get(clientToken)
      if (mappedId) known = this.room.members.find((x) => x.id === mappedId)
    }

    if (known) {
      known.online = true
      known.lastSeenAt = now
      this.clients.set(ws, { memberId: known.id, token: clientToken })
      if (clientToken) this.tokens.set(clientToken, known.id)
      this.room.revision++
      this.sendWelcome(ws, known.id)
      this.broadcastState()
      return
    }

    const payload = (msg.payload ?? {}) as { nickname?: string; avatarSeed?: string }
    if (this.room.members.length >= MAX_MEMBERS) {
      this.safeSend(ws, {
        t: 'error',
        roomCode: this.room.code,
        revision: this.room.revision,
        payload: { code: 'ROOM_FULL', message: '房间已满' },
      })
      ws.close(1008, 'room full')
      return
    }

    const member: Member = {
      id: crypto.randomUUID(),
      nickname: (payload.nickname ?? '玩家').slice(0, 12),
      avatarSeed: (payload.avatarSeed ?? '888888').slice(0, 32),
      isHost: false,
      online: true,
      score: 0,
      joinedAt: now,
      lastSeenAt: now,
    }
    if (this.room.members.length === 0) {
      member.isHost = true
      this.room.hostId = member.id
    }
    this.room.members.push(member)

    this.room.revision++
    const token = clientToken || randomToken()
    this.clients.set(ws, { memberId: member.id, token })
    this.tokens.set(token, member.id)
    this.sendWelcome(ws, member.id)
    this.broadcastState()
  }

  private handleStartGame(msg: ClientMsg, memberId: string, _now: number): void {
    if (memberId !== this.room.hostId) return
    const payload = (msg.payload ?? {}) as { gameId?: string; options?: Record<string, unknown> }
    const gameId = payload.gameId
    if (!gameId) return
    const ctx = this.gameCtx()
    const state = createGameState(gameId, ctx, payload.options ?? {})
    if (!state) {
      this.broadcast({
        t: 'error',
        roomCode: this.room.code,
        revision: this.room.revision,
        payload: { code: 'GAME_NOT_FOUND', message: '游戏不存在' },
      })
      return
    }
    this.room.gameId = gameId
    this.room.gameState = state
    this.room.phase = 'playing'
    this.room.revision++
    this.broadcastState()
  }

  private dropMember(memberId: string): void {
    const before = this.room.members.length
    this.room.members = this.room.members.filter((m) => m.id !== memberId)
    if (this.room.members.length === before) return

    for (const [ws, att] of this.clients) {
      if (att.memberId === memberId) {
        try {
          ws.close(1000, 'removed')
        } catch {
          /* ignore */
        }
        this.clients.delete(ws)
      }
    }

    if (this.room.hostId === memberId && this.room.members.length > 0) {
      const online = this.room.members.filter((m) => m.online).sort((a, b) => a.joinedAt - b.joinedAt)
      const fallback = this.room.members.slice().sort((a, b) => a.joinedAt - b.joinedAt)
      const nextHost = online[0] ?? fallback[0]
      nextHost.isHost = true
      this.room.hostId = nextHost.id
    }

    // 房间空了：等待全局 tick 回收
    if (this.room.members.length === 0) {
      return
    }

    // 局内有人退出：结束当前对局，避免状态残缺
    if (this.room.gameId && this.room.gameState) {
      const st = this.room.gameState as { phase?: string }
      if (st.phase && st.phase !== 'result') {
        this.room.phase = 'lobby'
        this.room.gameId = null
        this.room.gameState = null
      }
    }
    this.room.revision++
    this.broadcastState()
  }

  private gameCtx(): GameContext {
    return {
      memberIds: this.room.members.map((m) => m.id),
      hostId: this.room.hostId,
      settings: this.room.settings,
      now: Date.now(),
    }
  }

  // ---------- 房主转移 ----------

  private reassignHostIfNeeded(): boolean {
    const current = this.room.members.find((m) => m.id === this.room.hostId)
    if (current?.online) return false
    const candidates = this.room.members
      .filter((m) => m.online)
      .sort((a, b) => a.joinedAt - b.joinedAt)
    if (candidates.length === 0) return false
    const next = candidates[0]
    if (next.id === this.room.hostId) return false
    for (const m of this.room.members) m.isHost = false
    next.isHost = true
    this.room.hostId = next.id
    return true
  }

  // ---------- 广播 ----------

  private broadcastState(): void {
    const room = this.room
    const isPlaying = room.gameId !== null && room.gameState !== null

    for (const [ws, att] of this.clients) {
      const memberId = att.memberId
      const payload: Record<string, unknown> = { ...room }
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
            data: privateView(
              room.gameId as string,
              room.gameState as { seed: number },
              memberId,
              this.gameCtx(),
            ),
          },
        })
      }
    }
  }

  private sendWelcome(ws: WebSocket, memberId: string): void {
    this.safeSend(ws, {
      t: 'welcome',
      roomCode: this.room.code,
      revision: this.room.revision,
      payload: { memberId },
    })
    const payload: Record<string, unknown> = { ...this.room }
    if (this.room.gameId && this.room.gameState) {
      payload.gameState = redactState(this.room.gameId, this.room.gameState as { seed: number })
    }
    this.safeSend(ws, {
      t: 'state',
      roomCode: this.room.code,
      revision: this.room.revision,
      payload,
    })
  }

  private broadcastExcept(excludeMemberId: string, msg: ServerMsg): void {
    const data = JSON.stringify(msg)
    for (const [ws, att] of this.clients) {
      if (att.memberId === excludeMemberId) continue
      try {
        ws.send(data)
      } catch {
        /* 连接已断开 */
      }
    }
  }

  private broadcast(msg: ServerMsg): void {
    const data = JSON.stringify(msg)
    for (const [ws] of this.clients) {
      try {
        ws.send(data)
      } catch {
        /* 连接已断开 */
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

  // ---------- 定时推进（被 server.ts 全局 interval 调用）----------

  tick(now: number): void {
    let changed = false
    for (const m of this.room.members) {
      if (m.online && now - m.lastSeenAt > HEARTBEAT_TIMEOUT_MS) {
        m.online = false
        changed = true
      }
    }
    if (this.room.gameId && this.room.gameState) {
      const before = this.room.gameState
      const next = applyTick(this.room.gameId, before as { seed: number }, now, this.gameCtx())
      if (next !== before) {
        this.room.gameState = next
        changed = true
      }
    }
    if (changed) {
      this.room.revision++
      this.broadcastState()
    }
  }

  isStale(now: number): boolean {
    return this.room.members.length === 0 || now - this.room.lastActiveAt > ROOM_TTL_MS
  }
}
