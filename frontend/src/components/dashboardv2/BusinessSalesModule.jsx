import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Plus, Edit, Trash2, Eye, Building2, MapPin, Euro, TrendingUp, Users } from 'lucide-react'

const BusinessSalesModule = ({ userId }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [images, setImages] = useState([])
  const [floorPlan, setFloorPlan] = useState(null)

  // Queries
  const businessSales = useQuery(api.functions.queries.businessSales.getSellerBusinessSales, { sellerId: userId })
  const stats = useQuery(api.functions.queries.businessSales.getSellerBusinessSalesStats, { sellerId: userId })

  // Mutations
  const createBusinessSale = useMutation(api.functions.mutations.businessSales.createBusinessSale)
  const updateBusinessSale = useMutation(api.functions.mutations.businessSales.updateBusinessSale)
  const deleteBusinessSale = useMutation(api.functions.mutations.businessSales.deleteBusinessSale)
  const updateStatus = useMutation(api.functions.mutations.businessSales.updateBusinessSaleStatus)

  // Form state
  const [formData, setFormData] = useState({
    activityType: '',
    businessName: '',
    address: '',
    city: '',
    district: '',
    totalArea: '',
    creationYear: new Date().getFullYear(),
    legalStatus: '',
    saleReason: '',
    salePrice: '',
    annualRevenue: '',
    netProfit: '',
    monthlyRent: '',
    fixedCharges: '',
    leaseRemaining: '',
    deposit: '',
    localDescription: '',
    includedEquipment: '',
    recentWorks: '',
    compliance: '',
    clienteleType: '',
    footTraffic: '',
    developmentPotential: '',
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      activityType: '',
      businessName: '',
      address: '',
      city: '',
      district: '',
      totalArea: '',
      creationYear: new Date().getFullYear(),
      legalStatus: '',
      saleReason: '',
      salePrice: '',
      annualRevenue: '',
      netProfit: '',
      monthlyRent: '',
      fixedCharges: '',
      leaseRemaining: '',
      deposit: '',
      localDescription: '',
      includedEquipment: '',
      recentWorks: '',
      compliance: '',
      clienteleType: '',
      footTraffic: '',
      developmentPotential: '',
    })
    setImages([])
    setFloorPlan(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Préparer les données en nettoyant les champs vides
      const businessData = {
        ...formData,
        salePrice: parseFloat(formData.salePrice),
        monthlyRent: parseFloat(formData.monthlyRent),
        creationYear: parseInt(formData.creationYear),
      }

      // Ajouter sellerId seulement pour la création
      if (!selectedBusiness) {
        businessData.sellerId = userId
      }

      // Ajouter images seulement si non vide
      if (images && images.length > 0) {
        businessData.images = images
      }

      // Ajouter floorPlan seulement si non null
      if (floorPlan) {
        businessData.floorPlan = floorPlan
      }

      // Nettoyer les champs optionnels vides
      Object.keys(businessData).forEach(key => {
        if (businessData[key] === '' || businessData[key] === null || businessData[key] === undefined) {
          delete businessData[key]
        }
      })

      if (selectedBusiness) {
        await updateBusinessSale({
          id: selectedBusiness._id,
          ...businessData,
        })
        setIsEditDialogOpen(false)
      } else {
        await createBusinessSale(businessData)
        setIsAddDialogOpen(false)
      }

      resetForm()
      setSelectedBusiness(null)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      const errorMessage = error.message || 'Une erreur est survenue lors de la création de l\'annonce'
      alert(errorMessage)
    }
  }

  const handleEdit = (business) => {
    setSelectedBusiness(business)
    setFormData({
      activityType: business.activityType || '',
      businessName: business.businessName || '',
      address: business.address || '',
      city: business.city || '',
      district: business.district || '',
      totalArea: business.totalArea || '',
      creationYear: business.creationYear || new Date().getFullYear(),
      legalStatus: business.legalStatus || '',
      saleReason: business.saleReason || '',
      salePrice: business.salePrice?.toString() || '',
      annualRevenue: business.annualRevenue || '',
      netProfit: business.netProfit || '',
      monthlyRent: business.monthlyRent?.toString() || '',
      fixedCharges: business.fixedCharges || '',
      leaseRemaining: business.leaseRemaining || '',
      deposit: business.deposit || '',
      localDescription: business.localDescription || '',
      includedEquipment: business.includedEquipment || '',
      recentWorks: business.recentWorks || '',
      compliance: business.compliance || '',
      clienteleType: business.clienteleType || '',
      footTraffic: business.footTraffic || '',
      developmentPotential: business.developmentPotential || '',
    })
    setImages(business.images || [])
    setFloorPlan(business.floorPlan || null)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fonds de commerce ?')) {
      try {
        await deleteBusinessSale({ id })
      } catch (error) {
        console.error('Erreur:', error)
        alert('Une erreur est survenue lors de la suppression')
      }
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus({ id, status: newStatus })
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Actif', color: 'bg-green-100 text-green-800' },
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      sold: { label: 'Vendu', color: 'bg-blue-100 text-blue-800' },
      inactive: { label: 'Inactif', color: 'bg-gray-100 text-gray-800' },
    }
    const badge = badges[status] || badges.active
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Fonds de Commerce</h2>
          <p className="text-muted-foreground">Gérez vos annonces de fonds de commerce</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle annonce
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une annonce de fonds de commerce</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour mettre en vente votre fonds de commerce
              </DialogDescription>
            </DialogHeader>
            <BusinessSaleForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              images={images}
              setImages={setImages}
              floorPlan={floorPlan}
              setFloorPlan={setFloorPlan}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Annonces créées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actives</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">En ligne actuellement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vues</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">Vues totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContacts}</div>
              <p className="text-xs text-muted-foreground">Demandes reçues</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des fonds de commerce */}
      <Card>
        <CardHeader>
          <CardTitle>Mes annonces</CardTitle>
          <CardDescription>
            {businessSales?.length || 0} annonce(s) de fonds de commerce
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!businessSales || businessSales.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucune annonce</h3>
              <p className="text-muted-foreground">Créez votre première annonce de fonds de commerce</p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer une annonce
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {businessSales.map((business) => (
                <div
                  key={business._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{business.activityType}</h3>
                        {getStatusBadge(business.status)}
                      </div>
                      {business.businessName && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {business.businessName}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {business.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          {business.salePrice.toLocaleString()} €
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {business.views || 0} vues
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{business.localDescription}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Select
                        value={business.status}
                        onValueChange={(value) => handleStatusChange(business._id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="sold">Vendu</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(business)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(business._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'annonce</DialogTitle>
            <DialogDescription>
              Modifiez les informations de votre fonds de commerce
            </DialogDescription>
          </DialogHeader>
          <BusinessSaleForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            images={images}
            setImages={setImages}
            floorPlan={floorPlan}
            setFloorPlan={setFloorPlan}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Composant formulaire séparé pour réutilisation
const BusinessSaleForm = ({ formData, handleInputChange, handleSubmit, images, setImages, floorPlan, setFloorPlan, isEdit = false }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Informations générales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🧾 Informations générales
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="activityType">Type d'activité *</Label>
            <Input
              id="activityType"
              value={formData.activityType}
              onChange={(e) => handleInputChange('activityType', e.target.value)}
              placeholder="Ex: Café, Boulangerie, Salon de coiffure"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Nom commercial (facultatif)</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="Nom du commerce"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Rue, quartier"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">Ville *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Ville"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">Quartier</Label>
            <Input
              id="district"
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              placeholder="Quartier"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="totalArea">Surface totale *</Label>
            <Input
              id="totalArea"
              value={formData.totalArea}
              onChange={(e) => handleInputChange('totalArea', e.target.value)}
              placeholder="Ex: 120 m²"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creationYear">Année de création *</Label>
            <Input
              id="creationYear"
              type="number"
              value={formData.creationYear}
              onChange={(e) => handleInputChange('creationYear', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalStatus">Statut juridique *</Label>
            <Input
              id="legalStatus"
              value={formData.legalStatus}
              onChange={(e) => handleInputChange('legalStatus', e.target.value)}
              placeholder="Ex: SARL, Auto-entrepreneur"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="saleReason">Motif de la vente *</Label>
          <Textarea
            id="saleReason"
            value={formData.saleReason}
            onChange={(e) => handleInputChange('saleReason', e.target.value)}
            placeholder="Ex: Départ à l'étranger, retraite, réorientation"
            required
          />
        </div>
      </div>

      {/* Section 2: Données financières */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          💰 Données financières
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="salePrice">Prix de vente (DH) *</Label>
            <Input
              id="salePrice"
              type="number"
              value={formData.salePrice}
              onChange={(e) => handleInputChange('salePrice', e.target.value)}
              placeholder="Ex: 500000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualRevenue">Chiffre d'affaires annuel *</Label>
            <Input
              id="annualRevenue"
              value={formData.annualRevenue}
              onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
              placeholder="Ex: 300000 €"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="netProfit">Résultat net / Bénéfice</Label>
            <Input
              id="netProfit"
              value={formData.netProfit}
              onChange={(e) => handleInputChange('netProfit', e.target.value)}
              placeholder="Ex: 80000 €"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Loyer mensuel (DH) *</Label>
            <Input
              id="monthlyRent"
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
              placeholder="Ex: 5000"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fixedCharges">Charges fixes mensuelles</Label>
            <Input
              id="fixedCharges"
              value={formData.fixedCharges}
              onChange={(e) => handleInputChange('fixedCharges', e.target.value)}
              placeholder="Ex: Électricité, eau, salaires"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaseRemaining">Durée du bail restante *</Label>
            <Input
              id="leaseRemaining"
              value={formData.leaseRemaining}
              onChange={(e) => handleInputChange('leaseRemaining', e.target.value)}
              placeholder="Ex: 5 ans"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deposit">Dépôt de garantie / Pas-de-porte</Label>
          <Input
            id="deposit"
            value={formData.deposit}
            onChange={(e) => handleInputChange('deposit', e.target.value)}
            placeholder="Montant du dépôt"
          />
        </div>
      </div>

      {/* Section 3: Détails du local */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🏠 Détails du local et équipements
        </h3>

        <div className="space-y-2">
          <Label htmlFor="localDescription">Description du local *</Label>
          <Textarea
            id="localDescription"
            value={formData.localDescription}
            onChange={(e) => handleInputChange('localDescription', e.target.value)}
            placeholder="État, aménagement, accessibilité, vitrine, parking, etc."
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="includedEquipment">Équipements inclus *</Label>
          <Textarea
            id="includedEquipment"
            value={formData.includedEquipment}
            onChange={(e) => handleInputChange('includedEquipment', e.target.value)}
            placeholder="Matériel, mobilier, machines, stock, licence, etc."
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recentWorks">Travaux récents ou rénovations</Label>
          <Textarea
            id="recentWorks"
            value={formData.recentWorks}
            onChange={(e) => handleInputChange('recentWorks', e.target.value)}
            placeholder="Décrivez les travaux effectués"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compliance">Conformité / Autorisations</Label>
          <Textarea
            id="compliance"
            value={formData.compliance}
            onChange={(e) => handleInputChange('compliance', e.target.value)}
            placeholder="Licence d'exploitation, conformité hygiène, autorisation terrasse, etc."
            rows={2}
          />
        </div>
      </div>

      {/* Section 4: Clientèle et potentiel */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          👥 Clientèle et potentiel
        </h3>

        <div className="space-y-2">
          <Label htmlFor="clienteleType">Type de clientèle *</Label>
          <Input
            id="clienteleType"
            value={formData.clienteleType}
            onChange={(e) => handleInputChange('clienteleType', e.target.value)}
            placeholder="Ex: Étudiants, familles, entreprises, touristes"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="footTraffic">Flux de passage / Zone fréquentée *</Label>
          <Input
            id="footTraffic"
            value={formData.footTraffic}
            onChange={(e) => handleInputChange('footTraffic', e.target.value)}
            placeholder="Ex: Zone très fréquentée, centre-ville"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="developmentPotential">Potentiel de développement</Label>
          <Textarea
            id="developmentPotential"
            value={formData.developmentPotential}
            onChange={(e) => handleInputChange('developmentPotential', e.target.value)}
            placeholder="Ex: Possibilité de livraison, d'agrandissement, de franchise"
            rows={2}
          />
        </div>
      </div>

      {/* Section 5: Contenu visuel */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          📸 Photos et Plan du local
        </h3>

        {/* Upload de photos */}
        <div className="space-y-2">
          <Label htmlFor="images">Photos du local (maximum 5)</Label>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files).slice(0, 5)
              // Pour l'instant, on stocke juste les noms de fichiers
              // L'upload réel vers Convex sera implémenté plus tard
              const fileNames = files.map(f => f.name)
              setImages(fileNames)
            }}
          />
          <p className="text-xs text-muted-foreground">
            Formats acceptés: JPG, PNG, WebP. Maximum 5 photos.
          </p>
          {images && images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    📷 Photo {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = images.filter((_, i) => i !== index)
                      setImages(newImages)
                    }}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload du plan */}
        <div className="space-y-2">
          <Label htmlFor="floorPlan">Plan du local (optionnel)</Label>
          <Input
            id="floorPlan"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                // Pour l'instant, on stocke juste le nom du fichier
                setFloorPlan(file.name)
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Formats acceptés: JPG, PNG, PDF. Plan d'aménagement ou schéma du local.
          </p>
          {floorPlan && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-muted px-2 py-1 rounded">
                📋 {floorPlan}
              </span>
              <button
                type="button"
                onClick={() => setFloorPlan(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
          💡 <strong>Conseil:</strong> Ajoutez des photos de qualité montrant l'extérieur, l'intérieur, 
          la vitrine, et les équipements pour attirer plus d'acheteurs potentiels.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">
          {isEdit ? 'Mettre à jour' : 'Créer l\'annonce'}
        </Button>
      </div>
    </form>
  )
}

export default BusinessSalesModule
