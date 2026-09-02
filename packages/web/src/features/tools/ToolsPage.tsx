import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Dices,
  Minus,
  Plus,
  RotateCcw,
  Shuffle,
  Target,
  Trash2,
  Users,
  Calculator,
} from 'lucide-react'
import { Wheel } from '../../components/visuals'
import { Avatar, Sheet, buzz, isSoundOn, sfx } from '../../lib/ui'
import { loadIdentity } from '../../lib/client'

type ToolId = 'wheel' | 'dice' | 'teams' | 'score' | 'punish'

const TOOLS: { id: ToolId; name: string; desc: string; icon: JSX.Element; color: string }[] = [
  { id: 'wheel', name: '随机转盘', desc: '点菜、选人、决定谁买单', icon: <Target size={20} />, color: '#7C5CFF' },
  { id: 'dice', name: '骰子', desc: '支持 1-6 颗，多种面数', icon: <Dices size={20} />, color: '#FF6B9D' },
  { id: 'teams', name: '随机分队', desc: '输入名单自动分组', icon: <Users size={20} />, color: '#2BD9A0' },
  { id: 'score', name: '计分板', desc: '任意游戏通用，可撤销', icon: <Calculator size={20} />, color: '#FFB020' },
  { id: 'punish', name: '惩罚生成器', desc: '三档强度，输了的来一个', icon: <Shuffle size={20} />, color: '#378ADD' },
]

const DEFAULT_WHEEL = ['谁来买单', '谁来表演', '吃什么', '再来一局', '随便你', '下一位']

export default function ToolsPage() {
  const nav = useNavigate()
  const [active, setActive] = useState<ToolId | null>(null)

  return (
    <div className="app-shell">
      <header className="flex items-center gap-3 py-1">
        <button onClick={() => nav('/')} className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05]">
          <ArrowLeft size={19} className="text-white/65" />
        </button>
        <div>
          <h1 className="text-[16px] font-medium leading-tight">工具箱</h1>
          <p className="text-[11.5px] text-white/40">不用进房间也能用</p>
        </div>
      </header>

      <div className="mt-5 space-y-2.5">
        {TOOLS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="card-hi flex w-full items-center gap-3.5 p-3.5 text-left transition-transform active:scale-[0.985]"
            style={{ animation: `fadeUp 300ms ease-out ${i * 50}ms both` }}
          >
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white"
              style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}
            >
              {t.icon}
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-medium">{t.name}</div>
              <p className="mt-0.5 text-[12.5px] text-white/45">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <Sheet open={active !== null} onClose={() => setActive(null)} hideClose>
        {active === 'wheel' && <WheelTool onClose={() => setActive(null)} />}
        {active === 'dice' && <DiceTool onClose={() => setActive(null)} />}
        {active === 'teams' && <TeamsTool onClose={() => setActive(null)} />}
        {active === 'score' && <ScoreTool onClose={() => setActive(null)} />}
        {active === 'punish' && <PunishTool onClose={() => setActive(null)} />}
      </Sheet>
    </div>
  )
}

function ToolHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between pb-3 pt-1">
      <h3 className="text-[16px] font-medium">{title}</h3>
      <button onClick={onClose} className="rounded-full bg-white/[0.06] px-3 py-1 text-[12.5px] text-white/60">
        完成
      </button>
    </div>
  )
}

// ==================== 转盘 ====================

function WheelTool({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<string[]>(() => {
    const raw = localStorage.getItem('pg.tool.wheel')
    return raw ? (JSON.parse(raw) as string[]) : DEFAULT_WHEEL
  })
  const [draft, setDraft] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)

  useEffect(() => {
    localStorage.setItem('pg.tool.wheel', JSON.stringify(items))
  }, [items])

  const spin = () => {
    if (spinning || items.length < 2) return
    const idx = Math.floor(Math.random() * items.length)
    setResult(idx)
    setSpinning(true)
    if (isSoundOn()) sfx.tick()
    buzz(20)
  }

  return (
    <div>
      <ToolHeader title="随机转盘" onClose={onClose} />
      <div className="flex flex-col items-center py-2">
        <Wheel
          items={items}
          spinTo={result ?? 0}
          spinning={spinning}
          size={264}
          turns={6}
          durationMs={3800}
          onDone={() => {
            setSpinning(false)
            sfx.reveal()
            buzz([20, 50, 20])
          }}
        />
        {!spinning && result !== null && (
          <div className="mt-4 text-center" style={{ animation: 'popIn 280ms cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <p className="label">结果是</p>
            <p className="mt-1 text-[26px] font-medium text-brand-soft">{items[result]}</p>
          </div>
        )}
        <button onClick={spin} disabled={spinning || items.length < 2} className="btn-primary mt-5 w-full">
          {spinning ? '转动中…' : '开始转'}
        </button>
      </div>

      <div className="hairline my-4" />
      <label className="label">选项（{items.length}）</label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <button
            key={`${it}-${i}`}
            onClick={() => setItems(items.filter((_, idx) => idx !== i))}
            className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/75"
          >
            {it}
            <Trash2 size={12} className="text-white/30" />
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 10))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              setItems([...items, draft.trim()])
              setDraft('')
            }
          }}
          placeholder="加一个选项"
          className="h-12 flex-1 rounded-btn border border-white/10 bg-white/[0.04] px-4 text-[15px] placeholder:text-white/25"
        />
        <button
          onClick={() => {
            if (!draft.trim()) return
            setItems([...items, draft.trim()])
            setDraft('')
          }}
          className="btn-ghost px-4"
        >
          <Plus size={17} />
        </button>
      </div>
      <button onClick={() => setItems(DEFAULT_WHEEL)} className="btn-ghost mt-2 w-full !text-[13px]">
        恢复默认
      </button>
    </div>
  )
}

// ==================== 骰子 ====================

const DICE_TYPES = [4, 6, 8, 12, 20]

function DiceTool({ onClose }: { onClose: () => void }) {
  const [count, setCount] = useState(2)
  const [faces, setFaces] = useState(6)
  const [values, setValues] = useState<number[]>([3, 5])
  const [rolling, setRolling] = useState(false)

  const roll = () => {
    if (rolling) return
    setRolling(true)
    buzz(18)
    let ticks = 0
    const id = setInterval(() => {
      ticks += 1
      setValues(Array.from({ length: count }, () => 1 + Math.floor(Math.random() * faces)))
      if (ticks > 8) {
        clearInterval(id)
        setRolling(false)
        sfx.reveal()
        buzz(24)
      }
    }, 70)
  }

  const total = values.reduce((a, b) => a + b, 0)

  return (
    <div>
      <ToolHeader title="骰子" onClose={onClose} />
      <div className="flex flex-wrap justify-center gap-3 py-6">
        {values.map((v, i) => (
          <div
            key={i}
            className="grid h-[74px] w-[74px] place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02]"
            style={{ animation: rolling ? 'none' : `popIn 260ms cubic-bezier(0.34,1.56,0.64,1) ${i * 50}ms both` }}
          >
            <span className="num text-[30px] font-medium">{v}</span>
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="text-center">
          <span className="text-[13px] text-white/40">合计 </span>
          <span className="num text-[22px] font-medium text-brand-soft">{total}</span>
        </div>
      )}

      <button onClick={roll} disabled={rolling} className="btn-primary mt-5 w-full">
        <Dices size={18} />
        {rolling ? '投掷中…' : '投掷'}
      </button>

      <div className="hairline my-4" />
      <label className="label">骰子数量</label>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={() => setCount(Math.max(1, count - 1))} className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.05]">
          <Minus size={17} />
        </button>
        <div className="num flex-1 text-center text-[19px] font-medium">{count}</div>
        <button onClick={() => setCount(Math.min(6, count + 1))} className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.05]">
          <Plus size={17} />
        </button>
      </div>

      <label className="label mt-4">面数</label>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {DICE_TYPES.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFaces(f)
              setValues(Array.from({ length: count }, () => 1 + Math.floor(Math.random() * f)))
            }}
            className={`h-11 rounded-xl border text-[14px] ${
              faces === f ? 'border-brand bg-brand/15 text-brand-soft' : 'border-white/10 bg-white/[0.03] text-white/60'
            }`}
          >
            d{f}
          </button>
        ))}
      </div>
    </div>
  )
}

// ==================== 分队 ====================

function TeamsTool({ onClose }: { onClose: () => void }) {
  const [names, setNames] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState<string[][]>([])

  const add = () => {
    const n = draft.trim()
    if (!n) return
    setNames([...names, n])
    setDraft('')
  }

  const shuffleTeams = () => {
    if (names.length < 2) return
    const pool = [...names]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const n = Math.max(2, Math.min(teamCount, names.length))
    const out: string[][] = Array.from({ length: n }, () => [])
    pool.forEach((name, i) => out[i % n].push(name))
    setTeams(out)
    sfx.reveal()
    buzz(22)
  }

  return (
    <div>
      <ToolHeader title="随机分队" onClose={onClose} />

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 12))}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="输入名字后回车"
          className="h-12 flex-1 rounded-btn border border-white/10 bg-white/[0.04] px-4 text-[15px] placeholder:text-white/25"
        />
        <button onClick={add} className="btn-ghost px-4">
          <Plus size={17} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {names.map((n, i) => (
          <button
            key={`${n}-${i}`}
            onClick={() => setNames(names.filter((_, idx) => idx !== i))}
            className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[13px]"
          >
            {n}
            <Trash2 size={12} className="text-white/30" />
          </button>
        ))}
      </div>

      <label className="label mt-4">分成几队</label>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={() => setTeamCount(Math.max(2, teamCount - 1))} className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.05]">
          <Minus size={17} />
        </button>
        <div className="num flex-1 text-center text-[19px] font-medium">{teamCount}</div>
        <button onClick={() => setTeamCount(Math.min(6, teamCount + 1))} className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.05]">
          <Plus size={17} />
        </button>
      </div>

      <button onClick={shuffleTeams} disabled={names.length < 2} className="btn-primary mt-4 w-full">
        <Shuffle size={17} />
        开始分队
      </button>

      {teams.length > 0 && (
        <div className="mt-4 space-y-2">
          {teams.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/[0.04] p-3"
              style={{ animation: `fadeUp 280ms ease-out ${i * 70}ms both` }}
            >
              <div className="text-[12px] text-white/40">第 {i + 1} 队 · {t.length} 人</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {t.map((n) => (
                  <span key={n} className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[13px]">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <button onClick={shuffleTeams} className="btn-ghost w-full">
            <RotateCcw size={16} />
            重新分
          </button>
        </div>
      )}
    </div>
  )
}

// ==================== 计分板 ====================

function ScoreTool({ onClose }: { onClose: () => void }) {
  const [players, setPlayers] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [history, setHistory] = useState<{ name: string; delta: number }[]>([])

  const add = () => {
    const n = draft.trim()
    if (!n || players.includes(n)) return
    setPlayers([...players, n])
    setScores({ ...scores, [n]: 0 })
    setDraft('')
  }

  const change = (name: string, delta: number) => {
    setScores({ ...scores, [name]: (scores[name] ?? 0) + delta })
    setHistory([{ name, delta }, ...history].slice(0, 40))
    if (isSoundOn()) sfx.tick()
  }

  const undo = () => {
    const [last, ...rest] = history
    if (!last) return
    setScores({ ...scores, [last.name]: (scores[last.name] ?? 0) - last.delta })
    setHistory(rest)
  }

  const ranked = useMemo(() => [...players].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0)), [players, scores])

  return (
    <div>
      <ToolHeader title="计分板" onClose={onClose} />

      {players.length === 0 ? (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 12))}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="先加几个玩家"
            className="h-12 flex-1 rounded-btn border border-white/10 bg-white/[0.04] px-4 text-[15px] placeholder:text-white/25"
          />
          <button onClick={add} className="btn-ghost px-4">
            <Plus size={17} />
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {ranked.map((name, i) => (
              <div key={name} className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2.5">
                <span className={`w-5 text-center text-[12px] ${i === 0 ? 'text-amber' : 'text-white/30'}`}>{i + 1}</span>
                <Avatar seed={name} nickname={name} size={28} />
                <span className="flex-1 truncate text-[14px]">{name}</span>
                <button onClick={() => change(name, -1)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05]">
                  <Minus size={14} />
                </button>
                <span className="num w-8 text-center text-[17px] font-medium">{scores[name] ?? 0}</span>
                <button onClick={() => change(name, 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-brand/25">
                  <Plus size={14} className="text-brand-soft" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 12))}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="加玩家"
              className="h-11 flex-1 rounded-btn border border-white/10 bg-white/[0.04] px-4 text-[14px] placeholder:text-white/25"
            />
            <button onClick={add} className="btn-ghost px-4">
              <Plus size={16} />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={undo} disabled={history.length === 0} className="btn-ghost flex-1">
              <RotateCcw size={16} />
              撤销
            </button>
            <button
              onClick={() => {
                setScores(Object.fromEntries(players.map((p) => [p, 0])))
                setHistory([])
              }}
              className="btn-ghost flex-1"
            >
              清零
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ==================== 惩罚生成器 ====================

const PUNISHMENTS: Record<'light' | 'mid' | 'hard', string[]> = {
  light: [
    '给旁边的人一个真诚的夸奖',
    '学三种动物叫，让大家猜',
    '用播音腔念一段手机上的文字',
    '做十个深蹲',
    '唱一首歌的副歌',
    '给在场每个人倒一次水',
    '用屁股写自己的名字',
    '模仿在场一个人的口头禅',
  ],
  mid: [
    '让右边的人给你换一个发型，保持到聚会结束',
    '在群里发一条「我今天超开心」',
    '给通讯录里第五个人发一句「想你了」',
    '用最肉麻的语气对在场某人说一段话',
    '公开手机相册里最后一张自拍',
    '给大家表演你起床的全过程',
    '学五个不同国家的打招呼方式',
    '让大家选一个人，你给 TA 做一分钟肩颈按摩',
  ],
  hard: [
    '让在场的人给你拍一张最丑的照片并发群里',
    '给最近联系的一个人发一条「我们见一面吧」',
    '公开你购物车里的第一件商品',
    '让大家决定你接下来十分钟必须说的话的口头禅',
    '模仿在场每一个人说话，直到大家猜出模仿的是谁',
    '现场编一段关于今天聚会的 rap',
    '让左边的人在你的手机里挑一首歌，外放给大家听',
  ],
}

function PunishTool({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<'light' | 'mid' | 'hard'>('light')
  const [text, setText] = useState<string | null>(null)
  const identity = loadIdentity()

  const draw = () => {
    const pool = PUNISHMENTS[level]
    setText(pool[Math.floor(Math.random() * pool.length)])
    sfx.reveal()
    buzz(22)
  }

  return (
    <div>
      <ToolHeader title="惩罚生成器" onClose={onClose} />

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { id: 'light', name: '轻度', desc: '谁都能接受' },
            { id: 'mid', name: '中度', desc: '要点脸皮' },
            { id: 'hard', name: '重度', desc: '社死边缘' },
          ] as const
        ).map((l) => (
          <button
            key={l.id}
            onClick={() => {
              setLevel(l.id)
              setText(null)
            }}
            className={`rounded-2xl border p-2.5 text-center ${
              level === l.id ? 'border-brand bg-brand/12' : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <div className="text-[14px] font-medium">{l.name}</div>
            <div className="mt-0.5 text-[11px] text-white/40">{l.desc}</div>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {text ? (
          <div
            className="card-hi flex min-h-[150px] flex-col items-center justify-center px-6 py-8 text-center"
            style={{ animation: 'popIn 300ms cubic-bezier(0.34,1.56,0.64,1) both' }}
          >
            <Avatar seed={identity.avatarSeed} nickname={identity.nickname} size={40} />
            <p className="mt-3 text-[11.5px] text-white/35">{identity.nickname} 请</p>
            <p className="mt-2 text-[20px] font-medium leading-relaxed">{text}</p>
          </div>
        ) : (
          <div className="grid min-h-[150px] place-items-center rounded-2xl border border-dashed border-white/12 text-[13px] text-white/30">
            点下面的按钮抽一个
          </div>
        )}
      </div>

      <button onClick={draw} className="btn-primary mt-4 w-full">
        <Shuffle size={17} />
        {text ? '换一个' : '抽一个'}
      </button>
      <p className="mt-3 text-center text-[11.5px] leading-relaxed text-white/25">
        惩罚以好玩为限，别让人难堪。任何人不愿意都可以拒绝。
      </p>
    </div>
  )
}
