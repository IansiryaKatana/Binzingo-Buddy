import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { Loader2, Spade, Heart, Diamond, Club } from 'lucide-react'
import { toast } from 'sonner'
import heroImage from '@/assets/casino-hero-bg.jpg'

export default function Auth() {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const [isAnimating, setIsAnimating] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (user) {
      navigate('/online')
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    try {
      setIsAnimating(true)
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error('Google sign-in failed')
      } else {
        toast.success('Welcome to Binzingo Cardy!')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in. Please try again.')
    } finally {
      setIsAnimating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center">
        <div className="text-center">
          <div className={`animate-spin rounded-full ${isMobile ? 'h-8 w-8' : 'h-12 w-12'} border-b-2 border-yellow-400 mx-auto mb-4`}></div>
          <p className={`text-yellow-200 ${isMobile ? 'text-base' : 'text-lg'}`}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background image - same as home page */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Casino Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Main content */}
      <div className={`relative z-10 text-center ${isMobile ? 'px-4' : 'px-6'} max-w-4xl mx-auto`}>
        {/* Floating Card Suits - mobile responsive */}
        <div className={`absolute ${isMobile ? '-top-4 -left-4' : '-top-8 -left-8'} opacity-20 animate-pulse`}>
          <Spade className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-gold`} />
        </div>
        <div className={`absolute ${isMobile ? '-top-2 -right-6' : '-top-4 -right-12'} opacity-20 animate-pulse delay-1000`}>
          <Heart className={`${isMobile ? 'w-6 h-6' : 'w-10 h-10'} text-gold`} />
        </div>
        <div className={`absolute ${isMobile ? '-bottom-3 -left-2' : '-bottom-6 -left-4'} opacity-20 animate-pulse delay-500`}>
          <Diamond className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-gold`} />
        </div>
        <div className={`absolute ${isMobile ? '-bottom-4 -right-4' : '-bottom-8 -right-8'} opacity-20 animate-pulse delay-1500`}>
          <Club className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} text-gold`} />
        </div>

        {/* Title - mobile responsive */}
        <div className={`${isMobile ? 'mb-12' : 'mb-16'}`}>
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl md:text-7xl'} font-bold mb-4 text-foreground font-inter-tight`}>
            Binzingo
            <span className="text-gold font-extrabold drop-shadow-lg"> Cardy</span>
          </h1>
          
          <p className={`${isMobile ? 'text-base' : 'text-xl md:text-2xl'} text-muted-foreground mb-8 font-medium`}>
            Professional Card Game Scorer
          </p>
        </div>

        {/* Auth buttons - iOS aesthetic with mobile responsiveness */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 justify-center items-center max-w-md mx-auto`}>
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading || isAnimating}
            className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-4'} bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${isMobile ? 'min-w-[280px]' : 'min-w-[200px]'}`}
          >
            {loading || isAnimating ? (
              <>
                <Loader2 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </Button>
          
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading || isAnimating}
            className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-4'} ios-button border-2 border-gold text-gold hover:bg-gold hover:text-black font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 ${isMobile ? 'min-w-[280px]' : 'min-w-[200px]'}`}
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  )
}