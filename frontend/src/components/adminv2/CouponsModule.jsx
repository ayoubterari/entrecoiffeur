import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  Ticket, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Lock,
  Unlock,
  Calendar,
  Percent,
  TrendingUp,
  Users,
  Save,
  X,
  Loader2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'

const CouponsModule = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Queries
  const couponsData = useQuery(api.functions.queries.coupons.getAllCoupons, { limit: 100 })
  const couponStats = useQuery(api.functions.queries.coupons.getCouponStats)

  // Mutations
  const createCoupon = useMutation(api.functions.mutations.coupons.createCoupon)
  const updateCoupon = useMutation(api.functions.mutations.coupons.updateCoupon)
  const deleteCoupon = useMutation(api.functions.mutations.coupons.deleteCoupon)
  const toggleCouponStatus = useMutation(api.functions.mutations.coupons.toggleCouponStatus)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    description: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    minimumAmount: ''
  })

  const currentUserId = localStorage.getItem('userId')

  const resetForm = () => {
    setFormData({
      code: '',
      discountPercentage: '',
      description: '',
      usageLimit: '',
      validFrom: '',
      validUntil: '',
      minimumAmount: ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatDateForInput = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toISOString().slice(0, 16)
  }

  const parseDateFromInput = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).getTime()
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.code || !formData.discountPercentage || !formData.validFrom) {
        throw new Error('Code, pourcentage et date de début sont obligatoires')
      }

      const couponData = {
        code: formData.code.toUpperCase(),
        discountPercentage: parseInt(formData.discountPercentage),
        description: formData.description || undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        validFrom: parseDateFromInput(formData.validFrom),
        validUntil: formData.validUntil ? parseDateFromInput(formData.validUntil) : undefined,
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
        createdBy: currentUserId
      }

      await createCoupon(couponData)
      setMessage({ type: 'success', text: 'Coupon créé avec succès!' })
      resetForm()
      setShowCreateModal(false)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleEditCoupon = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updates = {}
      
      if (formData.code) updates.code = formData.code.toUpperCase()
      if (formData.discountPercentage) updates.discountPercentage = parseInt(formData.discountPercentage)
      if (formData.description !== undefined) updates.description = formData.description || undefined
      if (formData.usageLimit !== undefined) updates.usageLimit = formData.usageLimit ? parseInt(formData.usageLimit) : undefined
      if (formData.validFrom) updates.validFrom = parseDateFromInput(formData.validFrom)
      if (formData.validUntil !== undefined) updates.validUntil = formData.validUntil ? parseDateFromInput(formData.validUntil) : undefined
      if (formData.minimumAmount !== undefined) updates.minimumAmount = formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined

      await updateCoupon({
        couponId: selectedCoupon._id,
        ...updates
      })

      setMessage({ type: 'success', text: 'Coupon modifié avec succès!' })
      resetForm()
      setShowEditModal(false)
      setSelectedCoupon(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    try {
      await deleteCoupon({ couponId })
      setMessage({ type: 'success', text: 'Coupon supprimé avec succès!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const handleToggleStatus = async (couponId) => {
    try {
      await toggleCouponStatus({ couponId })
      setMessage({ type: 'success', text: 'Statut du coupon modifié!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage.toString(),
      description: coupon.description || '',
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      validFrom: formatDateForInput(coupon.validFrom),
      validUntil: formatDateForInput(coupon.validUntil),
      minimumAmount: coupon.minimumAmount ? coupon.minimumAmount.toString() : ''
    })
    setShowEditModal(true)
  }

  const filteredCoupons = couponsData?.coupons?.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (!matchesSearch) return false

    const now = Date.now()
    
    switch (filterStatus) {
      case 'active':
        return coupon.isActive && 
               now >= coupon.validFrom && 
               (!coupon.validUntil || now <= coupon.validUntil) &&
               (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)
      case 'expired':
        return coupon.validUntil && now > coupon.validUntil
      case 'used':
        return coupon.usageCount > 0
      default:
        return true
    }
  }) || []

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Aucune'
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCouponStatus = (coupon) => {
    const now = Date.now()
    
    if (!coupon.isActive) return { status: 'inactive', label: 'Inactif', variant: 'secondary' }
    if (now < coupon.validFrom) return { status: 'pending', label: 'En attente', variant: 'outline' }
    if (coupon.validUntil && now > coupon.validUntil) return { status: 'expired', label: 'Expiré', variant: 'destructive' }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { status: 'exhausted', label: 'Épuisé', variant: 'secondary' }
    
    return { status: 'active', label: 'Actif', variant: 'default' }
  }

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
          <p className="text-muted-foreground">
            Créez et gérez les codes de réduction
          </p>
        </div>
        <Button onClick={() => {
          setShowCreateModal(true)
          resetForm()
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Coupon
        </Button>
      </div>

      {/* Messages */}
      {message.text && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques */}
      {couponStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{couponStats.total}</div>
              <p className="text-xs text-muted-foreground">coupons</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <Unlock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{couponStats.active}</div>
              <p className="text-xs text-muted-foreground">disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{couponStats.totalUsage}</div>
              <p className="text-xs text-muted-foreground">fois utilisés</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réduction Moy.</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{couponStats.averageDiscount}%</div>
              <p className="text-xs text-muted-foreground">en moyenne</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des coupons</CardTitle>
          <CardDescription>
            Recherchez et filtrez les codes de réduction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par code ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
                variant={filterStatus === 'expired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('expired')}
              >
                Expirés
              </Button>
              <Button
                variant={filterStatus === 'used' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('used')}
              >
                Utilisés
              </Button>
            </div>
          </div>

          {/* Tableau */}
          {filteredCoupons.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Réduction</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Utilisations</TableHead>
                    <TableHead>Validité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map(coupon => {
                    const status = getCouponStatus(coupon)
                    return (
                      <TableRow key={coupon._id}>
                        <TableCell>
                          <span className="font-mono font-bold">{coupon.code}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {coupon.discountPercentage}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {coupon.description || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {coupon.usageCount}
                            {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(coupon.validFrom)}
                            </div>
                            {coupon.validUntil && (
                              <div className="text-muted-foreground">
                                → {formatDate(coupon.validUntil)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(coupon)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(coupon._id)}
                            >
                              {coupon.isActive ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCoupon(coupon._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucun coupon trouvé</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez votre premier code de réduction
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un coupon
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau coupon</DialogTitle>
            <DialogDescription>
              Créez un code de réduction pour vos clients
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateCoupon}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code du coupon *</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Ex: SUMMER20"
                    required
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPercentage">Réduction (%) *</Label>
                  <Input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description du coupon (optionnel)"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Limite d'utilisation</Label>
                  <Input
                    id="usageLimit"
                    name="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="Illimité si vide"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumAmount">Montant minimum (€)</Label>
                  <Input
                    id="minimumAmount"
                    name="minimumAmount"
                    type="number"
                    value={formData.minimumAmount}
                    onChange={handleInputChange}
                    placeholder="Aucun minimum"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Date de début *</Label>
                  <Input
                    id="validFrom"
                    name="validFrom"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Date de fin</Label>
                  <Input
                    id="validUntil"
                    name="validUntil"
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Créer le coupon
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le coupon</DialogTitle>
            <DialogDescription>
              Modifiez les informations du code de réduction
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditCoupon}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Code du coupon</Label>
                  <Input
                    id="edit-code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-discountPercentage">Réduction (%)</Label>
                  <Input
                    id="edit-discountPercentage"
                    name="discountPercentage"
                    type="number"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-usageLimit">Limite d'utilisation</Label>
                  <Input
                    id="edit-usageLimit"
                    name="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minimumAmount">Montant minimum (€)</Label>
                  <Input
                    id="edit-minimumAmount"
                    name="minimumAmount"
                    type="number"
                    value={formData.minimumAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-validFrom">Date de début</Label>
                  <Input
                    id="edit-validFrom"
                    name="validFrom"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-validUntil">Date de fin</Label>
                  <Input
                    id="edit-validUntil"
                    name="validUntil"
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Modifier
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CouponsModule
