"use client"

import { useEffect, useRef, useState } from "react"
import { pusherClientUtils } from "@/lib/pusher/client"
import { PusherEvents } from "@/types/pusher"
import { Room, RoomUser } from "@/types/room"

interface UsePusherOptions {
  roomCode: string
  onRoomCreated?: (data: PusherEvents['room:created']) => void
  onUserJoined?: (data: PusherEvents['room:joined']) => void
  onUserLeft?: (data: PusherEvents['room:left']) => void
  onGameStarted?: (data: PusherEvents['game:started']) => void
  onBuzzerPressed?: (data: PusherEvents['buzzer:pressed']) => void
  onBuzzerLocked?: (data: PusherEvents['buzzer:locked']) => void
  onBuzzerUnlocked?: (data: PusherEvents['buzzer:unlocked']) => void
  onPointsUpdated?: (data: PusherEvents['points:updated']) => void
}

export function usePusher(options: UsePusherOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<RoomUser[]>([])
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!options.roomCode) return

    // S'abonner au canal
    channelRef.current = pusherClientUtils.subscribeToRoom(options.roomCode, {
      onRoomCreated: (data) => {
        setRoom(data.room)
        setParticipants([data.room.presenter, ...data.room.candidates, ...data.room.spectators])
        options.onRoomCreated?.(data)
      },
      onUserJoined: (data) => {
        setRoom(data.room)
        setParticipants([data.room.presenter, ...data.room.candidates, ...data.room.spectators])
        options.onUserJoined?.(data)
      },
      onUserLeft: (data) => {
        setRoom(data.room)
        setParticipants([data.room.presenter, ...data.room.candidates, ...data.room.spectators])
        options.onUserLeft?.(data)
      },
      onGameStarted: (data) => {
        setRoom(data.room)
        options.onGameStarted?.(data)
      },
      onBuzzerPressed: options.onBuzzerPressed,
      onBuzzerLocked: options.onBuzzerLocked,
      onBuzzerUnlocked: options.onBuzzerUnlocked,
      onPointsUpdated: (data) => {
        setRoom(data.room)
        setParticipants([data.room.presenter, ...data.room.candidates, ...data.room.spectators])
        options.onPointsUpdated?.(data)
      },
    })

    setIsConnected(true)

    // Cleanup
    return () => {
      if (channelRef.current) {
        pusherClientUtils.unsubscribeFromRoom(options.roomCode)
        channelRef.current = null
        setIsConnected(false)
      }
    }
  }, [options.roomCode])

  return {
    isConnected,
    room,
    participants,
    channel: channelRef.current,
  }
}
