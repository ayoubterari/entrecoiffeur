import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

const DashboardContent = ({ stats }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats.users.total,
      description: `${stats.users.particuliers} particuliers, ${stats.users.professionnels} pros`,
      icon: Users,
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Produits',
      value: stats.products.total,
      description: `${stats.products.featured} en vedette, ${stats.products.lowStock} en rupture`,
      icon: Package,
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Commandes',
      value: stats.orders.total,
      description: `${stats.orders.pending} en attente`,
      icon: ShoppingCart,
      trend: '+23%',
      trendUp: true
    },
    {
      title: 'Chiffre d\'affaires',
      value: formatPrice(stats.orders.revenue),
      description: 'Total des ventes',
      icon: DollarSign,
      trend: '+18%',
      trendUp: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre plateforme EntreCoiffeur
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-3 w-3 mr-1 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs font-medium ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alerts Section */}
      {(stats.orders.pending > 0 || stats.support.open > 0 || stats.products.lowStock > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Alertes & Actions requises</CardTitle>
            <CardDescription>
              Points nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.orders.pending > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900">
                      {stats.orders.pending} commande(s) en attente
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Ces commandes nécessitent une confirmation
                    </p>
                  </div>
                </div>
              )}
              
              {stats.support.open > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      {stats.support.open} ticket(s) de support ouverts
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Réponses clients en attente
                    </p>
                  </div>
                </div>
              )}
              
              {stats.products.lowStock > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      {stats.products.lowStock} produit(s) en rupture de stock
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Réapprovisionnement nécessaire
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières actions sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouvelle commande</p>
                  <p className="text-xs text-muted-foreground">Il y a 5 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouvel utilisateur inscrit</p>
                  <p className="text-xs text-muted-foreground">Il y a 15 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Produit mis à jour</p>
                  <p className="text-xs text-muted-foreground">Il y a 1 heure</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques Support</CardTitle>
            <CardDescription>
              État des tickets de support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-bold">{stats.support.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ouverts</span>
                <span className="text-sm font-medium text-orange-600">{stats.support.open}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">En cours</span>
                <span className="text-sm font-medium text-blue-600">{stats.support.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Résolus</span>
                <span className="text-sm font-medium text-green-600">{stats.support.resolved}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardContent
