import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { CouponForm } from './CouponsModuleForm'
import CouponQRCode from './CouponQRCode'
import { 
  Ticket, Plus, Search, Edit, Trash2, Copy, Eye, EyeOff,
  Calendar, Users, Package, Tag, TrendingUp, CheckCircle,
  XCircle, Clock, Percent, DollarSign, QrCode
} from 'lucide-react'

const CouponsModule = ({ userId, userType }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    description: '',
    isActive: true,
    usageLimit: '',
    usageLimitPerUser: '',
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: '',
    minimumAmount: '',
    maximumDiscount: '',
    applicableToAllProducts: true,
    specificProductIds: [],
    specificCategoryIds: [],
    applicableToAllUsers: true,
    specificUserTypes: [],
  })

  const coupons = useQuery(api.functions.queries.sellerCoupons.getSellerCoupons, { sellerId: userId })
  const stats = useQuery(api.functions.queries.sellerCoupons.getCouponStats, { sellerId: userId })
  const sellerProducts = useQuery(api.products.getProductsBySeller, { sellerId: userId })
  const categories = useQuery(api.categories.getAllCategories, {})

  const createCoupon = useMutation(api.functions.mutations.sellerCoupons.createCoupon)
  const updateCoupon = useMutation(api.functions.mutations.sellerCoupons.updateCoupon)
  const toggleStatus = useMutation(api.functions.mutations.sellerCoupons.toggleCouponStatus)
  const deleteCoupon = useMutation(api.functions.mutations.sellerCoupons.deleteCoupon)
  const duplicateCoupon = useMutation(api.functions.mutations.sellerCoupons.duplicateCoupon)

  const filteredCoupons = coupons?.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const now = Date.now()
    let matchesStatus = true
    if (filterStatus === 'active') {
      matchesStatus = coupon.isActive && coupon.validFrom <= now && (!coupon.validUntil || coupon.validUntil >= now)
    } else if (filterStatus === 'expired') {
      matchesStatus = coupon.validUntil && coupon.validUntil < now
    } else if (filterStatus === 'upcoming') {
      matchesStatus = coupon.validFrom > now
    }

    return matchesSearch && matchesStatus
  }) || []

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      description: '',
      isActive: true,
      usageLimit: '',
      usageLimitPerUser: '',
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: '',
      minimumAmount: '',
      maximumDiscount: '',
      applicableToAllProducts: true,
      specificProductIds: [],
      specificCategoryIds: [],
      applicableToAllUsers: true,
      specificUserTypes: [],
    })
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createCoupon({
        code: formData.code,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        description: formData.description || undefined,
        isActive: formData.isActive,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        usageLimitPerUser: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : undefined,
        validFrom: new Date(formData.validFrom).getTime(),
        validUntil: formData.validUntil ? new Date(formData.validUntil).getTime() : undefined,
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : undefined,
        applicableToAllProducts: formData.applicableToAllProducts,
        specificProductIds: formData.specificProductIds.length > 0 ? formData.specificProductIds : undefined,
        specificCategoryIds: formData.specificCategoryIds.length > 0 ? formData.specificCategoryIds : undefined,
        applicableToAllUsers: formData.applicableToAllUsers,
        specificUserTypes: formData.specificUserTypes.length > 0 ? formData.specificUserTypes : undefined,
        sellerId: userId,
      })

      resetForm()
      setIsCreateDialogOpen(false)
      alert('Coupon créé avec succès !')
    } catch (error) {
      console.error('Erreur:', error)
      alert(error.message || 'Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCoupon = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateCoupon({
        couponId: selectedCoupon._id,
        code: formData.code !== selectedCoupon.code ? formData.code : undefined,
        discountType: formData.discountType !== selectedCoupon.discountType ? formData.discountType : undefined,
        discountValue: parseFloat(formData.discountValue) !== selectedCoupon.discountValue ? parseFloat(formData.discountValue) : undefined,
        description: formData.description !== selectedCoupon.description ? formData.description : undefined,
        isActive: formData.isActive !== selectedCoupon.isActive ? formData.isActive : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        usageLimitPerUser: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : undefined,
        validFrom: new Date(formData.validFrom).getTime() !== selectedCoupon.validFrom ? new Date(formData.validFrom).getTime() : undefined,
        validUntil: formData.validUntil ? new Date(formData.validUntil).getTime() : undefined,
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : undefined,
        applicableToAllProducts: formData.applicableToAllProducts !== selectedCoupon.applicableToAllProducts ? formData.applicableToAllProducts : undefined,
        specificProductIds: formData.specificProductIds.length > 0 ? formData.specificProductIds : undefined,
        specificCategoryIds: formData.specificCategoryIds.length > 0 ? formData.specificCategoryIds : undefined,
        applicableToAllUsers: formData.applicableToAllUsers !== selectedCoupon.applicableToAllUsers ? formData.applicableToAllUsers : undefined,
        specificUserTypes: formData.specificUserTypes.length > 0 ? formData.specificUserTypes : undefined,
        updatedBy: userId,
      })

      setIsEditDialogOpen(false)
      setSelectedCoupon(null)
      alert('Coupon mis à jour !')
    } catch (error) {
      console.error('Erreur:', error)
      alert(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (couponId) => {
    try {
      await toggleStatus({ couponId, updatedBy: userId })
    } catch (error) {
      alert(error.message || 'Erreur')
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Supprimer ce coupon ?')) return
    try {
      await deleteCoupon({ couponId, deletedBy: userId })
      alert('Coupon supprimé !')
    } catch (error) {
      alert(error.message || 'Erreur')
    }
  }

  const handleDuplicateCoupon = async (coupon) => {
    const newCode = prompt('Code pour le nouveau coupon:', `${coupon.code}_COPY`)
    if (!newCode) return
    try {
      await duplicateCoupon({ couponId: coupon._id, newCode, sellerId: userId })
      alert('Coupon dupliqué !')
    } catch (error) {
      alert(error.message || 'Erreur')
    }
  }

  const openEditDialog = (coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description || '',
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit || '',
      usageLimitPerUser: coupon.usageLimitPerUser || '',
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : '',
      minimumAmount: coupon.minimumAmount || '',
      maximumDiscount: coupon.maximumDiscount || '',
      applicableToAllProducts: coupon.applicableToAllProducts,
      specificProductIds: coupon.specificProductIds || [],
      specificCategoryIds: coupon.specificCategoryIds || [],
      applicableToAllUsers: coupon.applicableToAllUsers,
      specificUserTypes: coupon.specificUserTypes || [],
    })
    setIsEditDialogOpen(true)
  }

  const getCouponStatus = (coupon) => {
    const now = Date.now()
    if (!coupon.isActive) return { label: 'Inactif', color: 'bg-gray-500' }
    if (coupon.validFrom > now) return { label: 'À venir', color: 'bg-blue-500' }
    if (coupon.validUntil && coupon.validUntil < now) return { label: 'Expiré', color: 'bg-red-500' }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { label: 'Épuisé', color: 'bg-orange-500' }
    return { label: 'Actif', color: 'bg-green-500' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Ticket className="h-8 w-8 text-primary" />
            Mes Coupons
          </h2>
          <p className="text-muted-foreground">Créez et gérez vos codes de réduction</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau coupon</DialogTitle>
              <DialogDescription>Configurez votre code de réduction</DialogDescription>
            </DialogHeader>
            <CouponForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateCoupon}
              isLoading={isLoading}
              products={sellerProducts}
              categories={categories}
              isEdit={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Coupons créés</p>
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
              <CardTitle className="text-sm font-medium">Expirés</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expired}</div>
              <p className="text-xs text-muted-foreground">Terminés</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des coupons</CardTitle>
          <CardDescription>Gérez vos codes de réduction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant={filterStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('all')}>Tous</Button>
              <Button variant={filterStatus === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('active')}>Actifs</Button>
              <Button variant={filterStatus === 'expired' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('expired')}>Expirés</Button>
              <Button variant={filterStatus === 'upcoming' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('upcoming')}>À venir</Button>
            </div>

            {filteredCoupons.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucun coupon</h3>
                <p className="text-muted-foreground">Créez votre premier code de réduction</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCoupons.map((coupon) => {
                  const status = getCouponStatus(coupon)
                  const formatDate = (ts) => new Date(ts).toLocaleDateString('fr-FR')
                  const getDiscount = () => coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue} DH`

                  return (
                    <Card key={coupon._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Ticket className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-bold">{coupon.code}</h3>
                              <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {coupon.discountType === 'percentage' ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                                {getDiscount()}
                              </Badge>
                            </div>

                            {coupon.description && <p className="text-sm text-muted-foreground mb-3">{coupon.description}</p>}

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
                              title="Générer QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(coupon)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleToggleStatus(coupon._id)}>
                              {coupon.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDuplicateCoupon(coupon)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteCoupon(coupon._id)} className="text-red-500">
                              <Trash2 className="h-4 w-4" />
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

      {selectedCoupon && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Modifier le coupon</DialogTitle>
                <DialogDescription>Mettez à jour les paramètres</DialogDescription>
              </DialogHeader>
              <CouponForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdateCoupon}
                isLoading={isLoading}
                products={sellerProducts}
                categories={categories}
                isEdit={true}
              />
            </DialogContent>
          </Dialog>

          <CouponQRCode
            coupon={selectedCoupon}
            isOpen={isQRCodeDialogOpen}
            onClose={() => {
              setIsQRCodeDialogOpen(false)
              setSelectedCoupon(null)
            }}
          />
        </>
      )}
    </div>
  )
}

export default CouponsModule
