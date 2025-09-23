import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { User, LogOut, Settings, Trophy, Edit3, Save, X } from 'lucide-react'
import { toast } from 'sonner'

export function UserProfile() {
  const { user, signOut } = useAuth()
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [userStats, setUserStats] = useState({ gamesPlayed: 0, gamesWon: 0, totalScore: 0 })
  const [loading, setLoading] = useState(false)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    } finally {
      setSigningOut(false)
      setShowSignOutDialog(false)
    }
  }

  const handleSignOutClick = () => {
    setShowSignOutDialog(true)
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('games_played, games_won, total_score')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setUserStats({
          gamesPlayed: data.games_played || 0,
          gamesWon: data.games_won || 0,
          totalScore: data.total_score || 0
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: newUsername.trim() }
      })

      if (error) throw error

      toast.success('Username updated successfully!')
      setIsEditingUsername(false)
      setNewUsername('')
    } catch (error) {
      console.error('Error updating username:', error)
      toast.error('Failed to update username')
    } finally {
      setLoading(false)
    }
  }

  const openProfileDialog = () => {
    setShowProfileDialog(true)
    setNewUsername(user.user_metadata?.username || user.email.split('@')[0])
    fetchUserStats()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
              <AvatarFallback className="bg-gold text-black font-semibold">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm">{user.user_metadata?.username || 'Player'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={openProfileDialog}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile & Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleSignOutClick}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Management Dialog */}
    <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile & Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
              <AvatarFallback className="bg-gold text-black font-semibold text-lg">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {user.user_metadata?.username || user.email.split('@')[0]}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Username Edit */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Username
            </Label>
            <div className="flex gap-2">
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={!isEditingUsername}
                className="flex-1"
              />
              {isEditingUsername ? (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={handleUpdateUsername}
                    disabled={loading}
                    className="bg-emerald-bright hover:bg-emerald-bright/90"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditingUsername(false)
                      setNewUsername(user.user_metadata?.username || user.email.split('@')[0])
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingUsername(true)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-gold" />
                Your Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-bright">
                    {userStats.gamesPlayed}
                  </div>
                  <div className="text-sm text-muted-foreground">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold">
                    {userStats.gamesWon}
                  </div>
                  <div className="text-sm text-muted-foreground">Games Won</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {userStats.totalScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>
              </div>
              {userStats.gamesPlayed > 0 && (
                <div className="mt-4 text-center">
                  <Badge variant="secondary" className="bg-gold/20 text-gold">
                    Win Rate: {Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100)}%
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Member since:</span>
                <span className="text-sm font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last sign in:</span>
                <span className="text-sm font-medium">
                  {new Date(user.last_sign_in_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowProfileDialog(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOutClick}
              className="flex-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Sign Out Confirmation Dialog */}
    <ConfirmationDialog
      isOpen={showSignOutDialog}
      onClose={() => setShowSignOutDialog(false)}
      onConfirm={handleSignOut}
      title="Sign Out"
      description="Are you sure you want to sign out? You'll need to sign in again to access your games and statistics."
      confirmText="Sign Out"
      cancelText="Cancel"
      variant="destructive"
      icon="logout"
      loading={signingOut}
    />
    </>
  )
}

