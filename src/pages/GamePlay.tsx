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
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
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
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const savedGames = localStorage.getItem('binzingo-games');
    if (savedGames) {
      const games: Game[] = JSON.parse(savedGames);
      const foundGame = games.find(g => g.id === gameId);
      if (foundGame) {
        setGame(foundGame);
      } else {
        toast.error('Game not found');
        navigate('/');
      }
    } else {
      toast.error('No saved games found');
      navigate('/');
    }
  }, [gameId, navigate]);

  const handleExitGame = () => {
    navigate('/');
  };

  const handleBackClick = () => {
    setShowExitDialog(true);
  };

  const submitRound = async () => {
    if (!game || !winnerId) return;

    setIsSubmitting(true);
    try {
    const newRound: GameRound = {
        id: Date.now().toString(),
        roundNumber: game.currentRound + 1,
        winnerId,
        scores: {}
      };

      // Calculate scores for all players
      game.players.forEach(player => {
      if (player.id === winnerId) {
          newRound.scores[player.id] = 0; // Winner gets 0 points
        } else {
          const scoreValue = useCardInput 
            ? calculateCardValue(playerCards[player.id] || [])
            : parseInt(roundScores[player.id] || '0');
          newRound.scores[player.id] = scoreValue;
        }
      });

      // Update game state
      const updatedGame: Game = {
        ...game,
        currentRound: game.currentRound + 1,
        rounds: [...game.rounds, newRound],
        players: game.players.map(player => {
          const roundScore = newRound.scores[player.id] || 0;
          const newScore = player.score + roundScore;
          
          // Check for Lucky Bonanza (exact score limit)
          const isLuckyBonanza = newScore === game.scoreLimit;
          const finalScore = isLuckyBonanza ? 0 : newScore;
          
        return {
          ...player,
            score: finalScore,
            isEliminated: finalScore > game.scoreLimit && !isLuckyBonanza,
            luckerBonanzaUsed: isLuckyBonanza ? true : player.luckerBonanzaUsed
          };
        })
      };

      // Check for winner
      const activePlayers = updatedGame.players.filter(p => !p.isEliminated);
      if (activePlayers.length === 1) {
        updatedGame.winner = activePlayers[0];
        updatedGame.status = 'completed';
      }

      // Save to localStorage
      const savedGames = localStorage.getItem('binzingo-games');
      if (savedGames) {
        const games: Game[] = JSON.parse(savedGames);
        const updatedGames = games.map(g => g.id === gameId ? updatedGame : g);
        localStorage.setItem('binzingo-games', JSON.stringify(updatedGames));
      }

      setGame(updatedGame);
    setRoundScores({});
    setPlayerCards({});
    setWinnerId('');
      
      if (updatedGame.winner) {
        toast.success(`${updatedGame.winner.name} wins the game!`);
      } else {
        toast.success('Round submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting round:', error);
      toast.error('Failed to submit round');
    } finally {
    setIsSubmitting(false);
    }
  };

  const resetRound = () => {
    setRoundScores({});
    setPlayerCards({});
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
      onBackClick={handleBackClick}
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
                    className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit Round"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={resetRound}
                    className="w-full ios-button text-white border-white/30"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Form
                    </Button>
                  </div>
                </Card>
            </div>
          )}
        </div>
      </div>

      {/* Exit Game Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={handleExitGame}
        title="Exit Game"
        description="Are you sure you want to exit this game? Your progress will be saved but you'll need to rejoin to continue playing."
        confirmText="Exit Game"
        cancelText="Continue Playing"
        variant="warning"
        icon="back"
      />
    </StandardPageLayout>
  );
}