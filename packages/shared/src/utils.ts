import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from './types.js'

/** 种子化随机数发生器（mulberry32），可序列化以便复现与回放 */
export interface RNG {
  next(): number
  int(maxExclusive: number): number
  pick<T>(arr: readonly T[]): T
  shuffle<T>(arr: readonly T[]): T[]
  sample<T>(arr: readonly T[], count: number): T[]
  /** 当前内部状态，随 GameState 一起序列化 */
  readonly state: number
}

export function createRng(seed: number): RNG {
  let s = seed >>> 0
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (maxExclusive: number) => Math.floor(next() * maxExclusive),
    pick: <T>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)],
    shuffle: <T>(arr: readonly T[]) => {
      const a = arr.slice()
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    },
    sample: <T>(arr: readonly T[], count: number) => {
      const pool = arr.slice()
      const out: T[] = []
      const n = Math.min(count, pool.length)
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(next() * pool.length)
        out.push(pool.splice(idx, 1)[0])
      }
      return out
    },
    get state() {
      return s
    },
  }
}

export function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0
}

export function randomRoomCode(): string {
  let out = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    out += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]
  }
  return out
}

export function normalizeRoomCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/O/g, '0')
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, ROOM_CODE_LENGTH)
}

/** 客户端身份 token */
export function randomToken(): string {
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

const AVATAR_ADJECTIVES = ['快乐', '暴躁', '沉默', '聪明', '迷糊', '威武', '温柔', '神秘']
const AVATAR_NOUNS = ['水豚', '柴犬', '熊猫', '企鹅', '狐狸', '海豹', '猫咪', '兔子', '树懒', '考拉']

export function randomNickname(seed = Math.random()): string {
  const a = AVATAR_ADJECTIVES[Math.floor(seed * AVATAR_ADJECTIVES.length)]
  const n = AVATAR_NOUNS[Math.floor(Math.random() * AVATAR_NOUNS.length)]
  return `${a}的${n}`
}

export function randomAvatarSeed(): string {
  return Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
}

/** 中文文本归一化：去空格、标点、全角半角，用于猜词比对 */
export function normalizeAnswer(raw: string): string {
  return raw
    .replace(/[\s\u3000]/g, '')
    .replace(/[，。！？、,.!?~～"'“”‘’()（）：:；;]/g, '')
    .toLowerCase()
    .trim()
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}
