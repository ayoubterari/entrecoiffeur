import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  Headphones, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Calendar,
  Tag,
  UserCheck,
  Mic
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
import { Avatar, AvatarFallback } from '../ui/avatar'

const SupportModule = ({ userId }) => {
  const [showTicketDetails, setShowTicketDetails] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [responseContent, setResponseContent] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  // Convex queries et mutations
  const allTickets = useQuery(api.functions.queries.support.getAllSupportTickets, {
    status: filterStatus !== 'all' ? filterStatus : undefined,
    category: filterCategory !== 'all' ? filterCategory : undefined,
    priority: filterPriority !== 'all' ? filterPriority : undefined,
    limit: 100
  })
  const ticketStats = useQuery(api.functions.queries.support.getSupportTicketStats)
  const ticketDetails = useQuery(
    selectedTicket ? api.functions.queries.support.getSupportTicketById : 'skip',
    selectedTicket ? { ticketId: selectedTicket } : 'skip'
  )
  
  const updateTicketStatus = useMutation(api.functions.mutations.support.updateTicketStatus)
  const updateTicketPriority = useMutation(api.functions.mutations.support.updateTicketPriority)
  const addTicketResponse = useMutation(api.functions.mutations.support.addTicketResponse)
  const assignTicket = useMutation(api.functions.mutations.support.assignTicket)

  // Filtrer les tickets
  const filteredTickets = allTickets?.filter(ticket => {
    const matchesSearch = ticket.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  }) || []

  // Statistiques
  const stats = {
    total: ticketStats?.total || 0,
    open: ticketStats?.open || 0,
    inProgress: ticketStats?.inProgress || 0,
    waitingResponse: ticketStats?.waitingResponse || 0,
    resolved: ticketStats?.resolved || 0,
    closed: ticketStats?.closed || 0,
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

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus({ ticketId, status: newStatus })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await updateTicketPriority({ ticketId, priority: newPriority })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la priorité:', error)
      alert('Erreur lors de la mise à jour de la priorité')
    }
  }

  const handleAddResponse = async (e) => {
    e.preventDefault()
    if (!responseContent.trim() || !selectedTicket || !userId) return

    setIsSubmittingResponse(true)
    try {
      await addTicketResponse({
        ticketId: selectedTicket,
        responderId: userId,
        responderType: 'admin',
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

  const getStatusBadge = (status) => {
    const variants = {
      open: { variant: 'default', icon: Clock, label: 'Ouvert' },
      in_progress: { variant: 'secondary', icon: AlertCircle, label: 'En cours' },
      waiting_response: { variant: 'outline', icon: MessageSquare, label: 'En attente' },
      resolved: { variant: 'success', icon: CheckCircle, label: 'Résolu' },
      closed: { variant: 'destructive', icon: XCircle, label: 'Fermé' }
    }
    const config = variants[status] || variants.open
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Headphones className="h-8 w-8" />
          Support Client
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez les demandes de support et les réclamations des clients
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waitingResponse}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fermés</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Numéro, sujet, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Statut</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="open">Ouvert</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="waiting_response">En attente</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                  <SelectItem value="closed">Fermé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-filter">Catégorie</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="complaint">Réclamation</SelectItem>
                  <SelectItem value="clarification">Clarification</SelectItem>
                  <SelectItem value="technical">Technique</SelectItem>
                  <SelectItem value="billing">Facturation</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority-filter">Priorité</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger id="priority-filter">
                  <SelectValue placeholder="Toutes les priorités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets de support ({filteredTickets.length})</CardTitle>
          <CardDescription>
            Liste de tous les tickets de support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Aucun ticket trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell className="font-medium">
                      {ticket.ticketNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {ticket.firstName?.[0] || ticket.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {ticket.firstName && ticket.lastName 
                              ? `${ticket.firstName} ${ticket.lastName}`
                              : ticket.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {ticket.email}
                          </div>
                        </div>
                      </div>
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
                ))
              )}
            </TableBody>
          </Table>
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
              Consultez et gérez ce ticket de support
            </DialogDescription>
          </DialogHeader>

          {ticketDetails && (
            <div className="space-y-6">
              {/* Informations du ticket */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informations client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {ticketDetails.firstName && ticketDetails.lastName
                          ? `${ticketDetails.firstName} ${ticketDetails.lastName}`
                          : 'Non renseigné'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{ticketDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(ticketDetails.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Gestion du ticket</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <Select 
                        value={ticketDetails.status} 
                        onValueChange={(value) => handleStatusChange(ticketDetails._id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Ouvert</SelectItem>
                          <SelectItem value="in_progress">En cours</SelectItem>
                          <SelectItem value="waiting_response">En attente</SelectItem>
                          <SelectItem value="resolved">Résolu</SelectItem>
                          <SelectItem value="closed">Fermé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priorité</Label>
                      <Select 
                        value={ticketDetails.priority} 
                        onValueChange={(value) => handlePriorityChange(ticketDetails._id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Faible</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Élevée</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                  <div className="flex gap-2 mt-2">
                    {getPriorityBadge(ticketDetails.priority)}
                    {getStatusBadge(ticketDetails.status)}
                    <Badge variant="outline">
                      {getCategoryLabel(ticketDetails.category)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{ticketDetails.description}</p>
                  </div>
                  
                  {/* Enregistrement vocal si présent */}
                  {ticketDetails.voiceRecording && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Enregistrement vocal du client</span>
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
                          <span className="font-medium">
                            {response.responder?.firstName} {response.responder?.lastName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {response.responderType === 'admin' ? 'Admin' : 
                             response.responderType === 'seller' ? 'Vendeur' : 'Client'}
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
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter une réponse</CardTitle>
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
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseTicketDetails}
                      >
                        Fermer
                      </Button>
                      <Button type="submit" disabled={isSubmittingResponse}>
                        {isSubmittingResponse ? 'Envoi...' : 'Envoyer la réponse'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SupportModule
