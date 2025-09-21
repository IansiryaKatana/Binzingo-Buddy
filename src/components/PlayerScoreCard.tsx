import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Star, AlertCircle } from "lucide-react";
import { Player } from "@/types/game";
import { cn } from "@/lib/utils";

interface PlayerScoreCardProps {
  player: Player;
  isWinner?: boolean;
  isCurrentWinner?: boolean;
  scoreLimit: number;
  position: number;
}

export function PlayerScoreCard({ 
  player, 
  isWinner = false, 
  isCurrentWinner = false, 
  scoreLimit,
  position 
}: PlayerScoreCardProps) {
  const isNearLimit = player.score >= scoreLimit * 0.8 && !player.isEliminated;
  const scorePercentage = Math.min((player.score / scoreLimit) * 100, 100);

  return (
    <Card 
      className={cn(
        "relative p-4 transition-all duration-300",
        isWinner && "animate-winner-glow border-gold bg-gradient-gold/10",
        isCurrentWinner && "border-emerald-bright shadow-winner",
        player.isEliminated && "opacity-60 bg-destructive/10 border-destructive/30",
        !player.isEliminated && !isWinner && !isCurrentWinner && "bg-gradient-card border-border shadow-card hover:shadow-gold"
      )}
    >
      {/* Position Badge */}
      <div className="absolute -top-2 -left-2">
        {position === 1 && !player.isEliminated && (
          <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
            <Crown className="w-4 h-4 text-navy-deep" />
          </div>
        )}
        {position <= 3 && position > 1 && !player.isEliminated && (
          <div className="w-8 h-8 bg-emerald-bright rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-navy-deep">{position}</span>
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "font-semibold text-lg",
            isWinner && "text-gold",
            isCurrentWinner && "text-emerald-bright",
            player.isEliminated && "text-destructive-foreground"
          )}>
            {player.name}
          </h3>
          {player.luckerBonanzaUsed && (
            <Badge variant="outline" className="text-xs bg-gold/20 border-gold">
              <Star className="w-3 h-3 mr-1" />
              Lucky!
            </Badge>
          )}
        </div>
        
        {player.isEliminated && (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Eliminated
          </Badge>
        )}
        
        {isWinner && (
          <Badge className="bg-gradient-gold text-navy-deep">
            <Trophy className="w-3 h-3 mr-1" />
            Winner
          </Badge>
        )}
      </div>

      {/* Score Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Score</span>
          <span className={cn(
            "text-2xl font-bold animate-score-bounce",
            isWinner && "text-gold",
            isCurrentWinner && "text-emerald-bright",
            isNearLimit && !player.isEliminated && "text-destructive",
            player.isEliminated && "text-destructive-foreground"
          )}>
            {player.score.toLocaleString()}
          </span>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full bg-muted/30 rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              isWinner && "bg-gradient-gold",
              isCurrentWinner && "bg-emerald-bright",
              isNearLimit && !player.isEliminated && "bg-destructive",
              !isNearLimit && !isWinner && !isCurrentWinner && !player.isEliminated && "bg-primary",
              player.isEliminated && "bg-destructive/50"
            )}
            style={{ width: `${scorePercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>{scoreLimit}</span>
        </div>
      </div>

      {/* Elimination Warning */}
      {isNearLimit && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded-md">
          <p className="text-xs text-destructive-foreground text-center">
            ⚠️ Close to elimination!
          </p>
        </div>
      )}
    </Card>
  );
}