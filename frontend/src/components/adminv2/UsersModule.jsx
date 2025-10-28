import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Building2,
  Mail,
  Calendar
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
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

const UsersModule = () => {
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUserType, setFilterUserType] = useState('all')

  // Convex queries et mutations
  const allUsers = useQuery(api.auth.getAllUsers)
  const createUser = useMutation(api.auth.createUser)
  const updateUser = useMutation(api.auth.updateUser)
  const deleteUser = useMutation(api.auth.deleteUser)

  // État du formulaire
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: 'particulier',
    companyName: '',
    siret: '',
    tvaNumber: ''
  })

  // Filtrer les utilisateurs
  const filteredUsers = allUsers?.filter(user => {
    if (!user.email) return false
    
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterUserType === 'all' || user.userType === filterUserType
    return matchesSearch && matchesType
  }) || []

  // Statistiques
  const stats = {
    total: allUsers?.length || 0,
    particuliers: allUsers?.filter(u => u.userType === 'particulier').length || 0,
    professionnels: allUsers?.filter(u => u.userType === 'professionnel').length || 0,
    grossistes: allUsers?.filter(u => u.userType === 'grossiste').length || 0,
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await createUser(userForm)
      setUserForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        userType: 'particulier',
        companyName: '',
        siret: '',
        tvaNumber: ''
      })
      setShowAddUser(false)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setUserForm({
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      userType: user.userType,
      companyName: user.companyName || '',
      siret: user.siret || '',
      tvaNumber: user.tvaNumber || ''
    })
    setShowEditUser(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      const updateData = { ...userForm }
      if (!updateData.password) {
        delete updateData.password
      }
      
      await updateUser({
        userId: editingUser._id,
        ...updateData
      })
      
      setShowEditUser(false)
      setEditingUser(null)
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
    }
  }

  const handleDeleteUser = (user) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      await deleteUser({ userId: userToDelete._id })
      setShowDeleteConfirm(false)
      setUserToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const getUserTypeBadge = (type) => {
    const variants = {
      particulier: { label: 'Particulier', variant: 'default' },
      professionnel: { label: 'Professionnel', variant: 'secondary' },
      grossiste: { label: 'Grossiste', variant: 'outline' },
      superadmin: { label: 'Super Admin', variant: 'destructive' }
    }
    const config = variants[type] || variants.particulier
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Utilisateurs</h2>
          <p className="text-muted-foreground">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <Button onClick={() => setShowAddUser(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">utilisateurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Particuliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.particuliers}</div>
            <p className="text-xs text-muted-foreground">comptes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professionnels</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.professionnels}</div>
            <p className="text-xs text-muted-foreground">comptes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grossistes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.grossistes}</div>
            <p className="text-xs text-muted-foreground">comptes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            Recherchez et filtrez les utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterUserType} onValueChange={setFilterUserType}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type d'utilisateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="particulier">Particuliers</SelectItem>
                <SelectItem value="professionnel">Professionnels</SelectItem>
                <SelectItem value="grossiste">Grossistes</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          {filteredUsers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {(user.firstName?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.firstName || 'Prénom'} {user.lastName || 'Nom'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {user._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getUserTypeBadge(user.userType || 'particulier')}
                      </TableCell>
                      <TableCell>
                        {user.companyName ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user.companyName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(user._creationTime).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.userType === 'superadmin'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucun utilisateur trouvé</h3>
              <p className="text-sm text-muted-foreground">
                Aucun utilisateur ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouveau compte utilisateur
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userType">Type d'utilisateur *</Label>
                <Select value={userForm.userType} onValueChange={(value) => setUserForm({...userForm, userType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particulier">Particulier</SelectItem>
                    <SelectItem value="professionnel">Professionnel</SelectItem>
                    <SelectItem value="grossiste">Grossiste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(userForm.userType === 'professionnel' || userForm.userType === 'grossiste') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input
                      id="companyName"
                      value={userForm.companyName}
                      onChange={(e) => setUserForm({...userForm, companyName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siret">SIRET</Label>
                      <Input
                        id="siret"
                        value={userForm.siret}
                        onChange={(e) => setUserForm({...userForm, siret: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tvaNumber">Numéro TVA</Label>
                      <Input
                        id="tvaNumber"
                        value={userForm.tvaNumber}
                        onChange={(e) => setUserForm({...userForm, tvaNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer l'utilisateur</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de modification */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Nouveau mot de passe</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    placeholder="Laisser vide pour ne pas changer"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">Prénom *</Label>
                  <Input
                    id="edit-firstName"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Nom *</Label>
                  <Input
                    id="edit-lastName"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-userType">Type d'utilisateur *</Label>
                <Select 
                  value={userForm.userType} 
                  onValueChange={(value) => setUserForm({...userForm, userType: value})}
                  disabled={editingUser?.userType === 'superadmin'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particulier">Particulier</SelectItem>
                    <SelectItem value="professionnel">Professionnel</SelectItem>
                    <SelectItem value="grossiste">Grossiste</SelectItem>
                    {editingUser?.userType === 'superadmin' && (
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {(userForm.userType === 'professionnel' || userForm.userType === 'grossiste') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-companyName">Nom de l'entreprise</Label>
                    <Input
                      id="edit-companyName"
                      value={userForm.companyName}
                      onChange={(e) => setUserForm({...userForm, companyName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-siret">SIRET</Label>
                      <Input
                        id="edit-siret"
                        value={userForm.siret}
                        onChange={(e) => setUserForm({...userForm, siret: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-tvaNumber">Numéro TVA</Label>
                      <Input
                        id="edit-tvaNumber"
                        value={userForm.tvaNumber}
                        onChange={(e) => setUserForm({...userForm, tvaNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditUser(false)}>
                Annuler
              </Button>
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong> ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-destructive">
              ⚠️ Cette action est irréversible.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersModule
