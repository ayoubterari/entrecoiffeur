import React, { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../lib/convex'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { AlertCircle, CheckCircle, Clock, XCircle, User, Mail, Calendar } from 'lucide-react'

const AccountChangeRequestsModule = ({ currentUserId }) => {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewData, setReviewData] = useState({
    action: '',
    comment: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Queries
  const allRequests = useQuery(api.functions.queries.accountChangeRequests.getAllAccountChangeRequests)

  // Mutations
  const approveRequest = useMutation(api.functions.mutations.accountChangeRequests.approveAccountChangeRequest)
  const rejectRequest = useMutation(api.functions.mutations.accountChangeRequests.rejectAccountChangeRequest)

  // Filtrer les demandes
  const filteredRequests = allRequests?.filter(request => {
    const matchesSearch = 
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approuvée</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejetée</Badge>
      default:
        return null
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'particulier': return '🛍️'
      case 'professionnel': return '💼'
      case 'grossiste': return '📦'
      default: return '❓'
    }
  }

  const handleReview = async () => {
    if (!selectedRequest || !reviewData.action) return

    try {
      if (reviewData.action === 'approve') {
        await approveRequest({
          requestId: selectedRequest._id,
          reviewedBy: currentUserId,
          reviewComment: reviewData.comment.trim() || undefined
        })
        alert('Demande approuvée avec succès !')
      } else {
        await rejectRequest({
          requestId: selectedRequest._id,
          reviewedBy: currentUserId,
          reviewComment: reviewData.comment.trim() || undefined
        })
        alert('Demande rejetée avec succès !')
      }

      setIsReviewDialogOpen(false)
      setSelectedRequest(null)
      setReviewData({ action: '', comment: '' })
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  const openReviewDialog = (request, action) => {
    setSelectedRequest(request)
    setReviewData({ action, comment: '' })
    setIsReviewDialogOpen(true)
  }

  // Statistiques
  const stats = {
    total: allRequests?.length || 0,
    pending: allRequests?.filter(r => r.status === 'pending').length || 0,
    approved: allRequests?.filter(r => r.status === 'approved').length || 0,
    rejected: allRequests?.filter(r => r.status === 'rejected').length || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Demandes de changement de compte</h2>
        <p className="text-muted-foreground">
          Gérez les demandes de changement de type de compte utilisateur
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Email, prénom ou nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="status">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvées</SelectItem>
                  <SelectItem value="rejected">Rejetées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune demande trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {request.firstName} {request.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {request.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span>
                        {getTypeIcon(request.currentType)} {request.currentType}
                      </span>
                      <span>→</span>
                      <span>
                        {getTypeIcon(request.requestedType)} {request.requestedType}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600">{request.reason}</p>
                  </div>

                  {request.reviewComment && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Commentaire admin:</strong> {request.reviewComment}
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openReviewDialog(request, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openReviewDialog(request, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de révision */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewData.action === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <span>
                  {selectedRequest.firstName} {selectedRequest.lastName} ({selectedRequest.email})
                  <br />
                  {getTypeIcon(selectedRequest.currentType)} {selectedRequest.currentType} → {getTypeIcon(selectedRequest.requestedType)} {selectedRequest.requestedType}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Commentaire (optionnel)</Label>
              <Textarea
                id="comment"
                placeholder="Ajoutez un commentaire pour l'utilisateur..."
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleReview}
                className={reviewData.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={reviewData.action === 'reject' ? 'destructive' : 'default'}
              >
                {reviewData.action === 'approve' ? 'Approuver' : 'Rejeter'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsReviewDialogOpen(false)
                  setSelectedRequest(null)
                  setReviewData({ action: '', comment: '' })
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AccountChangeRequestsModule
