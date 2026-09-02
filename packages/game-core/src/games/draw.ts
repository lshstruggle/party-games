import { createRng, normalizeAnswer, type RNG } from '@pg/shared'
import type { DrawGuessEntry, DrawState, DrawStroke } from '@pg/shared'
import { DRAW_WORDS } from '../content/drawWords.js'
import type { ActionContext, GameContext, GameModule } from '../types.js'

const PICK_SECONDS = 8
const DRAW_SECONDS = 80
const ROUND_END_SECONDS = 8

/** 提示时间点：剩余秒数低于阈值时逐步揭示字符 */
const HINT_AT_40 = 40
const HINT_AT_20 = 20

const MAX_STROKES = 400
const MAX_POINTS_PER_STROKE = 3000

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

function buildMask(word: string, positions: number[], revealCount: number): string {
  const chars = Array.from(word)
  const revealed = new Set(positions.slice(0, revealCount))
  return chars.map((c, i) => (revealed.has(i) ? c : '□')).join(' ')
}

/** 由种子决定揭示顺序，保证同一回合内所有人看到一致的提示 */
function revealPositions(word: string, seed: number): number[] {
  const rng: RNG = createRng(seed)
  return rng.shuffle(Array.from(word).map((_, i) => i))
}

function hintSchedule(now: number, drawSeconds: number): { hint1At: number; hint2At: number } {
  const total = drawSeconds * 1000
  return {
    hint1At: now + Math.max(0, total - HINT_AT_40 * 1000),
    hint2At: now + Math.max(0, total - HINT_AT_20 * 1000),
  }
}

function beginDrawing(state: DrawState, idx: number, rngSeed: number, now: number, drawSeconds: number): DrawState {
  const word = state.choices[idx] ?? ''
  const difficulty = (idx + 1) as 1 | 2 | 3
  const positions = revealPositions(word, rngSeed)
  const { hint1At, hint2At } = hintSchedule(now, drawSeconds)
  return {
    ...state,
    phase: 'drawing',
    word,
    difficulty,
    revealMask: buildMask(word, positions, 0),
    hintLevel: 0,
    hint1At,
    hint2At,
    phaseEndsAt: now + drawSeconds * 1000,
  }
}

function startRound(state: DrawState, rng: RNG, now: number): DrawState {
  const easyPool = DRAW_WORDS.filter((w) => w.level === 1).map((w) => w.word)
  const midPool = DRAW_WORDS.filter((w) => w.level === 2).map((w) => w.word)
  const hardPool = DRAW_WORDS.filter((w) => w.level === 3).map((w) => w.word)

  const pickUnused = (pool: string[]): string => {
    const fresh = pool.filter((w) => !state.usedWords.includes(w))
    const source = fresh.length > 0 ? fresh : pool
    return source[Math.floor(rng.next() * source.length)]
  }

  const choices = [pickUnused(easyPool), pickUnused(midPool), pickUnused(hardPool)]
  const drawerId = state.order[state.drawerIndex % state.order.length]

  return {
    ...state,
    seed: rng.state,
    phase: 'pick',
    drawerId,
    choices,
    word: null,
    difficulty: 2,
    strokes: [],
    guessFeed: [],
    correctOrder: [],
    revealMask: '',
    hintLevel: 0,
    hint1At: null,
    hint2At: null,
    roundDeltas: [],
    phaseEndsAt: now + PICK_SECONDS * 1000,
  }
}

function endRound(state: DrawState, now: number): DrawState {
  const word = state.word ?? ''
  const deltas: { playerId: string; delta: number }[] = []
  const scores = { ...state.scores }
  const bonus = state.difficulty - 1

  state.correctOrder.forEach((pid, idx) => {
    const base = idx === 0 ? 3 : idx === 1 ? 2 : 1
    const delta = base + bonus
    scores[pid] = (scores[pid] ?? 0) + delta
    deltas.push({ playerId: pid, delta })
  })

  if (state.correctOrder.length > 0 && state.drawerId) {
    const drawerGain = Math.min(state.correctOrder.length, 3) + bonus
    scores[state.drawerId] = (scores[state.drawerId] ?? 0) + drawerGain
    deltas.push({ playerId: state.drawerId, delta: drawerGain })
  }

  return {
    ...state,
    phase: 'roundEnd',
    scores,
    roundDeltas: deltas,
    word,
    hint1At: null,
    hint2At: null,
    phaseEndsAt: now + ROUND_END_SECONDS * 1000,
  }
}

function advance(state: DrawState, rng: RNG, now: number): DrawState {
  const nextIndex = state.drawerIndex + 1
  if (nextIndex >= state.totalRounds) {
    return { ...state, phase: 'result', hint1At: null, hint2At: null, phaseEndsAt: null }
  }
  const usedWords = state.word ? [...state.usedWords, state.word] : state.usedWords
  return startRound({ ...state, drawerIndex: nextIndex, round: state.round + 1, usedWords }, rng, now)
}

export const drawModule: GameModule<DrawState> = {
  id: 'draw',
  defaultOptions: {
    /** 0 = 每人画一轮（最多 8 轮）；也可显式指定 3/5/8 */
    rounds: 0,
    drawSeconds: DRAW_SECONDS,
  },

  create(ctx: GameContext, options: Record<string, unknown>): DrawState {
    const seed = (ctx.now ^ (ctx.memberIds.length * 40503)) >>> 0
    const rng: RNG = createRng(seed)
    const order = rng.shuffle(ctx.memberIds)

    const requested = num(options.rounds, 0)
    const totalRounds =
      requested > 0 ? Math.max(1, Math.min(12, requested)) : Math.max(1, Math.min(8, ctx.memberIds.length))

    const base: DrawState = {
      seed: rng.state,
      phase: 'pick',
      round: 1,
      totalRounds,
      order,
      drawerIndex: 0,
      drawerId: order[0],
      choices: [],
      word: null,
      difficulty: 2,
      strokes: [],
      guessFeed: [],
      correctOrder: [],
      scores: Object.fromEntries(ctx.memberIds.map((id) => [id, 0])),
      revealMask: '',
      hintLevel: 0,
      hint1At: null,
      hint2At: null,
      phaseEndsAt: ctx.now + PICK_SECONDS * 1000,
      usedWords: [],
      roundDeltas: [],
      drawSeconds: Math.max(30, Math.min(180, num(options.drawSeconds, DRAW_SECONDS))),
    }
    return startRound(base, rng, ctx.now)
  },

  reduce(state, action, ctx): DrawState {
    const rng: RNG = createRng(state.seed)
    const isDrawer = ctx.playerId === state.drawerId

    if (action.kind === 'pickWord' && state.phase === 'pick' && isDrawer) {
      const idx = num(action.index, -1)
      if (idx < 0 || idx >= state.choices.length) return state
      const next = beginDrawing(state, idx, rng.state, ctx.now, state.drawSeconds)
      return { ...next, seed: rng.state }
    }

    if (action.kind === 'stroke' && state.phase === 'drawing' && isDrawer) {
      const op = action.op
      if (op === 'clear') return { ...state, strokes: [] }
      if (op === 'undo') return { ...state, strokes: state.strokes.slice(0, -1) }
      if (op === 'end') return state

      const strokeId = typeof action.strokeId === 'string' ? action.strokeId.slice(0, 40) : ''
      if (!strokeId) return state

      if (op === 'begin') {
        if (state.strokes.length >= MAX_STROKES) return state
        const color = typeof action.color === 'string' ? action.color.slice(0, 24) : '#F5F5F7'
        const width = Math.max(1, Math.min(24, num(action.width, 4)))
        const pts = Array.isArray(action.points)
          ? (action.points as unknown[]).filter((n): n is number => typeof n === 'number')
          : []
        const stroke: DrawStroke = { id: strokeId, color, width, points: pts.slice(0, 2) }
        return { ...state, strokes: [...state.strokes, stroke] }
      }

      if (op === 'points') {
        const idx = state.strokes.findIndex((s) => s.id === strokeId)
        if (idx < 0) return state
        const pts = Array.isArray(action.points)
          ? (action.points as unknown[]).filter((n): n is number => typeof n === 'number')
          : []
        if (pts.length === 0) return state
        const strokes = state.strokes.slice()
        const cur = strokes[idx]
        const merged = cur.points.concat(pts)
        if (merged.length > MAX_POINTS_PER_STROKE) return state
        strokes[idx] = { ...cur, points: merged }
        return { ...state, strokes }
      }

      return state
    }

    if (action.kind === 'guess' && state.phase === 'drawing' && !isDrawer) {
      const raw = typeof action.text === 'string' ? action.text : ''
      const text = raw.trim().slice(0, 20)
      if (!text) return state
      const word = state.word ?? ''
      const correct = word.length > 0 && normalizeAnswer(text) === normalizeAnswer(word)

      const entry: DrawGuessEntry = { playerId: ctx.playerId, text, correct, at: ctx.now }
      const guessFeed = [...state.guessFeed, entry].slice(-60)

      if (!correct) return { ...state, guessFeed }
      if (state.correctOrder.includes(ctx.playerId)) return { ...state, guessFeed }

      const correctOrder = [...state.correctOrder, ctx.playerId]
      const next = { ...state, guessFeed, correctOrder }

      // 所有非画手都猜中 → 提前结束本回合
      const others = state.order.filter((id) => id !== state.drawerId)
      const allGuessed = others.length > 0 && others.every((id) => correctOrder.includes(id))
      return allGuessed ? endRound(next, ctx.now) : next
    }

    if (action.kind === 'nextRound' && state.phase === 'roundEnd') {
      return advance(state, rng, ctx.now)
    }

    return state
  },

  privateView(state, playerId) {
    if (playerId === state.drawerId) {
      return {
        role: 'drawer',
        choices: state.phase === 'pick' ? state.choices : [],
        word: state.word,
      }
    }
    return { role: 'guesser', word: null }
  },

  tick(state, now) {
    switch (state.phase) {
      case 'pick': {
        if (state.phaseEndsAt === null || now < state.phaseEndsAt) return state
        const rng: RNG = createRng(state.seed)
        const idx = Math.min(1, Math.max(0, state.choices.length - 1))
        const next = beginDrawing(state, idx, rng.state, now, state.drawSeconds)
        return { ...next, seed: rng.state }
      }

      case 'drawing': {
        if (state.phaseEndsAt === null) return state
        const word = state.word ?? ''
        const positions = revealPositions(word, state.seed)
        const wanted = Math.min(word.length, 2)

        let hintLevel = state.hintLevel
        if (state.hint1At !== null && now >= state.hint1At && hintLevel < 1) hintLevel = 1
        if (state.hint2At !== null && now >= state.hint2At && hintLevel < wanted) hintLevel = wanted

        if (hintLevel !== state.hintLevel) {
          return { ...state, hintLevel, revealMask: buildMask(word, positions, hintLevel) }
        }
        if (now >= state.phaseEndsAt) return endRound(state, now)
        return state
      }

      case 'roundEnd': {
        if (state.phaseEndsAt === null || now < state.phaseEndsAt) return state
        const rng: RNG = createRng(state.seed)
        return advance(state, rng, now)
      }

      default:
        return { ...state, phaseEndsAt: null }
    }
  },

  nextDeadline(state, now) {
    if (state.phase === 'result') return null
    const cands: number[] = []
    if (state.phaseEndsAt !== null) cands.push(state.phaseEndsAt)
    if (state.phase === 'drawing') {
      if (state.hint1At !== null && state.hintLevel < 1) cands.push(state.hint1At)
      if (state.hint2At !== null && state.hintLevel < 2) cands.push(state.hint2At)
    }
    const future = cands.filter((t) => t > now)
    return future.length > 0 ? Math.min(...future) : null
  },

  redact(state) {
    // 选词阶段隐藏三个候选词；作画阶段隐藏答案
    if (state.phase === 'pick') return { ...state, choices: [], word: null }
    if (state.phase === 'drawing') return { ...state, choices: [], word: null }
    return { ...state, choices: [] }
  },
}

export const DRAW_TIMING = { PICK_SECONDS, DRAW_SECONDS, ROUND_END_SECONDS }
