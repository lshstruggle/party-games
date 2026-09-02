// 各游戏的状态类型。前后端共用同一份定义，杜绝状态字段漂移。
// 所有状态必须是可 JSON 序列化的纯数据（禁止 Map/Set/函数），以便快照、重连重放与结算回放。

// ==================== 卧底找茬 ====================

export type SpyRole = 'civilian' | 'spy' | 'spectator'
export type SpyPhase = 'reveal' | 'describe' | 'vote' | 'voteResult' | 'result'

export interface SpyDescription {
  playerId: string
  round: number
  text: string
}

export interface SpyElimination {
  id: string
  role: Exclude<SpyRole, 'spectator'>
  round: number
}

export interface SpyState {
  seed: number
  phase: SpyPhase
  /** 1 起 */
  round: number
  maxRounds: number
  spyIds: string[]
  /** [平民词, 卧底词] */
  words: [string, string]
  category: string
  /** 本轮发言顺序（存活玩家） */
  speakerQueue: string[]
  speakerId: string | null
  descriptions: SpyDescription[]
  /** voterId -> targetId */
  votes: Record<string, string>
  /** 已确认「我看完词了」的玩家 */
  readyIds: string[]
  /** 平票重投时的候选名单，null 表示非重投 */
  revoteCandidates: string[] | null
  aliveIds: string[]
  outIds: string[]
  phaseEndsAt: number | null
  winner: 'civilian' | 'spy' | null
  lastEliminated: SpyElimination | null
  history: SpyElimination[]
  /** 卧底是否知道自己是卧底（变体） */
  spyAware: boolean
}

// ==================== 你画我猜 ====================

export type DrawPhase = 'pick' | 'drawing' | 'roundEnd' | 'result'

/** 坐标已归一化到 0-1000，适配不同屏幕尺寸；points 为扁平数组 [x0,y0,x1,y1,...] 以压缩体积 */
export interface DrawStroke {
  id: string
  color: string
  width: number
  points: number[]
}

export interface DrawGuessEntry {
  playerId: string
  text: string
  correct: boolean
  at: number
}

export interface DrawState {
  seed: number
  phase: DrawPhase
  /** 1 起 */
  round: number
  totalRounds: number
  /** 出牌顺序，按加入顺序打乱一次后固定 */
  order: string[]
  drawerIndex: number
  drawerId: string
  /** 三选一，仅通过 private 下发给画手 */
  choices: string[]
  /** 已选中的词，画手通过 private 可见；回合结束后进入 public */
  word: string | null
  difficulty: 1 | 2 | 3
  strokes: DrawStroke[]
  guessFeed: DrawGuessEntry[]
  /** 按猜中顺序记录的玩家 id */
  correctOrder: string[]
  scores: Record<string, number>
  /** 提示用的掩码，如 "□ □ 果" */
  revealMask: string
  hintLevel: number
  /** 两次提示的触发时刻，与 phaseEndsAt 一起构成该阶段的定时点 */
  hint1At: number | null
  hint2At: number | null
  phaseEndsAt: number | null
  usedWords: string[]
  /** 本回合各人得分变化，用于回合结算展示 */
  roundDeltas: { playerId: string; delta: number }[]
  /** 每回合作画秒数，开局时确定，之后不可变 */
  drawSeconds: number
}

// ==================== 光谱刻度 ====================

export type SpectrumPhase = 'clue' | 'guess' | 'reveal' | 'result'
export type TeamId = 'A' | 'B'

export interface SpectrumRoundResult {
  target: number
  clue: string
  guesses: Record<string, number>
  deltas: Record<string, number>
  teamDeltas: Record<TeamId, number>
  perfect: boolean
}

export interface SpectrumState {
  seed: number
  phase: SpectrumPhase
  round: number
  totalRounds: number
  clueGiverId: string
  left: string
  right: string
  /** 隐藏目标刻度 0-100，仅通过 private 下发出题人 */
  target: number
  clue: string | null
  /** playerId -> 0-100 */
  guesses: Record<string, number>
  /** playerId -> 所属队伍 */
  teamOf: Record<string, TeamId>
  teamTurn: TeamId
  /** 每队轮换到谁出题 */
  turnCursor: Record<TeamId, number>
  scores: Record<TeamId, number>
  perPlayer: Record<string, number>
  lastResult: SpectrumRoundResult | null
  phaseEndsAt: number | null
  usedSpectra: number[]
  useTeams: boolean
}

// ==================== 真心话大冒险 ====================

export type TruthPhase = 'spin' | 'choose' | 'answer' | 'rate' | 'result'
export type TruthType = 'truth' | 'dare'

export interface TruthState {
  seed: number
  phase: TruthPhase
  targetId: string | null
  type: TruthType | null
  question: string | null
  questionId: string | null
  /** raterId -> 1 敷衍 / 2 还行 / 3 精彩 */
  ratings: Record<string, 1 | 2 | 3>
  /** 已完成过一轮的玩家，保证每人轮到一次 */
  completedIds: string[]
  usedQuestionIds: string[]
  /** 已用掉免死金牌的玩家 */
  skipUsed: Record<string, boolean>
  /** 见证大冒险完成的玩家 id（不含本人） */
  witnesses: string[]
  /** 本人是否已声明完成 */
  selfDone: boolean
  phaseEndsAt: number | null
  spice: 'mild' | 'spicy'
  perPlayer: Record<string, number>
  /** 转盘动画用：停留角度，客户端据此播放一致的动画 */
  wheelSpin: number
}

// ==================== 一夜狼镇 ====================

export type WolfPhase = 'reveal' | 'night' | 'discussion' | 'vote' | 'result'
export type WolfRole =
  | 'villager'
  | 'werewolf'
  | 'seer'
  | 'robber'
  | 'troublemaker'
  | 'drunk'
  | 'insomniac'
  | 'hunter'

/** 夜晚行动顺序，索引即执行次序 */
export const WOLF_NIGHT_ORDER: WolfRole[] = [
  'werewolf',
  'seer',
  'robber',
  'troublemaker',
  'drunk',
  'insomniac',
]

export interface WolfSwapRecord {
  /** 交换发生的阶段角色 */
  by: WolfRole
  a: string
  b: string
}

export interface WolfState {
  seed: number
  phase: WolfPhase
  /** 玩家编号 -> 初始身份 */
  initialRoles: Record<string, WolfRole>
  /** 玩家编号 -> 当前身份（可能被交换） */
  currentRoles: Record<string, WolfRole>
  /** 中央牌身份，索引 0..2 */
  center: WolfRole[]
  /** 当前正在行动的夜晚角色 */
  nightRole: WolfRole | null
  nightIndex: number
  /** 已完成行动的玩家 */
  nightDone: string[]
  swaps: WolfSwapRecord[]
  /** 每个人在夜晚获知的信息，仅通过 private 下发 */
  knowledge: Record<string, string[]>
  votes: Record<string, string>
  phaseEndsAt: number | null
  eliminated: string[]
  winner: 'good' | 'wolf' | null
  /** 结算时公开的完整交换轨迹 */
  revealTrail: WolfSwapRecord[]
  enabledRoles: WolfRole[]
}
