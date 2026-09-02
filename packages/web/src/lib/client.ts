import { create } from 'zustand'
import { normalizeRoomCode, randomAvatarSeed, randomNickname, randomToken, type Room, type ServerMsg } from '@pg/shared'

// ---------- 本地身份 ----------

const LS_TOKEN = 'pg.token'
const LS_NICK = 'pg.nickname'
const LS_SEED = 'pg.avatarSeed'

export interface Identity {
  token: string
  nickname: string
  avatarSeed: string
}

export function loadIdentity(): Identity {
  let token = localStorage.getItem(LS_TOKEN)
  if (!token) {
    token = randomToken()
    localStorage.setItem(LS_TOKEN, token)
  }
  let nickname = localStorage.getItem(LS_NICK)
  if (!nickname) {
    nickname = randomNickname()
    localStorage.setItem(LS_NICK, nickname)
  }
  let avatarSeed = localStorage.getItem(LS_SEED)
  if (!avatarSeed) {
    avatarSeed = randomAvatarSeed()
    localStorage.setItem(LS_SEED, avatarSeed)
  }
  return { token, nickname, avatarSeed }
}

export function saveProfile(nickname: string, avatarSeed: string) {
  localStorage.setItem(LS_NICK, nickname)
  localStorage.setItem(LS_SEED, avatarSeed)
}

// ---------- REST ----------

export async function createRoom(): Promise<string> {
  const res = await fetch('/api/rooms', { method: 'POST' })
  if (!res.ok) throw new Error('创建房间失败')
  const data = (await res.json()) as { code: string }
  return data.code
}

export async function checkRoom(code: string): Promise<{ exists: boolean; memberCount?: number; gameId?: string }> {
  const res = await fetch(`/api/rooms/${normalizeRoomCode(code)}`)
  if (!res.ok) return { exists: false }
  return (await res.json()) as { exists: boolean; memberCount?: number; gameId?: string }
}

// ---------- 连接状态 ----------

export type ConnStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed'

interface Store {
  status: ConnStatus
  room: Room | null
  myId: string | null
  priv: Record<string, unknown> | null
  event: { kind: string; at: number; message?: string } | null
  error: string | null

  connect(code: string, identity: Identity): void
  disconnect(): void
  send(msg: { t: string; payload?: unknown }): void
  act(kind: string, extra?: Record<string, unknown>): void
  clearError(): void
}

let socket: WebSocket | null = null
let heartbeat: number | null = null
let retry: number | null = null
let currentCode = ''
let currentIdentity: Identity | null = null
let attempt = 0

function wsUrl(code: string): string {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${location.host}/ws?code=${encodeURIComponent(code)}`
}

export const useRoom = create<Store>((set, get) => ({
  status: 'idle',
  room: null,
  myId: null,
  priv: null,
  event: null,
  error: null,

  connect(code, identity) {
    currentCode = normalizeRoomCode(code)
    currentIdentity = identity
    if (socket) {
      socket.onclose = null
      socket.close()
      socket = null
    }
    attempt = 0
    open()

    function open() {
      set({ status: attempt === 0 ? 'connecting' : 'reconnecting' })
      let ws: WebSocket
      try {
        ws = new WebSocket(wsUrl(currentCode))
      } catch {
        scheduleRetry()
        return
      }
      socket = ws

      ws.onopen = () => {
        attempt = 0
        set({ status: 'open', error: null })
        ws.send(
          JSON.stringify({
            t: 'join',
            roomCode: currentCode,
            clientToken: identity.token,
            payload: { nickname: identity.nickname, avatarSeed: identity.avatarSeed },
          }),
        )
        heartbeat = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ t: 'heartbeat', roomCode: currentCode, clientToken: identity.token }))
          }
        }, 10_000)
      }

      ws.onmessage = (ev) => {
        let msg: ServerMsg
        try {
          msg = JSON.parse(ev.data as string) as ServerMsg
        } catch {
          return
        }
        handle(set, msg)
      }

      ws.onclose = () => {
        if (heartbeat) {
          clearInterval(heartbeat)
          heartbeat = null
        }
        if (socket === ws) {
          socket = null
          set({ status: 'closed' })
          scheduleRetry()
        }
      }

      ws.onerror = () => {
        /* onclose 会随后触发，统一在那里处理重连 */
      }
    }

    function scheduleRetry() {
      if (retry) return
      attempt += 1
      const delay = Math.min(1000 * 2 ** Math.min(attempt, 4), 10_000)
      retry = window.setTimeout(() => {
        retry = null
        if (currentIdentity) open()
      }, delay)
    }
  },

  disconnect() {
    if (heartbeat) clearInterval(heartbeat)
    if (retry) clearTimeout(retry)
    heartbeat = null
    retry = null
    if (socket) {
      socket.onclose = null
      socket.close()
      socket = null
    }
    set({ status: 'idle', room: null, myId: null, priv: null })
  },

  send(msg) {
    if (!socket || socket.readyState !== WebSocket.OPEN || !currentIdentity) return
    socket.send(
      JSON.stringify({
        ...msg,
        roomCode: currentCode,
        clientToken: currentIdentity.token,
      }),
    )
  },

  act(kind, extra) {
    get().send({ t: 'action', payload: { kind, ...extra } })
  },

  clearError() {
    set({ error: null })
  },
}))

function handle(set: (partial: Partial<Store>) => void, msg: ServerMsg) {
  switch (msg.t) {
    case 'welcome': {
      const payload = msg.payload as { memberId?: string } | undefined
      set({ myId: payload?.memberId ?? null })
      break
    }
    case 'state': {
      set({ room: (msg.payload as Room) ?? null })
      break
    }
    case 'private': {
      const payload = msg.payload as { data?: Record<string, unknown> } | undefined
      set({ priv: (payload?.data as Record<string, unknown>) ?? null })
      break
    }
    case 'event': {
      const payload = msg.payload as { kind?: string; message?: string } | undefined
      if (payload?.kind) set({ event: { kind: payload.kind, message: payload.message, at: Date.now() } })
      break
    }
    case 'error': {
      const payload = msg.payload as { message?: string } | undefined
      set({ error: payload?.message ?? '出错了' })
      break
    }
    case 'kicked': {
      set({ error: '你被房主移出了房间' })
      if (socket) {
        socket.onclose = null
        socket.close()
        socket = null
      }
      break
    }
    default:
      break
  }
}

/** 页面重新可见时补一次心跳，帮助服务端更快识别掉线恢复 */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && socket?.readyState === WebSocket.OPEN && currentIdentity) {
      socket.send(JSON.stringify({ t: 'heartbeat', roomCode: currentCode, clientToken: currentIdentity.token }))
      socket.send(JSON.stringify({ t: 'resync', roomCode: currentCode, clientToken: currentIdentity.token }))
    }
  })
}
