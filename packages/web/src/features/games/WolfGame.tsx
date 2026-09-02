import { useEffect, useState } from 'react'
import type { Member, WolfRole, WolfState } from '@pg/shared'
import { Moon, Sun, Gavel, ShieldCheck, Skull, Eye, EyeOff, Users } from 'lucide-react'
import { WOLF_ROLE_NAMES, WOLF_ROLE_DESC } from '@pg/game-core'
import { Avatar, PhaseHint, PlayerGrid, Progress, buzz, sfx } from '../../lib/ui'
import { Confetti } from '../../components/visuals'
import type { GameProps } from '../shell/GameRoute'

export default function WolfGame({ room, myId, priv, act }: GameProps) {
  const s = room.gameState as WolfState
  const members = room.members
  const nameOf = (id: string) => members.find((m) => m.id === id)?.nickname ?? '玩家'
  const avatarOf = (id: string) => members.find((m) => m.id === id)?.avatarSeed ?? '888888'

  const myInitial = (priv as { initialRole?: WolfRole | null } | null)?.initialRole ?? null
  const myCurrent = (priv as { currentRole?: WolfRole | null } | null)?.currentRole ?? null
  const knowledge = (priv as { knowledge?: string[] } | null)?.knowledge ?? []
  const myVote = (priv as { myVote?: string | null } | null)?.myVote ?? null

  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (s.phase === 'night') buzz([14, 50, 14])
    if (s.phase === 'discussion') buzz(28)
    if (s.phase === 'result') sfx.reveal()
  }, [s.phase])

  // ---------- 夜晚：查看身份（点按查看，松手隐藏，防止偷看） ----------
  if (s.phase === 'reveal') {
    return (
      <div className="flex flex-col items-center pt-6">
        <PhaseHint>
          <Moon size={14} />
          天黑了，记住你的身份
        </PhaseHint>

        <button
          onPointerDown={() => setRevealed(true)}
          onPointerUp={() => setRevealed(false)}
          onPointerLeave={() => setRevealed(false)}
          className="card-hi mt-6 flex w-full select-none flex-col items-center px-6 py-12"
          style={{ animation: 'popIn 320ms cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
          {revealed ? (
            <>
              <p className="label">你的身份</p>
              <div className="mt-3 text-[38px] font-medium">{myInitial ? WOLF_ROLE_NAMES[myInitial] : '—'}</div>
              <p className="mt-3 max-w-[250px] text-center text-[12.5px] leading-relaxed text-white/45">
                {myInitial ? WOLF_ROLE_DESC[myInitial] : ''}
              </p>
            </>
          ) : (
            <>
              <Eye size={34} className="text-white/30" />
              <p className="mt-4 text-[14px] text-white/45">长按查看</p>
            </>
          )}
        </button>

        <div className="mt-6 w-full">
          <div className="mb-2 flex items-center justify-between text-[12px] text-white/40">
            <span>已确认 {s.nightDone.length} / {members.length}</span>
            <span>看完点一下</span>
          </div>
          <Progress value={(s.nightDone.length / Math.max(1, members.length)) * 100} />
        </div>

        <div className="dock">
          <button
            disabled={s.nightDone.includes(myId)}
            onClick={() => act('ready')}
            className={s.nightDone.includes(myId) ? 'btn-ghost w-full !text-white/35' : 'btn-primary w-full'}
          >
            {s.nightDone.includes(myId) ? '等待其他人…' : '我记住了'}
          </button>
        </div>
      </div>
    )
  }

  // ---------- 夜晚：行动 ----------
  if (s.phase === 'night') {
    const iAmActing = s.nightRole !== null && myInitial === s.nightRole
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1a2e] text-brand-soft">
          <Moon size={30} />
        </div>
        <h2 className="mt-4 text-[19px] font-medium">
          {s.nightRole ? `${WOLF_ROLE_NAMES[s.nightRole]}，请睁眼` : '夜晚进行中'}
        </h2>
        <p className="mt-2 max-w-[290px] text-center text-[13px] leading-relaxed text-white/45">
          {s.nightRole ? WOLF_ROLE_DESC[s.nightRole] : ''}
        </p>

        {!iAmActing ? (
          <div className="mt-8 flex flex-col items-center gap-2">
            <EyeOff size={22} className="text-white/25" />
            <p className="text-[13px] text-white/35">不是你的回合，请保持安静</p>
          </div>
        ) : (
          <div className="mt-7 w-full">
            <NightAction s={s} myId={myId} members={members} act={act} nameOf={nameOf} avatarOf={avatarOf} />
          </div>
        )}
      </div>
    )
  }

  // ---------- 白天讨论 ----------
  if (s.phase === 'discussion') {
    const isHost = members.find((m) => m.id === myId)?.isHost ?? false
    return (
      <div>
        <PhaseHint tone="warn">
          <Sun size={14} />
          天亮了 · 自由讨论
        </PhaseHint>

        <div className="card mt-4 px-4 py-3.5">
          <p className="text-[13px] leading-relaxed text-white/55">
            所有人睁眼。你的身份可能已经被交换过了 —— 别太相信自己的记忆。
          </p>
          {knowledge.length > 0 && (
            <>
              <div className="hairline my-3" />
              <p className="label">你夜晚得到的信息</p>
              <ul className="mt-1.5 space-y-1">
                {knowledge.map((k, i) => (
                  <li key={i} className="text-[13px] text-brand-soft">
                    · {k}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="mt-4">
          <p className="label mb-2">中央牌（3 张，无人使用）</p>
          <div className="grid grid-cols-3 gap-2">
            {s.center.map((_, i) => (
              <div key={i} className="grid h-14 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-[12.5px] text-white/35">
                牌 {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="dock">
          {isHost ? (
            <button onClick={() => act('endDiscussion')} className="btn-primary w-full">
              <Gavel size={17} />
              讨论结束，开始投票
            </button>
          ) : (
            <div className="py-3 text-center text-[13px] text-white/35">房主可以提前结束讨论</div>
          )}
        </div>
      </div>
    )
  }

  // ---------- 投票 ----------
  if (s.phase === 'vote') {
    const voted = Object.keys(s.votes).length
    return (
      <div>
        <div className="flex items-center justify-between">
          <PhaseHint tone="warn">
            <Gavel size={14} />
            投出你怀疑的人
          </PhaseHint>
          <span className="text-[12px] text-white/35">
            {voted} / {members.length}
          </span>
        </div>

        {knowledge.length > 0 && (
          <div className="card mt-3 px-4 py-3">
            <p className="label">你夜晚得到的信息</p>
            <ul className="mt-1.5 space-y-1">
              {knowledge.map((k, i) => (
                <li key={i} className="text-[12.5px] text-brand-soft">
                  · {k}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <PlayerGrid
            members={members}
            myId={myId}
            selectedId={myVote}
            onSelect={(id) => {
              sfx.select()
              act('vote', { targetId: id })
            }}
            disabledIds={myVote ? members.map((m) => m.id) : [myId]}
          />
        </div>

        <div className="dock">
          {myVote ? (
            <div className="py-3 text-center text-[13px] text-white/40">你投给了 {nameOf(myVote)} · 等待其他人</div>
          ) : (
            <div className="py-3 text-center text-[13px] text-white/35">选一个人投出</div>
          )}
        </div>
      </div>
    )
  }

  // ---------- 结算 ----------
  const goodWin = s.winner === 'good'
  const iWon = goodWin ? myCurrent !== 'werewolf' : myCurrent === 'werewolf'
  return (
    <div className="pt-2">
      <Confetti active={iWon} />

      <div className="card-hi flex flex-col items-center px-5 py-7">
        <div className={`grid h-16 w-16 place-items-center rounded-2xl ${goodWin ? 'bg-mint/18 text-mint' : 'bg-accent/18 text-accent'}`}>
          {goodWin ? <ShieldCheck size={30} /> : <Skull size={30} />}
        </div>
        <h2 className="mt-3 text-[21px] font-medium">{goodWin ? '好人阵营获胜' : '狼人阵营获胜'}</h2>
        <p className="mt-1.5 text-[13px] text-white/45">
          {goodWin ? '至少一只狼被投了出去' : '被投出去的不是狼'}
        </p>
        {iWon && <div className="mt-3 rounded-full bg-brand/15 px-3 py-1 text-[12.5px] text-brand-soft">你赢了</div>}
      </div>

      <h3 className="mt-5 flex items-center gap-1.5 text-[14px] font-medium">
        <Users size={15} className="text-white/40" />
        身份揭晓
      </h3>
      <div className="mt-2 space-y-1.5">
        {members.map((m) => {
          const initial = s.initialRoles[m.id]
          const current = s.currentRoles[m.id]
          const swapped = initial !== current
          const out = s.eliminated.includes(m.id)
          return (
            <div
              key={m.id}
              className={`flex items-center gap-2.5 rounded-xl p-2.5 ${out ? 'bg-[#FF6B6B]/10' : 'bg-white/[0.04]'}`}
            >
              <Avatar seed={m.avatarSeed} nickname={m.nickname} size={32} dim={out} />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px]">
                  {m.nickname}
                  {m.id === myId && <span className="ml-1 text-[11.5px] text-brand-soft">· 你</span>}
                </div>
                <div className="text-[11.5px] text-white/35">
                  {initial ? WOLF_ROLE_NAMES[initial] : ''}
                  {swapped && <> → {current ? WOLF_ROLE_NAMES[current] : ''}</>}
                </div>
              </div>
              {current === 'werewolf' && <span className="text-[12px] text-accent">狼</span>}
              {out && <span className="text-[11.5px] text-[#FF8080]">出局</span>}
            </div>
          )
        })}
      </div>

      {s.revealTrail.length > 0 && (
        <>
          <h3 className="mt-5 text-[14px] font-medium">身份交换轨迹</h3>
          <div className="mt-2 space-y-1">
            {s.revealTrail.map((t, i) => (
              <div key={i} className="rounded-lg bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/50">
                {WOLF_ROLE_NAMES[t.by]}：{fmtTarget(t.a, nameOf)} ⇄ {fmtTarget(t.b, nameOf)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function fmtTarget(t: string, nameOf: (id: string) => string): string {
  return t.startsWith('center:') ? `中央牌 ${Number(t.slice(7)) + 1}` : nameOf(t)
}

function NightAction({
  s,
  myId,
  members,
  act,
  nameOf,
  avatarOf,
}: {
  s: WolfState
  myId: string
  members: Member[]
  act: (kind: string, extra?: Record<string, unknown>) => void
  nameOf: (id: string) => string
  avatarOf: (id: string) => string
}) {
  const role = s.nightRole
  const [centerIndex, setCenterIndex] = useState(0)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [targetBId, setTargetBId] = useState<string | null>(null)

  if (!role) return null

  const others = members.filter((m) => m.id !== myId)

  if (role === 'werewolf') {
    const wolves = Object.entries(s.initialRoles).filter(([, r]) => r === 'werewolf').map(([id]) => id)
    if (wolves.length > 1) {
      return (
        <div className="card px-4 py-4 text-center">
          <p className="text-[14px]">你的同伴是</p>
          <p className="mt-2 text-[19px] font-medium">
            {wolves.filter((w) => w !== myId).map(nameOf).join('、')}
          </p>
          <button onClick={() => act('nightAction', {})} className="btn-primary mt-4 w-full">
            知道了，闭眼
          </button>
        </div>
      )
    }
    return (
      <div className="card px-4 py-4">
        <p className="text-[13.5px] text-white/60">场上只有你一只狼，可以查看一张中央牌</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {s.center.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenterIndex(i)}
              className={`h-14 rounded-xl border text-[13px] ${
                centerIndex === i ? 'border-brand bg-brand/15' : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              牌 {i + 1}
            </button>
          ))}
        </div>
        <button onClick={() => act('nightAction', { centerIndex })} className="btn-primary mt-4 w-full">
          查看
        </button>
      </div>
    )
  }

  if (role === 'seer') {
    return (
      <div className="card px-4 py-4">
        <p className="text-[13.5px] text-white/60">查看一名玩家的身份，或两张中央牌</p>
        <div className="mt-3">
          <PlayerGrid members={others} myId={myId} selectedId={targetId} onSelect={setTargetId} compact />
        </div>
        <button
          disabled={!targetId}
          onClick={() => act('nightAction', { targetId })}
          className="btn-primary mt-3 w-full"
        >
          查看 TA 的身份
        </button>
        <div className="hairline my-3" />
        <p className="text-[12.5px] text-white/40">或者查看中央牌 {centerIndex + 1}、{centerIndex + 2}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {s.center.slice(0, 2).map((_, i) => (
            <button
              key={i}
              onClick={() => setCenterIndex(i)}
              className={`h-12 rounded-xl border text-[12.5px] ${
                centerIndex === i ? 'border-brand bg-brand/15' : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              第 {i + 1} 组
            </button>
          ))}
        </div>
        <button onClick={() => act('nightAction', { centerIndex })} className="btn-ghost mt-2 w-full">
          改为查看中央牌
        </button>
      </div>
    )
  }

  if (role === 'robber') {
    return (
      <div className="card px-4 py-4">
        <p className="text-[13.5px] text-white/60">与一名玩家交换身份，并查看你的新身份</p>
        <div className="mt-3">
          <PlayerGrid members={others} myId={myId} selectedId={targetId} onSelect={setTargetId} compact />
        </div>
        <button
          disabled={!targetId}
          onClick={() => act('nightAction', { targetId, swap: true })}
          className="btn-primary mt-3 w-full"
        >
          交换并查看
        </button>
        <button onClick={() => act('nightAction', { swap: false })} className="btn-ghost mt-2 w-full">
          不交换
        </button>
      </div>
    )
  }

  if (role === 'troublemaker') {
    return (
      <div className="card px-4 py-4">
        <p className="text-[13.5px] text-white/60">交换另外两名玩家的身份（不能查看）</p>
        <div className="mt-2 text-[12px] text-white/40">先选第一个人</div>
        <div className="mt-1.5">
          <PlayerGrid
            members={others}
            myId={myId}
            selectedId={targetId}
            onSelect={setTargetId}
            compact
            disabledIds={targetBId ? [targetBId] : []}
          />
        </div>
        <div className="mt-2 text-[12px] text-white/40">再选第二个人</div>
        <div className="mt-1.5">
          <PlayerGrid
            members={others}
            myId={myId}
            selectedId={targetBId}
            onSelect={setTargetBId}
            compact
            disabledIds={targetId ? [targetId] : []}
          />
        </div>
        <button
          disabled={!targetId || !targetBId}
          onClick={() => act('nightAction', { targetId, targetBId })}
          className="btn-primary mt-3 w-full"
        >
          交换他们
        </button>
      </div>
    )
  }

  if (role === 'drunk') {
    return (
      <div className="card px-4 py-4">
        <p className="text-[13.5px] text-white/60">你必须与一张中央牌交换身份，且不会知道新身份</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {s.center.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenterIndex(i)}
              className={`h-16 rounded-xl border ${centerIndex === i ? 'border-brand bg-brand/15' : 'border-white/10 bg-white/[0.03]'}`}
            >
              <Avatar seed={String(i)} nickname={`牌${i + 1}`} size={26} />
              <div className="mt-1 text-[11.5px] text-white/50">牌 {i + 1}</div>
            </button>
          ))}
        </div>
        <button onClick={() => act('nightAction', { centerIndex })} className="btn-primary mt-4 w-full">
          就是它了
        </button>
      </div>
    )
  }

  if (role === 'insomniac') {
    return (
      <div className="card px-4 py-4 text-center">
        <p className="text-[13.5px] text-white/60">查看你此刻的身份</p>
        <button onClick={() => act('nightAction', {})} className="btn-primary mt-4 w-full">
          查看
        </button>
      </div>
    )
  }

  return (
    <div className="card px-4 py-4 text-center">
      <p className="text-[13.5px] text-white/60">{role ? WOLF_ROLE_DESC[role] : ''}</p>
      <button onClick={() => act('nightAction', {})} className="btn-primary mt-4 w-full">
        闭眼
      </button>
    </div>
  )
}
