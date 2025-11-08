import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'

const ProductDetailImages = ({ images, productName, selectedImage, onImageSelect, featured, onSale, stock }) => {
  // Debug: Afficher les informations sur les images
  console.log('ProductDetailImages - Debug:', {
    imagesCount: images?.length,
    images: images,
    shouldShowThumbnails: images && images.length > 1
  })

  if (!images || images.length === 0) {
    return (
      <div className="main-image">
        <div className="image-container">
          <div className="placeholder-image">🛍️</div>
        </div>
      </div>
    )
  }

  const currentImage = images[selectedImage] || images[0]

  return (
    <div className="main-image">
      {/* Image principale */}
      <div className="image-container">
        <ConvexImageWithFallback 
          image={currentImage}
          alt={productName}
          className="product-detail-image"
        />
        
        {/* Badges */}
        <div className="product-badges">
          {featured && <span className="badge featured">⭐ Vedette</span>}
          {onSale && <span className="badge sale">🔥 Promo</span>}
          {stock < 10 && <span className="badge low-stock">⚠️ Stock limité</span>}
        </div>
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
    </div>
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
