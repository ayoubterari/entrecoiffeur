import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  X,
  Upload,
  Loader2,
  Copy
} from 'lucide-react'

const HomeCarouselModule = ({ userId }) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)

  // Queries
  const banners = useQuery(api.functions.queries.homeCarousel.getAllBanners)
  const activeBannersCount = useQuery(api.functions.queries.homeCarousel.getActiveBannersCount)

  // Mutations
  const createBanner = useMutation(api.functions.mutations.homeCarousel.createBanner)
  const updateBanner = useMutation(api.functions.mutations.homeCarousel.updateBanner)
  const deleteBanner = useMutation(api.functions.mutations.homeCarousel.deleteBanner)
  const toggleStatus = useMutation(api.functions.mutations.homeCarousel.toggleBannerStatus)

  const handleToggleStatus = async (bannerId) => {
    try {
      await toggleStatus({ bannerId, userId })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDelete = async (bannerId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette bannière ?')) return

    try {
      await deleteBanner({ bannerId, userId })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDuplicate = async (banner) => {
    if (banners && banners.length >= 5) {
      alert('Vous avez atteint le maximum de 5 bannières')
      return
    }

    try {
      // Calculer le prochain ordre (dernier ordre + 1)
      const maxOrder = banners.reduce((max, b) => Math.max(max, b.order || 0), 0)
      
      await createBanner({
        title: `${banner.title} (Copie)`,
        subtitle: banner.subtitle,
        buttonText: banner.buttonText,
        buttonLink: banner.buttonLink,
        backgroundColor: banner.backgroundColor,
        textColor: banner.textColor,
        image: banner.image,
        imageStorageId: banner.imageStorageId,
        isActive: false, // Désactivé par défaut
        order: maxOrder + 1, // Ajouter à la fin
        userId
      })
      alert('Bannière dupliquée avec succès !')
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carrousel Page d'Accueil</h1>
          <p className="text-muted-foreground">
            Gérez les bannières du carrousel de la page d'accueil (maximum 5)
          </p>
        </div>
        
        <Button 
          size="lg" 
          onClick={() => setShowAddModal(true)}
          disabled={banners && banners.length >= 5}
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Ajouter une bannière
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bannières</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners?.length || 0} / 5</div>
            <p className="text-xs text-muted-foreground">
              Maximum 5 bannières
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bannières Actives</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBannersCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Visibles sur le site
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bannières Inactives</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners ? banners.length - (activeBannersCount || 0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Masquées du site
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des bannières */}
      <Card>
        <CardHeader>
          <CardTitle>Bannières du Carrousel</CardTitle>
          <CardDescription>
            Glissez-déposez pour réorganiser l'ordre d'affichage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!banners || banners.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune bannière</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre première bannière pour le carrousel
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une bannière
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <BannerCard
                  key={banner._id}
                  banner={banner}
                  onEdit={() => setEditingBanner(banner)}
                  onDelete={() => handleDelete(banner._id)}
                  onToggleStatus={() => handleToggleStatus(banner._id)}
                  onDuplicate={() => handleDuplicate(banner)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout/édition */}
      {(showAddModal || editingBanner) && (
        <BannerFormModal
          banner={editingBanner}
          userId={userId}
          onClose={() => {
            setShowAddModal(false)
            setEditingBanner(null)
          }}
          existingBanners={banners || []}
        />
      )}
    </div>
  )
}

// Composant carte de bannière
const BannerCard = ({ banner, onEdit, onDelete, onToggleStatus, onDuplicate }) => {
  // Récupérer l'URL de l'image depuis Convex storage si imageStorageId existe
  const imageUrl = useQuery(
    banner.imageStorageId ? api.files.getFileUrl : 'skip',
    banner.imageStorageId ? { storageId: banner.imageStorageId } : 'skip'
  )

  return (
    <Card className={`${!banner.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Drag Handle */}
          <div className="flex items-center">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            <Badge variant="outline" className="ml-2">
              {banner.order}
            </Badge>
          </div>

          {/* Aperçu image */}
          <div 
            className="w-32 h-20 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: banner.backgroundColor }}
          >
            {(imageUrl || banner.imageUrl) ? (
              <img 
                src={imageUrl || banner.imageUrl} 
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold truncate">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
                )}
                {banner.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {banner.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {banner.buttonText && (
                    <Badge variant="secondary" className="text-xs">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      {banner.buttonText}
                    </Badge>
                  )}
                  <Badge 
                    variant={banner.isActive ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {banner.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleStatus}
                  title={banner.isActive ? 'Désactiver' : 'Activer'}
                >
                  {banner.isActive ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  title="Modifier"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDuplicate}
                  title="Dupliquer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  title="Supprimer"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Modal de formulaire
const BannerFormModal = ({ banner, userId, onClose, existingBanners }) => {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    description: banner?.description || '',
    imageUrl: banner?.imageUrl || '',
    imageStorageId: banner?.imageStorageId || '',
    buttonText: banner?.buttonText || 'Commander',
    buttonLink: banner?.buttonLink || '/marketplace',
    backgroundColor: banner?.backgroundColor || '#f3f4f6',
    textColor: banner?.textColor || '#1f2937',
    order: banner?.order || (existingBanners.length + 1),
    isActive: banner?.isActive !== undefined ? banner.isActive : true,
  })

  const createBanner = useMutation(api.functions.mutations.homeCarousel.createBanner)
  const updateBanner = useMutation(api.functions.mutations.homeCarousel.updateBanner)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  
  // Récupérer l'URL de l'image existante depuis Convex storage
  const existingImageUrl = useQuery(
    banner?.imageStorageId ? api.files.getFileUrl : 'skip',
    banner?.imageStorageId ? { storageId: banner.imageStorageId } : 'skip'
  )
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(existingImageUrl || banner?.imageUrl || '')

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5 MB')
      return
    }

    setIsUploading(true)

    try {
      // Générer l'URL d'upload
      const uploadUrl = await generateUploadUrl()

      // Upload le fichier
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      const { storageId } = await result.json()

      // Créer un aperçu local
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Mettre à jour le formData
      setFormData(prev => ({
        ...prev,
        imageStorageId: storageId,
        imageUrl: '' // Effacer l'URL si une image est uploadée
      }))

      console.log('Image uploadée avec succès:', storageId)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageStorageId: '',
      imageUrl: ''
    }))
    setImagePreview('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (banner) {
        // Mise à jour
        await updateBanner({
          bannerId: banner._id,
          ...formData,
          userId,
        })
      } else {
        // Création
        await createBanner({
          ...formData,
          userId,
        })
      }
      onClose()
    } catch (error) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white relative">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {banner ? 'Modifier la bannière' : 'Nouvelle bannière'}
              </CardTitle>
              <CardDescription>
                Configurez les détails de la bannière du carrousel
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Titre <span className="text-gray-400 text-xs">(optionnel)</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Livraison Gratuite"
              />
            </div>

            {/* Sous-titre */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Sous-titre
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: dès 50€ d'achat partout en France"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Description détaillée..."
              />
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Image de la bannière <span className="text-gray-400 text-xs">(optionnel)</span>
              </label>
              
              {/* Aperçu de l'image */}
              {imagePreview && (
                <div className="mb-3 relative">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    className="w-full h-48 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Bouton d'upload */}
              {!imagePreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
                        <p className="text-sm text-gray-600">Upload en cours...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Cliquez pour uploader une image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, WebP jusqu'à 5 MB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                <strong>Dimensions optimales :</strong> 1920x400px (ratio 4.8:1) • Format : WebP ou JPG • Max : 5 MB
              </p>
              <p className="text-xs text-blue-600 mt-1">
                💡 Tous les champs sont optionnels. Vous pouvez créer une bannière avec uniquement une couleur de fond.
              </p>
            </div>

            {/* Bouton CTA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Texte du bouton <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Commander"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Lien du bouton <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="/marketplace"
                />
              </div>
            </div>

            {/* Couleurs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Couleur de fond
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="h-10 w-20 border rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Couleur du texte
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="h-10 w-20 border rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Ordre et Statut */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ordre d'affichage *
                </label>
                <select
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>Position {num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Statut
                </label>
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Bannière active</span>
                </label>
              </div>
            </div>

            {/* Aperçu */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Aperçu
              </label>
              <div 
                className="w-full h-32 rounded-md flex items-center justify-center p-4"
                style={{ 
                  backgroundColor: formData.backgroundColor,
                  color: formData.textColor 
                }}
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold">{formData.title || 'Titre'}</h3>
                  {formData.subtitle && (
                    <p className="text-sm mt-1">{formData.subtitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : (banner ? 'Mettre à jour' : 'Créer')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default HomeCarouselModule
