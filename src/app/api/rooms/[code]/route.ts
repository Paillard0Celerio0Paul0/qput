import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { roomStore } from "@/lib/roomStore"

interface RouteParams {
  params: Promise<{
    code: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const { code } = resolvedParams

    const room = roomStore.getRoom(code)
    
    if (!room) {
      return NextResponse.json({ error: "Room introuvable" }, { status: 404 })
    }

    return NextResponse.json({ room })

  } catch (error) {
    console.error("Erreur lors de la récupération de la room:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const resolvedParams = await params
    const { code } = resolvedParams

    const room = roomStore.getRoom(code)
    
    if (!room) {
      return NextResponse.json({ error: "Room introuvable" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est le présentateur
    if (room.presenter.id !== session.user.id) {
      return NextResponse.json({ error: "Seul le présentateur peut supprimer la room" }, { status: 403 })
    }

    // Supprimer la room
    const success = roomStore.deleteRoom(code)
    
    if (!success) {
      return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erreur lors de la suppression de la room:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
