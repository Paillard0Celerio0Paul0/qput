import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { roomStore } from "@/lib/roomStore"
import { pusherServerUtils } from "@/lib/pusher/server"

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

    // Vérifier si l'utilisateur est dans la room
    const userInRoom = room.candidates.find(c => c.id === session.user.id) ||
                      room.spectators.find(s => s.id === session.user.id) ||
                      (room.presenter.id === session.user.id ? room.presenter : null)

    if (!userInRoom) {
      return NextResponse.json({ error: "Vous n'êtes pas dans cette room" }, { status: 400 })
    }

    // Retirer l'utilisateur de la room
    // Note: Pour l'instant, on utilise le store temporaire
    // Plus tard, on implémentera la logique de suppression
    
    // Récupérer la room mise à jour
    const updatedRoom = roomStore.getRoom(code)
    if (!updatedRoom) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour de la room" }, { status: 500 })
    }

    // Notifier via Pusher
    await pusherServerUtils.userLeft(code, session.user.id, updatedRoom)

    return NextResponse.json({ 
      success: true, 
      room: updatedRoom 
    })

  } catch (error) {
    console.error("Erreur lors de la déconnexion de la room:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
