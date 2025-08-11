"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { RoomUser, Room } from "@/types/room"

interface RoomLobbyProps {
  room: Room
  currentUser: RoomUser
  onStartGame?: () => void
}

export default function RoomLobby({ room, currentUser, onStartGame }: RoomLobbyProps) {
  const { data: session } = useSession()
  const [isStarting, setIsStarting] = useState(false)

  const handleStartGame = async () => {
    if (!session?.user) return

    setIsStarting(true)
    try {
      const response = await fetch(`/api/rooms/${room.code}/game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors du démarrage du jeu')
      }

      onStartGame?.()
    } catch (error) {
      console.error("Erreur lors du démarrage du jeu:", error)
    } finally {
      setIsStarting(false)
    }
  }

  const isPresenter = currentUser.role === "presenter"

  return (
    <div className="space-y-6">
      {/* Code de la room */}
      <div className="text-center">
        <p className="text-blue-200 mb-2">
          Code de la room:
        </p>
        <div className="bg-white/10 rounded-lg p-4 inline-block">
          <span className="font-mono text-3xl font-bold text-white">{room.code}</span>
        </div>
        <p className="text-blue-200 mt-2">
          Partagez ce code avec vos amis pour qu'ils rejoignent la partie
        </p>
      </div>

      {/* Participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Présentateur */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Présentateur
          </h3>
          <div className="flex items-center gap-3">
            {room.presenter.image && (
              <Image
                src={room.presenter.image}
                alt={room.presenter.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div>
              <p className="text-white font-medium">{room.presenter.name}</p>
              <p className="text-blue-200 text-sm">{room.presenter.points} points</p>
            </div>
          </div>
        </div>

        {/* Candidats */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Candidats ({room.candidates.length})
          </h3>
          <div className="space-y-2">
            {room.candidates.length === 0 ? (
              <p className="text-blue-200 text-sm">Aucun candidat</p>
            ) : (
              room.candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center gap-3">
                  {candidate.image && (
                    <Image
                      src={candidate.image}
                      alt={candidate.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-white text-sm">{candidate.name}</p>
                    <p className="text-blue-200 text-xs">{candidate.points} points</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Spectateurs */}
      {room.spectators.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            Spectateurs ({room.spectators.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {room.spectators.map((spectator) => (
              <div key={spectator.id} className="flex items-center gap-2">
                {spectator.image && (
                  <Image
                    src={spectator.image}
                    alt={spectator.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span className="text-white text-sm">{spectator.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bouton démarrer le jeu (seulement pour le présentateur) */}
      {isPresenter && !room.isGameStarted && (
        <div className="text-center">
          <button
            onClick={handleStartGame}
            disabled={isStarting || room.candidates.length === 0}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isStarting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Démarrage...
              </div>
            ) : (
              "Démarrer le jeu"
            )}
          </button>
          {room.candidates.length === 0 && (
            <p className="text-blue-200 text-sm mt-2">
              Attendez qu'au moins un candidat rejoigne la partie
            </p>
          )}
        </div>
      )}

      {/* Statut du jeu */}
      {room.isGameStarted && (
        <div className="text-center">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 font-semibold">Le jeu est en cours !</p>
          </div>
        </div>
      )}
    </div>
  )
}
