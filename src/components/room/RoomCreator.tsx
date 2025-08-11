"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function RoomCreator() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const createRoom = async () => {
    if (!session?.user) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la room')
      }

      const data = await response.json()
      router.push(`/room/${data.roomCode}`)
    } catch (error) {
      console.error("Erreur lors de la création de la room:", error)
      setIsCreating(false)
    }
  }

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-4">
        Créer une partie
      </h3>
      <p className="text-blue-200 mb-4">
        Créez une nouvelle partie et invitez vos amis Discord
      </p>
      <button 
        onClick={createRoom}
        disabled={isCreating || !session}
        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
      >
        {isCreating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Création...
          </>
        ) : (
          "Créer une partie"
        )}
      </button>
    </div>
  )
}
