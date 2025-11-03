import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'

/**
 * Composant temporaire pour mettre à jour les locations des produits
 * À utiliser une seule fois puis supprimer
 */
const UpdateProductLocations = () => {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const updateLocations = useMutation(api.updateProductLocations.updateProductLocations)

  const handleUpdate = async () => {
    if (!window.confirm('Voulez-vous vraiment mettre à jour les locations de tous les produits ?')) {
      return
    }

    setIsLoading(true)
    try {
      const res = await updateLocations()
      setResult(res)
      console.log('✅ Mise à jour terminée:', res)
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
      right: '20px',
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>
        🔧 Migration des locations
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 15px 0' }}>
        Cette action va mettre à jour tous les produits sans location avec la ville de leur vendeur.
      </p>
      
      <button
        onClick={handleUpdate}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '10px',
          background: isLoading ? '#ccc' : '#C0B4A5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}
      >
        {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour les locations'}
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
              <li>Total: {result.totalProducts} produits</li>
              <li>Mis à jour: {result.updatedCount}</li>
              <li>Ignorés: {result.skippedCount}</li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default UpdateProductLocations
