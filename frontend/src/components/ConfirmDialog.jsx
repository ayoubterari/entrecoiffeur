import React from 'react'

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmer l'action", 
  message = "Êtes-vous sûr de vouloir continuer ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "danger" // danger, warning, info
}) => {
  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'danger': return '⚠️'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '⚠️'
    }
  }

  return (
    <div className="confirm-dialog-overlay" onClick={handleOverlayClick}>
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon confirm-dialog-icon-${type}`}>
            {getIcon()}
          </div>
          <h3 className="confirm-dialog-title">{title}</h3>
        </div>
        
        <div className="confirm-dialog-content">
          <p className="confirm-dialog-message">{message}</p>
        </div>
        
        <div className="confirm-dialog-actions">
          <button 
            className="confirm-dialog-btn confirm-dialog-cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-dialog-btn confirm-dialog-confirm confirm-dialog-confirm-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
