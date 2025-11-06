import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import { 
  ArrowLeft, 
  MapPin, 
  Ruler, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Home,
  Users,
  FileText,
  Phone,
  Mail,
  Share2,
  Heart,
  AlertCircle,
  CheckCircle,
  Building2,
  Briefcase,
  Clock,
  Euro
} from 'lucide-react'
import BusinessSaleContactModal from '../components/BusinessSaleContactModal'
import './BusinessSaleDetail.css'

const BusinessSaleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Récupérer les détails du fonds de commerce
  const business = useQuery(api.functions.queries.businessSales.getById, { id })
  const incrementViews = useMutation(api.functions.mutations.businessSales.incrementViews)
  const incrementContacts = useMutation(api.functions.mutations.businessSales.incrementContactCount)

  // Incrémenter les vues au chargement
  React.useEffect(() => {
    if (business) {
      incrementViews({ id })
    }
  }, [business, id])

  // Formater le prix en format court
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M €`
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k €`
    }
    return `${price} €`
  }

  const formatRevenue = (revenue) => {
    const numRevenue = typeof revenue === 'string' ? parseFloat(revenue.replace(/[^0-9]/g, '')) : revenue
    if (isNaN(numRevenue)) return revenue
    
    if (numRevenue >= 1000000) {
      return `${(numRevenue / 1000000).toFixed(1)}M €`
    } else if (numRevenue >= 1000) {
      return `${(numRevenue / 1000).toFixed(0)}k €`
    }
    return `${numRevenue} €`
  }

  const handleContact = () => {
    // Vérifier si l'utilisateur est connecté
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Veuillez vous connecter pour contacter le vendeur')
      return
    }

    // Vérifier que ce n'est pas le vendeur lui-même
    if (business && userId === business.sellerId) {
      alert('Vous ne pouvez pas contacter votre propre annonce')
      return
    }

    setShowContactModal(true)
  }

  const handleContactSuccess = async (conversationId) => {
    // Incrémenter le compteur de contacts
    await incrementContacts({ id })
    
    // Fermer le modal
    setShowContactModal(false)
    
    // Afficher un message de succès
    alert('✅ Message envoyé ! Vous pouvez continuer la conversation depuis votre tableau de bord dans la section "Messages".')
    
    // Optionnel : rediriger vers le dashboard/messages
    // navigate('/dashboard?tab=messages')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.activityType,
        text: `Découvrez ce fonds de commerce à vendre`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papier !')
    }
  }

  if (!business) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des détails...</p>
      </div>
    )
  }

  const images = business.images && business.images.length > 0 
    ? business.images 
    : ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop']

  return (
    <div className="business-detail-container">
      {/* Header avec retour */}
      <header className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <div className="header-actions">
          <button 
            onClick={() => setIsFavorite(!isFavorite)} 
            className={`icon-button ${isFavorite ? 'active' : ''}`}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button onClick={handleShare} className="icon-button">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* Galerie d'images */}
      <section className="image-gallery">
        <div className="main-image">
          <img 
            src={images[selectedImageIndex]} 
            alt={business.activityType}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
            }}
          />
          <div className="image-badge">
            <Building2 size={16} />
            <span>Fonds de Commerce</span>
          </div>
        </div>
        
        {images.length > 1 && (
          <div className="image-thumbnails">
            {images.map((img, index) => (
              <div 
                key={index}
                className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img 
                  src={img} 
                  alt={`Photo ${index + 1}`}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=150&fit=crop'
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Informations principales */}
      <div className="content-wrapper">
        <div className="main-content">
          {/* Titre et localisation */}
          <section className="title-section">
            <h1>{business.activityType}</h1>
            <div className="business-meta">
              <span className="meta-item">
                <MapPin size={16} />
                {business.city}, {business.district}
              </span>
              <span className="meta-item">
                <Ruler size={16} />
                {business.totalArea} m²
              </span>
              <span className="meta-item">
                <Calendar size={16} />
                Créé en {business.creationYear}
              </span>
            </div>
          </section>

          {/* Prix principal */}
          <section className="price-section">
            <div className="price-card">
              <div className="price-label">Prix de vente</div>
              <div className="price-value">{formatPrice(business.salePrice)}</div>
            </div>
            <div className="price-details">
              <div className="price-detail-item">
                <TrendingUp size={18} />
                <div>
                  <span className="label">CA annuel</span>
                  <span className="value">{formatRevenue(business.annualRevenue)}</span>
                </div>
              </div>
              <div className="price-detail-item">
                <Home size={18} />
                <div>
                  <span className="label">Loyer mensuel</span>
                  <span className="value">{formatPrice(business.monthlyRent)}/mois</span>
                </div>
              </div>
              {business.netProfit && (
                <div className="price-detail-item">
                  <DollarSign size={18} />
                  <div>
                    <span className="label">Résultat net</span>
                    <span className="value">{formatRevenue(business.netProfit)}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Description du local */}
          <section className="info-section">
            <h2>
              <Home size={20} />
              Description du local
            </h2>
            <p className="description-text">{business.localDescription}</p>
          </section>

          {/* Informations commerciales */}
          <section className="info-section">
            <h2>
              <Briefcase size={20} />
              Informations commerciales
            </h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">
                  <Building2 size={20} />
                </div>
                <div className="info-content">
                  <span className="info-label">Nom commercial</span>
                  <span className="info-value">{business.businessName}</span>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">
                  <FileText size={20} />
                </div>
                <div className="info-content">
                  <span className="info-label">Statut juridique</span>
                  <span className="info-value">{business.legalStatus}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <Users size={20} />
                </div>
                <div className="info-content">
                  <span className="info-label">Type de clientèle</span>
                  <span className="info-value">{business.clienteleType}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <MapPin size={20} />
                </div>
                <div className="info-content">
                  <span className="info-label">Flux de passage</span>
                  <span className="info-value">{business.footTraffic}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Équipements inclus */}
          <section className="info-section">
            <h2>
              <CheckCircle size={20} />
              Équipements inclus
            </h2>
            <p className="description-text">{business.includedEquipment}</p>
          </section>

          {/* Détails financiers */}
          <section className="info-section">
            <h2>
              <Euro size={20} />
              Détails financiers
            </h2>
            <div className="financial-grid">
              <div className="financial-item">
                <span className="financial-label">Loyer mensuel</span>
                <span className="financial-value">{formatPrice(business.monthlyRent)}</span>
              </div>
              {business.fixedCharges && (
                <div className="financial-item">
                  <span className="financial-label">Charges fixes</span>
                  <span className="financial-value">{business.fixedCharges}</span>
                </div>
              )}
              <div className="financial-item">
                <span className="financial-label">Durée du bail restante</span>
                <span className="financial-value">{business.leaseRemaining}</span>
              </div>
              {business.deposit && (
                <div className="financial-item">
                  <span className="financial-label">Dépôt de garantie</span>
                  <span className="financial-value">{business.deposit}</span>
                </div>
              )}
            </div>
          </section>

          {/* Informations complémentaires */}
          {(business.recentWorks || business.compliance || business.developmentPotential) && (
            <section className="info-section">
              <h2>
                <AlertCircle size={20} />
                Informations complémentaires
              </h2>
              {business.recentWorks && (
                <div className="additional-info">
                  <h3>Travaux récents</h3>
                  <p>{business.recentWorks}</p>
                </div>
              )}
              {business.compliance && (
                <div className="additional-info">
                  <h3>Conformité et autorisations</h3>
                  <p>{business.compliance}</p>
                </div>
              )}
              {business.developmentPotential && (
                <div className="additional-info">
                  <h3>Potentiel de développement</h3>
                  <p>{business.developmentPotential}</p>
                </div>
              )}
            </section>
          )}

          {/* Raison de la vente */}
          <section className="info-section highlight-section">
            <h2>
              <FileText size={20} />
              Raison de la vente
            </h2>
            <p className="description-text">{business.saleReason}</p>
          </section>
        </div>

        {/* Sidebar - Contact */}
        <aside className="sidebar">
          <div className="contact-card sticky">
            <h3>Intéressé par ce fonds de commerce ?</h3>
            <div className="contact-price">
              <span className="contact-price-label">Prix de vente</span>
              <span className="contact-price-value">{formatPrice(business.salePrice)}</span>
            </div>
            
            <button onClick={handleContact} className="contact-button">
              <Phone size={20} />
              Contacter le vendeur
            </button>
            
            <div className="contact-info">
              <p className="contact-note">
                <AlertCircle size={16} />
                Un conseiller vous mettra en relation avec le vendeur
              </p>
            </div>

            <div className="business-stats">
              <div className="stat-item">
                <Clock size={16} />
                <span>Publié il y a {Math.floor((Date.now() - business.createdAt) / (1000 * 60 * 60 * 24))} jours</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal de contact avec messagerie */}
      <BusinessSaleContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        businessSale={business}
        buyerId={localStorage.getItem('userId')}
        onSuccess={handleContactSuccess}
      />
    </div>
  )
}

export default BusinessSaleDetail
