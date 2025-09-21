import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface OnlinePlayer {
  id: string
  username: string
  email: string
  isOnline: boolean
  lastSeen: string
  gamesPlayed: number
  gamesWon: number
}

export function useOnlinePlayers() {
  const [players, setPlayers] = useState<OnlinePlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchOnlinePlayers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all users with their stats
      const { data: usersData, error: usersError } = await supabase
        .from('user_stats')
        .select(`
          user_id,
          games_played,
          games_won,
          auth.users!inner(
            id,
            email,
            user_metadata
          )
        `)

      if (usersError) throw usersError

      // Transform the data to our OnlinePlayer format
      const onlinePlayers: OnlinePlayer[] = usersData?.map((stat: any) => ({
        id: stat.user_id,
        username: stat.auth.users.user_metadata?.username || stat.auth.users.email.split('@')[0],
        email: stat.auth.users.email,
        isOnline: true, // For now, assume all users are online
        lastSeen: new Date().toISOString(),
        gamesPlayed: stat.games_played || 0,
        gamesWon: stat.games_won || 0
      })) || []

      // Filter out the current user
      const otherPlayers = onlinePlayers.filter(player => player.id !== user?.id)
      
      setPlayers(otherPlayers)
    } catch (err) {
      console.error('Error fetching online players:', err)
      setError('Failed to fetch online players')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchOnlinePlayers()
    }
  }, [user])

  return {
    players,
    loading,
    error,
    refetch: fetchOnlinePlayers
  }
}

