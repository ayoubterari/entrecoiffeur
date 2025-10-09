import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'
import './ShareModal.css'

const ShareModal = ({ isOpen, onClose, sellerId, sellerName, currentUserId }) => {
  const [affiliateLink, setAffiliateLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const createAffiliateLink = useMutation(api.affiliateSystem.createAffiliateLink)

  useEffect(() => {
    if (isOpen && currentUserId && sellerId) {
      generateAffiliateLink()
    }
  }, [isOpen, currentUserId, sellerId])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const generateAffiliateLink = async () => {
    if (!currentUserId || !sellerId) return

    setIsGenerating(true)
    setError('')

    try {
      const result = await createAffiliateLink({
        affiliateId: currentUserId,
        sellerId: sellerId
      })

      if (result.success) {
        setAffiliateLink(result.linkUrl)
      } else {
        setError('Erreur lors de la génération du lien')
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la génération du lien')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
      const textArea = document.createElement('textarea')
      textArea.value = affiliateLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareOnSocial = (platform) => {
    const text = `Découvrez les produits de ${sellerName} sur EntreCoiffeur ! 💄✨`
    const url = affiliateLink

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="share-modal-overlay" onClick={handleOverlayClick}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="share-modal-header">
          <div className="share-icon">🔗</div>
          <h2>Partager et gagner des points</h2>
          <p>Partagez le store de <strong>{sellerName}</strong> et gagnez des points à chaque commande passée via votre lien !</p>
        </div>

        <div className="points-info">
          <div className="points-card">
            <div className="points-icon">💰</div>
            <div className="points-details">
              <h3>Comment ça marche ?</h3>
              <ul>
                <li>✨ Partagez votre lien unique</li>
                <li>🛒 Vos amis passent commande</li>
                <li>💎 Vous gagnez 5% en points</li>
                <li>🎁 Utilisez vos points pour vos achats</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {isGenerating ? (
          <div className="generating-link">
            <div className="loading-spinner"></div>
            <p>Génération de votre lien unique...</p>
          </div>
        ) : affiliateLink ? (
          <>
            {/* Lien d'affiliation */}
            <div className="affiliate-link-section">
              <label className="link-label">Votre lien d'affiliation unique :</label>
              <div className="link-container">
                <input
                  type="text"
                  value={affiliateLink}
                  readOnly
                  className="affiliate-link-input"
                />
                <button
                  onClick={copyToClipboard}
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                >
                  {copied ? (
                    <>
                      <span className="copy-icon">✓</span>
                      Copié !
                    </>
                  ) : (
                    <>
                      <span className="copy-icon">📋</span>
                      Copier
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Boutons de partage social */}
            <div className="social-share-section">
              <h3>Partager sur les réseaux sociaux</h3>
              <div className="social-buttons">
                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="social-btn facebook"
                >
                  <span className="social-icon">📘</span>
                  Facebook
                </button>
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="social-btn twitter"
                >
                  <span className="social-icon">🐦</span>
                  Twitter
                </button>
                <button
                  onClick={() => shareOnSocial('whatsapp')}
                  className="social-btn whatsapp"
                >
                  <span className="social-icon">💬</span>
                  WhatsApp
                </button>
                <button
                  onClick={() => shareOnSocial('telegram')}
                  className="social-btn telegram"
                >
                  <span className="social-icon">✈️</span>
                  Telegram
                </button>
                <button
                  onClick={() => shareOnSocial('linkedin')}
                  className="social-btn linkedin"
                >
                  <span className="social-icon">💼</span>
                  LinkedIn
                </button>
              </div>
            </div>

            {/* Conseils de partage */}
            <div className="sharing-tips">
              <h4>💡 Conseils pour maximiser vos gains</h4>
              <div className="tips-grid">
                <div className="tip">
                  <span className="tip-icon">👥</span>
                  <span>Partagez avec vos amis passionnés de beauté</span>
                </div>
                <div className="tip">
                  <span className="tip-icon">📱</span>
                  <span>Utilisez les réseaux sociaux et groupes</span>
                </div>
                <div className="tip">
                  <span className="tip-icon">💌</span>
                  <span>Envoyez par message privé pour plus d'impact</span>
                </div>
                <div className="tip">
                  <span className="tip-icon">⭐</span>
                  <span>Recommandez les produits que vous aimez</span>
                </div>
              </div>
            </div>
          </>
        ) : null}

        <div className="modal-footer">
          <button onClick={onClose} className="close-btn">
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ShareModal
