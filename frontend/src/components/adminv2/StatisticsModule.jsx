import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  ShoppingBag, 
  DollarSign,
  Package,
  Store,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Heart,
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

const StatisticsModule = () => {
  const [timeRange, setTimeRange] = useState('month') // day, week, month, year, all

  // Queries pour récupérer les statistiques
  const stats = useQuery(api.functions.queries.stats.getGlobalStats, { timeRange })
  const userStats = useQuery(api.functions.queries.stats.getUserStats, { timeRange })
  const orderStats = useQuery(api.functions.queries.stats.getOrderStats, { timeRange })
  const productStats = useQuery(api.functions.queries.stats.getProductStats, { timeRange })
  const revenueStats = useQuery(api.functions.queries.stats.getRevenueStats, { timeRange })
  const topProducts = useQuery(api.functions.queries.stats.getTopProducts, { limit: 5, timeRange })
  const topSellers = useQuery(api.functions.queries.stats.getTopSellers, { limit: 5, timeRange })

  // Fonction pour formater les nombres
  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Fonction pour formater la monnaie en EURO
  const formatCurrency = (amount) => {
    if (!amount) return '0.00 €'
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
  }

  // Fonction pour calculer le pourcentage de changement
  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  // Fonction pour obtenir la couleur du badge selon le changement
  const getTrendColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  // Fonction pour obtenir l'icône de tendance
  const getTrendIcon = (change) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4" />
    if (change < 0) return <ArrowDownRight className="h-4 w-4" />
    return null
  }

  const timeRanges = [
    { value: 'day', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'year', label: 'Cette année' },
    { value: 'all', label: 'Tout' }
  ]

  if (!stats || !userStats || !orderStats || !productStats || !revenueStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Tableau de bord statistiques
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble complète de votre plateforme
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenus totaux */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Revenus totaux (Commissions)</span>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(revenueStats?.totalRevenue)}
            </div>
            {revenueStats?.previousRevenue ? (
              <div className={`flex items-center gap-1 text-sm mt-1 ${getTrendColor(getPercentageChange(revenueStats.totalRevenue, revenueStats.previousRevenue))}`}>
                {getTrendIcon(getPercentageChange(revenueStats.totalRevenue, revenueStats.previousRevenue))}
                <span>{Math.abs(getPercentageChange(revenueStats.totalRevenue, revenueStats.previousRevenue))}%</span>
                <span className="text-muted-foreground">vs période précédente</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Commission 10% • Montant en €
              </p>
            )}
          </CardContent>
        </Card>

        {/* Commandes */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Commandes</span>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(orderStats?.totalOrders)}
            </div>
            {orderStats?.previousOrders && (
              <div className={`flex items-center gap-1 text-sm mt-1 ${getTrendColor(getPercentageChange(orderStats.totalOrders, orderStats.previousOrders))}`}>
                {getTrendIcon(getPercentageChange(orderStats.totalOrders, orderStats.previousOrders))}
                <span>{Math.abs(getPercentageChange(orderStats.totalOrders, orderStats.previousOrders))}%</span>
                <span className="text-muted-foreground">vs période précédente</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Utilisateurs */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Utilisateurs</span>
              <Users className="h-4 w-4 text-purple-600" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(userStats?.totalUsers)}
            </div>
            {userStats?.newUsers && (
              <div className="flex items-center gap-1 text-sm mt-1 text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span>{userStats.newUsers} nouveaux</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Produits */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Produits</span>
              <Package className="h-4 w-4 text-orange-600" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(productStats?.totalProducts)}
            </div>
            {productStats?.activeProducts && (
              <div className="text-sm mt-1 text-muted-foreground">
                {productStats.activeProducts} actifs
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des commandes par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Statut des commandes
            </CardTitle>
            <CardDescription>Répartition des commandes par statut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderStats?.byStatus && Object.entries(orderStats.byStatus).map(([status, count]) => {
              const statusConfig = {
                pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
                confirmed: { label: 'Confirmées', color: 'bg-blue-500', icon: CheckCircle },
                shipped: { label: 'Expédiées', color: 'bg-purple-500', icon: Package },
                delivered: { label: 'Livrées', color: 'bg-green-500', icon: CheckCircle },
                cancelled: { label: 'Annulées', color: 'bg-red-500', icon: XCircle }
              }
              const config = statusConfig[status] || { label: status, color: 'bg-gray-500', icon: AlertCircle }
              const Icon = config.icon
              const percentage = orderStats.totalOrders > 0 ? ((count / orderStats.totalOrders) * 100).toFixed(1) : 0

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{percentage}%</span>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Répartition des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Types d'utilisateurs
            </CardTitle>
            <CardDescription>Répartition par type de compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userStats?.byType && Object.entries(userStats.byType).map(([type, count]) => {
              const typeConfig = {
                particulier: { label: 'Particuliers', color: 'bg-blue-500', icon: '👤' },
                professionnel: { label: 'Professionnels', color: 'bg-purple-500', icon: '💼' },
                grossiste: { label: 'Grossistes', color: 'bg-orange-500', icon: '🏢' }
              }
              const config = typeConfig[type] || { label: type, color: 'bg-gray-500', icon: '👥' }
              const percentage = userStats.totalUsers > 0 ? ((count / userStats.totalUsers) * 100).toFixed(1) : 0

              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <span className="text-xl">{config.icon}</span>
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{percentage}%</span>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Top Produits et Vendeurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Produits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top 5 Produits
            </CardTitle>
            <CardDescription>Les produits les plus vendus</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sales} ventes • {formatCurrency(product.revenue)}
                      </p>
                    </div>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune donnée disponible
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Vendeurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Top 5 Vendeurs
            </CardTitle>
            <CardDescription>Les vendeurs les plus performants</CardDescription>
          </CardHeader>
          <CardContent>
            {topSellers && topSellers.length > 0 ? (
              <div className="space-y-4">
                {topSellers.map((seller, index) => (
                  <div key={seller._id} className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {seller.companyName || `${seller.firstName} ${seller.lastName}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {seller.totalOrders} commandes • {formatCurrency(seller.totalRevenue)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{seller.rating || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune donnée disponible
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction client détaillée */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Satisfaction client détaillée
            </CardTitle>
            <CardDescription>Analyse des avis et évaluations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.averageRating.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Note moyenne</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(stats.averageRating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.totalReviews}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total avis</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {stats.positiveReviews || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Avis positifs</p>
                <p className="text-xs text-green-600 mt-1">
                  ({stats.positiveRate ? stats.positiveRate.toFixed(0) : 0}%)
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.satisfactionRate.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Satisfaction</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Insight :</strong> {
                  stats.satisfactionRate >= 90 
                    ? "Excellente satisfaction client ! Continuez sur cette lancée." 
                    : stats.satisfactionRate >= 75
                    ? "Bonne satisfaction client. Identifiez les points d'amélioration."
                    : "Satisfaction à améliorer. Analysez les avis négatifs pour agir."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métriques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panier moyen */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Panier moyen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(orderStats?.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Par commande
            </p>
          </CardContent>
        </Card>

        {/* Taux de conversion */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Taux de conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Visiteurs → Acheteurs
            </p>
          </CardContent>
        </Card>

        {/* Taux de satisfaction */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Satisfaction client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats?.satisfactionRate ? `${stats.satisfactionRate.toFixed(1)}%` : 'N/A'}
              {stats?.satisfactionRate >= 90 && <span className="text-xl">🎉</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.averageRating ? (
                <>
                  ⭐ {stats.averageRating.toFixed(1)}/5 • {stats.totalReviews} avis
                </>
              ) : (
                'Aucun avis'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights et recommandations */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Insights et recommandations
          </CardTitle>
          <CardDescription>Analyses automatiques pour vous aider à prendre des décisions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Insights dynamiques basés sur les données */}
            {revenueStats?.totalRevenue > 0 && orderStats?.totalOrders > 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Croissance positive
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Votre plateforme génère {formatCurrency(revenueStats.totalRevenue)} avec {orderStats.totalOrders} commandes. 
                    Continuez sur cette lancée !
                  </p>
                </div>
              </div>
            )}

            {userStats?.newUsers > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Nouveaux utilisateurs
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {userStats.newUsers} nouveaux utilisateurs ont rejoint la plateforme. 
                    Pensez à leur envoyer un email de bienvenue !
                  </p>
                </div>
              </div>
            )}

            {orderStats?.byStatus?.pending > 5 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Commandes en attente
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {orderStats.byStatus.pending} commandes sont en attente de traitement. 
                    Traitez-les rapidement pour améliorer la satisfaction client.
                  </p>
                </div>
              </div>
            )}

            {productStats?.inactiveProducts > 0 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Package className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Produits inactifs
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    {productStats.inactiveProducts} produits sont inactifs. 
                    Vérifiez s'ils doivent être réactivés ou supprimés.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StatisticsModule
