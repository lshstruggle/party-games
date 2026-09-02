import { useEffect, useState } from 'react'
import type { TruthState } from '@pg/shared'
import { Flame, HelpCircle, PartyPopper, ShieldQuestion, Sparkles, ThumbsUp } from 'lucide-react'
import { Wheel } from '../../components/visuals'
import { Avatar, PhaseHint, Progress, buzz, sfx } from '../../lib/ui'
import type { GameProps } from '../shell/GameRoute'

export default function TruthGame({ room, myId, priv, act }: GameProps) {
  const s = room.gameState as TruthState
  const members = room.members
  const nameOf = (id: string) => members.find((m) => m.id === id)?.nickname ?? '玩家'
  const avatarOf = (id: string) => members.find((m) => m.id === id)?.avatarSeed ?? '888888'

  const isTarget = s.targetId === myId
  const skipUsed = (priv as { skipUsed?: boolean } | null)?.skipUsed ?? false
  const [spinning, setSpinning] = useState(false)
  const spinTo = s.targetId ? Math.max(0, members.findIndex((m) => m.id === s.targetId)) : 0

  useEffect(() => {
    if (s.phase === 'spin') {
      setSpinning(true)
      buzz([14, 60, 14, 60, 14])
    } else {
      setSpinning(false)
    }
    if (s.phase === 'answer' && isTarget) buzz(30)
  }, [s.phase, isTarget])

  // 房主客户端在动画结束后上报，保证所有人同步进入下一阶段
  const isHost = members.find((m) => m.id === myId)?.isHost ?? false
  useEffect(() => {
    if (s.phase !== 'spin' || !isHost) return
    const t = setTimeout(() => act('spinDone'), 3800)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.phase, s.targetId, isHost])

  // ---------- 转盘 ----------
  if (s.phase === 'spin') {
    return (
      <div className="flex flex-col items-center pt-6">
        <PhaseHint>
          <Sparkles size={14} />
          转盘转到谁，谁来接题
        </PhaseHint>
        <div className="mt-7">
          <Wheel
            items={members.map((m) => m.nickname)}
            spinTo={spinTo}
            spinning={spinning}
            size={272}
            durationMs={3600}
            onDone={() => {
              sfx.reveal()
              if (isHost) act('spinDone')
            }}
          />
        </div>
        <p className="mt-6 text-[13px] text-white/35">别眨眼…</p>
      </div>
    )
  }

  // ---------- 选题 ----------
  if (s.phase === 'choose') {
    return (
      <div className="flex flex-col items-center pt-8">
        <Avatar seed={avatarOf(s.targetId ?? '')} nickname={nameOf(s.targetId ?? '')} size={72} ring />
        <h2 className="mt-3 text-[19px] font-medium">
          {isTarget ? '轮到你了' : `${nameOf(s.targetId ?? '')} 上场`}
        </h2>
        <p className="mt-1.5 text-[13px] text-white/45">选一个，或者让命运决定</p>

        {isTarget ? (
          <div className="mt-7 w-full space-y-2.5">
            <button
              onClick={() => {
                sfx.select()
                act('choose', { type: 'truth' })
              }}
              className="card-hi flex w-full items-center gap-3.5 px-5 py-4 text-left transition-transform active:scale-[0.98]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand/18 text-brand-soft">
                <HelpCircle size={21} />
              </div>
              <div className="flex-1">
                <div className="text-[16px] font-medium">真心话</div>
                <div className="mt-0.5 text-[12px] text-white/40">如实回答一个问题</div>
              </div>
            </button>
            <button
              onClick={() => {
                sfx.select()
                act('choose', { type: 'dare' })
              }}
              className="card-hi flex w-full items-center gap-3.5 px-5 py-4 text-left transition-transform active:scale-[0.98]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/18 text-accent">
                <Flame size={21} />
              </div>
              <div className="flex-1">
                <div className="text-[16px] font-medium">大冒险</div>
                <div className="mt-0.5 text-[12px] text-white/40">完成一个挑战</div>
              </div>
            </button>
            <button
              onClick={() => {
                sfx.select()
                act('choose', { type: 'random' })
              }}
              className="btn-ghost w-full"
            >
              随机来一个
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-1.5 text-center">
            <div className="mx-auto h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            <p className="text-[13px] text-white/35">等 TA 选…</p>
          </div>
        )}
      </div>
    )
  }

  // ---------- 答题 ----------
  if (s.phase === 'answer') {
    const isDare = s.type === 'dare'
    const others = members.filter((m) => m.id !== s.targetId)
    const needed = Math.min(2, others.length)
    return (
      <div>
        <div className="flex items-center justify-between">
          <PhaseHint tone={isDare ? 'warn' : 'default'}>
            {isDare ? <Flame size={14} /> : <HelpCircle size={14} />}
            {isDare ? '大冒险' : '真心话'}
          </PhaseHint>
          {s.spice === 'spicy' && <span className="text-[11.5px] text-accent">微辣</span>}
        </div>

        <div
          className="card-hi mt-4 flex min-h-[168px] flex-col items-center justify-center px-6 py-8 text-center"
          style={{ animation: 'popIn 300ms cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
          <p className="text-[20px] font-medium leading-relaxed">{s.question}</p>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <Avatar seed={avatarOf(s.targetId ?? '')} nickname={nameOf(s.targetId ?? '')} size={26} />
          <span className="text-[13px] text-white/50">{nameOf(s.targetId ?? '')}</span>
        </div>

        {isDare && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[12px] text-white/40">
              <span>见证完成 {s.witnesses.length} / {needed}</span>
              <span>{s.selfDone ? '本人已确认' : '等待本人确认'}</span>
            </div>
            <Progress value={(s.witnesses.length / Math.max(1, needed)) * 100} tone="accent" />
            {!isTarget && (
              <button
                disabled={s.witnesses.includes(myId)}
                onClick={() => {
                  sfx.select()
                  act('witness')
                }}
                className={s.witnesses.includes(myId) ? 'btn-ghost mt-3 w-full !text-white/35' : 'btn-ghost mt-3 w-full'}
              >
                <ThumbsUp size={16} />
                {s.witnesses.includes(myId) ? '已见证' : '我看到了，算数'}
              </button>
            )}
          </div>
        )}

        <div className="dock">
          {isTarget ? (
            <div className="flex gap-2">
              {!skipUsed && (
                <button
                  onClick={() => act('skip')}
                  className="btn-ghost h-[52px] px-4"
                  title="换一题（每局一次）"
                >
                  <ShieldQuestion size={17} />
                  换一题
                </button>
              )}
              <button
                disabled={s.selfDone}
                onClick={() => act('done')}
                className={s.selfDone ? 'btn-ghost flex-1 !text-white/35' : 'btn-primary flex-1'}
              >
                {s.selfDone ? '等大家打分…' : '我做完了'}
              </button>
            </div>
          ) : (
            <div className="py-3 text-center text-[13px] text-white/35">
              {isDare ? '确认 TA 完成了才算数' : '等 TA 回答…'}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------- 打分 ----------
  if (s.phase === 'rate') {
    const others = members.filter((m) => m.id !== s.targetId)
    const myRate = s.ratings[myId]
    return (
      <div>
        <PhaseHint tone="good">
          <PartyPopper size={14} />
          给 {nameOf(s.targetId ?? '')} 打个分
        </PhaseHint>

        <div className="card mt-4 px-5 py-5 text-center">
          <p className="text-[15px] leading-relaxed text-white/70">{s.question}</p>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[12px] text-white/40">
            <span>已评 {Object.keys(s.ratings).length} / {others.length}</span>
          </div>
          <Progress value={(Object.keys(s.ratings).length / Math.max(1, others.length)) * 100} tone="mint" />
        </div>

        <div className="dock">
          {isTarget ? (
            <div className="py-3 text-center text-[13px] text-white/35">大家在给你打分…</div>
          ) : myRate ? (
            <div className="py-3 text-center text-[13px] text-white/40">已评分，等其他人</div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { score: 1, label: '敷衍', emoji: '🫤' },
                  { score: 2, label: '还行', emoji: '🙂' },
                  { score: 3, label: '精彩', emoji: '🔥' },
                ] as const
              ).map((o) => (
                <button
                  key={o.score}
                  onClick={() => {
                    sfx.select()
                    act('rate', { score: o.score })
                  }}
                  className="card flex flex-col items-center gap-1 py-3.5 transition-transform active:scale-[0.96]"
                >
                  <span className="text-[22px]">{o.emoji}</span>
                  <span className="text-[12.5px] text-white/70">{o.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------- 结算 ----------
  const ranked = Object.entries(s.perPlayer).sort((a, b) => b[1] - a[1])
  return (
    <div className="pt-4">
      <div className="card-hi flex flex-col items-center px-5 py-7">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/18 text-accent">
          <PartyPopper size={30} />
        </div>
        <h2 className="mt-3 text-[21px] font-medium">大家都轮过一遍了</h2>
        <p className="mt-1.5 text-[13px] text-white/45">得分来自「精彩」票数</p>
      </div>
      <div className="mt-4 space-y-1.5">
        {ranked.map(([id, score], i) => (
          <div key={id} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] p-2.5">
            <span className={`w-5 text-center text-[12px] ${i === 0 ? 'text-amber' : 'text-white/30'}`}>{i + 1}</span>
            <Avatar seed={avatarOf(id)} nickname={nameOf(id)} size={30} />
            <span className="flex-1 text-[13.5px]">
              {nameOf(id)}
              {id === myId && <span className="ml-1 text-[11.5px] text-brand-soft">· 你</span>}
            </span>
            <span className="num text-[14px] font-medium">{score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
