import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import './InstallPWA.css';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Vérifier si l'utilisateur a déjà fermé la bannière
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
    const dismissedDate = bannerDismissed ? new Date(bannerDismissed) : null;
    const daysSinceDismissed = dismissedDate 
      ? (new Date() - dismissedDate) / (1000 * 60 * 60 * 24) 
      : 999;

    // Afficher la bannière si pas installé, pas iOS, et pas fermée récemment (< 7 jours)
    if (!isInStandaloneMode && !iOS && daysSinceDismissed > 7) {
      setShowBanner(true);
    }

    // Écouter l'événement beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Écouter l'événement d'installation réussie
    window.addEventListener('appinstalled', () => {
      console.log('PWA installée avec succès');
      setShowInstallButton(false);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Afficher la popup d'installation native
    deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Utilisateur a accepté l\'installation');
    } else {
      console.log('Utilisateur a refusé l\'installation');
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', new Date().toISOString());
  };

  // Ne rien afficher si l'app est déjà installée
  if (isStandalone) {
    return null;
  }

  // Bannière pour iOS avec instructions
  if (isIOS && showBanner) {
    return (
      <div className="pwa-banner ios-banner">
        <button className="pwa-banner-close" onClick={handleDismissBanner}>
          <X size={20} />
        </button>
        <div className="pwa-banner-content">
          <Smartphone className="pwa-banner-icon" size={32} />
          <div className="pwa-banner-text">
            <h3>Installer EntreCoiffeur</h3>
            <p>
              Pour installer l'application sur iOS, appuyez sur 
              <span className="ios-share-icon"> ⎙ </span>
              puis "Sur l'écran d'accueil"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Bannière pour Android/Chrome
  if (showBanner && showInstallButton) {
    return (
      <div className="pwa-banner">
        <button className="pwa-banner-close" onClick={handleDismissBanner}>
          <X size={20} />
        </button>
        <div className="pwa-banner-content">
          <Smartphone className="pwa-banner-icon" size={32} />
          <div className="pwa-banner-text">
            <h3>Installer EntreCoiffeur</h3>
            <p>Installez l'application pour un accès rapide et une meilleure expérience</p>
          </div>
          <button className="pwa-install-button" onClick={handleInstallClick}>
            <Download size={20} />
            Installer
          </button>
        </div>
      </div>
    );
  }

  // Bouton flottant discret (si pas de bannière mais installation possible)
  if (showInstallButton && !showBanner) {
    return (
      <button 
        className="pwa-floating-button" 
        onClick={handleInstallClick}
        title="Installer l'application"
      >
        <Download size={24} />
      </button>
    );
  }

  return null;
};

export default InstallPWA;
