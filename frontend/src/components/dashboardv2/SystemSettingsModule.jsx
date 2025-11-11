import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Settings, Save, RefreshCw, AlertCircle, CheckCircle2, Package, Users } from 'lucide-react'

const SystemSettingsModule = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [limits, setLimits] = useState({
    professionnel: 2,
    grossiste: -1
  })

  // Get current product limits
  const productLimits = useQuery(api.functions.queries.systemSettings.getProductLimits)
  
  // Mutation to update limits
  const updateProductLimits = useMutation(api.functions.mutations.systemSettings.updateProductLimits)

  // Update local state when data is loaded
  useEffect(() => {
    if (productLimits) {
      setLimits(productLimits)
    }
  }, [productLimits])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (!userId) {
      setMessage({
        type: 'error',
        text: 'Erreur : ID utilisateur manquant'
      })
      setIsLoading(false)
      return
    }

    try {
      const result = await updateProductLimits({
        userId,
        professionnel: parseInt(limits.professionnel),
        grossiste: parseInt(limits.grossiste)
      })

      setMessage({
        type: 'success',
        text: result.message || 'Limites mises à jour avec succès !'
      })

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      console.error('Error updating limits:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Erreur lors de la mise à jour des limites'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (productLimits) {
      setLimits(productLimits)
      setMessage({
        type: 'info',
        text: 'Valeurs réinitialisées'
      })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const getLimitLabel = (value) => {
    if (value === -1) return 'Illimité'
    if (value === 0) return 'Aucun'
    if (value === 1) return '1 produit'
    return `${value} produits`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Paramètres Système
        </h2>
        <p className="text-muted-foreground mt-2">
          Configurez les paramètres globaux de la plateforme
        </p>
      </div>

      {/* Product Limits Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Limites d'Ajout de Produits
              </CardTitle>
              <CardDescription className="mt-2">
                Définissez le nombre maximum de produits que chaque type d'utilisateur peut ajouter.
                Utilisez <strong>-1</strong> pour autoriser un nombre illimité.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Limits Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Professionnels</span>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {getLimitLabel(productLimits?.professionnel || 2)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Grossistes</span>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {getLimitLabel(productLimits?.grossiste || -1)}
                </Badge>
              </div>
            </div>

            {/* Professional Limit Input */}
            <div className="space-y-2">
              <Label htmlFor="professionnel" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Limite pour les Professionnels
              </Label>
              <div className="flex gap-2">
                <Input
                  id="professionnel"
                  type="number"
                  value={limits.professionnel}
                  onChange={(e) => setLimits({ ...limits, professionnel: e.target.value })}
                  min="-1"
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLimits({ ...limits, professionnel: -1 })}
                >
                  Illimité
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Nombre maximum de produits qu'un professionnel peut ajouter (-1 = illimité)
              </p>
            </div>

            {/* Wholesaler Limit Input */}
            <div className="space-y-2">
              <Label htmlFor="grossiste" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Limite pour les Grossistes
              </Label>
              <div className="flex gap-2">
                <Input
                  id="grossiste"
                  type="number"
                  value={limits.grossiste}
                  onChange={(e) => setLimits({ ...limits, grossiste: e.target.value })}
                  min="-1"
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLimits({ ...limits, grossiste: -1 })}
                >
                  Illimité
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Nombre maximum de produits qu'un grossiste peut ajouter (-1 = illimité)
              </p>
            </div>

            {/* Message */}
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
                {message.type === 'info' && <RefreshCw className="h-4 w-4" />}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Informations Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• Les modifications prennent effet immédiatement pour tous les utilisateurs</p>
          <p>• Une valeur de <strong>-1</strong> signifie "illimité" (aucune restriction)</p>
          <p>• Une valeur de <strong>0</strong> empêche complètement l'ajout de produits</p>
          <p>• Les produits déjà existants ne sont pas affectés par ces limites</p>
          <p>• Les particuliers ne peuvent jamais ajouter de produits (restriction système)</p>
        </CardContent>
      </Card>

      {/* Examples Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exemples de Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Badge variant="outline">Exemple 1</Badge>
              <div>
                <p className="font-medium">Configuration Standard</p>
                <p className="text-muted-foreground">Professionnels: 2 produits | Grossistes: Illimité</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Idéal pour limiter les professionnels tout en donnant une liberté totale aux grossistes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Badge variant="outline">Exemple 2</Badge>
              <div>
                <p className="font-medium">Configuration Restrictive</p>
                <p className="text-muted-foreground">Professionnels: 5 produits | Grossistes: 50 produits</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Utile pour contrôler la croissance du catalogue produits
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Badge variant="outline">Exemple 3</Badge>
              <div>
                <p className="font-medium">Configuration Ouverte</p>
                <p className="text-muted-foreground">Professionnels: Illimité | Grossistes: Illimité</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aucune restriction, tous les vendeurs peuvent ajouter autant de produits qu'ils le souhaitent
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SystemSettingsModule
