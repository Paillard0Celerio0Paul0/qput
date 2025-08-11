import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { roomStore } from "@/lib/roomStore"
import { pusherServerUtils } from "@/lib/pusher/server"
import { RoomUser } from "@/types/room"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const presenter: RoomUser = {
      id: session.user.id,
      name: session.user.name || "Utilisateur",
      image: session.user.image || "",
      role: "presenter",
      isConnected: true,
      hasCamera: false,
      points: 0
    }

    // Créer la room
    const roomCode = roomStore.createRoom(presenter)
    const room = roomStore.getRoom(roomCode)

    if (!room) {
      return NextResponse.json({ error: "Erreur lors de la création de la room" }, { status: 500 })
    }

    // Notifier via Pusher
    await pusherServerUtils.createRoom(roomCode, room)

    return NextResponse.json({ 
      success: true, 
      roomCode, 
      room 
    })

  } catch (error) {
    console.error("Erreur lors de la création de la room:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const rooms = roomStore.getAllRooms()
    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("Erreur lors de la récupération des rooms:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
