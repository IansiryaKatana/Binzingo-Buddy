import { Card } from '@/types/cards';
import { cn } from '@/lib/utils';
import { Heart, Diamond, Spade, Club, Star } from 'lucide-react';

interface PlayingCardProps {
  card: Card;
  isSelected?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayingCard({ 
  card, 
  isSelected = false, 
  isPlayable = true, 
  onClick, 
  onDoubleClick,
  className,
  size = 'md'
}: PlayingCardProps) {
  const getSuitIcon = () => {
    if (card.isJoker) return <Star className="w-full h-full" />;
    
    switch (card.suit) {
      case 'hearts': return <Heart className="w-full h-full fill-current" />;
      case 'diamonds': return <Diamond className="w-full h-full fill-current" />;
      case 'clubs': return <Club className="w-full h-full fill-current" />;
      case 'spades': return <Spade className="w-full h-full fill-current" />;
      default: return null;
    }
  };

  const getSuitColor = () => {
    if (card.isJoker) return 'text-gold';
    return card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-gray-900';
  };

  const getCardSize = () => {
    switch (size) {
      case 'sm': return 'w-16 h-24';
      case 'md': return 'w-20 h-32';
      case 'lg': return 'w-24 h-36';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'md': return 'text-lg';
      case 'lg': return 'text-xl';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'md': return 'w-4 h-4';
      case 'lg': return 'w-5 h-5';
    }
  };

  const getCenterIconSize = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-12 h-12';
      case 'lg': return 'w-16 h-16';
    }
  };

  const getDisplayRank = () => {
    if (card.isJoker) return '★';
    if (card.rank === 'A') return 'A';
    if (card.rank === 'J') return 'J';
    if (card.rank === 'Q') return 'Q';
    if (card.rank === 'K') return 'K';
    return card.rank;
  };

  return (
    <div
      className={cn(
        "relative bg-white border border-gray-300 rounded-xl shadow-lg cursor-pointer transition-all duration-300 select-none",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white before:to-gray-50 before:rounded-xl before:-z-10",
        getCardSize(),
        isSelected && "ring-4 ring-gold ring-offset-2 scale-110 shadow-gold",
        !isPlayable && !onClick && "cursor-not-allowed",
        isPlayable && "hover:scale-105 hover:shadow-xl hover:-translate-y-1",
        card.isJoker && "border-gold",
        className
      )}
      onClick={isPlayable ? onClick : undefined}
      onDoubleClick={isPlayable ? onDoubleClick : undefined}
    >
      {/* Card border and background */}
      <div className="absolute inset-[3px] bg-white rounded-lg border border-gray-200">
        
        {/* Top left corner */}
        <div className={cn("absolute top-2 left-2 flex flex-col items-center", getSuitColor(), getTextSize())}>
          <span className="font-bold leading-none font-serif">
            {getDisplayRank()}
          </span>
          <div className={getIconSize()}>
            {getSuitIcon()}
          </div>
        </div>
        
        {/* Center design */}
        <div className="absolute inset-0 flex items-center justify-center">
          {card.isJoker ? (
            <div className="flex flex-col items-center">
              <div className={cn("text-gold mb-1", getCenterIconSize())}>
                <Star className="w-full h-full fill-current" />
              </div>
              <span className="text-gold font-bold text-xs">JOKER</span>
            </div>
          ) : (
            <div className={cn("opacity-15", getSuitColor(), getCenterIconSize())}>
              {getSuitIcon()}
            </div>
          )}
        </div>
        
        {/* Bottom right corner (rotated) */}
        <div className={cn("absolute bottom-2 right-2 flex flex-col items-center rotate-180", getSuitColor(), getTextSize())}>
          <span className="font-bold leading-none font-serif">
            {getDisplayRank()}
          </span>
          <div className={getIconSize()}>
            {getSuitIcon()}
          </div>
        </div>

        {/* Card pattern decoration */}
        {!card.isJoker && (
          <>
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full bg-gradient-to-br from-transparent via-gray-100 to-transparent"></div>
            </div>
            
            {/* Middle rank display for face cards */}
            {['J', 'Q', 'K'].includes(card.rank) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn("font-bold opacity-20", getSuitColor())}>
                  <span className="text-4xl font-serif">{card.rank}</span>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Selection glow effect */}
        {isSelected && (
          <div className="absolute inset-0 bg-gold opacity-10 rounded-lg animate-pulse"></div>
        )}
      </div>
    </div>
  );
}