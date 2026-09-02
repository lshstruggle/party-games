import { useEffect, useMemo, useRef, useState } from 'react'

// ==================== 转盘 ====================

const WHEEL_COLORS = [
  '#7C5CFF',
  '#FF6B9D',
  '#2BD9A0',
  '#FFB020',
  '#378ADD',
  '#D4537E',
  '#5B3FE0',
  '#1D9E75',
  '#BA7517',
  '#A892FF',
  '#FF9BBB',
  '#85B7EB',
]

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function sectorPath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, end)
  const b = polar(cx, cy, r, start)
  const large = end - start <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 0 ${b.x} ${b.y} Z`
}

export function Wheel({
  items,
  spinTo,
  turns = 5,
  durationMs = 3600,
  size = 260,
  onDone,
  spinning,
}: {
  items: string[]
  spinTo: number
  turns?: number
  durationMs?: number
  size?: number
  onDone?: () => void
  spinning: boolean
}) {
  const [rotation, setRotation] = useState(0)
  const doneRef = useRef(false)
  const count = Math.max(1, items.length)
  const seg = 360 / count
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 6

  // 目标角度：让第 spinTo 格的中央停在正上方指针处
  const target = useMemo(() => 360 * turns - (spinTo * seg + seg / 2), [spinTo, seg, turns])

  useEffect(() => {
    if (!spinning) return
    doneRef.current = false
    // 从当前角度继续往前转，避免每轮都从 0 开始
    const base = Math.ceil(rotation / 360) * 360
    const next = base + 360 * turns - ((spinTo * seg + seg / 2) % 360)
    setRotation(next)
    const t = window.setTimeout(() => {
      if (doneRef.current) return
      doneRef.current = true
      onDone?.()
    }, durationMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, spinTo])

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      {/* 顶部指针 */}
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '16px solid #FF6B9D',
            filter: 'drop-shadow(0 2px 6px rgba(255,107,157,0.5))',
          }}
        />
      </div>

      <svg
        width={size}
        height={size}
        className="overflow-visible"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? `transform ${durationMs}ms cubic-bezier(0.16, 0.9, 0.08, 1)` : 'none',
        }}
      >
        {items.map((label, i) => {
          const start = i * seg
          const end = (i + 1) * seg
          const fill = WHEEL_COLORS[i % WHEEL_COLORS.length]
          const mid = start + seg / 2
          const textPos = polar(cx, cy, r * 0.62, mid)
          return (
            <g key={i}>
              <path d={sectorPath(cx, cy, r, start, end)} fill={fill} stroke="#12121A" strokeWidth={2} />
              <text
                x={textPos.x}
                y={textPos.y}
                fill="rgba(255,255,255,0.95)"
                fontSize={count > 8 ? 11 : 13}
                fontWeight={500}
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${mid > 180 ? mid + 90 : mid - 90} ${textPos.x} ${textPos.y})`}
                style={{ maxWidth: 60 }}
              >
                {label.length > 5 ? `${label.slice(0, 5)}…` : label}
              </text>
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={r * 0.19} fill="#12121A" stroke="rgba(255,255,255,0.14)" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={r * 0.07} fill="#7C5CFF" />
      </svg>
    </div>
  )
}

// ==================== 光谱刻度盘 ====================

export function Dial({
  value,
  onChange,
  locked,
  left,
  right,
  showTarget,
  target,
  guesses,
}: {
  value: number | null
  onChange?: (v: number) => void
  locked?: boolean
  left: string
  right: string
  showTarget?: boolean
  target?: number
  guesses?: { id: string; value: number; color: string; label?: string }[]
}) {
  const ref = useRef<SVGSVGElement | null>(null)
  const W = 320
  const H = 176
  const cx = W / 2
  const cy = H - 18
  const radius = 132
  const [dragging, setDragging] = useState(false)

  const angleFor = (v: number) => 180 - (v / 100) * 180
  const pointFor = (v: number, rr = radius) => polar(cx, cy, rr, angleFor(v))

  const handle = (clientX: number, clientY: number) => {
    if (!onChange || locked) return
    const svg = ref.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * W
    const y = ((clientY - rect.top) / rect.height) * H
    let deg = (Math.atan2(cy - y, x - cx) * 180) / Math.PI
    if (deg < 0) deg = y > cy ? 0 : 180
    deg = Math.max(0, Math.min(180, deg))
    const v = Math.round(((180 - deg) / 180) * 100)
    onChange(v)
  }

  const bg = polar(cx, cy, radius, 180)
  const bg2 = polar(cx, cy, radius, 0)
  const marker = value === null ? null : pointFor(value)

  return (
    <div className="select-none">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="touch-none"
        onPointerDown={(e) => {
          setDragging(true)
          e.currentTarget.setPointerCapture(e.pointerId)
          handle(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => dragging && handle(e.clientX, e.clientY)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <defs>
          <linearGradient id="dialArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#378ADD" />
            <stop offset="50%" stopColor="#7C5CFF" />
            <stop offset="100%" stopColor="#FF6B9D" />
          </linearGradient>
        </defs>

        <path d={`M ${bg.x} ${bg.y} A ${radius} ${radius} 0 0 1 ${bg2.x} ${bg2.y}`} fill="none" stroke="url(#dialArc)" strokeWidth={16} strokeLinecap="round" />
        <path d={`M ${bg.x} ${bg.y} A ${radius} ${radius} 0 0 1 ${bg2.x} ${bg2.y}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />

        {/* 刻度 */}
        {[0, 25, 50, 75, 100].map((v) => {
          const p1 = pointFor(v, radius + 12)
          const p2 = pointFor(v, radius + 18)
          return <line key={v} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} />
        })}

        {/* 其他人的落点 */}
        {guesses?.map((g) => {
          const p = pointFor(g.value, radius)
          return (
            <g key={g.id}>
              <circle cx={p.x} cy={p.y} r={6} fill={g.color} opacity={0.85} />
              {g.label && (
                <text x={p.x} y={p.y - 12} fill={g.color} fontSize={10} textAnchor="middle" opacity={0.9}>
                  {g.label}
                </text>
              )}
            </g>
          )
        })}

        {/* 真实目标 */}
        {showTarget && typeof target === 'number' && (
          (() => {
            const a = pointFor(target, radius + 26)
            const b = pointFor(target, radius - 26)
            return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FFB020" strokeWidth={3} strokeLinecap="round" />
          })()
        )}

        {/* 我的落点 */}
        {marker && (
          <g>
            <circle cx={marker.x} cy={marker.y} r={dragging ? 13 : 11} fill="#F5F5F7" stroke="#12121A" strokeWidth={2} />
            <circle cx={marker.x} cy={marker.y} r={4} fill="#7C5CFF" />
          </g>
        )}
      </svg>

      <div className="mt-1 flex items-center justify-between px-1">
        <span className="text-[13px] text-white/55">{left}</span>
        <span className="num text-[15px] font-medium text-white/85">{value === null ? '拖动选择' : value}</span>
        <span className="text-[13px] text-white/55">{right}</span>
      </div>
    </div>
  )
}

// ==================== 结算彩带 ====================

export function Confetti({ active, count = 40 }: { active: boolean; count?: number }) {
  const [pieces, setPieces] = useState<{ id: number; x: number; delay: number; dur: number; color: string; rot: number }[]>([])

  useEffect(() => {
    if (!active) {
      setPieces([])
      return
    }
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 600,
        dur: 1600 + Math.random() * 1200,
        color: WHEEL_COLORS[i % WHEEL_COLORS.length],
        rot: Math.random() * 360,
      })),
    )
    const t = setTimeout(() => setPieces([]), 3200)
    return () => clearTimeout(t)
  }, [active, count])

  if (pieces.length === 0) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-8vh] block h-2 w-1.5 rounded-[1px]"
          style={{
            left: `${p.x}%`,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animation: `confettiFall ${p.dur}ms cubic-bezier(0.2,0.6,0.4,1) ${p.delay}ms forwards`,
          }}
        />
      ))}
      <style>{`@keyframes confettiFall { to { transform: translateY(112vh) rotate(720deg); opacity: 0.25; } }`}</style>
    </div>
  )
}
