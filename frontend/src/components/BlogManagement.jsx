import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import ImageUpload from './ImageUpload'

const BlogManagement = ({ userEmail }) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: '',
    tags: '',
    featured: false,
    status: 'draft',
    seoTitle: '',
    seoDescription: ''
  })
  const [uploadedImages, setUploadedImages] = useState([])

  // Queries
  const articles = useQuery(api.functions.queries.blog.getAllArticlesForAdmin, {
    userEmail: userEmail
  })
  const categories = useQuery(api.functions.queries.blog.getBlogCategories)

  // Mutations
  const createArticle = useMutation(api.functions.mutations.blog.createArticle)
  const updateArticle = useMutation(api.functions.mutations.blog.updateArticle)
  const deleteArticle = useMutation(api.functions.mutations.blog.deleteArticle)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const articleData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        featuredImage: uploadedImages.length > 0 ? uploadedImages[0].url : formData.featuredImage
      }

      if (editingArticle) {
        await updateArticle({
          articleId: editingArticle._id,
          userEmail: userEmail,
          ...articleData
        })
      } else {
        await createArticle({
          ...articleData,
          userEmail: userEmail
        })
      }

      // Reset form
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        category: '',
        tags: '',
        featured: false,
        status: 'draft',
        seoTitle: '',
        seoDescription: ''
      })
      setUploadedImages([])
      setShowCreateForm(false)
      setEditingArticle(null)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de l\'article')
    }
  }

  const handleEdit = (article) => {
    setEditingArticle(article)
    setFormData({
      title: article.title || '',
      excerpt: article.excerpt || '',
      content: article.content || '',
      featuredImage: article.featuredImage || '',
      category: article.category || '',
      tags: article.tags ? article.tags.join(', ') : '',
      featured: article.featured || false,
      status: article.status || 'draft',
      seoTitle: article.seoTitle || '',
      seoDescription: article.seoDescription || ''
    })
    // Reset images pour l'édition (on garde l'URL existante)
    setUploadedImages([])
    setShowCreateForm(true)
  }

  const handleDelete = async (articleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await deleteArticle({ 
          articleId,
          userEmail: userEmail
        })
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression de l\'article')
      }
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { text: 'Brouillon', class: 'status-draft', icon: '📝' },
      published: { text: 'Publié', class: 'status-published', icon: '✅' },
      archived: { text: 'Archivé', class: 'status-archived', icon: '📦' }
    }
    const badge = badges[status] || badges.draft
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.icon} {badge.text}
      </span>
    )
  }

  return (
    <div className="blog-management">
      <div className="blog-header">
        <div className="blog-title">
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            setShowCreateForm(true)
            setEditingArticle(null)
            setFormData({
              title: '',
              excerpt: '',
              content: '',
              featuredImage: '',
              category: '',
              tags: '',
              featured: false,
              status: 'draft',
              seoTitle: '',
              seoDescription: ''
            })
            setUploadedImages([])
          }}
        >
          ✨ Nouvel Article
        </button>
      </div>
      {/* Statistiques rapides */}
      <div className="blog-stats">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>{articles?.length || 0}</h3>
            <p>Articles total</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{articles?.filter(a => a.status === 'published').length || 0}</h3>
            <p>Publiés</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{articles?.filter(a => a.status === 'draft').length || 0}</h3>
            <p>Brouillons</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{articles?.filter(a => a.featured).length || 0}</h3>
            <p>En vedette</p>
          </div>
        </div>
      </div>

      {/* Formulaire de création/édition */}
      {showCreateForm && (
        <div className="blog-form-overlay">
          <div className="blog-form-container">
            <div className="blog-form-header">
              <h3>{editingArticle ? '✏️ Modifier l\'article' : '✨ Nouvel Article'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingArticle(null)
                  setUploadedImages([])
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="blog-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="title">Titre de l'article *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Entrez le titre de votre article..."
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="excerpt">Résumé *</label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Résumé court de l'article (affiché dans la liste)..."
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="content">Contenu de l'article *</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Rédigez le contenu complet de votre article..."
                    rows="10"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Image principale</label>
                  <div className="image-upload-section">
                    <div className="image-url-input">
                      <label htmlFor="featuredImageUrl">URL de l'image (recommandé)</label>
                      <input
                        type="url"
                        id="featuredImageUrl"
                        name="featuredImage"
                        value={formData.featuredImage}
                        onChange={handleInputChange}
                        placeholder="https://images.unsplash.com/photo-... ou votre URL d'image"
                      />
                      <div className="url-examples">
                        <p><strong>💡 Exemples d'URLs gratuites :</strong></p>
                        <p>• Unsplash : https://images.unsplash.com/photo-...</p>
                        <p>• Pexels : https://images.pexels.com/photos/...</p>
                        <p>• Votre serveur : https://monsite.com/images/...</p>
                      </div>
                    </div>
                    
                    <div className="divider">
                      <span>OU</span>
                    </div>
                    
                    <div className="upload-section">
                      <ImageUpload
                        images={uploadedImages}
                        onImagesChange={setUploadedImages}
                        maxImages={1}
                      />
                      <div className="image-info-box">
                        <p><strong>⚠️ Attention :</strong></p>
                        <p>Les images uploadées sont temporaires et disparaîtront après rechargement. Utilisez plutôt une URL d'image ci-dessus.</p>
                      </div>
                    </div>
                    
                    {formData.featuredImage && uploadedImages.length === 0 && (
                      <div className="existing-image">
                        <p>Aperçu de l'image :</p>
                        <img src={formData.featuredImage} alt="Aperçu" style={{maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px'}} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Catégorie</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="tendances">Tendances</option>
                    <option value="beaute">Beauté</option>
                    <option value="maquillage">Maquillage</option>
                    <option value="business">Business</option>
                    <option value="naturel">Naturel</option>
                    <option value="formation">Formation</option>
                    <option value="conseils">Conseils</option>
                    <option value="actualites">Actualités</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tags">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="coiffure, beauté, tendances (séparés par des virgules)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Statut</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Article en vedette
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="seoTitle">Titre SEO</label>
                  <input
                    type="text"
                    id="seoTitle"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    placeholder="Titre optimisé pour les moteurs de recherche..."
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="seoDescription">Description SEO</label>
                  <textarea
                    id="seoDescription"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    placeholder="Description pour les moteurs de recherche (160 caractères max)..."
                    rows="2"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingArticle(null)
                    setUploadedImages([])
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingArticle ? '💾 Mettre à jour' : '✨ Créer l\'article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des articles */}
      <div className="blog-articles-list">
        <div className="articles-header">
          <h3>📚 Articles existants</h3>
          <div className="articles-filters">
            {/* Filtres à implémenter plus tard */}
          </div>
        </div>

        {articles?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Aucun article pour le moment</h3>
            <p>Commencez par créer votre premier article de blog</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setShowCreateForm(true)
                setEditingArticle(null)
                setUploadedImages([])
              }}
            >
              ✨ Créer le premier article
            </button>
          </div>
        ) : (
          <div className="articles-grid">
            {articles?.map((article) => (
              <div key={article._id} className="article-card">
                <div className="article-header">
                  <div className="article-meta">
                    {getStatusBadge(article.status)}
                    {article.featured && (
                      <span className="featured-badge">⭐ Vedette</span>
                    )}
                  </div>
                  <div className="article-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEdit(article)}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(article._id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {article.featuredImage && (
                  <div className="article-image">
                    <img src={article.featuredImage} alt={article.title} />
                  </div>
                )}

                <div className="article-content">
                  <h4>{article.title}</h4>
                  <p className="article-excerpt">{article.excerpt}</p>
                  
                  <div className="article-details">
                    {article.category && (
                      <span className="article-category">
                        🏷️ {article.category}
                      </span>
                    )}
                    <span className="article-date">
                      📅 {formatDate(article.createdAt)}
                    </span>
                    {article.viewCount && (
                      <span className="article-views">
                        👁️ {article.viewCount} vues
                      </span>
                    )}
                  </div>

                  {article.tags && article.tags.length > 0 && (
                    <div className="article-tags">
                      {article.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="article-footer">
                  <span className="article-author">
                    ✍️ {article.author?.firstName} {article.author?.lastName}
                  </span>
                  <span className="article-slug">
                    🔗 /{article.slug}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .blog-management {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .blog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .blog-title h2 {
          margin: 0;
          color: #2d3748;
          font-size: 1.8rem;
        }

        .blog-title p {
          margin: 5px 0 0 0;
          color: #718096;
          font-size: 0.9rem;
        }

        .blog-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 2rem;
          margin-right: 15px;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #2d3748;
        }

        .stat-info p {
          margin: 5px 0 0 0;
          color: #718096;
          font-size: 0.9rem;
        }

        .blog-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .blog-form-container {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .blog-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .blog-form-header h3 {
          margin: 0;
          color: #2d3748;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #718096;
          padding: 5px;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: #f7fafc;
          color: #2d3748;
        }

        .blog-form {
          padding: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #2d3748;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #2d2d2d;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          margin: 0;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin-right: 10px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2d2d2d, #2d2d2d);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
        }

        .btn-secondary {
          background: #f7fafc;
          color: #2d3748;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #edf2f7;
        }

        .articles-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .articles-header h3 {
          margin: 0;
          color: #2d3748;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          color: #2d3748;
          margin-bottom: 10px;
        }

        .empty-state p {
          color: #718096;
          margin-bottom: 30px;
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .article-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .article-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        }

        .article-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
        }

        .article-meta {
          display: flex;
          gap: 10px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-draft {
          background: #fef5e7;
          color: #d69e2e;
        }

        .status-published {
          background: #f0fff4;
          color: #38a169;
        }

        .status-archived {
          background: #f7fafc;
          color: #718096;
        }

        .featured-badge {
          background: linear-gradient(135deg, #2d2d2d, #2d2d2d);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .article-actions {
          display: flex;
          gap: 5px;
        }

        .action-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .article-image {
          height: 150px;
          overflow: hidden;
        }

        .article-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .article-content {
          padding: 15px;
        }

        .article-content h4 {
          margin: 0 0 10px 0;
          color: #2d3748;
          font-size: 1.1rem;
          line-height: 1.4;
        }

        .article-excerpt {
          color: #718096;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 15px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .article-details {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
        }

        .article-category,
        .article-date,
        .article-views {
          font-size: 0.8rem;
          color: #718096;
          background: #f7fafc;
          padding: 4px 8px;
          border-radius: 12px;
        }

        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 15px;
        }

        .tag {
          background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(102, 126, 234, 0.1));
          color: #2d2d2d;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .article-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-top: 1px solid rgba(226, 232, 240, 0.5);
          font-size: 0.8rem;
          color: #718096;
        }

        .existing-image {
          margin-top: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .existing-image p {
          margin: 0 0 10px 0;
          color: #718096;
          font-size: 0.9rem;
        }

        .image-upload-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .image-info-box {
          background: rgba(255, 107, 157, 0.05);
          border: 1px solid rgba(255, 107, 157, 0.2);
          border-radius: 8px;
          padding: 15px;
        }

        .image-info-box p {
          margin: 0 0 8px 0;
          color: #2d3748;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .image-info-box p:last-child {
          margin-bottom: 0;
        }

        .image-url-input {
          margin-bottom: 20px;
        }

        .image-url-input label {
          display: block;
          margin-bottom: 8px;
          color: #2d3748;
          font-weight: 500;
        }

        .image-url-input input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .image-url-input input:focus {
          outline: none;
          border-color: #2d2d2d;
        }

        .url-examples {
          background: #f8f9fa;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin-top: 10px;
        }

        .url-examples p {
          margin: 0 0 5px 0;
          color: #718096;
          font-size: 0.85rem;
        }

        .url-examples p:last-child {
          margin-bottom: 0;
        }

        .divider {
          text-align: center;
          position: relative;
          margin: 20px 0;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e2e8f0;
        }

        .divider span {
          background: white;
          padding: 0 15px;
          color: #718096;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .upload-section {
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .blog-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .articles-grid {
            grid-template-columns: 1fr;
          }

          .article-footer {
            flex-direction: column;
            gap: 5px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}

export default BlogManagement
