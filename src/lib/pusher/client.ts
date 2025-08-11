import PusherClient from "pusher-js"
import { PusherEvents } from "@/types/pusher"

// Configuration côté client
const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  forceTLS: true,
})

export default pusherClient

// Fonctions utilitaires côté client
export const pusherClientUtils = {
  // S'abonner à une room
  subscribeToRoom(roomCode: string, eventHandlers: {
    onRoomCreated?: (data: PusherEvents['room:created']) => void
    onUserJoined?: (data: PusherEvents['room:joined']) => void
    onUserLeft?: (data: PusherEvents['room:left']) => void
    onGameStarted?: (data: PusherEvents['game:started']) => void
    onBuzzerPressed?: (data: PusherEvents['buzzer:pressed']) => void
    onBuzzerLocked?: (data: PusherEvents['buzzer:locked']) => void
    onBuzzerUnlocked?: (data: PusherEvents['buzzer:unlocked']) => void
    onPointsUpdated?: (data: PusherEvents['points:updated']) => void
  }) {
    const channel = pusherClient.subscribe(`room-${roomCode}`)

    if (eventHandlers.onRoomCreated) {
      channel.bind('room:created', eventHandlers.onRoomCreated)
    }
    if (eventHandlers.onUserJoined) {
      channel.bind('room:joined', eventHandlers.onUserJoined)
    }
    if (eventHandlers.onUserLeft) {
      channel.bind('room:left', eventHandlers.onUserLeft)
    }
    if (eventHandlers.onGameStarted) {
      channel.bind('game:started', eventHandlers.onGameStarted)
    }
    if (eventHandlers.onBuzzerPressed) {
      channel.bind('buzzer:pressed', eventHandlers.onBuzzerPressed)
    }
    if (eventHandlers.onBuzzerLocked) {
      channel.bind('buzzer:locked', eventHandlers.onBuzzerLocked)
    }
    if (eventHandlers.onBuzzerUnlocked) {
      channel.bind('buzzer:unlocked', eventHandlers.onBuzzerUnlocked)
    }
    if (eventHandlers.onPointsUpdated) {
      channel.bind('points:updated', eventHandlers.onPointsUpdated)
    }

    return channel
  },

  // Se désabonner d'une room
  unsubscribeFromRoom(roomCode: string) {
    pusherClient.unsubscribe(`room-${roomCode}`)
  },

  // Se déconnecter
  disconnect() {
    pusherClient.disconnect()
  },
}
