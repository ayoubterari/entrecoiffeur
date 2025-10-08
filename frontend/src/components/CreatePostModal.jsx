import React, { useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'
import './CreatePostModal.css'

const CreatePostModal = ({ isOpen, onClose, sellerId, onPostCreated }) => {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('text')
  const [selectedImages, setSelectedImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const createPost = useMutation(api.sellerPosts.createSellerPost)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Le contenu est requis')
      return
    }

    if (content.length > 2000) {
      setError('Le contenu ne peut pas dépasser 2000 caractères')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // For now, we'll handle images as URLs (you can extend this for file uploads)
      const imageUrls = selectedImages.map(img => img.url || img)

      await createPost({
        sellerId,
        content: content.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
        type: postType
      })

      // Reset form
      setContent('')
      setSelectedImages([])
      setPostType('text')
      
      // Notify parent and close modal
      if (onPostCreated) onPostCreated()
      onClose()
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setSelectedImages(prev => [...prev, {
            file,
            url: e.target.result,
            name: file.name
          }])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleTypeChange = (type) => {
    setPostType(type)
    if (type === 'text') {
      setSelectedImages([])
    }
  }

  if (!isOpen) return null

  return (
    <div className="create-post-modal-overlay">
      <div className="create-post-modal">
        <div className="modal-header">
          <h2>✨ Créer un nouveau post</h2>
          <button 
            className="close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          {/* Post Type Selection */}
          <div className="post-type-selector">
            <label>Type de post :</label>
            <div className="type-buttons">
              <button
                type="button"
                className={`type-btn ${postType === 'text' ? 'active' : ''}`}
                onClick={() => handleTypeChange('text')}
              >
                📝 Texte
              </button>
              <button
                type="button"
                className={`type-btn ${postType === 'image' ? 'active' : ''}`}
                onClick={() => handleTypeChange('image')}
              >
                📸 Image
              </button>
              <button
                type="button"
                className={`type-btn ${postType === 'promotion' ? 'active' : ''}`}
                onClick={() => handleTypeChange('promotion')}
              >
                🎯 Promo
              </button>
              <button
                type="button"
                className={`type-btn ${postType === 'announcement' ? 'active' : ''}`}
                onClick={() => handleTypeChange('announcement')}
              >
                📢 Annonce
              </button>
            </div>
          </div>

          {/* Content Input */}
          <div className="content-input-section">
            <label htmlFor="content">Contenu du post :</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Partagez quelque chose d'intéressant avec vos followers...`}
              maxLength={2000}
              rows={6}
              disabled={isSubmitting}
              required
            />
            <div className="char-count">
              {content.length}/2000 caractères
            </div>
          </div>

          {/* Image Upload (for image posts) */}
          {postType === 'image' && (
            <div className="image-upload-section">
              <label>Images :</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  📷 Ajouter des images
                </button>
              </div>

              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <div className="image-preview-grid">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={image.url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        disabled={isSubmitting}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Publication...
                </>
              ) : (
                <>
                  ✨ Publier
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePostModal
