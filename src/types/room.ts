export type UserRole = 'presenter' | 'candidate' | 'spectator'

export interface RoomUser {
  id: string
  name: string
  image: string
  role: UserRole
  isConnected: boolean
  hasCamera: boolean
  points: number
}

export interface Room {
  code: string
  presenter: RoomUser
  candidates: RoomUser[]
  spectators: RoomUser[]
  isGameStarted: boolean
  currentRound: number
  maxRounds: number
  createdAt: Date
}

export interface RoomState {
  room: Room | null
  currentUser: RoomUser | null
  isLoading: boolean
  error: string | null
}
