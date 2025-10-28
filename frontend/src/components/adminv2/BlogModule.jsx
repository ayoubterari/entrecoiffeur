import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  Calendar,
  Tag as TagIcon,
  Folder,
  Save,
  X
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

const BlogModule = ({ userEmail }) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: '',
    tags: '',
    featured: false,
    status: 'draft',
    seoTitle: '',
    seoDescription: ''
  })

  // Queries
  const articles = useQuery(api.functions.queries.blog.getAllArticlesForAdmin, {
    userEmail: userEmail
  })

  // Mutations
  const createArticle = useMutation(api.functions.mutations.blog.createArticle)
  const updateArticle = useMutation(api.functions.mutations.blog.updateArticle)
  const deleteArticle = useMutation(api.functions.mutations.blog.deleteArticle)

  // Filtrer les articles
  const filteredArticles = articles?.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Statistiques
  const stats = {
    total: articles?.length || 0,
    published: articles?.filter(a => a.status === 'published').length || 0,
    draft: articles?.filter(a => a.status === 'draft').length || 0,
    featured: articles?.filter(a => a.featured).length || 0,
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const articleData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      }

      if (editingArticle) {
        await updateArticle({
          articleId: editingArticle._id,
          userEmail: userEmail,
          ...articleData
        })
      } else {
        await createArticle({
          ...articleData,
          userEmail: userEmail
        })
      }

      // Reset form
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        category: '',
        tags: '',
        featured: false,
        status: 'draft',
        seoTitle: '',
        seoDescription: ''
      })
      setShowCreateForm(false)
      setEditingArticle(null)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleEdit = (article) => {
    setEditingArticle(article)
    setFormData({
      title: article.title || '',
      excerpt: article.excerpt || '',
      content: article.content || '',
      featuredImage: article.featuredImage || '',
      category: article.category || '',
      tags: article.tags ? article.tags.join(', ') : '',
      featured: article.featured || false,
      status: article.status || 'draft',
      seoTitle: article.seoTitle || '',
      seoDescription: article.seoDescription || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (articleId) => {
    try {
      await deleteArticle({ 
        articleId,
        userEmail: userEmail
      })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const variants = {
      draft: { label: 'Brouillon', variant: 'outline', color: 'text-orange-500' },
      published: { label: 'Publié', variant: 'default', color: 'text-green-500' },
      archived: { label: 'Archivé', variant: 'secondary', color: 'text-gray-500' }
    }
    const config = variants[status] || variants.draft
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blog</h2>
          <p className="text-muted-foreground">
            Gérez les articles de blog de la plateforme
          </p>
        </div>
        <Button onClick={() => {
          setShowCreateForm(true)
          setEditingArticle(null)
          setFormData({
            title: '',
            excerpt: '',
            content: '',
            featuredImage: '',
            category: '',
            tags: '',
            featured: false,
            status: 'draft',
            seoTitle: '',
            seoDescription: ''
          })
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel Article
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiés</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">en ligne</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">en attente</p>
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
      </div>

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des articles</CardTitle>
          <CardDescription>
            Recherchez et gérez vos articles de blog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Liste des articles */}
          {filteredArticles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <Card key={article._id} className="overflow-hidden">
                  {article.featuredImage && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={article.featuredImage} 
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(article.status)}
                      {article.featured && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" />
                          Vedette
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 text-base">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {article.category && (
                        <div className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          {article.category}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.createdAt)}
                      </div>
                    </div>

                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(article)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(article._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucun article trouvé</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez par créer votre premier article de blog
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer le premier article
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création/édition */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArticle ? 'Modifier l\'article' : 'Nouvel Article'}
            </DialogTitle>
            <DialogDescription>
              {editingArticle ? 'Modifiez les informations de l\'article' : 'Créez un nouvel article de blog'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'article *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Entrez le titre de votre article..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Résumé *</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Résumé court de l'article..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu de l'article *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Rédigez le contenu complet de votre article..."
                  rows={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featuredImage">URL de l'image principale</Label>
                <Input
                  id="featuredImage"
                  name="featuredImage"
                  type="url"
                  value={formData.featuredImage}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tendances">Tendances</SelectItem>
                      <SelectItem value="beaute">Beauté</SelectItem>
                      <SelectItem value="maquillage">Maquillage</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="naturel">Naturel</SelectItem>
                      <SelectItem value="formation">Formation</SelectItem>
                      <SelectItem value="conseils">Conseils</SelectItem>
                      <SelectItem value="actualites">Actualités</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({...prev, status: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="coiffure, beauté, tendances"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, featured: checked}))}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Article en vedette
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoTitle">Titre SEO</Label>
                <Input
                  id="seoTitle"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  placeholder="Titre optimisé pour les moteurs de recherche..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">Description SEO</Label>
                <Textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  placeholder="Description pour les moteurs de recherche (160 caractères max)..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingArticle(null)
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {editingArticle ? 'Mettre à jour' : 'Créer l\'article'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BlogModule
