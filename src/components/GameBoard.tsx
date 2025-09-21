import { Card, GameState, CardGamePlayer } from '@/types/cards';
import { PlayingCard } from './PlayingCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { canDeclareDanger } from '@/utils/cardGame';
import { 
  RefreshCw, 
  AlertTriangle, 
  Crown, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Target,
  Clock
} from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onCardPlay: (cards: Card[]) => void;
  onDrawCard: () => void;
  onDeclareDanger: () => void;
  onDeclareGamehot: () => void;
}

export function GameBoard({ 
  gameState, 
  currentPlayerId, 
  onCardPlay, 
  onDrawCard, 
  onDeclareDanger,
  onDeclareGamehot 
}: GameBoardProps) {
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const isCurrentPlayerTurn = gameState.players[gameState.currentPlayerIndex]?.id === currentPlayerId;
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  
  if (!currentPlayer || !topCard) {
    return <div>Loading game...</div>;
  }

  const canDeclareGamehot = currentPlayer.hand.length === 1 && 
    currentPlayer.hand.every(card => ['4', '5', '6', '7', '9', '10'].includes(card.rank));

  return (
    <div className="min-h-screen bg-gradient-felt p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Game Status */}
        <div className="mb-6 bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-foreground border-white/30">
                <Users className="w-4 h-4 mr-1" />
                {gameState.players.length} Players
              </Badge>
              <Badge variant="outline" className="text-foreground border-white/30">
                <Target className="w-4 h-4 mr-1" />
                Cards Left: {gameState.deck.length}
              </Badge>
              <div className="flex items-center gap-1 text-white">
                {gameState.direction === 1 ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span className="text-sm">Turn Direction</span>
              </div>
              
              {/* Turn Timer */}
              {gameState.turnTimer.isActive && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white" />
                  <div className={cn(
                    "text-sm font-mono font-bold px-2 py-1 rounded",
                    gameState.turnTimer.timeRemaining <= 10 
                      ? "bg-red-500 text-white" 
                      : gameState.turnTimer.timeRemaining <= 20 
                        ? "bg-yellow-500 text-black"
                        : "bg-green-500 text-white"
                  )}>
                    {gameState.turnTimer.timeRemaining}s
                  </div>
                  <span className="text-white/80 text-xs">Turn Timer</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Active Commands/Punishments */}
          {gameState.pendingPunishment.type && (
            <Badge variant="destructive" className="mr-2">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Draw {gameState.pendingPunishment.amount} ({gameState.pendingPunishment.type})
            </Badge>
          )}
          
          {gameState.activeCommand.type && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30">
                <Target className="w-4 h-4 mr-1" />
                Active Command
              </Badge>
              <div className="text-white/90 text-sm">
                {gameState.activeCommand.type === 'suit' && (
                  <span>Must play <span className="font-bold text-gold">{gameState.activeCommand.value}</span> suit</span>
                )}
                {gameState.activeCommand.type === 'exact-card' && (
                  <span>Must play exact card: <span className="font-bold text-gold">{gameState.activeCommand.value}</span></span>
                )}
                {gameState.activeCommand.type === 'question' && (
                  <span>Must answer question with non-action card</span>
                )}
                <span className="text-white/60 ml-2">({gameState.activeCommand.remainingTurns} turns left)</span>
              </div>
            </div>
          )}
        </div>

        {/* Game Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Other Players */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-white font-semibold mb-2">Other Players</h3>
            <div className="grid gap-3">
              {gameState.players.filter(p => p.id !== currentPlayerId).map((player, index) => (
                <div
                  key={player.id}
                  className={cn(
                    "bg-white/10 rounded-lg p-3 border",
                    gameState.players[gameState.currentPlayerIndex]?.id === player.id 
                      ? "border-gold shadow-gold" 
                      : "border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{player.name}</span>
                      {gameState.players[gameState.currentPlayerIndex]?.id === player.id && (
                        <Crown className="w-4 h-4 text-gold" />
                      )}
                      {player.hasDeclaredDanger && (
                        <Badge variant="destructive" className="text-xs">DANGER!</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-white border-white/30">
                      {player.hand.length} cards
                    </Badge>
                  </div>
                  
                  {/* Show card backs with commanded cards face-up */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {player.hand.slice(0, Math.min(player.hand.length, 8)).map((card, cardIndex) => {
                      // Check if this card is commanded
                      const isCommanded = gameState.activeCommand.type === 'exact-card' && 
                        gameState.activeCommand.value === card.id;
                      const isCommandedSuit = gameState.activeCommand.type === 'suit' && 
                        gameState.activeCommand.value === card.suit;
                      
                      if (isCommanded || isCommandedSuit) {
                        // Show commanded card face-up with special styling
                        return (
                          <div
                            key={cardIndex}
                            className="relative"
                          >
                            <PlayingCard 
                              card={card} 
                              isPlayable={false}
                              className="w-8 h-11 border-2 border-gold shadow-gold"
                            />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full border border-white flex items-center justify-center">
                              <Target className="w-2 h-2 text-white" />
                            </div>
                          </div>
                        );
                      } else {
                        // Show regular card back
                        return (
                          <div
                            key={cardIndex}
                            className="w-8 h-11 bg-gradient-card border border-border rounded shadow-sm"
                          />
                        );
                      }
                    })}
                    {player.hand.length > 8 && (
                      <span className="text-white/60 text-xs self-end">
                        +{player.hand.length - 8} more
                      </span>
                    )}
                  </div>
                  
                  {/* Show commanded card info */}
                  {gameState.activeCommand.type === 'exact-card' && 
                   player.hand.some(card => card.id === gameState.activeCommand.value) && (
                    <div className="mt-2 text-xs text-gold bg-gold/10 rounded px-2 py-1 border border-gold/20">
                      <Target className="w-3 h-3 inline mr-1" />
                      Has commanded card!
                    </div>
                  )}
                  
                  {gameState.activeCommand.type === 'suit' && 
                   player.hand.some(card => card.suit === gameState.activeCommand.value) && (
                    <div className="mt-2 text-xs text-gold bg-gold/10 rounded px-2 py-1 border border-gold/20">
                      <Target className="w-3 h-3 inline mr-1" />
                      Has {gameState.activeCommand.value} suit cards!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center Area - Discard Pile & Deck */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-white font-semibold">Game Center</h3>
            
            <div className="flex gap-4 items-center">
              {/* Deck */}
              <div className="text-center">
                <div className="w-16 h-22 bg-gradient-card border-2 border-border rounded-lg shadow-card mb-2 relative deck-pile">
                  <div className="absolute inset-0 flex items-center justify-center text-white/60">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  {/* Card draw animation placeholder */}
                  <div className="absolute inset-0 card-draw-animation opacity-0 pointer-events-none">
                    <div className="w-full h-full bg-gradient-card border border-border rounded-lg"></div>
                  </div>
                </div>
                <span className="text-white/80 text-sm">{gameState.deck.length} left</span>
              </div>
              
              {/* Discard Pile */}
              <div className="text-center">
                <PlayingCard card={topCard} isPlayable={false} />
                <span className="text-white/80 text-sm mt-2 block">Top Card</span>
              </div>
            </div>
            
            {/* Commanded Cards Display */}
            {gameState.activeCommand.type && (
              <div className="mt-4 p-3 bg-gold/10 rounded-lg border border-gold/30 backdrop-blur-sm">
                <div className="text-center mb-2">
                  <div className="flex items-center justify-center gap-2 text-gold">
                    <Target className="w-4 h-4" />
                    <span className="font-semibold">Active Command</span>
                  </div>
                </div>
                
                {gameState.activeCommand.type === 'exact-card' && (
                  <div className="text-center">
                    <p className="text-white/90 text-sm mb-2">Players must play this exact card:</p>
                    <div className="flex justify-center">
                      <PlayingCard 
                        card={gameState.players.flatMap(p => p.hand).find(card => card.id === gameState.activeCommand.value) || topCard} 
                        isPlayable={false}
                        className="border-2 border-gold shadow-gold"
                      />
                    </div>
                    <p className="text-gold text-xs mt-2 font-medium">
                      {gameState.activeCommand.remainingTurns} turns remaining
                    </p>
                  </div>
                )}
                
                {gameState.activeCommand.type === 'suit' && (
                  <div className="text-center">
                    <p className="text-white/90 text-sm mb-2">Players must play this suit:</p>
                    <div className="flex justify-center">
                      <div className="w-12 h-16 bg-gradient-card border-2 border-gold rounded-lg shadow-gold flex items-center justify-center">
                        <span className="text-gold font-bold text-lg">
                          {gameState.activeCommand.value === 'hearts' && '♥'}
                          {gameState.activeCommand.value === 'diamonds' && '♦'}
                          {gameState.activeCommand.value === 'clubs' && '♣'}
                          {gameState.activeCommand.value === 'spades' && '♠'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gold text-xs mt-2 font-medium">
                      {gameState.activeCommand.remainingTurns} turns remaining
                    </p>
                  </div>
                )}
                
                {gameState.activeCommand.type === 'question' && (
                  <div className="text-center">
                    <p className="text-white/90 text-sm mb-2">Players must answer with a non-action card</p>
                    <div className="flex justify-center">
                      <div className="w-12 h-16 bg-gradient-card border-2 border-gold rounded-lg shadow-gold flex items-center justify-center">
                        <span className="text-gold font-bold text-lg">?</span>
                      </div>
                    </div>
                    <p className="text-gold text-xs mt-2 font-medium">
                      {gameState.activeCommand.remainingTurns} turns remaining
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Current Player's Hand */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Your Hand</h3>
            <div className="flex items-center gap-2">
              {currentPlayer.hasDeclaredDanger && (
                <Badge variant="destructive">DANGER DECLARED!</Badge>
              )}
              <Badge variant="outline" className="text-white border-white/30">
                {currentPlayer.hand.length} cards
              </Badge>
            </div>
          </div>
          
          {/* Player's Cards */}
          <div className="flex gap-2 flex-wrap justify-center mb-4">
            {currentPlayer.hand.map((card) => (
              <PlayingCard
                key={card.id}
                card={card}
                isPlayable={isCurrentPlayerTurn}
                onClick={() => isCurrentPlayerTurn && onCardPlay([card])}
              />
            ))}
          </div>
          
          {/* Player Actions */}
          {isCurrentPlayerTurn && (
            <div className="flex gap-2 justify-center flex-wrap">
              <Button 
                onClick={onDrawCard}
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Draw Card
              </Button>
              
              {canDeclareDanger(currentPlayer, gameState) && (
                <Button 
                  onClick={onDeclareDanger}
                  variant="destructive"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Declare Danger!
                </Button>
              )}
              
              {canDeclareGamehot && (
                <Button 
                  onClick={onDeclareGamehot}
                  variant="winner"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  GAMEHOT!
                </Button>
              )}
            </div>
          )}
          
          {!isCurrentPlayerTurn && (
            <div className="text-center text-white/60">
              Waiting for {gameState.players[gameState.currentPlayerIndex]?.name}'s turn...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
