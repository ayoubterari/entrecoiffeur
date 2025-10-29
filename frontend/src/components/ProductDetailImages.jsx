import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'

const ProductDetailImages = ({ images, productName, selectedImage, onImageSelect }) => {
  if (!images || images.length === 0) {
    return (
      <div className="image-container">
        <div className="placeholder-image">🛍️</div>
      </div>
    )
  }

  const currentImage = images[selectedImage] || images[0]

  return (
    <>
      {/* Image principale */}
      <div className="image-container">
        <ConvexImageWithFallback 
          image={currentImage}
          alt={productName}
          className="product-detail-image"
        />
      </div>
      
      {/* Miniatures */}
      {images.length > 1 && (
        <div className="image-thumbnails">
          {images.map((image, index) => (
            <button
              key={index}
              className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
              onClick={() => onImageSelect(index)}
            >
              <ConvexImageWithFallback 
                image={image}
                alt={`${productName} ${index + 1}`}
                className="thumbnail-image"
              />
            </button>
          ))}
        </div>
      )}
    </>
  )
}

const ConvexImageWithFallback = ({ image, alt, className }) => {
  // Si c'est un storageId Convex
  if (typeof image === 'string' && image.startsWith('k')) {
    const imageUrl = useQuery(api.files.getFileUrl, { storageId: image })
    
    if (!imageUrl) {
      return <div className={className}>⏳</div>
    }
    
    return (
      <img 
        src={imageUrl} 
        alt={alt}
        className={className}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          maxWidth: 'none',
          maxHeight: 'none'
        }}
        onError={(e) => {
          e.target.style.display = 'none'
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex'
          }
        }}
      />
    )
  }

  // Si c'est une URL d'image
  if (typeof image === 'string' && (image.startsWith('blob:') || image.startsWith('http') || image.startsWith('data:'))) {
    return (
      <img 
        src={image} 
        alt={alt}
        className={className}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          maxWidth: 'none',
          maxHeight: 'none'
        }}
        onError={(e) => {
          e.target.style.display = 'none'
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex'
          }
        }}
      />
    )
  }

  // Si c'est un emoji ou autre
  return <div className={className}>{image || '🛍️'}</div>
}

export default ProductDetailImages
