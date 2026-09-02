import type { GameId, RNG, RoomSettings } from '@pg/shared'

export interface GameContext {
  /** 按加入顺序排列的成员 id */
  memberIds: string[]
  hostId: string
  settings: RoomSettings
  now: number
}

export interface ActionContext {
  playerId: string
  now: number
  memberIds: string[]
  /** 由 state.seed 构造，调用结束后引擎会把 rng.state 写回 state.seed */
  rng: RNG
}

export interface PublicPatch {
  /** 需要合并回 state 的字段（引擎负责 Object.assign） */
  patch?: Record<string, unknown>
  /** 需要广播给全体的提示事件 */
  event?: { kind: string; message?: string }
}

export interface GameModule<S = unknown> {
  id: GameId
  /** 房主可在开局前调整的参数及默认值 */
  defaultOptions: Record<string, unknown>

  create(ctx: GameContext, options: Record<string, unknown>): S

  /**
   * 纯函数：接收玩家意图，返回新状态。
   * 禁止在此处读取 Date.now()，所有时间通过 ctx.now 注入。
   */
  reduce(state: S, action: { kind: string; [k: string]: unknown }, ctx: ActionContext): S

  /**
   * 每人看到的私有信息。返回值只通过 private 单播给本人，
   * 绝不允许出现在此函数之外的任何广播负载中。
   */
  privateView(state: S, playerId: string, ctx: GameContext): unknown

  /** 服务端定时器推进：到点时自动前进到下一阶段。必须保证不会无限自我触发。 */
  tick(state: S, now: number, ctx: GameContext): S

  /**
   * 下一次需要在该时刻触发 tick 的时间戳（必须严格大于 now），null 表示无需定时。
   * 传入 now 是为了避免返回一个已经过去的时间戳导致定时器空转。
   */
  nextDeadline(state: S, now: number): number | null

  /**
   * 广播前的脱敏。服务端广播的是同一个 gameState，如果不脱敏，
   * 任何人打开 devtools 就能看到卧底词、狼人身份、光谱目标值。
   * 未实现该方法的游戏，其整个 state 被视为可公开。
   */
  redact?(state: S): S
}

/** 通用：根据存活玩家算出下一个发言者 */
export function nextInRing(queue: string[], current: string | null): string | null {
  if (queue.length === 0) return null
  if (!current) return queue[0]
  const i = queue.indexOf(current)
  if (i < 0) return queue[0]
  return queue[(i + 1) % queue.length]
}
