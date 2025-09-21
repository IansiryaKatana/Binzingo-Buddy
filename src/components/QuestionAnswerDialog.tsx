import { Card } from '@/types/cards';
import { PlayingCard } from './PlayingCard';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';

interface QuestionAnswerDialogProps {
  isOpen: boolean;
  playerHand: Card[];
  topCard: Card;
  onAnswer: (card: Card) => void;
  onDrawInstead: () => void;
}

export function QuestionAnswerDialog({
  isOpen,
  playerHand,
  topCard,
  onAnswer,
  onDrawInstead
}: QuestionAnswerDialogProps) {
  // Non-action cards that match suit or rank
  const validAnswers = playerHand.filter(card => {
    const isNonAction = ['4', '5', '6', '7', '9', '10'].includes(card.rank);
    const matches = card.suit === topCard.suit || card.rank === topCard.rank;
    return isNonAction && matches;
  });

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-4xl bg-gradient-felt border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-xl">
            Question Card Played! Provide an Answer
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-4">
          <Badge variant="secondary" className="mb-2">
            Top Card: {topCard.rank} of {topCard.suit}
          </Badge>
          <p className="text-white/80 text-sm">
            You must play a non-action card (4, 5, 6, 7, 9, 10) that matches the suit or rank
          </p>
        </div>

        {validAnswers.length > 0 ? (
          <div className="space-y-4">
            <p className="text-white text-center font-medium">Choose your answer:</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {validAnswers.map((card) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  size="md"
                  isPlayable={true}
                  onClick={() => onAnswer(card)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-white">No valid answer cards found in your hand!</p>
            <Button 
              onClick={onDrawInstead}
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              Draw a Card Instead
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}