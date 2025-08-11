"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"
import AuthButton from "@/components/auth/AuthButton"
import { RoomUser, UserRole, Room } from "@/types/room"
import { usePusher } from "@/hooks/usePusher"
import RoomLobby from "@/components/room/RoomLobby"

interface RoomPageProps {
  params: Promise<{
    code: string
  }>
}

export default function RoomPage({ params }: RoomPageProps) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<RoomUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Utiliser le hook Pusher
  const { isConnected, room, participants } = usePusher({
    roomCode: resolvedParams.code,
    onRoomCreated: (data) => {
      console.log("Room créée:", data.room)
    },
    onUserJoined: (data) => {
      console.log("Utilisateur rejoint:", data.user)
    },
    onUserLeft: (data) => {
      console.log("Utilisateur parti:", data.userId)
    },
    onGameStarted: (data) => {
      console.log("Jeu démarré:", data.room)
    },
    onBuzzerPressed: (data) => {
      console.log("Buzzer pressé par:", data.userId)
    },
    onPointsUpdated: (data) => {
      console.log("Points mis à jour:", data.userId, data.points)
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
      return
    }

    if (session?.user && room) {
      // Déterminer le rôle de l'utilisateur
      let user: RoomUser | undefined

      if (room.presenter.id === session.user.id) {
        user = room.presenter
      } else {
        user = room.candidates.find((c: RoomUser) => c.id === session.user.id)
      }

      if (user) {
        setCurrentUser(user)
      } else {
        // Si l'utilisateur n'est pas dans la room, essayer de la rejoindre
        joinRoom()
      }
    }
  }, [session, status, router, room])

  const joinRoom = async () => {
    if (!session?.user) return

    try {
      const response = await fetch(`/api/rooms/${resolvedParams.code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Impossible de rejoindre la room")
        return
      }

      const data = await response.json()
      setCurrentUser(data.user)
    } catch (error) {
      console.error("Erreur lors de la connexion à la room:", error)
      setError("Impossible de rejoindre la room")
    }
  }

  if (status === "loading" || !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de la room...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Erreur
          </h1>
          <p className="text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => router.push("/room")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Retour aux rooms
          </button>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
              Room: {resolvedParams.code}
            </h1>
            <span className="px-2 py-1 bg-blue-500 text-white text-sm rounded-full">
              {currentUser.role === "presenter" ? "Présentateur" : 
               currentUser.role === "candidate" ? "Candidat" : "Spectateur"}
            </span>
          </div>
          <AuthButton />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">
            Lobby de la room
          </h2>
          
          {room && currentUser && (
            <RoomLobby 
              room={room} 
              currentUser={currentUser}
              onStartGame={() => {
                console.log("Jeu démarré !")
                // Plus tard: rediriger vers l'interface de jeu
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}
