import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  CreditCard, 
  Key,
  Globe,
  Save,
  TestTube,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../ui/alert'

const PaymentModule = () => {
  const [environment, setEnvironment] = useState('sandbox')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Queries et mutations
  const paypalConfig = useQuery(api.payments.getPayPalConfig)
  const updateConfig = useMutation(api.payments.updatePayPalConfig)
  const testConnection = useMutation(api.payments.testPayPalConnection)

  // Charger la configuration existante
  useEffect(() => {
    if (paypalConfig) {
      setEnvironment(paypalConfig.environment || 'sandbox')
      setClientId(paypalConfig.clientId || '')
      setClientSecret(paypalConfig.clientSecret || '')
      setWebhookUrl(paypalConfig.webhookUrl || '')
    }
  }, [paypalConfig])

  const handleSaveConfig = async () => {
    if (!clientId.trim()) {
      return
    }
    if (!clientSecret.trim()) {
      return
    }

    setIsSaving(true)
    try {
      await updateConfig({
        environment,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        webhookUrl: webhookUrl.trim(),
        isActive: true
      })
      
      setTestResult(null)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      return
    }

    setIsTestingConnection(true)
    try {
      const result = await testConnection({
        environment,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim()
      })
      
      setTestResult(result)
    } catch (error) {
      console.error('Erreur lors du test:', error)
      setTestResult({
        success: false,
        message: 'Erreur lors du test de connexion'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuration Paiement</h2>
          <p className="text-muted-foreground">
            Gérez les paramètres de paiement PayPal pour votre plateforme
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={paypalConfig?.isActive ? 'default' : 'secondary'} className="gap-1">
            <div className={`h-2 w-2 rounded-full ${paypalConfig?.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {paypalConfig?.isActive ? 'Actif' : 'Inactif'}
          </Badge>
          <Badge variant={environment === 'sandbox' ? 'outline' : 'default'}>
            {environment === 'sandbox' ? '🧪 Test' : '🚀 Production'}
          </Badge>
        </div>
      </div>

      {/* Environnement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Environnement
          </CardTitle>
          <CardDescription>
            Choisissez l'environnement PayPal à utiliser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card 
              className={`cursor-pointer transition-all ${environment === 'sandbox' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setEnvironment('sandbox')}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950 text-2xl">
                  🧪
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Sandbox (Test)</h4>
                    {environment === 'sandbox' && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Environnement de test pour le développement
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${environment === 'live' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setEnvironment('live')}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 text-2xl">
                  🚀
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Live (Production)</h4>
                    {environment === 'live' && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Environnement de production pour les vrais paiements
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Identifiants PayPal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Identifiants PayPal
          </CardTitle>
          <CardDescription>
            Configurez vos identifiants d'application PayPal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID *</Label>
            <Input
              id="clientId"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Votre PayPal Client ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret *</Label>
            <div className="relative">
              <Input
                id="clientSecret"
                type={showSecret ? 'text' : 'password'}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Votre PayPal Client Secret"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL (Optionnel)</Label>
            <Input
              id="webhookUrl"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://votre-domaine.com/webhook/paypal"
            />
            <p className="text-xs text-muted-foreground">
              URL pour recevoir les notifications PayPal (IPN)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Actions
          </CardTitle>
          <CardDescription>
            Sauvegardez et testez votre configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTestingConnection || !paypalConfig?.isActive}
              className="flex-1"
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Tester la connexion
                </>
              )}
            </Button>
          </div>

          {/* Résultat du test */}
          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {testResult.success ? 'Test réussi !' : 'Test échoué'}
              </AlertTitle>
              <AlertDescription>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Guide d'aide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Guide d'aide
          </CardTitle>
          <CardDescription>
            Comment obtenir vos identifiants PayPal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                1
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">Créer une application PayPal</h4>
                <p className="text-sm text-muted-foreground">
                  Rendez-vous sur{' '}
                  <a 
                    href="https://developer.paypal.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    developer.paypal.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                2
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">Obtenir les identifiants</h4>
                <p className="text-sm text-muted-foreground">
                  Copiez le Client ID et Client Secret de votre application
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                3
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">Configurer les webhooks</h4>
                <p className="text-sm text-muted-foreground">
                  Ajoutez l'URL de webhook pour recevoir les notifications
                </p>
              </div>
            </div>
          </div>

          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Utilisez toujours l'environnement Sandbox pour les tests. Ne passez en Live qu'après validation complète.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Informations supplémentaires */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <CreditCard className="h-5 w-5" />
            Informations sur PayPal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-900 dark:text-blue-100">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>PayPal est le système de paiement principal de la plateforme</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Les paiements sont sécurisés et traités directement par PayPal</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Les commissions sont automatiquement calculées lors de chaque transaction</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Testez toujours en Sandbox avant de passer en production</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentModule
