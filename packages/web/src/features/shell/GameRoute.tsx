import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GAME_MAP, type Room } from '@pg/shared'
import { ChevronLeft, HelpCircle, Loader2, RotateCcw, ArrowLeft } from 'lucide-react'
import { Sheet, TimerRing, sfx } from '../../lib/ui'
import { loadIdentity, useRoom } from '../../lib/client'
import SpyGame from '../games/SpyGame'
import DrawGame from '../games/DrawGame'
import SpectrumGame from '../games/SpectrumGame'
import TruthGame from '../games/TruthGame'
import WolfGame from '../games/WolfGame'

export interface GameProps {
  room: Room
  myId: string
  priv: Record<string, unknown> | null
  act: (kind: string, extra?: Record<string, unknown>) => void
  send: (msg: { t: string; payload?: unknown }) => void
}

const seenKey = (id: string) => `pg.rules.${id}`

export default function GameRoute() {
  const { code = '' } = useParams()
  const nav = useNavigate()
  const { status, room, myId, priv, connect, disconnect, send, act, error } = useRoom()
  const [rulesOpen, setRulesOpen] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  useEffect(() => {
    connect(code, loadIdentity())
    return () => disconnect()
  }, [code, connect, disconnect])

  const gameId = room?.gameId ?? null
  const meta = gameId ? GAME_MAP[gameId] : undefined

  // 首次玩某款游戏时强制展示规则
  useEffect(() => {
    if (!gameId) return
    const seen = localStorage.getItem(seenKey(gameId))
    if (!seen) {
      setRulesOpen(true)
      localStorage.setItem(seenKey(gameId), '1')
    }
  }, [gameId])

  // 回到大厅
  useEffect(() => {
    if (room && room.phase === 'lobby' && !room.gameId) nav(`/room/${code}`, { replace: true })
  }, [room?.phase, room?.gameId, code, nav])

  const members = useMemo(() => room?.members ?? [], [room?.members])
  const isHost = room?.members.find((m) => m.id === myId)?.isHost ?? false

  if (!room || !gameId || !meta) {
    return (
      <div className="app-shell items-center justify-center gap-3">
        <Loader2 className="animate-spin text-white/40" size={26} />
        <p className="text-[13px] text-white/40">
          {status === 'reconnecting' || status === 'closed' ? '正在重连…' : '正在进入对局…'}
        </p>
        {error && <p className="text-[13px] text-[#FF8080]">{error}</p>}
      </div>
    )
  }

  const state = room.gameState as { phase?: string; phaseEndsAt?: number | null } | null
  const finished = state?.phase === 'result'

  const GameComponent =
    gameId === 'spy'
      ? SpyGame
      : gameId === 'draw'
        ? DrawGame
        : gameId === 'spectrum'
          ? SpectrumGame
          : gameId === 'truth'
            ? TruthGame
            : WolfGame

  return (
    <div className="app-shell">
      <header className="flex items-center justify-between py-1">
        <button
          onClick={() => setConfirmLeave(true)}
          className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05]"
          aria-label="返回"
        >
          <ChevronLeft size={19} className="text-white/65" />
        </button>
        <div className="text-center">
          <div className="text-[15px] font-medium">{meta.name}</div>
          <div className="text-[11.5px] text-white/35">
            {members.length} 人 · {room.code}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <TimerRing endsAt={state?.phaseEndsAt ?? null} size={38} />
          <button
            onClick={() => setRulesOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05]"
            aria-label="规则"
          >
            <HelpCircle size={17} className="text-white/65" />
          </button>
        </div>
      </header>

      <div className="mt-3 flex-1">
        <GameComponent room={room} myId={myId ?? ''} priv={priv} act={act} send={send} />
      </div>

      {finished && (
        <div className="dock space-y-2">
          {isHost && (
            <button
              onClick={() => {
                sfx.select()
                send({ t: 'startGame', payload: { gameId } })
              }}
              className="btn-primary w-full"
            >
              <RotateCcw size={17} />
              再来一局
            </button>
          )}
          <button
            onClick={() => {
              if (isHost) send({ t: 'endGame' })
              else nav(`/room/${code}`)
            }}
            className="btn-ghost w-full"
          >
            <ArrowLeft size={17} />
            换一款游戏
          </button>
        </div>
      )}

      <RulesSheet open={rulesOpen} onClose={() => setRulesOpen(false)} meta={meta} />

      <Sheet open={confirmLeave} onClose={() => setConfirmLeave(false)} title="离开对局？">
        <p className="py-2 text-[13.5px] leading-relaxed text-white/55">
          这局还在进行中。离开后本局会结束，房间里其他人会回到大厅。
        </p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setConfirmLeave(false)} className="btn-ghost flex-1">
            继续玩
          </button>
          <button
            onClick={() => {
              send({ t: 'endGame' })
              nav(`/room/${code}`)
            }}
            className="btn flex-1 bg-[#FF6B6B]/85 text-white"
          >
            确认离开
          </button>
        </div>
      </Sheet>
    </div>
  )
}

function RulesSheet({
  open,
  onClose,
  meta,
}: {
  open: boolean
  onClose: () => void
  meta: { name: string; subtitle: string; rules: { icon: string; title: string; desc: string }[]; minPlayers: number; maxPlayers: number; durationMin: number; bestPlayers: [number, number] }
}) {
  return (
    <Sheet open={open} onClose={onClose} title={`${meta.name} · 玩法`}>
      <p className="text-[13px] leading-relaxed text-white/50">{meta.subtitle}</p>
      <div className="mt-4 space-y-3">
        {meta.rules.map((r, i) => (
          <div key={r.title} className="flex gap-3">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/20 text-[12px] font-medium text-brand-soft">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-medium">{r.title}</div>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-white/50">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="hairline my-4" />
      <div className="flex gap-2 text-center">
        {[
          { label: '人数', value: `${meta.minPlayers}-${meta.maxPlayers}` },
          { label: '最佳', value: `${meta.bestPlayers[0]}-${meta.bestPlayers[1]}` },
          { label: '时长', value: `${meta.durationMin} 分钟` },
        ].map((s) => (
          <div key={s.label} className="flex-1 rounded-xl bg-white/[0.04] py-2.5">
            <div className="text-[15px] font-medium">{s.value}</div>
            <div className="mt-0.5 text-[11px] text-white/35">{s.label}</div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="btn-primary mt-5 w-full">
        知道了
      </button>
    </Sheet>
  )
}
