import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Spade, Heart, Diamond, Club, Star, Zap } from 'lucide-react'

interface CasinoPreloaderProps {
  isVisible: boolean
  message?: string
  onComplete?: () => void
}

export function CasinoPreloader({ isVisible, message = "Starting Game...", onComplete }: CasinoPreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [currentCard, setCurrentCard] = useState(0)

  const cards = [
    { icon: Spade, color: "text-black", bg: "bg-black" },
    { icon: Heart, color: "text-red-500", bg: "bg-red-500" },
    { icon: Diamond, color: "text-red-500", bg: "bg-red-500" },
    { icon: Club, color: "text-black", bg: "bg-black" }
  ]

  useEffect(() => {
    if (!isVisible) {
      setProgress(0)
      setCurrentCard(0)
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            onComplete?.()
          }, 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    const cardInterval = setInterval(() => {
      setCurrentCard(prev => (prev + 1) % cards.length)
    }, 200)

    return () => {
      clearInterval(interval)
      clearInterval(cardInterval)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-96 h-64 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-2 border-yellow-300 shadow-2xl">
        <div className="p-8 h-full flex flex-col items-center justify-center relative overflow-hidden">
          {/* Animated background cards */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => {
              const card = cards[i % cards.length]
              const Icon = card.icon
              return (
                <div
                  key={i}
                  className={`absolute ${card.color} animate-pulse`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>
              )
            })}
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center">
            {/* Animated card */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className={`w-16 h-20 rounded-lg border-2 border-white shadow-lg flex items-center justify-center transition-all duration-300 ${cards[currentCard].bg}`}>
                  {(() => {
                    const Icon = cards[currentCard].icon
                    return <Icon className="w-8 h-8 text-white" />
                  })()}
                </div>
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-lg ${cards[currentCard].bg} opacity-50 blur-md animate-pulse`}></div>
              </div>
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold text-black mb-2 drop-shadow-lg">
              {message}
            </h2>

            {/* Progress bar */}
            <div className="w-full bg-white/30 rounded-full h-3 mb-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-300 to-yellow-200 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
              </div>
            </div>

            {/* Progress percentage */}
            <div className="text-black font-semibold text-lg drop-shadow-md">
              {progress}%
            </div>

            {/* Animated stars */}
            <div className="absolute top-4 right-4">
              <Star className="w-6 h-6 text-yellow-200 animate-spin" style={{ animationDuration: '2s' }} />
            </div>
            <div className="absolute bottom-4 left-4">
              <Zap className="w-5 h-5 text-yellow-200 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
