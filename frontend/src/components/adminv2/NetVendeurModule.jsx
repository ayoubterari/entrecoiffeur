import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  DollarSign, 
  Search, 
  Filter, 
  Eye,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Send,
  Store,
  ShoppingCart,
  Calendar,
  ArrowRight
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

const NetVendeurModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showTransferDetails, setShowTransferDetails] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [processingTransfers, setProcessingTransfers] = useState(new Set())

  // Convex queries
  const allOrders = useQuery(api.orders.getAllOrders)
  const allUsers = useQuery(api.auth.getAllUsers)
  
  // Mutations
  const markTransferCompleted = useMutation(api.netVendeur.markTransferCompleted)

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

  // Calculer la commission et le net vendeur
  const calculateCommission = (orderTotal) => {
    return (orderTotal * COMMISSION_RATE) / 100
  }

  const calculateNetAmount = (orderTotal) => {
    return orderTotal - calculateCommission(orderTotal)
  }

  // Récupérer les informations d'un vendeur
  const getSellerInfo = (sellerId) => {
    if (!allUsers) return { name: 'Chargement...', email: 'Chargement...' }
    
    const seller = allUsers.find(user => user._id === sellerId)
    if (!seller) return { name: 'Vendeur introuvable', email: 'N/A' }
    
    const name = seller.firstName && seller.lastName 
      ? `${seller.firstName} ${seller.lastName}`
      : seller.firstName || seller.lastName || seller.email
    
    return { name, email: seller.email }
  }

  // Marquer un transfert comme effectué
  const handleTransferComplete = async (sellerId) => {
    try {
      setProcessingTransfers(prev => new Set(prev).add(sellerId))
      
      await markTransferCompleted({
        sellerId,
        transferAmount: sellerSummaries.find(s => s.sellerId === sellerId)?.totalNetAmount,
        transferReference: `TRANSFER_${Date.now()}`
      })
      
    } catch (error) {
      console.error('Erreur lors du marquage du transfert:', error)
    } finally {
      setProcessingTransfers(prev => {
        const newSet = new Set(prev)
        newSet.delete(sellerId)
        return newSet
      })
    }
  }

  // Grouper les commandes par vendeur
  const getSellerSummary = () => {
    if (!allOrders) return []
    
    let filteredOrders = allOrders.filter(order => {
      const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.sellerId?.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      filteredOrders = filteredOrders.filter(order => new Date(order.createdAt) >= filterDate)
    }

    // Grouper par vendeur
    const sellerMap = new Map()
    
    filteredOrders.forEach(order => {
      const sellerId = order.sellerId
      const orderTotal = calculateOrderTotal(order)
      const commission = calculateCommission(orderTotal)
      const netAmount = calculateNetAmount(orderTotal)
      
      if (!sellerMap.has(sellerId)) {
        const sellerInfo = getSellerInfo(sellerId)
        sellerMap.set(sellerId, {
          sellerId,
          sellerName: sellerInfo.name,
          sellerEmail: sellerInfo.email,
          totalOrders: 0,
          totalRevenue: 0,
          totalCommissions: 0,
          totalNetAmount: 0,
          orders: [],
          transferStatus: 'pending'
        })
      }
      
      const seller = sellerMap.get(sellerId)
      seller.totalOrders += 1
      seller.totalRevenue += orderTotal
      seller.totalCommissions += commission
      seller.totalNetAmount += netAmount
      seller.orders.push({
        ...order,
        orderTotal,
        commission,
        netAmount
      })
    })

    let sellers = Array.from(sellerMap.values())

    // Filtrer par statut de transfert
    if (filterStatus !== 'all') {
      sellers = sellers.filter(seller => seller.transferStatus === filterStatus)
    }

    return sellers
  }

  const sellerSummaries = getSellerSummary()

  // Calculer les statistiques globales
  const globalStats = {
    totalSellers: sellerSummaries.length,
    totalRevenue: sellerSummaries.reduce((sum, seller) => sum + seller.totalRevenue, 0),
    totalCommissions: sellerSummaries.reduce((sum, seller) => sum + seller.totalCommissions, 0),
    totalNetAmount: sellerSummaries.reduce((sum, seller) => sum + seller.totalNetAmount, 0),
    pendingTransfers: sellerSummaries.filter(s => s.transferStatus === 'pending').length,
    completedTransfers: sellerSummaries.filter(s => s.transferStatus === 'completed').length
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

  const viewTransferDetails = (seller) => {
    setSelectedSeller(seller)
    setShowTransferDetails(true)
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: { label: 'En attente', variant: 'outline', icon: Clock, color: 'text-orange-500' },
      processing: { label: 'En cours', variant: 'secondary', icon: Send, color: 'text-blue-500' },
      completed: { label: 'Effectué', variant: 'default', icon: CheckCircle, color: 'text-green-500' }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Net Vendeur</h2>
          <p className="text-muted-foreground">
            Gérez les versements aux vendeurs après prélèvement des commissions ({COMMISSION_RATE}%)
          </p>
        </div>
      </div>

      {/* Résumé des versements */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Résumé des Versements
          </CardTitle>
          <CardDescription>
            Vue d'ensemble des montants à verser aux vendeurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Total à verser</Label>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(globalStats.totalNetAmount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Montant net après commission
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Commission prélevée</Label>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(globalStats.totalCommissions)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {COMMISSION_RATE}% du chiffre d'affaires
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Chiffre d'affaires total</Label>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {formatPrice(globalStats.totalRevenue)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Total des ventes
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendeurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalSellers}</div>
            <p className="text-xs text-muted-foreground">vendeurs actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total à verser</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(globalStats.totalNetAmount)}</div>
            <p className="text-xs text-muted-foreground">montant net</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.pendingTransfers}</div>
            <p className="text-xs text-muted-foreground">versements à faire</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effectués</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.completedTransfers}</div>
            <p className="text-xs text-muted-foreground">versements faits</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des versements</CardTitle>
          <CardDescription>
            Recherchez et filtrez les versements par période et statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un vendeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[180px]">
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="completed">Effectués</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          {sellerSummaries.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Commandes</TableHead>
                    <TableHead>Chiffre d'affaires</TableHead>
                    <TableHead>Commission ({COMMISSION_RATE}%)</TableHead>
                    <TableHead>Montant Net</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellerSummaries.map((seller) => (
                    <TableRow key={seller.sellerId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Store className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{seller.sellerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {seller.sellerEmail}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{seller.totalOrders} commande(s)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatPrice(seller.totalRevenue)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600">- {formatPrice(seller.totalCommissions)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">
                          {formatPrice(seller.totalNetAmount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(seller.transferStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewTransferDetails(seller)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {seller.transferStatus === 'pending' && (
                            <Button
                              variant="default"
                              size="icon"
                              onClick={() => handleTransferComplete(seller.sellerId)}
                              disabled={processingTransfers.has(seller.sellerId)}
                            >
                              {processingTransfers.has(seller.sellerId) ? (
                                <Clock className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucun versement trouvé</h3>
              <p className="text-sm text-muted-foreground">
                Aucun vendeur ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal des détails de versement */}
      <Dialog open={showTransferDetails} onOpenChange={setShowTransferDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du versement - {selectedSeller?.sellerName}</DialogTitle>
            <DialogDescription>
              Informations complètes sur le versement à effectuer
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeller && (
            <div className="space-y-6 py-4">
              {/* Informations du vendeur */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Informations du vendeur
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedSeller.sellerEmail}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">ID Vendeur</Label>
                    <p className="font-medium text-xs">{selectedSeller.sellerId}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nombre de commandes</Label>
                    <p className="font-medium">{selectedSeller.totalOrders}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Statut du versement</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedSeller.transferStatus)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calcul du versement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Calcul du versement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Chiffre d'affaires total</span>
                    <span className="font-medium">{formatPrice(selectedSeller.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Commission plateforme ({COMMISSION_RATE}%)</span>
                    <span className="font-medium text-red-600">
                      - {formatPrice(selectedSeller.totalCommissions)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-950 px-3 rounded-lg">
                    <span className="font-bold">Montant net à verser</span>
                    <span className="font-bold text-xl text-green-600">
                      {formatPrice(selectedSeller.totalNetAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des commandes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Détail des commandes</CardTitle>
                  <CardDescription>
                    {selectedSeller.orders.length > 5 
                      ? `Affichage des 5 premières commandes sur ${selectedSeller.orders.length}`
                      : `${selectedSeller.orders.length} commande(s)`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedSeller.orders.slice(0, 5).map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{order.orderNumber}</span>
                            <Badge variant="outline" className="text-xs">{order.productName}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm">Total: {formatPrice(order.orderTotal)}</div>
                          <div className="text-xs text-red-600">Commission: -{formatPrice(order.commission)}</div>
                          <div className="text-sm font-bold text-green-600">Net: {formatPrice(order.netAmount)}</div>
                        </div>
                      </div>
                    ))}
                    {selectedSeller.orders.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground py-2">
                        ... et {selectedSeller.orders.length - 5} autre(s) commande(s)
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Instructions de versement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Instructions de versement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">Vérifier les informations</h5>
                        <p className="text-sm text-muted-foreground">
                          Vérifiez que toutes les commandes sont correctes et que le montant net est exact.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">Effectuer le virement</h5>
                        <p className="text-sm text-muted-foreground">
                          Effectuez le virement de <strong>{formatPrice(selectedSeller.totalNetAmount)}</strong> vers le compte du vendeur.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">Marquer comme effectué</h5>
                        <p className="text-sm text-muted-foreground">
                          Une fois le virement effectué, cliquez sur le bouton "Marquer comme effectué".
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            {selectedSeller?.transferStatus === 'pending' && (
              <Button
                onClick={() => {
                  handleTransferComplete(selectedSeller.sellerId)
                  setShowTransferDetails(false)
                }}
                disabled={processingTransfers.has(selectedSeller.sellerId)}
              >
                {processingTransfers.has(selectedSeller.sellerId) ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Marquer comme effectué
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowTransferDetails(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NetVendeurModule
