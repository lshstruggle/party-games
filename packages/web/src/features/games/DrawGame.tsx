import { useEffect, useMemo, useRef, useState } from 'react'
import type { DrawState, DrawStroke } from '@pg/shared'
import { Brush, Eye, Palette, Trophy } from 'lucide-react'
import { CanvasBoard } from '../../components/CanvasBoard'
import { Avatar, PhaseHint, Progress, buzz, sfx } from '../../lib/ui'
import { Confetti } from '../../components/visuals'
import { useRoom } from '../../lib/client'
import type { GameProps } from '../shell/GameRoute'

export default function DrawGame({ room, myId, priv, act }: GameProps) {
  const s = room.gameState as DrawState
  const members = room.members
  const nameOf = (id: string) => members.find((m) => m.id === id)?.nickname ?? '玩家'
  const avatarOf = (id: string) => members.find((m) => m.id === id)?.avatarSeed ?? '888888'
  const event = useRoom((st) => st.event)

  const isDrawer = s.drawerId === myId
  const choices = (priv as { choices?: string[] } | null)?.choices ?? []
  const myWord = (priv as { word?: string | null } | null)?.word ?? null

  // 本地笔画：以服务端全量为基线，叠加收到的增量事件，避免等待全量广播造成卡顿
  const [strokes, setStrokes] = useState<DrawStroke[]>(s.strokes)
  const strokesRef = useRef<DrawStroke[]>(s.strokes)
  const roundRef = useRef(s.round)

  useEffect(() => {
    if (roundRef.current !== s.round) {
      roundRef.current = s.round
      strokesRef.current = s.strokes
      setStrokes(s.strokes)
    }
  }, [s.round, s.strokes])

  useEffect(() => {
    if (!event || event.kind !== 'stroke') return
    const stroke = (event as unknown as { stroke?: { op?: string; strokeId?: string; color?: string; width?: number; points?: number[] } }).stroke
    if (!stroke?.op || !stroke.strokeId) return
    strokesRef.current = applyStrokeDelta(strokesRef.current, stroke as never)
    setStrokes(strokesRef.current)
  }, [event])

  const localApply = (delta: { op: string; strokeId?: string; color?: string; width?: number; points?: number[] }) => {
    strokesRef.current = applyStrokeDelta(strokesRef.current, delta as never)
    setStrokes(strokesRef.current)
  }

  const [guess, setGuess] = useState('')
  const guessedRight = s.correctOrder.includes(myId)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    if (s.phase === 'drawing' && isDrawer) buzz([16, 30, 16])
    if (s.phase === 'roundEnd') sfx.reveal()
  }, [s.phase, isDrawer])

  useEffect(() => {
    if (guessedRight && !confetti) {
      sfx.correct()
      setConfetti(true)
      const t = setTimeout(() => setConfetti(false), 3000)
      return () => clearTimeout(t)
    }
  }, [guessedRight, confetti])

  const submitGuess = () => {
    const t = guess.trim()
    if (!t) return
    act('guess', { text: t })
    setGuess('')
  }

  // ---------- 选词 ----------
  if (s.phase === 'pick') {
    return (
      <div className="flex flex-col items-center pt-8">
        <PhaseHint>
          <Palette size={14} />
          {nameOf(s.drawerId)} 正在选词
        </PhaseHint>
        {isDrawer ? (
          <>
            <p className="mt-6 text-[13px] text-white/40">选一个词开始画，难度越高分越多</p>
            <div className="mt-4 w-full space-y-2">
              {choices.map((w, i) => (
                <button
                  key={w}
                  onClick={() => {
                    sfx.select()
                    act('pickWord', { index: i })
                  }}
                  className="card-hi flex w-full items-center justify-between px-5 py-4 text-left transition-transform active:scale-[0.98]"
                  style={{ animation: `fadeUp 260ms ease-out ${i * 70}ms both` }}
                >
                  <span className="text-[17px] font-medium">{w}</span>
                  <span className="chip">
                    {['简单', '中等', '困难'][i]}
                    <span className="text-brand-soft">+{i}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.05]">
              <Eye size={26} className="text-white/40" />
            </div>
            <p className="text-[13px] text-white/35">等 TA 选好，马上开始画</p>
          </div>
        )}
      </div>
    )
  }

  // ---------- 作画 ----------
  if (s.phase === 'drawing') {
    const masked = s.revealMask || '□'.repeat(Array.from(s.word ?? '').length)
    return (
      <div>
        <Confetti active={confetti} />

        <div className="flex items-center justify-between">
          <PhaseHint tone={isDrawer ? 'good' : 'default'}>
            <Brush size={14} />
            {isDrawer ? `你来画：${myWord ?? ''}` : `${nameOf(s.drawerId)} 正在画`}
          </PhaseHint>
          <span className="text-[12px] text-white/35">
            第 {s.round} / {s.totalRounds} 轮
          </span>
        </div>

        {!isDrawer && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] py-2.5">
            <span className="text-[11.5px] text-white/40">提示</span>
            <span className="num text-[19px] font-medium tracking-[0.22em]">{masked}</span>
          </div>
        )}

        <div className="mt-3">
          <CanvasBoard
            strokes={strokes}
            canDraw={isDrawer}
            onBegin={(strokeId, color, width, x, y) => {
              localApply({ op: 'begin', strokeId, color, width, points: [x, y] })
              act('stroke', { op: 'begin', strokeId, color, width, points: [x, y] })
            }}
            onPoints={(strokeId, points) => {
              localApply({ op: 'points', strokeId, points })
              act('stroke', { op: 'points', strokeId, points })
            }}
            onEnd={(strokeId) => act('stroke', { op: 'end', strokeId })}
            onUndo={() => {
              localApply({ op: 'undo' })
              act('stroke', { op: 'undo' })
            }}
            onClear={() => {
              localApply({ op: 'clear' })
              act('stroke', { op: 'clear' })
            }}
          />
        </div>

        {/* 抢答区 */}
        <div className="mt-3">
          {guessedRight && (
            <div className="mb-2 rounded-xl bg-mint/12 px-3 py-2 text-center text-[13px] text-mint">
              猜对了！等其他人
            </div>
          )}
          <div className="max-h-[132px] space-y-1 overflow-y-auto no-scrollbar">
            {s.guessFeed.slice(-14).map((g, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1 text-[13px] ${
                  g.correct ? 'bg-mint/12 text-mint' : 'text-white/45'
                }`}
              >
                <span className="shrink-0 text-[11.5px] opacity-70">{nameOf(g.playerId)}</span>
                <span className="truncate">{g.text}</span>
                {g.correct && <span className="ml-auto shrink-0 text-[11px]">✓</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="dock">
          {isDrawer ? (
            <div className="py-3 text-center text-[13px] text-white/35">其他人正在抢答…</div>
          ) : guessedRight ? (
            <div className="py-3 text-center text-[13px] text-white/35">等待本轮结束</div>
          ) : (
            <div className="flex gap-2">
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value.slice(0, 20))}
                onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                placeholder="猜猜画的是什么…"
                className="h-[52px] flex-1 rounded-btn border border-white/10 bg-white/[0.05] px-4 text-[15px] placeholder:text-white/25"
              />
              <button onClick={submitGuess} disabled={!guess.trim()} className="btn-primary px-5">
                抢答
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------- 回合结算 ----------
  if (s.phase === 'roundEnd') {
    return (
      <div>
        <div className="card-hi mt-2 flex flex-col items-center px-5 py-6">
          <p className="label">正确答案是</p>
          <div className="mt-2 text-[34px] font-medium">{s.word}</div>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {s.correctOrder.map((id, i) => (
              <span key={id} className="flex items-center gap-1 rounded-full bg-mint/12 px-2.5 py-1 text-[12px] text-mint">
                <Avatar seed={avatarOf(id)} nickname={nameOf(id)} size={16} />
                {nameOf(id)} +{i === 0 ? 3 : i === 1 ? 2 : 1}
              </span>
            ))}
            {s.correctOrder.length === 0 && <span className="text-[13px] text-white/35">没人猜中</span>}
          </div>
        </div>

        <div className="mt-3">
          <CanvasBoard
            strokes={strokes}
            canDraw={false}
            onBegin={() => {}}
            onPoints={() => {}}
            onEnd={() => {}}
            onUndo={() => {}}
            onClear={() => {}}
          />
        </div>

        <Scoreboard s={s} nameOf={nameOf} avatarOf={avatarOf} myId={myId} />
        <div className="h-4" />
      </div>
    )
  }

  // ---------- 整局结算 ----------
  const ranked = Object.entries(s.scores).sort((a, b) => b[1] - a[1])
  const champion = ranked[0]?.[0]
  return (
    <div className="pt-2">
      <Confetti active={champion === myId} />
      <div className="card-hi flex flex-col items-center px-5 py-7">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber/18 text-amber">
          <Trophy size={30} />
        </div>
        <h2 className="mt-3 text-[21px] font-medium">本局结束</h2>
        {champion && (
          <p className="mt-1.5 text-[13px] text-white/45">
            {champion === myId ? '你画得最好' : `${nameOf(champion)} 得分最高`}
          </p>
        )}
      </div>
      <div className="mt-4">
        <Scoreboard s={s} nameOf={nameOf} avatarOf={avatarOf} myId={myId} ranked={ranked} />
      </div>
    </div>
  )
}

function Scoreboard({
  s,
  nameOf,
  avatarOf,
  myId,
  ranked,
}: {
  s: DrawState
  nameOf: (id: string) => string
  avatarOf: (id: string) => string
  myId: string
  ranked?: [string, number][]
}) {
  const rows = useMemo(() => ranked ?? Object.entries(s.scores).sort((a, b) => b[1] - a[1]), [s.scores, ranked])
  const top = rows[0]?.[1] ?? 0
  return (
    <div className="mt-4">
      <h3 className="text-[14px] font-medium">得分</h3>
      <div className="mt-2 space-y-1.5">
        {rows.map(([id, score], i) => (
          <div key={id} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] p-2.5">
            <span className={`w-5 text-center text-[12px] ${i === 0 ? 'text-amber' : 'text-white/30'}`}>{i + 1}</span>
            <Avatar seed={avatarOf(id)} nickname={nameOf(id)} size={30} />
            <span className="flex-1 text-[13.5px]">
              {nameOf(id)}
              {id === myId && <span className="ml-1 text-[11.5px] text-brand-soft">· 你</span>}
            </span>
            <div className="w-16">
              <Progress value={(score / Math.max(1, top)) * 100} tone={i === 0 ? 'accent' : 'brand'} />
            </div>
            <span className="num w-6 text-right text-[14px] font-medium">{score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 把笔画增量合并到笔画数组，服务端与客户端使用同一套语义 */
function applyStrokeDelta(
  strokes: DrawStroke[],
  d: { op: string; strokeId?: string; color?: string; width?: number; points?: number[] },
): DrawStroke[] {
  if (d.op === 'clear') return []
  if (d.op === 'undo') return strokes.slice(0, -1)
  if (d.op === 'end') return strokes
  if (!d.strokeId) return strokes

  if (d.op === 'begin') {
    return [
      ...strokes,
      { id: d.strokeId, color: d.color ?? '#F5F5F7', width: d.width ?? 4, points: d.points ?? [] },
    ]
  }
  if (d.op === 'points') {
    const idx = strokes.findIndex((s) => s.id === d.strokeId)
    if (idx < 0) return strokes
    const next = strokes.slice()
    next[idx] = { ...next[idx], points: next[idx].points.concat(d.points ?? []) }
    return next
  }
  return strokes
}
