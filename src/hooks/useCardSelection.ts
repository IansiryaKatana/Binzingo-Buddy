import { useState, useCallback } from 'react';
import { Card } from '@/types/cards';

export function useCardSelection() {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [jokerTargetCard, setJokerTargetCard] = useState<Card | null>(null);

  const toggleCardSelection = useCallback((card: Card) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      } else {
        // For multi-drop, only allow same rank cards
        if (prev.length > 0 && prev[0].rank !== card.rank) {
          return [card]; // Start new selection with different rank
        }
        return [...prev, card];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCards([]);
    setJokerTargetCard(null);
  }, []);

  const selectJokerTarget = useCallback((card: Card) => {
    setJokerTargetCard(card);
  }, []);

  return {
    selectedCards,
    jokerTargetCard,
    toggleCardSelection,
    clearSelection,
    selectJokerTarget,
  };
}