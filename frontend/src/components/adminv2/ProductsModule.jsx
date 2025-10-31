import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  Package, 
  Search, 
  Filter, 
  Trash2, 
  Star,
  Tag,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  MapPin
} from 'lucide-react'
import { frenchCities } from '../../data/frenchCities'
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
import { Switch } from '../ui/switch'
import { Checkbox } from '../ui/checkbox'

// Component to display a single product image
const ProductImage = ({ imageId, productName, index }) => {
  // Try to get URL from Convex Storage if it's a storage ID
  const imageUrl = useQuery(
    typeof imageId === 'string' && !imageId.startsWith('http') 
      ? api.files.getFileUrl 
      : 'skip',
    typeof imageId === 'string' && !imageId.startsWith('http')
      ? { storageId: imageId }
      : 'skip'
  )

  // Determine the actual URL to display
  const displayUrl = typeof imageId === 'string' && imageId.startsWith('http') 
    ? imageId 
    : imageUrl

  if (!displayUrl) {
    return (
      <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
      <img 
        src={displayUrl} 
        alt={`${productName} - ${index + 1}`}
        className="h-full w-full object-cover"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/200x200?text=Image+non+disponible'
        }}
      />
    </div>
  )
}

// Component to display product thumbnail in table
const ProductThumbnail = ({ imageId, productName }) => {
  // Try to get URL from Convex Storage if it's a storage ID
  const imageUrl = useQuery(
    imageId && typeof imageId === 'string' && !imageId.startsWith('http') 
      ? api.files.getFileUrl 
      : 'skip',
    imageId && typeof imageId === 'string' && !imageId.startsWith('http')
      ? { storageId: imageId }
      : 'skip'
  )

  // Determine the actual URL to display
  const displayUrl = imageId && typeof imageId === 'string' && imageId.startsWith('http') 
    ? imageId 
    : imageUrl

  return (
    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
      {displayUrl ? (
        <img 
          src={displayUrl} 
          alt={productName}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentElement.innerHTML = '<div class="text-2xl">📦</div>'
          }}
        />
      ) : (
        <div className="text-2xl">📦</div>
      )}
    </div>
  )
}

const ProductsModule = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Convex queries et mutations
  const allProducts = useQuery(api.products.getProducts, { 
    limit: 1000,
    skipVisibilityFilter: true // Admin voit tous les produits
  })
  const categories = useQuery(api.products.getCategories)
  const deleteProduct = useMutation(api.products.deleteProduct)
  const toggleProductVisibility = useMutation(api.products.toggleProductVisibility)
  const toggleProductFeatured = useMutation(api.products.toggleProductFeatured)
  const toggleProductFlashSale = useMutation(api.products.toggleProductFlashSale)

  // État pour les actions en cours
  const [loadingActions, setLoadingActions] = useState({})

  // Filtrer les produits
  const filteredProducts = allProducts?.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesCategory
  }) || []

  // Statistiques
  const stats = {
    total: allProducts?.length || 0,
    featured: allProducts?.filter(p => p.featured).length || 0,
    onSale: allProducts?.filter(p => p.onSale).length || 0,
    lowStock: allProducts?.filter(p => (p.stock || 0) < 10).length || 0,
  }

  const handleToggleVisibility = async (productId, currentVisibility) => {
    setLoadingActions(prev => ({ ...prev, [`visibility-${productId}`]: true }))
    try {
      await toggleProductVisibility({ 
        productId, 
        isVisible: !currentVisibility 
      })
    } catch (error) {
      console.error('Erreur lors du changement de visibilité:', error)
    } finally {
      setLoadingActions(prev => ({ ...prev, [`visibility-${productId}`]: false }))
    }
  }

  const handleToggleFeatured = async (productId, currentFeatured) => {
    setLoadingActions(prev => ({ ...prev, [`featured-${productId}`]: true }))
    try {
      await toggleProductFeatured({ 
        productId, 
        isFeatured: !currentFeatured 
      })
    } catch (error) {
      console.error('Erreur lors du changement de vedette:', error)
    } finally {
      setLoadingActions(prev => ({ ...prev, [`featured-${productId}`]: false }))
    }
  }

  const handleToggleFlashSale = async (productId, currentFlashSale) => {
    setLoadingActions(prev => ({ ...prev, [`flash-${productId}`]: true }))
    try {
      await toggleProductFlashSale({ 
        productId, 
        onSale: !currentFlashSale 
      })
    } catch (error) {
      console.error('Erreur lors du changement de vente flash:', error)
    } finally {
      setLoadingActions(prev => ({ ...prev, [`flash-${productId}`]: false }))
    }
  }

  const handleDeleteProduct = (product) => {
    setProductToDelete(product)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return
    
    try {
      await deleteProduct({ productId: productToDelete._id })
      setShowDeleteConfirm(false)
      setProductToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setShowProductDetails(true)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge variant="destructive">Rupture</Badge>
    if (stock < 10) return <Badge variant="outline" className="border-orange-500 text-orange-500">Stock faible</Badge>
    return <Badge variant="default" className="bg-green-500">En stock</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Produits</h2>
          <p className="text-muted-foreground">
            Validez la visibilité et classifiez les produits sur la plateforme
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">produits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En vedette</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featured}</div>
            <p className="text-xs text-muted-foreground">mis en avant</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En promotion</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onSale}</div>
            <p className="text-xs text-muted-foreground">en promo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">à réapprovisionner</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
          <CardDescription>
            Recherchez et filtrez les produits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, description, marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category._id} value={category.name}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          {filteredProducts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Visibilité</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <ProductThumbnail 
                          imageId={product.images?.[0]} 
                          productName={product.name}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                          {product.brand && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {product.brand}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {product.onSale && product.originalPrice ? (
                            <>
                              <span className="font-bold text-green-600">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium">{formatPrice(product.price)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStockBadge(product.stock || 0)}
                          <span className="text-xs text-muted-foreground">
                            {product.stock || 0} unités
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.isVisible !== false}
                            onCheckedChange={() => handleToggleVisibility(product._id, product.isVisible !== false)}
                            disabled={loadingActions[`visibility-${product._id}`]}
                          />
                          {product.isVisible !== false ? (
                            <Badge variant="default" className="bg-green-500">
                              <Eye className="h-3 w-3 mr-1" />
                              Visible
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Masqué
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant={product.featured ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggleFeatured(product._id, product.featured)}
                            disabled={loadingActions[`featured-${product._id}`]}
                            className="w-full justify-start"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {product.featured ? 'En vedette' : 'Mettre en vedette'}
                          </Button>
                          <Button
                            variant={product.onSale ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggleFlashSale(product._id, product.onSale)}
                            disabled={loadingActions[`flash-${product._id}`]}
                            className="w-full justify-start"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            {product.onSale ? 'Vente flash' : 'Ajouter vente flash'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewProduct(product)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucun produit trouvé</h3>
              <p className="text-sm text-muted-foreground">
                Aucun produit ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails du produit */}
      <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Détails du produit
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Images</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {selectedProduct.images.map((imageId, index) => (
                      <ProductImage 
                        key={index}
                        imageId={imageId}
                        productName={selectedProduct.name}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nom du produit</Label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Marque</Label>
                  <p className="font-medium">{selectedProduct.brand || 'Non spécifié'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Catégorie</Label>
                  <Badge variant="outline">{selectedProduct.category}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stock</Label>
                  <div className="flex items-center gap-2">
                    {getStockBadge(selectedProduct.stock || 0)}
                    <span className="text-sm">{selectedProduct.stock || 0} unités</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{selectedProduct.description}</p>
              </div>

              {/* Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Prix normal</Label>
                  <p className="text-lg font-bold">{formatPrice(selectedProduct.price)}</p>
                </div>
                {selectedProduct.onSale && selectedProduct.originalPrice && (
                  <div>
                    <Label className="text-muted-foreground">Prix en promotion</Label>
                    <p className="text-lg font-bold text-green-600">{formatPrice(selectedProduct.price)}</p>
                    <p className="text-sm text-muted-foreground line-through">{formatPrice(selectedProduct.originalPrice)}</p>
                  </div>
                )}
              </div>

              {/* Localisation */}
              {selectedProduct.city && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Localisation
                  </Label>
                  <p className="font-medium">{selectedProduct.city}</p>
                </div>
              )}

              {/* Statuts */}
              <div>
                <Label className="text-muted-foreground mb-2 block">Statuts</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.isVisible !== false ? (
                    <Badge variant="default" className="bg-green-500">
                      <Eye className="h-3 w-3 mr-1" />
                      Visible
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Masqué
                    </Badge>
                  )}
                  {selectedProduct.featured && (
                    <Badge variant="default">
                      <Star className="h-3 w-3 mr-1" />
                      En vedette
                    </Badge>
                  )}
                  {selectedProduct.onSale && (
                    <Badge variant="default">
                      <Zap className="h-3 w-3 mr-1" />
                      Vente flash
                    </Badge>
                  )}
                </div>
              </div>

              {/* Visibilité par type d'utilisateur */}
              <div>
                <Label className="text-muted-foreground mb-2 block">Visibilité par type d'utilisateur</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Particuliers</span>
                    {selectedProduct.visibleByParticulier ? (
                      <Badge variant="default" className="bg-green-500">Visible</Badge>
                    ) : (
                      <Badge variant="secondary">Masqué</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Professionnels</span>
                    {selectedProduct.visibleByProfessionnel !== false ? (
                      <Badge variant="default" className="bg-green-500">Visible</Badge>
                    ) : (
                      <Badge variant="secondary">Masqué</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Grossistes</span>
                    {selectedProduct.visibleByGrossiste !== false ? (
                      <Badge variant="default" className="bg-green-500">Visible</Badge>
                    ) : (
                      <Badge variant="secondary">Masqué</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations vendeur */}
              {selectedProduct.sellerId && (
                <div>
                  <Label className="text-muted-foreground">ID Vendeur</Label>
                  <p className="text-sm font-mono">{selectedProduct.sellerId}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                {selectedProduct.createdAt && (
                  <div>
                    <Label className="text-muted-foreground">Créé le</Label>
                    <p>{new Date(selectedProduct.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                )}
                {selectedProduct.updatedAt && (
                  <div>
                    <Label className="text-muted-foreground">Modifié le</Label>
                    <p>{new Date(selectedProduct.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDetails(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit{' '}
              <strong>{productToDelete?.name}</strong> ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-destructive">
              ⚠️ Cette action est irréversible.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProduct}>
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductsModule
