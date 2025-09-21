import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, GameState, CardGamePlayer } from '@/types/cards';
import { 
  createDeck, 
  dealCards, 
  findValidStarter, 
  canPlayCard, 
  getNextPlayerIndex,
  calculateRoundScores,
  canDeclareDanger
} from '@/utils/cardGame';
import { Player } from '@/types/game';
import { toast } from 'sonner';

export function useCardGame(players: Player[]) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [botPlayers, setBotPlayers] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initializeGame = useCallback((withBots = false) => {
    if (players.length < 1) {
      toast.error('Need at least 1 player to start');
      return;
    }

    let allPlayers = [...players];
    let botPlayerIds: string[] = [];
    
    // Add bot players if requested
    if (withBots) {
      const botNames = ['AI Bot 1', 'AI Bot 2', 'AI Bot 3'];
      let botsNeeded = 0;
      
      // If only 1 human player, add just 1 bot for one-on-one play
      if (players.length === 1) {
        botsNeeded = 1;
      } else {
        // For multiple players, fill up to 4 total players
        botsNeeded = Math.min(3, 4 - players.length);
      }
      
      for (let i = 0; i < botsNeeded; i++) {
        const botId = `bot-${i + 1}`;
        allPlayers.push({
          id: botId,
          name: botNames[i],
          score: 0,
          isEliminated: false,
          luckerBonanzaUsed: false
        });
        botPlayerIds.push(botId);
      }
    }

    const deck = createDeck();
    const { hands, remainingDeck } = dealCards(deck, allPlayers.length);
    const { starter, remainingDeck: finalDeck } = findValidStarter(remainingDeck);

    const cardPlayers: CardGamePlayer[] = allPlayers.map((player, index) => ({
      id: player.id,
      name: player.name,
      hand: hands[index],
      hasDeclaredDanger: false,
      isCardless: false,
    }));

    const initialState: GameState = {
      deck: finalDeck,
      discardPile: [starter],
      players: cardPlayers,
      currentPlayerIndex: 0,
      direction: 1,
      gamePhase: 'playing',
      pendingPunishment: { type: null, amount: 0 },
      activeCommand: { type: null, value: null, remainingTurns: 0 },
      lastPlayedCards: [],
      roundWinner: null,
      turnTimer: { timeRemaining: 45, isActive: true },
    };

    setGameState(initialState);
    setIsGameActive(true);
    setBotPlayers(botPlayerIds);
    toast.success(`Card game started with ${allPlayers.length} players!`);
  }, [players]);

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
          newGameState.currentPlayerIndex = getNextPlayerIndex(
            prevState.currentPlayerIndex,
            prevState.players.length,
            prevState.direction
          );
          
          // Reset timer for next player
          newGameState.turnTimer = { timeRemaining: 45, isActive: true };
          
          toast.info(`${currentPlayer.name} drew a card automatically (time expired)`);
          
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
  }, [gameState?.turnTimer.isActive, gameState?.currentPlayerIndex, gameState?.gamePhase]);

  const playCard = useCallback((playerId: string, cards: Card[], exactCardId?: string) => {
    if (!gameState || gameState.gamePhase !== 'playing') return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      toast.error('Not your turn!');
      return;
    }

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    
    // Validate all cards can be played
    if (!cards.every(card => canPlayCard(card, topCard, gameState))) {
      toast.error('Invalid card play!');
      return;
    }

    // Multi-drop validation - must be same rank and specific combinations
    if (cards.length > 1) {
      const firstRank = cards[0].rank;
      if (!cards.every(card => card.rank === firstRank) || cards[0].isJoker) {
        toast.error('Multi-drop cards must be same rank (no Jokers)!');
        return;
      }
      
      // Allow specific multidrop combinations
      const validMultiDropRanks = ['J', 'K', '5', '6', '7', '9', '10'];
      if (!validMultiDropRanks.includes(firstRank)) {
        toast.error('This rank cannot be multi-dropped!');
        return;
      }
    }

    const newGameState = { ...gameState };
    
    // Check if command is fulfilled before processing
    const mainCard = cards[0];
    let commandFulfilled = false;
    
    if (newGameState.activeCommand.type === 'exact-card' && mainCard.id === newGameState.activeCommand.value) {
      commandFulfilled = true;
    } else if (newGameState.activeCommand.type === 'suit' && mainCard.suit === newGameState.activeCommand.value && !mainCard.isJoker && mainCard.rank !== 'A') {
      commandFulfilled = true;
    }
    
    // Remove cards from player's hand
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
    newGameState.players[playerIndex].hand = newGameState.players[playerIndex].hand.filter(
      handCard => !cards.some(playedCard => playedCard.id === handCard.id)
    );

    // Add cards to discard pile
    newGameState.discardPile.push(...cards);
    newGameState.lastPlayedCards = cards;

    // Process card effects
    let skipCount = 0;
    let directionChanges = 0;

    cards.forEach(card => {
      switch (card.rank) {
        case '2':
          if (newGameState.pendingPunishment.type === '2') {
            newGameState.pendingPunishment.amount += 2;
          } else if (newGameState.pendingPunishment.type === null) {
            newGameState.pendingPunishment = { type: '2', amount: 2 };
          }
          break;
          
        case '3':
          if (newGameState.pendingPunishment.type === '3') {
            newGameState.pendingPunishment.amount += 3;
          } else if (newGameState.pendingPunishment.type === null) {
            newGameState.pendingPunishment = { type: '3', amount: 3 };
          }
          break;
          
        case 'A': // Ace - suit command
          if (cards.length === 1) {
            // Cancel any punishment or command
            newGameState.pendingPunishment = { type: null, amount: 0 };
            newGameState.activeCommand = { type: null, value: null, remainingTurns: 0 };
            
            // For Ace, we need to get the exact card target to determine suit
            if (!exactCardId) {
              throw new Error('Ace requires exact card selection for suit command');
            }
            const targetCard = newGameState.players[playerIndex]?.hand.find(card => card.id === exactCardId);
            if (!targetCard) {
              throw new Error('Target card not found in player hand');
            }
            newGameState.activeCommand = {
              type: 'suit',
              value: targetCard.suit === 'joker' ? 'hearts' : targetCard.suit,
              remainingTurns: 3
            };
          }
          break;
          
        case 'J':
          skipCount++;
          break;
          
        case 'Q':
        case '8':
          // Question cards require immediate answer
          newGameState.activeCommand = { 
            type: 'question', 
            value: null, 
            remainingTurns: 1 
          };
          // The player who played the question must immediately provide an answer
          newGameState.waitingForAnswer = playerId;
          break;
          
        case 'K':
          directionChanges++;
          break;
          
        case 'joker':
          // Cancel punishment, set exact card command
          newGameState.pendingPunishment = { type: null, amount: 0 };
          // Require exact card specification
          if (!exactCardId) {
            toast.error('You must specify which exact card to command when playing a Joker!');
            return;
          }
          newGameState.activeCommand = { 
            type: 'exact-card', 
            value: exactCardId, 
            remainingTurns: 999 
          };
          break;
      }
    });

    // Apply direction changes
    if (directionChanges % 2 === 1) {
      newGameState.direction *= -1;
    }

    // Check if player won the round
    if (newGameState.players[playerIndex].hand.length === 0) {
      const lastCard = cards[cards.length - 1];
      if (['4', '5', '6', '7', '9', '10'].includes(lastCard.rank)) {
        // Valid win with non-action card
        newGameState.gamePhase = 'round-ended';
        newGameState.roundWinner = playerId;
        toast.success(`${currentPlayer.name} wins the round with GAMEHOT!`);
      } else {
        // Cardless but can't win with action card
        newGameState.players[playerIndex].isCardless = true;
        toast.info(`${currentPlayer.name} is cardless but must draw next turn`);
      }
    }

    // Move to next player
    if (newGameState.gamePhase === 'playing') {
      newGameState.currentPlayerIndex = getNextPlayerIndex(
        newGameState.currentPlayerIndex,
        newGameState.players.length,
        newGameState.direction,
        skipCount
      );
      
      // Reset timer for next player
      newGameState.turnTimer = { timeRemaining: 45, isActive: true };
      
      // Clear command if fulfilled or decrease remaining turns
      if (commandFulfilled) {
        newGameState.activeCommand = { type: null, value: null, remainingTurns: 0 };
      } else if (newGameState.activeCommand.remainingTurns > 0) {
        newGameState.activeCommand.remainingTurns--;
        if (newGameState.activeCommand.remainingTurns === 0) {
          newGameState.activeCommand = { type: null, value: null, remainingTurns: 0 };
        }
      }
    }

    setGameState(newGameState);
    
    // Handle bot turn after state update
    if (newGameState.gamePhase === 'playing') {
      const nextPlayer = newGameState.players[newGameState.currentPlayerIndex];
      if (botPlayers.includes(nextPlayer.id)) {
        // Delay bot action to make it feel more natural
        setTimeout(() => {
          handleBotTurn(nextPlayer.id);
        }, 1500 + Math.random() * 1000);
      }
    }
  }, [gameState, botPlayers]);

  const drawCard = useCallback((playerId: string) => {
    if (!gameState || gameState.gamePhase !== 'playing') return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      toast.error('Not your turn!');
      return;
    }

    if (gameState.deck.length === 0) {
      toast.error('No cards left to draw!');
      return;
    }

    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
    
    // Handle cardless players
    if (newGameState.players[playerIndex].isCardless) {
      newGameState.players[playerIndex].isCardless = false;
    }

    // Handle pending punishment
    if (newGameState.pendingPunishment.type) {
      const drawAmount = newGameState.pendingPunishment.amount;
      for (let i = 0; i < drawAmount && newGameState.deck.length > 0; i++) {
        const card = newGameState.deck.pop()!;
        newGameState.players[playerIndex].hand.push(card);
        // Trigger draw animation
        setTimeout(() => {
          // Animation would be handled by CSS classes
        }, i * 100);
      }
      newGameState.pendingPunishment = { type: null, amount: 0 };
      toast.info(`Drew ${drawAmount} cards for punishment`);
    } else {
      // Normal draw with animation
      const card = newGameState.deck.pop()!;
      newGameState.players[playerIndex].hand.push(card);
      toast.info('Drew 1 card');
    }

    // Move to next player
    newGameState.currentPlayerIndex = getNextPlayerIndex(
      newGameState.currentPlayerIndex,
      newGameState.players.length,
      newGameState.direction
    );

    // Reset timer for next player
    newGameState.turnTimer = { timeRemaining: 45, isActive: true };

    setGameState(newGameState);
    
    // Handle bot turn after draw
    const nextPlayer = newGameState.players[newGameState.currentPlayerIndex];
    if (botPlayers.includes(nextPlayer.id)) {
      setTimeout(() => {
        handleBotTurn(nextPlayer.id);
      }, 1500 + Math.random() * 1000);
    }
  }, [gameState, botPlayers]);

  const declareDanger = useCallback((playerId: string) => {
    if (!gameState) return;
    
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = gameState.players[playerIndex];
    
    // Check if player can declare danger using the new logic
    if (!canDeclareDanger(player, gameState)) {
      toast.error('Cannot declare danger with current hand!');
      return;
    }

    const newGameState = { ...gameState };
    newGameState.players[playerIndex].hasDeclaredDanger = true;
    setGameState(newGameState);
    
    toast.success(`${player.name} declared DANGER!`);
  }, [gameState]);

  const declareGamehot = useCallback((playerId: string) => {
    if (!gameState) return;
    
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    // Check if player can win
    const canWin = player.hand.length === 1 && 
      player.hand.every(card => ['4', '5', '6', '7', '9', '10'].includes(card.rank));

    if (canWin) {
      const newGameState = { ...gameState };
      newGameState.gamePhase = 'round-ended';
      newGameState.roundWinner = playerId;
      
      // Remove the last card
      const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
      newGameState.players[playerIndex].hand = [];
      newGameState.discardPile.push(...player.hand);
      
      setGameState(newGameState);
      toast.success(`${player.name} wins with GAMEHOT!`);
    } else {
      toast.error('Cannot declare GAMEHOT with action cards or multiple cards!');
    }
  }, [gameState]);

  const getRoundScores = useCallback(() => {
    if (!gameState) return {};
    return calculateRoundScores(gameState.players);
  }, [gameState]);

  const handleBotTurn = useCallback((botId: string) => {
    if (!gameState || gameState.gamePhase !== 'playing') return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== botId) return;

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    
    // Use shared validation to respect active commands (e.g., Ace suit command)
    const playableCards = currentPlayer.hand.filter(card => 
      canPlayCard(card, topCard, gameState)
    );

    if (playableCards.length > 0) {
      // Bot strategy: play the first valid card (simple AI)
      const cardToPlay = playableCards[0];
      
      // Declare danger if down to 2 cards
      if (currentPlayer.hand.length === 2 && !currentPlayer.hasDeclaredDanger) {
        declareDanger(botId);
        setTimeout(() => {
          if (cardToPlay.rank === 'A') {
            playCard(botId, [cardToPlay], cardToPlay.id);
          } else {
            playCard(botId, [cardToPlay]);
          }
        }, 500);
      } else {
        if (cardToPlay.rank === 'A') {
          playCard(botId, [cardToPlay], cardToPlay.id);
        } else {
          playCard(botId, [cardToPlay]);
        }
      }
    } else {
      // No playable cards, draw one
      drawCard(botId);
    }
  }, [gameState, playCard, drawCard, declareDanger]);

  // Auto-handle bot turns
  useEffect(() => {
    if (!gameState || gameState.gamePhase !== 'playing') return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (botPlayers.includes(currentPlayer.id)) {
      const timer = setTimeout(() => {
        handleBotTurn(currentPlayer.id);
      }, 1500 + Math.random() * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPlayerIndex, gameState?.gamePhase, botPlayers, handleBotTurn]);

  const resetGame = useCallback(() => {
    setGameState(null);
    setIsGameActive(false);
    setBotPlayers([]);
  }, []);

  const playQuestionAnswer = useCallback((playerId: string, answerCard: Card) => {
    if (!gameState || !gameState.waitingForAnswer || gameState.waitingForAnswer !== playerId) {
      return;
    }

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const isValidAnswer = ['4', '5', '6', '7', '9', '10'].includes(answerCard.rank) &&
                         (answerCard.suit === topCard.suit || answerCard.rank === topCard.rank);

    if (!isValidAnswer) {
      toast.error('Invalid answer card!');
      return;
    }

    const newGameState = { ...gameState };
    
    // Remove answer card from player's hand
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
    newGameState.players[playerIndex].hand = newGameState.players[playerIndex].hand.filter(
      card => card.id !== answerCard.id
    );

    // Add answer card to discard pile
    newGameState.discardPile.push(answerCard);
    newGameState.lastPlayedCards = [answerCard];

    // Clear waiting state
    delete newGameState.waitingForAnswer;

    // Move to next player
    newGameState.currentPlayerIndex = getNextPlayerIndex(
      newGameState.currentPlayerIndex,
      newGameState.players.length,
      newGameState.direction
    );

    setGameState(newGameState);
    toast.success('Answer provided!');
  }, [gameState]);

  const drawForQuestionAnswer = useCallback((playerId: string) => {
    if (!gameState || !gameState.waitingForAnswer || gameState.waitingForAnswer !== playerId) {
      return;
    }

    if (gameState.deck.length === 0) {
      toast.error('No cards left to draw!');
      return;
    }

    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
    
    // Draw a card
    const card = newGameState.deck.pop()!;
    newGameState.players[playerIndex].hand.push(card);

    // Clear waiting state
    delete newGameState.waitingForAnswer;

    // Move to next player
    newGameState.currentPlayerIndex = getNextPlayerIndex(
      newGameState.currentPlayerIndex,
      newGameState.players.length,
      newGameState.direction
    );

    setGameState(newGameState);
    toast.info('Drew a card instead of answering');
  }, [gameState]);

  return {
    gameState,
    isGameActive,
    botPlayers,
    initializeGame,
    playCard,
    drawCard,
    declareDanger,
    declareGamehot,
    getRoundScores,
    resetGame,
    playQuestionAnswer,
    drawForQuestionAnswer,
  };
}