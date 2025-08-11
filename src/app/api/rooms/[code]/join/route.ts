import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { roomStore } from "@/lib/roomStore"
import { pusherServerUtils } from "@/lib/pusher/server"
import { RoomUser } from "@/types/room"

interface RouteParams {
  params: Promise<{
    code: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const resolvedParams = await params
    const { code } = resolvedParams

    // Vérifier si la room existe
    const room = roomStore.getRoom(code)
    if (!room) {
      return NextResponse.json({ error: "Room introuvable" }, { status: 404 })
    }

    // Vérifier si l'utilisateur est déjà dans la room
    const existingUser = room.candidates.find(c => c.id === session.user.id) ||
                        room.spectators.find(s => s.id === session.user.id)

    if (existingUser) {
      return NextResponse.json({ error: "Vous êtes déjà dans cette room" }, { status: 400 })
    }

    // Créer l'utilisateur
    const user: RoomUser = {
      id: session.user.id,
      name: session.user.name || "Utilisateur",
      image: session.user.image || "",
      role: "candidate", // Par défaut comme candidat
      isConnected: true,
      hasCamera: false,
      points: 0
    }

    // Ajouter l'utilisateur à la room
    const success = roomStore.joinRoom(code, user, "candidate")
    
    if (!success) {
      return NextResponse.json({ error: "Impossible de rejoindre la room" }, { status: 500 })
    }

    // Récupérer la room mise à jour
    const updatedRoom = roomStore.getRoom(code)
    if (!updatedRoom) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour de la room" }, { status: 500 })
    }

    // Notifier via Pusher
    await pusherServerUtils.userJoined(code, user, updatedRoom)

    return NextResponse.json({ 
      success: true, 
      user, 
      room: updatedRoom 
    })

  } catch (error) {
    console.error("Erreur lors de la connexion à la room:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
