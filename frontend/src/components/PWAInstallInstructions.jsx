import React from 'react'
import './PWAInstallInstructions.css'

const PWAInstallInstructions = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  const isAndroid = /Android/.test(navigator.userAgent)

  return (
    <div className="pwa-instructions-overlay" onClick={onClose}>
      <div className="pwa-instructions-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pwa-instructions-close" onClick={onClose}>
          ×
        </button>

        <div className="pwa-instructions-header">
          <div className="pwa-instructions-icon">📱</div>
          <h2>Installer EntreCoiffeur</h2>
          <p>Suivez ces étapes simples pour installer l'application</p>
        </div>

        <div className="pwa-instructions-content">
          {isIOS && (
            <div className="pwa-instructions-steps">
              <h3>Sur iPhone/iPad (Safari)</h3>
              
              <div className="pwa-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <div className="step-icon">📤</div>
                  <div className="step-text">
                    <strong>Appuyez sur le bouton Partager</strong>
                    <p>En bas de l'écran dans Safari</p>
                  </div>
                </div>
              </div>

              <div className="pwa-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="step-icon">➕</div>
                  <div className="step-text">
                    <strong>Sélectionnez "Sur l'écran d'accueil"</strong>
                    <p>Dans le menu qui s'affiche</p>
                  </div>
                </div>
              </div>

              <div className="pwa-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <div className="step-icon">✅</div>
                  <div className="step-text">
                    <strong>Confirmez l'ajout</strong>
                    <p>L'icône apparaîtra sur votre écran d'accueil</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAndroid && (
            <div className="pwa-instructions-steps">
              <h3>Sur Android (Chrome)</h3>
              
              <div className="pwa-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <div className="step-icon">⋮</div>
                  <div className="step-text">
                    <strong>Ouvrez le menu</strong>
                    <p>Les 3 points en haut à droite</p>
                  </div>
                </div>
              </div>

              <div className="pwa-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="step-icon">📥</div>
                  <div className="step-text">
                    <strong>Sélectionnez "Installer l'application"</strong>
                    <p>Ou "Ajouter à l'écran d'accueil"</p>
                  </div>
                </div>
              </div>

              <div className="pwa-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <div className="step-icon">✅</div>
                  <div className="step-text">
                    <strong>Confirmez l'installation</strong>
                    <p>L'app s'installera automatiquement</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isIOS && !isAndroid && (
            <div className="pwa-instructions-steps">
              <h3>Sur Desktop (Chrome/Edge)</h3>
              
              <div className="pwa-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <div className="step-icon">🔍</div>
                  <div className="step-text">
                    <strong>Cherchez l'icône d'installation</strong>
                    <p>Dans la barre d'adresse (à droite)</p>
                  </div>
                </div>
              </div>

              <div className="pwa-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="step-icon">📥</div>
                  <div className="step-text">
                    <strong>Cliquez sur "Installer"</strong>
                    <p>Une fenêtre de confirmation apparaîtra</p>
                  </div>
                </div>
              </div>

              <div className="pwa-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <div className="step-icon">✅</div>
                  <div className="step-text">
                    <strong>Confirmez l'installation</strong>
                    <p>L'app s'ouvrira dans une fenêtre dédiée</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pwa-instructions-footer">
          <button className="pwa-instructions-btn" onClick={onClose}>
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallInstructions
