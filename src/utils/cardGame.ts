import { Card, Suit, Rank, SUITS, RANKS, GameState, CardGamePlayer } from '@/types/cards';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  // Create standard 52 cards
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
        isJoker: false,
      });
    }
  }
  
  // Add 2 jokers
  deck.push(
    {
      id: 'joker-1',
      suit: 'joker',
      rank: 'joker',
      isJoker: true,
    },
    {
      id: 'joker-2',
      suit: 'joker',
      rank: 'joker',
      isJoker: true,
    }
  );
  
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], playerCount: number): { hands: Card[][], remainingDeck: Card[] } {
  const hands: Card[][] = Array(playerCount).fill(null).map(() => []);
  const remainingDeck = [...deck];
  
  // Deal 4 cards to each player
  for (let i = 0; i < 4; i++) {
    for (let p = 0; p < playerCount; p++) {
      if (remainingDeck.length > 0) {
        hands[p].push(remainingDeck.pop()!);
      }
    }
  }
  
  return { hands, remainingDeck };
}

export function findValidStarter(deck: Card[]): { starter: Card, remainingDeck: Card[] } {
  const remainingDeck = [...deck];
  let starter: Card;
  
  do {
    if (remainingDeck.length === 0) {
      throw new Error('No valid starter found in deck');
    }
    starter = remainingDeck.pop()!;
  } while (!canCardStart(starter));
  
  return { starter, remainingDeck };
}

export function canCardStart(card: Card): boolean {
  const illegalStarters = ['2', '3', '8', 'A', 'J', 'Q', 'K', 'joker'];
  return !illegalStarters.includes(card.rank);
}

export function canPlayCard(card: Card, topCard: Card, gameState: GameState): boolean {
  // If there's a pending punishment, only specific cards can be played
  if (gameState.pendingPunishment.type) {
    if (gameState.pendingPunishment.type === '2') {
      return card.rank === '2' || card.rank === 'A' || card.isJoker;
    }
    if (gameState.pendingPunishment.type === '3') {
      return card.rank === '3' || card.rank === 'A' || card.isJoker;
    }
  }
  
  // If there's an exact card command from Joker
  if (gameState.activeCommand.type === 'exact-card') {
    return card.id === gameState.activeCommand.value || card.rank === 'A';
  }
  
  // If there's a question command (Queen/8), only non-action cards that match
  if (gameState.activeCommand.type === 'question') {
    const isNonAction = ['4', '5', '6', '7', '9', '10'].includes(card.rank);
    const matches = card.suit === topCard.suit || card.rank === topCard.rank;
    return isNonAction && matches;
  }
  
  // If there's a suit command from Ace
  if (gameState.activeCommand.type === 'suit') {
    return card.suit === gameState.activeCommand.value || card.rank === 'A' || card.isJoker;
  }
  
  // Normal play: match suit or rank, or play action cards
  return card.suit === topCard.suit || 
         card.rank === topCard.rank || 
         card.rank === 'A' || 
         card.isJoker;
}

export function getNextPlayerIndex(currentIndex: number, playerCount: number, direction: number, skip: number = 0): number {
  const totalSkip = 1 + skip; // 1 for normal turn progression + additional skips
  return (currentIndex + (direction * totalSkip) + playerCount) % playerCount;
}

export function calculateRoundScores(players: CardGamePlayer[]): Record<string, number> {
  const scores: Record<string, number> = {};
  
  players.forEach(player => {
    let totalScore = 0;
    player.hand.forEach(card => {
      if (card.isJoker) {
        totalScore += 200;
      } else if (card.rank === 'A') {
        totalScore += 100;
      } else if (card.rank === '3') {
        totalScore += 75;
      } else if (card.rank === '2') {
        totalScore += 50;
      } else if (['J', 'Q', 'K'].includes(card.rank)) {
        totalScore += 10;
      } else {
        // Number cards 4-10 have face value
        const numValue = parseInt(card.rank);
        totalScore += isNaN(numValue) ? 0 : numValue;
      }
    });
    scores[player.id] = totalScore;
  });
  
  return scores;
}

export function canDeclareDanger(player: CardGamePlayer, gameState: GameState): boolean {
  // Can't declare danger if already declared
  if (player.hasDeclaredDanger) return false;
  
  // Must have at least 1 card
  if (player.hand.length === 0) return false;
  
  // If you have exactly 1 card, you can always declare danger
  if (player.hand.length === 1) return true;
  
  // Get current top card to understand the active suit
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const currentSuit = topCard.suit;
  
  // For multiple cards, check if there's a REALISTIC path to win
  const nonActionCards = player.hand.filter(card => ['4', '5', '6', '7', '9', '10'].includes(card.rank));
  const actionCards = player.hand.filter(card => !['4', '5', '6', '7', '9', '10'].includes(card.rank));
  
  // If you have no non-action cards, you can't win - no danger declaration
  if (nonActionCards.length === 0) return false;
  
  // Check for Question/Answer scenarios (Q or 8) - REALISTIC WIN PATH
  const questionCards = player.hand.filter(card => ['Q', '8'].includes(card.rank));
  if (questionCards.length > 0 && nonActionCards.length > 0) {
    // You can play a question card and answer with a non-action card to win
    // BUT only if you have the right combination for a realistic win path
    // This is a realistic win path: Q/8 -> answer with non-action -> win
    // However, this only works if you can actually answer the question yourself
    // For now, let's be more conservative and not allow this scenario
    // unless there's a clear path to win
    return false; // Disabled until we can implement proper question/answer logic
  }
  
  // Check for two-player kickback scenarios (2 or 3) - REALISTIC WIN PATH
  const kickbackCards = player.hand.filter(card => ['2', '3'].includes(card.rank));
  if (kickbackCards.length > 0 && nonActionCards.length > 0) {
    // You can play kickback to force opponent to draw, then play non-action to win
    // This is a realistic win path: 2/3 -> opponent draws -> play non-action -> win
    return true;
  }
  
  // Check for Jump scenarios (K or J) - REALISTIC WIN PATH
  const jumpCards = player.hand.filter(card => ['K', 'J'].includes(card.rank));
  if (jumpCards.length > 0 && nonActionCards.length > 0) {
    // You can play jump to skip opponent, then play non-action to win
    // This is a realistic win path: K/J -> skip opponent -> play non-action -> win
    return true;
  }
  
  // Check for Ace scenarios - REALISTIC WIN PATH
  const aceCards = player.hand.filter(card => card.rank === 'A');
  if (aceCards.length > 0 && nonActionCards.length > 0) {
    // You can play Ace to command suit, then play non-action of that suit to win
    // This is a realistic win path: A -> command suit -> play non-action of that suit -> win
    return true;
  }
  
  // Check for Joker scenarios - REALISTIC WIN PATH
  const jokerCards = player.hand.filter(card => card.isJoker);
  if (jokerCards.length > 0 && nonActionCards.length > 0) {
    // You can play Joker to command exact card, then play that non-action card to win
    // This is a realistic win path: Joker -> command exact card -> play that card -> win
    return true;
  }
  
  // Check for multi-drop scenarios - REALISTIC WIN PATH
  const rankCounts: Record<string, number> = {};
  const suitCounts: Record<string, Record<string, number>> = {}; // rank -> suit -> count
  
  nonActionCards.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    
    // Track suits for each rank
    if (!suitCounts[card.rank]) {
      suitCounts[card.rank] = {};
    }
    suitCounts[card.rank][card.suit] = (suitCounts[card.rank][card.suit] || 0) + 1;
  });
  
  const multiDropRanks = ['5', '6', '7', '9', '10'];
  for (const rank of multiDropRanks) {
    // Check for all-four-suits strategy - ULTIMATE WIN PATH
    if (rankCounts[rank] && rankCounts[rank] >= 4) {
      const suitsForRank = suitCounts[rank];
      const uniqueSuits = Object.keys(suitsForRank).length;
      
      // If you have all 4 suits (hearts, diamonds, clubs, spades) of the same rank
      if (uniqueSuits === 4) {
        // This is the ultimate win path: you can adapt to any suit and multi-drop to win
        return true;
      }
    }
    
    // Check for multi-drop with 2+ cards - REALISTIC WIN PATH
    if (rankCounts[rank] && rankCounts[rank] >= 2) {
      // You can multi-drop these cards to reduce hand size and potentially win
      // This is a realistic win path: multi-drop -> reduce hand -> play last non-action -> win
      return true;
    }
  }
  
  // NEW: Check for positional danger - positioned to win next turn
  // This is the key insight: you can declare danger if you're positioned to win on your next turn
  // assuming the suit doesn't change
  
  // Check if you have non-action cards of the current suit
  const currentSuitNonActionCards = nonActionCards.filter(card => card.suit === currentSuit);
  
  if (currentSuitNonActionCards.length >= 2) {
    // You have multiple non-action cards of the current suit
    // You can play one now, and if opponent doesn't change suit, play another next turn to win
    // This is a realistic win path: play current suit -> opponent keeps suit -> play current suit -> win
    return true;
  }
  
  // Check if you have non-action cards that match the current rank
  const currentRankNonActionCards = nonActionCards.filter(card => card.rank === topCard.rank);
  
  if (currentRankNonActionCards.length >= 2) {
    // You have multiple non-action cards of the current rank
    // You can play one now, and if opponent plays same rank, play another next turn to win
    // This is a realistic win path: play current rank -> opponent plays same rank -> play current rank -> win
    return true;
  }
  
  // If none of the above conditions are met, there's no realistic path to win
  // Don't show danger declaration button for random card combinations
  return false;
}