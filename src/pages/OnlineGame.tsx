import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useOnlineGame } from '@/hooks/useOnlineGame'
import { useCardGame } from '@/hooks/useCardGame'
import { GameLobby } from '@/components/GameLobby'
import { GameBoard } from '@/components/GameBoard'
import CardGame from '@/pages/CardGame'
import { toast } from 'sonner'

export default function OnlineGame() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { game, players, gameState, loading: gameLoading, startGame, updateGameState } = useOnlineGame(gameId || '')
  const [gameStarted, setGameStarted] = useState(false)
  const [localGameState, setLocalGameState] = useState(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/')
      toast.error('You must be logged in to play online games')
    }
  }, [user, authLoading, navigate])

  // Check if game exists and user is authorized
  useEffect(() => {
    if (!gameLoading && !game) {
      navigate('/online')
      toast.error('Game not found')
    }
  }, [game, gameLoading, navigate])

  // Handle game start
  const handleGameStart = () => {
    if (!game || !players.length) return

    // Convert online players to the format expected by useCardGame
    const cardGamePlayers = players.map(p => ({
      id: p.user_id,
      name: p.player_name,
      score: 0,
      isEliminated: false,
      luckerBonanzaUsed: false
    }))

    // Initialize the card game
    // This will be handled by the CardGame component
    setGameStarted(true)
  }

  // Handle game state updates from the card game
  const handleGameStateUpdate = async (newGameState: any) => {
    setLocalGameState(newGameState)
    await updateGameState(newGameState)
  }

  if (authLoading || gameLoading) {
    return (
      <div className="min-h-screen bg-gradient-felt flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-white">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!user || !game) {
    return null
  }

  // Show lobby if game hasn't started
  if (game.status === 'waiting' || !gameStarted) {
    return (
      <GameLobby 
        gameId={gameId || ''} 
        onGameStart={handleGameStart}
      />
    )
  }

  // Show the actual game if it's started
  if (game.status === 'active' && gameStarted) {
    // Convert online players to card game format
    const cardGamePlayers = players.map(p => ({
      id: p.user_id,
      name: p.player_name,
      score: 0,
      isEliminated: false,
      luckerBonanzaUsed: false
    }))

    return (
      <div className="min-h-screen bg-gradient-felt">
        {/* Online Game Header */}
        <div className="bg-white/10 border-b border-white/20 backdrop-blur-sm p-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">{game.name}</h1>
                <p className="text-white/70 text-sm">
                  Online Game • {players.length} Players
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {players.slice(0, 4).map((player) => (
                    <div
                      key={player.id}
                      className="w-8 h-8 rounded-full bg-gold border-2 border-white/20 flex items-center justify-center text-black text-xs font-semibold"
                    >
                      {player.player_name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                {players.length > 4 && (
                  <span className="text-white/50 text-sm">
                    +{players.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="container mx-auto max-w-6xl p-4">
          <CardGame 
            gameId={gameId || ''}
            isOnlineGame={true}
            onlinePlayers={cardGamePlayers}
            onGameStateUpdate={handleGameStateUpdate}
          />
        </div>
      </div>
    )
  }

  return null
}
