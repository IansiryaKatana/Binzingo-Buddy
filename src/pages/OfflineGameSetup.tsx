import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Users, Target, ArrowLeft, User, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Game, Player } from "@/types/game";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/components/UserProfile";
import { toast } from "sonner";

export default function OfflineGameSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [players, setPlayers] = useState<string[]>(['', '']);
  const [scoreLimit, setScoreLimit] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, '']);
    } else {
      toast.error("Maximum 6 players allowed");
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
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            {/* Profile Management - Far Right */}
            <UserProfile />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Setup Offline Game
          </h1>
          <p className="text-muted-foreground">
            Add local players and set the score limit for offline play
          </p>
        </div>

        {/* Setup Card */}
        <Card className="p-8 bg-gradient-card border-border shadow-card">
          {/* Score Limit */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-gold" />
              <Label htmlFor="scoreLimit" className="text-lg font-semibold">
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
              className="text-2xl text-center font-bold bg-muted/50"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Players reaching this score will be eliminated (except exact matches get Lucky Bonanza!)
            </p>
          </div>

          {/* Local Players */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-bright" />
                <Label className="text-lg font-semibold">
                  Local Players ({validPlayerCount}/6)
                </Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addPlayer}
                disabled={players.length >= 6}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Player
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
                      className="bg-muted/50"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    disabled={players.length <= 2}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {players.length < 6 && (
              <p className="text-sm text-muted-foreground mt-2">
                You can add up to 6 players total
              </p>
            )}
          </div>

          {/* Game Rules Accordion */}
          <div className="mb-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="game-rules" className="border border-poker-felt/30 rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-bright" />
                    <span className="font-semibold text-emerald-bright">Game Rules</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-poker-felt/5 border border-poker-felt/20 rounded-lg">
                      <h4 className="font-semibold text-gold mb-2">Scoring System</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Score cards in your hand after each round (winner scores 0)</li>
                        <li>• 2 = 50 points</li>
                        <li>• 3 = 75 points</li>
                        <li>• Ace = 100 points</li>
                        <li>• Joker = 200 points</li>
                        <li>• J, Q, K = 10 points each</li>
                        <li>• Other cards = face value</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-emerald-bright/5 border border-emerald-bright/20 rounded-lg">
                      <h4 className="font-semibold text-emerald-bright mb-2">Game Mechanics</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Reach score limit = elimination</li>
                        <li>• Exact score limit = Lucky Bonanza (reset to 0!)</li>
                        <li>• Last player standing wins</li>
                        <li>• Play cards to avoid penalties</li>
                        <li>• Use strategy to eliminate opponents</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-gold/5 border border-gold/20 rounded-lg">
                      <h4 className="font-semibold text-gold mb-2">Special Cards</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
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
          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-blue-500">Offline Game Mode</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
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
            className="w-full text-lg py-3"
          >
            {isLoading ? "Creating Game..." : `Create Offline Game with ${validPlayerCount} Players`}
          </Button>
        </Card>
      </div>
    </div>
  );
}
