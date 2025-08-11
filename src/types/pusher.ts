import { Room, RoomUser, UserRole } from "./room"

// Événements côté client
export interface PusherEvents {
  // Événements de room
  'room:created': { room: Room }
  'room:joined': { user: RoomUser, room: Room }
  'room:left': { userId: string, room: Room }
  'room:deleted': { roomCode: string }
  
  // Événements de jeu
  'game:started': { room: Room }
  'game:ended': { room: Room, winner: RoomUser }
  'round:started': { round: number, question: string }
  'round:ended': { round: number, results: any }
  
  // Événements de buzzer
  'buzzer:pressed': { userId: string, timestamp: number }
  'buzzer:locked': { userId: string }
  'buzzer:unlocked': void
  
  // Événements de points
  'points:updated': { userId: string, points: number, room: Room }
  
  // Événements de caméra
  'camera:toggled': { userId: string, hasCamera: boolean }
  
  // Événements de présence
  'presence:online': { user: RoomUser }
  'presence:offline': { userId: string }
}

// Types pour les canaux
export type RoomChannel = `room-${string}`
export type GameChannel = `game-${string}`

// Configuration Pusher
export interface PusherConfig {
  appId: string
  key: string
  secret: string
  cluster: string
}
