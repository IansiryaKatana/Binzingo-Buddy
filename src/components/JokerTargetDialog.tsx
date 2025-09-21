import { Card } from '@/types/cards';
import { PlayingCard } from './PlayingCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface JokerTargetDialogProps {
  isOpen: boolean;
  playerHand: Card[];
  onSelectTarget: (card: Card) => void;
  onCancel: () => void;
}

export function JokerTargetDialog({
  isOpen,
  playerHand,
  onSelectTarget,
  onCancel
}: JokerTargetDialogProps) {
  // All non-joker cards can be targeted
  const validTargets = playerHand.filter(card => !card.isJoker);

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl bg-gradient-felt border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-xl">
            Choose Exact Card to Command
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-4">
          <p className="text-white/80 text-sm">
            Select which specific card from your hand you want to command other players to play
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-white text-center font-medium">Select target card:</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {validTargets.map((card) => (
              <PlayingCard
                key={card.id}
                card={card}
                size="md"
                isPlayable={true}
                onClick={() => onSelectTarget(card)}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}