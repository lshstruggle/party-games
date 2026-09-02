import { useCallback, useEffect, useRef, useState } from 'react'
import type { DrawStroke } from '@pg/shared'
import { Eraser, Undo2, Trash2 } from 'lucide-react'

export const PENCILS = [
  { color: '#F5F5F7', name: '白' },
  { color: '#7C5CFF', name: '紫' },
  { color: '#FF6B9D', name: '粉' },
  { color: '#2BD9A0', name: '绿' },
  { color: '#FFB020', name: '橙' },
  { color: '#378ADD', name: '蓝' },
  { color: '#FF6B6B', name: '红' },
  { color: '#111118', name: '墨' },
]

const WIDTHS = [3, 6, 12]

interface Props {
  strokes: DrawStroke[]
  canDraw: boolean
  onBegin: (strokeId: string, color: string, width: number, x: number, y: number) => void
  onPoints: (strokeId: string, points: number[]) => void
  onEnd: (strokeId: string) => void
  onUndo: () => void
  onClear: () => void
  /** 回放模式：按时间顺序重绘，用于结算页 */
  replay?: boolean
}

export function CanvasBoard({ strokes, canDraw, onBegin, onPoints, onEnd, onUndo, onClear, replay = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [color, setColor] = useState(PENCILS[0].color)
  const [width, setWidth] = useState(WIDTHS[1])
  const [eraser, setEraser] = useState(false)
  const drawing = useRef(false)
  const currentId = useRef<string | null>(null)
  const pending = useRef<number[]>([])
  const rafRef = useRef<number | null>(null)
  const dirty = useRef(true)
  const [size, setSize] = useState({ w: 0, h: 0 })

  // ---------- 尺寸：固定 1:1，保证不同屏幕看到的画面比例一致 ----------
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = Math.round(el.clientWidth)
      setSize({ w, h: w })
    })
    ro.observe(el)
    const w = Math.round(el.clientWidth)
    setSize({ w, h: w })
    return () => ro.disconnect()
  }, [])

  // ---------- 绘制 ----------
  const drawAll = useCallback(
    (upto?: number) => {
      const canvas = canvasRef.current
      if (!canvas || size.w === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
      if (canvas.width !== size.w * dpr) {
        canvas.width = size.w * dpr
        canvas.height = size.h * dpr
      }
      const g = canvas.getContext('2d')
      if (!g) return
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, size.w, size.h)
      g.fillStyle = '#0F0F16'
      g.fillRect(0, 0, size.w, size.h)

      const sx = size.w / 1000
      const sy = size.h / 1000
      g.lineCap = 'round'
      g.lineJoin = 'round'

      for (const s of strokes) {
        const pts = upto === undefined ? s.points : s.points
        if (pts.length < 2) {
          if (pts.length === 2) {
            g.beginPath()
            g.fillStyle = s.color
            g.arc(pts[0] * sx, pts[1] * sy, s.width / 2, 0, Math.PI * 2)
            g.fill()
          }
          continue
        }
        g.beginPath()
        g.strokeStyle = s.color
        g.lineWidth = s.width
        g.moveTo(pts[0] * sx, pts[1] * sy)
        for (let i = 2; i < pts.length; i += 2) {
          g.lineTo(pts[i] * sx, pts[i + 1] * sy)
        }
        g.stroke()
      }
    },
    [strokes, size],
  )

  useEffect(() => {
    dirty.current = true
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        drawAll()
      })
    }
  }, [drawAll])

  // ---------- 回放 ----------
  useEffect(() => {
    if (!replay || strokes.length === 0) return
    let cancelled = false
    const step = () => {
      if (cancelled) return
      drawAll()
      window.setTimeout(() => {
        if (!cancelled) step()
      }, 320)
    }
    step()
    return () => {
      cancelled = true
    }
  }, [replay, strokes.length, drawAll])

  // ---------- 输入 ----------
  const toNorm = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 1000
    const y = ((e.clientY - rect.top) / rect.height) * 1000
    return [Math.round(Math.max(0, Math.min(1000, x))), Math.round(Math.max(0, Math.min(1000, y)))]
  }

  const handleDown = (e: React.PointerEvent) => {
    if (!canDraw) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    currentId.current = id
    const [x, y] = toNorm(e)
    pending.current = [x, y]
    onBegin(id, eraser ? '#0F0F16' : color, eraser ? width * 2 : width, x, y)
    // 本地预测：立刻落一个点，笔迹零延迟
    drawAll()
    const canvas = canvasRef.current
    const g = canvas?.getContext('2d')
    if (g) {
      g.beginPath()
      g.fillStyle = eraser ? '#0F0F16' : color
      g.arc((x / 1000) * size.w, (y / 1000) * size.h, (eraser ? width * 2 : width) / 2, 0, Math.PI * 2)
      g.fill()
    }
  }

  const handleMove = (e: React.PointerEvent) => {
    if (!canDraw || !drawing.current || !currentId.current) return
    const [x, y] = toNorm(e)
    pending.current.push(x, y)
    const canvas = canvasRef.current
    const g = canvas?.getContext('2d')
    if (g && pending.current.length >= 4) {
      const n = pending.current.length
      const sx = size.w / 1000
      const sy = size.h / 1000
      g.beginPath()
      g.strokeStyle = eraser ? '#0F0F16' : color
      g.lineWidth = eraser ? width * 2 : width
      g.lineCap = 'round'
      g.lineJoin = 'round'
      g.moveTo((pending.current[n - 4] * sx), (pending.current[n - 3] * sy))
      g.lineTo((pending.current[n - 2] * sx), (pending.current[n - 1] * sy))
      g.stroke()
    }
    if (pending.current.length >= 6) {
      onPoints(currentId.current, pending.current.splice(0, pending.current.length))
    }
  }

  const handleUp = () => {
    if (!drawing.current || !currentId.current) return
    if (pending.current.length >= 2) onPoints(currentId.current, pending.current.splice(0, pending.current.length))
    onEnd(currentId.current)
    drawing.current = false
    currentId.current = null
  }

  return (
    <div className="w-full">
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F16]"
        style={{ aspectRatio: '1 / 1', touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ width: '100%', height: '100%' }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          onPointerLeave={handleUp}
        />
        {!canDraw && (
          <div className="absolute inset-0 grid place-items-center bg-[#0F0F16]/35">
            <span className="rounded-full bg-black/45 px-3 py-1.5 text-[12px] text-white/70">观战中</span>
          </div>
        )}
      </div>

      {canDraw && (
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center gap-2">
            {PENCILS.map((p) => (
              <button
                key={p.color}
                onClick={() => {
                  setColor(p.color)
                  setEraser(false)
                }}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${
                  !eraser && color === p.color ? 'scale-110 border-white' : 'border-white/15'
                }`}
                style={{ background: p.color }}
                aria-label={p.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {WIDTHS.map((w) => (
              <button
                key={w}
                onClick={() => setWidth(w)}
                className={`grid h-8 flex-1 place-items-center rounded-lg border ${
                  width === w ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <span className="rounded-full bg-white/80" style={{ width: 28, height: Math.max(2, w / 1.6) }} />
              </button>
            ))}
            <button
              onClick={() => setEraser((v) => !v)}
              className={`grid h-8 w-10 place-items-center rounded-lg border ${
                eraser ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/[0.03]'
              }`}
              aria-label="橡皮"
            >
              <Eraser size={15} className="text-white/75" />
            </button>
            <button
              onClick={onUndo}
              className="grid h-8 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03]"
              aria-label="撤销"
            >
              <Undo2 size={15} className="text-white/75" />
            </button>
            <button
              onClick={onClear}
              className="grid h-8 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03]"
              aria-label="清空"
            >
              <Trash2 size={15} className="text-white/75" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
