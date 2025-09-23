import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { AuthDialog } from '@/components/AuthDialog'
import { StandardPageLayout } from '@/components/StandardPageLayout'
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/use-mobile'
import { 
  Globe, 
  Users, 
  Zap, 
  Trophy,
  Play,
  Plus,
  User,
  BookOpen,
  Info
} from 'lucide-react'

export default function OnlineGames() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const isMobile = useIsMobile()

  const handleCreateGame = () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }
    navigate('/create-online-game')
  }

  const handleJoinGames = () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }
    navigate('/online-games')
  }


  return (
    <StandardPageLayout
      title="Play Online"
      showBackButton={true}
      backPath="/"
      showHelp={true}
      showProfile={true}
      showGameInvitations={true}
      useHomepageBackground={true}
    >
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-6xl'} font-bold text-white mb-6`}>
            Play <span className="text-gold">Online</span>
          </h1>
          <p className={`${isMobile ? 'text-base' : 'text-xl'} text-white/80 mb-8 max-w-2xl mx-auto`}>
            Challenge players worldwide in real-time Binzingo Cardy matches. 
            Experience the full game with live timers, command displays, and strategic gameplay.
          </p>
          
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 justify-center`}>
            <Button
              onClick={handleCreateGame}
              variant="casino"
              className={`${isMobile ? 'text-base px-6 py-3' : 'text-lg px-8 py-3'} bg-gold hover:bg-gold-dark text-black font-semibold rounded-xl shadow-lg`}
            >
              <Plus className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
              Create Game
            </Button>
            
            <Button
              onClick={handleJoinGames}
              variant="outline"
              className={`${isMobile ? 'text-base px-6 py-3' : 'text-lg px-8 py-3'} ios-button text-white border-white/30`}
            >
              <Play className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
              Join Games
            </Button>
          </div>
        </div>

        {/* Online Play Features Info */}
        <div className="text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size={isMobile ? "sm" : "default"} className="ios-button text-white border-white/30">
                <Info className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
                {!isMobile && 'Online Play Guide'}
              </Button>
            </DialogTrigger>
            <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh]' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto ios-card`}>
              {/* Gamified Background */}
              <div className="absolute inset-0 bg-gradient-felt opacity-20 rounded-lg overflow-hidden">
                {/* Card Suit Decorations */}
                <div className="absolute top-4 left-4 opacity-30">
                  <div className="w-8 h-8 border-2 border-gold rounded rotate-45"></div>
                </div>
                <div className="absolute top-6 right-6 opacity-30">
                  <div className="w-6 h-6 border-2 border-gold rounded-full"></div>
                </div>
                <div className="absolute bottom-4 left-6 opacity-30">
                  <div className="w-4 h-4 bg-gold rounded-full"></div>
                </div>
                <div className="absolute bottom-6 right-4 opacity-30">
                  <div className="w-10 h-10 border-2 border-gold rounded rotate-12"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-gold rounded-full opacity-20"></div>
                
                {/* Poker Chip Pattern */}
                <div className="absolute top-8 right-8 opacity-20">
                  <div className="w-12 h-12 border-4 border-gold rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-gold rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gold rounded-full"></div>
                </div>
                
                {/* Card Stack Pattern */}
                <div className="absolute bottom-8 left-8 opacity-20">
                  <div className="w-8 h-12 bg-gold/30 rounded transform rotate-12"></div>
                  <div className="absolute top-1 left-1 w-8 h-12 bg-gold/20 rounded transform rotate-6"></div>
                  <div className="absolute top-2 left-2 w-8 h-12 bg-gold/10 rounded"></div>
                </div>
              </div>
              
              <div className="relative z-10 space-y-8">
                {/* Header */}
                <div className="text-center">
                  <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white mb-2`}>
                    🎰 Online Play Guide
                  </h2>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/80`}>
                    Everything you need to know about playing Binzingo Cardy online
                  </p>
                </div>
                
                {/* Features Grid */}
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
                  <div className={`flex items-start gap-4 ${isMobile ? 'p-3' : 'p-4'} bg-white/10 rounded-lg border border-white/20`}>
                    <div className="flex-shrink-0">
                      <Globe className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-gold`} />
                    </div>
                    <div>
                      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-2`}>
                        Play with Anyone
                      </h3>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                        Connect with players from around the world and enjoy real-time multiplayer games.
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-start gap-4 ${isMobile ? 'p-3' : 'p-4'} bg-white/10 rounded-lg border border-white/20`}>
                    <div className="flex-shrink-0">
                      <Zap className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-gold`} />
                    </div>
                    <div>
                      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-2`}>
                        Real-time Updates
                      </h3>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                        Experience instant game state synchronization with live turn timers and command displays.
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-start gap-4 ${isMobile ? 'p-3' : 'p-4'} bg-white/10 rounded-lg border border-white/20`}>
                    <div className="flex-shrink-0">
                      <Users className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-gold`} />
                    </div>
                    <div>
                      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-2`}>
                        Smart Matchmaking
                      </h3>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                        Join existing games or create your own with customizable player limits and score targets.
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-start gap-4 ${isMobile ? 'p-3' : 'p-4'} bg-white/10 rounded-lg border border-white/20`}>
                    <div className="flex-shrink-0">
                      <Trophy className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-gold`} />
                    </div>
                    <div>
                      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-2`}>
                        Track Your Progress
                      </h3>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                        Monitor your win rate, games played, and climbing the leaderboards with detailed statistics.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* How It Works Section */}
                <div className="space-y-4">
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white text-center flex items-center justify-center gap-2`}>
                    <BookOpen className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-emerald-bright`} />
                    How Online Play Works
                  </h3>
                  
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-6`}>
                    <div className={`text-center ${isMobile ? 'p-4' : 'p-6'} bg-white/10 rounded-lg border border-white/20`}>
                      <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gold`}>1</span>
                      </div>
                      <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-2`}>
                        Create or Join
                      </h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                        Create a new game room or join an existing one. Set your preferences and wait for players.
                      </p>
                    </div>
                    
                    <div className={`text-center ${isMobile ? 'p-4' : 'p-6'} bg-white/10 rounded-lg border border-white/20`}>
                      <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gold`}>2</span>
                      </div>
                      <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-2`}>
                        Ready Up
                      </h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                        All players mark themselves as ready. The host starts the game when everyone is prepared.
                      </p>
                    </div>
                    
                    <div className={`text-center ${isMobile ? 'p-4' : 'p-6'} bg-white/10 rounded-lg border border-white/20`}>
                      <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gold`}>3</span>
                      </div>
                      <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-2`}>
                        Play Live
                      </h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                        Experience real-time gameplay with live timers, command displays, and instant updates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </StandardPageLayout>
  )
}

