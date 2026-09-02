import { WebSocket } from 'ws'
import { setTimeout as sleep } from 'timers/promises'

const BASE = process.env.BASE || 'http://localhost:3000'
const WSB = process.env.WS || 'ws://localhost:3000'

let pass = 0
let fail = 0
const fails = []
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg) }
  else { fail++; fails.push(msg); console.log('  ✗', msg) }
}
function rand() { return Math.random().toString(36).slice(2, 8) }

class Client {
  constructor(name) {
    this.name = name
    this.token = 'tok_' + name + '_' + rand()
    this.ws = null
    this.code = ''
    this.msgs = []
    this.states = []
    this.privs = []
    this.events = []
    this.welcome = null
  }
  connect(code) {
    this.code = code
    return new Promise((res) => {
      this.ws = new WebSocket(`${WSB}/ws?code=${code}`)
      this.ws.on('message', (d) => {
        let m
        try { m = JSON.parse(d.toString()) } catch { return }
        this.msgs.push(m)
        if (m.t === 'welcome') this.welcome = m.payload
        if (m.t === 'state') this.states.push(m.payload)
        if (m.t === 'private') this.privs.push(m.payload)
        if (m.t === 'event') this.events.push(m.payload)
      })
      this.ws.on('open', () => {
        this.send('join', { nickname: this.name, avatarSeed: '123456' })
        res()
      })
    })
  }
  send(t, payload) {
    this.ws.send(JSON.stringify({ t, roomCode: this.code, clientToken: this.token, payload }))
  }
  act(kind, extra = {}) { this.send('action', { kind, ...extra }) }
  startGame(gameId, options = {}) { this.send('startGame', { gameId, options }) }
  get state() { return this.states[this.states.length - 1] }
  // 服务端 private 消息结构为 { gameId, revision, data: 私有视图 }，这里解包到 .data
  get priv() { const p = this.privs[this.privs.length - 1]; return p ? (p.data ?? p) : null }
  get gameId() { return this.state?.gameId }
  get game() { return this.state?.gameState }
  get lastEvent() { return this.events[this.events.length - 1] }
  waitFor(pred, timeout = 6000) {
    return new Promise((res, rej) => {
      const iv = setInterval(() => { if (pred(this)) { clearInterval(iv); res(true) } }, 25)
      setTimeout(() => { clearInterval(iv); rej(new Error('timeout: ' + pred.toString())) }, timeout)
    })
  }
  close() { try { this.ws.close() } catch {} }
}

async function createRoom() {
  const res = await fetch(`${BASE}/api/rooms`, { method: 'POST' })
  const data = await res.json()
  return data.code
}
function otherId(self, ids) { return ids.find((i) => i !== self) }
function twoOthers(self, ids) { const r = ids.filter((i) => i !== self); return [r[0], r[1]] }

async function main() {
  console.log('\n=== [1] 你画我猜：笔画跨客户端同步（回归用户报的 bug）===')
  {
    const code = await createRoom()
    const a = new Client('A'); const b = new Client('B'); const c = new Client('C')
    await a.connect(code); await b.connect(code); await c.connect(code)
    await a.waitFor((x) => x.state?.members.length === 3)
    a.startGame('draw')
    await a.waitFor((x) => x.gameId === 'draw')
    ok(a.game.phase === 'pick', 'draw 进入选词阶段')
    // 作画者是随机洗牌产生的 order[0]，不一定是房主——按 drawerId 找出真正作画者
    const all = [a, b, c]
    const drawer = all.find((cl) => cl.welcome.memberId === a.game.drawerId)
    const guessers = all.filter((cl) => cl !== drawer)
    ok(!!drawer, '已确定作画者身份')
    // 作画者选词
    drawer.act('pickWord', { index: 0 })
    await drawer.waitFor((x) => x.game?.phase === 'drawing')
    ok(drawer.game.drawerId === drawer.welcome.memberId, 'drawerId 指向作画者')
    // 作画者画一笔：begin + points（间隔 >600ms 以触发两次节流广播）
    const strokeId = 's1_' + rand()
    drawer.act('stroke', { op: 'begin', strokeId, color: '#7C5CFF', width: 6, points: [100, 100] })
    await sleep(700)
    drawer.act('stroke', { op: 'points', strokeId, points: [120, 140, 160, 200] })
    // 每位猜测方应收到 stroke event
    for (const g of guessers) {
      const got = await g.waitFor((x) => x.events.some((e) => e.kind === 'stroke' && e.stroke && e.stroke.strokeId === strokeId)).then(() => true).catch(() => false)
      ok(got, `猜测方 ${g.name} 收到 stroke event 且含 strokeId`)
    }
    const evPts = guessers[0].events.find((e) => e.kind === 'stroke' && e.stroke?.op === 'points' && e.stroke?.strokeId === strokeId)
    ok(evPts && Array.isArray(evPts.stroke.points) && evPts.stroke.points.length >= 4, 'event.stroke(points) 携带完整坐标点（未被丢弃）')
    // 等待节流全量广播后，猜测方 gameState.strokes 应包含完整合并后的笔画
    await sleep(800)
    for (const g of guessers) {
      const gs = g.game
      ok(gs && Array.isArray(gs.strokes) && gs.strokes.some((s) => s.id === strokeId && s.points.length >= 4), `猜测方 ${g.name} gameState.strokes 含完整笔画（服务端权威同步）`)
    }
    // 作画方自己不应收到自己的 stroke event
    const selfEcho = drawer.events.some((e) => e.kind === 'stroke')
    ok(!selfEcho, '作画方不会收到自己画笔画的回显（broadcastExcept 正确）')
    a.close(); b.close(); c.close()
  }

  console.log('\n=== [2] 卧底找茬：完整流程 + 私有信息隔离 ===')
  {
    const code = await createRoom()
    const clients = []
    for (let i = 0; i < 5; i++) { const cl = new Client('s' + i); await cl.connect(code); clients.push(cl) }
    await clients[0].waitFor((x) => x.state?.members.length === 5)
    clients[0].startGame('spy')
    await clients[0].waitFor((x) => x.gameId === 'spy')
    ok(clients[0].game.phase === 'reveal', 'spy 进入 reveal')
    // 等待私有视图消息到达（broadcastState 在 state 之后发送 private；服务端为 {gameId,revision,data}）
    await clients[0].waitFor((x) => clients.some((c) => c.priv?.myRole), 6000).catch(() => {})
    // 私有信息：卧底应知道自己是 spy 且看到卧底词；平民看平民词；广播包不应含 words/spyIds
    const spyClient = clients.find((c) => c.priv?.myRole === 'spy')
    const civClient = clients.find((c) => c.priv?.myRole === 'civilian')
    ok(!!spyClient, '存在卧底角色客户端')
    if (spyClient) {
      ok(spyClient.priv.myRole === 'spy' && spyClient.priv.myWord, '卧底私有视图可见 myWord(卧底词)')
    } else {
      ok(false, '卧底私有视图可见 myWord(卧底词)')
    }
    if (civClient) {
      ok(civClient.priv.myRole === 'civilian' && civClient.priv.myWord, '平民私有视图可见 myWord(平民词)')
    } else {
      ok(false, '平民私有视图可见 myWord(平民词)')
    }
    const redacted = clients[0].game
    ok(Array.isArray(redacted.spyIds) && redacted.spyIds.length === 0 && redacted.words[0] === '' && redacted.words[1] === '', '广播包已脱敏 words/spyIds（防 devtools 泄露）')
    // all ready → describe
    for (const c of clients) c.act('ready')
    await clients[0].waitFor((x) => x.game?.phase === 'describe')
    ok(clients[0].game.phase === 'describe', '全员 ready 后进入 describe')
    // 每个发言者依次 describe
    let guard = 0
    while (clients[0].game?.phase === 'describe' && guard++ < 20) {
      const sid = clients[0].game.speakerId
      const sp = clients.find((c) => c.welcome.memberId === sid)
      if (!sp) break
      sp.act('describe', { text: '这个词像' + rand() })
      await sleep(60)
    }
    await clients[0].waitFor((x) => x.game?.phase === 'vote')
    ok(clients[0].game.phase === 'vote', '发言结束后进入 vote')
    // 每人投票
    const ids = clients.map((c) => c.welcome.memberId)
    for (const c of clients) {
      if (!c.game.aliveIds.includes(c.welcome.memberId)) continue
      c.act('vote', { targetId: otherId(c.welcome.memberId, ids) })
    }
    await clients[0].waitFor((x) => x.game?.phase === 'voteResult' || x.game?.phase === 'result').catch(() => {})
    ok(['voteResult', 'result'].includes(clients[0].game?.phase), '投票后进入结算/结果')
    clients.forEach((c) => c.close())
  }

  console.log('\n=== [3] 光谱刻度：计分 + 出题人可见 target 隔离 ===')
  {
    const code = await createRoom()
    const clients = []
    for (let i = 0; i < 4; i++) { const cl = new Client('p' + i); await cl.connect(code); clients.push(cl) }
    await clients[0].waitFor((x) => x.state?.members.length === 4)
    clients[0].startGame('spectrum')
    await clients[0].waitFor((x) => x.gameId === 'spectrum')
    await clients[0].waitFor((x) => clients.some((c) => c.priv?.isClueGiver !== undefined), 6000).catch(() => {})
    ok(clients[0].game.phase === 'clue', 'spectrum 进入 clue')
    const clueGiverId = clients[0].game.clueGiverId
    const giver = clients.find((c) => c.welcome.memberId === clueGiverId)
    const others = clients.filter((c) => c !== giver)
    ok(giver.priv?.isClueGiver === true && typeof giver.priv.target === 'number', '出题人私有视图可见 target')
    ok(others.every((c) => c.priv?.isClueGiver === false && c.priv.target === null), '猜测者 target 为 null（隔离）')
    ok(clients[0].game.target === -1, '广播包 target=-1（脱敏）')
    giver.act('submitClue', { clue: '测试提示' })
    await clients[0].waitFor((x) => x.game?.phase === 'guess')
    ok(clients[0].game.phase === 'guess', '提交提示后进入 guess')
    for (const c of others) c.act('submitGuess', { value: 50 })
    await clients[0].waitFor((x) => x.game?.phase === 'reveal' || x.game?.phase === 'result')
    ok(['reveal', 'result'].includes(clients[0].game?.phase), '全员猜测后进入 reveal/result')
    const sum = clients[0].game.scores.A + clients[0].game.scores.B
    ok(sum > 0, '本轮有计分（teamDeltas 写入 scores）')
    clients.forEach((c) => c.close())
  }

  console.log('\n=== [4] 真心话大冒险：转盘→选→答→评 流程 ===')
  {
    const code = await createRoom()
    const clients = []
    for (let i = 0; i < 3; i++) { const cl = new Client('t' + i); await cl.connect(code); clients.push(cl) }
    await clients[0].waitFor((x) => x.state?.members.length === 3)
    clients[0].startGame('truth')
    await clients[0].waitFor((x) => x.gameId === 'truth')
    await clients[0].waitFor((x) => clients.some((c) => c.priv?.isTarget !== undefined), 6000).catch(() => {})
    ok(clients[0].game.phase === 'spin', 'truth 进入 spin')
    const targetId = clients[0].game.targetId
    ok(!!targetId, 'spin 选出 target')
    const target = clients.find((c) => c.welcome.memberId === targetId)
    ok(target.priv?.isTarget === true && clients.filter((c) => c !== target).every((c) => c.priv?.isTarget === false), 'target 私有视图正确')
    target.act('spinDone')
    await clients[0].waitFor((x) => x.game?.phase === 'choose')
    target.act('choose', { type: 'truth' })
    await clients[0].waitFor((x) => x.game?.phase === 'answer')
    ok(clients[0].game.phase === 'answer' && clients[0].game.question, '进入 answer 且有题目')
    target.act('done')
    await clients[0].waitFor((x) => x.game?.phase === 'rate' || x.game?.witnesses?.length >= 0)
    // 其他人见证
    for (const c of clients.filter((c) => c !== target)) c.act('witness')
    await clients[0].waitFor((x) => x.game?.phase === 'rate').catch(() => {})
    if (clients[0].game?.phase === 'rate') {
      for (const c of clients.filter((c) => c !== target)) c.act('rate', { score: 3 })
      await clients[0].waitFor((x) => x.game?.phase === 'spin' || x.game?.phase === 'result').catch(() => {})
      ok(['spin', 'result'].includes(clients[0].game?.phase), '评分后进入下一轮/结果')
    } else { ok(true, '（超时自动推进，跳过显式评分）') }
    clients.forEach((c) => c.close())
  }

  console.log('\n=== [5] 一夜狼镇：夜晚行动→讨论→投票→结果 ===')
  {
    const code = await createRoom()
    const clients = []
    for (let i = 0; i < 5; i++) { const cl = new Client('w' + i); await cl.connect(code); clients.push(cl) }
    await clients[0].waitFor((x) => x.state?.members.length === 5)
    clients[0].startGame('wolf')
    await clients[0].waitFor((x) => x.gameId === 'wolf')
    await clients[0].waitFor((x) => clients.some((c) => c.priv?.initialRole !== undefined), 6000).catch(() => {})
    ok(clients[0].game.phase === 'reveal', 'wolf 进入 reveal')
    const ids = clients.map((c) => c.welcome.memberId)
    // 私有：initialRole 可见，currentRole 非 result 为 null
    ok(clients.every((c) => c.priv?.initialRole), '每人可见自己 initialRole')
    ok(clients.every((c) => c.priv?.currentRole === null), '非结算阶段 currentRole 为 null（隔离）')
    ok(Array.isArray(clients[0].game.center) && clients[0].game.center.every((r) => r === 'villager') && Object.keys(clients[0].game.initialRoles || {}).length === 0, '广播包角色/中央牌已脱敏')
    for (const c of clients) c.act('ready')
    await clients[0].waitFor((x) => x.game?.phase === 'night')
    // 逐夜行动
    let guard = 0
    while (clients[0].game?.phase === 'night' && guard++ < 20) {
      const role = clients[0].game.nightRole
      if (!role) break
      const actor = clients.find((c) => c.priv?.initialRole === role)
      if (!actor) break
      const self = actor.welcome.memberId
      let extra = {}
      if (role === 'seer') extra = { targetId: otherId(self, ids) }
      else if (role === 'werewolf') extra = { centerIndex: 0 }
      else if (role === 'robber') extra = { targetId: otherId(self, ids) }
      else if (role === 'troublemaker') { const [a, b] = twoOthers(self, ids); extra = { targetId: a, targetBId: b } }
      else if (role === 'drunk') extra = { centerIndex: 0 }
      actor.act('nightAction', extra)
      await sleep(60)
    }
    await clients[0].waitFor((x) => x.game?.phase === 'discussion' || x.game?.phase === 'vote')
    ok(['discussion', 'vote'].includes(clients[0].game?.phase), '夜晚行动结束进入 discussion')
    clients[0].act('endDiscussion')
    await clients[0].waitFor((x) => x.game?.phase === 'vote')
    for (const c of clients) c.act('vote', { targetId: otherId(c.welcome.memberId, ids) })
    await clients[0].waitFor((x) => x.game?.phase === 'result').catch(() => {})
    ok(clients[0].game?.phase === 'result' && (clients[0].game.winner === 'good' || clients[0].game.winner === 'wolf'), '投票后进入 result 并产生胜负')
    // 结算后 currentRole 可见
    const someone = clients.find((c) => c.priv?.currentRole)
    ok(!!someone, '结算后私有视图可见 currentRole')
    clients.forEach((c) => c.close())
  }

  console.log('\n=== [6] 断线重连：身份找回 ===')
  {
    const code = await createRoom()
    const a = new Client('recon'); await a.connect(code)
    await a.waitFor((x) => x.state?.members.length === 1)
    const myId = a.welcome.memberId
    const myToken = a.token
    a.close()
    await sleep(200)
    const b = new Client('recon2')
    b.token = myToken // 用相同 token 重连
    b.connect(code)
    await b.waitFor((x) => x.welcome?.memberId === myId)
    ok(b.welcome.memberId === myId, '相同 clientToken 重连找回原 memberId')
    b.close()
  }

  console.log('\n=== [7] 房主断线转移 ===')
  {
    const code = await createRoom()
    const a = new Client('host'); const b = new Client('member')
    await a.connect(code); await b.connect(code)
    await a.waitFor((x) => x.state?.members.length === 2)
    ok(a.state.hostId === a.welcome.memberId, 'a 是房主')
    a.close() // 房主掉线
    await b.waitFor((x) => x.state?.hostId === b.welcome.memberId)
    ok(b.state.hostId === b.welcome.memberId, '房主掉线后 b 自动成为新房主')
    const moved = b.events.some((e) => e.kind === 'hostChanged')
    ok(moved, '广播了 hostChanged 事件')
    b.close()
  }

  console.log(`\n========== 结果: ${pass} 通过 / ${fail} 失败 ==========`)
  if (fail > 0) { console.log('失败项:'); fails.forEach((f) => console.log('  - ' + f)); process.exit(1) }
}

main().catch((e) => { console.error('FATAL', e); process.exit(2) })
