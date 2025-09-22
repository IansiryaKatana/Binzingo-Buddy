import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function Auth() {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const [isAnimating, setIsAnimating] = useState(false)

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background with subtle patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - removed as requested */}
        
        {/* Main banner section */}
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="block">UNIQUE COLLECTION</span>
                <span className="block">OF</span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  BINZINGO CARDS
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
                The largest collection of premium card games among all platforms. Experience the ultimate gaming adventure.
              </p>
              
              {/* Authentication buttons - positioned here */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading || isAnimating}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {loading || isAnimating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Entering Game...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>PLAY NOW</span>
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading || isAnimating}
                  className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-all duration-300"
                >
                  CREATE ACCOUNT
                </Button>
              </div>
            </div>
            
            {/* Right side - Cascading overlapping cards */}
            <div className="relative">
              <div className="relative w-full h-96 flex items-center justify-center">
                
                {/* Card 1 - Ace of Spades (back layer) */}
                <div className="absolute z-10 transform rotate-12 translate-x-8 translate-y-4 hover:scale-105 transition-transform duration-300">
                  <div className="w-32 h-48 bg-white rounded-lg shadow-2xl border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-black font-bold text-lg">A</div>
                    <div className="absolute top-2 right-2 text-black text-lg">♠</div>
                    <div className="absolute bottom-2 left-2 text-black text-lg transform rotate-180">♠</div>
                    <div className="absolute bottom-2 right-2 text-black font-bold text-lg transform rotate-180">A</div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="text-6xl text-black">♠</div>
                    </div>
                  </div>
                </div>
                
                {/* Card 2 - King of Hearts (middle layer) */}
                <div className="absolute z-20 transform -rotate-6 translate-x-2 -translate-y-2 hover:scale-105 transition-transform duration-300">
                  <div className="w-32 h-48 bg-white rounded-lg shadow-2xl border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-black font-bold text-lg">K</div>
                    <div className="absolute top-2 right-2 text-red-500 text-lg">♥</div>
                    <div className="absolute bottom-2 left-2 text-red-500 text-lg transform rotate-180">♥</div>
                    <div className="absolute bottom-2 right-2 text-black font-bold text-lg transform rotate-180">K</div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="text-6xl text-red-500">♥</div>
                    </div>
                  </div>
                </div>
                
                {/* Card 3 - Queen of Diamonds (front layer) */}
                <div className="absolute z-30 transform rotate-3 -translate-x-4 -translate-y-6 hover:scale-105 transition-transform duration-300">
                  <div className="w-32 h-48 bg-white rounded-lg shadow-2xl border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-black font-bold text-lg">Q</div>
                    <div className="absolute top-2 right-2 text-red-500 text-lg">♦</div>
                    <div className="absolute bottom-2 left-2 text-red-500 text-lg transform rotate-180">♦</div>
                    <div className="absolute bottom-2 right-2 text-black font-bold text-lg transform rotate-180">Q</div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="text-6xl text-red-500">♦</div>
                    </div>
                  </div>
                </div>
                
                {/* Card 4 - Jack of Clubs (side layer) */}
                <div className="absolute z-5 transform -rotate-12 translate-x-12 translate-y-8 hover:scale-105 transition-transform duration-300">
                  <div className="w-32 h-48 bg-white rounded-lg shadow-2xl border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-black font-bold text-lg">J</div>
                    <div className="absolute top-2 right-2 text-black text-lg">♣</div>
                    <div className="absolute bottom-2 left-2 text-black text-lg transform rotate-180">♣</div>
                    <div className="absolute bottom-2 right-2 text-black font-bold text-lg transform rotate-180">J</div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="text-6xl text-black">♣</div>
                    </div>
                  </div>
                </div>
                
                {/* Card 5 - 10 of Spades (bottom layer) */}
                <div className="absolute z-1 transform rotate-6 translate-x-6 translate-y-12 hover:scale-105 transition-transform duration-300">
                  <div className="w-32 h-48 bg-white rounded-lg shadow-2xl border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-black font-bold text-lg">10</div>
                    <div className="absolute top-2 right-2 text-black text-lg">♠</div>
                    <div className="absolute bottom-2 left-2 text-black text-lg transform rotate-180">♠</div>
                    <div className="absolute bottom-2 right-2 text-black font-bold text-lg transform rotate-180">10</div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="text-4xl text-black">♠</div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation arrows */}
                <button className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300">
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}