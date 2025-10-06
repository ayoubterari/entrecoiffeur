import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'

const MockDataInitializer = () => {
  const [isInitializing, setIsInitializing] = useState(false)
  const [message, setMessage] = useState('')
  
  const initializeCategories = useMutation(api.products.initializeMockCategories)
  const createSampleProducts = useMutation(api.products.createSampleProducts)
  const clearAllData = useMutation(api.products.clearAllData)
  const createAdminUser = useMutation(api.auth.createAdminUser)

  const handleInitializeCategories = async () => {
    setIsInitializing(true)
    setMessage('')
    
    try {
      const result = await initializeCategories()
      setMessage(`✅ ${result.message} (${result.count} catégories)`)
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleCreateSampleProducts = async () => {
    setIsInitializing(true)
    setMessage('')
    
    try {
      const result = await createSampleProducts()
      setMessage(`✅ ${result.message} (${result.count} produits)`)
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleInitializeAll = async () => {
    setIsInitializing(true)
    setMessage('Initialisation en cours...')
    
    try {
      // First initialize categories
      const categoriesResult = await initializeCategories()
      
      // Then create sample products
      const productsResult = await createSampleProducts()
      
      setMessage(`✅ Données initialisées avec succès! 
        ${categoriesResult.count} catégories et ${productsResult.count} produits créés.`)
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer toutes les données ?')) {
      return
    }
    
    setIsInitializing(true)
    setMessage('')
    
    try {
      const result = await clearAllData()
      setMessage(`✅ ${result.message} 
        (${result.deletedProducts} produits et ${result.deletedCategories} catégories supprimés)`)
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleCreateAdminUser = async () => {
    setIsInitializing(true)
    setMessage('')
    
    try {
      const result = await createAdminUser()
      setMessage(`✅ ${result.message}
        Email: ${result.email}
        Mot de passe: ${result.password}`)
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`)
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="mock-data-initializer">
      <h3>🛠️ Outils de développement</h3>
      <p>Initialisez des données de démonstration pour tester le marketplace</p>
      
      <div className="initializer-buttons">
        <button 
          className="init-btn categories-btn"
          onClick={handleInitializeCategories}
          disabled={isInitializing}
        >
          {isInitializing ? 'Chargement...' : 'Créer les catégories'}
        </button>
        
        <button 
          className="init-btn products-btn"
          onClick={handleCreateSampleProducts}
          disabled={isInitializing}
        >
          {isInitializing ? 'Chargement...' : 'Créer les produits'}
        </button>

        <button 
          className="init-btn admin-btn"
          onClick={handleCreateAdminUser}
          disabled={isInitializing}
        >
          {isInitializing ? 'Chargement...' : '👑 Créer Admin'}
        </button>
        
        <button 
          className="init-btn all-btn"
          onClick={handleInitializeAll}
          disabled={isInitializing}
        >
          {isInitializing ? 'Chargement...' : '🚀 Tout initialiser'}
        </button>
        
        <button 
          className="init-btn clear-btn"
          onClick={handleClearAll}
          disabled={isInitializing}
        >
          {isInitializing ? 'Chargement...' : '🗑️ Tout supprimer'}
        </button>
      </div>
      
      {message && (
        <div className="init-message">
          {message}
        </div>
      )}
    </div>
  )
}

export default MockDataInitializer
