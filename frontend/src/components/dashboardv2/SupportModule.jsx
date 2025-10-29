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
  Headphones, 
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

const SupportModule = ({ userId, userEmail }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showTicketDetails, setShowTicketDetails] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [responseContent, setResponseContent] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  // Get user's support tickets
  const userTickets = useQuery(
    api.functions.queries.support.getUserSupportTickets,
    userId ? { userId } : userEmail ? { email: userEmail } : "skip"
  )

  // Get selected ticket details
  const ticketDetails = useQuery(
    selectedTicket ? api.functions.queries.support.getSupportTicketById : 'skip',
    selectedTicket ? { ticketId: selectedTicket } : 'skip'
  )

  // Mutation pour ajouter une réponse
  const addTicketResponse = useMutation(api.functions.mutations.support.addTicketResponse)

  // Filter tickets
  const filteredTickets = userTickets?.filter(ticket => {
    // Search filter
    const matchesSearch = ticket.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    
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

  const getCategoryLabel = (category) => {
    const labels = {
      complaint: 'Réclamation',
      clarification: 'Clarification',
      technical: 'Technique',
      billing: 'Facturation',
      other: 'Autre'
    }
    return labels[category] || category
  }

  const getCategoryIcon = (category) => {
    const icons = {
      complaint: '😠',
      clarification: '❓',
      technical: '🔧',
      billing: '💳',
      other: '💬'
    }
    return icons[category] || '💬'
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

  const handleViewTicket = (ticketId) => {
    setSelectedTicket(ticketId)
    setShowTicketDetails(true)
    setResponseContent('')
  }

  const handleCloseTicketDetails = () => {
    setShowTicketDetails(false)
    setSelectedTicket(null)
    setResponseContent('')
  }

  const handleAddResponse = async (e) => {
    e.preventDefault()
    if (!responseContent.trim() || !selectedTicket || !userId) return

    setIsSubmittingResponse(true)
    try {
      await addTicketResponse({
        ticketId: selectedTicket,
        responderId: userId,
        responderType: 'client',
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
    total: userTickets?.length || 0,
    open: userTickets?.filter(t => t.status === 'open').length || 0,
    inProgress: userTickets?.filter(t => t.status === 'in_progress').length || 0,
    resolved: userTickets?.filter(t => t.status === 'resolved').length || 0,
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Headphones className="h-8 w-8" />
          Mes demandes de support
        </h1>
        <p className="text-muted-foreground mt-2">
          Suivez l'état de vos demandes de support
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
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
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
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
                  placeholder="Rechercher par numéro ou sujet..."
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
                Tous
              </Button>
              <Button
                variant={statusFilter === 'open' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('open')}
                size="sm"
              >
                Ouverts
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
                Résolus
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Mes tickets ({filteredTickets?.length || 0})</CardTitle>
          <CardDescription>
            Liste de toutes vos demandes de support
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredTickets || filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Headphones className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucune demande de support</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Vous n'avez pas encore créé de ticket de support.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket._id}>
                      <TableCell className="font-medium">
                        {ticket.ticketNumber}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <span className="text-xl mr-1">{getCategoryIcon(ticket.category)}</span>
                        {getCategoryLabel(ticket.category)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(ticket.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ticket.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTicket(ticket._id)}
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

      {/* Dialog détails du ticket */}
      <Dialog open={showTicketDetails} onOpenChange={setShowTicketDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Détails du ticket {ticketDetails?.ticketNumber}
            </DialogTitle>
            <DialogDescription>
              Consultez les détails et les réponses de votre demande
            </DialogDescription>
          </DialogHeader>

          {ticketDetails && (
            <div className="space-y-6">
              {/* Informations du ticket */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Créé le {formatDate(ticketDetails.createdAt)}
                      </span>
                    </div>
                    {ticketDetails.lastResponseAt && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Dernière réponse le {formatDate(ticketDetails.lastResponseAt)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Statut actuel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      {getStatusBadge(ticketDetails.status)}
                      {getPriorityBadge(ticketDetails.priority)}
                    </div>
                    <Badge variant="outline">
                      {getCategoryLabel(ticketDetails.category)}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Sujet et description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">{getCategoryIcon(ticketDetails.category)}</span>
                    {ticketDetails.subject}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-sm">{ticketDetails.description}</p>
                  </div>
                  
                  {/* Enregistrement vocal si présent */}
                  {ticketDetails.voiceRecording && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Votre enregistrement vocal</span>
                      </div>
                      <audio 
                        controls 
                        className="w-full"
                        src={ticketDetails.voiceRecording}
                      >
                        Votre navigateur ne supporte pas la lecture audio.
                      </audio>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Réponses */}
              {ticketDetails.responses && ticketDetails.responses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Réponses ({ticketDetails.responses.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ticketDetails.responses.map((response) => (
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
                             response.responderType === 'seller' ? '🏪 Vendeur' : '👤 Vous'}
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
              {ticketDetails.status !== 'closed' && ticketDetails.status !== 'resolved' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ajouter une réponse</CardTitle>
                    <CardDescription>
                      Répondez à l'équipe support pour apporter des précisions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddResponse} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="response">Votre message</Label>
                        <Textarea
                          id="response"
                          placeholder="Écrivez votre réponse ici..."
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
                          onClick={handleCloseTicketDetails}
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

              {/* Message si ticket fermé ou résolu */}
              {(ticketDetails.status === 'closed' || ticketDetails.status === 'resolved') && (
                <Card className="bg-muted">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          {ticketDetails.status === 'resolved' ? 'Ticket résolu' : 'Ticket fermé'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ce ticket a été {ticketDetails.status === 'resolved' ? 'résolu' : 'fermé'}. 
                          Si vous avez besoin d'aide supplémentaire, veuillez créer un nouveau ticket.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(ticketDetails.status !== 'closed' && ticketDetails.status !== 'resolved') && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={handleCloseTicketDetails}>
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

export default SupportModule
