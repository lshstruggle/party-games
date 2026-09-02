import { createRng, type RNG } from '@pg/shared'
import type { GameId } from '@pg/shared'
import type { ActionContext, GameContext, GameModule } from './types.js'
import { spyModule } from './games/spy.js'
import { drawModule } from './games/draw.js'
import { spectrumModule } from './games/spectrum.js'
import { truthModule } from './games/truth.js'
import { wolfModule } from './games/wolf.js'

export type { ActionContext, GameContext, GameModule } from './types.js'
export { nextInRing } from './types.js'

export const GAME_MODULES: Record<GameId, GameModule<{ seed: number }>> = {
  spy: spyModule as unknown as GameModule<{ seed: number }>,
  draw: drawModule as unknown as GameModule<{ seed: number }>,
  spectrum: spectrumModule as unknown as GameModule<{ seed: number }>,
  truth: truthModule as unknown as GameModule<{ seed: number }>,
  wolf: wolfModule as unknown as GameModule<{ seed: number }>,
}

export function getModule(id: string): GameModule<{ seed: number }> | undefined {
  return GAME_MODULES[id as GameId]
}

type AnyState = { seed: number }

export function createGameState(
  gameId: string,
  ctx: GameContext,
  options: Record<string, unknown>,
): AnyState | null {
  const mod = getModule(gameId)
  if (!mod) return null
  return mod.create(ctx, { ...mod.defaultOptions, ...options }) as AnyState
}

/**
 * 统一的动作入口。负责：
 *   1. 用 state.seed 构造可复现的 RNG
 *   2. 调用游戏 reducer
 *   3. 把 rng 消耗后的新种子写回 state.seed（保证每次随机都推进）
 *   4. 捕获异常，出错时返回原状态，绝不因为一个动作毁掉整局
 */
export function applyAction(
  gameId: string,
  state: AnyState,
  action: { kind: string; [k: string]: unknown },
  ctx: { playerId: string; now: number; memberIds: string[] },
): AnyState {
  const mod = getModule(gameId)
  if (!mod) return state
  const rng: RNG = createRng(state.seed)
  const actx: ActionContext = { ...ctx, rng }
  try {
    const next = mod.reduce(state, action, actx) as AnyState
    if (next && typeof next === 'object') next.seed = rng.state
    return next ?? state
  } catch (err) {
    console.error('[game-core] reduce failed', gameId, action.kind, err)
    return state
  }
}

export function applyTick(
  gameId: string,
  state: AnyState,
  now: number,
  ctx: GameContext,
): AnyState {
  const mod = getModule(gameId)
  if (!mod) return state
  try {
    const next = mod.tick(state, now, ctx) as AnyState
    return next ?? state
  } catch (err) {
    console.error('[game-core] tick failed', gameId, err)
    return state
  }
}

export function privateView(gameId: string, state: AnyState, playerId: string, ctx: GameContext): unknown {
  const mod = getModule(gameId)
  if (!mod) return null
  try {
    return mod.privateView(state, playerId, ctx)
  } catch (err) {
    console.error('[game-core] privateView failed', gameId, err)
    return null
  }
}

/**
 * 广播前的脱敏。这是防止「打开 devtools 就能看到卧底词」的最后一道闸门。
 * 每个游戏模块自行声明哪些字段是私有的；未声明的游戏视为整体可公开。
 */
export function redactState(gameId: string, state: AnyState): AnyState {
  const mod = getModule(gameId)
  if (!mod?.redact) return state
  try {
    return mod.redact(state) as AnyState
  } catch (err) {
    console.error('[game-core] redact failed', gameId, err)
    // 出错时宁可全部隐藏，也不能泄露
    return { seed: state.seed } as AnyState
  }
}

export function nextDeadline(gameId: string, state: AnyState, now: number): number | null {
  const mod = getModule(gameId)
  if (!mod) return null
  try {
    return mod.nextDeadline(state, now)
  } catch (err) {
    console.error('[game-core] nextDeadline failed', gameId, err)
    return null
  }
}

export { spyModule, drawModule, spectrumModule, truthModule, wolfModule }
export { WOLF_ROLE_NAMES, WOLF_ROLE_DESC } from './games/wolf.js'
export { autoSpyCount } from './games/spy.js'
export * from './content/wordPairs.js'
export * from './content/drawWords.js'
export * from './content/spectra.js'
export * from './content/questions.js'
