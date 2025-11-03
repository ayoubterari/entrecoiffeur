import React, { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useQuery } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/convex'
import ProductImageDisplay from './ProductImageDisplay'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './FranceMapModal.module.css'

// Fix pour les icônes Leaflet avec Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

// Coordonnées GPS réelles des villes françaises
const cityCoordinates = {
  'paris': { lat: 48.8566, lng: 2.3522, displayName: 'Paris' },
  'marseille': { lat: 43.2965, lng: 5.3698, displayName: 'Marseille' },
  'lyon': { lat: 45.7640, lng: 4.8357, displayName: 'Lyon' },
  'toulouse': { lat: 43.6047, lng: 1.4442, displayName: 'Toulouse' },
  'nice': { lat: 43.7102, lng: 7.2620, displayName: 'Nice' },
  'nantes': { lat: 47.2184, lng: -1.5536, displayName: 'Nantes' },
  'strasbourg': { lat: 48.5734, lng: 7.7521, displayName: 'Strasbourg' },
  'montpellier': { lat: 43.6108, lng: 3.8767, displayName: 'Montpellier' },
  'bordeaux': { lat: 44.8378, lng: -0.5792, displayName: 'Bordeaux' },
  'lille': { lat: 50.6292, lng: 3.0573, displayName: 'Lille' },
  'rennes': { lat: 48.1173, lng: -1.6778, displayName: 'Rennes' },
  'reims': { lat: 49.2583, lng: 4.0317, displayName: 'Reims' },
  'le havre': { lat: 49.4944, lng: 0.1079, displayName: 'Le Havre' },
  'saint-etienne': { lat: 45.4397, lng: 4.3872, displayName: 'Saint-Étienne' },
  'toulon': { lat: 43.1242, lng: 5.9280, displayName: 'Toulon' },
  'grenoble': { lat: 45.1885, lng: 5.7245, displayName: 'Grenoble' },
  'dijon': { lat: 47.3220, lng: 5.0415, displayName: 'Dijon' },
  'angers': { lat: 47.4784, lng: -0.5632, displayName: 'Angers' },
  'nimes': { lat: 43.8367, lng: 4.3601, displayName: 'Nîmes' },
  'villeurbanne': { lat: 45.7667, lng: 4.8833, displayName: 'Villeurbanne' },
  'clermont-ferrand': { lat: 45.7772, lng: 3.0870, displayName: 'Clermont-Ferrand' },
  'le mans': { lat: 48.0077, lng: 0.1984, displayName: 'Le Mans' },
  'aix-en-provence': { lat: 43.5297, lng: 5.4474, displayName: 'Aix-en-Provence' },
  'brest': { lat: 48.3904, lng: -4.4861, displayName: 'Brest' },
  'tours': { lat: 47.3941, lng: 0.6848, displayName: 'Tours' },
  'amiens': { lat: 49.8941, lng: 2.2958, displayName: 'Amiens' },
  'limoges': { lat: 45.8336, lng: 1.2611, displayName: 'Limoges' },
  'annecy': { lat: 45.8992, lng: 6.1294, displayName: 'Annecy' },
  'perpignan': { lat: 42.6886, lng: 2.8948, displayName: 'Perpignan' },
  'besancon': { lat: 47.2380, lng: 6.0243, displayName: 'Besançon' },
  'orleans': { lat: 47.9029, lng: 1.9093, displayName: 'Orléans' },
  'metz': { lat: 49.1193, lng: 6.1757, displayName: 'Metz' },
  'rouen': { lat: 49.4432, lng: 1.0993, displayName: 'Rouen' },
  'mulhouse': { lat: 47.7508, lng: 7.3359, displayName: 'Mulhouse' },
  'caen': { lat: 49.1829, lng: -0.3707, displayName: 'Caen' },
  'nancy': { lat: 48.6921, lng: 6.1844, displayName: 'Nancy' },
  'bastia': { lat: 42.7028, lng: 9.4497, displayName: 'Bastia' },
  'ajaccio': { lat: 41.9267, lng: 8.7369, displayName: 'Ajaccio' },
  'avignon': { lat: 43.9493, lng: 4.8055, displayName: 'Avignon' },
  'poitiers': { lat: 46.5802, lng: 0.3404, displayName: 'Poitiers' },
  'la rochelle': { lat: 46.1603, lng: -1.1511, displayName: 'La Rochelle' },
}

// Fonction pour normaliser les noms de villes
const normalizeCity = (city) => {
  if (!city) return ''
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Créer une icône personnalisée avec le nombre de produits
const createNumberedIcon = (count) => {
  const size = Math.min(25 + Math.log(count) * 8, 50)
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #C0B4A5 0%, #D4C9BC 100%);
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(12, size * 0.4)}px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        ${count}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Composant pour ajuster la vue de la carte
const MapBounds = ({ cities }) => {
  const map = useMap()
  
  React.useEffect(() => {
    if (cities.length > 0) {
      const bounds = L.latLngBounds(cities.map(city => [city.lat, city.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [cities, map])
  
  return null
}

const FranceMapModalLeaflet = ({ isOpen, onClose, products }) => {
  const navigate = useNavigate()
  const [selectedCity, setSelectedCity] = useState(null)
  const [showProductsPopup, setShowProductsPopup] = useState(false)
  
  // Récupérer tous les vendeurs pour obtenir leurs villes
  const allUsers = useQuery(api.auth.getUsersByType, { userType: "professionnel" })
  const allGrossistes = useQuery(api.auth.getUsersByType, { userType: "grossiste" })
  
  // Créer un map des vendeurs avec leurs villes
  const sellersMap = useMemo(() => {
    const map = new Map()
    if (Array.isArray(allUsers)) {
      allUsers.forEach(user => {
        if (user.city) map.set(user._id, user.city)
      })
    }
    if (Array.isArray(allGrossistes)) {
      allGrossistes.forEach(user => {
        if (user.city) map.set(user._id, user.city)
      })
    }
    return map
  }, [allUsers, allGrossistes])

  // Fonction pour extraire la ville d'une localisation complète
  const extractCityFromLocation = (location) => {
    if (!location) return null
    // Format: "Ville, Département, Région" ou juste "Ville"
    return location.split(',')[0].trim()
  }

  // Calculer le nombre de produits par ville
  const citiesWithProducts = useMemo(() => {
    if (!products || products.length === 0) return {}
    
    const cityCount = {}
    const unmatchedCities = new Set()
    
    products.forEach(product => {
      let location = product.location
      if (!location || location.trim() === '') {
        location = sellersMap.get(product.sellerId)
      }
      
      if (location && location.trim() !== '') {
        const city = extractCityFromLocation(location)
        const normalizedCity = normalizeCity(city)
        if (cityCoordinates[normalizedCity]) {
          const displayName = cityCoordinates[normalizedCity].displayName
          cityCount[displayName] = (cityCount[displayName] || 0) + 1
        } else {
          unmatchedCities.add(location)
        }
      }
    })
    
    if (unmatchedCities.size > 0) {
      console.log('🗺️ Villes non trouvées sur la carte:', Array.from(unmatchedCities))
      console.log('💡 Astuce: Vérifiez que les vendeurs ont bien renseigné leur ville dans leur profil')
    }
    
    console.log('🗺️ Villes avec produits:', cityCount)
    console.log('📊 Nombre de villes affichées:', Object.keys(cityCount).length)
    
    return cityCount
  }, [products, sellersMap])

  // Préparer les données pour les marqueurs
  const displayedCities = useMemo(() => {
    return Object.entries(citiesWithProducts)
      .map(([city, count]) => {
        const normalizedCity = normalizeCity(city)
        const coords = cityCoordinates[normalizedCity]
        if (!coords) return null
        
        return {
          name: city,
          count,
          lat: coords.lat,
          lng: coords.lng
        }
      })
      .filter(city => city !== null)
  }, [citiesWithProducts])

  // Fonction pour extraire la ville d'une localisation complète
  const extractCity = (location) => {
    if (!location) return null
    // Format: "Ville, Département, Région" ou juste "Ville"
    return location.split(',')[0].trim()
  }

  // Fonction pour récupérer les produits d'une ville
  const getCityProducts = (cityName) => {
    if (!products) return []
    
    return products.filter(product => {
      let location = product.location
      if (!location || location.trim() === '') {
        location = sellersMap.get(product.sellerId)
      }
      
      const city = extractCity(location)
      const normalizedProductCity = normalizeCity(city)
      const normalizedCityName = normalizeCity(cityName)
      
      return normalizedProductCity === normalizedCityName
    })
  }

  // Gérer le clic sur un marqueur
  const handleMarkerClick = (city) => {
    const cityProducts = getCityProducts(city.name)
    setSelectedCity({ ...city, products: cityProducts })
    setShowProductsPopup(true)
  }

  // Gérer la navigation vers la page produit
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <span className={styles.mapIcon}>🗺️</span>
            Découvrez où vivent vos Produits !
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {displayedCities.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📍</div>
              <h3>Aucune ville reconnue</h3>
              <p>Les produits disponibles ne sont pas encore associés à des villes françaises.</p>
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                background: '#fff3cd', 
                borderRadius: '8px',
                border: '1px solid #ffc107',
                textAlign: 'left'
              }}>
                <strong style={{ color: '#856404' }}>💡 Solution :</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#856404' }}>
                  <li>Les vendeurs doivent renseigner leur ville dans leur profil</li>
                  <li>Ou ajouter une localisation lors de la création du produit</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                <MapContainer
                  center={[46.603354, 1.888334]}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <MapBounds cities={displayedCities} />
                  
                  {displayedCities.map((city) => (
                    <Marker
                      key={city.name}
                      position={[city.lat, city.lng]}
                      icon={createNumberedIcon(city.count)}
                      eventHandlers={{
                        click: () => handleMarkerClick(city)
                      }}
                    >
                      <Popup>
                        <div style={{ textAlign: 'center', padding: '0.5rem', cursor: 'pointer' }}>
                          <strong style={{ fontSize: '1.1rem' }}>{city.name}</strong>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                            {city.count} produit{city.count > 1 ? 's' : ''}
                          </p>
                          <button 
                            onClick={() => handleMarkerClick(city)}
                            style={{
                              marginTop: '0.5rem',
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #C0B4A5 0%, #D4C9BC 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.85rem'
                            }}
                          >
                            Voir les produits
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Liste des villes */}
              <div className={styles.citiesList} style={{ marginTop: '1.5rem' }}>
                <h3 className={styles.citiesListTitle}>
                  Villes disponibles ({displayedCities.length})
                </h3>
                <div className={styles.citiesGrid}>
                  {displayedCities
                    .sort((a, b) => b.count - a.count)
                    .map((city) => (
                      <div key={city.name} className={styles.cityItem}>
                        <span className={styles.cityItemName}>📍 {city.name}</span>
                        <span className={styles.cityItemCount}>
                          {city.count} produit{city.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Popup sophistiqué des produits */}
      {showProductsPopup && selectedCity && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => setShowProductsPopup(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du popup */}
            <div style={{
              background: 'linear-gradient(135deg, #C0B4A5 0%, #D4C9BC 100%)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
                  📍 {selectedCity.name}
                </h3>
                <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                  {selectedCity.products.length} produit{selectedCity.products.length > 1 ? 's' : ''} disponible{selectedCity.products.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowProductsPopup(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                ✕
              </button>
            </div>

            {/* Corps du popup avec les produits */}
            <div style={{
              padding: '1.5rem',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}>
                {selectedCity.products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid #e5e5e5'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(192, 180, 165, 0.3)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Image du produit */}
                    <div style={{
                      width: '100%',
                      height: '220px',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                      position: 'relative'
                    }}>
                      <ProductImageDisplay
                        images={product.images}
                        productName={product.name}
                        className="map-product-image"
                      />
                      <style>{`
                        .map-product-image {
                          width: 100%;
                          height: 100%;
                          object-fit: cover;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 4rem;
                          color: #ddd;
                        }
                      `}</style>
                      
                      {/* Badge promo */}
                      {product.onSale && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: '#ff4757',
                          color: 'white',
                          padding: '0.4rem 0.9rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          boxShadow: '0 2px 8px rgba(255, 71, 87, 0.4)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          zIndex: 10
                        }}>
                          PROMO
                        </div>
                      )}
                    </div>

                    {/* Infos du produit */}
                    <div style={{ padding: '1.25rem' }}>
                      <h4 style={{
                        margin: '0 0 0.75rem 0',
                        fontSize: '1.05rem',
                        fontWeight: '700',
                        color: '#2d2d2d',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.3'
                      }}>
                        {product.name}
                      </h4>
                      
                      <p style={{
                        margin: '0 0 0.75rem 0',
                        fontSize: '0.875rem',
                        color: '#777',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.5',
                        minHeight: '2.6rem'
                      }}>
                        {product.description}
                      </p>

                      {/* Localisation complète */}
                      {product.location && product.location.includes(',') && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(192, 180, 165, 0.1)',
                          borderRadius: '6px',
                          marginBottom: '1rem',
                          fontSize: '0.8rem',
                          color: '#666'
                        }}>
                          <span style={{ fontSize: '1rem' }}>📍</span>
                          <span style={{ fontWeight: '500' }}>{product.location}</span>
                        </div>
                      )}

                      {/* Prix */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <span style={{
                          fontSize: '1.5rem',
                          fontWeight: '800',
                          color: '#2d2d2d',
                          letterSpacing: '-0.5px'
                        }}>
                          {Number(product.price || 0).toFixed(2)} €
                        </span>
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span style={{
                            fontSize: '1rem',
                            color: '#aaa',
                            textDecoration: 'line-through',
                            fontWeight: '500'
                          }}>
                            {Number(product.originalPrice).toFixed(2)} €
                          </span>
                        )}
                      </div>

                      {/* Stock */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: (product.stock || 0) > 0 ? '#27ae60' : '#e74c3c',
                        marginBottom: '1rem',
                        padding: '0.5rem 0.75rem',
                        background: (product.stock || 0) > 0 ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                        borderRadius: '6px'
                      }}>
                        <span style={{ fontSize: '1.1rem' }}>{(product.stock || 0) > 0 ? '✓' : '✗'}</span>
                        <span>
                          {(product.stock || 0) > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
                        </span>
                      </div>

                      {/* Bouton voir détails */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProductClick(product._id)
                        }}
                        style={{
                          width: '100%',
                          padding: '0.875rem',
                          background: 'linear-gradient(135deg, #C0B4A5 0%, #D4C9BC 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(192, 180, 165, 0.3)',
                          letterSpacing: '0.3px'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)'
                          e.target.style.boxShadow = '0 4px 12px rgba(192, 180, 165, 0.4)'
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)'
                          e.target.style.boxShadow = '0 2px 8px rgba(192, 180, 165, 0.3)'
                        }}
                      >
                        Voir les détails →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FranceMapModalLeaflet
