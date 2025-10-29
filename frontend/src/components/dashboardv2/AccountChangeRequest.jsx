import React, { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../lib/convex'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

const AccountChangeRequest = ({ userId, currentType, firstName, lastName }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    requestedType: '',
    reason: ''
  })

  // Queries
  const userRequests = useQuery(api.functions.queries.accountChangeRequests.getUserAccountChangeRequests, { userId })
  const hasPending = useQuery(api.functions.queries.accountChangeRequests.hasPendingRequest, { userId })

  // Mutations
  const createRequest = useMutation(api.functions.mutations.accountChangeRequests.createAccountChangeRequest)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (!formData.requestedType || !formData.reason.trim()) {
        alert('Veuillez remplir tous les champs')
        return
      }

      await createRequest({
        userId,
        requestedType: formData.requestedType,
        reason: formData.reason.trim()
      })

      setFormData({ requestedType: '', reason: '' })
      setIsDialogOpen(false)
      alert('Votre demande a été envoyée avec succès !')
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

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

  const getNextTypeOptions = () => {
    const types = ['particulier', 'professionnel', 'grossiste']
    return types.filter(type => type !== currentType)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Changement de type de compte
        </CardTitle>
        <CardDescription>
          Actuellement: <span className="font-semibold capitalize">{currentType}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Historique des demandes */}
        {userRequests && userRequests.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Historique de vos demandes</h4>
            <div className="space-y-2">
              {userRequests.map((request) => (
                <div key={request._id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {request.currentType} → {request.requestedType}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                  {request.reviewComment && (
                    <div className="text-sm p-2 bg-gray-50 rounded">
                      <strong>Commentaire admin:</strong> {request.reviewComment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nouvelle demande */}
        {!hasPending && (
          <div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="w-full"
              variant="outline"
            >
              Faire une demande de changement
            </Button>
          </div>
        )}

        {hasPending && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-yellow-800">
              Vous avez une demande en cours de traitement
            </p>
          </div>
        )}

        {/* Dialog pour nouvelle demande */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Demande de changement de type de compte
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="requestedType">Type de compte souhaité *</Label>
                  <Select 
                    value={formData.requestedType} 
                    onValueChange={(value) => setFormData({ ...formData, requestedType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getNextTypeOptions().map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === 'particulier' && '🛍️ Particulier'}
                          {type === 'professionnel' && '💼 Professionnel'}
                          {type === 'grossiste' && '📦 Grossiste'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reason">Raison de la demande *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Expliquez pourquoi vous souhaitez changer de type de compte..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Envoyer la demande
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false)
                      setFormData({ requestedType: '', reason: '' })
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AccountChangeRequest
