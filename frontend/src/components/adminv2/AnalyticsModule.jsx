import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Activity, Clock, Users, Eye, TrendingUp, Package, FileText, ChevronDown, ChevronUp } from 'lucide-react'

const AnalyticsModule = () => {
  const [dateRange, setDateRange] = useState('7days') // 7days, 30days, all
  const [selectedTab, setSelectedTab] = useState('overview') // overview, products, users, pages
  const [expandedUserId, setExpandedUserId] = useState(null) // Pour afficher les détails d'un utilisateur

  // Calculer les dates de début et fin selon le range
  const getDateRange = () => {
    const now = Date.now()
    switch (dateRange) {
      case '7days':
        return { startDate: now - (7 * 24 * 60 * 60 * 1000), endDate: now }
      case '30days':
        return { startDate: now - (30 * 24 * 60 * 60 * 1000), endDate: now }
      case 'all':
      default:
        return {}
    }
  }

  const { startDate, endDate } = getDateRange()

  // Queries - Ne passer les dates que si elles sont définies
  const statsArgs = {}
  if (startDate) statsArgs.startDate = startDate
  if (endDate) statsArgs.endDate = endDate

  const stats = useQuery(api.functions.queries.activityTracking.getActivityStats, statsArgs)
  
  const topProductsArgs = { limit: 10 }
  if (startDate) topProductsArgs.startDate = startDate
  if (endDate) topProductsArgs.endDate = endDate
  const topProducts = useQuery(api.functions.queries.activityTracking.getTopViewedProducts, topProductsArgs)
  
  const topPagesArgs = { limit: 10 }
  if (startDate) topPagesArgs.startDate = startDate
  if (endDate) topPagesArgs.endDate = endDate
  const topPages = useQuery(api.functions.queries.activityTracking.getTopPages, topPagesArgs)
  
  const topUsersArgs = { limit: 10 }
  if (startDate) topUsersArgs.startDate = startDate
  if (endDate) topUsersArgs.endDate = endDate
  const topUsers = useQuery(api.functions.queries.activityTracking.getTopActiveUsers, topUsersArgs)
  
  const realtimeActivity = useQuery(api.functions.queries.activityTracking.getRealtimeActivity)
  
  // Query de debug pour voir les activités brutes
  const allActivitiesDebug = useQuery(api.functions.queries.activityTracking.getAllActivitiesDebug, { limit: 20 })
  
  // Query pour obtenir les détails d'un utilisateur spécifique
  const userActivity = useQuery(
    api.functions.queries.activityTracking.getUserActivity,
    expandedUserId ? { userId: expandedUserId, limit: 50 } : "skip"
  )

  // Debug - Afficher UNE SEULE FOIS au chargement
  React.useEffect(() => {
    if (allActivitiesDebug) {
      console.log('📊 Analytics Debug:', {
        stats,
        topProducts,
        topPages,
        topUsers,
        realtimeActivity,
        allActivitiesDebug,
        dateRange,
        startDate,
        endDate
      })
      
      if (allActivitiesDebug.length > 0) {
        console.log('🔍 Activités brutes:', allActivitiesDebug)
        console.log('🔍 Activités product_view:', allActivitiesDebug.filter(a => a.activityType === 'product_view'))
        console.log('🔍 Activités avec resourceId:', allActivitiesDebug.filter(a => a.resourceId))
      }
    }
  }, [allActivitiesDebug?.length])

  // Formater le temps en format lisible
  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`
    return `${Math.round(seconds / 3600)}h`
  }

  // Formater les nombres
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Vérifier si des données existent
  const hasData = stats && stats.totalActivities > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Analytics & Traçabilité
          </h1>
          <p className="text-muted-foreground mt-1">
            Analysez le comportement des utilisateurs sur votre plateforme
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex gap-2">
          <Button
            variant={dateRange === '7days' ? 'default' : 'outline'}
            onClick={() => setDateRange('7days')}
            size="sm"
          >
            7 jours
          </Button>
          <Button
            variant={dateRange === '30days' ? 'default' : 'outline'}
            onClick={() => setDateRange('30days')}
            size="sm"
          >
            30 jours
          </Button>
          <Button
            variant={dateRange === 'all' ? 'default' : 'outline'}
            onClick={() => setDateRange('all')}
            size="sm"
          >
            Tout
          </Button>
        </div>
      </div>

      {/* Message si pas de données */}
      {!hasData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Aucune donnée de tracking disponible
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Le système de tracking est actif, mais aucune activité n'a encore été enregistrée. 
                  Les données apparaîtront automatiquement lorsque les utilisateurs navigueront sur le site.
                </p>
                <div className="space-y-2 text-sm text-blue-600">
                  <p>✓ Le hook <code className="bg-blue-100 px-1 rounded">useActivityTracking</code> est intégré dans ProductDetail.jsx</p>
                  <p>✓ Les données seront collectées automatiquement lors des visites</p>
                  <p>✓ Consultez la console du navigateur pour voir les logs de debug</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activités</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalActivities || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actions enregistrées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Total</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(stats?.totalTimeSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Temps passé sur la plateforme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Uniques</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.uniqueUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Utilisateurs actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatTime(stats?.averageTimeSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Par activité
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b">
        <Button
          variant={selectedTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('overview')}
        >
          <Activity className="h-4 w-4 mr-2" />
          Vue d'ensemble
        </Button>
        <Button
          variant={selectedTab === 'products' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('products')}
        >
          <Package className="h-4 w-4 mr-2" />
          Produits
        </Button>
        <Button
          variant={selectedTab === 'users' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('users')}
        >
          <Users className="h-4 w-4 mr-2" />
          Utilisateurs
        </Button>
        <Button
          variant={selectedTab === 'pages' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('pages')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Pages
        </Button>
      </div>

      {/* Contenu selon l'onglet */}
      {selectedTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Activité par type */}
          <Card>
            <CardHeader>
              <CardTitle>Activité par Type</CardTitle>
              <CardDescription>Répartition des actions utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.byActivityType && Object.entries(stats.byActivityType).map(([type, data]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">
                        {type.replace('_', ' ')}
                      </span>
                      <span className="text-muted-foreground">
                        {data.count} ({formatTime(data.totalTime)})
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(data.count / stats.totalActivities) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appareils */}
          <Card>
            <CardHeader>
              <CardTitle>Appareils Utilisés</CardTitle>
              <CardDescription>Répartition par type d'appareil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.byDevice && Object.entries(stats.byDevice).map(([device, count]) => (
                  <div key={device} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{device}</span>
                      <span className="text-muted-foreground">
                        {count} ({((count / stats.totalActivities) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${(count / stats.totalActivities) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activité en temps réel */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Activité en Temps Réel (24h)</CardTitle>
              <CardDescription>
                {realtimeActivity?.totalLast24h || 0} activités dans les dernières 24h
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {realtimeActivity?.recentActivities?.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm font-medium">
                          {activity.resourceName || activity.activityType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(activity.timeSpent)} - {activity.deviceType || 'unknown'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'products' && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Produits les Plus Consultés</CardTitle>
            <CardDescription>Produits avec le plus de vues et de temps passé</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium">#</th>
                    <th className="text-left p-4 font-medium">Produit</th>
                    <th className="text-right p-4 font-medium">Vues</th>
                    <th className="text-right p-4 font-medium">Utilisateurs Uniques</th>
                    <th className="text-right p-4 font-medium">Temps Total</th>
                    <th className="text-right p-4 font-medium">Temps Moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts && topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <tr key={product.productId} className="border-t hover:bg-muted/50">
                        <td className="p-4 font-medium">{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{product.productName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">{product.viewCount}</td>
                        <td className="p-4 text-right">{product.uniqueUsers}</td>
                        <td className="p-4 text-right">{formatTime(product.totalTimeSpent)}</td>
                        <td className="p-4 text-right font-medium text-primary">
                          {formatTime(product.averageTimeSpent)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-muted-foreground">
                        Aucune donnée disponible pour cette période
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Utilisateurs les Plus Actifs</CardTitle>
            <CardDescription>Utilisateurs avec le plus d'activité sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium">#</th>
                    <th className="text-left p-4 font-medium">Utilisateur</th>
                    <th className="text-right p-4 font-medium">Activités</th>
                    <th className="text-right p-4 font-medium">Temps Total</th>
                    <th className="text-right p-4 font-medium">Temps Moyen</th>
                    <th className="text-right p-4 font-medium">Dernière Activité</th>
                    <th className="text-center p-4 font-medium">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers && topUsers.length > 0 ? (
                    topUsers.map((user, index) => (
                      <React.Fragment key={user.userId}>
                        <tr className="border-t hover:bg-muted/50">
                          <td className="p-4 font-medium">{index + 1}</td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{user.userName}</p>
                              <p className="text-xs text-muted-foreground">{user.userEmail}</p>
                            </div>
                          </td>
                          <td className="p-4 text-right">{user.activityCount}</td>
                          <td className="p-4 text-right">{formatTime(user.totalTimeSpent)}</td>
                          <td className="p-4 text-right font-medium text-primary">
                            {formatTime(user.averageTimeSpent)}
                          </td>
                          <td className="p-4 text-right text-sm text-muted-foreground">
                            {new Date(user.lastActivity).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="p-4 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedUserId(expandedUserId === user.userId ? null : user.userId)}
                            >
                              {expandedUserId === user.userId ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                        {expandedUserId === user.userId && userActivity && (
                          <tr className="bg-muted/30">
                            <td colSpan="7" className="p-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm mb-3">Produits Visités</h4>
                                {userActivity.filter(a => a.activityType === 'product_view').length > 0 ? (
                                  <div className="grid gap-2">
                                    {userActivity
                                      .filter(a => a.activityType === 'product_view')
                                      .map((activity, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                          <div className="flex items-center gap-3">
                                            <Package className="h-4 w-4 text-primary" />
                                            <div>
                                              <p className="font-medium text-sm">{activity.resourceName || 'Produit inconnu'}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {new Date(activity.createdAt).toLocaleString('fr-FR')}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm font-medium text-primary">
                                              {formatTime(activity.timeSpent)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {activity.deviceType || 'unknown'}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Aucun produit visité</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-muted-foreground">
                        Aucune donnée disponible pour cette période
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'pages' && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Pages les Plus Visitées</CardTitle>
            <CardDescription>Pages avec le plus de trafic et de temps passé</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium">#</th>
                    <th className="text-left p-4 font-medium">URL</th>
                    <th className="text-right p-4 font-medium">Visites</th>
                    <th className="text-right p-4 font-medium">Utilisateurs Uniques</th>
                    <th className="text-right p-4 font-medium">Temps Total</th>
                    <th className="text-right p-4 font-medium">Temps Moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages && topPages.length > 0 ? (
                    topPages.map((page, index) => (
                      <tr key={page.pageUrl} className="border-t hover:bg-muted/50">
                        <td className="p-4 font-medium">{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm truncate max-w-md">
                              {page.pageUrl}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">{page.viewCount}</td>
                        <td className="p-4 text-right">{page.uniqueUsers}</td>
                        <td className="p-4 text-right">{formatTime(page.totalTimeSpent)}</td>
                        <td className="p-4 text-right font-medium text-primary">
                          {formatTime(page.averageTimeSpent)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-muted-foreground">
                        Aucune donnée disponible pour cette période
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AnalyticsModule
