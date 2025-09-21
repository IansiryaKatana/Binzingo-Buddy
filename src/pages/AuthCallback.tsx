import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...')
        console.log('Current URL:', window.location.href)
        console.log('URL hash:', window.location.hash)
        console.log('URL search:', window.location.search)
        
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        console.log('Session data:', data)
        console.log('Session error:', error)
        
        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Authentication failed: ' + error.message)
          navigate('/auth')
          return
        }

        if (data.session) {
          console.log('Session found, redirecting to home')
          toast.success('Successfully signed in!')
          navigate('/')
        } else {
          console.log('No session found, checking URL parameters...')
          
          // Check if we have OAuth parameters in the URL
          const urlParams = new URLSearchParams(window.location.search)
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          
          console.log('URL params:', Object.fromEntries(urlParams.entries()))
          console.log('Hash params:', Object.fromEntries(hashParams.entries()))
          
          // Check for specific OAuth errors
          const error = urlParams.get('error') || hashParams.get('error')
          const errorDescription = urlParams.get('error_description') || hashParams.get('error_description')
          
          if (error) {
            console.error('OAuth error:', error, errorDescription)
            
            if (error === 'server_error' && errorDescription?.includes('Database error saving new user')) {
              toast.error('Database error during sign-up. Please try email sign-up instead.')
            } else {
              toast.error(`Authentication failed: ${errorDescription || error}`)
            }
            
            navigate('/auth')
            return
          }
          
          // If no session and no OAuth params, redirect to auth
          if (urlParams.size === 0 && hashParams.size === 0) {
            console.log('No OAuth parameters found, redirecting to auth')
            navigate('/auth')
            return
          }
          
          // Wait a bit for the session to be established
          console.log('Waiting for session to be established...')
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase.auth.getSession()
            
            console.log('Retry session data:', retryData)
            console.log('Retry session error:', retryError)
            
            if (retryError) {
              console.error('Retry auth error:', retryError)
              toast.error('Authentication failed')
              navigate('/auth')
            } else if (retryData.session) {
              console.log('Session established on retry, redirecting to home')
              toast.success('Successfully signed in!')
              navigate('/')
            } else {
              console.log('Still no session found, redirecting to auth')
              navigate('/auth')
            }
          }, 2000)
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        toast.error('An unexpected error occurred')
        navigate('/auth')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-felt flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
        <p className="text-white">Completing sign in...</p>
      </div>
    </div>
  )
}

