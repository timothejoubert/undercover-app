export type Role = 'civil' | 'undercover' | 'mr_white'
export type GameStatus = 'lobby' | 'distributing' | 'playing' | 'voting' | 'result' | 'ended'

export interface Player {
    id: string
    name: string
    isAlive: boolean
    role?: Role
    word?: string
    hasSeenWord: boolean
}

export interface Room {
    id: string
    code: string
    hostId: string
    status: GameStatus
}
