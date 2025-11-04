import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Star, MessageSquare, CheckCircle, XCircle, Trash2, Eye, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'

export default function ReviewsModule({ userId }) {
  const [activeTab, setActiveTab] = useState('product') // 'product' ou 'order'
  const [selectedReview, setSelectedReview] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [moderationNote, setModerationNote] = useState('')

  // Queries
  const productReviews = useQuery(api.functions.queries.reviews.getAllProductReviews)
  const orderReviews = useQuery(api.functions.queries.reviews.getAllOrderReviews)
  const stats = useQuery(api.functions.queries.reviews.getReviewsStats)

  // Mutations
  const moderateProductReview = useMutation(api.functions.mutations.reviews.moderateProductReview)
  const moderateOrderReview = useMutation(api.functions.mutations.reviews.moderateOrderReview)
  const deleteProductReview = useMutation(api.functions.mutations.reviews.deleteProductReview)
  const deleteOrderReview = useMutation(api.functions.mutations.reviews.deleteOrderReview)

  const handleModerate = async (reviewId, status, isOrderReview) => {
    try {
      if (isOrderReview) {
        await moderateOrderReview({
          reviewId,
          status,
          moderationNote: moderationNote || undefined,
          moderatedBy: userId,
        })
      } else {
        await moderateProductReview({
          reviewId,
          status,
          moderationNote: moderationNote || undefined,
          moderatedBy: userId,
        })
      }
      setModerationNote('')
      setIsDetailDialogOpen(false)
      alert(`Avis ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès!`)
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  const handleDelete = async (reviewId, isOrderReview) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return

    try {
      if (isOrderReview) {
        await deleteOrderReview({ reviewId })
      } else {
        await deleteProductReview({ reviewId })
      }
      setIsDetailDialogOpen(false)
      alert('Avis supprimé avec succès!')
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  const openDetailDialog = (review) => {
    setSelectedReview(review)
    setIsDetailDialogOpen(true)
  }

  // Filtrer les avis
  const filterReviews = (reviews) => {
    if (!reviews) return []
    
    return reviews.filter((review) => {
      const matchesSearch =
        (review.userName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.comment?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.productName?.toLowerCase().includes(searchTerm.toLowerCase()))

      const reviewStatus = review.status || 'approved'
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'approved' && reviewStatus === 'approved') ||
        (filterStatus === 'rejected' && reviewStatus === 'rejected')

      return matchesSearch && matchesStatus
    })
  }

  const currentReviews = activeTab === 'product' ? productReviews : orderReviews
  const filteredReviews = filterReviews(currentReviews)

  const getStatusBadge = (status) => {
    const s = status || 'approved'
    const variants = {
      approved: { variant: 'default', label: 'Approuvé', icon: '✅' },
      rejected: { variant: 'destructive', label: 'Rejeté', icon: '❌' },
    }
    const config = variants[s]
    return (
      <Badge variant={config.variant}>
        {config.icon} {config.label}
      </Badge>
    )
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}/5</span>
      </div>
    )
  }

  if (!stats) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          Gestion des Avis
        </h1>
        <p className="text-muted-foreground mt-1">
          Modérez et gérez les avis des utilisateurs
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Avis</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.productReviews.total} produits + {stats.orderReviews.total} commandes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRejected}</div>
            <p className="text-xs text-muted-foreground">
              Avis modérés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne Produits</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productReviews.averageRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              {stats.productReviews.approved} approuvés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orderReviews.averageRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              {stats.orderReviews.approved} approuvés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'product' ? 'default' : 'outline'}
          onClick={() => setActiveTab('product')}
        >
          <Package className="h-4 w-4 mr-2" />
          Avis Produits ({stats.productReviews.total})
        </Button>
        <Button
          variant={activeTab === 'order' ? 'default' : 'outline'}
          onClick={() => setActiveTab('order')}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Avis Commandes ({stats.orderReviews.total})
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Rechercher par utilisateur, produit ou commentaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md"
            />
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                Tous
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
              >
                Approuvés
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('rejected')}
              >
                Rejetés
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des avis */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReviews?.map((review) => (
          <Card key={review._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* En-tête */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{activeTab === 'product' ? review.userName : review.buyerName}</span>
                        {getStatusBadge(review.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activeTab === 'product' ? review.userEmail : review.buyerEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Produit */}
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{review.productName}</span>
                    {activeTab === 'order' && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">Commande: {review.orderNumber}</span>
                      </>
                    )}
                  </div>

                  {/* Commentaire */}
                  {review.comment && (
                    <p className="text-sm bg-muted p-3 rounded-md">
                      "{review.comment}"
                    </p>
                  )}

                  {/* Notes détaillées pour avis commandes */}
                  {activeTab === 'order' && (
                    <div className="flex gap-4 text-sm">
                      {review.deliveryRating && (
                        <div>
                          <span className="text-muted-foreground">Livraison: </span>
                          <span className="font-medium">{review.deliveryRating}/5</span>
                        </div>
                      )}
                      {review.productQualityRating && (
                        <div>
                          <span className="text-muted-foreground">Qualité: </span>
                          <span className="font-medium">{review.productQualityRating}/5</span>
                        </div>
                      )}
                      {review.sellerServiceRating && (
                        <div>
                          <span className="text-muted-foreground">Service: </span>
                          <span className="font-medium">{review.sellerServiceRating}/5</span>
                        </div>
                      )}
                      {review.isRecommended && (
                        <div className="text-green-600 font-medium">
                          ✓ Recommandé
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetailDialog(review)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredReviews?.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Aucun avis trouvé
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de détails */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'avis</DialogTitle>
            <DialogDescription>
              Modérez cet avis en l'approuvant ou en le rejetant
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Statut actuel */}
              <div>
                <label className="text-sm font-medium">Statut actuel</label>
                <div className="mt-1">
                  {getStatusBadge(selectedReview.status)}
                </div>
              </div>

              {/* Utilisateur */}
              <div>
                <label className="text-sm font-medium">Utilisateur</label>
                <p className="mt-1">{activeTab === 'product' ? selectedReview.userName : selectedReview.buyerName}</p>
                <p className="text-sm text-muted-foreground">{activeTab === 'product' ? selectedReview.userEmail : selectedReview.buyerEmail}</p>
              </div>

              {/* Produit */}
              <div>
                <label className="text-sm font-medium">Produit</label>
                <p className="mt-1">{selectedReview.productName}</p>
              </div>

              {/* Note */}
              <div>
                <label className="text-sm font-medium">Note</label>
                <div className="mt-1">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>

              {/* Commentaire */}
              {selectedReview.comment && (
                <div>
                  <label className="text-sm font-medium">Commentaire</label>
                  <p className="mt-1 bg-muted p-3 rounded-md">{selectedReview.comment}</p>
                </div>
              )}

              {/* Note de modération */}
              <div>
                <label className="text-sm font-medium">Note de modération (optionnel)</label>
                <textarea
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  rows="3"
                  placeholder="Raison du rejet, commentaire interne..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDelete(selectedReview._id, activeTab === 'order')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleModerate(selectedReview._id, 'rejected', activeTab === 'order')}
                  disabled={selectedReview.status === 'rejected'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
                <Button
                  onClick={() => handleModerate(selectedReview._id, 'approved', activeTab === 'order')}
                  disabled={selectedReview.status === 'approved'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
