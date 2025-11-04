import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import CouponQRCode from '../dashboardv2/CouponQRCode'
import { 
  Ticket, Search, QrCode, Eye, CheckCircle, XCircle, Clock,
  TrendingUp, Users, Store, Percent, DollarSign, Calendar,
  Package, Tag, AlertTriangle
} from 'lucide-react'

const CouponsModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSeller, setFilterSeller] = useState('all')
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState(false)

  // Queries
  const coupons = useQuery(api.functions.queries.adminCoupons.getAllCoupons)
  const stats = useQuery(api.functions.queries.adminCoupons.getGlobalCouponStats)
  const topCoupons = useQuery(api.functions.queries.adminCoupons.getTopCoupons, { limit: 5 })

  // Filtrer les coupons
  const filteredCoupons = coupons?.filter(coupon => {
    // Filtre de recherche
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      coupon.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.sellerCompany && coupon.sellerCompany.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtre de statut
    const now = Date.now()
    let matchesStatus = true
    if (filterStatus === 'active') {
      matchesStatus = coupon.isActive && coupon.validFrom <= now && (!coupon.validUntil || coupon.validUntil >= now)
    } else if (filterStatus === 'expired') {
      matchesStatus = coupon.validUntil && coupon.validUntil < now
    } else if (filterStatus === 'upcoming') {
      matchesStatus = coupon.validFrom > now
    } else if (filterStatus === 'inactive') {
      matchesStatus = !coupon.isActive
    }

    // Filtre par vendeur
    const matchesSeller = filterSeller === 'all' || coupon.sellerId === filterSeller

    return matchesSearch && matchesStatus && matchesSeller
  }) || []

  // Obtenir la liste unique des vendeurs
  const uniqueSellers = coupons ? Array.from(new Set(coupons.map(c => c.sellerId)))
    .map(sellerId => {
      const coupon = coupons.find(c => c.sellerId === sellerId)
      return {
        id: sellerId,
        name: coupon?.sellerName || 'Inconnu',
        company: coupon?.sellerCompany || ''
      }
    }) : []

  const getCouponStatus = (coupon) => {
    const now = Date.now()
    if (!coupon.isActive) return { label: 'Inactif', color: 'bg-gray-500' }
    if (coupon.validFrom > now) return { label: 'À venir', color: 'bg-blue-500' }
    if (coupon.validUntil && coupon.validUntil < now) return { label: 'Expiré', color: 'bg-red-500' }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { label: 'Épuisé', color: 'bg-orange-500' }
    return { label: 'Actif', color: 'bg-green-500' }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Ticket className="h-8 w-8 text-primary" />
          Gestion des Coupons
        </h2>
        <p className="text-muted-foreground">
          Vue d'ensemble de tous les coupons de la plateforme
        </p>
      </div>

      {/* Statistiques globales */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.uniqueSellers} vendeur(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">En cours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisations</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsages}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réductions</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.totalDiscountGiven)} DH</div>
              <p className="text-xs text-muted-foreground">Accordées</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top 5 Coupons */}
      {topCoupons && topCoupons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Coupons les plus utilisés</CardTitle>
            <CardDescription>Les coupons avec le plus d'utilisations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topCoupons.map((coupon, index) => (
                <div key={coupon._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{coupon.code}</div>
                      <div className="text-sm text-muted-foreground">
                        {coupon.sellerCompany || coupon.sellerName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{coupon.usageCount} utilisations</div>
                    <div className="text-sm text-muted-foreground">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue} DH`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres et liste */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des coupons</CardTitle>
          <CardDescription>Tous les coupons créés par les vendeurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par code, vendeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterSeller}
                onChange={(e) => setFilterSeller(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Tous les vendeurs</option>
                {uniqueSellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.company || seller.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtres rapides */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Tous
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Actifs
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactifs
              </Button>
              <Button
                variant={filterStatus === 'expired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('expired')}
              >
                Expirés
              </Button>
              <Button
                variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('upcoming')}
              >
                À venir
              </Button>
            </div>

            {/* Liste des coupons */}
            {filteredCoupons.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucun coupon</h3>
                <p className="text-muted-foreground">Aucun coupon ne correspond aux filtres</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCoupons.map((coupon) => {
                  const status = getCouponStatus(coupon)
                  return (
                    <Card key={coupon._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Ticket className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-bold">{coupon.code}</h3>
                              <Badge className={`${status.color} text-white`}>
                                {status.label}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {coupon.discountType === 'percentage' ? (
                                  <>
                                    <Percent className="h-3 w-3" />
                                    {coupon.discountValue}%
                                  </>
                                ) : (
                                  <>
                                    <DollarSign className="h-3 w-3" />
                                    {coupon.discountValue} DH
                                  </>
                                )}
                              </Badge>
                            </div>

                            {/* Vendeur */}
                            <div className="flex items-center gap-2 mb-2">
                              <Store className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {coupon.sellerCompany || coupon.sellerName}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ({coupon.sellerEmail})
                              </span>
                            </div>

                            {coupon.description && (
                              <p className="text-sm text-muted-foreground mb-3">{coupon.description}</p>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Du {formatDate(coupon.validFrom)}</span>
                              </div>
                              {coupon.validUntil && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>Au {formatDate(coupon.validUntil)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span>{coupon.usageCount} utilisations</span>
                              </div>
                              {coupon.usageLimit && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>Limite: {coupon.usageLimit}</span>
                                </div>
                              )}
                            </div>

                            {!coupon.applicableToAllProducts && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {coupon.productNames && coupon.productNames.length > 0 && (
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {coupon.productNames.length} produit(s)
                                  </Badge>
                                )}
                                {coupon.categoryNames && coupon.categoryNames.length > 0 && (
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {coupon.categoryNames.length} catégorie(s)
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCoupon(coupon)
                                setIsQRCodeDialogOpen(true)
                              }}
                              title="Voir QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog QR Code */}
      {selectedCoupon && (
        <CouponQRCode
          coupon={selectedCoupon}
          isOpen={isQRCodeDialogOpen}
          onClose={() => {
            setIsQRCodeDialogOpen(false)
            setSelectedCoupon(null)
          }}
        />
      )}
    </div>
  )
}

export default CouponsModule
