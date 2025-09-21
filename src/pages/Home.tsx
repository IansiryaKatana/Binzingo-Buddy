import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Spade, Heart, Diamond, Club, Bot, Globe, Users, User, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GameCard } from "@/components/GameCard";
import { UserProfile } from "@/components/UserProfile";
import { Game } from "@/types/game";
import { toast } from "sonner";
import heroImage from "@/assets/casino-hero-bg.jpg";

export default function Home() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    // Load games from localStorage
    const savedGames = localStorage.getItem('binzingo-games');
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    }
  }, []);

  const handleNewGame = () => {
    navigate('/setup');
  };

  const handleOfflineGame = () => {
    navigate('/offline-setup');
  };

  const handlePlayVsComputer = () => {
    // Create a quick game with just the user for bot play
    const quickGame: Game = {
      id: `bot-game-${Date.now()}`,
      name: 'Quick Bot Game',
      scoreLimit: 100,
      players: [{
        id: 'player-1',
        name: 'You',
        score: 0,
        isEliminated: false,
        luckerBonanzaUsed: false
      }],
      rounds: [],
      currentRound: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save the game
    const savedGames = localStorage.getItem('binzingo-games');
    const games: Game[] = savedGames ? JSON.parse(savedGames) : [];
    games.push(quickGame);
    localStorage.setItem('binzingo-games', JSON.stringify(games));

    // Navigate directly to the card game
    navigate(`/cardgame/${quickGame.id}`);
    toast.success('Quick bot game created! Click "Play vs 1 Bot" to start.');
  };

  const handleJoinGame = (gameId: string) => {
    navigate(`/game/${gameId}/join`);
  };

  const handleViewGame = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  const activeGames = games.filter(g => g.status === 'active');
  const finishedGames = games.filter(g => g.status === 'finished');

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header with Profile */}
      <div className="absolute top-4 right-4 z-50">
        <UserProfile />
      </div>
      
      {/* Hero Section */}
      <div 
        className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-navy-deep/60" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Floating Card Suits */}
          <div className="absolute -top-8 -left-8 opacity-20 animate-pulse">
            <Spade className="w-12 h-12 text-gold" />
          </div>
          <div className="absolute -top-4 -right-12 opacity-20 animate-pulse delay-1000">
            <Heart className="w-10 h-10 text-gold" />
          </div>
          <div className="absolute -bottom-6 -left-4 opacity-20 animate-pulse delay-500">
            <Diamond className="w-8 h-8 text-gold" />
          </div>
          <div className="absolute -bottom-8 -right-8 opacity-20 animate-pulse delay-1500">
            <Club className="w-14 h-14 text-gold" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-foreground font-inter-tight">
            Binzingo
            <span className="text-gold font-extrabold drop-shadow-lg"> Cardy</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-medium">
            Professional Card Game Scorer
          </p>
          
        </div>
      </div>

      {/* Game Mode Cards Section */}
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Choose Your Game Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {/* Start New Game Card */}
          <Card 
            className="group cursor-pointer overflow-hidden bg-gradient-card border-emerald-bright/30 hover:border-emerald-bright/50 transition-all duration-300 hover:scale-105 shadow-card hover:shadow-winner"
            onClick={handleNewGame}
          >
            <div className="relative h-32 bg-gradient-felt flex items-center justify-center overflow-hidden">
              {/* Professional Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 left-2 w-8 h-8 border-2 border-gold rounded rotate-45"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-2 border-gold rounded-full"></div>
                <div className="absolute bottom-3 left-4 w-4 h-4 bg-gold rounded-full"></div>
                <div className="absolute bottom-2 right-2 w-10 h-10 border-2 border-gold rounded rotate-12"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-gold rounded-full opacity-50"></div>
              </div>
              <div className="absolute inset-0 bg-navy-deep/40"></div>
              <div className="relative z-10 text-center">
                <Users className="w-12 h-12 text-gold mx-auto mb-1 drop-shadow-lg" />
                <div className="text-gold/90 text-xs font-medium drop-shadow-md">Multiplayer</div>
              </div>
            </div>
            <div className="p-3 bg-gradient-card">
              <h3 className="font-bold text-sm text-emerald-bright group-hover:text-gold transition-colors text-center">
                Start New Game
              </h3>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Create multiplayer game
              </p>
            </div>
          </Card>

          {/* Play vs Computer Card */}
          <Card 
            className="group cursor-pointer overflow-hidden bg-gradient-card border-gold/30 hover:border-gold/50 transition-all duration-300 hover:scale-105 shadow-card hover:shadow-gold"
            onClick={handlePlayVsComputer}
          >
            <div className="relative h-32 bg-gradient-gold flex items-center justify-center overflow-hidden">
              {/* AI Circuit Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-3 left-3 w-2 h-2 bg-navy-deep rounded-full"></div>
                <div className="absolute top-3 left-6 w-1 h-4 bg-navy-deep"></div>
                <div className="absolute top-6 left-6 w-2 h-2 bg-navy-deep rounded-full"></div>
                <div className="absolute top-6 left-9 w-3 h-1 bg-navy-deep"></div>
                <div className="absolute top-9 left-9 w-2 h-2 bg-navy-deep rounded-full"></div>
                <div className="absolute top-9 left-12 w-1 h-3 bg-navy-deep"></div>
                <div className="absolute top-12 left-12 w-2 h-2 bg-navy-deep rounded-full"></div>
                <div className="absolute bottom-3 right-3 w-2 h-2 bg-navy-deep rounded-full"></div>
                <div className="absolute bottom-3 right-6 w-1 h-4 bg-navy-deep"></div>
                <div className="absolute bottom-6 right-6 w-2 h-2 bg-navy-deep rounded-full"></div>
              </div>
              <div className="absolute inset-0 bg-navy-deep/30"></div>
              <div className="relative z-10 text-center">
                <Bot className="w-12 h-12 text-navy-deep mx-auto mb-1 drop-shadow-lg" />
                <div className="text-navy-deep/90 text-xs font-medium drop-shadow-md">AI Opponent</div>
              </div>
            </div>
            <div className="p-3 bg-gradient-card">
              <h3 className="font-bold text-sm text-gold group-hover:text-emerald-bright transition-colors text-center">
                Play vs Computer
              </h3>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Quick game vs AI
              </p>
            </div>
          </Card>

          {/* Play Online Card */}
          <Card 
            className="group cursor-pointer overflow-hidden bg-gradient-card border-gold/30 hover:border-gold/50 transition-all duration-300 hover:scale-105 shadow-card hover:shadow-gold"
            onClick={() => navigate('/online')}
          >
            <div className="relative h-32 bg-gradient-gold flex items-center justify-center overflow-hidden">
              {/* Global Network Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 left-2 w-3 h-3 border border-navy-deep rounded-full"></div>
                <div className="absolute top-2 right-2 w-3 h-3 border border-navy-deep rounded-full"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 border border-navy-deep rounded-full"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 border border-navy-deep rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-navy-deep rounded-full"></div>
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-px h-8 bg-navy-deep"></div>
                <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-8 h-px bg-navy-deep"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-px h-8 bg-navy-deep"></div>
                <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-8 h-px bg-navy-deep"></div>
              </div>
              <div className="absolute inset-0 bg-navy-deep/30"></div>
              <div className="relative z-10 text-center">
                <Globe className="w-12 h-12 text-navy-deep mx-auto mb-1 drop-shadow-lg" />
                <div className="text-navy-deep/90 text-xs font-medium drop-shadow-md">Global Play</div>
              </div>
            </div>
            <div className="p-3 bg-gradient-card">
              <h3 className="font-bold text-sm text-gold group-hover:text-emerald-bright transition-colors text-center">
                Play Online
              </h3>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Connect worldwide
              </p>
            </div>
          </Card>

          {/* Join Games Card */}
          <Card 
            className="group cursor-pointer overflow-hidden bg-gradient-card border-emerald-bright/30 hover:border-emerald-bright/50 transition-all duration-300 hover:scale-105 shadow-card hover:shadow-winner"
            onClick={() => navigate('/online-games')}
          >
            <div className="relative h-32 bg-gradient-felt flex items-center justify-center overflow-hidden">
              {/* Game Room Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-3 left-3 w-6 h-4 border border-gold rounded"></div>
                <div className="absolute top-3 right-3 w-6 h-4 border border-gold rounded"></div>
                <div className="absolute bottom-3 left-3 w-6 h-4 border border-gold rounded"></div>
                <div className="absolute bottom-3 right-3 w-6 h-4 border border-gold rounded"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-6 border-2 border-gold rounded"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gold rounded-full"></div>
              </div>
              <div className="absolute inset-0 bg-navy-deep/40"></div>
              <div className="relative z-10 text-center">
                <Users className="w-12 h-12 text-gold mx-auto mb-1 drop-shadow-lg" />
                <div className="text-gold/90 text-xs font-medium drop-shadow-md">Join Room</div>
              </div>
            </div>
            <div className="p-3 bg-gradient-card">
              <h3 className="font-bold text-sm text-emerald-bright group-hover:text-gold transition-colors text-center">
                Join Games
              </h3>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Browse existing games
              </p>
            </div>
          </Card>

          {/* Offline Game Card */}
          <Card 
            className="group cursor-pointer overflow-hidden bg-gradient-card border-gold/30 hover:border-gold/50 transition-all duration-300 hover:scale-105 shadow-card hover:shadow-gold"
            onClick={handleOfflineGame}
          >
            <div className="relative h-32 bg-gradient-gold flex items-center justify-center overflow-hidden">
              {/* Local Play Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 left-2 w-4 h-4 border border-navy-deep rounded-full"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border border-navy-deep rounded-full"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border border-navy-deep rounded-full"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border border-navy-deep rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-navy-deep rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-navy-deep rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gold rounded-full"></div>
              </div>
              <div className="absolute inset-0 bg-navy-deep/30"></div>
              <div className="relative z-10 text-center">
                <Gamepad2 className="w-12 h-12 text-navy-deep mx-auto mb-1 drop-shadow-lg" />
                <div className="text-navy-deep/90 text-xs font-medium drop-shadow-md">Local Play</div>
              </div>
            </div>
            <div className="p-3 bg-gradient-card">
              <h3 className="font-bold text-sm text-gold group-hover:text-emerald-bright transition-colors text-center">
                Offline Game
              </h3>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Play with friends locally
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Games and Getting Started Section */}
      <div className="container mx-auto px-6 py-12">
        {/* Recent Games Section */}
        {finishedGames.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
              <div className="w-2 h-8 bg-gold rounded-full" />
              Recent Games
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedGames.slice(0, 6).map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onJoin={handleJoinGame}
                  onView={handleViewGame}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}