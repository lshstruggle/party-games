import { createRng, type RNG } from '@pg/shared'
import type { SpectrumRoundResult, SpectrumState, TeamId } from '@pg/shared'
import { SPECTRA } from '../content/spectra.js'
import type { GameContext, GameModule } from '../types.js'

const CLUE_SECONDS = 45
const GUESS_SECONDS = 35
const REVEAL_SECONDS = 10

/** 完美区半径（0-100 刻度上），落入即满分 */
const PERFECT_RADIUS = 4

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

function other(t: TeamId): TeamId {
  return t === 'A' ? 'B' : 'A'
}

function sideOf(v: number): TeamId {
  return v >= 50 ? 'B' : 'A'
}

function nextClueGiver(state: SpectrumState): string {
  const team = state.teamTurn
  const members = Object.keys(state.teamOf).filter((id) => state.teamOf[id] === team)
  if (members.length === 0) return Object.keys(state.teamOf)[0]
  const cursor = state.turnCursor[team] ?? 0
  return members[cursor % members.length]
}

function setupRound(state: SpectrumState, rng: RNG, now: number): SpectrumState {
  const available = SPECTRA.map((_, i) => i).filter((i) => !state.usedSpectra.includes(i))
  const pool = available.length > 0 ? available : SPECTRA.map((_, i) => i)
  const idx = pool[Math.floor(rng.next() * pool.length)]
  const spectrum = SPECTRA[idx]
  // 目标避开两端极值，否则"正确一侧"会退化成必然事件
  const target = 12 + Math.floor(rng.next() * 77)

  const usedSpectra = available.length > 0 ? [...state.usedSpectra, idx] : [idx]
  const cursor = { ...state.turnCursor }
  cursor[state.teamTurn] = (cursor[state.teamTurn] ?? 0) + 1

  return {
    ...state,
    seed: rng.state,
    phase: 'clue',
    clueGiverId: nextClueGiver(state),
    left: spectrum.left,
    right: spectrum.right,
    target,
    clue: null,
    guesses: {},
    usedSpectra,
    turnCursor: cursor,
    lastResult: null,
    phaseEndsAt: now + CLUE_SECONDS * 1000,
  }
}

/**
 * 进入揭晓阶段：结算本轮得分并写入 lastResult。
 *
 * 有两条路径会到达揭晓——「全员都提交了猜测」和「猜测阶段超时」，
 * 两者必须产生完全一致的结算结果，因此统一收口到这里。
 */
function enterReveal(state: SpectrumState, now: number): SpectrumState {
  const result = scoreRound(state)
  const scores: Record<TeamId, number> = {
    A: state.scores.A + result.teamDeltas.A,
    B: state.scores.B + result.teamDeltas.B,
  }
  const perPlayer = { ...state.perPlayer }
  for (const [id, d] of Object.entries(result.deltas)) {
    perPlayer[id] = (perPlayer[id] ?? 0) + d
  }
  return {
    ...state,
    phase: 'reveal',
    lastResult: result,
    scores,
    perPlayer,
    phaseEndsAt: now + REVEAL_SECONDS * 1000,
  }
}

function scoreRound(state: SpectrumState): SpectrumRoundResult {
  const guessers = Object.keys(state.teamOf).filter((id) => id !== state.clueGiverId)
  const targetSide = sideOf(state.target)
  const deltas: Record<string, number> = {}
  const teamDeltas: Record<TeamId, number> = { A: 0, B: 0 }
  let perfect = true

  for (const id of guessers) {
    const g = state.guesses[id]
    if (typeof g !== 'number') {
      perfect = false
      continue
    }
    if (Math.abs(g - state.target) <= PERFECT_RADIUS) {
      deltas[id] = 3
      teamDeltas[state.teamOf[id]] += 3
    } else if (sideOf(g) === targetSide) {
      deltas[id] = 1
      teamDeltas[state.teamOf[id]] += 1
      perfect = false
    } else {
      deltas[id] = 0
      teamDeltas[other(state.teamOf[id])] += 1
      perfect = false
    }
  }

  const correctCount = guessers.filter((id) => (deltas[id] ?? 0) > 0).length
  const clueGain = Math.min(3, correctCount)
  deltas[state.clueGiverId] = clueGain
  teamDeltas[state.teamOf[state.clueGiverId]] += clueGain

  return { target: state.target, clue: state.clue ?? '', guesses: { ...state.guesses }, deltas, teamDeltas, perfect }
}

export const spectrumModule: GameModule<SpectrumState> = {
  id: 'spectrum',
  defaultOptions: {
    rounds: 4,
    useTeams: true,
  },

  create(ctx: GameContext, options: Record<string, unknown>): SpectrumState {
    const seed = (ctx.now ^ (ctx.memberIds.length * 22695477)) >>> 0
    const rng: RNG = createRng(seed)

    const useTeams = options.useTeams !== false && ctx.memberIds.length >= 4
    const teamOf: Record<string, TeamId> = {}
    ctx.memberIds.forEach((id, i) => {
      teamOf[id] = useTeams ? (i % 2 === 0 ? 'A' : 'B') : 'A'
    })

    const totalRounds = Math.max(2, Math.min(10, num(options.rounds, 4)))

    const base: SpectrumState = {
      seed: rng.state,
      phase: 'clue',
      round: 1,
      totalRounds,
      clueGiverId: ctx.memberIds[0],
      left: '',
      right: '',
      target: 50,
      clue: null,
      guesses: {},
      teamOf,
      teamTurn: 'A',
      turnCursor: { A: 0, B: 0 },
      scores: { A: 0, B: 0 },
      perPlayer: Object.fromEntries(ctx.memberIds.map((id) => [id, 0])),
      lastResult: null,
      phaseEndsAt: ctx.now + CLUE_SECONDS * 1000,
      usedSpectra: [],
      useTeams,
    }
    return setupRound(base, rng, ctx.now)
  },

  reduce(state, action, ctx): SpectrumState {
    const rng: RNG = createRng(state.seed)

    if (action.kind === 'submitClue' && state.phase === 'clue' && ctx.playerId === state.clueGiverId) {
      const raw = typeof action.clue === 'string' ? action.clue.trim() : ''
      const clue = raw.slice(0, 12)
      if (clue.length < 1) return state
      return {
        ...state,
        clue,
        phase: 'guess',
        phaseEndsAt: ctx.now + GUESS_SECONDS * 1000,
      }
    }

    if (action.kind === 'submitGuess' && state.phase === 'guess') {
      if (ctx.playerId === state.clueGiverId) return state
      if (!(ctx.playerId in state.teamOf)) return state
      const raw = num(action.value, -1)
      if (raw < 0 || raw > 100) return state
      const guesses = { ...state.guesses, [ctx.playerId]: Math.round(raw) }
      const guessers = Object.keys(state.teamOf).filter((id) => id !== state.clueGiverId)
      const allGuessed = guessers.every((id) => guesses[id] !== undefined)
      if (allGuessed) {
        // 必须走 enterReveal 而非直接改 phase：否则「全员主动猜完」这条正常路径
        // 会跳过计分，只有超时路径才算分，导致大多数回合得分为 0。
        return enterReveal({ ...state, guesses }, ctx.now)
      }
      return { ...state, guesses }
    }

    if (action.kind === 'nextRound' && (state.phase === 'reveal' || state.phase === 'result')) {
      if (state.round >= state.totalRounds) {
        return { ...state, phase: 'result', phaseEndsAt: null }
      }
      const nextTurn = other(state.teamTurn)
      return setupRound(
        { ...state, round: state.round + 1, teamTurn: state.useTeams ? nextTurn : 'A' },
        rng,
        ctx.now,
      )
    }

    return state
  },

  privateView(state, playerId) {
    // 关键：猜测者的负载里绝不出现 target 字段
    if (playerId === state.clueGiverId) {
      return { isClueGiver: true, target: state.target }
    }
    return { isClueGiver: false, target: null }
  },

  tick(state, now) {
    if (state.phaseEndsAt === null) return state
    if (now < state.phaseEndsAt) return state

    const rng: RNG = createRng(state.seed)

    switch (state.phase) {
      case 'clue':
        // 出题人超时未给提示 → 本题作废，直接进入下一轮
        if (state.round >= state.totalRounds) {
          return { ...state, phase: 'result', phaseEndsAt: null }
        }
        return setupRound(
          { ...state, round: state.round + 1, teamTurn: state.useTeams ? other(state.teamTurn) : 'A' },
          rng,
          now,
        )

      case 'guess':
        // 猜测超时：未提交的人视为放弃，用已有猜测结算
        return enterReveal(state, now)

      case 'reveal': {
        if (state.round >= state.totalRounds) {
          return { ...state, phase: 'result', phaseEndsAt: null }
        }
        return setupRound(
          { ...state, round: state.round + 1, teamTurn: state.useTeams ? other(state.teamTurn) : 'A' },
          rng,
          now,
        )
      }

      default:
        return { ...state, phaseEndsAt: null }
    }
  },

  nextDeadline(state, now) {
    if (state.phase === 'result') return null
    if (state.phaseEndsAt === null) return null
    return state.phaseEndsAt > now ? state.phaseEndsAt : null
  },

  redact(state) {
    // 目标刻度只有出题人能知道。揭晓阶段与结算后才公开。
    if (state.phase === 'reveal' || state.phase === 'result') return state
    return { ...state, target: -1 }
  },
}

export const SPECTRUM_TIMING = { CLUE_SECONDS, GUESS_SECONDS, REVEAL_SECONDS, PERFECT_RADIUS }
