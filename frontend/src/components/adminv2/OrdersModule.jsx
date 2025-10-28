import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  User,
  Store,
  CreditCard,
  MapPin
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

const OrdersModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Convex queries et mutations
  const allOrders = useQuery(api.orders.getAllOrders)
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus)

  // Filtrer les commandes
  const filteredOrders = allOrders?.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.sellerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  }) || []

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
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

  const calculateOrderTotal = (order) => {
    if (Array.isArray(order)) {
      return order.reduce((total, item) => total + (item.price * item.quantity), 0) || 0
    }
    if (order && typeof order === 'object') {
      return order.total || (order.productPrice * order.quantity) || 0
    }
    return 0
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: { label: 'En attente', variant: 'outline', icon: Clock, color: 'text-orange-500' },
      confirmed: { label: 'Confirmée', variant: 'default', icon: CheckCircle, color: 'text-blue-500' },
      shipped: { label: 'Expédiée', variant: 'secondary', icon: Truck, color: 'text-purple-500' },
      delivered: { label: 'Livrée', variant: 'default', icon: Package, color: 'text-green-500' },
      cancelled: { label: 'Annulée', variant: 'destructive', icon: XCircle, color: 'text-red-500' }
    }
    const config = variants[status] || variants.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Statistiques
  const stats = {
    total: allOrders?.length || 0,
    pending: allOrders?.filter(o => o.status === 'pending').length || 0,
    confirmed: allOrders?.filter(o => o.status === 'confirmed').length || 0,
    revenue: allOrders?.reduce((total, order) => total + calculateOrderTotal(order), 0) || 0,
  }

  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Commandes</h2>
          <p className="text-muted-foreground">
            Gérez toutes les commandes de la plateforme
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">commandes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">à traiter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.revenue)}</div>
            <p className="text-xs text-muted-foreground">total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
          <CardDescription>
            Recherchez et filtrez les commandes
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmées</SelectItem>
                <SelectItem value="shipped">Expédiées</SelectItem>
                <SelectItem value="delivered">Livrées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
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
                    <TableHead>Articles</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
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
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{order.quantity || 1} article(s)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatPrice(calculateOrderTotal(order))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order._id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="confirmed">Confirmée</SelectItem>
                            <SelectItem value="shipped">Expédiée</SelectItem>
                            <SelectItem value="delivered">Livrée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucune commande trouvée</h3>
              <p className="text-sm text-muted-foreground">
                Aucune commande ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal des détails de commande */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la commande #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Informations complètes sur la commande
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Numéro de commande</Label>
                      <p className="font-medium">#{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date de commande</Label>
                      <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Statut</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total</Label>
                      <p className="font-bold text-lg">
                        {formatPrice(calculateOrderTotal(selectedOrder))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Participants</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
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
                </CardContent>
              </Card>

              {/* Articles commandés */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Articles commandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-background">
                      <img 
                        src={'https://via.placeholder.com/60x60?text=📦'} 
                        alt={selectedOrder.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">{selectedOrder.productName}</h5>
                      <p className="text-sm text-muted-foreground">
                        Quantité : {selectedOrder.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Prix unitaire : {formatPrice(selectedOrder.productPrice)}
                      </p>
                    </div>
                    <div className="font-bold">
                      {formatPrice(selectedOrder.productPrice * selectedOrder.quantity)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Adresse de livraison */}
              {selectedOrder.billingInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {selectedOrder.billingInfo.firstName} {selectedOrder.billingInfo.lastName}
                      </p>
                      <p className="text-sm">{selectedOrder.billingInfo.address}</p>
                      <p className="text-sm">
                        {selectedOrder.billingInfo.city}, {selectedOrder.billingInfo.postalCode}
                      </p>
                      <p className="text-sm">{selectedOrder.billingInfo.country}</p>
                      <p className="text-sm text-muted-foreground">
                        📧 {selectedOrder.billingInfo.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informations de paiement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Méthode</Label>
                      <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">ID Transaction</Label>
                      <p className="font-medium text-xs">{selectedOrder.paymentId}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Statut paiement</Label>
                    <div className="mt-1">
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {selectedOrder.paymentStatus || 'Payé'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDetails(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OrdersModule
