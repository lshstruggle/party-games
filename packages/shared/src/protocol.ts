import { z } from 'zod'

// 前后端共用一套 schema，杜绝协议漂移

export const ClientMsgSchema = z.object({
  t: z.enum([
    'join',
    'rejoin',
    'leave',
    'heartbeat',
    'action',
    'resync',
    'startGame',
    'endGame',
    'updateSettings',
    'kick',
    'transferHost',
  ]),
  roomCode: z.string().length(4),
  clientToken: z.string().min(8).max(128),
  seq: z.number().int().nonnegative().optional(),
  payload: z.unknown().optional(),
})

export const ActionPayloadSchema = z.object({
  kind: z.string().min(1).max(40),
})

export const JoinPayloadSchema = z.object({
  nickname: z.string().min(1).max(12),
  avatarSeed: z.string().min(1).max(32),
})

export const StartGamePayloadSchema = z.object({
  gameId: z.string().min(1).max(32),
  options: z.record(z.unknown()).optional(),
})

export const KickPayloadSchema = z.object({
  memberId: z.string().min(1),
})

export const UpdateSettingsPayloadSchema = z.object({
  spice: z.enum(['mild', 'spicy']).optional(),
  gameOptions: z.record(z.record(z.unknown())).optional(),
})

export type JoinPayload = z.infer<typeof JoinPayloadSchema>
export type StartGamePayload = z.infer<typeof StartGamePayloadSchema>
export type KickPayload = z.infer<typeof KickPayloadSchema>
export type UpdateSettingsPayload = z.infer<typeof UpdateSettingsPayloadSchema>
