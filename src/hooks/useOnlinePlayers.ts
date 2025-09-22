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

      // For now, return empty array to avoid database errors
      // This feature can be implemented later with proper online status tracking
      setPlayers([])
      
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

