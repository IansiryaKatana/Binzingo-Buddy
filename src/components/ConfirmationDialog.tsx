import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertTriangle, LogOut, ArrowLeft, Trash2, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
  icon?: 'logout' | 'back' | 'delete' | 'warning' | 'close'
  loading?: boolean
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon = 'warning',
  loading = false
}: ConfirmationDialogProps) {
  const isMobile = useIsMobile()

  const getIcon = () => {
    const iconSize = isMobile ? 'w-5 h-5' : 'w-6 h-6'
    
    switch (icon) {
      case 'logout':
        return <LogOut className={`${iconSize} text-red-500`} />
      case 'back':
        return <ArrowLeft className={`${iconSize} text-orange-500`} />
      case 'delete':
        return <Trash2 className={`${iconSize} text-red-500`} />
      case 'close':
        return <X className={`${iconSize} text-gray-500`} />
      case 'warning':
      default:
        return <AlertTriangle className={`${iconSize} text-yellow-500`} />
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          iconColor: 'text-red-500'
        }
      case 'warning':
        return {
          confirmButton: 'bg-orange-600 hover:bg-orange-700 text-white',
          iconColor: 'text-orange-500'
        }
      default:
        return {
          confirmButton: 'bg-gold hover:bg-gold/90 text-black',
          iconColor: 'text-gold'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'mx-4' : 'mx-auto'} max-w-md ios-card`}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white`}>
            {title}
          </DialogTitle>
          <DialogDescription className={`${isMobile ? 'text-sm' : 'text-base'} text-white/70 mt-2`}>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className={`${isMobile ? 'flex-col gap-3' : 'flex-row justify-end gap-3'} mt-6`}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className={`${isMobile ? 'w-full' : ''} ios-button border-white/30 text-white`}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`${isMobile ? 'w-full' : ''} ${styles.confirmButton} font-semibold`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} animate-spin border-2 border-current border-t-transparent rounded-full`} />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
