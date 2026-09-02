import { createRng, type RNG } from '@pg/shared'
import type { WolfRole, WolfState, WolfSwapRecord } from '@pg/shared'
import { WOLF_NIGHT_ORDER } from '@pg/shared'
import type { ActionContext, GameContext, GameModule } from '../types.js'

const REVEAL_SECONDS = 20
const NIGHT_ACTION_SECONDS = 25
const DISCUSSION_SECONDS = 300
const VOTE_SECONDS = 40
const RESULT_SECONDS = 12

const ALL_ROLES: WolfRole[] = [
  'werewolf',
  'seer',
  'robber',
  'troublemaker',
  'drunk',
  'insomniac',
  'hunter',
  'villager',
]

export const WOLF_ROLE_NAMES: Record<WolfRole, string> = {
  werewolf: '狼人',
  seer: '预言家',
  robber: '盗贼',
  troublemaker: '捣蛋鬼',
  drunk: '酒鬼',
  insomniac: '失眠者',
  hunter: '猎人',
  villager: '村民',
}

export const WOLF_ROLE_DESC: Record<WolfRole, string> = {
  werewolf: '夜晚查看同伴；白天伪装自己，别被投出去',
  seer: '夜晚查看一名玩家的身份，或两张中央牌',
  robber: '夜晚可与一名玩家交换身份，并查看自己的新身份',
  troublemaker: '夜晚交换另外两名玩家的身份，但不能查看',
  drunk: '夜晚必须与一张中央牌交换身份，且不知道自己变成了什么',
  insomniac: '夜晚结束时再查看一次自己当前的身份',
  hunter: '无夜晚行动；若被投出，你投的人会一起出局',
  villager: '无夜晚行动，靠白天推理找出狼人',
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

/** 按人数构造身份堆：玩家数 + 3 张中央牌 */
function buildRoles(memberCount: number, rng: RNG, enabled: WolfRole[]): WolfRole[] {
  const wolfCount = memberCount >= 6 ? 2 : 1
  const total = memberCount + 3

  const specials = ALL_ROLES.filter((r) => r !== 'werewolf' && r !== 'villager' && enabled.includes(r))
  const roles: WolfRole[] = []
  for (let i = 0; i < wolfCount; i++) roles.push('werewolf')
  for (const r of specials) roles.push(r)
  while (roles.length < total) roles.push('villager')
  return rng.shuffle(roles).slice(0, total)
}

function actorFor(state: WolfState, role: WolfRole): string | null {
  const ids = Object.keys(state.initialRoles)
  return ids.find((id) => state.initialRoles[id] === role) ?? null
}

function nightQueueOf(state: WolfState): WolfRole[] {
  const present = new Set([...Object.values(state.initialRoles), ...state.center])
  return WOLF_NIGHT_ORDER.filter((r) => present.has(r))
}

function advanceNight(state: WolfState, now: number): WolfState {
  const queue = nightQueueOf(state)
  let idx = state.nightIndex + 1
  // 跳过没有行动者的阶段（该身份只存在于中央牌）
  while (idx < queue.length && actorFor(state, queue[idx]) === null) idx++

  if (idx >= queue.length) {
    return { ...state, phase: 'discussion', nightRole: null, nightIndex: queue.length, phaseEndsAt: now + DISCUSSION_SECONDS * 1000 }
  }
  return {
    ...state,
    nightRole: queue[idx],
    nightIndex: idx,
    phaseEndsAt: now + NIGHT_ACTION_SECONDS * 1000,
  }
}

function addKnowledge(state: WolfState, playerId: string, text: string): Record<string, string[]> {
  return { ...state.knowledge, [playerId]: [...(state.knowledge[playerId] ?? []), text] }
}

function swap(a: string, b: string, by: WolfRole, state: WolfState): { roles: Record<string, WolfRole>; center: WolfRole[]; record: WolfSwapRecord } {
  const roles = { ...state.currentRoles }
  const center = [...state.center]
  const isCenterA = a.startsWith('center:')
  const isCenterB = b.startsWith('center:')

  const getA = (): WolfRole => (isCenterA ? center[num(a.slice(7), 0)] : roles[a])
  const getB = (): WolfRole => (isCenterB ? center[num(b.slice(7), 0)] : roles[b])

  const va = getA()
  const vb = getB()

  if (isCenterA) center[num(a.slice(7), 0)] = vb
  else roles[a] = vb
  if (isCenterB) center[num(b.slice(7), 0)] = va
  else roles[b] = va

  return { roles, center, record: { by, a, b } }
}

function resolveVotes(state: WolfState): WolfState {
  const counts = new Map<string, number>()
  for (const target of Object.values(state.votes)) {
    counts.set(target, (counts.get(target) ?? 0) + 1)
  }
  let max = 0
  for (const c of counts.values()) if (c > max) max = c
  const top = Object.keys(state.currentRoles).filter((id) => (counts.get(id) ?? 0) === max && max > 0)

  let eliminated = top
  // 猎人被投出 → 其投票目标一并出局
  for (const id of top) {
    if (state.currentRoles[id] === 'hunter') {
      const target = state.votes[id]
      if (target && !eliminated.includes(target)) eliminated = [...eliminated, target]
    }
  }

  const hasWolf = eliminated.some((id) => state.currentRoles[id] === 'werewolf')
  return {
    ...state,
    phase: 'result',
    eliminated,
    winner: hasWolf ? 'good' : 'wolf',
    phaseEndsAt: null,
  }
}

export const wolfModule: GameModule<WolfState> = {
  id: 'wolf',
  defaultOptions: {
    preset: 'standard', // 'newbie' | 'standard' | 'chaos'
  },

  create(ctx: GameContext, options: Record<string, unknown>): WolfState {
    const seed = (ctx.now ^ (ctx.memberIds.length * 1103515245)) >>> 0
    const rng: RNG = createRng(seed)

    const preset = options.preset === 'newbie' ? 'newbie' : options.preset === 'chaos' ? 'chaos' : 'standard'
    const enabled: WolfRole[] =
      preset === 'newbie'
        ? ['werewolf', 'seer', 'robber', 'troublemaker', 'villager']
        : preset === 'chaos'
          ? ['werewolf', 'seer', 'robber', 'troublemaker', 'drunk', 'insomniac', 'hunter', 'villager']
          : ['werewolf', 'seer', 'robber', 'troublemaker', 'drunk', 'insomniac', 'villager']

    const deck = buildRoles(ctx.memberIds.length, rng, enabled)
    const initialRoles: Record<string, WolfRole> = {}
    ctx.memberIds.forEach((id, i) => {
      initialRoles[id] = deck[i]
    })
    const center = deck.slice(ctx.memberIds.length, ctx.memberIds.length + 3)

    const base: WolfState = {
      seed: rng.state,
      phase: 'reveal',
      initialRoles,
      currentRoles: { ...initialRoles },
      center,
      nightRole: null,
      nightIndex: -1,
      nightDone: [],
      swaps: [],
      knowledge: {},
      votes: {},
      phaseEndsAt: ctx.now + REVEAL_SECONDS * 1000,
      eliminated: [],
      winner: null,
      revealTrail: [],
      enabledRoles: enabled,
    }

    const queue = nightQueueOf(base)
    const firstIdx = queue.findIndex((r) => actorFor(base, r) !== null)
    return {
      ...base,
      nightIndex: firstIdx,
      nightRole: firstIdx >= 0 ? queue[firstIdx] : null,
    }
  },

  reduce(state, action, ctx): WolfState {
    if (action.kind === 'ready' && state.phase === 'reveal') {
      const nightDone = state.nightDone.includes(ctx.playerId) ? state.nightDone : [...state.nightDone, ctx.playerId]
      const allReady = Object.keys(state.initialRoles).every((id) => nightDone.includes(id))
      if (allReady) {
        return { ...state, nightDone: [], phase: 'night', phaseEndsAt: ctx.now + NIGHT_ACTION_SECONDS * 1000 }
      }
      return { ...state, nightDone }
    }

    if (action.kind === 'endDiscussion' && state.phase === 'discussion') {
      return { ...state, phase: 'vote', votes: {}, phaseEndsAt: ctx.now + VOTE_SECONDS * 1000 }
    }

    if (action.kind === 'nightAction' && state.phase === 'night') {
      const role = state.nightRole
      if (!role || state.initialRoles[ctx.playerId] !== role) return state

      let next: WolfState = state
      const centerIdxRaw = num(action.centerIndex, -1)
      const targetId = typeof action.targetId === 'string' ? action.targetId : ''
      const targetBId = typeof action.targetBId === 'string' ? action.targetBId : ''

      switch (role) {
        case 'werewolf': {
          const wolves = Object.keys(state.initialRoles).filter((id) => state.initialRoles[id] === 'werewolf')
          if (wolves.length > 1) {
            next = { ...state, knowledge: addKnowledge(state, ctx.playerId, `你的同伴是：${wolves.filter((w) => w !== ctx.playerId).join('、')}`) }
          } else if (centerIdxRaw >= 0 && centerIdxRaw < state.center.length) {
            const r = state.center[centerIdxRaw]
            next = { ...state, knowledge: addKnowledge(state, ctx.playerId, `你查看的中央牌是「${WOLF_ROLE_NAMES[r]}」`) }
          }
          break
        }
        case 'seer': {
          if (targetId && state.currentRoles[targetId]) {
            next = { ...state, knowledge: addKnowledge(state, ctx.playerId, `${targetId} 现在是「${WOLF_ROLE_NAMES[state.currentRoles[targetId]]}」`) }
          } else if (centerIdxRaw >= 0 && centerIdxRaw < state.center.length - 1) {
            const a = state.center[centerIdxRaw]
            const b = state.center[centerIdxRaw + 1]
            next = { ...state, knowledge: addKnowledge(state, ctx.playerId, `中央牌：${WOLF_ROLE_NAMES[a]}、${WOLF_ROLE_NAMES[b]}`) }
          }
          break
        }
        case 'robber': {
          if (targetId && state.currentRoles[targetId] && targetId !== ctx.playerId && action.swap !== false) {
            const res = swap(ctx.playerId, targetId, 'robber', state)
            next = {
              ...state,
              currentRoles: res.roles,
              center: res.center,
              swaps: [...state.swaps, res.record],
              knowledge: addKnowledge(state, ctx.playerId, `你与对方交换后，你现在是「${WOLF_ROLE_NAMES[res.roles[ctx.playerId]]}」`),
            }
          }
          break
        }
        case 'troublemaker': {
          if (targetId && targetBId && targetId !== targetBId && state.currentRoles[targetId] && state.currentRoles[targetBId]) {
            const res = swap(targetId, targetBId, 'troublemaker', state)
            next = { ...state, currentRoles: res.roles, center: res.center, swaps: [...state.swaps, res.record] }
          }
          break
        }
        case 'drunk': {
          const idx = centerIdxRaw >= 0 && centerIdxRaw < state.center.length ? centerIdxRaw : 0
          const res = swap(ctx.playerId, `center:${idx}`, 'drunk', state)
          next = { ...state, currentRoles: res.roles, center: res.center, swaps: [...state.swaps, res.record] }
          break
        }
        case 'insomniac': {
          next = { ...state, knowledge: addKnowledge(state, ctx.playerId, `夜晚结束时你是「${WOLF_ROLE_NAMES[state.currentRoles[ctx.playerId]]}」`) }
          break
        }
        default:
          break
      }

      return advanceNight({ ...next, nightDone: [...state.nightDone, ctx.playerId] }, ctx.now)
    }

    if (action.kind === 'vote' && state.phase === 'vote') {
      if (!state.currentRoles[ctx.playerId]) return state
      const target = typeof action.targetId === 'string' ? action.targetId : ''
      if (!state.currentRoles[target]) return state
      const votes = { ...state.votes, [ctx.playerId]: target }
      const allVoted = Object.keys(state.currentRoles).every((id) => votes[id])
      return allVoted ? resolveVotes({ ...state, votes }) : { ...state, votes }
    }

    return state
  },

  privateView(state, playerId) {
    return {
      initialRole: state.initialRoles[playerId] ?? null,
      /** 结算前不暴露，避免有人靠接口提前知道交换结果 */
      currentRole: state.phase === 'result' ? (state.currentRoles[playerId] ?? null) : null,
      knowledge: state.knowledge[playerId] ?? [],
      myVote: state.votes[playerId] ?? null,
    }
  },

  tick(state, now) {
    if (state.phaseEndsAt === null) return state
    if (now < state.phaseEndsAt) return state

    switch (state.phase) {
      case 'reveal':
        return { ...state, phase: 'night', nightDone: [], phaseEndsAt: now + NIGHT_ACTION_SECONDS * 1000 }

      case 'night':
        return advanceNight(state, now)

      case 'discussion':
        return { ...state, phase: 'vote', votes: {}, phaseEndsAt: now + VOTE_SECONDS * 1000 }

      case 'vote':
        return resolveVotes(state)

      default:
        return { ...state, phaseEndsAt: null }
    }
  },

  nextDeadline(state, now) {
    if (state.phase === 'result') return null
    if (state.phaseEndsAt === null) return null
    return state.phaseEndsAt > now ? state.phaseEndsAt : null
  },

  redact(state) {
    // 结算前：身份、中央牌内容、夜晚情报一律不得广播。
    // votes 保留投票人但清空投票对象，客户端仍可显示「已投 n 人」。
    if (state.phase === 'result') return state
    return {
      ...state,
      initialRoles: {},
      currentRoles: {},
      center: state.center.map(() => 'villager' as WolfRole),
      knowledge: {},
      swaps: [],
      revealTrail: [],
      votes: Object.fromEntries(Object.keys(state.votes).map((k) => [k, ''])),
    }
  },
}

export const WOLF_TIMING = { REVEAL_SECONDS, NIGHT_ACTION_SECONDS, DISCUSSION_SECONDS, VOTE_SECONDS, RESULT_SECONDS }
