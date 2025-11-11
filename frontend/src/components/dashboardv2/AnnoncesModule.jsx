import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Package, Building2, Plus, ShoppingBag, Store, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react'
import ProductImageDisplay from '../ProductImageDisplay'
import ConvexImage from '../ConvexImage'
import ProductsModule from './ProductsModule'
import BusinessSalesModule from './BusinessSalesModule'

const AnnoncesModule = ({ userId, userType }) => {
  const [activeAnnouncementType, setActiveAnnouncementType] = useState('all')
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [showProductsModule, setShowProductsModule] = useState(false)
  const [showBusinessSalesModule, setShowBusinessSalesModule] = useState(false)

  // Récupérer les produits de l'utilisateur
  const userProducts = useQuery(api.products.getProductsBySeller, { sellerId: userId })
  
  // Récupérer les fonds de commerce de l'utilisateur
  const userBusinessSales = useQuery(api.functions.queries.businessSales.getSellerBusinessSales, { sellerId: userId })

  // Statistiques
  const totalProducts = userProducts?.length || 0
  const totalBusinessSales = userBusinessSales?.length || 0
  const totalAnnouncements = totalProducts + totalBusinessSales

  const activeProducts = userProducts?.filter(p => p.stock > 0).length || 0
  const activeBusinessSales = userBusinessSales?.filter(b => b.status === 'active').length || 0

  // Gérer l'ajout d'une nouvelle annonce
  const handleAddAnnouncement = (type) => {
    if (type === 'product') {
      setShowProductsModule(true)
    } else if (type === 'business') {
      setShowBusinessSalesModule(true)
    }
    setShowTypeSelector(false)
  }

  // Si on affiche le module produits
  if (showProductsModule) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowProductsModule(false)}
          className="mb-4"
        >
          ← Retour à Mes Annonces
        </Button>
        <ProductsModule userId={userId} userType={userType} />
      </div>
    )
  }

  // Si on affiche le module fonds de commerce
  if (showBusinessSalesModule) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowBusinessSalesModule(false)}
          className="mb-4"
        >
          ← Retour à Mes Annonces
        </Button>
        <BusinessSalesModule userId={userId} userType={userType} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Annonces</h1>
          <p className="text-muted-foreground">
            Gérez vos produits et fonds de commerce en un seul endroit
          </p>
        </div>
        
        <Button 
          size="lg" 
          onClick={() => setShowTypeSelector(true)}
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouvelle annonce
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annonces</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              {totalProducts} produits, {totalBusinessSales} fonds de commerce
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Actifs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              En stock et disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fonds de Commerce</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBusinessSales}</div>
            <p className="text-xs text-muted-foreground">
              Actifs et en ligne
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de sélection du type d'annonce */}
      {showTypeSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="text-2xl">Choisir le type d'annonce</CardTitle>
              <CardDescription>
                Sélectionnez le type d'annonce que vous souhaitez créer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Option Produit */}
                <button
                  onClick={() => handleAddAnnouncement('product')}
                  className="group relative overflow-hidden rounded-lg border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Produit</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Ajoutez un produit à vendre (cosmétiques, accessoires, etc.)
                      </p>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {totalProducts} produit{totalProducts !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </button>

                {/* Option Fonds de Commerce */}
                <button
                  onClick={() => handleAddAnnouncement('business')}
                  className="group relative overflow-hidden rounded-lg border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Fonds de Commerce</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Mettez en vente un salon de coiffure ou institut
                      </p>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {totalBusinessSales} fonds de commerce
                    </Badge>
                  </div>
                </button>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTypeSelector(false)}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Boutons pour filtrer les annonces */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveAnnouncementType('all')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeAnnouncementType === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Toutes ({totalAnnouncements})
        </button>
        <button
          onClick={() => setActiveAnnouncementType('products')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeAnnouncementType === 'products'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Produits ({totalProducts})
        </button>
        <button
          onClick={() => setActiveAnnouncementType('business')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeAnnouncementType === 'business'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Fonds de Commerce ({totalBusinessSales})
        </button>
      </div>

      {/* Toutes les annonces */}
      {activeAnnouncementType === 'all' && (
        <div className="space-y-4">
          {totalAnnouncements === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Store className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune annonce</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Vous n'avez pas encore créé d'annonce. Commencez par ajouter un produit ou un fonds de commerce.
                </p>
                <Button onClick={() => setShowTypeSelector(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer ma première annonce
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Liste des produits */}
              {userProducts && userProducts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Produits ({totalProducts})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {userProducts.slice(0, 6).map((product) => (
                      <ProductCard 
                        key={product._id} 
                        product={product} 
                        onNavigate={() => setShowProductsModule(true)}
                      />
                    ))}
                  </div>
                  {userProducts.length > 6 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowProductsModule(true)}
                    >
                      Voir tous les produits ({totalProducts})
                    </Button>
                  )}
                </div>
              )}

              {/* Liste des fonds de commerce */}
              {userBusinessSales && userBusinessSales.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Fonds de Commerce ({totalBusinessSales})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {userBusinessSales.slice(0, 6).map((business) => (
                      <BusinessCard 
                        key={business._id} 
                        business={business}
                        onNavigate={() => setShowBusinessSalesModule(true)}
                      />
                    ))}
                  </div>
                  {userBusinessSales.length > 6 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowBusinessSalesModule(true)}
                    >
                      Voir tous les fonds de commerce ({totalBusinessSales})
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Onglet Produits uniquement */}
      {activeAnnouncementType === 'products' && (
        <div className="space-y-4">
          {!userProducts || userProducts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun produit</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Vous n'avez pas encore ajouté de produit.
                </p>
                <Button onClick={() => handleAddAnnouncement('product')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  onNavigate={() => setShowProductsModule(true)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet Fonds de Commerce uniquement */}
      {activeAnnouncementType === 'business' && (
        <div className="space-y-4">
          {!userBusinessSales || userBusinessSales.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun fonds de commerce</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Vous n'avez pas encore mis en vente de fonds de commerce.
                </p>
                <Button onClick={() => handleAddAnnouncement('business')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un fonds de commerce
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userBusinessSales.map((business) => (
                <BusinessCard 
                  key={business._id} 
                  business={business}
                  onNavigate={() => setShowBusinessSalesModule(true)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Composant pour afficher une carte produit
const ProductCard = ({ product, onNavigate }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigate}>
      <div className="aspect-square relative bg-muted">
        {product.images && product.images.length > 0 ? (
          <ProductImageDisplay 
            images={product.images} 
            alt={product.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Rupture
          </Badge>
        )}
        {product.onSale && (
          <Badge className="absolute top-2 left-2 bg-red-500">
            Promo
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate mb-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">{product.price}€</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-muted-foreground line-through">
                {product.originalPrice}€
              </p>
            )}
          </div>
          <Badge variant="secondary">
            Stock: {product.stock}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant pour afficher une carte fonds de commerce
const BusinessCard = ({ business, onNavigate }) => {
  // Vérifier si l'image est un ID Convex valide (commence par "kg" généralement)
  const hasValidImage = business.images && business.images.length > 0 && 
                        typeof business.images[0] === 'string' && 
                        business.images[0].startsWith('kg')
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigate}>
      <div className="aspect-video relative bg-muted">
        {hasValidImage ? (
          <ConvexImage 
            storageId={business.images[0]} 
            alt={business.businessName || business.activityType}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <Badge 
          variant={business.status === 'active' ? 'default' : 'secondary'} 
          className="absolute top-2 right-2"
        >
          {business.status === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate mb-1">
          {business.businessName || business.activityType}
        </h3>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {business.activityType}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-primary">
            {business.salePrice?.toLocaleString() || business.price?.toLocaleString()}€
          </p>
          {(business.city || business.location) && (
            <p className="text-xs text-muted-foreground truncate max-w-[120px]">
              {business.city || business.location}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AnnoncesModule
