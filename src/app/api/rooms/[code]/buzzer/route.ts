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
    const { action } = await request.json()

    // Vérifier si la room existe
    const room = roomStore.getRoom(code)
    if (!room) {
      return NextResponse.json({ error: "Room introuvable" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est un candidat
    const candidate = room.candidates.find(c => c.id === session.user.id)
    if (!candidate) {
      return NextResponse.json({ error: "Seuls les candidats peuvent utiliser le buzzer" }, { status: 403 })
    }

    switch (action) {
      case 'press':
        // Envoyer l'événement buzzer pressé
        await pusherServerUtils.buzzerPressed(code, session.user.id)
        break
        
      case 'lock':
        // Vérifier que l'utilisateur est le présentateur
        if (room.presenter.id !== session.user.id) {
          return NextResponse.json({ error: "Seul le présentateur peut verrouiller le buzzer" }, { status: 403 })
        }
        await pusherServerUtils.lockBuzzer(code, session.user.id)
        break
        
      case 'unlock':
        // Vérifier que l'utilisateur est le présentateur
        if (room.presenter.id !== session.user.id) {
          return NextResponse.json({ error: "Seul le présentateur peut déverrouiller le buzzer" }, { status: 403 })
        }
        await pusherServerUtils.unlockBuzzer(code)
        break
        
      default:
        return NextResponse.json({ error: "Action invalide" }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erreur lors de l'utilisation du buzzer:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
