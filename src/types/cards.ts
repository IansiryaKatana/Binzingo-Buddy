export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit | 'joker';
  rank: Rank | 'joker';
  isJoker: boolean;
}

export interface GameState {
  deck: Card[];
  discardPile: Card[];
  players: CardGamePlayer[];
  currentPlayerIndex: number;
  direction: 1 | -1; // 1 for clockwise, -1 for counterclockwise
  gamePhase: 'dealing' | 'playing' | 'round-ended';
  pendingPunishment: {
    type: '2' | '3' | null;
    amount: number;
  };
  activeCommand: {
    type: 'suit' | 'exact-card' | 'question' | null;
    value: string | null;
    remainingTurns: number;
  };
  lastPlayedCards: Card[];
  roundWinner: string | null;
  waitingForAnswer?: string; // Player ID who needs to provide answer for question card
  selectedCards?: Card[]; // Cards selected for multi-drop
  turnTimer: {
    timeRemaining: number; // seconds remaining in current turn
    isActive: boolean; // whether timer is currently running
  };
}

export interface CardGamePlayer {
  id: string;
  name: string;
  hand: Card[];
  hasDeclaredDanger: boolean;
  isCardless: boolean;
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const ACTION_CARDS = ['2', '3', '8', 'A', 'J', 'Q', 'K', 'joker'];
export const NON_ACTION_CARDS = ['4', '5', '6', '7', '9', '10'];
export const ILLEGAL_STARTERS = ['2', '3', '8', 'A', 'J', 'Q', 'K', 'joker'];

export function isActionCard(card: Card): boolean {
  return ACTION_CARDS.includes(card.rank);
}

export function isNonActionCard(card: Card): boolean {
  return NON_ACTION_CARDS.includes(card.rank);
}

export function canCardStart(card: Card): boolean {
  return !ILLEGAL_STARTERS.includes(card.rank);
}