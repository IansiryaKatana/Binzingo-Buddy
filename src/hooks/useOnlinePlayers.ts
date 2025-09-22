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
  const [loading, setLoading] = useState(false) // Set to false to avoid loading state
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchOnlinePlayers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all users from user_stats table (these are all signed-in users)
      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select(`
          user_id,
          display_name,
          games_played,
          games_won,
          created_at
        `)
        .neq('user_id', user?.id) // Exclude current user
        .order('created_at', { ascending: false })
        .limit(20)


      if (statsError) {
        console.log('Error fetching user stats:', statsError)
        setPlayers([])
        return
      }

      if (!userStats || userStats.length === 0) {
        setPlayers([])
        return
      }

      // Convert user_stats to online players with real display names
      const onlinePlayers = userStats.map((stat: any) => ({
        id: stat.user_id,
        username: stat.display_name || `Player_${stat.user_id.slice(0, 8)}`,
        email: '',
        isOnline: true,
        lastSeen: stat.created_at, // Use created_at as last seen
        gamesPlayed: stat.games_played || 0,
        gamesWon: stat.games_won || 0
      }))
      
      setPlayers(onlinePlayers)
      
    } catch (err) {
      console.error('Error fetching online players:', err)
      setError('Failed to fetch online players')
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch if user is authenticated
    if (user) {
      fetchOnlinePlayers()
    } else {
      setPlayers([])
      setLoading(false)
    }
  }, [user])

  return {
    players,
    loading,
    error,
    refetch: fetchOnlinePlayers
  }
}

