import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, User, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserProfile } from "@/components/UserProfile";
import { GameInvitations } from "@/components/GameInvitations";
import { ScoreReference } from "@/components/ScoreReference";

interface StandardTopBarProps {
  title?: string;
  showBackButton?: boolean;
  backPath?: string;
  showHelp?: boolean;
  showProfile?: boolean;
  showGameInvitations?: boolean;
}

export const StandardTopBar = ({ 
  title,
  showBackButton = true,
  backPath,
  showHelp = true,
  showProfile = true,
  showGameInvitations = true
}: StandardTopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      // Smart back navigation
      const path = location.pathname;
      if (path.includes('/game/') && path.includes('/join')) {
        navigate('/online');
      } else if (path.includes('/game/') || path.includes('/cardgame/')) {
        navigate('/');
      } else if (path.includes('/setup') || path.includes('/offline-setup')) {
        navigate('/');
      } else if (path.includes('/online')) {
        navigate('/');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Back button */}
          <div className="flex items-center">
            {showBackButton && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                onClick={handleBack}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1`} />
                {!isMobile && <span className="text-sm font-medium">Back</span>}
              </Button>
            )}
            {title && (
              <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white ml-2`}>
                {title}
              </h1>
            )}
          </div>

          {/* Right side - Profile, Help, Game Invitations */}
          <div className="flex items-center gap-2">
            {user && showGameInvitations && <GameInvitations />}
            
            {showHelp && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size={isMobile ? "sm" : "default"}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <HelpCircle className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    {!isMobile && <span className="text-sm font-medium ml-1">Help</span>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-card border-border shadow-card">
                  <ScoreReference />
                </DialogContent>
              </Dialog>
            )}
            
            {showProfile && (
              <div className="flex items-center">
                <UserProfile />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
