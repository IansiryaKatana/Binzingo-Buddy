import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { OnlineGame } from '@/hooks/useOnlineGame'
import { useAuth } from '@/hooks/useAuth'
import { 
  Plus, 
  Users, 
  Target, 
  Clock, 
  Play,
  RefreshCw,
  Crown
} from 'lucide-react'
import { toast } from 'sonner'

export default function OnlineGamesList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [games, setGames] = useState<OnlineGame[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          game_players (
            id,
            user_id,
            player_name,
            is_host
          )
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setGames(data || [])
    } catch (error) {
      console.error('Error fetching games:', error)
      toast.error('Failed to load games')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchGames()
  }

  const handleJoinGame = async (gameId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a game')
      return
    }

    try {
      // Check if user is already in this game
      const { data: existingPlayer } = await supabase
        .from('game_players')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_id', user.id)
        .single()

      if (existingPlayer) {
        navigate(`/online-game/${gameId}`)
        return
      }

      // Navigate to game lobby where they can join
      navigate(`/online-game/${gameId}`)
    } catch (error) {
      console.error('Error joining game:', error)
      toast.error('Failed to join game')
    }
  }

  useEffect(() => {
    fetchGames()

    // Set up real-time subscription for new games
    const channel = supabase
      .channel('online-games')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        () => {
          fetchGames()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-felt flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-white">Loading online games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-felt p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Target className="w-8 h-8 text-gold" />
              Online Games
            </h1>
            <p className="text-white/70 mt-1">
              Join existing games or create your own
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              onClick={() => navigate('/create-online-game')}
              className="bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Game
            </Button>
          </div>
        </div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Target className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Active Games
                </h3>
                <p className="text-white/70 mb-6">
                  Be the first to create a game and start playing!
                </p>
                <Button
                  onClick={() => navigate('/create-online-game')}
                  className="bg-gold hover:bg-gold/90 text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Game
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card key={game.id} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white mb-2">
                        {game.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(game.created_at)}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="border-green-400/50 text-green-400 bg-green-500/10"
                    >
                      Waiting
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Game Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <Users className="w-4 h-4" />
                        {game.current_players}/{game.max_players} Players
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Target className="w-4 h-4" />
                        {game.score_limit} Points
                      </div>
                    </div>

                    {/* Players Preview */}
                    <div className="space-y-2">
                      <p className="text-sm text-white/70">Players:</p>
                      <div className="flex items-center gap-2">
                        {/* This would need to be fetched separately or included in the query */}
                        <div className="flex -space-x-2">
                          {Array.from({ length: Math.min(game.current_players, 4) }).map((_, i) => (
                            <Avatar key={i} className="h-8 w-8 border-2 border-white/20">
                              <AvatarFallback className="bg-gold text-black text-xs font-semibold">
                                P{i + 1}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {game.current_players > 4 && (
                          <span className="text-xs text-white/50">
                            +{game.current_players - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Join Button */}
                    <Button
                      onClick={() => handleJoinGame(game.id)}
                      className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                      disabled={game.current_players >= game.max_players}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {game.current_players >= game.max_players ? 'Game Full' : 'Join Game'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
