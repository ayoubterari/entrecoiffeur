import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  DollarSign, 
  Search, 
  Filter, 
  Eye,
  TrendingUp,
  Percent,
  Calculator,
  ShoppingCart,
  User,
  Store,
  Calendar
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'

const CommissionsModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [showCommissionDetails, setShowCommissionDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Convex queries
  const allOrders = useQuery(api.orders.getAllOrders)
  
  // Taux de commission fixe à 10%
  const COMMISSION_RATE = 10

  // Calculer le total des commandes
  const calculateOrderTotal = (order) => {
    if (Array.isArray(order)) {
      return order.reduce((total, item) => total + (item.price * item.quantity), 0) || 0
    }
    if (order && typeof order === 'object') {
      return order.total || (order.productPrice * order.quantity) || 0
    }
    return 0
  }

  // Calculer la commission pour une commande
  const calculateCommission = (orderTotal) => {
    return (orderTotal * COMMISSION_RATE) / 100
  }

  // Filtrer les commandes par période
  const getFilteredOrders = () => {
    if (!allOrders) return []
    
    let filtered = allOrders.filter(order => {
      const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.sellerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })

    // Filtrer par période
    if (filterPeriod !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filterPeriod) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate)
    }

    return filtered
  }

  const filteredOrders = getFilteredOrders()

  // Calculer les statistiques des commissions
  const commissionStats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((total, order) => total + calculateOrderTotal(order), 0),
    totalCommissions: filteredOrders.reduce((total, order) => total + calculateCommission(calculateOrderTotal(order)), 0),
    averageCommission: filteredOrders.length > 0 ? 
      filteredOrders.reduce((total, order) => total + calculateCommission(calculateOrderTotal(order)), 0) / filteredOrders.length : 0
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const viewCommissionDetails = (order) => {
    setSelectedOrder(order)
    setShowCommissionDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Commissions</h2>
          <p className="text-muted-foreground">
            Gérez les commissions de la plateforme (Taux fixe : {COMMISSION_RATE}%)
          </p>
        </div>
      </div>

      {/* Configuration des commissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Configuration des Commissions
          </CardTitle>
          <CardDescription>
            Paramètres actuels du système de commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Taux de commission</Label>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{COMMISSION_RATE}%</span>
                <Badge variant="secondary">Taux fixe</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Appliqué à toutes les commandes
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Statut</Label>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">Actif</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Système de commissions opérationnel
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Dernière mise à jour</Label>
              <p className="font-medium">{new Date().toLocaleDateString('fr-FR')}</p>
              <p className="text-xs text-muted-foreground">
                Configuration actuelle
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commissionStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">commandes traitées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(commissionStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">total des ventes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(commissionStats.totalCommissions)}
            </div>
            <p className="text-xs text-muted-foreground">revenus plateforme</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission moyenne</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(commissionStats.averageCommission)}</div>
            <p className="text-xs text-muted-foreground">par commande</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des commissions</CardTitle>
          <CardDescription>
            Recherchez et filtrez les commissions par période
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro, client, vendeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          {filteredOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Montant HT</TableHead>
                    <TableHead>Commission ({COMMISSION_RATE}%)</TableHead>
                    <TableHead>Net Vendeur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const orderTotal = calculateOrderTotal(order)
                    const commission = calculateCommission(orderTotal)
                    const netAmount = orderTotal - commission
                    
                    return (
                      <TableRow key={order._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">#{order.orderNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {order._id.slice(-8)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{order.buyerEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{order.sellerEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatPrice(orderTotal)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500">
                            {formatPrice(commission)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatPrice(netAmount)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewCommissionDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucune commission trouvée</h3>
              <p className="text-sm text-muted-foreground">
                Aucune commande ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal des détails de commission */}
      <Dialog open={showCommissionDetails} onOpenChange={setShowCommissionDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la commission - Commande #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Calcul détaillé de la commission et répartition financière
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Calcul de la commission */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calcul de la commission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Montant de la commande</span>
                    <span className="font-medium">{formatPrice(calculateOrderTotal(selectedOrder))}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Taux de commission</span>
                    <Badge variant="secondary">{COMMISSION_RATE}%</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b bg-green-50 dark:bg-green-950 px-3 rounded">
                    <span className="font-medium">Commission prélevée</span>
                    <span className="font-bold text-green-600">
                      {formatPrice(calculateCommission(calculateOrderTotal(selectedOrder)))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-blue-50 dark:bg-blue-950 px-3 rounded">
                    <span className="font-medium">Montant net vendeur</span>
                    <span className="font-bold text-blue-600">
                      {formatPrice(calculateOrderTotal(selectedOrder) - calculateCommission(calculateOrderTotal(selectedOrder)))}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Informations de la commande */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations de la commande</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Numéro</Label>
                      <p className="font-medium">#{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date</Label>
                      <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Client
                      </Label>
                      <p className="font-medium">{selectedOrder.buyerEmail}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        Vendeur
                      </Label>
                      <p className="font-medium">{selectedOrder.sellerEmail}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Produit</Label>
                      <p className="font-medium">{selectedOrder.productName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Quantité</Label>
                      <p className="font-medium">{selectedOrder.quantity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Répartition financière */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Répartition financière
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                    <span className="flex items-center gap-2">
                      💳 Total payé par le client
                    </span>
                    <span className="font-bold text-lg">
                      {formatPrice(calculateOrderTotal(selectedOrder))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
                    <span className="flex items-center gap-2">
                      🏢 Commission plateforme ({COMMISSION_RATE}%)
                    </span>
                    <span className="font-bold text-green-600">
                      - {formatPrice(calculateCommission(calculateOrderTotal(selectedOrder)))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <span className="flex items-center gap-2">
                      👤 Montant versé au vendeur
                    </span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatPrice(calculateOrderTotal(selectedOrder) - calculateCommission(calculateOrderTotal(selectedOrder)))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommissionDetails(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CommissionsModule
