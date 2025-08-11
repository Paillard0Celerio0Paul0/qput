"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AuthButton from "@/components/auth/AuthButton"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Question pour un Gorki
          </h1>
          <p className="text-blue-200 mb-8">
            Connectez-vous pour accéder au jeu
          </p>
          <AuthButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            Question pour un Gorki
          </h1>
          <AuthButton />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">
            Bienvenue, {session.user.name} !
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                Créer une partie
              </h3>
              <p className="text-blue-200 mb-4">
                Créez une nouvelle partie et invitez vos amis Discord
              </p>
              <button 
                onClick={() => router.push("/room")}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Créer une partie
              </button>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                Rejoindre une partie
              </h3>
              <p className="text-blue-200 mb-4">
                Rejoignez une partie existante avec un code
              </p>
              <button 
                onClick={() => router.push("/room")}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Rejoindre une partie
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
