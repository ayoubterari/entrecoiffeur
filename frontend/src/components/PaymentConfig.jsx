import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'

const PaymentConfig = () => {
  const [environment, setEnvironment] = useState('sandbox')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Queries et mutations
  const paypalConfig = useQuery(api.payments.getPayPalConfig)
  const updateConfig = useMutation(api.payments.updatePayPalConfig)
  const testConnection = useMutation(api.payments.testPayPalConnection)

  // Charger la configuration existante
  useEffect(() => {
    if (paypalConfig) {
      setEnvironment(paypalConfig.environment || 'sandbox')
      setClientId(paypalConfig.clientId || '')
      setClientSecret(paypalConfig.clientSecret || '')
      setWebhookUrl(paypalConfig.webhookUrl || '')
    }
  }, [paypalConfig])

  const handleSaveConfig = async () => {
    if (!clientId.trim()) {
      alert('Le Client ID est requis')
      return
    }
    if (!clientSecret.trim()) {
      alert('Le Client Secret est requis')
      return
    }

    setIsSaving(true)
    try {
      await updateConfig({
        environment,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        webhookUrl: webhookUrl.trim(),
        isActive: true
      })
      
      alert('Configuration PayPal sauvegardée avec succès!')
      setTestResult(null)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de la configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      alert('Veuillez sauvegarder la configuration avant de tester')
      return
    }

    setIsTestingConnection(true)
    try {
      const result = await testConnection({
        environment,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim()
      })
      
      setTestResult(result)
    } catch (error) {
      console.error('Erreur lors du test:', error)
      setTestResult({
        success: false,
        message: 'Erreur lors du test de connexion'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="payment-config-container">
      <div className="payment-header">
        <div className="header-content">
          <div className="header-icon">💳</div>
          <div className="header-text">
            <h2>Configuration PayPal</h2>
            <p>Gérez les paramètres de paiement pour votre plateforme</p>
          </div>
        </div>
        
        <div className="config-status-card">
          <div className="status-indicator">
            <div className={`status-dot ${paypalConfig?.isActive ? 'active' : 'inactive'}`}></div>
            <span className="status-text">
              {paypalConfig?.isActive ? 'Configuration active' : 'Configuration inactive'}
            </span>
          </div>
          <div className="environment-badge">
            <span className={`env-badge ${environment}`}>
              {environment === 'sandbox' ? '🧪 Test' : '🚀 Production'}
            </span>
          </div>
        </div>
      </div>

      <div className="config-sections">
        {/* Section Environnement */}
        <div className="config-section">
          <div className="section-header">
            <h3>🌍 Environnement</h3>
            <p>Choisissez l'environnement PayPal à utiliser</p>
          </div>
          
          <div className="environment-selector">
            <div className="radio-group">
              <label className={`radio-option ${environment === 'sandbox' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="environment"
                  value="sandbox"
                  checked={environment === 'sandbox'}
                  onChange={(e) => setEnvironment(e.target.value)}
                />
                <div className="radio-content">
                  <div className="radio-icon">🧪</div>
                  <div className="radio-text">
                    <h4>Sandbox (Test)</h4>
                    <p>Environnement de test pour le développement</p>
                  </div>
                </div>
              </label>
              
              <label className={`radio-option ${environment === 'live' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="environment"
                  value="live"
                  checked={environment === 'live'}
                  onChange={(e) => setEnvironment(e.target.value)}
                />
                <div className="radio-content">
                  <div className="radio-icon">🚀</div>
                  <div className="radio-text">
                    <h4>Live (Production)</h4>
                    <p>Environnement de production pour les vrais paiements</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section Identifiants */}
        <div className="config-section">
          <div className="section-header">
            <h3>🔑 Identifiants PayPal</h3>
            <p>Configurez vos identifiants d'application PayPal</p>
          </div>
          
          <div className="credentials-form">
            <div className="input-group">
              <label htmlFor="clientId">Client ID</label>
              <input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Votre PayPal Client ID"
                className="config-input"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="clientSecret">Client Secret</label>
              <div className="secret-input-group">
                <input
                  id="clientSecret"
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Votre PayPal Client Secret"
                  className="config-input"
                />
                <button
                  type="button"
                  className="toggle-secret-btn"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="webhookUrl">Webhook URL (Optionnel)</label>
              <input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://votre-domaine.com/webhook/paypal"
                className="config-input"
              />
              <small className="input-help">
                URL pour recevoir les notifications PayPal (IPN)
              </small>
            </div>
          </div>
        </div>

        {/* Section Actions */}
        <div className="config-section">
          <div className="section-header">
            <h3>🚀 Actions</h3>
            <p>Sauvegardez et testez votre configuration</p>
          </div>
          
          <div className="actions-grid">
            <button
              className="action-btn save-btn"
              onClick={handleSaveConfig}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
            
            <button
              className="action-btn test-btn"
              onClick={handleTestConnection}
              disabled={isTestingConnection || !paypalConfig?.isActive}
            >
              {isTestingConnection ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Test en cours...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">🔧</span>
                  <span>Tester la connexion</span>
                </>
              )}
            </button>
          </div>
          
          {/* Résultat du test */}
          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              <div className="result-icon">
                {testResult.success ? '✅' : '❌'}
              </div>
              <div className="result-content">
                <h4>{testResult.success ? 'Test réussi!' : 'Test échoué'}</h4>
                <p>{testResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Section Aide */}
        <div className="config-section help-section">
          <div className="section-header">
            <h3>❓ Guide d'aide</h3>
            <p>Comment obtenir vos identifiants PayPal</p>
          </div>
          
          <div className="help-content">
            <div className="help-steps">
              <div className="help-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Créer une application PayPal</h4>
                  <p>Rendez-vous sur <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer">developer.paypal.com</a></p>
                </div>
              </div>
              
              <div className="help-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Obtenir les identifiants</h4>
                  <p>Copiez le Client ID et Client Secret de votre application</p>
                </div>
              </div>
              
              <div className="help-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Configurer les webhooks</h4>
                  <p>Ajoutez l'URL de webhook pour recevoir les notifications</p>
                </div>
              </div>
            </div>
            
            <div className="help-warning">
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <h4>Important</h4>
                <p>Utilisez toujours l'environnement Sandbox pour les tests. Ne passez en Live qu'après validation complète.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentConfig
