import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import {
  Settings,
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Switch } from '../ui/switch'

const SettingsModule = ({ currentUserId }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'admin',
    permissions: {
      dashboard: true,
      users: false,
      products: false,
      categories: false,
      orders: false,
      commissions: false,
      netvendeur: false,
      paiement: false,
      blog: false,
      coupons: false,
      reviews: false,
      support: false,
      stats: false,
      settings: false
    }
  })

  // Queries
  const adminUsers = useQuery(api.functions.queries.adminUsers.getAllAdminUsers)
  const allUsers = useQuery(api.auth.getAllUsers)

  // Mutations
  const createAdminUserComplete = useMutation(api.functions.mutations.adminUsers.createAdminUserComplete)
  const updateAdminPermissions = useMutation(api.functions.mutations.adminUsers.updateAdminPermissions)
  const updateAdminRole = useMutation(api.functions.mutations.adminUsers.updateAdminRole)
  const toggleAdminStatus = useMutation(api.functions.mutations.adminUsers.toggleAdminStatus)
  const deleteAdminUser = useMutation(api.functions.mutations.adminUsers.deleteAdminUser)

  // Filtrer les admins
  const filteredAdmins = adminUsers?.filter(admin =>
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Gérer le changement de permission
  const handlePermissionChange = (permission, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }))
  }

  // Créer un nouvel admin
  const handleCreateAdmin = async () => {
    try {
      // Validation
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        alert('Veuillez remplir tous les champs obligatoires')
        return
      }

      if (formData.password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères')
        return
      }

      // Créer le compte utilisateur complet avec permissions admin
      await createAdminUserComplete({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        permissions: formData.permissions,
        createdBy: currentUserId
      })

      // Réinitialiser le formulaire
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'admin',
        permissions: {
          dashboard: true,
          users: false,
          products: false,
          categories: false,
          orders: false,
          commissions: false,
          netvendeur: false,
          paiement: false,
          blog: false,
          coupons: false,
          reviews: false,
          support: false,
          stats: false,
          settings: false
        }
      })
      setIsCreateDialogOpen(false)
      alert('Utilisateur admin créé avec succès !')
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert('Erreur: ' + error.message)
    }
  }

  // Mettre à jour les permissions
  const handleUpdatePermissions = async () => {
    try {
      await updateAdminPermissions({
        adminUserId: selectedAdmin._id,
        permissions: formData.permissions
      })
      setIsEditDialogOpen(false)
      setSelectedAdmin(null)
      alert('Permissions mises à jour avec succès !')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur: ' + error.message)
    }
  }

  // Activer/Désactiver un admin
  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      await toggleAdminStatus({
        adminUserId: adminId,
        isActive: !currentStatus
      })
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  // Supprimer un admin
  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur admin ?')) {
      return
    }

    try {
      await deleteAdminUser({ adminUserId: adminId })
      alert('Utilisateur admin supprimé avec succès !')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  // Ouvrir le dialog d'édition
  const openEditDialog = (admin) => {
    setSelectedAdmin(admin)
    setFormData({
      ...formData,
      permissions: admin.permissions
    })
    setIsEditDialogOpen(true)
  }

  // Obtenir l'icône du rôle
  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin':
        return <ShieldCheck className="h-4 w-4 text-purple-600" />
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />
      case 'moderator':
        return <ShieldAlert className="h-4 w-4 text-orange-600" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  // Obtenir le badge du rôle
  const getRoleBadge = (role) => {
    const config = {
      superadmin: { label: 'Super Admin', variant: 'default', color: 'bg-purple-100 text-purple-800' },
      admin: { label: 'Admin', variant: 'secondary', color: 'bg-blue-100 text-blue-800' },
      moderator: { label: 'Modérateur', variant: 'outline', color: 'bg-orange-100 text-orange-800' }
    }
    const { label, color } = config[role] || config.admin
    return <Badge className={color}>{label}</Badge>
  }

  // Liste des modules avec leurs labels
  const modules = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'users', label: 'Utilisateurs', icon: '👥' },
    { key: 'products', label: 'Produits', icon: '📦' },
    { key: 'categories', label: 'Catégories', icon: '🏷️' },
    { key: 'orders', label: 'Commandes', icon: '🛒' },
    { key: 'commissions', label: 'Commissions', icon: '💰' },
    { key: 'netvendeur', label: 'Net Vendeur', icon: '💳' },
    { key: 'paiement', label: 'Paiements', icon: '💵' },
    { key: 'blog', label: 'Blog', icon: '📝' },
    { key: 'coupons', label: 'Coupons', icon: '🎟️' },
    { key: 'reviews', label: 'Avis', icon: '💬' },
    { key: 'support', label: 'Support', icon: '🎧' },
    { key: 'stats', label: 'Statistiques', icon: '📈' },
    { key: 'settings', label: 'Paramètres', icon: '⚙️' }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Paramètres
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des utilisateurs admin et permissions
          </p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Admin
        </Button>
      </div>

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Utilisateurs Admin ({filteredAdmins?.length || 0})
          </CardTitle>
          <CardDescription>Gérez les accès et permissions des administrateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Liste des admins */}
          <div className="space-y-3">
            {filteredAdmins && filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <Card key={admin._id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                          {getRoleIcon(admin.role)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {admin.firstName} {admin.lastName}
                            </h3>
                            {getRoleBadge(admin.role)}
                            {!admin.isActive && (
                              <Badge variant="destructive">Désactivé</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              Accès: {Object.values(admin.permissions).filter(Boolean).length} modules
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(admin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(admin._id, admin.isActive)}
                        >
                          {admin.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun utilisateur admin trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Création */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur admin</DialogTitle>
            <DialogDescription>
              Définissez les accès et permissions pour ce nouvel administrateur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 caractères"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 6 caractères
              </p>
            </div>

            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  placeholder="Nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Rôle */}
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">Super Admin (Accès complet)</SelectItem>
                  <SelectItem value="admin">Admin (Selon permissions)</SelectItem>
                  <SelectItem value="moderator">Modérateur (Accès limité)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissions */}
            <div>
              <Label className="mb-3 block">Permissions d'accès aux modules</Label>
              <div className="grid grid-cols-2 gap-3">
                {modules.map((module) => (
                  <div key={module.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{module.icon}</span>
                      <Label htmlFor={module.key} className="cursor-pointer">
                        {module.label}
                      </Label>
                    </div>
                    <Switch
                      id={module.key}
                      checked={formData.permissions[module.key]}
                      onCheckedChange={(checked) => handlePermissionChange(module.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateAdmin}>
              <Check className="h-4 w-4 mr-2" />
              Créer l'admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier les permissions</DialogTitle>
            <DialogDescription>
              {selectedAdmin && `${selectedAdmin.firstName} ${selectedAdmin.lastName} (${selectedAdmin.email})`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Permissions */}
            <div>
              <Label className="mb-3 block">Permissions d'accès aux modules</Label>
              <div className="grid grid-cols-2 gap-3">
                {modules.map((module) => (
                  <div key={module.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{module.icon}</span>
                      <Label htmlFor={`edit-${module.key}`} className="cursor-pointer">
                        {module.label}
                      </Label>
                    </div>
                    <Switch
                      id={`edit-${module.key}`}
                      checked={formData.permissions[module.key]}
                      onCheckedChange={(checked) => handlePermissionChange(module.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdatePermissions}>
              <Check className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SettingsModule
