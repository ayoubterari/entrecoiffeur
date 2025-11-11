import React, { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'
import { frenchCities } from '../data/frenchCities'

const LoginModal = ({ isOpen, onClose, onLogin, initialMode = 'signin' }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [city, setCity] = useState('')
  const [userType, setUserType] = useState('particulier')
  const [companyName, setCompanyName] = useState('')
  const [siret, setSiret] = useState('')
  const [tvaNumber, setTvaNumber] = useState('')
  const [isGroupMember, setIsGroupMember] = useState(false)
  const [groupAccessCode, setGroupAccessCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const createUser = useMutation(api.auth.createUser)
  const signIn = useMutation(api.auth.signIn)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setIsSignUp(initialMode === 'signup')
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, initialMode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const result = await createUser({ 
          email, 
          password, 
          firstName, 
          lastName, 
          city,
          userType,
          companyName: companyName || undefined,
          siret: siret || undefined,
          tvaNumber: tvaNumber || undefined,
          isGroupMember: isGroupMember || undefined,
          groupAccessCode: (isGroupMember && groupAccessCode) ? groupAccessCode : undefined
        })
        // Sauvegarder immédiatement les informations utilisateur
        localStorage.setItem('userEmail', result.email)
        localStorage.setItem('userFirstName', result.firstName || '')
        localStorage.setItem('userLastName', result.lastName || '')
        localStorage.setItem('userType', result.userType || '')
        localStorage.setItem('companyName', result.companyName || '')
        localStorage.setItem('isGroupMember', result.isGroupMember ? 'true' : 'false')
        localStorage.setItem('groupAccessCode', result.groupAccessCode || '')
        
        setSuccess(true)
        setTimeout(() => {
          onLogin(result.userId)
        }, 1000)
      } else {
        const result = await signIn({ email, password })
        // Sauvegarder immédiatement les informations utilisateur
        localStorage.setItem('userEmail', result.email)
        localStorage.setItem('userFirstName', result.firstName || '')
        localStorage.setItem('userLastName', result.lastName || '')
        localStorage.setItem('userType', result.userType || '')
        localStorage.setItem('companyName', result.companyName || '')
        
        setSuccess(true)
        setTimeout(() => {
          onLogin(result.userId)
        }, 1000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setCity('')
    setIsGroupMember(false)
    setGroupAccessCode('')
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleClose = () => {
    setError('')
    setSuccess(false)
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setCity('')
    setIsGroupMember(false)
    setGroupAccessCode('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          ×
        </button>
        
        <div className="auth-header">
          <h2 className="auth-title">
            {isSignUp ? 'Rejoignez-nous' : 'Bon retour'}
          </h2>
          <p className="auth-subtitle">
            {isSignUp 
              ? 'Créez votre compte pour accéder à la marketplace coiffure' 
              : 'Connectez-vous à votre espace Entre Coiffeur'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input"
                  required
                  autoComplete="given-name"
                />
              </div>
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nom de famille"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-input"
                  required
                  autoComplete="family-name"
                />
              </div>

              <div className="input-group">
                <label className="form-label">📍 Ville *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Sélectionnez votre ville</option>
                  {frenchCities.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="form-label">Type de compte</label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="particulier">👤 Particulier</option>
                  <option value="professionnel">💼 Professionnel</option>
                  <option value="grossiste">🏢 Grossiste</option>
                </select>
              </div>

              <div className="input-group">
                <label className="form-label">Appartenance à un groupe</label>
                <select
                  value={isGroupMember ? 'member' : 'individual'}
                  onChange={(e) => setIsGroupMember(e.target.value === 'member')}
                  className="form-select"
                  required
                >
                  <option value="individual">👤 Je n'appartiens pas à un groupe</option>
                  <option value="member">👥 Membre de groupe</option>
                </select>
              </div>

              {isGroupMember && (
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Code d'accès du groupe *"
                    value={groupAccessCode}
                    onChange={(e) => setGroupAccessCode(e.target.value)}
                    className="form-input"
                    required
                    maxLength={20}
                  />
                  <small className="form-hint">
                    Saisissez le code d'accès fourni par votre groupe
                  </small>
                </div>
              )}

              {(userType === 'professionnel' || userType === 'grossiste') && (
                <>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Nom de l'entreprise *"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Numéro SIRET (optionnel)"
                      value={siret}
                      onChange={(e) => setSiret(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Numéro TVA (optionnel)"
                      value={tvaNumber}
                      onChange={(e) => setTvaNumber(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </>
              )}
            </>
          )}
          
          <div className="input-group">
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="submit-button"
          >
            {loading && <span className="loading-spinner"></span>}
            {loading 
              ? 'Chargement...' 
              : (isSignUp ? 'Créer mon compte' : 'Se connecter')
            }
          </button>
        </form>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {isSignUp ? 'Compte créé avec succès ! Redirection...' : 'Connexion réussie ! Redirection...'}
          </div>
        )}

        <div className="auth-divider">
          <span>ou</span>
        </div>
        
        <div className="auth-toggle">
          {isSignUp 
            ? 'Vous avez déjà un compte ? ' 
            : 'Vous n\'avez pas encore de compte ? '
          }
          <span 
            className="auth-toggle-link"
            onClick={toggleMode}
          >
            {isSignUp ? 'Se connecter' : 'Créer un compte'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
