import React from 'react'
import { 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Package,
  TrendingUp,
  Users
} from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card'
import { Badge } from '../ui/badge'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../ui/alert'

const PaymentModule = () => {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Méthode de Paiement</h2>
          <p className="text-muted-foreground">
            Paiement à la livraison (COD - Cash on Delivery)
          </p>
        </div>
        <Badge variant="default" className="gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Actif
        </Badge>
      </div>

      {/* Statut COD */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Paiement à la livraison activé</AlertTitle>
        <AlertDescription>
          Le système de paiement à la livraison (COD) est maintenant la méthode de paiement principale de la plateforme.
        </AlertDescription>
      </Alert>

      {/* Informations COD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Paiement à la livraison (COD)
          </CardTitle>
          <CardDescription>
            Les clients paient en espèces lors de la réception de leur commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-primary/20">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 text-2xl">
                  💵
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Paiement en espèces</h4>
                  <p className="text-sm text-muted-foreground">
                    Au moment de la livraison
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-2xl">
                  📦
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Livraison sécurisée</h4>
                  <p className="text-sm text-muted-foreground">
                    Suivi de commande
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 text-2xl">
                  ✅
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Sans risque</h4>
                  <p className="text-sm text-muted-foreground">
                    Aucun paiement en ligne
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Avantages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Avantages du COD
          </CardTitle>
          <CardDescription>
            Pourquoi le paiement à la livraison est avantageux
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Confiance des clients</h4>
              <p className="text-sm text-muted-foreground">
                Les clients peuvent vérifier leur commande avant de payer
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Pas de frais de transaction</h4>
              <p className="text-sm text-muted-foreground">
                Aucune commission PayPal ou frais bancaires
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Accessibilité</h4>
              <p className="text-sm text-muted-foreground">
                Accessible à tous, même sans carte bancaire
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Sécurité</h4>
              <p className="text-sm text-muted-foreground">
                Aucune donnée bancaire à fournir en ligne
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processus de commande */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Processus de commande COD
          </CardTitle>
          <CardDescription>
            Comment fonctionne une commande avec paiement à la livraison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                1
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">Commande passée</h4>
                <p className="text-sm text-muted-foreground">
                  Le client passe sa commande en ligne sans payer
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                2
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">Préparation</h4>
                <p className="text-sm text-muted-foreground">
                  Le vendeur prépare et expédie la commande
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                3
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">Livraison</h4>
                <p className="text-sm text-muted-foreground">
                  Le livreur apporte le colis au client
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                4
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">Paiement</h4>
                <p className="text-sm text-muted-foreground">
                  Le client paie en espèces au livreur
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                5
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">Confirmation</h4>
                <p className="text-sm text-muted-foreground">
                  La commande est marquée comme livrée et payée
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations pour les vendeurs */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <Users className="h-5 w-5" />
            Informations pour les vendeurs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-900 dark:text-amber-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Les commandes COD ont un statut "En attente" jusqu'à la livraison</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Le paiement est confirmé uniquement après la livraison</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Les commissions sont calculées sur le montant total de la commande</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Assurez-vous de bien emballer les produits pour éviter les retours</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentModule
