import React, { useState, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../lib/convex'

const ImageUpload = ({ images, onImagesChange, maxImages = 5 }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const storeFile = useMutation(api.files.storeFile)

  const handleFiles = async (files) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} n'est pas une image valide`)
        return false
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} est trop volumineux (max 5MB)`)
        return false
      }
      
      return true
    })

    // Limiter le nombre d'images
    const remainingSlots = maxImages - images.length
    const filesToAdd = validFiles.slice(0, remainingSlots)
    
    if (validFiles.length > remainingSlots) {
      alert(`Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s)`)
    }

    if (filesToAdd.length === 0) return

    setUploading(true)
    
    try {
      // Upload files to Convex storage
      const uploadedImages = []
      
      for (const file of filesToAdd) {
        // Generate upload URL
        const uploadUrl = await generateUploadUrl()
        
        // Upload file to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })
        
        if (!result.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }
        
        const { storageId } = await result.json()
        
        // Store file metadata
        await storeFile({
          storageId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        })
        
        // Create image object with storage ID
        uploadedImages.push({
          storageId,
          name: file.name,
          size: file.size,
          type: file.type,
          // Create temporary preview URL for immediate display
          previewUrl: URL.createObjectURL(file)
        })
      }
      
      onImagesChange([...images, ...uploadedImages])
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Erreur lors du téléchargement des images. Veuillez réessayer.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = async (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files)
    }
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="image-upload-container">
      <div className="upload-header">
        <label>Photos du produit ({images.length}/{maxImages})</label>
        <p className="upload-hint">Ajoutez jusqu'à {maxImages} photos. La première sera l'image principale.</p>
      </div>

      {/* Zone de drop */}
      <div
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${images.length >= maxImages ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={images.length < maxImages ? onButtonClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={images.length >= maxImages}
        />
        
        {uploading ? (
          <div className="upload-content">
            <div className="upload-icon">⏳</div>
            <p className="upload-text">
              Téléchargement en cours...
            </p>
            <p className="upload-subtext">
              Veuillez patienter
            </p>
          </div>
        ) : images.length < maxImages ? (
          <div className="upload-content">
            <div className="upload-icon">📸</div>
            <p className="upload-text">
              Cliquez ou glissez-déposez vos images ici
            </p>
            <p className="upload-subtext">
              PNG, JPG, JPEG jusqu'à 5MB chacune
            </p>
          </div>
        ) : (
          <div className="upload-content disabled">
            <div className="upload-icon">✅</div>
            <p className="upload-text">
              Limite d'images atteinte ({maxImages}/{maxImages})
            </p>
          </div>
        )}
      </div>

      {/* Prévisualisation des images */}
      {images.length > 0 && (
        <div className="images-preview">
          <h4>Aperçu des images</h4>
          <div className="images-grid">
            {images.map((image, index) => (
              <div key={index} className={`image-preview-item ${index === 0 ? 'main-image' : ''}`}>
                {index === 0 && <div className="main-badge">Image principale</div>}
                
                <div className="image-container">
                  {image.storageId && !image.previewUrl ? (
                    <ConvexImagePreview 
                      storageId={image.storageId}
                      alt={`Preview ${index + 1}`}
                      className="preview-image"
                    />
                  ) : (
                    <img 
                      src={image.previewUrl || image.url} 
                      alt={`Preview ${index + 1}`}
                      className="preview-image"
                    />
                  )}
                  
                  <div className="image-overlay">
                    <div className="image-actions">
                      {index > 0 && (
                        <button
                          type="button"
                          className="move-btn left"
                          onClick={() => moveImage(index, index - 1)}
                          title="Déplacer à gauche"
                        >
                          ←
                        </button>
                      )}
                      
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          className="move-btn right"
                          onClick={() => moveImage(index, index + 1)}
                          title="Déplacer à droite"
                        >
                          →
                        </button>
                      )}
                      
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeImage(index)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="image-info">
                  <p className="image-name">{image.name}</p>
                  <p className="image-size">
                    {((image.size || image.file?.size || 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="upload-tips">
            <p>💡 <strong>Conseils :</strong></p>
            <ul>
              <li>La première image sera l'image principale du produit</li>
              <li>Utilisez les flèches pour réorganiser l'ordre</li>
              <li>Privilégiez des images de haute qualité (min 800x600px)</li>
              <li>Montrez le produit sous différents angles</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// Composant pour afficher les images depuis Convex storage
const ConvexImagePreview = ({ storageId, alt, className }) => {
  const imageUrl = useQuery(api.files.getFileUrl, { storageId })
  
  if (!imageUrl) {
    return <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>⏳</div>
  }
  
  return (
    <img 
      src={imageUrl} 
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.style.display = 'none'
        if (e.target.nextSibling) {
          e.target.nextSibling.style.display = 'flex'
        }
      }}
    />
  )
}

export default ImageUpload
