export interface Player {
  id: string;
  name: string;
  score: number;
  isEliminated: boolean;
  luckerBonanzaUsed: boolean;
}

export interface GameRound {
  id: string;
  roundNumber: number;
  scores: Record<string, number>; // playerId -> score for this round
  winner?: string; // playerId of round winner
  timestamp: Date;
}

export interface Game {
  id: string;
  name: string;
  players: Player[];
  scoreLimit: number;
  status: 'setup' | 'active' | 'finished';
  currentRound: number;
  rounds: GameRound[];
  winner?: Player;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardScore {
  card: string;
  value: number;
}

export const CARD_VALUES: Record<string, number> = {
  '2': 50,
  '3': 75,
  'A': 100,
  'Ace': 100,
  'Joker': 200,
  'J': 10,
  'Jack': 10,
  'Q': 10,
  'Queen': 10,
  'K': 10,
  'King': 10,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
};

export function calculateCardValue(card: string): number {
  return CARD_VALUES[card] || parseInt(card) || 0;
}