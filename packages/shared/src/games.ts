// 游戏元信息：前后端共用，用于首页游戏墙与大厅的推荐判断

export type GameId = 'spy' | 'draw' | 'spectrum' | 'truth' | 'wolf'

export interface RuleStep {
  title: string
  desc: string
  /** 用 lucide 图标名表示，客户端映射 */
  icon: string
}

export interface GameMeta {
  id: GameId
  name: string
  subtitle: string
  minPlayers: number
  maxPlayers: number
  /** 最佳人数区间，用于大厅推荐 */
  bestPlayers: [number, number]
  durationMin: number
  tags: string[]
  accent: string
  rules: RuleStep[]
  /** 是否需要私有信息（决定必须联机） */
  needsPrivateInfo: boolean
}

export const GAMES: GameMeta[] = [
  {
    id: 'spy',
    name: '卧底找茬',
    subtitle: '多数人拿到同一个词，少数人是卧底',
    minPlayers: 4,
    maxPlayers: 12,
    bestPlayers: [6, 8],
    durationMin: 8,
    tags: ['嘴皮子', '推理', '破冰'],
    accent: '#7C5CFF',
    needsPrivateInfo: true,
    rules: [
      { icon: 'EyeOff', title: '各拿一词', desc: '开局每人收到一个词。多数人的词相同，卧底的词相近但不同。' },
      { icon: 'MessageSquare', title: '轮流描述', desc: '每人用一句话描述自己的词，不能直接说出词本身。' },
      { icon: 'Vote', title: '投票抓卧底', desc: '描述完毕全员投票，得票最多者出局并公布身份。' },
    ],
  },
  {
    id: 'draw',
    name: '你画我猜',
    subtitle: '一人作画，其他人抢答',
    minPlayers: 3,
    maxPlayers: 12,
    bestPlayers: [4, 8],
    durationMin: 10,
    tags: ['画功', '抢答', '爆笑'],
    accent: '#FF6B9D',
    needsPrivateInfo: true,
    rules: [
      { icon: 'Brush', title: '选词作画', desc: '画手三选一拿到词，在画板上作画，不能写字。' },
      { icon: 'Timer', title: '限时抢答', desc: '其他人实时输入猜测，猜得越早分越高。' },
      { icon: 'Play', title: '回放全场', desc: '结算时可回放整段作画过程，笑点集中在这里。' },
    ],
  },
  {
    id: 'spectrum',
    name: '光谱刻度',
    subtitle: '一个提示词，猜它落在光谱的哪个位置',
    minPlayers: 4,
    maxPlayers: 12,
    bestPlayers: [6, 10],
    durationMin: 15,
    tags: ['默契', '争论', '分队'],
    accent: '#2BD9A0',
    needsPrivateInfo: true,
    rules: [
      { icon: 'Gauge', title: '出题人看刻度', desc: '出题人拿到光谱与隐藏目标位置，给出一个提示词。' },
      { icon: 'MoveHorizontal', title: '全员拨盘', desc: '其他人各自在手机上拨动转盘，猜测目标位置。' },
      { icon: 'Target', title: '揭晓看误差', desc: '越接近得分越高，落在错误一侧则对手得分。' },
    ],
  },
  {
    id: 'truth',
    name: '真心话大冒险',
    subtitle: '转盘选人，答完大家打分',
    minPlayers: 3,
    maxPlayers: 20,
    bestPlayers: [5, 10],
    durationMin: 15,
    tags: ['破冰', '八卦', '刺激'],
    accent: '#FFB020',
    needsPrivateInfo: false,
    rules: [
      { icon: 'Disc3', title: '转盘选人', desc: '转盘停下指到谁，谁就上台接题。' },
      { icon: 'HelpCircle', title: '选题作答', desc: '选择真心话或大冒险，限时完成。' },
      { icon: 'Flame', title: '全员打分', desc: '其他人给敷衍、还行或精彩，得分累计。' },
    ],
  },
  {
    id: 'wolf',
    name: '一夜狼镇',
    subtitle: '只有一个夜晚，一轮讨论，一次投票',
    minPlayers: 3,
    maxPlayers: 10,
    bestPlayers: [6, 9],
    durationMin: 10,
    tags: ['推理', '演技', '法官'],
    accent: '#8B7CF6',
    needsPrivateInfo: true,
    rules: [
      { icon: 'Moon', title: '夜晚行动', desc: '系统当法官，按身份依次提示你睁眼行动，全程闭眼即可。' },
      { icon: 'Users', title: '白天讨论', desc: '限时自由讨论，身份可能已被交换，别太相信自己的记忆。' },
      { icon: 'Gavel', title: '一次定胜负', desc: '全员投票，得票最多者出局，按其身份判定阵营胜负。' },
    ],
  },
]

export const GAME_MAP: Record<string, GameMeta> = Object.fromEntries(GAMES.map((g) => [g.id, g]))

export function getGameMeta(id: string): GameMeta | undefined {
  return GAME_MAP[id]
}
