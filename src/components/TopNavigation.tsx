import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Home, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/AuthDialog";
import { UserProfile } from "@/components/UserProfile";

interface TopNavigationProps {
  gameId?: string;
  showPlayCardGame?: boolean;
  showBackButton?: boolean;
}

export const TopNavigation = ({ 
  gameId, 
  showPlayCardGame = false, 
  showBackButton = false 
}: TopNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        )}
        {!showBackButton && location.pathname !== '/' && (
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            size="sm"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showPlayCardGame && gameId && (
          <Button
            onClick={() => navigate(`/cardgame/${gameId}`)}
            variant="casino"
            size="sm"
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Play Card Game
          </Button>
        )}
        
        {user ? (
          <UserProfile />
        ) : (
          <AuthDialog>
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
              Sign In
            </Button>
          </AuthDialog>
        )}
      </div>
    </div>
  );
};