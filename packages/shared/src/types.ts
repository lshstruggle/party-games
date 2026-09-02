// 房间与成员的基础类型（前后端共享）

export type RoomPhase = 'lobby' | 'playing' | 'result'

export type MemberRole = 'host' | 'player'

export interface Member {
  id: string
  nickname: string
  avatarSeed: string
  isHost: boolean
  online: boolean
  /** 房间内跨游戏累计积分 */
  score: number
  joinedAt: number
  /** 最后一次心跳时间，用于判定掉线 */
  lastSeenAt: number
}

export type SpiceLevel = 'mild' | 'spicy'

export interface RoomSettings {
  spice: SpiceLevel
  /** 各游戏自定义参数，key 为 gameId */
  gameOptions: Record<string, Record<string, unknown>>
}

export interface Room {
  code: string
  hostId: string
  /** 状态版本号，客户端据此判断是否需要全量拉取 */
  revision: number
  phase: RoomPhase
  members: Member[]
  gameId: string | null
  /** 各游戏自定义状态，服务端持有且为唯一权威 */
  gameState: unknown | null
  settings: RoomSettings
  createdAt: number
  lastActiveAt: number
}

// ---------- 消息协议 ----------

export type ClientMsgType =
  | 'join'
  | 'rejoin'
  | 'leave'
  | 'heartbeat'
  | 'action'
  | 'resync'
  | 'startGame'
  | 'endGame'
  | 'updateSettings'
  | 'kick'
  | 'transferHost'

export interface ClientMsg {
  t: ClientMsgType
  roomCode: string
  clientToken: string
  /** 单调递增序号，用于幂等与乱序处理 */
  seq?: number
  payload?: unknown
}

export type ServerMsgType =
  | 'welcome'
  | 'state'
  | 'private'
  | 'event'
  | 'error'
  | 'kicked'

export interface ServerMsg {
  t: ServerMsgType
  roomCode?: string
  revision: number
  payload?: unknown
}

/** 定向单播：私有信息（身份词、手牌、目标刻度）只走这条 */
export interface PrivatePayload {
  /** 该字段仅用于客户端做一致性校验，不含任何需要隐藏的信息 */
  gameId: string
  revision: number
  data: unknown
}

export interface ActionPayload {
  kind: string
  [key: string]: unknown
}

export interface ErrorPayload {
  code: string
  message: string
}

// ---------- 房间码 ----------

/** 剔除易混淆字符 I O 0 1 */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const ROOM_CODE_LENGTH = 4
export const MAX_MEMBERS = 16
export const ROOM_TTL_MS = 24 * 60 * 60 * 1000
export const EMPTY_ROOM_GRACE_MS = 30 * 60 * 1000
/** 断线重连窗口 */
export const REJOIN_WINDOW_MS = 30 * 1000
export const HEARTBEAT_MS = 10 * 1000
