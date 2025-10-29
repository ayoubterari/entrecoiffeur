import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  Eye,
  Calendar,
  Mail,
  User,
  Mic
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Avatar, AvatarFallback } from '../ui/avatar'

const ComplaintsModule = ({ userId, userEmail }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showComplaintDetails, setShowComplaintDetails] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [responseContent, setResponseContent] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  // Get seller's complaints (tickets where relatedSellerId = userId and category = complaint)
  const allTickets = useQuery(
    api.functions.queries.support.getAllSupportTickets,
    { category: 'complaint', limit: 100 }
  )

  // Filter only complaints related to this seller
  const sellerComplaints = allTickets?.filter(ticket => 
    ticket.relatedSellerId === userId
  )

  // Get selected complaint details
  const complaintDetails = useQuery(
    selectedComplaint ? api.functions.queries.support.getSupportTicketById : 'skip',
    selectedComplaint ? { ticketId: selectedComplaint } : 'skip'
  )

  // Mutation pour ajouter une réponse
  const addTicketResponse = useMutation(api.functions.mutations.support.addTicketResponse)

  // Filter complaints
  const filteredComplaints = sellerComplaints?.filter(complaint => {
    // Search filter
    const matchesSearch = complaint.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const variants = {
      open: { variant: 'default', icon: Clock, label: 'Ouvert', color: 'bg-blue-100 text-blue-800' },
      in_progress: { variant: 'secondary', icon: AlertCircle, label: 'En cours', color: 'bg-orange-100 text-orange-800' },
      waiting_response: { variant: 'outline', icon: MessageSquare, label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      resolved: { variant: 'success', icon: CheckCircle, label: 'Résolu', color: 'bg-green-100 text-green-800' },
      closed: { variant: 'destructive', icon: XCircle, label: 'Fermé', color: 'bg-gray-100 text-gray-800' }
    }
    const config = variants[status] || variants.open
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    const labels = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente'
    }
    return (
      <Badge className={colors[priority]}>
        {labels[priority]}
      </Badge>
    )
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewComplaint = (complaintId) => {
    setSelectedComplaint(complaintId)
    setShowComplaintDetails(true)
    setResponseContent('')
  }

  const handleCloseComplaintDetails = () => {
    setShowComplaintDetails(false)
    setSelectedComplaint(null)
    setResponseContent('')
  }

  const handleAddResponse = async (e) => {
    e.preventDefault()
    if (!responseContent.trim() || !selectedComplaint || !userId) return

    setIsSubmittingResponse(true)
    try {
      await addTicketResponse({
        ticketId: selectedComplaint,
        responderId: userId,
        responderType: 'seller',
        content: responseContent,
        isInternal: false
      })
      
      setResponseContent('')
      alert('Réponse ajoutée avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error)
      alert('Erreur lors de l\'ajout de la réponse')
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  // Calculate stats
  const stats = {
    total: sellerComplaints?.length || 0,
    open: sellerComplaints?.filter(c => c.status === 'open').length || 0,
    inProgress: sellerComplaints?.filter(c => c.status === 'in_progress').length || 0,
    resolved: sellerComplaints?.filter(c => c.status === 'resolved').length || 0,
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
          Réclamations clients
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez les réclamations concernant votre boutique
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouvertes</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolues</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro, sujet ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                Toutes
              </Button>
              <Button
                variant={statusFilter === 'open' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('open')}
                size="sm"
              >
                Ouvertes
              </Button>
              <Button
                variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('in_progress')}
                size="sm"
              >
                En cours
              </Button>
              <Button
                variant={statusFilter === 'resolved' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('resolved')}
                size="sm"
              >
                Résolues
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des réclamations */}
      <Card>
        <CardHeader>
          <CardTitle>Mes réclamations ({filteredComplaints?.length || 0})</CardTitle>
          <CardDescription>
            Liste de toutes les réclamations concernant votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredComplaints || filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-semibold">Aucune réclamation</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Vous n'avez aucune réclamation en cours. Continuez votre excellent travail !
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint._id}>
                      <TableCell className="font-medium">
                        {complaint.ticketNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {complaint.firstName?.[0] || complaint.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {complaint.firstName && complaint.lastName 
                                ? `${complaint.firstName} ${complaint.lastName}`
                                : complaint.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {complaint.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {complaint.subject}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(complaint.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(complaint.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(complaint.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewComplaint(complaint._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog détails de la réclamation */}
      <Dialog open={showComplaintDetails} onOpenChange={setShowComplaintDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Réclamation {complaintDetails?.ticketNumber}
            </DialogTitle>
            <DialogDescription>
              Consultez les détails et répondez à cette réclamation
            </DialogDescription>
          </DialogHeader>

          {complaintDetails && (
            <div className="space-y-6">
              {/* Informations de la réclamation */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informations client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {complaintDetails.firstName && complaintDetails.lastName
                          ? `${complaintDetails.firstName} ${complaintDetails.lastName}`
                          : 'Non renseigné'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{complaintDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Créée le {formatDate(complaintDetails.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Statut actuel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      {getStatusBadge(complaintDetails.status)}
                      {getPriorityBadge(complaintDetails.priority)}
                    </div>
                    {complaintDetails.lastResponseAt && (
                      <div className="text-xs text-muted-foreground">
                        Dernière réponse le {formatDate(complaintDetails.lastResponseAt)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sujet et description */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <span className="text-xl">😠</span>
                    {complaintDetails.subject}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-sm text-orange-900">{complaintDetails.description}</p>
                  </div>
                  
                  {/* Enregistrement vocal si présent */}
                  {complaintDetails.voiceRecording && (
                    <div className="border-t border-orange-200 pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="h-4 w-4 text-orange-700" />
                        <span className="text-sm font-medium text-orange-900">Enregistrement vocal du client</span>
                      </div>
                      <audio 
                        controls 
                        className="w-full"
                        src={complaintDetails.voiceRecording}
                      >
                        Votre navigateur ne supporte pas la lecture audio.
                      </audio>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Réponses */}
              {complaintDetails.responses && complaintDetails.responses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Échanges ({complaintDetails.responses.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {complaintDetails.responses.map((response) => (
                      <div key={response._id} className="border-l-2 border-primary pl-4 py-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {response.responder?.firstName?.[0] || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {response.responder?.firstName} {response.responder?.lastName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {response.responderType === 'admin' ? '👨‍💼 Admin' : 
                             response.responderType === 'seller' ? '🏪 Vous' : '👤 Client'}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDate(response.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Formulaire de réponse */}
              {complaintDetails.status !== 'closed' && complaintDetails.status !== 'resolved' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Répondre au client</CardTitle>
                    <CardDescription>
                      Apportez une réponse professionnelle à cette réclamation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddResponse} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="response">Votre réponse</Label>
                        <Textarea
                          id="response"
                          placeholder="Écrivez votre réponse au client..."
                          value={responseContent}
                          onChange={(e) => setResponseContent(e.target.value)}
                          rows={5}
                          required
                          disabled={isSubmittingResponse}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseComplaintDetails}
                          disabled={isSubmittingResponse}
                        >
                          Fermer
                        </Button>
                        <Button type="submit" disabled={isSubmittingResponse || !responseContent.trim()}>
                          {isSubmittingResponse ? (
                            <>
                              <span className="mr-2">⏳</span>
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Envoyer ma réponse
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Message si réclamation fermée ou résolue */}
              {(complaintDetails.status === 'closed' || complaintDetails.status === 'resolved') && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          {complaintDetails.status === 'resolved' ? 'Réclamation résolue' : 'Réclamation fermée'}
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Cette réclamation a été {complaintDetails.status === 'resolved' ? 'résolue' : 'fermée'}. 
                          Merci pour votre professionnalisme.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(complaintDetails.status !== 'closed' && complaintDetails.status !== 'resolved') && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={handleCloseComplaintDetails}>
                    Fermer
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ComplaintsModule
