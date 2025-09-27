import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Users, Target, User, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Game, Player } from "@/types/game";
import { useAuth } from "@/hooks/useAuth";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

export default function OfflineGameSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [players, setPlayers] = useState<string[]>(['', '']);
  const [scoreLimit, setScoreLimit] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const addPlayer = () => {
    if (players.length < 11) {
      setPlayers([...players, '']);
    } else {
      toast.error("Maximum 11 players allowed");
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    } else {
      toast.error("Minimum 2 players required");
    }
  };

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const isValidSetup = () => {
    const validPlayers = players.filter(p => p.trim().length > 0);
    return validPlayers.length >= 2 && scoreLimit > 0;
  };

  const createOfflineGame = () => {
    if (!isValidSetup()) {
      toast.error("Please fill all player names and set a valid score limit");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create an offline game");
      return;
    }

    setIsLoading(true);

    const validPlayers = players
      .filter(p => p.trim().length > 0)
      .map((name, index): Player => ({
        id: `offline-player-${Date.now()}-${index}`,
        name: name.trim(),
        score: 0,
        isEliminated: false,
        luckerBonanzaUsed: false,
      }));

    // Check for duplicate names
    const uniqueNames = new Set(validPlayers.map(p => p.name.toLowerCase()));
    if (uniqueNames.size !== validPlayers.length) {
      toast.error("Player names must be unique");
      setIsLoading(false);
      return;
    }

    const newGame: Game = {
      id: `offline-game-${Date.now()}`,
      name: `Offline Game: ${validPlayers.map(p => p.name).join(', ')}`,
      players: validPlayers,
      scoreLimit,
      status: 'active',
      currentRound: 0,
      rounds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to localStorage
    const savedGames = localStorage.getItem('binzingo-games');
    const games: Game[] = savedGames ? JSON.parse(savedGames) : [];
    games.push(newGame);
    localStorage.setItem('binzingo-games', JSON.stringify(games));

    toast.success(`Offline game created with ${validPlayers.length} players!`);
    
    setTimeout(() => {
      navigate(`/game/${newGame.id}`);
    }, 500);
  };

  const validPlayerCount = players.filter(p => p.trim().length > 0).length;

  return (
    <StandardPageLayout
      title="Setup Offline Game"
      showBackButton={true}
      backPath="/"
      showHelp={true}
      showProfile={true}
      showGameInvitations={true}
      useHomepageBackground={true}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white mb-2`}>
            Setup Offline Game
          </h1>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/80`}>
            Add local players and set the score limit for offline play
          </p>
        </div>

        {/* Setup Card */}
        <Card className={`${isMobile ? 'p-4' : 'p-8'} ios-card`}>
          {/* Score Limit */}
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Target className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gold`} />
              <Label htmlFor="scoreLimit" className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
                Score Limit
              </Label>
            </div>
            <Input
              id="scoreLimit"
              type="number"
              value={scoreLimit}
              onChange={(e) => setScoreLimit(parseInt(e.target.value) || 1000)}
              min={100}
              max={10000}
              step={50}
              className={`${isMobile ? 'text-lg' : 'text-2xl'} text-center font-bold ios-input text-white`}
            />
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 mt-2`}>
              Players reaching this score will be eliminated (except exact matches get Lucky Bonanza!)
            </p>
          </div>

          {/* Local Players */}
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'} mb-4`}>
              <div className="flex items-center gap-2">
                <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-bright`} />
                <Label className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
                  Local Players ({validPlayerCount}/11)
                </Label>
              </div>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={addPlayer}
                disabled={players.length >= 11}
                className="ios-button text-white border-white/30"
              >
                <Plus className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                {!isMobile && 'Add Player'}
              </Button>
            </div>

            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder={`Player ${index + 1} name`}
                      value={player}
                      onChange={(e) => updatePlayer(index, e.target.value)}
                      className="ios-input text-white placeholder-white/50"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    disabled={players.length <= 2}
                    className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-red-400 hover:bg-red-400/10 border-red-400/30`}
                  >
                    <Trash2 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </Button>
                </div>
              ))}
            </div>

            {players.length < 11 && (
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 mt-2`}>
                You can add up to 11 players total
              </p>
            )}
          </div>

          {/* Game Rules Accordion */}
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="game-rules" className="border border-white/20 rounded-lg">
                <AccordionTrigger className={`${isMobile ? 'px-3 py-2' : 'px-4 py-3'} hover:no-underline`}>
                  <div className="flex items-center gap-2">
                    <BookOpen className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-bright`} />
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-emerald-bright`}>Game Rules</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
                  <div className="space-y-3">
                    <div className={`${isMobile ? 'p-2' : 'p-3'} bg-white/5 border border-white/10 rounded-lg`}>
                      <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gold mb-2`}>Scoring System</h4>
                      <ul className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 space-y-1`}>
                        <li>• Score cards in your hand after each round (winner scores 0)</li>
                        <li>• 2 = 50 points</li>
                        <li>• 3 = 75 points</li>
                        <li>• Ace = 100 points</li>
                        <li>• Joker = 200 points</li>
                        <li>• J, Q, K = 10 points each</li>
                        <li>• Other cards = face value</li>
                      </ul>
                    </div>
                    
                    <div className={`${isMobile ? 'p-2' : 'p-3'} bg-emerald-bright/5 border border-emerald-bright/20 rounded-lg`}>
                      <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-emerald-bright mb-2`}>Game Mechanics</h4>
                      <ul className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 space-y-1`}>
                        <li>• Reach score limit = elimination</li>
                        <li>• Exact score limit = Lucky Bonanza (reset to 0!)</li>
                        <li>• Last player standing wins</li>
                        <li>• Play cards to avoid penalties</li>
                        <li>• Use strategy to eliminate opponents</li>
                      </ul>
                    </div>
                    
                    <div className={`${isMobile ? 'p-2' : 'p-3'} bg-gold/5 border border-gold/20 rounded-lg`}>
                      <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gold mb-2`}>Special Cards</h4>
                      <ul className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 space-y-1`}>
                        <li>• 2 = Draw 2 cards (can be stacked)</li>
                        <li>• 3 = Draw 3 cards (can be stacked)</li>
                        <li>• Joker = Wild card (any suit/rank)</li>
                        <li>• Question cards = Answer correctly or draw penalty</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Offline Game Info */}
          <div className={`${isMobile ? 'mb-6 p-3' : 'mb-8 p-4'} bg-blue-500/10 border border-blue-500/30 rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <User className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
              <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-blue-400`}>Offline Game Mode</h3>
            </div>
            <ul className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 space-y-1`}>
              <li>• Only you need to be logged in (as the host)</li>
              <li>• Local players don't need accounts</li>
              <li>• Game will be recorded in your statistics</li>
              <li>• Perfect for playing with friends offline</li>
            </ul>
          </div>

          {/* Create Game Button */}
          <Button
            onClick={createOfflineGame}
            disabled={!isValidSetup() || isLoading}
            variant="casino"
            className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-4'} bg-gold hover:bg-gold-dark text-black font-semibold rounded-xl shadow-lg`}
          >
            {isLoading ? "Creating Game..." : `Create Offline Game with ${validPlayerCount} Players`}
          </Button>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
