import { useEffect, useState } from 'react'
import type { SpectrumState } from '@pg/shared'
import { Gauge, Target, Trophy } from 'lucide-react'
import { Dial } from '../../components/visuals'
import { Avatar, PhaseHint, Progress, buzz, sfx } from '../../lib/ui'
import { Confetti } from '../../components/visuals'
import type { GameProps } from '../shell/GameRoute'

const TEAM_COLOR: Record<'A' | 'B', string> = { A: '#378ADD', B: '#FF6B9D' }

export default function SpectrumGame({ room, myId, priv, act }: GameProps) {
  const s = room.gameState as SpectrumState
  const members = room.members
  const nameOf = (id: string) => members.find((m) => m.id === id)?.nickname ?? '玩家'
  const avatarOf = (id: string) => members.find((m) => m.id === id)?.avatarSeed ?? '888888'

  const isClueGiver = s.clueGiverId === myId
  const myTarget = (priv as { target?: number | null } | null)?.target ?? null
  const myGuess = s.guesses[myId]
  const [local, setLocal] = useState<number>(50)
  const [clue, setClue] = useState('')

  useEffect(() => {
    if (s.phase === 'clue' && isClueGiver) buzz([16, 30, 16])
    if (s.phase === 'guess') buzz(22)
    if (s.phase === 'reveal') sfx.reveal()
  }, [s.phase, isClueGiver])

  useEffect(() => {
    if (s.phase === 'guess' && myGuess !== undefined) setLocal(myGuess)
    if (s.phase === 'clue') setLocal(50)
  }, [s.phase, myGuess])

  const guessers = members.filter((m) => m.id !== s.clueGiverId)
  const guessedCount = Object.keys(s.guesses).length

  // ---------- 出题 ----------
  if (s.phase === 'clue') {
    return (
      <div className="pt-4">
        <PhaseHint tone={isClueGiver ? 'good' : 'default'}>
          <Gauge size={14} />
          {isClueGiver ? '你来出题' : `${nameOf(s.clueGiverId)} 正在想提示词`}
        </PhaseHint>

        <div className="mt-6">
          <Dial
            value={isClueGiver ? myTarget : null}
            left={s.left}
            right={s.right}
            locked
            showTarget={isClueGiver}
            target={isClueGiver && myTarget !== null ? myTarget : undefined}
          />
        </div>

        {isClueGiver ? (
          <>
            <p className="mt-5 text-[13px] leading-relaxed text-white/45">
              给一个提示词，让队友猜到黄色指针的位置。不能直接说出数字，也不能念出两端的概念。
            </p>
            <div className="dock">
              <div className="flex gap-2">
                <input
                  value={clue}
                  onChange={(e) => setClue(e.target.value.slice(0, 12))}
                  placeholder="例如：老板的耐心"
                  className="h-[52px] flex-1 rounded-btn border border-white/10 bg-white/[0.05] px-4 text-[15px] placeholder:text-white/25"
                  autoFocus
                />
                <button
                  disabled={clue.trim().length < 1}
                  onClick={() => {
                    sfx.select()
                    act('submitClue', { clue: clue.trim() })
                    setClue('')
                  }}
                  className="btn-primary px-5"
                >
                  发出
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8 text-center text-[13px] text-white/35">等 TA 给出提示词…</div>
        )}
      </div>
    )
  }

  // ---------- 猜测 ----------
  if (s.phase === 'guess') {
    return (
      <div className="pt-4">
        <div className="flex items-center justify-between">
          <PhaseHint tone={myGuess === undefined ? 'warn' : 'default'}>
            <Target size={14} />
            {myGuess === undefined ? '拨动转盘，猜位置' : '已提交，等其他人'}
          </PhaseHint>
          <span className="text-[12px] text-white/35">
            {guessedCount} / {guessers.length}
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-white/[0.05] px-4 py-3 text-center">
          <p className="label">提示词</p>
          <p className="mt-1.5 text-[22px] font-medium">{s.clue}</p>
        </div>

        {isClueGiver ? (
          <div className="mt-6">
            <Dial value={null} left={s.left} right={s.right} locked showTarget target={myTarget ?? undefined} />
            <p className="mt-4 text-center text-[13px] text-white/35">你是出题人，静静看着他们猜</p>
          </div>
        ) : (
          <div className="mt-6">
            <Dial
              value={myGuess ?? local}
              onChange={setLocal}
              left={s.left}
              right={s.right}
              locked={myGuess !== undefined}
            />
            <div className="dock">
              {myGuess === undefined ? (
                <button
                  onClick={() => {
                    sfx.select()
                    act('submitGuess', { value: local })
                  }}
                  className="btn-primary w-full"
                >
                  锁定答案
                </button>
              ) : (
                <div className="py-3 text-center text-[13px] text-white/35">你选了 {myGuess}</div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ---------- 揭晓 ----------
  if (s.phase === 'reveal' && s.lastResult) {
    const r = s.lastResult
    return (
      <div className="pt-4">
        <PhaseHint tone="good">
          <Target size={14} />
          答案揭晓
        </PhaseHint>

        <div className="mt-5">
          <Dial
            value={myGuess ?? null}
            left={s.left}
            right={s.right}
            locked
            showTarget
            target={r.target}
            guesses={guessers
              .filter((m) => typeof s.guesses[m.id] === 'number')
              .map((m) => ({
                id: m.id,
                value: s.guesses[m.id],
                color: TEAM_COLOR[s.teamOf[m.id] ?? 'A'],
                label: nameOf(m.id),
              }))}
          />
        </div>

        <div className="mt-5 rounded-2xl bg-white/[0.05] px-4 py-3 text-center">
          <p className="label">提示词</p>
          <p className="mt-1 text-[18px] font-medium">{r.clue}</p>
          <p className="mt-1 text-[13px] text-white/45">实际位置 {r.target}</p>
        </div>

        <div className="mt-4 space-y-1.5">
          {guessers.map((m) => {
            const g = s.guesses[m.id]
            const d = r.deltas[m.id] ?? 0
            const miss = typeof g === 'number' && Math.abs(g - r.target) > 4 && (g >= 50) !== (r.target >= 50)
            return (
              <div key={m.id} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] p-2.5">
                <Avatar seed={avatarOf(m.id)} nickname={nameOf(m.id)} size={30} />
                <span className="flex-1 text-[13.5px]">{nameOf(m.id)}</span>
                <span className="num text-[13px] text-white/50">{typeof g === 'number' ? g : '未答'}</span>
                <span className={`num w-9 text-right text-[13px] ${miss ? 'text-[#FF8080]' : d >= 3 ? 'text-mint' : 'text-white/60'}`}>
                  {d > 0 ? `+${d}` : d}
                </span>
              </div>
            )
          })}
          <div className="flex items-center gap-2.5 rounded-xl bg-brand/10 p-2.5">
            <Avatar seed={avatarOf(s.clueGiverId)} nickname={nameOf(s.clueGiverId)} size={30} />
            <span className="flex-1 text-[13.5px]">
              {nameOf(s.clueGiverId)}
              <span className="ml-1 text-[11.5px] text-white/40">出题</span>
            </span>
            <span className="num text-[13px] text-mint">+{r.deltas[s.clueGiverId] ?? 0}</span>
          </div>
        </div>

        <div className="mt-4">
          <TeamScore s={s} />
        </div>
      </div>
    )
  }

  // ---------- 整局结算 ----------
  const winner: 'A' | 'B' | 'draw' = s.scores.A === s.scores.B ? 'draw' : s.scores.A > s.scores.B ? 'A' : 'B'
  const myTeam = s.teamOf[myId]
  const iWon = winner !== 'draw' && winner === myTeam
  return (
    <div className="pt-2">
      <Confetti active={iWon} />
      <div className="card-hi flex flex-col items-center px-5 py-7">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber/18 text-amber">
          <Trophy size={30} />
        </div>
        <h2 className="mt-3 text-[21px] font-medium">
          {winner === 'draw' ? '平局' : `${winner === 'A' ? '蓝队' : '粉队'}获胜`}
        </h2>
        {iWon && <div className="mt-3 rounded-full bg-brand/15 px-3 py-1 text-[12.5px] text-brand-soft">你在获胜队伍</div>}
      </div>
      <div className="mt-4">
        <TeamScore s={s} />
      </div>
      <div className="mt-4">
        <h3 className="text-[14px] font-medium">个人得分</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {Object.entries(s.perPlayer)
            .sort((a, b) => b[1] - a[1])
            .map(([id, score]) => (
              <div key={id} className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2.5">
                <Avatar seed={avatarOf(id)} nickname={nameOf(id)} size={28} />
                <span className="min-w-0 flex-1 truncate text-[13px]">{nameOf(id)}</span>
                <span className="num text-[13px] text-white/60">{score}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

function TeamScore({ s }: { s: SpectrumState }) {
  if (!s.useTeams) return null
  const total = Math.max(1, s.scores.A + s.scores.B)
  return (
    <div className="rounded-2xl bg-white/[0.04] p-3.5">
      <div className="flex items-center justify-between text-[13px]">
        <span style={{ color: TEAM_COLOR.A }}>蓝队</span>
        <span className="num text-white/50">
          {s.scores.A} : {s.scores.B}
        </span>
        <span style={{ color: TEAM_COLOR.B }}>粉队</span>
      </div>
      <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full transition-all duration-500" style={{ width: `${(s.scores.A / total) * 100}%`, background: TEAM_COLOR.A }} />
        <div className="h-full transition-all duration-500" style={{ width: `${(s.scores.B / total) * 100}%`, background: TEAM_COLOR.B }} />
      </div>
      <p className="mt-2 text-center text-[11.5px] text-white/35">
        第 {s.round} / {s.totalRounds} 轮 · {s.teamTurn === 'A' ? '蓝队' : '粉队'}出题
      </p>
    </div>
  )
}
