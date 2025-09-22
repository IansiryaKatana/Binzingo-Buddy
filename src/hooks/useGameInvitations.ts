import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface GameInvitation {
  id: string
  game_id: string
  game_name: string
  host_name: string
  max_players: number
  current_players: number
  score_limit: number
  created_at: string
}

export function useGameInvitations() {
  const [invitations, setInvitations] = useState<GameInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchInvitations = async () => {
    if (!user) {
      setInvitations([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get games where the current user is invited (in game_players but not the host)
      const { data: gameInvitations, error: invitationsError } = await supabase
        .from('game_players')
        .select(`
          game_id,
          is_host,
          games!inner(
            id,
            name,
            max_players,
            current_players,
            score_limit,
            created_at,
            game_players!inner(
              user_id,
              player_name,
              is_host
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_host', false)
        .eq('games.status', 'waiting')

      if (invitationsError) throw invitationsError

      // Transform the data to our GameInvitation format
      const transformedInvitations: GameInvitation[] = gameInvitations?.map((invitation: any) => {
        const game = invitation.games
        const host = game.game_players.find((p: any) => p.is_host)
        
        return {
          id: game.id,
          game_id: game.id,
          game_name: game.name,
          host_name: host?.player_name || 'Unknown Host',
          max_players: game.max_players,
          current_players: game.current_players,
          score_limit: game.score_limit,
          created_at: game.created_at
        }
      }) || []

      setInvitations(transformedInvitations)
    } catch (err) {
      console.error('Error fetching game invitations:', err)
      setError('Failed to fetch game invitations')
      setInvitations([])
    } finally {
      setLoading(false)
    }
  }

  const removeInvitation = async (gameId: string) => {
    if (!user) return

    try {
      // Remove the user from the game
      const { error } = await supabase
        .from('game_players')
        .delete()
        .eq('game_id', gameId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update the invitations list
      setInvitations(prev => prev.filter(inv => inv.game_id !== gameId))
      
      // Update the game's current players count
      await supabase
        .from('games')
        .update({ 
          current_players: supabase.raw('current_players - 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId)

    } catch (err) {
      console.error('Error removing invitation:', err)
    }
  }

  useEffect(() => {
    fetchInvitations()

    // Set up real-time subscription for new invitations
    if (user) {
      const channel = supabase
        .channel('game-invitations')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'game_players' },
          (payload) => {
            // Check if this affects the current user
            if (payload.new?.user_id === user.id || payload.old?.user_id === user.id) {
              fetchInvitations()
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  return {
    invitations,
    loading,
    error,
    refetch: fetchInvitations,
    removeInvitation
  }
}
