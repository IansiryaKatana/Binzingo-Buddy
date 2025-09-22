import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserProfile } from '@/components/UserProfile'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Plus, Users, Target, Clock, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateOnlineGame() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [gameName, setGameName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [scoreLimit, setScoreLimit] = useState(100)

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in to create a game')
      return
    }

    if (!gameName.trim()) {
      toast.error('Please enter a game name')
      return
    }

    setLoading(true)
    try {
      // Create the game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          name: gameName.trim(),
          status: 'waiting',
          max_players: maxPlayers,
          current_players: 0,
          score_limit: scoreLimit,
          created_by: user.id
        })
        .select()
        .single()

      if (gameError) throw gameError

      // Add the creator as the first player and host
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          game_id: gameData.id,
          user_id: user.id,
          player_name: user.user_metadata?.username || user.email.split('@')[0],
          is_host: true,
          is_ready: false
        })

      if (playerError) throw playerError

      // Update current players count
      await supabase
        .from('games')
        .update({ current_players: 1 })
        .eq('id', gameData.id)

      toast.success('Game created successfully!')
      navigate(`/online-game/${gameData.id}`)
    } catch (error) {
      console.error('Error creating game:', error)
      toast.error('Failed to create game. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header with Profile */}
      <div className="absolute top-4 right-4 z-50">
        <UserProfile />
      </div>
      
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/online')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Online Play
        </Button>

        <Card className="bg-gradient-card border-border shadow-card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center gap-2">
              <Plus className="w-6 h-6 text-gold" />
              Create Online Game
            </CardTitle>
            <p className="text-muted-foreground">
              Create a new game room for players to join and play together
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGame} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="game-name" className="text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-gold" />
                  Game Name
                </Label>
                <Input
                  id="game-name"
                  type="text"
                  placeholder="Enter a name for your game"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="bg-muted/50 border-border"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-players" className="text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold" />
                    Max Players
                  </Label>
                  <Select value={maxPlayers.toString()} onValueChange={(value) => setMaxPlayers(parseInt(value))}>
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="3">3 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score-limit" className="text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold" />
                    Score Limit
                  </Label>
                  <Input
                    id="score-limit"
                    type="number"
                    min="10"
                    max="1000"
                    placeholder="Enter score limit (e.g., 100)"
                    value={scoreLimit}
                    onChange={(e) => setScoreLimit(parseInt(e.target.value) || 100)}
                    className="bg-muted/50 border-border"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/online')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="casino"
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Game
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
