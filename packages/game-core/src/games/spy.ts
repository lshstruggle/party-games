import { createRng, type RNG } from '@pg/shared'
import type { SpyElimination, SpyState } from '@pg/shared'
import { WORD_PAIRS } from '../content/wordPairs.js'
import type { ActionContext, GameContext, GameModule } from '../types.js'

const REVEAL_SECONDS = 20
const DESCRIBE_SECONDS = 30
const VOTE_SECONDS = 25
const RESULT_SECONDS = 8

/** 自动卧底人数：4-8 人 1 个，9-12 人 2 个；卧底数不能超过 总人数-2 */
export function autoSpyCount(playerCount: number): number {
  if (playerCount <= 8) return 1
  return 2
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

function speakersFor(state: SpyState): string[] {
  return state.revoteCandidates ?? state.aliveIds
}

function beginDescribe(state: SpyState, now: number): SpyState {
  const queue = speakersFor(state)
  return {
    ...state,
    phase: 'describe',
    speakerQueue: queue,
    speakerId: queue[0] ?? null,
    votes: {},
    phaseEndsAt: now + DESCRIBE_SECONDS * 1000,
  }
}

function beginVote(state: SpyState, now: number): SpyState {
  return {
    ...state,
    phase: 'vote',
    speakerId: null,
    phaseEndsAt: now + VOTE_SECONDS * 1000,
  }
}

function finishGame(state: SpyState, winner: 'civilian' | 'spy', now: number): SpyState {
  return { ...state, phase: 'result', winner, speakerId: null, phaseEndsAt: now + RESULT_SECONDS * 1000 }
}

function tallyVotes(state: SpyState, now: number): SpyState {
  const counts = new Map<string, number>()
  for (const target of Object.values(state.votes)) {
    counts.set(target, (counts.get(target) ?? 0) + 1)
  }
  const candidates = speakersFor(state)
  let max = 0
  for (const id of candidates) {
    const c = counts.get(id) ?? 0
    if (c > max) max = c
  }
  const top = candidates.filter((id) => (counts.get(id) ?? 0) === max && max > 0)

  const toVoteResult = (s: SpyState): SpyState => ({
    ...s,
    votes: {},
    phase: 'voteResult',
    phaseEndsAt: now + RESULT_SECONDS * 1000,
  })

  // 无人投票（全员超时）→ 本轮作废，进入下一轮
  if (top.length === 0) {
    return toVoteResult({ ...state, revoteCandidates: null, lastEliminated: null })
  }

  // 平票
  if (top.length > 1) {
    // 已经是重投轮还平票 → 都不出局，进入下一轮
    if (state.revoteCandidates) {
      return toVoteResult({ ...state, revoteCandidates: null, lastEliminated: null })
    }
    // 首次平票 → 平票者再描述一轮后重投
    return beginDescribe({ ...state, revoteCandidates: top, votes: {} }, now)
  }

  const eliminatedId = top[0]
  const role: SpyElimination['role'] = state.spyIds.includes(eliminatedId) ? 'spy' : 'civilian'
  const elimination: SpyElimination = { id: eliminatedId, role, round: state.round }

  return toVoteResult({
    ...state,
    aliveIds: state.aliveIds.filter((id) => id !== eliminatedId),
    outIds: [...state.outIds, eliminatedId],
    revoteCandidates: null,
    lastEliminated: elimination,
    history: [...state.history, elimination],
  })
}

function advanceAfterElimination(state: SpyState, _elimination: SpyElimination | null, now: number): SpyState {
  const spiesAlive = state.aliveIds.filter((id) => state.spyIds.includes(id))

  // 平民胜的唯一条件：卧底全部出局。
  //
  // 注意不能写成「本轮投出的人是卧底 → 平民胜」：多卧底局（9 人以上 2 个卧底）
  // 投出第一个卧底时另一个还活着，此时判平民胜会让游戏提前结束。
  if (spiesAlive.length === 0) {
    return finishGame(state, 'civilian', now)
  }
  // 场上只剩 2 人且仍有卧底 → 卧底胜
  if (state.aliveIds.length <= 2) {
    return finishGame(state, 'spy', now)
  }
  // 打满轮数卧底仍存活 → 卧底胜
  if (state.round >= state.maxRounds) {
    return finishGame(state, 'spy', now)
  }
  // 继续下一轮
  return beginDescribe({ ...state, round: state.round + 1, lastEliminated: null }, now)
}

export const spyModule: GameModule<SpyState> = {
  id: 'spy',
  defaultOptions: {
    spyCount: 0, // 0 = 自动
    maxRounds: 2,
    spyAware: false,
  },

  create(ctx: GameContext, options: Record<string, unknown>): SpyState {
    const seed = (ctx.now ^ (ctx.memberIds.length * 2654435761)) >>> 0
    const rng: RNG = createRng(seed)

    const requested = num(options.spyCount, 0)
    const auto = autoSpyCount(ctx.memberIds.length)
    const spyCount = requested > 0 ? Math.min(requested, Math.max(1, ctx.memberIds.length - 2)) : auto

    const pair = rng.pick(WORD_PAIRS)
    // 随机决定哪个词作为平民词，避免玩家靠"第一个词总是平民词"记忆
    const flip = rng.next() < 0.5
    const words: [string, string] = flip ? [pair.b, pair.a] : [pair.a, pair.b]
    const spyIds = rng.sample(ctx.memberIds, spyCount)

    return {
      seed: rng.state,
      phase: 'reveal',
      round: 1,
      // 轮数上限至少要能投完所有卧底，否则多卧底局必定是卧底胜（平民没机会投完）。
      // 房主自定义时同样受此下限约束。
      maxRounds: Math.max(spyCount + 1, Math.min(5, num(options.maxRounds, spyCount + 1))),
      spyIds,
      words,
      category: pair.category,
      speakerQueue: [],
      speakerId: null,
      descriptions: [],
      votes: {},
      readyIds: [],
      revoteCandidates: null,
      aliveIds: [...ctx.memberIds],
      outIds: [],
      phaseEndsAt: ctx.now + REVEAL_SECONDS * 1000,
      winner: null,
      lastEliminated: null,
      history: [],
      spyAware: options.spyAware === true,
    }
  },

  reduce(state, action, ctx): SpyState {
    const alive = state.aliveIds.includes(ctx.playerId)

    if (action.kind === 'ready' && state.phase === 'reveal' && alive) {
      const readyIds = state.readyIds.includes(ctx.playerId)
        ? state.readyIds
        : [...state.readyIds, ctx.playerId]
      const allReady = state.aliveIds.every((id) => readyIds.includes(id))
      if (allReady) return beginDescribe({ ...state, readyIds }, ctx.now)
      return { ...state, readyIds }
    }

    if (action.kind === 'describe' && state.phase === 'describe') {
      if (ctx.playerId !== state.speakerId) return state
      const raw = typeof action.text === 'string' ? action.text.trim() : ''
      const text = raw.slice(0, 30)
      if (text.length < 2) return state

      const descriptions = [...state.descriptions, { playerId: ctx.playerId, round: state.round, text }]
      const queue = state.speakerQueue
      const idx = queue.indexOf(ctx.playerId)
      const nextSpeaker = idx >= 0 && idx < queue.length - 1 ? queue[idx + 1] : null

      if (nextSpeaker === null) {
        return beginVote({ ...state, descriptions, speakerId: null }, ctx.now)
      }
      return {
        ...state,
        descriptions,
        speakerId: nextSpeaker,
        phaseEndsAt: ctx.now + DESCRIBE_SECONDS * 1000,
      }
    }

    if (action.kind === 'vote' && state.phase === 'vote') {
      if (!alive) return state
      const candidates = speakersFor(state)
      const target = typeof action.targetId === 'string' ? action.targetId : ''
      if (!candidates.includes(target)) return state

      const votes = { ...state.votes, [ctx.playerId]: target }
      const allVoted = state.aliveIds.every((id) => votes[id])
      if (allVoted) return tallyVotes({ ...state, votes }, ctx.now)
      return { ...state, votes }
    }

    return state
  },

  privateView(state, playerId) {
    const isSpy = state.spyIds.includes(playerId)
    const role = state.outIds.includes(playerId) ? 'spectator' : isSpy ? 'spy' : 'civilian'
    return {
      myWord: isSpy ? state.words[1] : state.words[0],
      myRole: role,
      // 卧底知悉身份的变体下，额外告知
      amISpy: isSpy && state.spyAware,
    }
  },

  tick(state, now) {
    if (state.phaseEndsAt === null || now < state.phaseEndsAt) return state

    switch (state.phase) {
      case 'reveal':
        return beginDescribe(state, now)

      case 'describe': {
        // 当前发言者超时 → 记一条超时占位，跳到下一位
        const queue = state.speakerQueue
        const idx = state.speakerId ? queue.indexOf(state.speakerId) : -1
        const nextSpeaker = idx >= 0 && idx < queue.length - 1 ? queue[idx + 1] : null
        if (nextSpeaker === null) return beginVote({ ...state, speakerId: null }, now)
        return { ...state, speakerId: nextSpeaker, phaseEndsAt: now + DESCRIBE_SECONDS * 1000 }
      }

      case 'vote':
        return tallyVotes(state, now)

      case 'voteResult':
        return advanceAfterElimination(state, state.lastEliminated, now)

      case 'result':
        return { ...state, phaseEndsAt: null }

      default:
        return state
    }
  },

  nextDeadline(state, now) {
    if (state.phase === 'result') return null
    if (state.phaseEndsAt === null) return null
    // 返回已经过去的时间点会让 DO alarm 立刻回调、且状态不变，形成空转
    return state.phaseEndsAt > now ? state.phaseEndsAt : null
  },

  redact(state) {
    // 结算前：卧底名单与「两个词」都不得出现在广播包里，
    // 否则玩家打开 devtools 就能立刻判断自己是不是卧底。
    if (state.phase === 'result') return state
    return { ...state, words: ['', ''], spyIds: [] }
  },
}

export const SPY_TIMING = {
  REVEAL_SECONDS,
  DESCRIBE_SECONDS,
  VOTE_SECONDS,
  RESULT_SECONDS,
}
