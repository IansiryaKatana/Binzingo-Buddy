import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { StandardTopBar } from "./StandardTopBar";
import heroImage from "@/assets/casino-hero-bg.jpg";

interface StandardPageLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  backPath?: string;
  onBackClick?: () => void;
  showHelp?: boolean;
  showProfile?: boolean;
  showGameInvitations?: boolean;
  useHomepageBackground?: boolean;
  className?: string;
}

export const StandardPageLayout = ({
  children,
  title,
  showBackButton = true,
  backPath,
  onBackClick,
  showHelp = true,
  showProfile = true,
  showGameInvitations = true,
  useHomepageBackground = true,
  className = ""
}: StandardPageLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      {useHomepageBackground && (
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Casino Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
      )}

      {/* Top Bar */}
      <StandardTopBar
        title={title}
        showBackButton={showBackButton}
        backPath={backPath}
        onBackClick={onBackClick}
        showHelp={showHelp}
        showProfile={showProfile}
        showGameInvitations={showGameInvitations}
      />

      {/* Main Content */}
      <div className={`relative z-10 ${className}`}>
        <div className={`${isMobile ? 'px-3.5 py-4' : 'px-6 py-8'} container mx-auto`}>
          {children}
        </div>
      </div>
    </div>
  );
};
