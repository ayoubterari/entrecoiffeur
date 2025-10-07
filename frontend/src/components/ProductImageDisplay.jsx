import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'

const ProductImageDisplay = ({ images, productName, className = "product-image" }) => {
  // Si pas d'images, afficher placeholder
  if (!images || images.length === 0) {
    return <div className={className}>📦</div>
  }

  const firstImage = images[0]

  // Si c'est un storageId Convex
  if (typeof firstImage === 'string' && firstImage.startsWith('k')) {
    return <ConvexImageWithFallback storageId={firstImage} alt={productName} className={className} />
  }

  // Si c'est une URL d'image
  if (firstImage.startsWith('blob:') || firstImage.startsWith('http') || firstImage.startsWith('data:')) {
    return (
      <img 
        src={firstImage} 
        alt={productName}
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
  return <span className="product-emoji">{firstImage}</span>
}

const ConvexImageWithFallback = ({ storageId, alt, className }) => {
  const imageUrl = useQuery(api.files.getFileUrl, { storageId })
  
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

export default ProductImageDisplay
