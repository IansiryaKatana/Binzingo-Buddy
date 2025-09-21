import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spade, Heart, Diamond, Club, Star } from "lucide-react";

export function ScoreReference() {
  const cardValues = [
    { card: "2", value: 50, color: "text-destructive" },
    { card: "3", value: 75, color: "text-destructive" },
    { card: "Ace", value: 100, color: "text-gold" },
    { card: "Joker", value: 200, color: "text-gold font-bold" },
    { card: "J/Q/K", value: 10, color: "text-emerald-bright" },
    { card: "4-10", value: "Face Value", color: "text-muted-foreground" },
  ];

  return (
    <Card className="p-4 bg-gradient-card border-border shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1 opacity-60">
          <Spade className="w-4 h-4 text-foreground" />
          <Heart className="w-4 h-4 text-destructive" />
          <Diamond className="w-4 h-4 text-destructive" />
          <Club className="w-4 h-4 text-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Scoring Reference</h3>
      </div>

      <div className="space-y-2 mb-4">
        {cardValues.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm font-medium">{item.card}</span>
            <Badge variant="outline" className={item.color}>
              {typeof item.value === 'number' ? `${item.value} pts` : item.value}
            </Badge>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-border/50">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Star className="w-3 h-3 mt-0.5 text-gold flex-shrink-0" />
          <span>
            <strong className="text-gold">Lucky Bonanza:</strong> Hit exactly {" "}
            the score limit to reset to 0 instead of elimination!
          </span>
        </div>
      </div>
    </Card>
  );
}