import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Users, Target, RefreshCw, User, Trophy, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Game, Player } from "@/types/game";
import { useOnlinePlayers, OnlinePlayer } from "@/hooks/useOnlinePlayers";
import { useAuth } from "@/hooks/useAuth";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

export default function GameSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { players: onlinePlayers, loading: playersLoading, refetch } = useOnlinePlayers();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [scoreLimit, setScoreLimit] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        if (prev.length >= 5) { // Max 6 players total (including current user)
          toast.error("Maximum 6 players allowed");
          return prev;
        }
        return [...prev, playerId];
      }
    });
  };

  const getSelectedPlayerDetails = (): OnlinePlayer[] => {
    return onlinePlayers.filter(player => selectedPlayers.includes(player.id));
  };

  const isValidSetup = () => {
    return selectedPlayers.length >= 1 && scoreLimit > 0; // At least 1 other player + current user = 2 total
  };

  const createGame = () => {
    if (!isValidSetup()) {
      toast.error("Please select at least one player and set a valid score limit");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a game");
      return;
    }

    setIsLoading(true);

    const selectedPlayerDetails = getSelectedPlayerDetails();
    
    // Create players array with current user + selected players
    const allPlayers: Player[] = [
      // Current user
      {
        id: user.id,
        name: user.user_metadata?.username || user.email.split('@')[0],
        score: 0,
        isEliminated: false,
        luckerBonanzaUsed: false,
      },
      // Selected online players
      ...selectedPlayerDetails.map((player): Player => ({
        id: player.id,
        name: player.username,
        score: 0,
        isEliminated: false,
        luckerBonanzaUsed: false,
      }))
    ];

    const newGame: Game = {
      id: `game-${Date.now()}`,
      name: `Game with ${allPlayers.map(p => p.name).join(', ')}`,
      players: allPlayers,
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

    toast.success(`Game created with ${allPlayers.length} players!`);
    
    setTimeout(() => {
      navigate(`/game/${newGame.id}`);
    }, 500);
  };

  const totalPlayerCount = selectedPlayers.length + 1; // +1 for current user

  return (
    <StandardPageLayout
      title="Create Multiplayer Game"
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
            Create Multiplayer Game
          </h1>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/80`}>
            Select online players and set the score limit to get started
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

          {/* Online Players Selection */}
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'} mb-4`}>
              <div className="flex items-center gap-2">
                <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-bright`} />
                <Label className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
                  Select Players ({totalPlayerCount}/6)
                </Label>
              </div>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={refetch}
                disabled={playersLoading}
                className="ios-button text-white border-white/30"
              >
                <RefreshCw className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1 ${playersLoading ? 'animate-spin' : ''}`} />
                {!isMobile && 'Refresh'}
              </Button>
            </div>

            {/* Current User */}
            <div className={`mb-4 ${isMobile ? 'p-2' : 'p-3'} bg-emerald-bright/10 border border-emerald-bright/30 rounded-lg`}>
              <div className="flex items-center gap-3">
                <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-emerald-bright rounded-full flex items-center justify-center`}>
                  <User className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                </div>
                <div className="flex-1">
                  <div className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-emerald-bright`}>
                    {user?.user_metadata?.username || user?.email?.split('@')[0] || 'You'}
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>Game Host</div>
                </div>
                <Badge variant="secondary" className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm'} bg-emerald-bright/20 text-emerald-bright`}>
                  Host
                </Badge>
              </div>
            </div>

            {/* Online Players List */}
            {playersLoading ? (
              <div className="text-center py-8">
                <div className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} animate-spin rounded-full border-b-2 border-emerald-bright mx-auto mb-2`}></div>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/70`}>Loading online players...</p>
              </div>
            ) : onlinePlayers.length === 0 ? (
              <div className="text-center py-8">
                <Users className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-white/50 mx-auto mb-4`} />
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/70`}>No other players online</p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/50 mt-1`}>
                  Try refreshing or invite friends to join!
                </p>
              </div>
            ) : (
              <div className={`space-y-2 ${isMobile ? 'max-h-48' : 'max-h-64'} overflow-y-auto`}>
                {onlinePlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`${isMobile ? 'p-2' : 'p-3'} border rounded-lg cursor-pointer transition-colors ${
                      selectedPlayers.includes(player.id)
                        ? 'bg-emerald-bright/10 border-emerald-bright/50'
                        : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }`}
                    onClick={() => togglePlayer(player.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedPlayers.includes(player.id)}
                        onChange={() => togglePlayer(player.id)}
                        className="data-[state=checked]:bg-emerald-bright data-[state=checked]:border-emerald-bright"
                      />
                      <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-gold/20 rounded-full flex items-center justify-center`}>
                        <User className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gold`} />
                      </div>
                      <div className="flex-1">
                        <div className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-white`}>{player.username}</div>
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 flex items-center gap-2`}>
                          <Trophy className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} />
                          {player.gamesWon}/{player.gamesPlayed} wins
                        </div>
                      </div>
                      <Badge variant="outline" className={`${isMobile ? 'text-xs px-1 py-0.5' : 'text-xs'} border-white/30 text-white/80`}>
                        Online
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedPlayers.length > 0 && (
              <div className={`mt-4 ${isMobile ? 'p-2' : 'p-3'} bg-white/10 border border-white/20 rounded-lg`}>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold mb-2 text-white`}>Selected Players:</div>
                <div className="flex flex-wrap gap-2">
                  {getSelectedPlayerDetails().map((player) => (
                    <Badge key={player.id} variant="secondary" className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm'} bg-emerald-bright/20 text-emerald-bright`}>
                      {player.username}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 mt-2`}>
              Select 1-5 players to join your game (you're automatically included as the host)
            </p>
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

          {/* Create Game Button */}
          <Button
            onClick={createGame}
            disabled={!isValidSetup() || isLoading}
            variant="casino"
            className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-4'} bg-gold hover:bg-gold-dark text-black font-semibold rounded-xl shadow-lg`}
          >
            {isLoading ? "Creating Game..." : `Create Game with ${totalPlayerCount} Players`}
          </Button>
        </Card>
      </div>
    </StandardPageLayout>
  );
}