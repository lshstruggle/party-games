import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GAMES, normalizeRoomCode } from '@pg/shared'
import { ArrowRight, Dices, Plus, Volume2, VolumeX, Wifi } from 'lucide-react'
import { Avatar, Sheet, isSoundOn, setSoundOn, sfx } from '../lib/ui'
import { createRoom, checkRoom, loadIdentity, saveProfile } from '../lib/client'

export default function Home() {
  const nav = useNavigate()
  const [identity, setIdentity] = useState(() => loadIdentity())
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [sound, setSound] = useState(isSoundOn())

  const go = async (target: string) => {
    setBusy(true)
    setError('')
    try {
      nav(`/room/${target}`)
    } finally {
      setBusy(false)
    }
  }

  const onCreate = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      sfx.select()
      const newCode = await createRoom()
      await go(newCode)
    } catch {
      setError('创建房间失败，请检查网络后重试')
    } finally {
      setBusy(false)
    }
  }

  const onJoin = async () => {
    const c = normalizeRoomCode(code)
    if (c.length !== 4) {
      setError('房间码是 4 位字母数字')
      return
    }
    setBusy(true)
    setError('')
    try {
      const info = await checkRoom(c)
      if (!info.exists) {
        setError('找不到这个房间，请确认房间码')
        return
      }
      sfx.select()
      await go(c)
    } catch {
      setError('网络异常，请重试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell pb-10">
      {/* 头部 */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent text-[15px] font-medium">
            聚
          </div>
          <div>
            <h1 className="text-[17px] font-medium leading-tight">聚好玩</h1>
            <p className="text-[11.5px] leading-tight text-white/40">朋友聚会的联机游戏站</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSound(!sound)
              setSoundOn(!sound)
              if (!sound) sfx.select()
            }}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05]"
            aria-label="音效开关"
          >
            {sound ? <Volume2 size={16} className="text-white/65" /> : <VolumeX size={16} className="text-white/35" />}
          </button>
          <button onClick={() => setProfileOpen(true)} className="flex items-center gap-2 rounded-xl bg-white/[0.05] py-1 pl-1 pr-2.5">
            <Avatar seed={identity.avatarSeed} nickname={identity.nickname} size={28} />
            <span className="max-w-[92px] truncate text-[13px] text-white/75">{identity.nickname}</span>
          </button>
        </div>
      </header>

      {/* 主操作 */}
      <section className="mt-7">
        <p className="text-[13px] leading-relaxed text-white/45">
          大家各自拿手机进同一个房间，手机就是你的牌。不用下载、不用注册、不用主持人。
        </p>

        <button onClick={onCreate} disabled={busy} className="btn-primary mt-5 w-full py-4 text-[16px]">
          <Plus size={19} />
          {busy ? '正在创建…' : '创建房间'}
        </button>

        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
              placeholder="输入 4 位房间码"
              className="h-[52px] w-full rounded-btn border border-white/10 bg-white/[0.04] px-4 text-[16px] tracking-[0.32em] placeholder:tracking-normal placeholder:text-white/25"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
            />
          </div>
          <button onClick={onJoin} disabled={busy} className="btn-ghost h-[52px] px-5">
            加入
            <ArrowRight size={17} />
          </button>
        </div>

        {error && <p className="mt-2.5 text-[13px] text-[#FF8080]">{error}</p>}
      </section>

      {/* 游戏墙 */}
      <section className="mt-9">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[15px] font-medium">游戏库</h2>
          <span className="text-[12px] text-white/35">共 {GAMES.length} 款</span>
        </div>
        <div className="mt-3 space-y-2.5">
          {GAMES.map((g, i) => (
            <button
              key={g.id}
              onClick={onCreate}
              className="card-hi flex w-full items-center gap-3.5 p-3.5 text-left transition-transform active:scale-[0.985]"
              style={{ animation: `fadeUp 320ms ease-out ${i * 55}ms both` }}
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
                  <span className="text-[11.5px] text-white/35">
                    {g.minPlayers}-{g.maxPlayers}人 · {g.durationMin}分钟
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[12.5px] text-white/45">{g.subtitle}</p>
                <div className="mt-1.5 flex gap-1.5">
                  {g.tags.map((t) => (
                    <span key={t} className="chip !px-2 !py-0.5 !text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 工具箱 */}
      <button
        onClick={() => nav('/tools')}
        className="card mt-3 flex w-full items-center gap-3 p-3.5 text-left transition-transform active:scale-[0.985]"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[0.07]">
          <Dices size={20} className="text-white/70" />
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-medium">工具箱</h3>
          <p className="mt-0.5 text-[12.5px] text-white/45">转盘 · 骰子 · 分队 · 计分板 · 谁买单</p>
        </div>
        <ArrowRight size={17} className="text-white/25" />
      </button>

      <footer className="mt-8 flex items-center justify-center gap-1.5 text-[11.5px] text-white/25">
        <Wifi size={12} />
        建议所有人连同一个 Wi-Fi，延迟更低
      </footer>

      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        identity={identity}
        onSave={(nickname, avatarSeed) => {
          saveProfile(nickname, avatarSeed)
          setIdentity({ ...identity, nickname, avatarSeed })
          setProfileOpen(false)
        }}
      />
    </div>
  )
}

function ProfileSheet({
  open,
  onClose,
  identity,
  onSave,
}: {
  open: boolean
  onClose: () => void
  identity: { nickname: string; avatarSeed: string }
  onSave: (nickname: string, avatarSeed: string) => void
}) {
  const [nickname, setNickname] = useState(identity.nickname)
  const [seed, setSeed] = useState(identity.avatarSeed)

  return (
    <Sheet open={open} onClose={onClose} title="我的资料">
      <div className="flex flex-col items-center gap-3 py-2">
        <Avatar seed={seed} nickname={nickname || '玩'} size={72} />
        <button
          onClick={() => setSeed(Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'))}
          className="text-[13px] text-brand-soft"
        >
          换一个头像
        </button>
      </div>
      <label className="label mt-4 block">昵称</label>
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value.slice(0, 12))}
        className="mt-1.5 h-12 w-full rounded-btn border border-white/10 bg-white/[0.04] px-4 text-[15px]"
        maxLength={12}
      />
      <button
        onClick={() => onSave(nickname.trim() || '玩家', seed)}
        className="btn-primary mt-5 w-full"
      >
        保存
      </button>
    </Sheet>
  )
}
