import React, { useState, useRef } from 'react'

const ImageUpload = ({ images, onImagesChange, maxImages = 5 }) => {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = (files) => {
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

    // Convertir les fichiers en URLs pour la prévisualisation
    const newImages = filesToAdd.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }))

    onImagesChange([...images, ...newImages])
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

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
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
        
        {images.length < maxImages ? (
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
                  <img 
                    src={image.url} 
                    alt={`Preview ${index + 1}`}
                    className="preview-image"
                  />
                  
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
                    {(image.file.size / 1024 / 1024).toFixed(2)} MB
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

export default ImageUpload
