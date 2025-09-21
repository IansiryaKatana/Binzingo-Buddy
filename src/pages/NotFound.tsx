import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Shuffle, ArrowLeft, Spade, Heart, Diamond, Club } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const cardSuits = [
    { icon: Spade, color: "text-foreground" },
    { icon: Heart, color: "text-destructive" },
    { icon: Diamond, color: "text-destructive" },
    { icon: Club, color: "text-foreground" }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="relative">
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
              <suit.icon className="w-8 h-8 opacity-20" />
            </div>
          ))}
        </div>

        <Card className="bg-gradient-card border-border shadow-card p-8 md:p-12 text-center max-w-md mx-auto relative z-10">
          {/* 404 with card styling */}
          <div className="mb-6">
            <div className="text-8xl md:text-9xl font-bold text-gold font-extrabold drop-shadow-lg mb-2">
              404
            </div>
            <div className="text-gold text-sm font-medium tracking-wide uppercase">
              Page Not Found
            </div>
          </div>

          {/* Card-themed message */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
              <Shuffle className="w-6 h-6 text-gold" />
              Oops! Wrong Deal
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Looks like you've drawn a blank card. This page doesn't exist in our deck.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              variant="casino"
              size="lg"
              className="w-full"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Game Table
            </Button>
            
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 text-gold opacity-50">
            <Spade className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-4 -left-4 text-destructive opacity-50">
            <Heart className="w-10 h-10" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
