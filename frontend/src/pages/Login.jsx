import React, { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'

const Login = ({ onLogin, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const createUser = useMutation(api.auth.createUser)
  const signIn = useMutation(api.auth.signIn)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const result = await createUser({ email, password, firstName, lastName })
        onLogin(result.userId)
      } else {
        const result = await signIn({ email, password })
        onLogin(result.userId)
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
  }

  if (!mounted) return null

  return (
    <>
      {/* Floating decorative elements */}
      <div className="floating-element" style={{ fontSize: '2rem' }}>✨</div>
      <div className="floating-element" style={{ fontSize: '1.5rem' }}>💫</div>
      <div className="floating-element" style={{ fontSize: '2.5rem' }}>🌟</div>
      
      <div className="auth-container">
        {onBack && (
          <button className="back-to-home-btn" onClick={onBack}>
            ← Retour au marketplace
          </button>
        )}
        
        <div className="auth-header">
          <h1 className="auth-title">
            {isSignUp ? 'Rejoignez-nous' : 'Bon retour'}
          </h1>
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
    </>
  )
}

export default Login
