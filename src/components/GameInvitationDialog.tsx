import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Users, Target, Clock, Check, X, Star, Zap } from 'lucide-react'
import { useGameInvitations } from '@/hooks/useGameInvitations'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface GameInvitationDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function GameInvitationDialog({ isOpen, onClose }: GameInvitationDialogProps) {
  const navigate = useNavigate()
  const { invitations, loading, acceptInvitation, declineInvitation } = useGameInvitations()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAccept = async (gameId: string) => {
    setIsProcessing(true)
    try {
      const success = await acceptInvitation(gameId)
      if (success) {
        onClose()
        navigate(`/online-game/${gameId}`)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async (gameId: string) => {
    setIsProcessing(true)
    try {
      await declineInvitation(gameId)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-2 border-yellow-300 shadow-2xl">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-8 h-8 text-yellow-200 animate-pulse" />
            <DialogTitle className="text-3xl font-bold text-black drop-shadow-lg">
              Game Invitations
            </DialogTitle>
            <Zap className="w-8 h-8 text-yellow-200 animate-bounce" />
          </div>
          <p className="text-black/80 text-lg font-semibold">
            You have pending game invitations!
          </p>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-black font-semibold">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <p className="text-black font-semibold text-lg">No pending invitations</p>
              <p className="text-black/70">You're all caught up!</p>
            </div>
          ) : (
            invitations.map((invite) => (
              <Card key={invite.id} className="bg-white/90 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-black">{invite.game_name}</h3>
                        <p className="text-gray-600 font-medium">Host: {invite.host_name}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs text-gray-600 border-gray-400 bg-white/50">
                      {formatTimeAgo(invite.invited_at)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-700">
                        {invite.current_players}/{invite.max_players} Players
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-700">
                        {invite.score_limit} Points
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => handleAccept(invite.game_id)}
                      disabled={isProcessing}
                    >
                      <Check className="w-5 h-5 mr-2" />
                      {isProcessing ? 'Joining...' : 'Join Game'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-red-500 text-red-600 hover:bg-red-50 font-bold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => handleDecline(invite.game_id)}
                      disabled={isProcessing}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-black text-black hover:bg-black hover:text-white font-bold px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
