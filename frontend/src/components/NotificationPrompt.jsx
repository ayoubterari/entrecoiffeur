import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import './NotificationPrompt.css';

/**
 * Composant pour demander la permission des notifications push
 * S'affiche uniquement pour les vendeurs (professionnels et grossistes)
 */
const NotificationPrompt = ({ userId, userType }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const {
    permission,
    isSupported,
    requestPermission,
    sendTestNotification
  } = usePushNotifications(userId, userType);

  useEffect(() => {
    // Vérifier si l'utilisateur est un vendeur
    const isVendor = userType === 'professionnel' || userType === 'grossiste';
    
    // Vérifier si la demande a déjà été refusée
    const hasBeenDismissed = localStorage.getItem('notificationPromptDismissed');
    
    // Afficher le prompt si :
    // - L'utilisateur est un vendeur
    // - Les notifications sont supportées
    // - La permission n'a pas encore été accordée
    // - Le prompt n'a pas été refusé précédemment
    if (isVendor && isSupported && permission === 'default' && !hasBeenDismissed) {
      // Attendre 3 secondes avant d'afficher le prompt
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [userId, userType, isSupported, permission]);

  const handleAccept = async () => {
    const granted = await requestPermission();
    
    if (granted) {
      setShowPrompt(false);
      // Envoyer une notification de bienvenue
      setTimeout(() => {
        sendTestNotification();
      }, 1000);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    // Enregistrer que l'utilisateur a refusé (ne pas redemander pendant 7 jours)
    localStorage.setItem('notificationPromptDismissed', Date.now());
  };

  const handleLater = () => {
    setShowPrompt(false);
    // Ne pas enregistrer dans localStorage, redemander à la prochaine session
  };

  if (!showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="notification-prompt-overlay">
      <div className="notification-prompt-card">
        <div className="notification-prompt-icon">
          🔔
        </div>
        
        <h3 className="notification-prompt-title">
          Activer les notifications ?
        </h3>
        
        <p className="notification-prompt-description">
          Recevez une notification instantanée sur votre téléphone à chaque nouvelle commande. 
          Ne manquez plus jamais une vente !
        </p>
        
        <div className="notification-prompt-benefits">
          <div className="notification-benefit">
            <span className="benefit-icon">⚡</span>
            <span className="benefit-text">Alertes en temps réel</span>
          </div>
          <div className="notification-benefit">
            <span className="benefit-icon">📱</span>
            <span className="benefit-text">Sur votre téléphone</span>
          </div>
          <div className="notification-benefit">
            <span className="benefit-icon">🎯</span>
            <span className="benefit-text">Ne ratez aucune vente</span>
          </div>
        </div>
        
        <div className="notification-prompt-actions">
          <button 
            className="notification-btn notification-btn-primary"
            onClick={handleAccept}
          >
            Activer les notifications
          </button>
          
          <button 
            className="notification-btn notification-btn-secondary"
            onClick={handleLater}
          >
            Plus tard
          </button>
          
          <button 
            className="notification-btn notification-btn-text"
            onClick={handleDismiss}
          >
            Ne plus demander
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
