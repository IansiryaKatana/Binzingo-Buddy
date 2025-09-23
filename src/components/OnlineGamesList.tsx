import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StandardPageLayout } from '@/components/StandardPageLayout'
import { useIsMobile } from '@/hooks/use-mobile'
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
  const isMobile = useIsMobile()

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
      <StandardPageLayout
        title="Online Games"
        showBackButton={true}
        backPath="/online"
        showHelp={true}
        showProfile={true}
        showGameInvitations={true}
        useHomepageBackground={true}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className={`animate-spin rounded-full ${isMobile ? 'h-8 w-8' : 'h-12 w-12'} border-b-2 border-gold mx-auto mb-4`}></div>
            <p className={`${isMobile ? 'text-base' : 'text-lg'} text-white`}>Loading online games...</p>
          </div>
        </div>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title="Online Games"
      showBackButton={true}
      backPath="/online"
      showHelp={true}
      showProfile={true}
      showGameInvitations={true}
      useHomepageBackground={true}
    >
      <div className="max-w-6xl mx-auto">
        {/* Page Description */}
        <div className={`${isMobile ? 'mb-4' : 'mb-6'} text-center`}>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/80`}>
            Join existing games or create your own
          </p>
        </div>

        {/* Action Buttons */}
        <div className={`${isMobile ? 'mb-4' : 'mb-6'} flex ${isMobile ? 'flex-col gap-3' : 'flex-row justify-end gap-3'}`}>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="ios-button text-white border-white/30"
          >
            <RefreshCw className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {!isMobile && 'Refresh'}
          </Button>
          
          <Button
            onClick={() => navigate('/create-online-game')}
            className={`${isMobile ? 'w-full' : ''} bg-gold hover:bg-gold/90 text-black font-semibold`}
          >
            <Plus className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} mr-2`} />
            Create Game
          </Button>
        </div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <Card className={`${isMobile ? 'p-4' : 'p-6'} ios-card`}>
            <div className="text-center">
              <Target className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} text-white/50 mx-auto mb-4`} />
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white mb-2`}>
                No Active Games
              </h3>
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/70 mb-6`}>
                Be the first to create a game and start playing!
              </p>
              <Button
                onClick={() => navigate('/create-online-game')}
                className={`${isMobile ? 'w-full' : ''} bg-gold hover:bg-gold/90 text-black font-semibold`}
              >
                <Plus className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} mr-2`} />
                Create First Game
              </Button>
            </div>
          </Card>
        ) : (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {games.map((game) => (
              <Card key={game.id} className="ios-card hover:bg-white/15 transition-colors">
                <CardHeader className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-start justify-between'}`}>
                    <div className="flex-1">
                      <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} text-white mb-2`}>
                        {game.name}
                      </CardTitle>
                      <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                        <Clock className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        {formatTimeAgo(game.created_at)}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm'} border-green-400/50 text-green-400 bg-green-500/10`}
                    >
                      Waiting
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className={`${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
                  <div className="space-y-4">
                    {/* Game Info */}
                    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <div className="flex items-center gap-2 text-white/70">
                        <Users className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        {game.current_players}/{game.max_players} Players
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Target className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        {game.score_limit} Points
                      </div>
                    </div>

                    {/* Players Preview */}
                    <div className="space-y-2">
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>Players:</p>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {Array.from({ length: Math.min(game.current_players, 4) }).map((_, i) => (
                            <Avatar key={i} className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} border-2 border-white/20`}>
                              <AvatarFallback className={`bg-gold text-black ${isMobile ? 'text-xs' : 'text-xs'} font-semibold`}>
                                P{i + 1}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {game.current_players > 4 && (
                          <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-white/50`}>
                            +{game.current_players - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Join Button */}
                    <Button
                      onClick={() => handleJoinGame(game.id)}
                      className={`w-full ${isMobile ? 'text-sm py-2' : 'text-base py-3'} bg-gold hover:bg-gold/90 text-black font-semibold`}
                      disabled={game.current_players >= game.max_players}
                    >
                      <Play className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                      {game.current_players >= game.max_players ? 'Game Full' : 'Join Game'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StandardPageLayout>
  )
}
