import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Switch } from '../ui/switch'
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Shield,
  User,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Package,
  MessageSquare,
  AlertTriangle,
  Ticket,
  BarChart3,
  Settings,
  ShoppingCart
} from 'lucide-react'

const TeamModule = ({ userId, userType }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form states pour création
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    permissions: {
      profile: true,
      products: false,
      orders: false,
      purchases: false,
      messages: false,
      complaints: false,
      coupons: false,
      support: false,
      stats: false,
      settings: false,
    }
  })

  // Queries
  const sellerUsers = useQuery(api.functions.queries.sellerUsers.getSellerUsersByParent, { 
    parentSellerId: userId 
  })
  const stats = useQuery(api.functions.queries.sellerUsers.getSellerUsersStats, { 
    parentSellerId: userId 
  })

  // Mutations
  const createSellerUser = useMutation(api.functions.mutations.sellerUsers.createSellerUserComplete)
  const updatePermissions = useMutation(api.functions.mutations.sellerUsers.updateSellerUserPermissions)
  const updateRole = useMutation(api.functions.mutations.sellerUsers.updateSellerUserRole)
  const toggleStatus = useMutation(api.functions.mutations.sellerUsers.toggleSellerUserStatus)
  const deleteUser = useMutation(api.functions.mutations.sellerUsers.deleteSellerUser)

  // Filtrer les utilisateurs
  const filteredUsers = sellerUsers?.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Gérer la création d'un utilisateur
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createSellerUser({
        email: newUser.email,
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        parentSellerId: userId,
        role: newUser.role,
        permissions: newUser.permissions,
      })

      // Réinitialiser le formulaire
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        permissions: {
          profile: true,
          products: false,
          orders: false,
          purchases: false,
          messages: false,
          complaints: false,
          coupons: false,
          support: false,
          stats: false,
          settings: false,
        }
      })
      setIsCreateDialogOpen(false)
      alert('Utilisateur créé avec succès !')
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert(error.message || 'Erreur lors de la création de l\'utilisateur')
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer la modification des permissions
  const handleUpdatePermissions = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updatePermissions({
        sellerUserId: selectedUser._id,
        permissions: selectedUser.permissions,
        updatedBy: userId,
      })

      setIsEditDialogOpen(false)
      setSelectedUser(null)
      alert('Permissions mises à jour avec succès !')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert(error.message || 'Erreur lors de la mise à jour des permissions')
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer le changement de statut
  const handleToggleStatus = async (sellerUserId) => {
    try {
      await toggleStatus({
        sellerUserId,
        updatedBy: userId,
      })
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      alert(error.message || 'Erreur lors du changement de statut')
    }
  }

  // Gérer la suppression
  const handleDeleteUser = async (sellerUserId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      await deleteUser({
        sellerUserId,
        deletedBy: userId,
      })
      alert('Utilisateur supprimé avec succès !')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert(error.message || 'Erreur lors de la suppression')
    }
  }

  // Icônes pour les modules
  const moduleIcons = {
    profile: User,
    products: Package,
    orders: ShoppingBag,
    purchases: ShoppingCart,
    messages: MessageSquare,
    complaints: AlertTriangle,
    coupons: Ticket,
    support: MessageSquare,
    stats: BarChart3,
    settings: Settings,
  }

  // Labels pour les modules
  const moduleLabels = {
    profile: 'Profil',
    products: 'Mes Produits',
    orders: 'Mes Ventes',
    purchases: 'Mes Achats',
    messages: 'Messages',
    complaints: 'Réclamations',
    coupons: 'Mes Coupons',
    support: 'Support',
    stats: 'Statistiques',
    settings: 'Paramètres',
  }

  // Rôles
  const roleLabels = {
    manager: { label: 'Gestionnaire', color: 'bg-blue-500', icon: Shield },
    employee: { label: 'Employé', color: 'bg-green-500', icon: User },
    viewer: { label: 'Observateur', color: 'bg-gray-500', icon: Eye },
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestion de l'équipe
          </h2>
          <p className="text-muted-foreground">
            Gérez les accès de votre équipe aux différents modules
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Créez un compte pour un membre de votre équipe avec des accès personnalisés
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  minLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="manager">Gestionnaire (accès étendu)</option>
                  <option value="employee">Employé (accès standard)</option>
                  <option value="viewer">Observateur (lecture seule)</option>
                </select>
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <Label>Modules accessibles</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(newUser.permissions).map(([key, value]) => {
                    const Icon = moduleIcons[key]
                    return (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{moduleLabels[key]}</span>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            setNewUser({
                              ...newUser,
                              permissions: { ...newUser.permissions, [key]: checked }
                            })
                          }
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Création...' : 'Créer l\'utilisateur'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Utilisateurs créés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Comptes actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gestionnaires</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byRole.manager}</div>
              <p className="text-xs text-muted-foreground">Accès étendu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employés</CardTitle>
              <User className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byRole.employee}</div>
              <p className="text-xs text-muted-foreground">Accès standard</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            Gérez les membres de votre équipe et leurs permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Liste des utilisateurs */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucun utilisateur</h3>
              <p className="text-muted-foreground">
                Commencez par créer un compte pour un membre de votre équipe
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const roleInfo = roleLabels[user.role]
                const RoleIcon = roleInfo.icon
                const activeModules = Object.values(user.permissions).filter(Boolean).length

                return (
                  <Card key={user._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full ${roleInfo.color} flex items-center justify-center text-white`}>
                            <RoleIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {user.firstName} {user.lastName}
                              </h3>
                              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                {user.isActive ? 'Actif' : 'Désactivé'}
                              </Badge>
                              <Badge variant="outline" className={roleInfo.color + ' text-white'}>
                                {roleInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {activeModules} module{activeModules > 1 ? 's' : ''} accessible{activeModules > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user._id)}
                          >
                            {user.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier les permissions</DialogTitle>
              <DialogDescription>
                {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePermissions} className="space-y-4">
              <div className="space-y-3">
                <Label>Modules accessibles</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedUser.permissions).map(([key, value]) => {
                    const Icon = moduleIcons[key]
                    return (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{moduleLabels[key]}</span>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            setSelectedUser({
                              ...selectedUser,
                              permissions: { ...selectedUser.permissions, [key]: checked }
                            })
                          }
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default TeamModule
