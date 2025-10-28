import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'

const UsersManagement = () => {
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

  // Debug: afficher le nombre d'utilisateurs (temporaire)
  // console.log('Tous les utilisateurs:', allUsers?.length, allUsers)

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
    // S'assurer que l'utilisateur a au minimum un email
    if (!user.email) return false
    
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterUserType === 'all' || user.userType === filterUserType
    return matchesSearch && matchesType
  }) || []

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
      password: '', // Ne pas pré-remplir le mot de passe
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
        delete updateData.password // Ne pas mettre à jour le mot de passe s'il est vide
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

  const getUserTypeLabel = (type) => {
    switch (type) {
      case 'particulier': return '👤 Particulier'
      case 'professionnel': return '💼 Professionnel'
      case 'grossiste': return '🏢 Grossiste'
      case 'superadmin': return '👑 Super Admin'
      default: return type
    }
  }

  const getUserTypeColor = (type) => {
    switch (type) {
      case 'particulier': return '#4CAF50'
      case 'professionnel': return '#2196F3'
      case 'grossiste': return '#FF9800'
      case 'superadmin': return '#2d2d2d'
      default: return '#757575'
    }
  }

  return (
    <div className="modern-users-management">
      <div className="modern-users-header">
        <div className="header-content">
          <h2>👥 Gestion des Utilisateurs</h2>
          <p>Gérez tous les utilisateurs de la plateforme avec style</p>
        </div>
        <button 
          className="modern-add-user-btn"
          onClick={() => setShowAddUser(true)}
        >
          ➕ Ajouter un utilisateur
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="modern-users-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterUserType}
            onChange={(e) => setFilterUserType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les types</option>
            <option value="particulier">👤 Particuliers</option>
            <option value="professionnel">💼 Professionnels</option>
            <option value="grossiste">🏢 Grossistes</option>
            <option value="superadmin">👑 Super Admin</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="modern-users-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{allUsers?.length || 0}</h3>
            <p>Total utilisateurs</p>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="modern-users-table-container">
        {filteredUsers.length > 0 ? (
          <div className="table-wrapper">
            <table className="modern-users-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Entreprise</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="avatar-cell">
                      <div className="user-avatar-small">
                        <div 
                          className="avatar-circle-small" 
                          style={{ backgroundColor: getUserTypeColor(user.userType || 'particulier') }}
                        >
                          {(user.firstName?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="user-cell">
                      <div className="user-info-table">
                        <h4>{user.firstName || 'Prénom'} {user.lastName || 'Nom'}</h4>
                        <p className="user-id">ID: {user._id.slice(-8)}</p>
                      </div>
                    </td>
                    <td className="email-cell">
                      <span className="user-email">{user.email}</span>
                    </td>
                    <td className="type-cell">
                      <span 
                        className="user-type-badge-table"
                        style={{ backgroundColor: getUserTypeColor(user.userType || 'particulier') }}
                      >
                        {getUserTypeLabel(user.userType || 'particulier')}
                      </span>
                    </td>
                    <td className="company-cell">
                      {user.companyName ? (
                        <span className="company-name">🏢 {user.companyName}</span>
                      ) : (
                        <span className="no-company">-</span>
                      )}
                    </td>
                    <td className="date-cell">
                      <span className="join-date">
                        {new Date(user._creationTime).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="table-actions">
                        <button 
                          className="table-btn edit"
                          onClick={() => handleEditUser(user)}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button 
                          className="table-btn delete"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.userType === 'superadmin'}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Aucun utilisateur trouvé</h3>
            <p>Aucun utilisateur ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Modal d'ajout d'utilisateur */}
      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Ajouter un utilisateur</h3>
              <button className="modal-close" onClick={() => setShowAddUser(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateUser} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe *</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Type d'utilisateur *</label>
                <select
                  value={userForm.userType}
                  onChange={(e) => setUserForm({...userForm, userType: e.target.value})}
                  className="form-input"
                >
                  <option value="particulier">👤 Particulier</option>
                  <option value="professionnel">💼 Professionnel</option>
                  <option value="grossiste">🏢 Grossiste</option>
                </select>
              </div>
              
              {(userForm.userType === 'professionnel' || userForm.userType === 'grossiste') && (
                <>
                  <div className="form-group">
                    <label>Nom de l'entreprise</label>
                    <input
                      type="text"
                      value={userForm.companyName}
                      onChange={(e) => setUserForm({...userForm, companyName: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>SIRET</label>
                      <input
                        type="text"
                        value={userForm.siret}
                        onChange={(e) => setUserForm({...userForm, siret: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Numéro TVA</label>
                      <input
                        type="text"
                        value={userForm.tvaNumber}
                        onChange={(e) => setUserForm({...userForm, tvaNumber: e.target.value})}
                        className="form-input"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddUser(false)}>
                  Annuler
                </button>
                <button type="submit" className="save-btn">
                  Créer l'utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditUser && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditUser(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Modifier l'utilisateur</h3>
              <button className="modal-close" onClick={() => setShowEditUser(false)}>×</button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="form-input"
                    placeholder="Laisser vide pour ne pas changer"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Type d'utilisateur *</label>
                <select
                  value={userForm.userType}
                  onChange={(e) => setUserForm({...userForm, userType: e.target.value})}
                  className="form-input"
                  disabled={editingUser.userType === 'superadmin'}
                >
                  <option value="particulier">👤 Particulier</option>
                  <option value="professionnel">💼 Professionnel</option>
                  <option value="grossiste">🏢 Grossiste</option>
                  {editingUser.userType === 'superadmin' && (
                    <option value="superadmin">👑 Super Admin</option>
                  )}
                </select>
              </div>
              
              {(userForm.userType === 'professionnel' || userForm.userType === 'grossiste') && (
                <>
                  <div className="form-group">
                    <label>Nom de l'entreprise</label>
                    <input
                      type="text"
                      value={userForm.companyName}
                      onChange={(e) => setUserForm({...userForm, companyName: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>SIRET</label>
                      <input
                        type="text"
                        value={userForm.siret}
                        onChange={(e) => setUserForm({...userForm, siret: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Numéro TVA</label>
                      <input
                        type="text"
                        value={userForm.tvaNumber}
                        onChange={(e) => setUserForm({...userForm, tvaNumber: e.target.value})}
                        className="form-input"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditUser(false)}>
                  Annuler
                </button>
                <button type="submit" className="save-btn">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && userToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗑️ Supprimer l'utilisateur</h3>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            
            <div className="confirm-content">
              <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete.firstName} {userToDelete.lastName}</strong> ?</p>
              <p className="warning">⚠️ Cette action est irréversible.</p>
            </div>
            
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </button>
              <button className="delete-btn" onClick={confirmDeleteUser}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersManagement
