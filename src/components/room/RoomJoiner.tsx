"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function RoomJoiner() {
  const { data: session } = useSession()
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")

  const joinRoom = async () => {
    if (!session?.user || !roomCode.trim()) return

    setIsJoining(true)
    setError("")
    
    try {
      const code = roomCode.trim().toUpperCase()
      
      const response = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Impossible de rejoindre la room")
        setIsJoining(false)
        return
      }
      
      router.push(`/room/${code}`)
    } catch (error) {
      console.error("Erreur lors de la connexion à la room:", error)
      setError("Impossible de rejoindre la room")
      setIsJoining(false)
    }
  }

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-4">
        Rejoindre une partie
      </h3>
      <p className="text-blue-200 mb-4">
        Rejoignez une partie existante avec un code
      </p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="roomCode" className="block text-sm font-medium text-white mb-2">
            Code de la room
          </label>
          <input
            id="roomCode"
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Ex: ABC123"
            maxLength={6}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        
        <button 
          onClick={joinRoom}
          disabled={isJoining || !session || !roomCode.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isJoining ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Connexion...
            </>
          ) : (
            "Rejoindre la partie"
          )}
        </button>
      </div>
    </div>
  )
}
