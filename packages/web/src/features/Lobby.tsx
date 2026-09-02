import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GAMES, GAME_MAP, type GameId } from '@pg/shared'
import { Check, Copy, Crown, Loader2, Play, Settings2, Sparkles, UserMinus, Volume2, VolumeX } from 'lucide-react'
import { Avatar, Sheet, TimerRing, isSoundOn, setSoundOn, sfx } from '../lib/ui'
import { loadIdentity, useRoom } from '../lib/client'

export default function Lobby() {
  const { code = '' } = useParams()
  const nav = useNavigate()
  const { status, room, myId, connect, disconnect, send, error } = useRoom()
  const [copied, setCopied] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sound, setSound] = useState(isSoundOn())

  useEffect(() => {
    connect(code, loadIdentity())
    return () => disconnect()
  }, [code, connect, disconnect])

  // 房间里已经在游戏中 → 直接进入对局
  useEffect(() => {
    if (room?.gameId && room.phase === 'playing') nav(`/play/${code}`, { replace: true })
  }, [room?.gameId, room?.phase, code, nav])

  const me = room?.members.find((m) => m.id === myId) ?? null
  const isHost = me?.isHost ?? false
  const count = room?.members.length ?? 0

  const recommendation = useMemo(() => {
    return (gameId: GameId) => {
      const g = GAME_MAP[gameId]
      if (!g) return { label: '', tone: 'muted' as const }
      if (count < g.minPlayers) return { label: `还差 ${g.minPlayers - count} 人`, tone: 'muted' as const }
      if (count > g.maxPlayers) return { label: '人太多', tone: 'muted' as const }
      if (count >= g.bestPlayers[0] && count <= g.bestPlayers[1]) return { label: '人数正好', tone: 'good' as const }
      return { label: '可以玩', tone: 'ok' as const }
    }
  }, [count])

  if (!room) {
    return (
      <div className="app-shell items-center justify-center gap-3">
        <Loader2 className="animate-spin text-white/40" size={26} />
        <p className="text-[13px] text-white/40">
          {status === 'reconnecting' ? '正在重连…' : status === 'closed' ? '连接已断开，正在重试…' : '正在进入房间…'}
        </p>
        {error && <p className="text-[13px] text-[#FF8080]">{error}</p>}
      </div>
    )
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code)
      setCopied(true)
      sfx.select()
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* 剪贴板不可用则忽略 */
    }
  }

  const playable = GAMES.filter((g) => count >= g.minPlayers && count <= g.maxPlayers)

  return (
    <div className="app-shell">
      {/* 房间码 */}
      <section className="card-hi mt-1 p-5 text-center">
        <p className="label">房间码 · 让朋友输入加入</p>
        <button onClick={copyCode} className="mt-2 flex w-full items-center justify-center gap-2.5">
          <span className="num text-[40px] font-medium tracking-[0.16em]">{room.code}</span>
          {copied ? <Check size={20} className="text-mint" /> : <Copy size={18} className="text-white/35" />}
        </button>
        <div className="mt-3 flex items-center justify-center gap-3 text-[12px] text-white/40">
          <span>{count} 人在房间</span>
          <span className="h-3 w-px bg-white/10" />
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${status === 'open' ? 'bg-mint' : 'bg-amber'}`} />
            {status === 'open' ? '已连接' : '连接中'}
          </span>
          {room.settings.spice === 'spicy' && (
            <>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-accent">微辣</span>
            </>
          )}
        </div>
      </section>

      {/* 成员 */}
      <section className="mt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-medium">房间里的人</h2>
          <button
            onClick={() => {
              const next = !sound
              setSound(next)
              setSoundOn(next)
              if (next) sfx.select()
            }}
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05]"
          >
            {sound ? <Volume2 size={15} className="text-white/60" /> : <VolumeX size={15} className="text-white/30" />}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {room.members.map((m, i) => (
            <div
              key={m.id}
              className="relative flex w-[76px] flex-col items-center gap-1.5"
              style={{ animation: `popIn 260ms cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms both` }}
            >
              <Avatar seed={m.avatarSeed} nickname={m.nickname} size={48} ring={m.isHost} dim={!m.online} />
              {m.isHost && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-amber text-ink-900">
                  <Crown size={11} />
                </span>
              )}
              <span className={`w-full truncate text-center text-[11.5px] ${m.id === myId ? 'text-brand-soft' : 'text-white/60'}`}>
                {m.nickname}
              </span>
              {isHost && !m.isHost && (
                <button
                  onClick={() => send({ t: 'kick', payload: { memberId: m.id } })}
                  className="absolute -left-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-ink-600 text-white/50"
                  aria-label="移出"
                >
                  <UserMinus size={10} />
                </button>
              )}
            </div>
          ))}
          {Array.from({ length: Math.max(0, Math.min(4, 4 - room.members.length)) }).map((_, i) => (
            <div key={`ph-${i}`} className="flex w-[76px] flex-col items-center gap-1.5 opacity-30">
              <div className="h-12 w-12 rounded-full border border-dashed border-white/25" />
              <span className="text-[11.5px] text-white/40">空位</span>
            </div>
          ))}
        </div>
      </section>

      {/* 选游戏 */}
      <section className="mt-6">
        <h2 className="text-[15px] font-medium">选一款开始</h2>
        <div className="mt-3 space-y-2.5">
          {GAMES.map((g, i) => {
            const rec = recommendation(g.id)
            const disabled = count < g.minPlayers || count > g.maxPlayers
            return (
              <button
                key={g.id}
                disabled={!isHost || disabled}
                onClick={() => {
                  sfx.select()
                  send({ t: 'startGame', payload: { gameId: g.id } })
                }}
                className={`card flex w-full items-center gap-3.5 p-3.5 text-left transition-all ${
                  disabled ? 'opacity-40' : isHost ? 'active:scale-[0.985]' : ''
                }`}
                style={{ animation: `fadeUp 300ms ease-out ${i * 45}ms both` }}
              >
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[17px] font-medium text-white"
                  style={{ background: `linear-gradient(135deg, ${g.accent}, ${g.accent}88)` }}
                >
                  {g.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-medium">{g.name}</h3>
                    <span
                      className={`text-[11px] ${
                        rec.tone === 'good' ? 'text-mint' : rec.tone === 'ok' ? 'text-white/40' : 'text-amber'
                      }`}
                    >
                      {rec.label}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-white/45">{g.subtitle}</p>
                  <p className="mt-1 text-[11.5px] text-white/30">
                    最佳 {g.bestPlayers[0]}-{g.bestPlayers[1]} 人 · 约 {g.durationMin} 分钟
                  </p>
                </div>
                {isHost && !disabled && <Play size={16} className="shrink-0 text-white/30" />}
              </button>
            )
          })}
        </div>
        {!isHost && (
          <p className="mt-3 text-center text-[12.5px] text-white/35">等待房主开始游戏…</p>
        )}
        {isHost && playable.length === 0 && count > 0 && (
          <p className="mt-3 text-center text-[12.5px] text-amber">当前人数还没有合适的游戏，再叫几个人来吧</p>
        )}
      </section>

      <div className="h-6" />

      <div className="dock">
        {isHost ? (
          <button onClick={() => setSettingsOpen(true)} className="btn-ghost w-full">
            <Settings2 size={17} />
            房间设置
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2 text-[13px] text-white/40">
            <Sparkles size={15} />
            房主开始后自动进入游戏
          </div>
        )}
      </div>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        spice={room.settings.spice}
        onSpice={(spice) => send({ t: 'updateSettings', payload: { spice } })}
        onEnd={() => nav('/')}
      />
    </div>
  )
}

function SettingsSheet({
  open,
  onClose,
  spice,
  onSpice,
  onEnd,
}: {
  open: boolean
  onClose: () => void
  spice: 'mild' | 'spicy'
  onSpice: (s: 'mild' | 'spicy') => void
  onEnd: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title="房间设置">
      <div className="py-1">
        <label className="label">内容尺度</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(
            [
              { id: 'mild', name: '温和', desc: '全年龄友好，长辈小孩在场也能玩' },
              { id: 'spicy', name: '微辣', desc: '含八卦与社死题，房间码会显示标记' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSpice(opt.id)}
              className={`rounded-2xl border p-3 text-left transition-all ${
                spice === opt.id ? 'border-brand bg-brand/12' : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="text-[14px] font-medium">{opt.name}</div>
              <div className="mt-1 text-[11.5px] leading-relaxed text-white/45">{opt.desc}</div>
            </button>
          ))}
        </div>

        <div className="hairline my-5" />

        <button
          onClick={onEnd}
          className="btn-ghost w-full !text-[#FF8080]"
        >
          解散并返回首页
        </button>
        <p className="mt-2 text-center text-[11.5px] text-white/25">所有人退出后房间会在 30 分钟后自动回收</p>
      </div>
    </Sheet>
  )
}

export { TimerRing }
