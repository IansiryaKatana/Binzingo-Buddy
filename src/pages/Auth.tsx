import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
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
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-200 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 relative overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Multiple layered glows */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-yellow-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-400/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating card suit symbols */}
        <div className="absolute top-20 left-20 text-red-500 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <div className="text-6xl">♥</div>
        </div>
        <div className="absolute top-32 right-24 text-red-500 animate-bounce" style={{ animationDelay: '1s' }}>
          <div className="text-4xl">♦</div>
        </div>
        <div className="absolute top-40 left-32 text-yellow-400 animate-bounce" style={{ animationDelay: '1.5s' }}>
          <div className="text-5xl">♣</div>
        </div>
        <div className="absolute top-24 right-32 text-yellow-400 animate-bounce" style={{ animationDelay: '2s' }}>
          <div className="text-7xl">♠</div>
        </div>
        <div className="absolute bottom-32 left-24 text-red-500 animate-bounce" style={{ animationDelay: '0.8s' }}>
          <div className="text-4xl">♥</div>
        </div>
        <div className="absolute bottom-40 right-20 text-yellow-400 animate-bounce" style={{ animationDelay: '1.2s' }}>
          <div className="text-3xl">♣</div>
        </div>
        <div className="absolute top-1/2 left-10 text-red-500 animate-bounce" style={{ animationDelay: '1.8s' }}>
          <div className="text-2xl">♦</div>
        </div>
        <div className="absolute top-1/3 right-10 text-yellow-400 animate-bounce" style={{ animationDelay: '2.5s' }}>
          <div className="text-3xl">♠</div>
        </div>
        
        {/* Swirling golden lines */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-[800px] h-[800px] border border-yellow-400/30 rounded-full animate-spin" style={{ animationDuration: '25s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-yellow-400/20 rounded-full animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-yellow-400/15 rounded-full animate-spin" style={{ animationDuration: '15s' }}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-yellow-400/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-red-400/60 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-yellow-400/40 rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-red-400/50 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Logo/Title */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-yellow-400 mb-4 drop-shadow-2xl">
            BINZINGO
          </h1>
          <p className="text-xl text-yellow-200">Card Gaming Platform</p>
        </div>

        {/* Auth buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading || isAnimating}
            className="w-full max-w-sm bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            {loading || isAnimating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            className="w-full max-w-sm bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold py-4 px-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  )
}