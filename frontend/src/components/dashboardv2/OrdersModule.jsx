import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Search, X, ShoppingBag, TrendingUp, Clock, CheckCircle } from 'lucide-react'

const OrdersModule = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Get seller orders and stats
  const sellerOrders = useQuery(api.orders.getSellerOrders, 
    userId ? { sellerId: userId } : "skip"
  )
  const orderStats = useQuery(api.orders.getSellerOrderStats, 
    userId ? { sellerId: userId } : "skip"
  )

  // Mutation to update order status
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus)

  // Filter orders
  const filteredOrders = sellerOrders?.filter(order => {
    // Search filter
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.billingInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.billingInfo.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesFilter = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesFilter
  })

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({
        orderId: orderId,
        status: newStatus
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { variant: 'info', icon: '✅', label: 'Confirmée' },
      preparing: { variant: 'warning', icon: '📦', label: 'Préparation' },
      shipped: { variant: 'info', icon: '🚚', label: 'Expédiée' },
      delivered: { variant: 'success', icon: '🏠', label: 'Livrée' },
      cancelled: { variant: 'destructive', icon: '❌', label: 'Annulée' }
    }

    const config = statusConfig[status] || statusConfig.confirmed
    return (
      <Badge variant={config.variant}>
        {config.icon} {config.label}
      </Badge>
    )
  }

  const filterButtons = [
    { id: 'all', label: 'Toutes', icon: '📋' },
    { id: 'confirmed', label: 'Confirmées', icon: '✅' },
    { id: 'preparing', label: 'Préparation', icon: '📦' },
    { id: 'shipped', label: 'Expédiées', icon: '🚚' },
    { id: 'delivered', label: 'Livrées', icon: '🏠' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Mes ventes</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gérez les commandes de vos produits
        </p>
      </div>

      {/* Statistics Cards */}
      {orderStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Toutes les commandes reçues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.totalRevenue?.toFixed(2)}€</div>
              <p className="text-xs text-muted-foreground">
                Chiffre d'affaires total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.confirmedOrders}</div>
              <p className="text-xs text-muted-foreground">
                Commandes confirmées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livrées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.deliveredOrders}</div>
              <p className="text-xs text-muted-foreground">
                Commandes complétées
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par N° commande, produit, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((filter) => (
                <Button
                  key={filter.id}
                  variant={statusFilter === filter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.id)}
                >
                  {filter.icon} {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredOrders && filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <span className="font-mono text-sm">#{order.orderNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.productPrice}€/unité
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {order.billingInfo.firstName} {order.billingInfo.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.billingInfo.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.billingInfo.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.quantity}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {order.total.toFixed(2)}€
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => handleStatusUpdate(order._id, newStatus)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Changer statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">✅ Confirmée</SelectItem>
                          <SelectItem value="preparing">📦 Préparation</SelectItem>
                          <SelectItem value="shipped">🚚 Expédiée</SelectItem>
                          <SelectItem value="delivered">🏠 Livrée</SelectItem>
                          <SelectItem value="cancelled">❌ Annulée</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Aucune commande reçue</h3>
              <p className="text-sm text-muted-foreground">
                Vos commandes apparaîtront ici une fois que des clients achèteront vos produits.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default OrdersModule
