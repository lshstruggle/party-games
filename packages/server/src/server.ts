import http from 'node:http'
import { WebSocketServer, type WebSocket } from 'ws'
import {
  MAX_MEMBERS,
  normalizeRoomCode,
  randomRoomCode,
  type ClientMsg,
  type Room,
} from '@pg/shared'
import { RoomRuntime } from './room.js'

const PORT = Number(process.env.PORT) || 3000
const rooms = new Map<string, RoomRuntime>()

function getRoom(code: string): RoomRuntime | undefined {
  return rooms.get(code)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
  res.setHeader('content-type', 'application/json; charset=utf-8')

  // ---- 创建房间 ----
  if (req.method === 'POST' && url.pathname === '/api/rooms') {
    for (let i = 0; i < 12; i++) {
      const code = randomRoomCode()
      if (!rooms.has(code)) {
        rooms.set(code, new RoomRuntime(code))
        res.writeHead(201)
        res.end(JSON.stringify({ code }))
        return
      }
    }
    res.writeHead(500)
    res.end(JSON.stringify({ error: 'CODE_ALLOC_FAILED' }))
    return
  }

  // ---- 查询房间 ----
  if (req.method === 'GET' && url.pathname.startsWith('/api/rooms/')) {
    const code = normalizeRoomCode(url.pathname.slice('/api/rooms/'.length))
    if (code.length !== 4) {
      res.writeHead(400)
      res.end(JSON.stringify({ exists: false }))
      return
    }
    const rt = getRoom(code)
    if (!rt) {
      res.writeHead(404)
      res.end(JSON.stringify({ exists: false }))
      return
    }
    const r = rt.room
    res.writeHead(200)
    res.end(
      JSON.stringify({
        exists: true,
        code: r.code,
        memberCount: r.members.length,
        phase: r.phase,
        gameId: r.gameId,
        spice: r.settings.spice,
      }),
    )
    return
  }

  // ---- 健康检查 ----
  if (url.pathname === '/api/health') {
    res.writeHead(200)
    res.end(JSON.stringify({ ok: true, ts: Date.now(), rooms: rooms.size }))
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: 'not_found' }))
})

// ---- WebSocket：加入房间 ----
const wss = new WebSocketServer({ noServer: true })

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url ?? '', `http://${req.headers.host}`)
  if (url.pathname !== '/ws') {
    socket.destroy()
    return
  }
  const code = normalizeRoomCode(url.searchParams.get('code') ?? '')
  if (code.length !== 4) {
    socket.destroy()
    return
  }
  const rt = getRoom(code)
  if (!rt) {
    socket.destroy()
    return
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    rt.attach(ws)
  })
})

// ---- 全局心跳超时清理 + 游戏 tick 推进（替代 Cloudflare DO 的 alarm）----
setInterval(() => {
  const now = Date.now()
  for (const [code, rt] of rooms) {
    rt.tick(now)
    if (rt.isStale(now)) {
      for (const [ws] of rt.clients) {
        try {
          ws.close()
        } catch {
          /* ignore */
        }
      }
      rooms.delete(code)
    }
  }
}, 5000)

server.listen(PORT, () => {
  console.log(`[party-games] server listening on :${PORT} (${rooms.size} rooms)`)
})

// 便于测试引用
export { rooms }
export type { Room, ClientMsg }
