import { WebSocket } from 'ws'

const BASE = process.env.BASE || 'http://localhost:3000'
const WS = process.env.WS || 'ws://localhost:3000/ws'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function createRoom() {
  const res = await fetch(`${BASE}/api/rooms`, { method: 'POST' })
  const data = await res.json()
  return data.code
}

function mkClient(code, token) {
  return new Promise((resolve) => {
    const ws = new WebSocket(`${WS}?code=${code}`)
    const c = { ws, token, memberId: null, room: null, priv: null, events: [], closed: false }
    ws.on('open', () => {
      ws.send(
        JSON.stringify({
          t: 'join',
          roomCode: code,
          clientToken: token,
          payload: { nickname: 'P' + Math.random().toString(36).slice(2, 6), avatarSeed: '123456' },
        }),
      )
    })
    ws.on('message', (data) => {
      const m = JSON.parse(data.toString())
      if (m.t === 'welcome') c.memberId = m.payload.memberId
      else if (m.t === 'state') c.room = m.payload
      else if (m.t === 'private') c.priv = m.payload?.data
      else if (m.t === 'event') c.events.push(m.payload)
    })
    ws.on('close', () => (c.closed = true))
    setTimeout(() => resolve(c), 300)
  })
}

let pass = 0
let fail = 0
function check(name, cond) {
  if (cond) {
    pass++
    console.log('  ✓', name)
  } else {
    fail++
    console.log('  ✗', name)
  }
}

async function main() {
  console.log('E2E: 创建房间')
  const code = await createRoom()
  check('房间码为 4 位', /^[A-Z0-9]{4}$/.test(code))

  console.log('E2E: 两个客户端加入')
  const a = await mkClient(code, 'tok-aaa')
  const b = await mkClient(code, 'tok-bbb')
  await sleep(200)
  check('A 获得 memberId', !!a.memberId)
  check('B 获得 memberId', !!b.memberId)
  check('A 是房主(首个加入者)', a.room?.members?.find((m) => m.id === a.memberId)?.isHost === true)
  check('房间有 2 名成员', a.room?.members?.length === 2)

  console.log('E2E: 房主开始「卧底找茬」')
  a.ws.send(
    JSON.stringify({ t: 'startGame', roomCode: code, clientToken: 'tok-aaa', payload: { gameId: 'spy', options: {} } }),
  )
  await sleep(200)
  check('gameId 已设为 spy', a.room?.gameId === 'spy')
  check('gameState 存在', !!a.room?.gameState)
  check('广播态已脱敏(不含私有词)', !JSON.stringify(a.room?.gameState).includes('Word'))
  check('A 收到私有视图', !!a.priv)
  check('B 收到私有视图', !!b.priv)
  check('A 与 B 私有数据不同(角色隔离)', JSON.stringify(a.priv) !== JSON.stringify(b.priv))

  console.log('E2E: 房主断开 → 房主转移')
  a.ws.close()
  await sleep(500)
  check('A 离开后 B 成为房主', b.room?.members?.find((m) => m.id === b.memberId)?.isHost === true)
  check('hostId 已转移给 B', b.room?.hostId === b.memberId)
  check('A 离线状态已广播', b.room?.members?.find((m) => m.id === a.memberId)?.online === false)

  console.log('E2E: B 用相同 token 重连 → 身份找回')
  const b2 = await mkClient(code, 'tok-bbb')
  await sleep(200)
  check('重连恢复同一 memberId', b2.memberId === b.memberId)
  check('重连后房间仍在玩 spy', b2.room?.gameId === 'spy')

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
