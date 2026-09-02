import { useEffect, useMemo, useState } from 'react'
import type { SpyState } from '@pg/shared'
import { EyeOff, MessageSquareText, ShieldCheck, Skull, Users, Vote } from 'lucide-react'
import { Avatar, PhaseHint, PlayerGrid, Progress, buzz, sfx } from '../../lib/ui'
import { Confetti } from '../../components/visuals'
import type { GameProps } from '../shell/GameRoute'

export default function SpyGame({ room, myId, priv, act }: GameProps) {
  const s = room.gameState as SpyState
  const members = room.members
  const nameOf = (id: string) => members.find((m) => m.id === id)?.nickname ?? '玩家'
  const avatarOf = (id: string) => members.find((m) => m.id === id)?.avatarSeed ?? '888888'

  const myWord = (priv as { myWord?: string } | null)?.myWord ?? ''
  const myRole = (priv as { myRole?: string } | null)?.myRole ?? 'civilian'
  const amISpy = myRole === 'spy'

  const alive = s.aliveIds
  const isAlive = alive.includes(myId)
  const amSpeaker = s.speakerId === myId
  const [text, setText] = useState('')
  const [voteTarget, setVoteTarget] = useState<string | null>(null)
  const myVote = s.votes[myId]

  // 轮到自己发言 / 进入投票时震动提示
  useEffect(() => {
    if (s.phase === 'describe' && amSpeaker) buzz([18, 40, 18])
    if (s.phase === 'vote') buzz(24)
    if (s.phase === 'voteResult') sfx.reveal()
    if (s.phase === 'result') sfx.reveal()
  }, [s.phase, amSpeaker])

  const submit = () => {
    const t = text.trim()
    if (t.length < 2) return
    act('describe', { text: t })
    setText('')
  }

  // ---------- 结算 ----------
  if (s.phase === 'result') {
    return (
      <Result
        s={s}
        myId={myId}
        nameOf={nameOf}
        avatarOf={avatarOf}
        myRole={myRole}
      />
    )
  }

  // ---------- 看词 ----------
  if (s.phase === 'reveal') {
    const ready = s.readyIds.includes(myId)
    return (
      <div className="flex flex-col items-center pt-6">
        <PhaseHint>
          <EyeOff size={14} />
          记住你的词，别让别人看到
        </PhaseHint>

        <div
          className="card-hi mt-6 flex w-full flex-col items-center px-6 py-12"
          style={{ animation: 'popIn 320ms cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
          <p className="label">第 {s.round} / {s.maxRounds} 轮 · {s.category}</p>
          <div className="mt-5 text-center">
            <div className="text-[46px] font-medium leading-tight tracking-wide">{myWord}</div>
          </div>
          {amISpy && s.spyAware && (
            <div className="mt-4 rounded-full bg-accent/15 px-3 py-1.5 text-[12.5px] text-accent">你是卧底，小心别被听出来</div>
          )}
          <p className="mt-6 max-w-[260px] text-center text-[12.5px] leading-relaxed text-white/35">
            用一句话描述它，不能直接说出这个词。多数人的词和你一样，少数人的是相近的另一个词。
          </p>
        </div>

        <div className="mt-6 w-full">
          <div className="mb-2 flex items-center justify-between text-[12px] text-white/40">
            <span>已确认 {s.readyIds.length} / {s.aliveIds.length}</span>
            <span>看完点一下</span>
          </div>
          <Progress value={(s.readyIds.length / Math.max(1, s.aliveIds.length)) * 100} />
        </div>

        <div className="dock">
          <button
            disabled={ready}
            onClick={() => act('ready')}
            className={ready ? 'btn-ghost w-full !text-white/35' : 'btn-primary w-full'}
          >
            {ready ? '等待其他人…' : '我记住了'}
          </button>
        </div>
      </div>
    )
  }

  // ---------- 描述 ----------
  if (s.phase === 'describe') {
    const queueIndex = s.speakerQueue.indexOf(s.speakerId ?? '')
    const roundDescs = s.descriptions.filter((d) => d.round === s.round)
    return (
      <div>
        <div className="flex items-center justify-between">
          <PhaseHint tone={amSpeaker ? 'good' : 'default'}>
            <MessageSquareText size={14} />
            {amSpeaker ? '轮到你描述了' : `${nameOf(s.speakerId ?? '')} 正在描述`}
          </PhaseHint>
          <span className="text-[12px] text-white/35">
            {queueIndex + 1} / {s.speakerQueue.length}
          </span>
        </div>

        {s.revoteCandidates && (
          <div className="mt-3 rounded-xl bg-amber/12 px-3 py-2 text-[12.5px] text-amber">
            平票了 · 这几位再描述一次，然后重新投票
          </div>
        )}

        <div className="mt-4 space-y-2">
          {roundDescs.length === 0 && (
            <p className="py-6 text-center text-[13px] text-white/30">还没有人发言</p>
          )}
          {roundDescs.map((d, i) => (
            <div
              key={`${d.playerId}-${i}`}
              className="flex items-start gap-2.5 rounded-2xl bg-white/[0.04] p-3"
              style={{ animation: `fadeUp 240ms ease-out ${i * 40}ms both` }}
            >
              <Avatar seed={avatarOf(d.playerId)} nickname={nameOf(d.playerId)} size={30} />
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] text-white/40">{nameOf(d.playerId)}</div>
                <div className="mt-0.5 text-[14.5px] leading-relaxed text-white/90">{d.text}</div>
              </div>
            </div>
          ))}
        </div>

        {isAlive && (
          <div className="dock">
            {amSpeaker ? (
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 30))}
                  placeholder="用一句话描述你的词…"
                  className="h-[52px] flex-1 rounded-btn border border-white/10 bg-white/[0.05] px-4 text-[15px] placeholder:text-white/25"
                  autoFocus
                />
                <button onClick={submit} disabled={text.trim().length < 2} className="btn-primary px-5">
                  发送
                </button>
              </div>
            ) : (
              <div className="py-3 text-center text-[13px] text-white/35">等待其他人描述…</div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ---------- 投票 ----------
  if (s.phase === 'vote') {
    const candidates = s.revoteCandidates ?? alive
    const votedCount = Object.keys(s.votes).length
    return (
      <div>
        <div className="flex items-center justify-between">
          <PhaseHint tone="warn">
            <Vote size={14} />
            投票：谁是卧底
          </PhaseHint>
          <span className="text-[12px] text-white/35">
            {votedCount} / {alive.length} 已投
          </span>
        </div>

        {/* 本轮发言回顾 */}
        <div className="mt-3 space-y-1.5">
          {s.descriptions
            .filter((d) => d.round === s.round)
            .map((d, i) => (
              <div key={i} className="flex gap-2 rounded-xl bg-white/[0.03] px-3 py-2">
                <span className="shrink-0 text-[11.5px] text-white/35">{nameOf(d.playerId)}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-white/70">{d.text}</span>
              </div>
            ))}
        </div>

        <div className="mt-4">
          <PlayerGrid
            members={members.filter((m) => candidates.includes(m.id))}
            myId={myId}
            selectedId={voteTarget ?? myVote ?? null}
            onSelect={setVoteTarget}
            disabledIds={myVote ? members.map((m) => m.id) : [myId]}
          />
        </div>

        <div className="dock">
          {myVote ? (
            <div className="py-3 text-center text-[13px] text-white/40">
              你投给了 {nameOf(myVote)} · 等待其他人
            </div>
          ) : (
            <button
              disabled={!voteTarget}
              onClick={() => {
                if (!voteTarget) return
                sfx.select()
                act('vote', { targetId: voteTarget })
              }}
              className="btn-primary w-full"
            >
              确认投出
            </button>
          )}
        </div>
      </div>
    )
  }

  // ---------- 出局公布 ----------
  if (s.phase === 'voteResult') {
    const elim = s.lastEliminated
    return (
      <div>
        {elim ? (
          <div className="card-hi mt-2 flex flex-col items-center px-5 py-8">
            <Avatar seed={avatarOf(elim.id)} nickname={nameOf(elim.id)} size={64} />
            <div className="mt-3 text-[17px] font-medium">{nameOf(elim.id)} 出局</div>
            <div
              className={`mt-3 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] ${
                elim.role === 'spy' ? 'bg-mint/15 text-mint' : 'bg-[#FF6B6B]/15 text-[#FF8080]'
              }`}
            >
              {elim.role === 'spy' ? <ShieldCheck size={14} /> : <Skull size={14} />}
              {elim.role === 'spy' ? '抓到卧底了' : '投错了，TA 是平民'}
            </div>
            <p className="mt-4 text-[12.5px] text-white/35">
              场上还剩 {s.aliveIds.length} 人
            </p>
          </div>
        ) : (
          <div className="card-hi mt-2 px-5 py-8 text-center">
            <div className="text-[16px] font-medium">本轮无人出局</div>
            <p className="mt-2 text-[12.5px] text-white/40">平票或无人投票，直接进入下一轮</p>
          </div>
        )}
      </div>
    )
  }

  return null
}

function Result({
  s,
  myId,
  nameOf,
  avatarOf,
  myRole,
}: {
  s: SpyState
  myId: string
  nameOf: (id: string) => string
  avatarOf: (id: string) => string
  myRole: string
}) {
  const civilianWin = s.winner === 'civilian'
  const iWon = (civilianWin && myRole !== 'spy') || (!civilianWin && myRole === 'spy')

  return (
    <div className="pt-2">
      <Confetti active={iWon} />

      <div className="card-hi flex flex-col items-center px-5 py-7">
        <div
          className={`grid h-16 w-16 place-items-center rounded-2xl ${
            civilianWin ? 'bg-mint/18 text-mint' : 'bg-accent/18 text-accent'
          }`}
        >
          {civilianWin ? <ShieldCheck size={30} /> : <Skull size={30} />}
        </div>
        <h2 className="mt-3 text-[21px] font-medium">
          {civilianWin ? '平民获胜' : '卧底获胜'}
        </h2>
        <p className="mt-1.5 text-[13px] text-white/45">
          {civilianWin ? '卧底被揪出来了' : '卧底成功活到最后'}
        </p>
        {iWon && <div className="mt-3 rounded-full bg-brand/15 px-3 py-1 text-[12.5px] text-brand-soft">你赢了</div>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { label: '平民词', value: s.words[0], tone: 'bg-white/[0.04]' },
          { label: '卧底词', value: s.words[1], tone: 'bg-accent/10' },
        ].map((w) => (
          <div key={w.label} className={`rounded-2xl p-3 text-center ${w.tone}`}>
            <div className="text-[11px] text-white/40">{w.label}</div>
            <div className="mt-1 text-[19px] font-medium">{w.value}</div>
          </div>
        ))}
      </div>

      <h3 className="mt-5 flex items-center gap-1.5 text-[14px] font-medium">
        <Users size={15} className="text-white/40" />
        身份揭晓
      </h3>
      <div className="mt-2 space-y-1.5">
        {s.spyIds.concat(s.aliveIds, s.outIds).filter((id, i, arr) => arr.indexOf(id) === i).map((id) => {
          const role = s.spyIds.includes(id) ? 'spy' : 'civilian'
          return (
            <div key={id} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] p-2.5">
              <Avatar seed={avatarOf(id)} nickname={nameOf(id)} size={32} />
              <span className="flex-1 text-[13.5px]">
                {nameOf(id)}
                {id === myId && <span className="ml-1 text-[11.5px] text-brand-soft">· 你</span>}
              </span>
              <span className={`text-[12px] ${role === 'spy' ? 'text-accent' : 'text-white/40'}`}>
                {role === 'spy' ? '卧底' : '平民'}
              </span>
            </div>
          )
        })}
      </div>

      <h3 className="mt-5 text-[14px] font-medium">全场发言回放</h3>
      <div className="mt-2 space-y-1.5">
        {s.descriptions.map((d, i) => (
          <div key={i} className="flex gap-2 rounded-xl bg-white/[0.03] px-3 py-2">
            <span className="shrink-0 text-[11.5px] text-white/35">
              {nameOf(d.playerId)} · 第{d.round}轮
            </span>
            <span className="min-w-0 flex-1 text-[13px] text-white/70">{d.text}</span>
          </div>
        ))}
        {s.descriptions.length === 0 && <p className="py-3 text-center text-[12.5px] text-white/30">本局没有发言</p>}
      </div>
    </div>
  )
}
