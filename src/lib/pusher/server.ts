import PusherServer from "pusher"
import { PusherConfig } from "@/types/pusher"

const pusherConfig: PusherConfig = {
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
}

export const pusherServer = new PusherServer({
  appId: pusherConfig.appId,
  key: pusherConfig.key,
  secret: pusherConfig.secret,
  cluster: pusherConfig.cluster,
  useTLS: true,
})

// Fonctions utilitaires pour envoyer des événements
export const pusherServerUtils = {
  // Créer une room
  async createRoom(roomCode: string, room: any) {
    await pusherServer.trigger(`room-${roomCode}`, 'room:created', { room })
  },

  // Un utilisateur rejoint une room
  async userJoined(roomCode: string, user: any, room: any) {
    await pusherServer.trigger(`room-${roomCode}`, 'room:joined', { user, room })
  },

  // Un utilisateur quitte une room
  async userLeft(roomCode: string, userId: string, room: any) {
    await pusherServer.trigger(`room-${roomCode}`, 'room:left', { userId, room })
  },

  // Démarrer le jeu
  async startGame(roomCode: string, room: any) {
    await pusherServer.trigger(`room-${roomCode}`, 'game:started', { room })
  },

  // Buzzer pressé
  async buzzerPressed(roomCode: string, userId: string) {
    await pusherServer.trigger(`room-${roomCode}`, 'buzzer:pressed', { 
      userId, 
      timestamp: Date.now() 
    })
  },

  // Verrouiller le buzzer
  async lockBuzzer(roomCode: string, userId: string) {
    await pusherServer.trigger(`room-${roomCode}`, 'buzzer:locked', { userId })
  },

  // Déverrouiller le buzzer
  async unlockBuzzer(roomCode: string) {
    await pusherServer.trigger(`room-${roomCode}`, 'buzzer:unlocked', {})
  },

  // Mettre à jour les points
  async updatePoints(roomCode: string, userId: string, points: number, room: any) {
    await pusherServer.trigger(`room-${roomCode}`, 'points:updated', { userId, points, room })
  },
}
