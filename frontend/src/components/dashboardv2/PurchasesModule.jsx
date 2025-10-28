import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Search, X, Package, ShoppingCart } from 'lucide-react'

const PurchasesModule = ({ userId }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Get buyer orders
  const buyerOrders = useQuery(api.orders.getBuyerOrders, 
    userId ? { buyerId: userId } : "skip"
  )

  // Get pending review orders
  const pendingReviewOrders = useQuery(api.orderReviews.getPendingReviewOrders,
    userId ? { buyerId: userId } : "skip"
  )

  // Filter orders
  const filteredOrders = buyerOrders?.filter(order => {
    // Search filter
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.productName.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { variant: 'info', icon: '✅', label: 'Confirmée' },
      preparing: { variant: 'warning', icon: '📦', label: 'Préparation' },
      shipped: { variant: 'info', icon: '🚚', label: 'En transit' },
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

  const getTrackingProgress = (status) => {
    const steps = ['confirmed', 'preparing', 'shipped', 'delivered']
    const currentIndex = steps.indexOf(status)
    
    return (
      <div className="flex items-center gap-1">
        {steps.map((step, index) => {
          const isActive = index <= currentIndex
          const icons = { confirmed: '✅', preparing: '📦', shipped: '🚚', delivered: '🏠' }
          
          return (
            <div
              key={step}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
              title={step}
            >
              {icons[step]}
            </div>
          )
        })}
      </div>
    )
  }

  const filterButtons = [
    { id: 'all', label: 'Toutes', icon: '📋' },
    { id: 'confirmed', label: 'Confirmées', icon: '✅' },
    { id: 'preparing', label: 'Préparation', icon: '📦' },
    { id: 'shipped', label: 'En transit', icon: '🚚' },
    { id: 'delivered', label: 'Livrées', icon: '🏠' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Mes achats</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Suivez vos achats et commandes
        </p>
      </div>

      {/* Pending Reviews Section */}
      {pendingReviewOrders && pendingReviewOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ Évaluations en attente
            </CardTitle>
            <CardDescription>
              Vos commandes livrées en attente d'évaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingReviewOrders.map((order) => (
                <Card key={order._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{order.orderNumber}</span>
                      <Badge variant="success">🏠 Livrée</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold">{order.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Vendeur : {order.sellerName}
                      </p>
                      {order.sellerCompany && (
                        <p className="text-xs text-muted-foreground">{order.sellerCompany}</p>
                      )}
                    </div>
                    <Button className="w-full" size="sm">
                      ⭐ Évaluer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par N° commande, produit..."
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
                  <TableHead>Quantité</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Livraison</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Suivi</TableHead>
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
                      <Badge variant="outline">{order.quantity}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{order.paymentMethod}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{order.billingInfo.address}</div>
                        <div className="text-muted-foreground">{order.billingInfo.city}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{order.total.toFixed(2)}€</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getTrackingProgress(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Aucune commande passée</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Vos achats apparaîtront ici. Commencez par explorer nos produits !
              </p>
              <Button onClick={() => navigate('/')}>
                <Package className="mr-2 h-4 w-4" />
                Parcourir les produits
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PurchasesModule
