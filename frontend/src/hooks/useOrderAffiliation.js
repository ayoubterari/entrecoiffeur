import { useMutation } from 'convex/react'
import { api } from '../lib/convex'
import { useAffiliateTracking } from './useAffiliateTracking'

// Hook pour gérer l'affiliation lors des commandes
export const useOrderAffiliation = () => {
  const { getActiveAffiliateCode } = useAffiliateTracking()
  const processAffiliateEarning = useMutation(api.affiliateSystem.processAffiliateEarning)

  // Fonction à appeler après la création d'une commande
  const processOrderAffiliation = async (orderId) => {
    const affiliateCode = getActiveAffiliateCode()
    
    if (affiliateCode && orderId) {
      try {
        const result = await processAffiliateEarning({
          orderId,
          linkCode: affiliateCode
        })
        
        if (result.success) {
          console.log('Affiliation traitée avec succès:', result)
          return {
            success: true,
            pointsEarned: result.pointsEarned,
            affiliateId: result.affiliateId
          }
        }
      } catch (error) {
        console.error('Erreur lors du traitement de l\'affiliation:', error)
      }
    }
    
    return { success: false }
  }

  // Fonction pour obtenir les données d'affiliation à inclure dans la commande
  const getAffiliationData = () => {
    const affiliateCode = getActiveAffiliateCode()
    
    if (affiliateCode) {
      return {
        affiliateCode,
        // Vous pouvez ajouter d'autres données si nécessaire
      }
    }
    
    return null
  }

  return {
    processOrderAffiliation,
    getAffiliationData,
    hasActiveAffiliateCode: () => !!getActiveAffiliateCode()
  }
}
