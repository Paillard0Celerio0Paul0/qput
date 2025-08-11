import { Room, RoomUser } from "@/types/room"

// Store temporaire en mémoire (sera remplacé par Pusher)
class RoomStore {
  private rooms: Map<string, Room> = new Map()

  createRoom(presenter: RoomUser): string {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const room: Room = {
      code,
      presenter,
      candidates: [],
      spectators: [],
      isGameStarted: false,
      currentRound: 1,
      maxRounds: 5,
      createdAt: new Date()
    }
    
    this.rooms.set(code, room)
    return code
  }

  getRoom(code: string): Room | null {
    return this.rooms.get(code) || null
  }

  joinRoom(code: string, user: RoomUser, role: 'candidate' | 'spectator'): boolean {
    const room = this.rooms.get(code)
    if (!room) return false

    if (role === 'candidate') {
      room.candidates.push(user)
    } else {
      room.spectators.push(user)
    }

    return true
  }

  deleteRoom(code: string): boolean {
    return this.rooms.delete(code)
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values())
  }
}

// Instance singleton
export const roomStore = new RoomStore()
