import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { GameState } from '@/types/cards'
import { toast } from 'sonner'

export interface OnlineGame {
  id: string
  name: string
  status: 'waiting' | 'active' | 'finished' | 'abandoned'
  max_players: number
  current_players: number
  score_limit: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface GamePlayer {
  id: string
  game_id: string
  user_id: string
  player_name: string
  is_host: boolean
  is_ready: boolean
  joined_at: string
}

export function useOnlineGame(gameId: string) {
  const [game, setGame] = useState<OnlineGame | null>(null)
  const [players, setPlayers] = useState<GamePlayer[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch game data
  const fetchGame = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (error) throw error
      setGame(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game')
      toast.error('Failed to load game')
    }
  }, [gameId])

  // Fetch players
  const fetchPlayers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .order('joined_at', { ascending: true })

      if (error) throw error
      setPlayers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch players')
      toast.error('Failed to load players')
    }
  }, [gameId])

  // Fetch game state
  const fetchGameState = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('game_states')
        .select('*')
        .eq('game_id', gameId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      setGameState(data?.state_data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game state')
      toast.error('Failed to load game state')
    }
  }, [gameId])

  // Join game
  const joinGame = useCallback(async (userId: string, playerName: string) => {
    try {
      const { error } = await supabase
        .from('game_players')
        .insert({
          game_id: gameId,
          user_id: userId,
          player_name: playerName,
          is_host: false,
          is_ready: false
        })

      if (error) throw error

      // Update current players count
      await supabase
        .from('games')
        .update({ 
          current_players: players.length + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId)

      toast.success('Joined game successfully!')
      await fetchPlayers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [gameId, players.length, fetchPlayers])

  // Leave game
  const leaveGame = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase
        .from('game_players')
        .delete()
        .eq('game_id', gameId)
        .eq('user_id', userId)

      if (error) throw error

      // Update current players count
      await supabase
        .from('games')
        .update({ 
          current_players: Math.max(0, players.length - 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId)

      toast.success('Left game successfully!')
      await fetchPlayers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave game'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [gameId, players.length, fetchPlayers])

  // Toggle ready status
  const toggleReady = useCallback(async (userId: string, isReady: boolean) => {
    try {
      const { error } = await supabase
        .from('game_players')
        .update({ is_ready: isReady })
        .eq('game_id', gameId)
        .eq('user_id', userId)

      if (error) throw error

      await fetchPlayers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ready status'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [gameId, fetchPlayers])

  // Start game
  const startGame = useCallback(async (initialGameState: GameState) => {
    try {
      // Update game status
      const { error: gameError } = await supabase
        .from('games')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId)

      if (gameError) throw gameError

      // Create initial game state
      const { error: stateError } = await supabase
        .from('game_states')
        .insert({
          game_id: gameId,
          state_data: initialGameState,
          current_player_index: 0,
          turn_timer: 45
        })

      if (stateError) throw stateError

      toast.success('Game started!')
      await fetchGame()
      await fetchGameState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start game'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [gameId, fetchGame, fetchGameState])

  // Update game state
  const updateGameState = useCallback(async (newGameState: GameState) => {
    try {
      const { error } = await supabase
        .from('game_states')
        .update({ 
          state_data: newGameState,
          updated_at: new Date().toISOString()
        })
        .eq('game_id', gameId)

      if (error) throw error
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update game state'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [gameId])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!gameId) return

    // Initial data fetch
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchGame(), fetchPlayers(), fetchGameState()])
      setLoading(false)
    }

    loadData()

    // Subscribe to real-time updates
    const gameChannel = supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => {
          setGame(payload.new as OnlineGame)
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${gameId}` },
        () => {
          fetchPlayers()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_states', filter: `game_id=eq.${gameId}` },
        (payload) => {
          setGameState(payload.new?.state_data || null)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(gameChannel)
    }
  }, [gameId, fetchGame, fetchPlayers, fetchGameState])

  // Timer effect for automatic card draw
  useEffect(() => {
    if (!gameState || !gameState.turnTimer.isActive || gameState.gamePhase !== 'playing') {
      return;
    }


    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start new timer
    timerRef.current = setInterval(() => {
      setGameState(prevState => {
        if (!prevState || !prevState.turnTimer.isActive) return prevState;

        const newTimeRemaining = prevState.turnTimer.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          // Timer expired - automatically draw a card for current player
          const currentPlayer = prevState.players[prevState.currentPlayerIndex];
          
          if (prevState.deck.length === 0) {
            toast.error('No cards left in deck!');
            return prevState;
          }

          const newGameState = { ...prevState };
          const drawnCard = newGameState.deck.pop()!;
          newGameState.players[prevState.currentPlayerIndex].hand.push(drawnCard);
          
          // Move to next player
          newGameState.currentPlayerIndex = (prevState.currentPlayerIndex + 1) % prevState.players.length;
          
          // Reset timer for next player
          newGameState.turnTimer = { timeRemaining: 45, isActive: true };
          
          toast.info(`${currentPlayer.name} drew a card automatically (time expired)`);
          
          // Update the game state in the database
          updateGameState(newGameState);
          
          return newGameState;
        } else {
          // Update timer
          return {
            ...prevState,
            turnTimer: { ...prevState.turnTimer, timeRemaining: newTimeRemaining }
          };
        }
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState?.turnTimer.isActive, gameState?.currentPlayerIndex, gameState?.gamePhase, updateGameState]);

  return {
    game,
    players,
    gameState,
    loading,
    error,
    joinGame,
    leaveGame,
    toggleReady,
    startGame,
    updateGameState
  }
}

