import { normalizeRoomCode, randomRoomCode, type Room } from '@pg/shared'
import type { Env } from './room.js'

export { RoomDO } from './room.js'

/** 前端静态资源绑定（wrangler.toml 中 [assets] 自动生成） */
interface WorkerEnv extends Env {
  ASSETS?: { fetch: (request: Request) => Promise<Response> }
}

export default {
  async fetch(request: Request, env: WorkerEnv, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // ---- REST：创建房间 / 查询房间 ----
    if (url.pathname === '/api/rooms' && request.method === 'POST') {
      return createRoom(env)
    }

    if (url.pathname.startsWith('/api/rooms/') && request.method === 'GET') {
      const code = normalizeRoomCode(url.pathname.slice('/api/rooms/'.length))
      if (code.length !== 4) return json({ exists: false }, 400)
      const stub = stubFor(env, code)
      return stub.fetch('https://room/info', { method: 'GET' })
    }

    if (url.pathname === '/api/health') {
      return json({ ok: true, ts: Date.now() })
    }

    // ---- WebSocket：加入房间 ----
    if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      const code = normalizeRoomCode(url.searchParams.get('code') ?? '')
      if (code.length !== 4) {
        return json({ error: 'INVALID_CODE' }, 400)
      }
      const exists = await roomExists(env, code)
      if (!exists) {
        return json({ error: 'ROOM_NOT_FOUND' }, 404)
      }
      const stub = stubFor(env, code)
      return stub.fetch('https://room/ws', request)
    }

    // ---- 静态资源（前端） ----
    if (env.ASSETS) {
      return env.ASSETS.fetch(request)
    }
    return json({ error: 'not_found' }, 404)
  },
} satisfies ExportedHandler<WorkerEnv>

function stubFor(env: Env, code: string) {
  return env.ROOMS.get(env.ROOMS.idFromName(code))
}

async function roomExists(env: Env, code: string): Promise<boolean> {
  const res = await stubFor(env, code).fetch('https://room/info', { method: 'GET' })
  if (!res.ok) return false
  const data = (await res.json()) as { exists?: boolean }
  return data.exists === true
}

async function createRoom(env: Env): Promise<Response> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = randomRoomCode()
    const stub = stubFor(env, code)
    const res = await stub.fetch('https://room/info', { method: 'GET' })
    const data = (await res.json()) as { exists?: boolean }
    if (data.exists) continue

    await stub.fetch('https://room/init', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
    return json({ code }, 201)
  }
  return json({ error: 'CODE_ALLOC_FAILED' }, 500)
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export type { Room }
