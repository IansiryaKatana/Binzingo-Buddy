import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Target, Clock } from "lucide-react";
import { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
  onJoin: (gameId: string) => void;
  onView: (gameId: string) => void;
}

export function GameCard({ game, onJoin, onView }: GameCardProps) {
  const activePlayersCount = game.players.filter(p => !p.isEliminated).length;
  const isGameFull = game.players.length >= 6;
  
  return (
    <Card className="bg-gradient-card border-border shadow-card hover:shadow-gold transition-all duration-300 animate-slide-up">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Game #{game.id.slice(0, 6)}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Started {new Date(game.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
          <Badge 
            variant={game.status === 'active' ? 'default' : 'secondary'}
            className={game.status === 'active' ? 'bg-emerald-bright' : ''}
          >
            {game.status}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Players</span>
            </div>
            <span className="text-sm font-medium">
              {activePlayersCount}/{game.players.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Score Limit</span>
            </div>
            <span className="text-sm font-medium">{game.scoreLimit}</span>
          </div>

          {game.winner && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-gold" />
                <span className="text-sm">Winner</span>
              </div>
              <span className="text-sm font-medium text-gold">
                {game.winner.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(game.id)}
            className="flex-1"
          >
            View Game
          </Button>
          {!isGameFull && game.status === 'active' && !game.winner && (
            <Button 
              variant="casino" 
              size="sm" 
              onClick={() => onJoin(game.id)}
              className="flex-1"
            >
              Join Game
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}