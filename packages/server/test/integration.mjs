// 模拟生产 nginx：静态托管前端 + 反代 /api 与 /ws 到 Node 服务
// 用于本地完整链路验证（等价于服务器上 nginx 的角色）
import http from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { WebSocketServer, WebSocket } from 'ws'

const ROOT = normalize(join(process.cwd(), '..', 'web', 'dist'))
const UP_HOST = '127.0.0.1'
const UP_PORT = 3000
const PORT = Number(process.env.INT_PORT) || 8080

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  // 反代 REST API
  if (url.pathname.startsWith('/api/')) {
    const r = http.request(
      { host: UP_HOST, port: UP_PORT, path: req.url, method: req.method, headers: req.headers },
      (up) => {
        res.writeHead(up.statusCode ?? 502, up.headers)
        up.pipe(res)
      },
    )
    r.on('error', () => res.writeHead(502).end('bad gateway'))
    req.pipe(r)
    return
  }
  // 静态托管前端（SPA fallback）
  let p = decodeURIComponent(url.pathname)
  if (p.endsWith('/')) p += 'index.html'
  const filePath = normalize(join(ROOT, p))
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403)
    res.end()
    return
  }
  try {
    const s = await stat(filePath)
    const target = s.isDirectory() ? join(filePath, 'index.html') : filePath
    const rs = createReadStream(target)
    res.writeHead(200, { 'content-type': MIME[extname(target)] || 'application/octet-stream' })
    rs.pipe(res)
  } catch {
    const rs = createReadStream(join(ROOT, 'index.html'))
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    rs.pipe(res)
  }
})

// 反代 WebSocket
const wssProxy = new WebSocketServer({ noServer: true })
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://x')
  if (url.pathname !== '/ws') {
    socket.destroy()
    return
  }
  wssProxy.handleUpgrade(req, socket, head, (clientWs) => {
    const upstream = new WebSocket(`ws://${UP_HOST}:${UP_PORT}${req.url}`)
    // 缓冲区：客户端首条消息(join)可能在 upstream 连上前到达，先排队
    const queue = []
    let upOpen = false
    const flush = () => {
      while (queue.length) {
        try {
          upstream.send(queue.shift())
        } catch {}
      }
    }
    upstream.on('open', () => {
      upOpen = true
      flush()
    })
    upstream.on('message', (d) => {
      try {
        clientWs.send(d)
      } catch {}
    })
    clientWs.on('message', (d) => {
      if (upOpen) {
        try {
          upstream.send(d)
        } catch {}
      } else {
        queue.push(d)
      }
    })
    clientWs.on('close', () => upstream.close())
    upstream.on('close', () => clientWs.close())
    clientWs.on('error', () => upstream.close())
    upstream.on('error', () => clientWs.close())
  })
})

server.listen(PORT, () => console.log(`[integration-proxy] :${PORT} (static=${ROOT}, upstream=:${UP_PORT})`))
