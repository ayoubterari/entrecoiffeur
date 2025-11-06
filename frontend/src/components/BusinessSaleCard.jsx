import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ProductCard.css' // Réutiliser les mêmes styles que ProductCard

const BusinessSaleCard = ({ business }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/business-sale/${business._id}`)
  }

  // Formater le prix en format court (45k, 1.2M, etc.)
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M €`
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k €`
    }
    return `${price} €`
  }

  // Formater le chiffre d'affaires en format court
  const formatRevenue = (revenue) => {
    // Si c'est déjà une chaîne avec "€", on la parse
    const numRevenue = typeof revenue === 'string' ? parseFloat(revenue.replace(/[^0-9]/g, '')) : revenue
    
    if (isNaN(numRevenue)) return revenue
    
    if (numRevenue >= 1000000) {
      return `${(numRevenue / 1000000).toFixed(1)}M`
    } else if (numRevenue >= 1000) {
      return `${(numRevenue / 1000).toFixed(0)}k`
    }
    return numRevenue.toString()
  }

  // Obtenir la première image uploadée ou une image par défaut
  const getImageUrl = () => {
    if (business.images && business.images.length > 0) {
      const firstImage = business.images[0]
      
      // Si c'est une URL complète
      if (typeof firstImage === 'string' && firstImage.startsWith('http')) {
        return firstImage
      }
      
      // Si c'est un nom de fichier local, construire le chemin
      if (typeof firstImage === 'string' && !firstImage.startsWith('/')) {
        // Essayer de charger depuis le dossier public/uploads ou similaire
        return `/uploads/${firstImage}`
      }
      
      return firstImage
    }
    
    // Image par défaut - utiliser une image de placeholder en ligne
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
  }

  return (
    <div className="modern-product-card" onClick={handleClick}>
      {/* Image Container */}
      <div className="card-image-wrapper">
        <div className="card-image-container">
          <img 
            src={getImageUrl()} 
            alt={business.activityType}
            className="card-product-image"
            loading="lazy"
            onError={(e) => {
              // Si l'image ne charge pas, utiliser une image de secours
              e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
            }}
          />
          
          {/* Badge "Fonds de Commerce" */}
          <div className="card-badges">
            <span className="discount-badge" style={{ background: '#C0B4A5' }}>
              🏢 Fonds de Commerce
            </span>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="card-content">
        <h3 className="card-title">
          {business.businessName || business.activityType}
        </h3>
        
        <div className="card-meta" style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
          <span>📍 {business.city}</span>
          <span>📏 {business.totalArea}</span>
        </div>

        <p className="card-description">
          {business.localDescription?.substring(0, 80)}
          {business.localDescription?.length > 80 ? '...' : ''}
        </p>

        {/* Informations supplémentaires */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.25rem', 
          fontSize: '0.8rem', 
          color: '#666',
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #eee'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>CA annuel:</span>
            <strong>{formatRevenue(business.annualRevenue)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Loyer:</span>
            <strong>{formatPrice(business.monthlyRent)}/mois</strong>
          </div>
        </div>

        <div className="card-price">
          <span className="current-price">{formatPrice(business.salePrice)}</span>
        </div>
      </div>
    </div>
  )
}

export default BusinessSaleCard
