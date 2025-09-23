import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayingCard } from "@/components/PlayingCard";
import { QuestionAnswerDialog } from "@/components/QuestionAnswerDialog";
import { JokerTargetDialog } from "@/components/JokerTargetDialog";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { useCardGame } from "@/hooks/useCardGame";
import { useCardSelection } from "@/hooks/useCardSelection";
import { useIsMobile } from "@/hooks/use-mobile";
import { Game } from "@/types/game";
import { Card as GameCard } from "@/types/cards";
import { cn } from "@/lib/utils";
import { canDeclareDanger } from "@/utils/cardGame";
import { 
  RotateCcw, 
  Crown, 
  AlertTriangle,
  Users,
  Target,
  Clock,
  Shuffle
} from "lucide-react";
import { toast } from "sonner";

interface CardGameProps {
  gameId?: string;
  isOnlineGame?: boolean;
  onlinePlayers?: any[];
  onGameStateUpdate?: (gameState: any) => void;
}

export default function CardGame({ 
  gameId: propGameId, 
  isOnlineGame = false, 
  onlinePlayers = [], 
  onGameStateUpdate 
}: CardGameProps = {}) {
  const { gameId: paramGameId } = useParams<{ gameId: string }>();
  const gameId = propGameId || paramGameId;
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [jokerBeingPlayed, setJokerBeingPlayed] = useState<GameCard | null>(null);
  const [aceBeingPlayed, setAceBeingPlayed] = useState<GameCard | null>(null);
  const isMobile = useIsMobile();

  const activePlayers = isOnlineGame ? onlinePlayers : (game?.players.filter(p => !p.isEliminated) || []);
  const cardGame = useCardGame(activePlayers);
  const { selectedCards, jokerTargetCard, toggleCardSelection, clearSelection, selectJokerTarget } = useCardSelection();

  useEffect(() => {
    if (!gameId) return;

    if (isOnlineGame) {
      // For online games, we don't need to load from localStorage
      // The game data is handled by the parent component
      return;
    }

    const savedGames = localStorage.getItem('binzingo-games');
    if (savedGames) {
      const games: Game[] = JSON.parse(savedGames);
      const foundGame = games.find(g => g.id === gameId);
      if (foundGame) {
        setGame(foundGame);
      } else {
        toast.error("Game not found");
        navigate('/');
      }
    }
  }, [gameId, navigate, isOnlineGame]);

  // Call onGameStateUpdate when game state changes in online mode
  useEffect(() => {
    if (isOnlineGame && cardGame.gameState && onGameStateUpdate) {
      onGameStateUpdate(cardGame.gameState);
    }
  }, [cardGame.gameState, isOnlineGame, onGameStateUpdate]);

  const handleStartGame = (withBots = false) => {
    if (activePlayers.length < 1) {
      toast.error('Need at least 1 player to start card game');
      return;
    }
    cardGame.initializeGame(withBots);
  };

  const handleFinishRound = () => {
    if (!cardGame.gameState || cardGame.gameState.gamePhase !== 'round-ended') return;
    
    const scores = cardGame.getRoundScores();
    const winner = cardGame.gameState.roundWinner;
    
    // Navigate back to scoring page with the results
    navigate(`/game/${gameId}`, { 
      state: { 
        cardGameScores: scores,
        cardGameWinner: winner 
      }
    });
  };

  const handleCardClick = (card: GameCard, isDoubleClick: boolean = false) => {
    const currentPlayer = activePlayers[0];
    const isCurrentTurn = cardGame.gameState?.players[cardGame.gameState.currentPlayerIndex]?.id === currentPlayer?.id;
    
    if (!isCurrentTurn) return;

    if (isDoubleClick) {
      // Double click adds to multidrop selection
      toggleCardSelection(card);
    } else {
      // Single click behavior
      if (selectedCards.length > 0) {
        // Handle special card target selection for selected cards
        const hasJoker = selectedCards.some(c => c.isJoker);
        const hasAce = selectedCards.some(c => c.rank === 'A');
        
        if (hasJoker && selectedCards.includes(card) && card.isJoker) {
          setJokerBeingPlayed(card);
          return;
        }
        
        if (hasAce && selectedCards.includes(card) && card.rank === 'A') {
          setAceBeingPlayed(card);
          return;
        }
        
        // Single click with cards selected = play the selected cards
        handlePlaySelectedCards();
      } else {
        // Single click with no selection = play this card directly
        if (card.isJoker) {
          setJokerBeingPlayed(card);
          return;
        }
        
        if (card.rank === 'A') {
          setAceBeingPlayed(card);
          return;
        }
        
        try {
          cardGame.playCard(currentPlayer.id, [card]);
          clearSelection();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Cannot play card");
        }
      }
    }
  };

  const handlePlaySelectedCards = (exactCardId?: string) => {
    const currentPlayer = activePlayers[0];
    if (!currentPlayer || selectedCards.length === 0) return;

    try {
      cardGame.playCard(currentPlayer.id, selectedCards, exactCardId);
      clearSelection();
      setJokerBeingPlayed(null);
      setAceBeingPlayed(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cannot play cards");
    }
  };

  const handleJokerTargetSelection = (targetCard: GameCard) => {
    if (selectedCards.length > 0 && jokerBeingPlayed && selectedCards.includes(jokerBeingPlayed)) {
      handlePlaySelectedCards(targetCard.id);
    } else if (jokerBeingPlayed) {
      const currentPlayer = activePlayers[0];
      if (currentPlayer) {
        cardGame.playCard(currentPlayer.id, [jokerBeingPlayed], targetCard.id);
      }
    }
    setJokerBeingPlayed(null);
    clearSelection();
  };

  const handleAceTargetSelection = (targetCard: GameCard) => {
    if (selectedCards.length > 0 && aceBeingPlayed && selectedCards.includes(aceBeingPlayed)) {
      handlePlaySelectedCards(targetCard.id);
    } else if (aceBeingPlayed) {
      const currentPlayer = activePlayers[0];
      if (currentPlayer) {
        cardGame.playCard(currentPlayer.id, [aceBeingPlayed], targetCard.id);
      }
    }
    setAceBeingPlayed(null);
    clearSelection();
  };

  const handleQuestionAnswer = (answerCard: GameCard) => {
    const currentPlayer = activePlayers[0];
    if (!currentPlayer) return;

    cardGame.playQuestionAnswer(currentPlayer.id, answerCard);
  };

  const handleDrawForQuestion = () => {
    const currentPlayer = activePlayers[0];
    if (!currentPlayer) return;

    cardGame.drawForQuestionAnswer(currentPlayer.id);
  };

  // Check if current player needs to answer a question
  const needsToAnswer = cardGame.gameState?.waitingForAnswer === activePlayers[0]?.id;
  const currentPlayerHand = cardGame.gameState?.players.find(p => p.id === activePlayers[0]?.id)?.hand || [];
  const topCard = cardGame.gameState?.discardPile[cardGame.gameState.discardPile.length - 1];

  if (!game) {
    return (
      <StandardPageLayout
        title="Loading Game..."
        showBackButton={true}
        backPath="/"
        showHelp={false}
        showProfile={true}
        showGameInvitations={false}
        useHomepageBackground={true}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} animate-spin border-2 border-gold border-t-transparent rounded-full mx-auto mb-4`} />
            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/70`}>Loading game...</p>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title="Binzingo Cardy - Live Game"
      showBackButton={true}
      backPath={`/game/${gameId}`}
      showHelp={true}
      showProfile={true}
      showGameInvitations={true}
      useHomepageBackground={true}
    >
      {/* Game Info Header */}
      <div className={`${isMobile ? 'mb-4' : 'mb-6'} ios-card`}>
        <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
            <div className="flex items-center gap-4">
              <div>
                <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
                  Binzingo Cardy - Live Game
                </h1>
                <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-4'} ${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                  <div className="flex items-center gap-1">
                    <Users className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    {activePlayers.length} players
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    Limit: {game.scoreLimit}
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-2'}`}>
              {cardGame.gameState && (
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={cardGame.resetGame}
                  className="ios-button text-white border-white/30"
                >
                  <RotateCcw className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                  {!isMobile && 'Reset Game'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-[1600px] mx-auto">
        {!cardGame.isGameActive ? (
          /* Game Setup */
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className={`${isMobile ? 'p-4' : 'p-8'} ios-card text-center max-w-lg`}>
              <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
                <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Shuffle className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-navy-deep`} />
                </div>
                <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white mb-2`}>Ready to Play?</h2>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/70`}>
                  Start a live Binzingo Cardy game with {activePlayers.length} players
                </p>
              </div>
              
              <div className={`space-y-3 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                {activePlayers.map((player) => (
                  <div key={player.id} className={`flex items-center justify-between bg-white/10 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} text-white font-medium`}>{player.name}</span>
                    <Badge variant="outline" className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm'} border-white/30 text-white/80`}>
                      {player.score} pts
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => handleStartGame(false)}
                  variant="casino" 
                  className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-3'} bg-gold hover:bg-gold-dark text-black font-semibold rounded-xl shadow-lg`}
                  disabled={activePlayers.length < 2}
                >
                  <Shuffle className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
                  Start Multiplayer Game
                </Button>
                
                <Button 
                  onClick={() => handleStartGame(true)}
                  variant="outline"
                  className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-3'} ios-button text-white border-white/30`}
                >
                  <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
                  {activePlayers.length === 1 ? 'Play vs 1 Bot' : 'Play vs Computer Bots'}
                </Button>
              </div>
              
              {activePlayers.length === 1 && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 mt-3`}>
                  Perfect for practicing! Play one-on-one against an AI opponent.
                </p>
              )}
              {activePlayers.length > 1 && activePlayers.length < 4 && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 mt-3`}>
                  Add computer bots to fill remaining player slots (up to 4 total players)
                </p>
              )}
            </Card>
          </div>
        ) : (
          /* Game Board - Solitaire Style Layout */
          <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            {/* Game Status Bar */}
            <div className={`${isMobile ? 'p-3' : 'p-4'} ios-card`}>
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center gap-6'}`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white/70`} />
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} text-white`}>
                      {cardGame.gameState?.players[cardGame.gameState.currentPlayerIndex]?.name}'s Turn
                    </span>
                    {cardGame.gameState?.direction === -1 && (
                      <Badge variant="outline" className={`${isMobile ? 'text-xs px-2 py-1' : 'text-xs'} border-white/30 text-white/80`}>
                        Reversed
                      </Badge>
                    )}
                  </div>
                  
                  {cardGame.gameState?.pendingPunishment.type && (
                    <Badge variant="destructive" className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm'}`}>
                      <AlertTriangle className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} mr-1`} />
                      Draw {cardGame.gameState.pendingPunishment.amount} 
                      ({cardGame.gameState.pendingPunishment.type})
                    </Badge>
                  )}
                  
                  {cardGame.gameState?.activeCommand.type && (
                    <Badge variant="secondary" className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm'} bg-white/20 text-white border-white/30`}>
                      Command: {cardGame.gameState.activeCommand.type}
                    </Badge>
                  )}
                </div>
                
                <div className={`flex items-center gap-2 text-white/70 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <Target className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {cardGame.gameState?.deck.length} cards left
                </div>
              </div>
            </div>

            {/* Main Game Area - Three Column Layout */}
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-7 gap-6'}`}>
              {/* Left - Draw Deck */}
              <div className={`${isMobile ? 'order-2' : 'lg:col-span-1'}`}>
                <Card className={`${isMobile ? 'p-3' : 'p-6'} ios-card text-center h-fit`}>
                  <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} text-white font-semibold mb-4`}>Draw Deck</h3>
                  
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className={`${isMobile ? 'w-16 h-24' : 'w-24 h-36'} bg-gradient-to-br from-blue-800 to-blue-900 border-2 border-blue-700 rounded-xl shadow-lg mx-auto relative overflow-hidden`}>
                        <div className="absolute inset-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border border-blue-500">
                          <div className="absolute inset-0 flex items-center justify-center text-white/80">
                            <Shuffle className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'}`} />
                          </div>
                        </div>
                      </div>
                      <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-16 h-24' : 'w-24 h-36'} bg-gradient-to-br from-blue-700 to-blue-800 rounded-xl -z-10`}></div>
                      <div className={`absolute -top-2 -right-2 ${isMobile ? 'w-16 h-24' : 'w-24 h-36'} bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl -z-20`}></div>
                    </div>
                    <Badge variant="outline" className={`${isMobile ? 'text-xs px-2 py-1' : 'text-xs'} border-white/30 text-white/80`}>
                      {cardGame.gameState?.deck.length} cards
                    </Badge>
                  </div>
                </Card>

                {/* Round End */}
                {cardGame.gameState?.gamePhase === 'round-ended' && (
                  <Card className={`${isMobile ? 'p-3' : 'p-6'} bg-gradient-gold border-gold text-center mt-4`}>
                    <div className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
                      <Crown className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-navy-deep mx-auto mb-2`} />
                      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} text-navy-deep font-bold`}>Round Complete!</h3>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-navy-deep/80`}>
                        {cardGame.gameState.players.find(p => p.id === cardGame.gameState.roundWinner)?.name} wins!
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleFinishRound}
                      variant="secondary"
                      className={`w-full ${isMobile ? 'text-sm py-2' : 'text-base py-3'} bg-white/20 text-navy-deep border-white/30`}
                    >
                      Return to Scoring
                    </Button>
                  </Card>
                )}
              </div>

              {/* Center - Players Area */}
              <div className={`${isMobile ? 'order-1' : 'lg:col-span-4'} ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                {/* Other Players */}
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
                  {cardGame.gameState?.players.filter(p => p.id !== activePlayers[0]?.id).map((player) => {
                    const isBot = cardGame.botPlayers?.includes(player.id);
                    const isCurrentPlayer = cardGame.gameState?.players[cardGame.gameState.currentPlayerIndex]?.id === player.id;
                    
                    return (
                      <Card key={player.id} className={cn(
                        `${isMobile ? 'p-3' : 'p-4'} backdrop-blur-sm border-border transition-all duration-300 shadow-card`,
                        isCurrentPlayer ? "bg-gold/20 border-gold/40 shadow-gold" : "ios-card"
                      )}>
                        <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`${isMobile ? 'text-sm' : 'text-base'} text-white font-medium flex items-center gap-1`}>
                              {player.name}
                              {isBot && <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gold`}>(Bot)</span>}
                            </span>
                            {isCurrentPlayer && (
                              <Crown className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gold animate-pulse`} />
                            )}
                            {player.hasDeclaredDanger && (
                              <Badge variant="destructive" className={`${isMobile ? 'text-xs px-1 py-0.5' : 'text-xs'} animate-pulse`}>
                                DANGER!
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm'} border-white/30 text-white/80`}>
                            {player.hand.length} cards
                          </Badge>
                        </div>
                        
                        {/* Card Backs - More realistic representation */}
                        <div className="flex flex-wrap gap-1 justify-center">
                          {player.hand.slice(0, Math.min(8, player.hand.length)).map((_, index) => (
                            <div
                              key={index}
                              className={`${isMobile ? 'w-6 h-8' : 'w-10 h-14'} bg-gradient-to-br from-blue-800 to-blue-900 border border-blue-700 rounded-lg shadow-lg relative overflow-hidden`}
                              style={{ transform: `rotate(${(index - player.hand.length/2) * 3}deg)` }}
                            >
                              <div className="absolute inset-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded border border-blue-500">
                                <div className="absolute inset-2 flex items-center justify-center">
                                  <div className={`${isMobile ? 'w-2 h-2' : 'w-4 h-4'} bg-white/20 rounded-full`}></div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {player.hand.length > 8 && (
                            <div className={`self-end ml-2 text-white/60 ${isMobile ? 'text-xs' : 'text-xs'} font-medium`}>
                              +{player.hand.length - 8}
                            </div>
                          )}
                        </div>

                        {/* Current turn indicator */}
                        {isCurrentPlayer && (
                          <div className="mt-2 text-center">
                            <span className="text-gold text-xs font-medium animate-pulse">
                              {isBot ? "🤖 Thinking..." : "Your Turn"}
                            </span>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>

                {/* Current Player's Hand */}
                {activePlayers[0] && cardGame.gameState?.players.find(p => p.id === activePlayers[0].id) && (
                  <Card className="p-6 bg-gradient-card border-border shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-foreground font-semibold text-lg">Your Hand</h3>
                      <div className="flex items-center gap-2">
                        {cardGame.gameState.players.find(p => p.id === activePlayers[0].id)?.hasDeclaredDanger && (
                          <Badge variant="destructive">DANGER!</Badge>
                        )}
                        <Badge variant="outline" className="border-border">
                          {cardGame.gameState.players.find(p => p.id === activePlayers[0].id)?.hand.length} cards
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center mb-6 p-4 bg-muted/20 rounded-xl border border-border">
                      {cardGame.gameState.players.find(p => p.id === activePlayers[0].id)?.hand.map((card, index) => {
                        const isSelected = selectedCards.some(c => c.id === card.id);
                        return (
                          <div 
                            key={card.id}
                            style={{ 
                              transform: `translateY(${index % 2 === 0 ? '0' : '-8px'}) ${isSelected ? 'scale(1.05)' : 'scale(1)'}`,
                              zIndex: isSelected ? 100 : index 
                            }}
                            className="transition-transform duration-200"
                          >
                            <PlayingCard
                              card={card}
                              size="lg"
                              isSelected={isSelected}
                              isPlayable={cardGame.gameState?.players[cardGame.gameState.currentPlayerIndex]?.id === activePlayers[0].id && !needsToAnswer}
                              onClick={() => handleCardClick(card)}
                              onDoubleClick={() => handleCardClick(card, true)}
                              className="hover:z-50"
                            />
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Player Actions */}
                    {cardGame.gameState.players[cardGame.gameState.currentPlayerIndex]?.id === activePlayers[0].id && !needsToAnswer && (
                      <div className="flex gap-3 justify-center flex-wrap">
                        <Button 
                          onClick={() => cardGame.drawCard(activePlayers[0].id)}
                          variant="outline"
                        >
                          Draw Card
                        </Button>

                        {selectedCards.length > 0 && (
                          <Button 
                            onClick={() => handlePlaySelectedCards()}
                            variant="casino"
                            className="animate-pulse"
                          >
                            Play {selectedCards.length} Card{selectedCards.length > 1 ? 's' : ''}
                          </Button>
                        )}

                        {selectedCards.length > 0 && (
                          <Button 
                            onClick={clearSelection}
                            variant="outline"
                            className="bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30"
                          >
                            Clear Selection
                          </Button>
                        )}
                        
                        {(() => {
                          const currentPlayer = cardGame.gameState?.players.find(p => p.id === activePlayers[0].id);
                          if (!currentPlayer) return null;
                          
                          const canDeclare = canDeclareDanger(currentPlayer, cardGame.gameState);
                          
                          return canDeclare && (
                            <Button 
                              onClick={() => cardGame.declareDanger(activePlayers[0].id)}
                              variant="destructive"
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Declare Danger!
                            </Button>
                          );
                        })()}
                        
                        {cardGame.gameState.players.find(p => p.id === activePlayers[0].id)?.hand.length === 1 &&
                         cardGame.gameState.players.find(p => p.id === activePlayers[0].id)?.hand.every(card => 
                           ['4', '5', '6', '7', '9', '10'].includes(card.rank)) && (
                          <Button 
                            onClick={() => cardGame.declareGamehot(activePlayers[0].id)}
                            variant="winner"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            GAMEHOT!
                          </Button>
                         )}
                       </div>
                     )}

                     {cardGame.gameState?.players[cardGame.gameState.currentPlayerIndex]?.id !== activePlayers[0].id && !needsToAnswer && (
                       <div className="text-center text-muted-foreground">
                         Waiting for {cardGame.gameState.players[cardGame.gameState.currentPlayerIndex]?.name}'s turn...
                       </div>
                     )}

                     {needsToAnswer && (
                       <div className="text-center">
                         <Badge variant="secondary" className="animate-pulse">
                           Answer the question card!
                         </Badge>
                       </div>
                     )}
                   </Card>
                 )}
               </div>

              {/* Right - Current Card & Recent Plays */}
              <div className="lg:col-span-2">
                <Card className="p-6 bg-gradient-card border-border shadow-card text-center">
                  <h3 className="text-foreground font-semibold mb-4">Current Card</h3>
                  
                  {cardGame.gameState?.discardPile.length > 0 && (
                    <div className="space-y-4">
                      {/* Current Active Card - Larger */}
                      <div className="mb-6">
                        <PlayingCard 
                          card={cardGame.gameState.discardPile[cardGame.gameState.discardPile.length - 1]} 
                          isPlayable={false}
                          size="lg"
                          className="mx-auto"
                        />
                        <p className="text-muted-foreground text-sm mt-2">Active Card</p>
                      </div>
                      
                      {/* Recent Cards Spread - Last 6 cards */}
                      {cardGame.gameState.discardPile.length > 1 && (
                        <div>
                          <p className="text-muted-foreground text-xs mb-2">Recent Plays</p>
                          <div className="flex justify-center gap-1 flex-wrap">
                            {cardGame.gameState.discardPile
                              .slice(-7, -1) // Get last 6 cards (excluding current)
                              .reverse() // Show most recent first
                              .map((card, index) => (
                                <div 
                                  key={`${card.suit}-${card.rank}-${index}`}
                                  className="transform transition-all duration-200"
                                  style={{ 
                                    transform: `scale(0.6) rotate(${(index - 2.5) * 8}deg)`,
                                    zIndex: 6 - index,
                                    opacity: 0.7 - (index * 0.1)
                                  }}
                                >
                                  <PlayingCard 
                                    card={card} 
                                    isPlayable={false}
                                    size="md"
                                  />
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                     </div>
                   )}
                 </Card>
               </div>
             </div>
           </div>
         )}

         {/* Dialogs */}
         {needsToAnswer && topCard && (
           <QuestionAnswerDialog
             isOpen={true}
             playerHand={currentPlayerHand}
             topCard={topCard}
             onAnswer={handleQuestionAnswer}
             onDrawInstead={handleDrawForQuestion}
           />
         )}

          {jokerBeingPlayed && (
            <JokerTargetDialog
              isOpen={true}
              playerHand={currentPlayerHand}
              onSelectTarget={handleJokerTargetSelection}
              onCancel={() => setJokerBeingPlayed(null)}
            />
          )}

          {aceBeingPlayed && (
            <JokerTargetDialog
              isOpen={true}
              playerHand={currentPlayerHand}
              onSelectTarget={handleAceTargetSelection}
              onCancel={() => setAceBeingPlayed(null)}
            />
          )}
       </div>
     </StandardPageLayout>
   );
 }
