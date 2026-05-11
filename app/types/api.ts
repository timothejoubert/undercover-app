import type { Database } from './database.types'

type RoomRow = Database['public']['Tables']['rooms']['Row']
type PlayerRow = Database['public']['Tables']['players']['Row']
type PlayerRole = PlayerRow['role']

export type { RoomRow, PlayerRole }

export type PlayerPublic = Pick<PlayerRow, 'id' | 'name' | 'is_alive' | 'joined_at'>

export interface JoinRoomResponse {
    roomCode: string
    playerId: string
}

export interface RoomResponse {
    room: RoomRow
    players: PlayerPublic[]
}

export interface MyRoleResponse {
    role: PlayerRole
    word: string | null
    name: string
}
