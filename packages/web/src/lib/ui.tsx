import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { Member } from '@pg/shared'

// ---------- 头像：由 seed 生成稳定的双色渐变，不上传任何图片 ----------

const AVATAR_RAMPS: [string, string][] = [
  ['#7C5CFF', '#FF6B9D'],
  ['#2BD9A0', '#378ADD'],
  ['#FFB020', '#FF6B9D'],
  ['#5B3FE0', '#2BD9A0'],
  ['#FF6B9D', '#BA7517'],
  ['#378ADD', '#7C5CFF'],
  ['#D4537E', '#FFB020'],
  ['#1D9E75', '#85B7EB'],
]

function hashSeed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function Avatar({
  seed,
  nickname,
  size = 40,
  ring = false,
  dim = false,
}: {
  seed: string
  nickname: string
  size?: number
  ring?: boolean
  dim?: boolean
}) {
  const h = hashSeed(seed)
  const [c1, c2] = AVATAR_RAMPS[h % AVATAR_RAMPS.length]
  const angle = h % 360
  const initial = Array.from(nickname)[0] ?? '?'
  return (
    <div
      className={`relative grid shrink-0 place-items-center rounded-full font-medium text-white/95 ${
        ring ? 'ring-2 ring-brand ring-offset-2 ring-offset-ink-850' : ''
      } ${dim ? 'opacity-40 grayscale' : ''}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
      }}
    >
      {initial}
    </div>
  )
}

// ---------- 倒计时环 ----------

export function TimerRing({
  endsAt,
  size = 44,
  total,
}: {
  endsAt: number | null
  size?: number
  total?: number
}) {
  const [left, setLeft] = useState(() => (endsAt ? Math.max(0, endsAt - Date.now()) : 0))
  const [span, setSpan] = useState(total ? total * 1000 : 0)

  useEffect(() => {
    if (!endsAt) {
      setLeft(0)
      return
    }
    if (!total) {
      const first = Math.max(0, endsAt - Date.now())
      setSpan(first)
    }
    const tick = () => setLeft(Math.max(0, endsAt - Date.now()))
    tick()
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [endsAt, total])

  const denom = span > 0 ? span : 1
  const ratio = Math.max(0, Math.min(1, left / denom))
  const secs = Math.ceil(left / 1000)
  const urgent = secs <= 5
  const stroke = 3.5
  const r = (size - stroke) / 2

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={urgent ? '#FF6B6B' : '#7C5CFF'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * r}
          strokeDashoffset={2 * Math.PI * r * (1 - ratio)}
          style={{ transition: 'stroke-dashoffset 120ms linear, stroke 200ms' }}
        />
      </svg>
      <span
        className={`num absolute text-[13px] font-medium ${urgent ? 'text-[#FF6B6B]' : 'text-white/80'}`}
      >
        {secs}
      </span>
    </div>
  )
}

// ---------- 进度条 ----------

export function Progress({ value, tone = 'brand' }: { value: number; tone?: 'brand' | 'mint' | 'accent' }) {
  const colors = { brand: '#7C5CFF', mint: '#2BD9A0', accent: '#FF6B9D' }
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: colors[tone] }}
      />
    </div>
  )
}

// ---------- 底部浮层 ----------

export function Sheet({
  open,
  onClose,
  title,
  children,
  hideClose = false,
}: {
  open: boolean
  onClose?: () => void
  title?: string
  children: ReactNode
  hideClose?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        style={{ animation: 'fadeUp 180ms ease-out both' }}
      />
      <div
        className="relative w-full max-w-[480px] rounded-t-[22px] border-t border-white/10 bg-ink-800"
        style={{ animation: 'slideUp 280ms cubic-bezier(0.22,1,0.36,1) both' }}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <div className="mx-auto h-1 w-9 rounded-full bg-white/15" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pb-3 pt-1">
            <h3 className="text-[16px] font-medium">{title}</h3>
            {!hideClose && onClose && (
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5">
                <X size={16} className="text-white/60" />
              </button>
            )}
          </div>
        )}
        <div className="max-h-[74vh] overflow-y-auto px-5 pb-[calc(20px+var(--safe-bottom))]">{children}</div>
      </div>
    </div>
  )
}

// ---------- 玩家网格 ----------

export function PlayerGrid({
  members,
  myId,
  selectedId,
  onSelect,
  badge,
  compact = false,
  disabledIds = [],
}: {
  members: Member[]
  myId: string | null
  selectedId?: string | null
  onSelect?: (id: string) => void
  badge?: (m: Member) => ReactNode
  compact?: boolean
  disabledIds?: string[]
}) {
  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-4' : 'grid-cols-3'}`}>
      {members.map((m) => {
        const selected = selectedId === m.id
        const disabled = disabledIds.includes(m.id)
        return (
          <button
            key={m.id}
            disabled={!onSelect || disabled}
            onClick={() => onSelect?.(m.id)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 transition-all duration-150 ${
              selected
                ? 'border-brand bg-brand/15'
                : 'border-white/[0.07] bg-white/[0.03]'
            } ${onSelect && !disabled ? 'active:scale-[0.96]' : ''} ${disabled ? 'opacity-45' : ''}`}
          >
            <Avatar seed={m.avatarSeed} nickname={m.nickname} size={compact ? 36 : 44} dim={!m.online} />
            <span className={`w-full truncate text-center text-[12px] ${m.id === myId ? 'text-brand-soft' : 'text-white/70'}`}>
              {m.nickname}
              {m.id === myId && ' · 你'}
            </span>
            {badge?.(m)}
          </button>
        )
      })}
    </div>
  )
}

// ---------- 阶段标题 ----------

export function PhaseHint({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'warn' | 'good' }) {
  const tones = {
    default: 'bg-white/[0.06] text-white/70',
    warn: 'bg-amber/15 text-amber',
    good: 'bg-mint/15 text-mint',
  }
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] ${tones[tone]}`}>
      {children}
    </div>
  )
}

// ---------- 空状态 ----------

export function Empty({ icon, title, desc }: { icon: ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.05] text-white/40">{icon}</div>
      <div className="text-[15px] text-white/70">{title}</div>
      {desc && <div className="max-w-[280px] text-[13px] leading-relaxed text-white/35">{desc}</div>}
    </div>
  )
}

// ---------- 震动反馈（iOS 不支持，降级为无操作） ----------

export function buzz(pattern: number | number[] = 12) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* 不支持则忽略 */
  }
}

// ---------- 轻量音效：全部用 WebAudio 合成，不引入音频文件 ----------

let audioCtx: AudioContext | null = null
let soundEnabled = localStorage.getItem('pg.sound') === '1'

export function isSoundOn() {
  return soundEnabled
}

export function setSoundOn(on: boolean) {
  soundEnabled = on
  localStorage.setItem('pg.sound', on ? '1' : '0')
}

function ctx(): AudioContext | null {
  if (!soundEnabled) return null
  if (!audioCtx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

export function tone(freq: number, duration = 90, type: OscillatorType = 'sine', gain = 0.06) {
  const ac = ctx()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration / 1000)
  osc.connect(g).connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration / 1000)
}

export const sfx = {
  tick: () => tone(880, 40, 'square', 0.03),
  select: () => tone(660, 70, 'triangle', 0.05),
  correct: () => {
    tone(660, 90, 'sine', 0.06)
    window.setTimeout(() => tone(990, 140, 'sine', 0.06), 90)
  },
  reveal: () => {
    tone(330, 160, 'sine', 0.05)
    window.setTimeout(() => tone(494, 260, 'sine', 0.05), 120)
  },
  buzz: () => tone(180, 220, 'sawtooth', 0.04),
}

// ---------- 检测服务端时间戳漂移 ----------

export function useNow(intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

// ---------- 防御：避免同一秒内重复提交 ----------

export function useThrottle<T extends (...args: unknown[]) => void>(fn: T, ms = 120): T {
  const last = useRef(0)
  return useMemo(
    () =>
      ((...args: unknown[]) => {
        const t = Date.now()
        if (t - last.current < ms) return
        last.current = t
        fn(...args)
      }) as T,
    [fn, ms],
  )
}
