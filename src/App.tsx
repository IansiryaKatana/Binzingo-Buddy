import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { GameInvitationDialog } from "@/components/GameInvitationDialog";
import { useAutoInvitationPopup } from "@/hooks/useAutoInvitationPopup";
import Home from "./pages/Home";
import GameSetup from "./pages/GameSetup";
import OfflineGameSetup from "./pages/OfflineGameSetup";
import GamePlay from "./pages/GamePlay";
import CardGame from "./pages/CardGame";
import OnlineGames from "./pages/OnlineGames";
import OnlineGame from "./pages/OnlineGame";
import CreateOnlineGame from "./components/CreateOnlineGame";
import OnlineGamesList from "./components/OnlineGamesList";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { showDialog, closeDialog } = useAutoInvitationPopup()

  return (
    <>
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected routes - authentication required */}
        <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
        <Route path="/setup" element={<AuthGuard><GameSetup /></AuthGuard>} />
        <Route path="/offline-setup" element={<AuthGuard><OfflineGameSetup /></AuthGuard>} />
        <Route path="/game/:gameId" element={<AuthGuard><GamePlay /></AuthGuard>} />
        <Route path="/cardgame/:gameId" element={<AuthGuard><CardGame /></AuthGuard>} />
        <Route path="/online" element={<AuthGuard><OnlineGames /></AuthGuard>} />
        <Route path="/online-games" element={<AuthGuard><OnlineGamesList /></AuthGuard>} />
        <Route path="/create-online-game" element={<AuthGuard><CreateOnlineGame /></AuthGuard>} />
        <Route path="/online-game/:gameId" element={<AuthGuard><OnlineGame /></AuthGuard>} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Auto-popup for game invitations */}
      <GameInvitationDialog isOpen={showDialog} onClose={closeDialog} />
    </>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
