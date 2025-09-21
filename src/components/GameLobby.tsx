import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useOnlineGame, GamePlayer } from '@/hooks/useOnlineGame'
import { useAuth } from '@/hooks/useAuth'
import { useCardGame } from '@/hooks/useCardGame'
import { 
  Users, 
  Play, 
  UserPlus, 
  Crown, 
  Clock, 
  Target,
  CheckCircle,
  Circle
} from 'lucide-react'
import { toast } from 'sonner'

interface GameLobbyProps {
  gameId: string
  onGameStart: () => void
}

export function GameLobby({ gameId, onGameStart }: GameLobbyProps) {
  const { user } = useAuth()
  const { game, players, loading, joinGame, leaveGame, toggleReady, startGame } = useOnlineGame(gameId)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-felt flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-white">Loading game lobby...</p>
        </div>
      </div>
    )
  }

  if (!game || !user) {
    return (
      <div className="min-h-screen bg-gradient-felt flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Game not found or not authenticated</p>
        </div>
      </div>
    )
  }

  const currentPlayer = players.find(p => p.user_id === user.id)
  const isHost = currentPlayer?.is_host || false
  const allPlayersReady = players.length >= 2 && players.every(p => p.is_ready)
  const canStart = isHost && allPlayersReady && game.status === 'waiting'

  const handleJoin = async () => {
    if (currentPlayer) return

    setIsJoining(true)
    try {
      await joinGame(user.id, user.user_metadata?.username || user.email.split('@')[0])
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!currentPlayer) return

    setIsLeaving(true)
    try {
      await leaveGame(user.id)
    } finally {
      setIsLeaving(false)
    }
  }

  const handleToggleReady = async () => {
    if (!currentPlayer) return

    await toggleReady(user.id, !currentPlayer.is_ready)
  }

  const handleStartGame = async () => {
    if (!canStart) return

    setIsStarting(true)
    try {
      // Create initial game state with online players
      const onlinePlayers = players.map(p => ({
        id: p.user_id,
        name: p.player_name,
        score: 0,
        isEliminated: false,
        luckerBonanzaUsed: false
      }))

      // Use the existing useCardGame hook to initialize the game
      // This will be handled by the parent component
      onGameStart()
    } finally {
      setIsStarting(false)
    }
  }

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-felt p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Game Header */}
        <Card className="mb-6 bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-gold" />
                  {game.name}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="text-white border-white/30">
                    <Users className="w-4 h-4 mr-1" />
                    {players.length}/{game.max_players} Players
                  </Badge>
                  <Badge variant="outline" className="text-white border-white/30">
                    <Target className="w-4 h-4 mr-1" />
                    Score Limit: {game.score_limit}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`border-white/30 ${
                      game.status === 'waiting' ? 'text-yellow-400' : 
                      game.status === 'active' ? 'text-green-400' : 
                      'text-red-400'
                    }`}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              {currentPlayer && (
                <div className="flex gap-2">
                  {!isHost && (
                    <Button
                      variant="outline"
                      onClick={handleToggleReady}
                      className={`border-white/30 ${
                        currentPlayer.is_ready 
                          ? 'bg-green-500/20 text-green-400 border-green-400/50' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {currentPlayer.is_ready ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Ready
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 mr-2" />
                          Not Ready
                        </>
                      )}
                    </Button>
                  )}
                  
                  {isHost && canStart && (
                    <Button
                      onClick={handleStartGame}
                      disabled={isStarting}
                      className="bg-gold hover:bg-gold/90 text-black font-semibold"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isStarting ? 'Starting...' : 'Start Game'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className="border-red-400/50 text-red-400 hover:bg-red-400/10"
                  >
                    {isLeaving ? 'Leaving...' : 'Leave Game'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Players List */}
        <Card className="mb-6 bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" />
              Players ({players.length}/{game.max_players})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-white/50 mx-auto mb-4" />
                <p className="text-white/70">No players yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border ${
                      player.user_id === user.id 
                        ? 'bg-gold/20 border-gold/50' 
                        : 'bg-white/5 border-white/20'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gold text-black font-semibold">
                        {getPlayerInitials(player.player_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {player.player_name}
                        </span>
                        {player.is_host && (
                          <Crown className="w-4 h-4 text-gold" />
                        )}
                        {player.user_id === user.id && (
                          <Badge variant="outline" className="text-xs border-gold/50 text-gold">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {player.is_ready ? (
                          <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-400/50">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-400/50">
                            <Circle className="w-3 h-3 mr-1" />
                            Not Ready
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Join Game Section */}
        {!currentPlayer && game.status === 'waiting' && players.length < game.max_players && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <UserPlus className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Join This Game
                </h3>
                <p className="text-white/70 mb-4">
                  Ready to play some Binzingo Cardy?
                </p>
                <Button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="bg-gold hover:bg-gold/90 text-black font-semibold"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isJoining ? 'Joining...' : 'Join Game'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Status Messages */}
        {game.status === 'waiting' && (
          <div className="text-center mt-6">
            {players.length < 2 && (
              <p className="text-white/70">
                Waiting for more players to join... (Need at least 2 players)
              </p>
            )}
            {players.length >= 2 && !allPlayersReady && (
              <p className="text-white/70">
                Waiting for all players to be ready...
              </p>
            )}
            {allPlayersReady && !isHost && (
              <p className="text-gold font-medium">
                All players ready! Waiting for host to start the game...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

