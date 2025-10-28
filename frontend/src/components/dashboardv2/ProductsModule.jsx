import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Search, X, Package, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import ImageUpload from '../ImageUpload'
import ProductImageDisplay from '../ProductImageDisplay'

const ProductsModule = ({ userId, userType }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)
  const [productImages, setProductImages] = useState([])
  
  // Form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    parentCategoryId: '', // Catégorie principale
    stock: '',
    tags: '',
    featured: false,
    onSale: false
  })

  // Get categories and user products
  const categories = useQuery(api.products.getCategories)
  const userProducts = useQuery(api.products.getProductsBySeller, 
    userId ? { sellerId: userId } : "skip"
  )

  // Mutations
  const createProduct = useMutation(api.products.createProduct)
  const updateProduct = useMutation(api.products.updateProduct)
  const deleteProduct = useMutation(api.products.deleteProduct)

  // Check permissions
  const canAddProduct = () => {
    if (!userType) return false
    if (userType === 'particulier') return false
    if (userType === 'professionnel') {
      const currentProductCount = userProducts?.length || 0
      return currentProductCount < 2
    }
    if (userType === 'grossiste') return true
    return false
  }

  const getLimitationMessage = () => {
    if (userType === 'particulier') {
      return "Les particuliers ne peuvent pas vendre de produits. Vous pouvez uniquement acheter."
    }
    if (userType === 'professionnel') {
      const currentProductCount = userProducts?.length || 0
      if (currentProductCount >= 2) {
        return "Limite atteinte : Les professionnels peuvent ajouter maximum 2 produits."
      }
      return `Vous pouvez ajouter ${2 - currentProductCount} produit(s) supplémentaire(s).`
    }
    if (userType === 'grossiste') {
      return "En tant que grossiste, vous pouvez ajouter un nombre illimité de produits."
    }
    return ""
  }

  // Filter products
  const filteredProducts = userProducts?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFilter = true
    if (statusFilter === 'featured') matchesFilter = product.featured
    else if (statusFilter === 'onSale') matchesFilter = product.onSale
    else if (statusFilter === 'inStock') matchesFilter = product.stock > 0
    else if (statusFilter === 'outOfStock') matchesFilter = product.stock === 0
    else if (statusFilter === 'lowStock') matchesFilter = product.stock > 0 && product.stock <= 10
    
    return matchesSearch && matchesFilter
  })

  // Reset form
  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      parentCategoryId: '',
      stock: '',
      tags: '',
      featured: false,
      onSale: false
    })
    setProductImages([])
  }

  // Handle add product
  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!userId) return

    if (productImages.length === 0) {
      alert('Veuillez ajouter au moins une image du produit')
      return
    }

    try {
      const imageStorageIds = productImages.map(img => img.storageId)
      
      // Utiliser la sous-catégorie si sélectionnée, sinon la catégorie principale
      const finalCategoryId = productForm.categoryId || productForm.parentCategoryId
      
      await createProduct({
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        categoryId: finalCategoryId,
        sellerId: userId,
        stock: parseInt(productForm.stock),
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: imageStorageIds,
        featured: productForm.featured,
        onSale: productForm.onSale
      })
      
      resetForm()
      setShowAddDialog(false)
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error)
      alert('Erreur lors de la création du produit')
    }
  }

  // Handle edit product
  const handleEditClick = (product) => {
    setEditingProduct(product)
    
    // Trouver la catégorie du produit pour déterminer si c'est une sous-catégorie
    const productCategory = categories?.find(cat => cat._id === product.categoryId)
    const isSubcategory = productCategory?.parentCategoryId
    
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      categoryId: isSubcategory ? product.categoryId : '',
      parentCategoryId: isSubcategory ? productCategory.parentCategoryId : product.categoryId,
      stock: product.stock.toString(),
      tags: product.tags?.join(', ') || '',
      featured: product.featured || false,
      onSale: product.onSale || false
    })
    
    const existingImages = product.images?.map((imageId, index) => ({
      storageId: imageId,
      name: `Image ${index + 1}`,
      size: 0,
      type: 'image/jpeg',
      previewUrl: null
    })) || []
    
    setProductImages(existingImages)
    setShowEditDialog(true)
  }

  // Handle update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const imageStorageIds = productImages.map(img => img.storageId)
      
      // Utiliser la sous-catégorie si sélectionnée, sinon la catégorie principale
      const finalCategoryId = productForm.categoryId || productForm.parentCategoryId
      
      await updateProduct({
        productId: editingProduct._id,
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        categoryId: finalCategoryId,
        stock: parseInt(productForm.stock),
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: imageStorageIds,
        featured: productForm.featured,
        onSale: productForm.onSale
      })
      
      resetForm()
      setShowEditDialog(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      alert('Erreur lors de la modification du produit')
    }
  }

  // Handle delete product
  const handleDeleteClick = (product) => {
    setProductToDelete(product)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct({ productId: productToDelete._id })
      setShowDeleteDialog(false)
      setProductToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du produit')
    }
  }

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge variant="destructive">❌ Rupture</Badge>
    if (stock <= 10) return <Badge variant="warning">⚠️ Stock faible ({stock})</Badge>
    return <Badge variant="success">✅ En stock ({stock})</Badge>
  }

  const filterButtons = [
    { id: 'all', label: 'Tous', icon: '📋' },
    { id: 'featured', label: 'Vedettes', icon: '⭐' },
    { id: 'onSale', label: 'Promos', icon: '🔥' },
    { id: 'inStock', label: 'En stock', icon: '✅' },
    { id: 'lowStock', label: 'Stock faible', icon: '⚠️' },
    { id: 'outOfStock', label: 'Rupture', icon: '❌' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Mes Produits</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez votre catalogue de produits
          </p>
          {/* Limitation info */}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={userType === 'grossiste' ? 'default' : 'secondary'}>
              {userType === 'professionnel' && '💼 Professionnel'}
              {userType === 'grossiste' && '🏢 Grossiste'}
            </Badge>
            <span className="text-sm text-muted-foreground">{getLimitationMessage()}</span>
          </div>
        </div>
        {canAddProduct() && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Button>
        )}
        {!canAddProduct() && userType !== 'particulier' && (
          <Button disabled variant="outline">
            🚫 Limite atteinte
          </Button>
        )}
      </div>

      {/* Empty state for particulier */}
      {userType === 'particulier' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-6">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Vente non disponible</h3>
            <p className="mb-4 text-sm text-muted-foreground max-w-md">
              En tant que particulier, vous ne pouvez pas vendre de produits. Explorez notre marketplace pour faire vos achats !
            </p>
            <Button onClick={() => navigate('/')}>
              <Package className="mr-2 h-4 w-4" />
              Parcourir les produits
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Products list for pro/grossiste */}
      {userType !== 'particulier' && (
        <>
          {/* Filters */}
          {userProducts && userProducts.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Search */}
                  <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom, description..."
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
          )}

          {/* Products Table */}
          <Card>
            <CardContent className="pt-6">
              {filteredProducts && filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="h-16 w-16 overflow-hidden rounded-md">
                            <ProductImageDisplay 
                              images={product.images || []}
                              productName={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {product.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{product.price}€</div>
                          {product.originalPrice && (
                            <div className="text-xs text-muted-foreground line-through">
                              {product.originalPrice}€
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStockBadge(product.stock)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.categoryName || 'Non catégorisé'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {product.featured && <Badge variant="default">⭐</Badge>}
                            {product.onSale && <Badge variant="destructive">🔥</Badge>}
                            {!product.featured && !product.onSale && (
                              <Badge variant="secondary">Standard</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(product)}
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
              ) : userProducts && userProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-muted p-6">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Aucun produit ajouté</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Vous n'avez pas encore ajouté de produits à votre catalogue.
                  </p>
                  {canAddProduct() && (
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter votre premier produit
                    </Button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Aucun produit ne correspond à vos critères de recherche
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau produit</DialogTitle>
            <DialogDescription>
              Remplissez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentCategory">Catégorie principale *</Label>
                <select
                  id="parentCategory"
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={productForm.parentCategoryId}
                  onChange={(e) => {
                    setProductForm({
                      ...productForm, 
                      parentCategoryId: e.target.value,
                      categoryId: '' // Reset sous-catégorie
                    })
                  }}
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories?.filter(cat => !cat.parentCategoryId).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sous-catégorie (optionnelle, affichée seulement si catégorie principale sélectionnée) */}
              {productForm.parentCategoryId && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Sous-catégorie (optionnelle)</Label>
                  <select
                    id="subcategory"
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})}
                  >
                    <option value="">Aucune sous-catégorie</option>
                    {categories?.filter(subCat => subCat.parentCategoryId === productForm.parentCategoryId).map((subCat) => (
                      <option key={subCat._id} value={subCat._id}>
                        {subCat.icon} {subCat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                rows={3}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Prix original (€)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
              <Input
                id="tags"
                value={productForm.tags}
                onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                placeholder="ex: professionnel, bio, cheveux secs"
              />
            </div>

            <div className="space-y-2">
              <Label>Images du produit *</Label>
              <ImageUpload 
                images={productImages}
                onImagesChange={setProductImages}
                maxImages={5}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={productForm.featured}
                  onCheckedChange={(checked) => setProductForm({...productForm, featured: checked})}
                />
                <Label htmlFor="featured" className="cursor-pointer">Produit en vedette</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="onSale"
                  checked={productForm.onSale}
                  onCheckedChange={(checked) => setProductForm({...productForm, onSale: checked})}
                />
                <Label htmlFor="onSale" className="cursor-pointer">En promotion</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false)
                resetForm()
              }}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer le produit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom du produit *</Label>
                <Input
                  id="edit-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parentCategory">Catégorie principale *</Label>
                <select
                  id="edit-parentCategory"
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={productForm.parentCategoryId}
                  onChange={(e) => {
                    setProductForm({
                      ...productForm, 
                      parentCategoryId: e.target.value,
                      categoryId: '' // Reset sous-catégorie
                    })
                  }}
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories?.filter(cat => !cat.parentCategoryId).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sous-catégorie (optionnelle) */}
              {productForm.parentCategoryId && (
                <div className="space-y-2">
                  <Label htmlFor="edit-subcategory">Sous-catégorie (optionnelle)</Label>
                  <select
                    id="edit-subcategory"
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})}
                  >
                    <option value="">Aucune sous-catégorie</option>
                    {categories?.filter(subCat => subCat.parentCategoryId === productForm.parentCategoryId).map((subCat) => (
                      <option key={subCat._id} value={subCat._id}>
                        {subCat.icon} {subCat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                rows={3}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Prix (€) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-originalPrice">Prix original (€)</Label>
                <Input
                  id="edit-originalPrice"
                  type="number"
                  step="0.01"
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (séparés par des virgules)</Label>
              <Input
                id="edit-tags"
                value={productForm.tags}
                onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                placeholder="ex: professionnel, bio, cheveux secs"
              />
            </div>

            <div className="space-y-2">
              <Label>Images du produit *</Label>
              <ImageUpload 
                images={productImages}
                onImagesChange={setProductImages}
                maxImages={5}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-featured"
                  checked={productForm.featured}
                  onCheckedChange={(checked) => setProductForm({...productForm, featured: checked})}
                />
                <Label htmlFor="edit-featured" className="cursor-pointer">Produit en vedette</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-onSale"
                  checked={productForm.onSale}
                  onCheckedChange={(checked) => setProductForm({...productForm, onSale: checked})}
                />
                <Label htmlFor="edit-onSale" className="cursor-pointer">En promotion</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowEditDialog(false)
                setEditingProduct(null)
                resetForm()
              }}>
                Annuler
              </Button>
              <Button type="submit">Sauvegarder les modifications</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit "{productToDelete?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false)
              setProductToDelete(null)
            }}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductsModule
