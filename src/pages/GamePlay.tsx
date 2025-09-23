import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlayerScoreCard } from "@/components/PlayerScoreCard";
import { ScoreReference } from "@/components/ScoreReference";
import { CardSelector } from "@/components/CardSelector";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ArrowLeft, 
  Plus, 
  Trophy, 
  Save, 
  RotateCcw, 
  Users,
  Target,
  Clock,
  CreditCard,
  Calculator,
  HelpCircle,
  Home
} from "lucide-react";
import { Game, Player, GameRound, calculateCardValue } from "@/types/game";
import { toast } from "sonner";

export default function GamePlay() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [game, setGame] = useState<Game | null>(null);
  const [roundScores, setRoundScores] = useState<Record<string, string>>({});
  const [playerCards, setPlayerCards] = useState<Record<string, string[]>>({});
  const [winnerId, setWinnerId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCardInput, setUseCardInput] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const savedGames = localStorage.getItem('binzingo-games');
    if (savedGames) {
      const games: Game[] = JSON.parse(savedGames);
      const foundGame = games.find(g => g.id === gameId);
      if (foundGame) {
        setGame(foundGame);
        // Initialize round scores and cards
        const initialScores: Record<string, string> = {};
        const initialCards: Record<string, string[]> = {};
        foundGame.players
          .filter(p => !p.isEliminated)
          .forEach(p => {
            initialScores[p.id] = '';
            initialCards[p.id] = [];
          });
        setRoundScores(initialScores);
        setPlayerCards(initialCards);
      } else {
        toast.error("Game not found");
        navigate('/');
      }
    }
  }, [gameId, navigate]);

  const updateGame = (updatedGame: Game) => {
    const savedGames = localStorage.getItem('binzingo-games');
    if (savedGames) {
      const games: Game[] = JSON.parse(savedGames);
      const gameIndex = games.findIndex(g => g.id === updatedGame.id);
      if (gameIndex !== -1) {
        games[gameIndex] = updatedGame;
        localStorage.setItem('binzingo-games', JSON.stringify(games));
        setGame(updatedGame);
      }
    }
  };

  const submitRound = () => {
    if (!game || !winnerId) {
      toast.error("Please select a round winner");
      return;
    }

    setIsSubmitting(true);

    const activePlayers = game.players.filter(p => !p.isEliminated);
    const roundNumber = game.currentRound + 1;

    // Create new round
    const newRound: GameRound = {
      id: `round-${Date.now()}`,
      roundNumber,
      scores: {},
      winner: winnerId,
      timestamp: new Date(),
    };

    // Calculate scores for this round
    activePlayers.forEach(player => {
      if (player.id === winnerId) {
        newRound.scores[player.id] = 0; // Winner scores 0
      } else {
        let roundScore: number;
        if (useCardInput) {
          // Calculate score from cards
          roundScore = playerCards[player.id]?.reduce((sum, card) => sum + calculateCardValue(card), 0) || 0;
        } else {
          // Use manual score input
          roundScore = parseInt(roundScores[player.id]) || 0;
        }
        newRound.scores[player.id] = roundScore;
      }
    });

    // Update player total scores and check for eliminations/lucky bonanza
    const updatedPlayers = game.players.map(player => {
      if (player.isEliminated) return player;

      const roundScore = newRound.scores[player.id] || 0;
      const newTotalScore = player.score + roundScore;

      // Check for exact score limit (Lucky Bonanza)
      if (newTotalScore === game.scoreLimit && !player.luckerBonanzaUsed) {
        toast.success(`🎉 ${player.name} hit Lucky Bonanza! Score reset to 0!`);
        return {
          ...player,
          score: 0,
          luckerBonanzaUsed: true,
        };
      }

      // Check for elimination
      if (newTotalScore >= game.scoreLimit) {
        toast.error(`${player.name} eliminated at ${newTotalScore} points!`);
        return {
          ...player,
          score: newTotalScore,
          isEliminated: true,
        };
      }

      return {
        ...player,
        score: newTotalScore,
      };
    });

    // Check for game end
    const remainingPlayers = updatedPlayers.filter(p => !p.isEliminated);
    const gameEnded = remainingPlayers.length <= 1;

    const updatedGame: Game = {
      ...game,
      players: updatedPlayers,
      currentRound: roundNumber,
      rounds: [...game.rounds, newRound],
      updatedAt: new Date(),
      status: gameEnded ? 'finished' : 'active',
      winner: gameEnded ? remainingPlayers[0] : undefined,
    };

    if (gameEnded && remainingPlayers.length === 1) {
      toast.success(`🏆 ${remainingPlayers[0].name} wins the game!`);
    }

    updateGame(updatedGame);

    // Reset form
    setRoundScores({});
    setPlayerCards({});
    setWinnerId('');
    setIsSubmitting(false);

    if (gameEnded) {
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  };

  const resetRound = () => {
    const initialScores: Record<string, string> = {};
    const initialCards: Record<string, string[]> = {};
    game?.players
      .filter(p => !p.isEliminated)
      .forEach(p => {
        initialScores[p.id] = '';
        initialCards[p.id] = [];
      });
    setRoundScores(initialScores);
    setPlayerCards(initialCards);
    setWinnerId('');
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  const activePlayers = game.players.filter(p => !p.isEliminated);
  const sortedPlayers = [...game.players].sort((a, b) => {
    if (a.isEliminated && !b.isEliminated) return 1;
    if (!a.isEliminated && b.isEliminated) return -1;
    return a.score - b.score;
  });

  return (
    <StandardPageLayout
      title={`Game #${game.id.slice(0, 6)}`}
      showBackButton={true}
      backPath="/"
      showHelp={true}
      showProfile={true}
      showGameInvitations={true}
      useHomepageBackground={true}
    >
      <div className="max-w-6xl mx-auto">
        {/* Game Info */}
        <div className={`${isMobile ? 'mb-4' : 'mb-6'} text-center`}>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/80`}>
            {game.players.length} Players • Score Limit: {game.scoreLimit}
          </p>
        </div>

          {/* Game Stats */}
          <div className={`${isMobile ? 'mb-4' : 'mb-6'} flex flex-wrap gap-4 text-sm text-white/70 justify-center`}>
            <div className="flex items-center gap-1">
              <Clock className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              Round {game.currentRound + 1}
            </div>
            <div className="flex items-center gap-1">
              <Users className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {activePlayers.length} active players
            </div>
            <div className="flex items-center gap-1">
              <Target className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              Limit: {game.scoreLimit}
            </div>
          </div>
            
          {game.winner && (
            <div className="text-center">
              <Badge className="bg-gradient-gold text-navy-deep text-lg px-4 py-2">
                <Trophy className="w-5 h-5 mr-2" />
                {game.winner.name} Wins!
              </Badge>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Player Scores */}
          <div className="lg:col-span-2">
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white mb-4`}>Player Scores</h2>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-2'} gap-4`}>
              {sortedPlayers.map((player, index) => (
                <PlayerScoreCard
                  key={player.id}
                  player={player}
                  isWinner={game.winner?.id === player.id}
                  scoreLimit={game.scoreLimit}
                  position={index + 1}
                />
              ))}
            </div>
          </div>

          {/* Game Input Section */}
          {!game.winner && activePlayers.length > 0 && (
            <div className="space-y-4">
              <Card className={`${isMobile ? 'p-4' : 'p-6'} ios-card sticky top-6`}>
                <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'} mb-4`}>
                  <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white`}>
                    Round {game.currentRound + 1} Scores
                  </h3>
                  <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <Calculator className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    <Switch
                      checked={useCardInput}
                      onCheckedChange={setUseCardInput}
                    />
                    <CreditCard className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </div>
                </div>
                
                <div className={`mb-4 ${isMobile ? 'text-xs' : 'text-sm'} text-white/70 text-center`}>
                  {useCardInput ? "Select cards for each player" : "Enter manual scores"}
                </div>

                  {/* Winner Selection */}
                  <div className="mb-4">
                    <Label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium mb-2 block text-white`}>Round Winner</Label>
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                      {activePlayers.map(player => (
                        <Button
                          key={player.id}
                          variant={winnerId === player.id ? "casino" : "outline"}
                          size={isMobile ? "sm" : "default"}
                          onClick={() => setWinnerId(player.id)}
                          className={winnerId === player.id ? 'bg-gold text-black' : 'ios-button text-white border-white/30'}
                        >
                          <Trophy className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                          {player.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Score/Card Inputs */}
                  <div className="space-y-4 mb-6">
                    {activePlayers.map(player => (
                      <div key={player.id}>
                        {useCardInput ? (
                          <CardSelector
                            playerName={player.name}
                            selectedCards={playerCards[player.id] || []}
                            onCardsChange={(cards) => {
                              setPlayerCards(prev => ({
                                ...prev,
                                [player.id]: cards
                              }));
                            }}
                            disabled={winnerId === player.id}
                          />
                        ) : (
                          <>
                            <Label className="text-sm mb-1 block">
                              {player.name} 
                              {winnerId === player.id && (
                                <Badge variant="outline" className="ml-2 text-xs">Winner - 0 pts</Badge>
                              )}
                            </Label>
                            <Input
                              type="number"
                              placeholder="Card points"
                              value={winnerId === player.id ? '0' : roundScores[player.id] || ''}
                              onChange={(e) => {
                                if (winnerId !== player.id) {
                                  setRoundScores(prev => ({
                                    ...prev,
                                    [player.id]: e.target.value
                                  }));
                                }
                              }}
                              disabled={winnerId === player.id}
                              min="0"
                              className="bg-muted/50"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={submitRound}
                      disabled={!winnerId || isSubmitting}
                      variant="casino"
                      className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-4'} bg-gold hover:bg-gold-dark text-black font-semibold`}
                    >
                      <Save className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
                      {isSubmitting ? "Submitting..." : "Submit Round"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={resetRound}
                      className={`w-full ios-button text-white border-white/30`}
                    >
                      <RotateCcw className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
                      Reset Form
                    </Button>
                  </div>
                </Card>
            </div>
          )}
        </div>
      </div>
    </StandardPageLayout>
  );
}