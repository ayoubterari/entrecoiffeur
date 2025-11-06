import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Mail, Users, UserCheck, UserX, Search, Download, Trash2, RotateCcw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'

const NewsletterModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
  const [selectedSubscriber, setSelectedSubscriber] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Queries
  const stats = useQuery(api.functions.queries.newsletter.getNewsletterStats)
  const subscribers = useQuery(api.functions.queries.newsletter.searchNewsletterSubscribers, {
    searchTerm: searchTerm || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
  })

  // Mutations
  const unsubscribe = useMutation(api.functions.mutations.newsletter.unsubscribeFromNewsletter)
  const reactivate = useMutation(api.functions.mutations.newsletter.reactivateSubscriber)
  const deleteSubscriber = useMutation(api.functions.mutations.newsletter.deleteSubscriber)

  // Handlers
  const handleToggleStatus = async (subscriber) => {
    try {
      if (subscriber.isActive) {
        await unsubscribe({ subscriberId: subscriber._id })
      } else {
        await reactivate({ subscriberId: subscriber._id })
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      alert('Une erreur est survenue')
    }
  }

  const handleDelete = async () => {
    if (!selectedSubscriber) return
    
    try {
      await deleteSubscriber({ subscriberId: selectedSubscriber._id })
      setShowDeleteDialog(false)
      setSelectedSubscriber(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Une erreur est survenue')
    }
  }

  const handleExportCSV = () => {
    if (!subscribers || subscribers.length === 0) {
      alert('Aucun abonné à exporter')
      return
    }

    // Créer le contenu CSV
    const headers = ['Email', 'Statut', 'Date d\'abonnement', 'Source']
    const rows = subscribers.map(sub => [
      sub.email,
      sub.isActive ? 'Actif' : 'Inactif',
      new Date(sub.subscribedAt).toLocaleDateString('fr-FR'),
      sub.source || 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Newsletter
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les abonnés à votre newsletter
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Abonnés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tous les abonnés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Abonnés actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <UserX className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats?.inactive || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Désabonnés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.newLastWeek || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nouveaux abonnés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des abonnés</CardTitle>
          <CardDescription>
            Recherchez et gérez vos abonnés à la newsletter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtre statut */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                Tous ({stats?.total || 0})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Actifs ({stats?.active || 0})
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('inactive')}
                size="sm"
              >
                Inactifs ({stats?.inactive || 0})
              </Button>
            </div>
          </div>

          {/* Table des abonnés */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Date d'abonnement</th>
                    <th className="text-left p-4 font-medium">Source</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers && subscribers.length > 0 ? (
                    subscribers.map((subscriber) => (
                      <tr key={subscriber._id} className="border-t hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{subscriber.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {subscriber.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <UserCheck className="h-3 w-3" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              <UserX className="h-3 w-3" />
                              Inactif
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(subscriber.subscribedAt)}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                            {subscriber.source || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(subscriber)}
                              title={subscriber.isActive ? 'Désactiver' : 'Réactiver'}
                            >
                              {subscriber.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSubscriber(subscriber)
                                setShowDeleteDialog(true)
                              }}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-muted-foreground">
                        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">Aucun abonné trouvé</p>
                        <p className="text-sm mt-1">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Essayez de modifier vos filtres'
                            : 'Les abonnés apparaîtront ici'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info */}
          {subscribers && subscribers.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Affichage de {subscribers.length} abonné(s)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement cet abonné ?
              <br />
              <span className="font-medium text-foreground mt-2 block">
                {selectedSubscriber?.email}
              </span>
              <br />
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setSelectedSubscriber(null)
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NewsletterModule
