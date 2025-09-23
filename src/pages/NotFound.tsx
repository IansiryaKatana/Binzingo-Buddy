import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Shuffle, Spade, Heart, Diamond, Club } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const cardSuits = [
    { icon: Spade, color: "text-white" },
    { icon: Heart, color: "text-red-400" },
    { icon: Diamond, color: "text-red-400" },
    { icon: Club, color: "text-white" }
  ];

  return (
    <StandardPageLayout
      title="404 - Page Not Found"
      showBackButton={true}
      backPath="/"
      showHelp={false}
      showProfile={true}
      showGameInvitations={false}
      useHomepageBackground={true}
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative max-w-md mx-auto">
          {/* Floating card suits animation */}
          <div className="absolute inset-0 pointer-events-none">
            {cardSuits.map((suit, index) => (
              <div
                key={index}
                className={`absolute animate-bounce ${suit.color}`}
                style={{
                  left: `${20 + index * 20}%`,
                  top: `${10 + index * 15}%`,
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: `${2 + index * 0.3}s`
                }}
              >
                <suit.icon className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} opacity-20`} />
              </div>
            ))}
          </div>

          <Card className={`${isMobile ? 'p-6' : 'p-8 md:p-12'} ios-card text-center relative z-10`}>
            {/* 404 with card styling */}
            <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
              <div className={`${isMobile ? 'text-6xl' : 'text-8xl md:text-9xl'} font-bold text-gold font-extrabold drop-shadow-lg mb-2`}>
                404
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gold font-medium tracking-wide uppercase`}>
                Page Not Found
              </div>
            </div>

            {/* Card-themed message */}
            <div className={`${isMobile ? 'mb-6' : 'mb-8'} space-y-3`}>
              <div className={`flex items-center justify-center gap-2 ${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
                <Shuffle className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-gold`} />
                Oops! Wrong Deal
              </div>
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/70 leading-relaxed`}>
                Looks like you've drawn a blank card. This page doesn't exist in our deck.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/')}
                variant="casino"
                size={isMobile ? "default" : "lg"}
                className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-3'} bg-gold hover:bg-gold-dark text-black font-semibold rounded-xl shadow-lg`}
              >
                <Home className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
                Return to Game Table
              </Button>
              
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                size={isMobile ? "default" : "lg"}
                className={`w-full ${isMobile ? 'text-sm py-2' : 'text-base py-3'} ios-button text-white border-white/30`}
              >
                Go Back
              </Button>
            </div>

            {/* Decorative elements */}
            <div className={`absolute ${isMobile ? '-top-2 -right-2' : '-top-4 -right-4'} text-gold opacity-50`}>
              <Spade className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`} />
            </div>
            <div className={`absolute ${isMobile ? '-bottom-2 -left-2' : '-bottom-4 -left-4'} text-red-400 opacity-50`}>
              <Heart className={`${isMobile ? 'w-6 h-6' : 'w-10 h-10'}`} />
            </div>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default NotFound;
