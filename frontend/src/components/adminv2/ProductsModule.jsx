import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  Package, 
  PackagePlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Star,
  Tag,
  AlertCircle,
  Image as ImageIcon
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

const ProductsModule = () => {
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Convex queries et mutations
  const allProducts = useQuery(api.products.getProducts, { limit: 1000 })
  const categories = useQuery(api.products.getCategories)
  const createProduct = useMutation(api.products.createProduct)
  const updateProduct = useMutation(api.products.updateProduct)
  const deleteProduct = useMutation(api.products.deleteProduct)

  // État du formulaire
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    images: [],
    stock: '',
    brand: '',
    isOnSale: false,
    salePrice: '',
    isFeatured: false
  })

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
    featured: allProducts?.filter(p => p.isFeatured).length || 0,
    onSale: allProducts?.filter(p => p.isOnSale).length || 0,
    lowStock: allProducts?.filter(p => (p.stock || 0) < 10).length || 0,
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    try {
      await createProduct({
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : undefined,
        images: productForm.images.length > 0 ? productForm.images : ['https://via.placeholder.com/300x300?text=Produit']
      })
      
      setProductForm({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        images: [],
        stock: '',
        brand: '',
        isOnSale: false,
        salePrice: '',
        isFeatured: false
      })
      setShowAddProduct(false)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: '',
      images: product.images || [],
      stock: product.stock?.toString() || '0',
      brand: product.brand || '',
      isOnSale: product.isOnSale || false,
      salePrice: product.salePrice?.toString() || '',
      isFeatured: product.isFeatured || false
    })
    setShowEditProduct(true)
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      await updateProduct({
        productId: editingProduct._id,
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : undefined
      })
      
      setShowEditProduct(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
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
          <h2 className="text-3xl font-bold tracking-tight">Produits</h2>
          <p className="text-muted-foreground">
            Gérez tous les produits de la plateforme
          </p>
        </div>
        <Button onClick={() => setShowAddProduct(true)}>
          <PackagePlus className="mr-2 h-4 w-4" />
          Ajouter un produit
        </Button>
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
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                          <img 
                            src={product.images?.[0] || 'https://via.placeholder.com/60x60?text=📦'} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
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
                          {product.isOnSale && product.salePrice ? (
                            <>
                              <span className="font-bold text-green-600">
                                {formatPrice(product.salePrice)}
                              </span>
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.price)}
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
                        <div className="flex flex-wrap gap-1">
                          {product.isFeatured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Vedette
                            </Badge>
                          )}
                          {product.isOnSale && (
                            <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
                              <Tag className="h-3 w-3 mr-1" />
                              Promo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product)}
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

      {/* Modal d'ajout */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Créez un nouveau produit dans le catalogue
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="brand">Marque</Label>
                  <Input
                    id="brand"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  required
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={productForm.categoryId} onValueChange={(value) => setProductForm({...productForm, categoryId: value})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isOnSale"
                    checked={productForm.isOnSale}
                    onCheckedChange={(checked) => setProductForm({...productForm, isOnSale: checked})}
                  />
                  <Label htmlFor="isOnSale" className="cursor-pointer">En promotion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={productForm.isFeatured}
                    onCheckedChange={(checked) => setProductForm({...productForm, isFeatured: checked})}
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">Mettre en avant</Label>
                </div>
              </div>
              
              {productForm.isOnSale && (
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Prix de promotion (€)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({...productForm, salePrice: e.target.value})}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer le produit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de modification */}
      <Dialog open={showEditProduct} onOpenChange={setShowEditProduct}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="edit-brand">Marque</Label>
                  <Input
                    id="edit-brand"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  required
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isOnSale"
                    checked={productForm.isOnSale}
                    onCheckedChange={(checked) => setProductForm({...productForm, isOnSale: checked})}
                  />
                  <Label htmlFor="edit-isOnSale" className="cursor-pointer">En promotion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isFeatured"
                    checked={productForm.isFeatured}
                    onCheckedChange={(checked) => setProductForm({...productForm, isFeatured: checked})}
                  />
                  <Label htmlFor="edit-isFeatured" className="cursor-pointer">Mettre en avant</Label>
                </div>
              </div>
              
              {productForm.isOnSale && (
                <div className="space-y-2">
                  <Label htmlFor="edit-salePrice">Prix de promotion (€)</Label>
                  <Input
                    id="edit-salePrice"
                    type="number"
                    step="0.01"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({...productForm, salePrice: e.target.value})}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditProduct(false)}>
                Annuler
              </Button>
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
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
