import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'

const Blog = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Ajouter une classe au body pour supprimer les marges
  useEffect(() => {
    document.body.classList.add('blog-body')
    document.documentElement.classList.add('blog-html')
    
    return () => {
      document.body.classList.remove('blog-body')
      document.documentElement.classList.remove('blog-html')
    }
  }, [])

  // Récupérer les articles publiés depuis Convex
  const articles = useQuery(api.functions.queries.blog.getPublishedArticles, {
    category: selectedCategory === 'all' ? undefined : selectedCategory
  })

  // Récupérer les catégories avec compteurs
  const blogCategories = useQuery(api.functions.queries.blog.getBlogCategories)

  // Mutation pour incrémenter les vues
  const incrementViewCount = useMutation(api.functions.mutations.blog.incrementViewCount)

  // Préparer les catégories avec "Tous"
  const categories = [
    { id: 'all', name: 'Tous', count: articles?.length || 0 },
    ...(blogCategories || []).map(cat => ({
      id: cat.name,
      name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
      count: cat.count
    }))
  ]

  // Articles à afficher (déjà filtrés par la query si une catégorie est sélectionnée)
  const filteredArticles = articles || []

  const handleReadMore = async (articleId) => {
    try {
      await incrementViewCount({ articleId })
      // Ici vous pourriez naviguer vers la page détaillée de l'article
      // navigate(`/blog/${article.slug}`)
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return (
    <div className="blog-page">
      {/* Header */}
      <div className="blog-header">
        <div className="blog-header-content">
          <button 
            className="back-btn"
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </button>
          
          <div className="blog-hero">
            <h1>📝 Blog Entre Coiffeur</h1>
            <p>Découvrez nos articles, conseils et tendances beauté</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="blog-filters">
        <div className="blog-filters-content">
          <h3>Catégories</h3>
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="blog-content">
        <div className="blog-grid">
          {filteredArticles.map((article) => (
            <article key={article._id} className="blog-card">
              <div className="blog-card-header">
                <div className="blog-card-image">
                  <span className="blog-emoji">{article.featuredImage || '📝'}</span>
                </div>
                <div className="blog-meta">
                  <span className="blog-category">{article.category}</span>
                  <span className="blog-read-time">⏱️ {article.readTime || '5 min'}</span>
                </div>
              </div>
              
              <div className="blog-card-content">
                <h2 className="blog-title">{article.title}</h2>
                <p className="blog-excerpt">{article.excerpt || article.content?.substring(0, 150) + '...'}</p>
                
                <div className="blog-tags">
                  {(article.tags || []).map((tag, index) => (
                    <span key={index} className="blog-tag">#{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="blog-card-footer">
                <div className="blog-author">
                  <div className="author-avatar">
                    {(article.authorName || 'A').charAt(0)}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{article.authorName || 'Auteur'}</span>
                    <span className="blog-date">{formatDate(article.createdAt)}</span>
                  </div>
                </div>
                
                <button 
                  className="read-more-btn"
                  onClick={() => handleReadMore(article._id)}
                >
                  Lire la suite →
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="no-articles">
            <div className="no-articles-content">
              <span className="no-articles-icon">📝</span>
              <h3>Aucun article dans cette catégorie</h3>
              <p>Revenez bientôt pour découvrir de nouveaux contenus !</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Blog
