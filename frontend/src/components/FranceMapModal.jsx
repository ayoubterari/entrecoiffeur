import React, { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import styles from './FranceMapModal.module.css'

// Fonction pour normaliser les noms de villes (enlever accents, majuscules, etc.)
const normalizeCity = (city) => {
  if (!city) return ''
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .trim()
}

// Coordonnées approximatives des villes françaises (normalisées pour un SVG de 600x700)
const cityCoordinates = {
  'paris': { x: 320, y: 180, displayName: 'Paris' },
  'marseille': { x: 380, y: 520, displayName: 'Marseille' },
  'lyon': { x: 360, y: 340, displayName: 'Lyon' },
  'toulouse': { x: 200, y: 520, displayName: 'Toulouse' },
  'nice': { x: 450, y: 530, displayName: 'Nice' },
  'nantes': { x: 120, y: 280, displayName: 'Nantes' },
  'strasbourg': { x: 480, y: 200, displayName: 'Strasbourg' },
  'montpellier': { x: 310, y: 530, displayName: 'Montpellier' },
  'bordeaux': { x: 130, y: 420, displayName: 'Bordeaux' },
  'lille': { x: 300, y: 80, displayName: 'Lille' },
  'rennes': { x: 100, y: 240, displayName: 'Rennes' },
  'reims': { x: 340, y: 150, displayName: 'Reims' },
  'le havre': { x: 220, y: 160, displayName: 'Le Havre' },
  'saint-etienne': { x: 360, y: 370, displayName: 'Saint-Étienne' },
  'toulon': { x: 410, y: 550, displayName: 'Toulon' },
  'grenoble': { x: 400, y: 380, displayName: 'Grenoble' },
  'dijon': { x: 380, y: 270, displayName: 'Dijon' },
  'angers': { x: 130, y: 280, displayName: 'Angers' },
  'nimes': { x: 340, y: 510, displayName: 'Nîmes' },
  'villeurbanne': { x: 365, y: 345, displayName: 'Villeurbanne' },
  'clermont-ferrand': { x: 300, y: 380, displayName: 'Clermont-Ferrand' },
  'le mans': { x: 200, y: 240, displayName: 'Le Mans' },
  'aix-en-provence': { x: 390, y: 515, displayName: 'Aix-en-Provence' },
  'brest': { x: 40, y: 240, displayName: 'Brest' },
  'tours': { x: 210, y: 280, displayName: 'Tours' },
  'amiens': { x: 280, y: 130, displayName: 'Amiens' },
  'limoges': { x: 220, y: 380, displayName: 'Limoges' },
  'annecy': { x: 420, y: 360, displayName: 'Annecy' },
  'perpignan': { x: 280, y: 600, displayName: 'Perpignan' },
  'besancon': { x: 420, y: 290, displayName: 'Besançon' },
  'orleans': { x: 250, y: 260, displayName: 'Orléans' },
  'metz': { x: 430, y: 170, displayName: 'Metz' },
  'rouen': { x: 240, y: 160, displayName: 'Rouen' },
  'mulhouse': { x: 480, y: 250, displayName: 'Mulhouse' },
  'caen': { x: 180, y: 170, displayName: 'Caen' },
  'nancy': { x: 430, y: 200, displayName: 'Nancy' },
  'argenteuil': { x: 315, y: 175, displayName: 'Argenteuil' },
  'montreuil': { x: 325, y: 178, displayName: 'Montreuil' },
  'saint-denis': { x: 318, y: 177, displayName: 'Saint-Denis' },
  // Ajout de quelques villes supplémentaires
  'versailles': { x: 310, y: 185, displayName: 'Versailles' },
  'boulogne-billancourt': { x: 315, y: 182, displayName: 'Boulogne-Billancourt' },
  'nanterre': { x: 312, y: 180, displayName: 'Nanterre' },
  'creteil': { x: 325, y: 183, displayName: 'Créteil' },
  'avignon': { x: 360, y: 500, displayName: 'Avignon' },
  'poitiers': { x: 180, y: 350, displayName: 'Poitiers' },
  'la rochelle': { x: 120, y: 380, displayName: 'La Rochelle' },
  'pau': { x: 140, y: 510, displayName: 'Pau' },
  'bayonne': { x: 110, y: 520, displayName: 'Bayonne' },
  'angouleme': { x: 180, y: 400, displayName: 'Angoulême' },
  'perigueux': { x: 200, y: 410, displayName: 'Périgueux' },
  'niort': { x: 150, y: 360, displayName: 'Niort' },
  'agen': { x: 180, y: 470, displayName: 'Agen' },
  'colmar': { x: 490, y: 240, displayName: 'Colmar' },
  'troyes': { x: 350, y: 240, displayName: 'Troyes' },
  'epinal': { x: 450, y: 240, displayName: 'Épinal' },
  'charleville-mezieres': { x: 360, y: 130, displayName: 'Charleville-Mézières' },
  'chalons-en-champagne': { x: 360, y: 170, displayName: 'Châlons-en-Champagne' },
  'roubaix': { x: 305, y: 75, displayName: 'Roubaix' },
  'tourcoing': { x: 310, y: 72, displayName: 'Tourcoing' },
  'dunkerque': { x: 280, y: 60, displayName: 'Dunkerque' },
  'calais': { x: 250, y: 55, displayName: 'Calais' },
  'valenciennes': { x: 320, y: 90, displayName: 'Valenciennes' },
  'boulogne-sur-mer': { x: 240, y: 90, displayName: 'Boulogne-sur-Mer' },
  'arras': { x: 280, y: 100, displayName: 'Arras' },
  'douai': { x: 300, y: 95, displayName: 'Douai' },
  'cherbourg-en-cotentin': { x: 140, y: 150, displayName: 'Cherbourg-en-Cotentin' },
  'evreux': { x: 230, y: 190, displayName: 'Évreux' },
  'dieppe': { x: 230, y: 150, displayName: 'Dieppe' },
  'alencon': { x: 180, y: 230, displayName: 'Alençon' },
  'saint-nazaire': { x: 100, y: 300, displayName: 'Saint-Nazaire' },
  'cholet': { x: 140, y: 300, displayName: 'Cholet' },
  'laval': { x: 160, y: 250, displayName: 'Laval' },
  'la roche-sur-yon': { x: 130, y: 340, displayName: 'La Roche-sur-Yon' },
  'quimper': { x: 50, y: 260, displayName: 'Quimper' },
  'lorient': { x: 70, y: 270, displayName: 'Lorient' },
  'vannes': { x: 90, y: 280, displayName: 'Vannes' },
  'saint-malo': { x: 100, y: 220, displayName: 'Saint-Malo' },
  'saint-brieuc': { x: 80, y: 230, displayName: 'Saint-Brieuc' },
  'lannion': { x: 70, y: 220, displayName: 'Lannion' },
  'bourges': { x: 270, y: 310, displayName: 'Bourges' },
  'blois': { x: 230, y: 270, displayName: 'Blois' },
  'chateauroux': { x: 240, y: 340, displayName: 'Châteauroux' },
  'chartres': { x: 240, y: 230, displayName: 'Chartres' },
  'joue-les-tours': { x: 215, y: 285, displayName: 'Joué-lès-Tours' },
  'belfort': { x: 460, y: 280, displayName: 'Belfort' },
  'chalon-sur-saone': { x: 370, y: 310, displayName: 'Chalon-sur-Saône' },
  'nevers': { x: 310, y: 310, displayName: 'Nevers' },
  'auxerre': { x: 320, y: 260, displayName: 'Auxerre' },
  'macon': { x: 370, y: 330, displayName: 'Mâcon' },
  'antibes': { x: 460, y: 540, displayName: 'Antibes' },
  'cannes': { x: 455, y: 545, displayName: 'Cannes' },
  'la seyne-sur-mer': { x: 415, y: 555, displayName: 'La Seyne-sur-Mer' },
  'hyeres': { x: 425, y: 560, displayName: 'Hyères' },
  'frejus': { x: 445, y: 550, displayName: 'Fréjus' },
  'arles': { x: 360, y: 520, displayName: 'Arles' },
  'grasse': { x: 465, y: 535, displayName: 'Grasse' },
  'beziers': { x: 300, y: 540, displayName: 'Béziers' },
  'carcassonne': { x: 260, y: 540, displayName: 'Carcassonne' },
  'albi': { x: 250, y: 500, displayName: 'Albi' },
  'tarbes': { x: 160, y: 530, displayName: 'Tarbes' },
  'narbonne': { x: 290, y: 550, displayName: 'Narbonne' },
  'sete': { x: 320, y: 540, displayName: 'Sète' },
  'courbevoie': { x: 316, y: 179, displayName: 'Courbevoie' },
  'vitry-sur-seine': { x: 323, y: 181, displayName: 'Vitry-sur-Seine' },
  'chambery': { x: 410, y: 370, displayName: 'Chambéry' },
  'valence': { x: 370, y: 400, displayName: 'Valence' },
  'bourg-en-bresse': { x: 390, y: 330, displayName: 'Bourg-en-Bresse' },
  'annemasse': { x: 430, y: 360, displayName: 'Annemasse' },
  // Corse
  'bastia': { x: 520, y: 580, displayName: 'Bastia' },
  'ajaccio': { x: 500, y: 620, displayName: 'Ajaccio' },
  'porto-vecchio': { x: 515, y: 640, displayName: 'Porto-Vecchio' },
  'calvi': { x: 495, y: 570, displayName: 'Calvi' },
  'corte': { x: 510, y: 600, displayName: 'Corte' },
  // DOM-TOM (positionnés à côté de la Corse pour visibilité)
  'fort-de-france': { x: 550, y: 650, displayName: 'Fort-de-France' },
  'pointe-a-pitre': { x: 560, y: 660, displayName: 'Pointe-à-Pitre' },
  'cayenne': { x: 570, y: 670, displayName: 'Cayenne' },
  'saint-denis (la reunion)': { x: 540, y: 680, displayName: 'Saint-Denis (La Réunion)' },
  'noumea': { x: 580, y: 690, displayName: 'Nouméa' },
  'papeete': { x: 590, y: 700, displayName: 'Papeete' },
}

const FranceMapModal = ({ isOpen, onClose, products }) => {
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

  // Calculer le nombre de produits par ville
  const citiesWithProducts = useMemo(() => {
    if (!products || products.length === 0) return {}
    
    const cityCount = {}
    const unmatchedCities = new Set()
    
    products.forEach(product => {
      // Utiliser product.location en priorité, sinon la ville du vendeur
      let location = product.location
      if (!location || location.trim() === '') {
        location = sellersMap.get(product.sellerId)
      }
      
      if (location && location.trim() !== '') {
        const normalizedCity = normalizeCity(location)
        if (cityCoordinates[normalizedCity]) {
          const displayName = cityCoordinates[normalizedCity].displayName
          cityCount[displayName] = (cityCount[displayName] || 0) + 1
        } else {
          unmatchedCities.add(location)
        }
      }
    })
    
    // Debug: afficher les villes non trouvées
    if (unmatchedCities.size > 0) {
      console.log('🗺️ Villes non trouvées sur la carte:', Array.from(unmatchedCities))
      console.log('💡 Astuce: Vérifiez que les vendeurs ont bien renseigné leur ville dans leur profil')
    }
    
    console.log('🗺️ Villes avec produits:', cityCount)
    console.log('📊 Nombre de villes affichées:', Object.keys(cityCount).length)
    
    return cityCount
  }, [products, sellersMap])

  // Filtrer uniquement les villes qui ont des produits et des coordonnées
  const displayedCities = useMemo(() => {
    return Object.entries(citiesWithProducts)
      .map(([city, count]) => {
        const normalizedCity = normalizeCity(city)
        const coords = cityCoordinates[normalizedCity]
        if (!coords) return null
        
        return {
          name: city,
          count,
          x: coords.x,
          y: coords.y
        }
      })
      .filter(city => city !== null)
  }, [citiesWithProducts])

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <span className={styles.mapIcon}>🗺️</span>
            Carte des produits en France
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
              <p>Les produits disponibles ne sont pas encore associés à des villes françaises répertoriées sur la carte.</p>
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
                  <li>Villes supportées : Paris, Lyon, Marseille, Toulouse, Nice, Bordeaux, etc.</li>
                </ul>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '1rem' }}>
                Ouvrez la console (F12) pour voir les détails des villes non reconnues.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.mapContainer}>
                <svg
                  viewBox="0 0 600 700"
                  className={styles.franceSvg}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Contour simplifié de la France */}
                  <path
                    d="M 300 50 
                       L 500 100 
                       L 550 200 
                       L 520 350 
                       L 480 450 
                       L 450 550 
                       L 400 600 
                       L 300 620 
                       L 200 600 
                       L 150 550 
                       L 100 450 
                       L 80 350 
                       L 70 250 
                       L 100 150 
                       L 200 80 
                       Z"
                    className={styles.franceOutline}
                    fill="#f0f0f0"
                    stroke="#C0B4A5"
                    strokeWidth="3"
                  />

                  {/* Marqueurs des villes avec produits */}
                  {displayedCities.map((city) => {
                    // Taille du marqueur proportionnelle au nombre de produits
                    const baseSize = 8
                    const maxSize = 30
                    const size = Math.min(baseSize + Math.log(city.count) * 5, maxSize)
                    
                    return (
                      <g key={city.name} className={styles.cityMarker}>
                        {/* Cercle de fond */}
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r={size}
                          className={styles.markerCircle}
                          fill="#C0B4A5"
                          opacity="0.3"
                        />
                        {/* Cercle principal */}
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r={size * 0.6}
                          className={styles.markerDot}
                          fill="#C0B4A5"
                        />
                        {/* Compteur de produits */}
                        <text
                          x={city.x}
                          y={city.y + 4}
                          className={styles.markerCount}
                          textAnchor="middle"
                          fill="white"
                          fontSize={size * 0.5}
                          fontWeight="bold"
                        >
                          {city.count}
                        </text>
                        {/* Nom de la ville */}
                        <text
                          x={city.x}
                          y={city.y + size + 15}
                          className={styles.cityName}
                          textAnchor="middle"
                          fill="#2d2d2d"
                          fontSize="12"
                          fontWeight="500"
                        >
                          {city.name}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Légende */}
              <div className={styles.legend}>
                <h3 className={styles.legendTitle}>Légende</h3>
                <div className={styles.legendItems}>
                  <div className={styles.legendItem}>
                    <div className={styles.legendMarker} style={{ width: '12px', height: '12px' }}></div>
                    <span>Peu de produits</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.legendMarker} style={{ width: '20px', height: '20px' }}></div>
                    <span>Nombre moyen</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.legendMarker} style={{ width: '30px', height: '30px' }}></div>
                    <span>Beaucoup de produits</span>
                  </div>
                </div>
              </div>

              {/* Liste des villes */}
              <div className={styles.citiesList}>
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
    </div>
  )
}

export default FranceMapModal
