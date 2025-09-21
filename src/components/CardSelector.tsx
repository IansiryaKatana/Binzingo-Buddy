import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CARD_VALUES, calculateCardValue } from "@/types/game";
import { X, Plus } from "lucide-react";

interface CardSelectorProps {
  playerName: string;
  selectedCards: string[];
  onCardsChange: (cards: string[]) => void;
  disabled?: boolean;
}

const AVAILABLE_CARDS = [
  // Number cards
  '2', '3', '4', '5', '6', '7', '8', '9', '10',
  // Face cards
  'J', 'Q', 'K', 'A',
  // Special
  'Joker'
];

export function CardSelector({ playerName, selectedCards, onCardsChange, disabled = false }: CardSelectorProps) {
  const [showCardPicker, setShowCardPicker] = useState(false);

  const addCard = (card: string) => {
    onCardsChange([...selectedCards, card]);
    setShowCardPicker(false);
  };

  const removeCard = (index: number) => {
    const newCards = selectedCards.filter((_, i) => i !== index);
    onCardsChange(newCards);
  };

  const totalScore = selectedCards.reduce((sum, card) => sum + calculateCardValue(card), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {playerName} {disabled && <Badge variant="outline" className="ml-2 text-xs">Winner - 0 pts</Badge>}
        </Label>
        <Badge variant="secondary" className="bg-muted">
          Total: {disabled ? 0 : totalScore} pts
        </Badge>
      </div>

      {/* Selected Cards */}
      <div className="min-h-[60px] p-3 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
        {selectedCards.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCards.map((card, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-background border-primary/20 text-foreground hover:bg-muted/50 group cursor-pointer"
                onClick={() => !disabled && removeCard(index)}
              >
                {card} ({calculateCardValue(card)})
                {!disabled && <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm py-4">
            {disabled ? "Winner gets 0 points" : "No cards selected"}
          </div>
        )}
      </div>

      {/* Add Card Button */}
      {!disabled && (
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCardPicker(!showCardPicker)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>

          {/* Card Picker */}
          {showCardPicker && (
            <Card className="absolute top-full left-0 right-0 z-10 mt-1 p-3 bg-background border shadow-lg">
              <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_CARDS.map(card => (
                  <Button
                    key={card}
                    variant="outline"
                    size="sm"
                    onClick={() => addCard(card)}
                    className="text-xs p-2 h-auto flex flex-col gap-1"
                  >
                    <span className="font-medium">{card}</span>
                    <span className="text-xs text-muted-foreground">
                      {calculateCardValue(card)}
                    </span>
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}