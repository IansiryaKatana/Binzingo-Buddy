import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Auth() {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/online')
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error('Google sign-in failed')
    }
  }

  // Show loading if already authenticated (while redirecting)
  if (user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Scattered playing cards background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Central spotlight effect */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[1000px] h-[800px] bg-purple-600/30 rounded-full blur-3xl"></div>
        
        {/* Scattered playing cards - positioned like Royal Flush Casino */}
        {/* Central ornate card */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-12 z-10">
          <div className="w-32 h-48 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg shadow-2xl border-2 border-yellow-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-yellow-700/20"></div>
            <div className="absolute top-2 left-2 text-black font-bold text-xs">ROYAL</div>
            <div className="absolute top-6 left-2 text-black font-bold text-xs">FLUSH</div>
            <div className="absolute bottom-2 right-2 text-black font-bold text-xs transform rotate-180">ROYAL</div>
            <div className="absolute bottom-6 right-2 text-black font-bold text-xs transform rotate-180">FLUSH</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-20 bg-black/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-200 font-bold text-lg">♠</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* King of Clubs - top right */}
        <div className="absolute top-1/3 right-1/4 transform rotate-12 z-5">
          <div className="w-24 h-36 bg-white rounded-lg shadow-xl border border-gray-300">
            <div className="absolute top-1 left-1 text-black font-bold text-lg">K</div>
            <div className="absolute top-1 right-1 text-black text-lg">♣</div>
            <div className="absolute bottom-1 left-1 text-black text-lg transform rotate-180">♣</div>
            <div className="absolute bottom-1 right-1 text-black font-bold text-lg transform rotate-180">K</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-4xl text-black">♣</div>
            </div>
          </div>
        </div>
        
        {/* Ace of Spades - top left */}
        <div className="absolute top-1/4 left-1/4 transform -rotate-12 z-5">
          <div className="w-24 h-36 bg-white rounded-lg shadow-xl border border-gray-300">
            <div className="absolute top-1 left-1 text-black font-bold text-lg">A</div>
            <div className="absolute top-1 right-1 text-black text-lg">♠</div>
            <div className="absolute bottom-1 left-1 text-black text-lg transform rotate-180">♠</div>
            <div className="absolute bottom-1 right-1 text-black font-bold text-lg transform rotate-180">A</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-4xl text-black">♠</div>
            </div>
          </div>
        </div>
        
        {/* Ace of Hearts - bottom left */}
        <div className="absolute bottom-1/3 left-1/5 transform -rotate-6 z-5">
          <div className="w-24 h-36 bg-white rounded-lg shadow-xl border border-gray-300">
            <div className="absolute top-1 left-1 text-black font-bold text-lg">A</div>
            <div className="absolute top-1 right-1 text-red-500 text-lg">♥</div>
            <div className="absolute bottom-1 left-1 text-red-500 text-lg transform rotate-180">♥</div>
            <div className="absolute bottom-1 right-1 text-black font-bold text-lg transform rotate-180">A</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-4xl text-red-500">♥</div>
            </div>
          </div>
        </div>
        
        {/* Additional cards for depth */}
        <div className="absolute top-1/6 right-1/6 transform rotate-45 z-0 opacity-60">
          <div className="w-20 h-30 bg-white rounded-lg shadow-lg border border-gray-300">
            <div className="absolute top-1 left-1 text-black font-bold text-sm">J</div>
            <div className="absolute top-1 right-1 text-red-500 text-sm">♦</div>
            <div className="absolute bottom-1 left-1 text-red-500 text-sm transform rotate-180">♦</div>
            <div className="absolute bottom-1 right-1 text-black font-bold text-sm transform rotate-180">J</div>
          </div>
        </div>
        
        <div className="absolute bottom-1/4 right-1/5 transform -rotate-30 z-0 opacity-50">
          <div className="w-20 h-30 bg-white rounded-lg shadow-lg border border-gray-300">
            <div className="absolute top-1 left-1 text-black font-bold text-sm">Q</div>
            <div className="absolute top-1 right-1 text-black text-sm">♠</div>
            <div className="absolute bottom-1 left-1 text-black text-sm transform rotate-180">♠</div>
            <div className="absolute bottom-1 right-1 text-black font-bold text-sm transform rotate-180">Q</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto">
        {/* Title - matching Royal Flush Casino style */}
        <div className="relative mb-8">
          <h1 className="text-5xl md:text-7xl font-playfair font-bold text-yellow-300 mb-4 drop-shadow-2xl relative">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
              Welcome to the Binzingo Cardy
            </span>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/10 via-yellow-200/10 to-yellow-400/10 blur-xl -z-10"></div>
          </h1>
        </div>
        
        {/* Subtitle */}
        <div className="relative mb-16">
          <p className="text-xl md:text-2xl text-gray-300 font-medium drop-shadow-lg">
            Experience the thrill of online gaming
          </p>
        </div>


        {/* Buttons - matching Royal Flush Casino style */}
        <div className="space-y-6">
          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full max-w-md bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            {loading ? (
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

          {/* Create Account Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full max-w-md bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Create Account
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm">
        <span>© 2024 Binzingo Cardy. All rights reserved.</span>
      </div>
    </div>
  )
}
