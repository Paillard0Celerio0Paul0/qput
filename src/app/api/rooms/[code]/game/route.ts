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
    const { action, points, userId } = await request.json()

    // Vérifier si la room existe
    const room = roomStore.getRoom(code)
    if (!room) {
      return NextResponse.json({ error: "Room introuvable" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est le présentateur
    if (room.presenter.id !== session.user.id) {
      return NextResponse.json({ error: "Seul le présentateur peut contrôler le jeu" }, { status: 403 })
    }

    switch (action) {
      case 'start':
        // Démarrer le jeu
        room.isGameStarted = true
        await pusherServerUtils.startGame(code, room)
        break
        
      case 'end':
        // Terminer le jeu
        room.isGameStarted = false
        // Plus tard: logique pour déterminer le gagnant
        break
        
      case 'updatePoints':
        // Mettre à jour les points d'un utilisateur
        if (userId && typeof points === 'number') {
          const targetUser = room.candidates.find(c => c.id === userId)
          if (targetUser) {
            targetUser.points = points
            await pusherServerUtils.updatePoints(code, userId, points, room)
          }
        }
        break
        
      default:
        return NextResponse.json({ error: "Action invalide" }, { status: 400 })
    }

    return NextResponse.json({ success: true, room })

  } catch (error) {
    console.error("Erreur lors du contrôle du jeu:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
