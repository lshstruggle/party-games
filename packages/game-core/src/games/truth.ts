import { createRng, type RNG } from '@pg/shared'
import type { TruthState, TruthType } from '@pg/shared'
import { availableQuestions } from '../content/questions.js'
import type { GameContext, GameModule } from '../types.js'

const SPIN_SECONDS = 4
const CHOOSE_SECONDS = 20
const ANSWER_SECONDS = 60
const RATE_SECONDS = 20

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

function pickQuestion(
  type: TruthType,
  spice: 'mild' | 'spicy',
  usedIds: string[],
  rng: RNG,
): { question: string; questionId: string } | null {
  const all = availableQuestions(type, spice)
  if (all.length === 0) return null
  const fresh = all.filter((q) => !usedIds.includes(q.id))
  const pool = fresh.length > 0 ? fresh : all
  const q = pool[Math.floor(rng.next() * pool.length)]
  return { question: q.text, questionId: q.id }
}

function eligible(state: TruthState, memberIds: string[]): string[] {
  const rest = memberIds.filter((id) => !state.completedIds.includes(id))
  return rest.length > 0 ? rest : memberIds
}

function beginSpin(state: TruthState, memberIds: string[], rng: RNG, now: number): TruthState {
  const pool = eligible(state, memberIds)
  const targetId = pool[Math.floor(rng.next() * pool.length)]
  // 旋转角度：5-8 圈 + 随机偏移，客户端据此播放一致的转盘动画
  const wheelSpin = 360 * (5 + Math.floor(rng.next() * 4)) + Math.floor(rng.next() * 360)
  return {
    ...state,
    seed: rng.state,
    phase: 'spin',
    targetId,
    type: null,
    question: null,
    questionId: null,
    ratings: {},
    witnesses: [],
    selfDone: false,
    wheelSpin,
    phaseEndsAt: now + SPIN_SECONDS * 1000,
  }
}

function nextTurn(state: TruthState, memberIds: string[], now: number): TruthState {
  const rng: RNG = createRng(state.seed)
  const done = [...state.completedIds]
  if (state.targetId && !done.includes(state.targetId)) done.push(state.targetId)

  const allDone = memberIds.every((id) => done.includes(id))
  if (allDone) {
    return { ...state, completedIds: done, phase: 'result', phaseEndsAt: null }
  }
  return beginSpin({ ...state, completedIds: done }, memberIds, rng, now)
}

export const truthModule: GameModule<TruthState> = {
  id: 'truth',
  defaultOptions: {},

  create(ctx: GameContext, _options: Record<string, unknown>): TruthState {
    const seed = (ctx.now ^ (ctx.memberIds.length * 69069)) >>> 0
    const rng: RNG = createRng(seed)
    const spice = ctx.settings.spice === 'spicy' ? 'spicy' : 'mild'

    const base: TruthState = {
      seed: rng.state,
      phase: 'spin',
      targetId: null,
      type: null,
      question: null,
      questionId: null,
      ratings: {},
      completedIds: [],
      usedQuestionIds: [],
      skipUsed: {},
      witnesses: [],
      selfDone: false,
      phaseEndsAt: ctx.now + SPIN_SECONDS * 1000,
      spice,
      perPlayer: Object.fromEntries(ctx.memberIds.map((id) => [id, 0])),
      wheelSpin: 0,
    }
    return beginSpin(base, ctx.memberIds, rng, ctx.now)
  },

  reduce(state, action, ctx): TruthState {
    const rng: RNG = createRng(state.seed)
    const isTarget = ctx.playerId === state.targetId
    const spice = state.spice

    // 转盘结束（由房主客户端在动画播完后上报，保证所有人同步进入下一阶段）
    if (action.kind === 'spinDone' && state.phase === 'spin') {
      return { ...state, phase: 'choose', phaseEndsAt: ctx.now + CHOOSE_SECONDS * 1000 }
    }

    if (action.kind === 'choose' && state.phase === 'choose' && isTarget) {
      const raw = action.type
      let type: TruthType
      if (raw === 'truth' || raw === 'dare') type = raw
      else type = rng.next() < 0.5 ? 'truth' : 'dare'

      const picked = pickQuestion(type, spice, state.usedQuestionIds, rng)
      if (!picked) return state
      return {
        ...state,
        seed: rng.state,
        phase: 'answer',
        type,
        question: picked.question,
        questionId: picked.questionId,
        usedQuestionIds: [...state.usedQuestionIds, picked.questionId],
        witnesses: [],
        selfDone: false,
        phaseEndsAt: ctx.now + ANSWER_SECONDS * 1000,
      }
    }

    // 免死金牌：换一题（每人每局一次）
    if (action.kind === 'skip' && state.phase === 'answer' && isTarget) {
      if (state.skipUsed[ctx.playerId]) return state
      const type = state.type ?? 'truth'
      const picked = pickQuestion(type, spice, state.usedQuestionIds, rng)
      if (!picked) return state
      return {
        ...state,
        seed: rng.state,
        skipUsed: { ...state.skipUsed, [ctx.playerId]: true },
        question: picked.question,
        questionId: picked.questionId,
        usedQuestionIds: [...state.usedQuestionIds, picked.questionId],
        phaseEndsAt: ctx.now + ANSWER_SECONDS * 1000,
      }
    }

    if (action.kind === 'done' && state.phase === 'answer' && isTarget) {
      return { ...state, selfDone: true, phaseEndsAt: ctx.now + RATE_SECONDS * 1000 }
    }

    // 大冒险见证：其他玩家确认已完成
    if (action.kind === 'witness' && state.phase === 'answer' && !isTarget) {
      if (state.witnesses.includes(ctx.playerId)) return state
      const witnesses = [...state.witnesses, ctx.playerId]
      const others = ctx.memberIds.filter((id) => id !== state.targetId)
      const needed = Math.min(2, others.length)
      const ready = witnesses.length >= needed && state.selfDone
      return {
        ...state,
        witnesses,
        phase: ready ? 'rate' : state.phase,
        phaseEndsAt: ready ? ctx.now + RATE_SECONDS * 1000 : state.phaseEndsAt,
      }
    }

    if (action.kind === 'rate' && state.phase === 'rate') {
      if (ctx.playerId === state.targetId) return state
      const raw = num(action.score, 2)
      const score = (raw === 1 ? 1 : raw === 3 ? 3 : 2) as 1 | 2 | 3
      const ratings = { ...state.ratings, [ctx.playerId]: score }
      const others = ctx.memberIds.filter((id) => id !== state.targetId)
      const allRated = others.every((id) => ratings[id])
      if (!allRated) return { ...state, ratings }

      const values = Object.values(ratings)
      const avg = values.reduce((a, b) => a + b, 0) / Math.max(1, values.length)
      const perPlayer = { ...state.perPlayer }
      if (state.targetId) {
        perPlayer[state.targetId] = (perPlayer[state.targetId] ?? 0) + (avg >= 2.5 ? 1 : 0)
      }
      return nextTurn({ ...state, ratings, perPlayer }, ctx.memberIds, ctx.now)
    }

    if (action.kind === 'nextTurn' && (state.phase === 'rate' || state.phase === 'result')) {
      return nextTurn(state, ctx.memberIds, ctx.now)
    }

    return state
  },

  privateView(state, playerId) {
    return {
      isTarget: playerId === state.targetId,
      /** 本人是否已用过免死金牌 */
      skipUsed: state.skipUsed[playerId] === true,
    }
  },

  tick(state, now, ctx) {
    if (state.phaseEndsAt === null) return state
    if (now < state.phaseEndsAt) return state
    const rng: RNG = createRng(state.seed)
    const memberIds = ctx?.memberIds ?? []

    switch (state.phase) {
      case 'spin':
        return { ...state, phase: 'choose', phaseEndsAt: now + CHOOSE_SECONDS * 1000 }

      case 'choose': {
        // 超时未选 → 随机
        const type: TruthType = rng.next() < 0.5 ? 'truth' : 'dare'
        const picked = pickQuestion(type, state.spice, state.usedQuestionIds, rng)
        if (!picked) return nextTurn(state, memberIds, now)
        return {
          ...state,
          seed: rng.state,
          phase: 'answer',
          type,
          question: picked.question,
          questionId: picked.questionId,
          usedQuestionIds: [...state.usedQuestionIds, picked.questionId],
          phaseEndsAt: now + ANSWER_SECONDS * 1000,
        }
      }

      case 'answer':
        // 大冒险没有凑齐见证也放行，避免整局卡死
        return { ...state, phase: 'rate', phaseEndsAt: now + RATE_SECONDS * 1000 }

      case 'rate':
        return nextTurn(state, memberIds, now)

      default:
        return { ...state, phaseEndsAt: null }
    }
  },

  nextDeadline(state, now) {
    if (state.phase === 'result') return null
    if (state.phaseEndsAt === null) return null
    return state.phaseEndsAt > now ? state.phaseEndsAt : null
  },
}

export const TRUTH_TIMING = { SPIN_SECONDS, CHOOSE_SECONDS, ANSWER_SECONDS, RATE_SECONDS }
