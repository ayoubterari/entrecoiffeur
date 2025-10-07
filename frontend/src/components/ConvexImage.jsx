import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'

const ConvexImage = ({ storageId, alt, className, fallback = '📦', ...props }) => {
  const imageUrl = useQuery(api.files.getFileUrl, storageId ? { storageId } : "skip")
  
  if (!storageId) {
    return <div className={className} {...props}>{fallback}</div>
  }
  
  if (!imageUrl) {
    return <div className={className} {...props}>⏳</div>
  }
  
  return (
    <img 
      src={imageUrl} 
      alt={alt}
      className={className}
      onError={(e) => {
        // Fallback en cas d'erreur de chargement
        e.target.style.display = 'none'
        if (e.target.nextSibling) {
          e.target.nextSibling.style.display = 'flex'
        }
      }}
      {...props}
    />
  )
}

export default ConvexImage
