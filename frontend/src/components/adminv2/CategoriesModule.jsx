import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen
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
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'

const CategoriesModule = () => {
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showEditCategory, setShowEditCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState(new Set())

  // Convex queries et mutations
  const categories = useQuery(api.products.getCategories)
  const mainCategories = useQuery(api.products.getMainCategories)
  const createCategory = useMutation(api.products.createCategory)
  const updateCategory = useMutation(api.products.updateCategory)
  const deleteCategory = useMutation(api.products.deleteCategory)

  // État du formulaire
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '',
    description: '',
    parentCategoryId: null,
    isSubcategory: false
  })

  // Icônes prédéfinies pour produits de coiffure
  const predefinedIcons = [
    // Outils de coiffure
    '✂️', '🪒', '💇', '💇‍♀️', '💇‍♂️', '💆', '💆‍♀️', '💆‍♂️',
    // Produits capillaires
    '🧴', '🧼', '🧽', '🧪', '💧', '🫧', '🧊', '💦',
    // Soins et beauté
    '💄', '💅', '💋', '👄', '💖', '💗', '💓', '💝',
    // Appareils électriques
    '🔌', '⚡', '🔥', '💨', '🌡️', '⏱️', '🔋', '💡',
    // Accessoires
    '🎀', '🪮', '🎗️', '🏷️', '📌', '📍', '🔖', '✨',
    // Couleurs et teintures
    '🎨', '🖌️', '🌈', '🎭', '🖍️', '✏️', '🖊️', '🖋️',
    // Parfums et senteurs
    '🌸', '🌺', '🌹', '🌷', '🌻', '🌼', '💐', '🏵️',
    // Premium et luxe
    '👑', '💎', '💍', '⭐', '🌟', '✨', '🔆', '💫',
    // Hygiène et propreté
    '🧹', '🧺', '🧻', '🧯', '🧴', '🧼', '🫧', '💧',
    // Catégories générales
    '📦', '🎁', '🛍️', '🏪', '🏬', '🎯', '🎪', '🎫',
    // Nature et bio
    '🌿', '🍃', '🌱', '🌾', '🌳', '🌲', '🍀', '☘️',
    // Spécial et nouveauté
    '🆕', '🔥', '⚡', '💥', '🎉', '🎊', '🎈', '🎆'
  ]

  // Filtrer les catégories
  const filteredMainCategories = mainCategories?.filter(category => 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Statistiques
  const stats = {
    total: categories?.length || 0,
    main: mainCategories?.length || 0,
    sub: categories?.filter(c => c.parentCategoryId).length || 0,
    withIcons: categories?.filter(c => c.icon && c.icon !== '📦').length || 0,
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    
    if (!categoryForm.name.trim()) {
      return
    }
    
    try {
      await createCategory({
        name: categoryForm.name.trim(),
        icon: categoryForm.icon || '📦',
        description: categoryForm.description.trim(),
        parentCategoryId: categoryForm.isSubcategory ? categoryForm.parentCategoryId : undefined,
        level: categoryForm.isSubcategory ? 1 : 0
      })
      
      setCategoryForm({
        name: '',
        icon: '',
        description: '',
        parentCategoryId: null,
        isSubcategory: false
      })
      setShowAddCategory(false)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      icon: category.icon,
      description: category.description || '',
      parentCategoryId: category.parentCategoryId || null,
      isSubcategory: !!category.parentCategoryId
    })
    setShowEditCategory(true)
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    
    if (!categoryForm.name.trim()) {
      return
    }
    
    try {
      await updateCategory({
        categoryId: editingCategory._id,
        name: categoryForm.name.trim(),
        icon: categoryForm.icon || '📦',
        description: categoryForm.description.trim()
      })
      
      setShowEditCategory(false)
      setEditingCategory(null)
      setCategoryForm({
        name: '',
        icon: '',
        description: '',
        parentCategoryId: null,
        isSubcategory: false
      })
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
    }
  }

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    try {
      await deleteCategory({ categoryId: categoryToDelete._id })
      setShowDeleteConfirm(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const toggleExpand = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catégories</h2>
          <p className="text-muted-foreground">
            Organisez vos produits par catégories
          </p>
        </div>
        <Button onClick={() => setShowAddCategory(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">catégories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Principales</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.main}</div>
            <p className="text-xs text-muted-foreground">catégories principales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sous-catégories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sub}</div>
            <p className="text-xs text-muted-foreground">sous-catégories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avec icônes</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withIcons}</div>
            <p className="text-xs text-muted-foreground">personnalisées</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des catégories</CardTitle>
          <CardDescription>
            Gérez vos catégories et sous-catégories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Liste hiérarchique */}
          {filteredMainCategories.length > 0 ? (
            <div className="space-y-2">
              {filteredMainCategories.map((category) => {
                const subcategories = categories?.filter(c => c.parentCategoryId === category._id) || []
                const isExpanded = expandedCategories.has(category._id)
                
                return (
                  <div key={category._id} className="rounded-lg border">
                    {/* Catégorie principale */}
                    <div className="flex items-center gap-3 p-4">
                      {subcategories.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleExpand(category._id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                        {category.icon || '📦'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{category.name}</h4>
                          {subcategories.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {subcategories.length} sous-catégorie{subcategories.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCategoryForm({
                              name: '',
                              icon: '',
                              description: '',
                              parentCategoryId: category._id,
                              isSubcategory: true
                            })
                            setShowAddCategory(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Sous-catégorie
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Sous-catégories */}
                    {isExpanded && subcategories.length > 0 && (
                      <div className="border-t bg-muted/30 p-2">
                        <div className="space-y-1">
                          {subcategories.map((subcat) => (
                            <div
                              key={subcat._id}
                              className="flex items-center gap-3 rounded-md bg-background p-3 ml-8"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-lg">
                                {subcat.icon || '📦'}
                              </div>
                              
                              <div className="flex-1">
                                <h5 className="text-sm font-medium">{subcat.name}</h5>
                                {subcat.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {subcat.description}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCategory(subcat)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Modifier
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(subcat)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucune catégorie trouvée</h3>
              <p className="text-sm text-muted-foreground">
                Commencez par créer des catégories principales.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie</DialogTitle>
            <DialogDescription>
              Créez une nouvelle catégorie ou sous-catégorie
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la catégorie *</Label>
                <Input
                  id="name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  placeholder="Ex: Shampoings"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  placeholder="Description de la catégorie..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isSubcategory"
                  checked={categoryForm.isSubcategory}
                  onCheckedChange={(checked) => setCategoryForm({...categoryForm, isSubcategory: checked, parentCategoryId: null})}
                />
                <Label htmlFor="isSubcategory" className="cursor-pointer">
                  C'est une sous-catégorie
                </Label>
              </div>
              
              {categoryForm.isSubcategory && (
                <div className="space-y-2">
                  <Label htmlFor="parent">Catégorie parente *</Label>
                  <Select 
                    value={categoryForm.parentCategoryId || ''} 
                    onValueChange={(value) => setCategoryForm({...categoryForm, parentCategoryId: value || null})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie parente" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainCategories?.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="icon">Icône</Label>
                <Input
                  id="icon"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                  placeholder="Emoji ou icône"
                />
                
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Icônes suggérées :</p>
                  <div className="grid grid-cols-12 gap-2">
                    {predefinedIcons.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`flex h-10 w-10 items-center justify-center rounded-md border-2 text-xl transition-colors hover:bg-accent ${
                          categoryForm.icon === icon ? 'border-primary bg-primary/10' : 'border-transparent'
                        }`}
                        onClick={() => setCategoryForm({...categoryForm, icon})}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer la catégorie</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de modification */}
      <Dialog open={showEditCategory} onOpenChange={setShowEditCategory}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la catégorie
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom de la catégorie *</Label>
                <Input
                  id="edit-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-icon">Icône</Label>
                <Input
                  id="edit-icon"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                />
                
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Icônes suggérées :</p>
                  <div className="grid grid-cols-12 gap-2">
                    {predefinedIcons.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`flex h-10 w-10 items-center justify-center rounded-md border-2 text-xl transition-colors hover:bg-accent ${
                          categoryForm.icon === icon ? 'border-primary bg-primary/10' : 'border-transparent'
                        }`}
                        onClick={() => setCategoryForm({...categoryForm, icon})}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditCategory(false)}>
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
            <DialogTitle>Supprimer la catégorie</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              {categoryToDelete?.parentCategoryId ? 'cette sous-catégorie' : 'cette catégorie'} ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                {categoryToDelete?.icon || '📦'}
              </div>
              <div>
                <h4 className="font-semibold">{categoryToDelete?.name}</h4>
                {categoryToDelete?.parentCategoryId && (
                  <Badge variant="secondary" className="mt-1">Sous-catégorie</Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-destructive mt-4">
              ⚠️ Cette action est irréversible. 
              {!categoryToDelete?.parentCategoryId && ' Les produits de cette catégorie devront être recatégorisés.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCategory}>
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CategoriesModule
