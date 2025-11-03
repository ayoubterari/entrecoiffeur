import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'

/**
 * Composant temporaire pour ajouter des villes aux vendeurs
 * À utiliser une seule fois puis supprimer
 */
const UpdateSellerCities = () => {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const addDefaultCities = useMutation(api.updateSellerCities.addDefaultCitiesToSellers)

  const handleUpdate = async () => {
    if (!window.confirm('Voulez-vous ajouter "Paris" comme ville par défaut à tous les vendeurs sans ville ?')) {
      return
    }

    setIsLoading(true)
    try {
      const res = await addDefaultCities()
      setResult(res)
      console.log('✅ Mise à jour des villes terminée:', res)
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error)
      setResult({ success: false, message: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>
        🏙️ Ajouter des villes aux vendeurs
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 15px 0' }}>
        Cette action va ajouter "Paris" comme ville par défaut à tous les vendeurs qui n'ont pas encore de ville.
      </p>
      
      <button
        onClick={handleUpdate}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '10px',
          background: isLoading ? '#ccc' : '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}
      >
        {isLoading ? 'Mise à jour en cours...' : 'Ajouter Paris aux vendeurs'}
      </button>

      {result && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: result.success ? '#d4edda' : '#f8d7da',
          color: result.success ? '#155724' : '#721c24',
          borderRadius: '6px',
          fontSize: '0.85rem'
        }}>
          <strong>{result.success ? '✅ Succès' : '❌ Erreur'}</strong>
          <p style={{ margin: '5px 0 0 0' }}>{result.message}</p>
          {result.success && (
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
              <li>Total vendeurs: {result.totalSellers}</li>
              <li>Mis à jour: {result.updatedCount}</li>
              <li>Ville ajoutée: {result.defaultCity}</li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default UpdateSellerCities
