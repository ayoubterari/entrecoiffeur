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
  X
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
const BannerCard = ({ banner, onEdit, onDelete, onToggleStatus }) => {
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
            className="w-32 h-20 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: banner.backgroundColor }}
          >
            {banner.imageStorageId || banner.imageUrl ? (
              <div className="text-xs text-center" style={{ color: banner.textColor }}>
                Image
              </div>
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
    buttonText: banner?.buttonText || 'Commander',
    buttonLink: banner?.buttonLink || '/marketplace',
    backgroundColor: banner?.backgroundColor || '#f3f4f6',
    textColor: banner?.textColor || '#1f2937',
    order: banner?.order || (existingBanners.length + 1),
    isActive: banner?.isActive !== undefined ? banner.isActive : true,
  })

  const createBanner = useMutation(api.functions.mutations.homeCarousel.createBanner)
  const updateBanner = useMutation(api.functions.mutations.homeCarousel.updateBanner)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
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

            {/* URL Image */}
            <div>
              <label className="block text-sm font-medium mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Laissez vide pour utiliser uniquement la couleur de fond
              </p>
            </div>

            {/* Bouton CTA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Texte du bouton
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
                  Lien du bouton
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
