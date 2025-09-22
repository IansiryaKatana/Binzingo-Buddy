import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useGameInvitations } from './useGameInvitations'

export function useAutoInvitationPopup() {
  const { user } = useAuth()
  const { invitations, loading } = useGameInvitations()
  const [showDialog, setShowDialog] = useState(false)
  const [hasShownDialog, setHasShownDialog] = useState(false)

  useEffect(() => {
    // Only show dialog if:
    // 1. User is logged in
    // 2. Not loading
    // 3. Has invitations
    // 4. Haven't shown dialog yet in this session
    if (user && !loading && invitations.length > 0 && !hasShownDialog) {
      // Small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        setShowDialog(true)
        setHasShownDialog(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [user, loading, invitations.length, hasShownDialog])

  const closeDialog = () => {
    setShowDialog(false)
  }

  return {
    showDialog,
    closeDialog,
    invitations
  }
}
