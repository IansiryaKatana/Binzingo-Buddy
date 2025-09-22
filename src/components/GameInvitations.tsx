import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useGameInvitations, GameInvitation } from '@/hooks/useGameInvitations'
import { 
  Bell, 
  Users, 
  Target, 
  Clock, 
  Play, 
  X,
  Gamepad2
} from 'lucide-react'
import { toast } from 'sonner'

export function GameInvitations() {
  const navigate = useNavigate()
  const { invitations, loading, removeInvitation } = useGameInvitations()
  const [isOpen, setIsOpen] = useState(false)

  const handleJoinGame = (gameId: string) => {
    navigate(`/online-game/${gameId}`)
    setIsOpen(false)
  }

  const handleDeclineInvitation = async (gameId: string, gameName: string) => {
    try {
      await removeInvitation(gameId)
      toast.success(`Declined invitation to "${gameName}"`)
    } catch (error) {
      toast.error('Failed to decline invitation')
    }
  }

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative border-white/30 text-white hover:bg-white/10"
        >
          <Bell className="w-4 h-4" />
          {invitations.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {invitations.length > 9 ? '9+' : invitations.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-y-auto"
        sideOffset={5}
      >
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Gamepad2 className="w-4 h-4 text-gold" />
            <h3 className="font-semibold text-sm">Game Invitations</h3>
            {invitations.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {invitations.length}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mx-auto mb-2"></div>
              <p className="text-muted-foreground text-sm">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-6">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No game invitations</p>
              <p className="text-muted-foreground text-xs mt-1">
                You'll see invitations here when players invite you to games
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">
                          {invitation.game_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-gold text-black text-xs font-semibold">
                              {getPlayerInitials(invitation.host_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            Hosted by {invitation.host_name}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeclineInvitation(invitation.game_id, invitation.game_name)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {invitation.current_players}/{invitation.max_players}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {invitation.score_limit}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(invitation.created_at)}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleJoinGame(invitation.game_id)}
                      size="sm"
                      className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                    >
                      <Play className="w-3 h-3 mr-2" />
                      Join Game
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
