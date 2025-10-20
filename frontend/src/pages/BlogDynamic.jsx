import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'

const BlogDynamic = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')

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
      alert('Fonctionnalité de lecture complète à implémenter')
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

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200
    const wordCount = content.split(' ').length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return `${readTime} min`
  }

  return (
    <div className="blog-page">
      {/* Header avec background artistique */}
      <div className="blog-header">
        <div className="blog-header-overlay"></div>
        <div className="blog-header-content">
          <button 
            className="back-btn"
            onClick={() => window.history.back()}
          >
            Retour
          </button>
          
          <div className="blog-hero">
            <h1>📝 Blog Entre Coiffeur</h1>
            <p>Découvrez nos articles, conseils et tendances beauté créés par l'admin</p>
          </div>
        </div>
      </div>

      {/* Filtres par catégories */}
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
        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Aucun article disponible</h3>
            <p>
              {selectedCategory === 'all' 
                ? "L'admin n'a pas encore créé d'articles de blog."
                : `Aucun article dans la catégorie "${selectedCategory}".`
              }
            </p>
            <button 
              className="btn-primary"
              onClick={() => setSelectedCategory('all')}
            >
              Voir tous les articles
            </button>
          </div>
        ) : (
          <div className="blog-grid">
            {filteredArticles.map((article) => (
              <article key={article._id} className="blog-card">
                <div className="blog-card-header">
                  <div className="blog-image">
                    {article.featuredImage && (article.featuredImage.startsWith('http') || article.featuredImage.startsWith('data:')) ? (
                      <img 
                        src={article.featuredImage} 
                        alt={article.title}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : (
                      <div className="blog-image-placeholder" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(102, 126, 234, 0.1))', color: '#667eea'}}>
                        <span style={{fontSize: '4rem'}}>📝</span>
                      </div>
                    )}
                    <div className="blog-image-fallback" style={{display: 'none', alignItems: 'center', justifyContent: 'center', height: '200px', background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(102, 126, 234, 0.1))', color: '#667eea'}}>
                      <span style={{fontSize: '4rem'}}>📝</span>
                    </div>
                  </div>
                  
                  <div className="blog-meta">
                    {article.featured && (
                      <span className="featured-badge">⭐ En vedette</span>
                    )}
                    {article.category && (
                      <span className="category-badge">
                        🏷️ {article.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="blog-card-content">
                  <h2>{article.title}</h2>
                  <p className="blog-excerpt">{article.excerpt}</p>
                  
                  <div className="blog-details">
                    <div className="blog-author">
                      ✍️ {article.author?.firstName} {article.author?.lastName}
                    </div>
                    <div className="blog-date">
                      📅 {formatDate(article.publishedAt || article.createdAt)}
                    </div>
                    <div className="blog-read-time">
                      ⏱️ {calculateReadTime(article.content)}
                    </div>
                    {article.viewCount && (
                      <div className="blog-views">
                        👁️ {article.viewCount} vues
                      </div>
                    )}
                  </div>

                  {article.tags && article.tags.length > 0 && (
                    <div className="blog-tags">
                      {article.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="blog-card-footer">
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
        )}
      </div>

      <style jsx>{`
        .blog-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          position: relative;
        }

        .blog-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }

        .blog-header {
          position: relative;
          padding: 60px 20px 40px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 2;
        }

        .blog-header-content {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .back-btn {
          background: linear-gradient(135deg, #ff6b9d, #667eea);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 30px;
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
        }

        .blog-hero {
          text-align: center;
        }

        .blog-hero h1 {
          font-size: 3rem;
          margin: 0 0 15px 0;
          background: linear-gradient(135deg, #ff6b9d, #667eea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .blog-hero p {
          font-size: 1.2rem;
          color: #718096;
          margin: 0;
        }

        .blog-filters {
          padding: 40px 20px;
          position: relative;
          z-index: 2;
        }

        .blog-filters-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .blog-filters h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
          font-size: 1.3rem;
        }

        .category-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 2px solid transparent;
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          color: #2d3748;
        }

        .filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #ff6b9d, #667eea);
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .blog-content {
          padding: 0 20px 60px;
          position: relative;
          z-index: 2;
        }

        .empty-state {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
          padding: 80px 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .empty-state h3 {
          color: #2d3748;
          margin-bottom: 15px;
          font-size: 1.5rem;
        }

        .empty-state p {
          color: #718096;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ff6b9d, #667eea);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
        }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .blog-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .blog-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #ff6b9d, #667eea);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .blog-card:hover::before {
          transform: scaleX(1);
        }

        .blog-image {
          height: 200px;
          overflow: hidden;
        }

        .blog-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .blog-card:hover .blog-image img {
          transform: scale(1.05);
        }

        .blog-meta {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          gap: 10px;
        }

        .featured-badge,
        .category-badge {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .featured-badge {
          background: linear-gradient(135deg, #ff6b9d, #667eea);
          color: white;
        }

        .category-badge {
          color: #2d3748;
        }

        .blog-card-content {
          padding: 25px;
        }

        .blog-card-content h2 {
          margin: 0 0 15px 0;
          color: #2d3748;
          font-size: 1.3rem;
          line-height: 1.4;
        }

        .blog-excerpt {
          color: #718096;
          line-height: 1.6;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .blog-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: #718096;
        }

        .blog-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .tag {
          background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(102, 126, 234, 0.1));
          color: #667eea;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .blog-card-footer {
          padding: 0 25px 25px;
        }

        .read-more-btn {
          background: linear-gradient(135deg, #ff6b9d, #667eea);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .read-more-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
        }

        @media (max-width: 768px) {
          .blog-hero h1 {
            font-size: 2rem;
          }

          .blog-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .blog-details {
            grid-template-columns: 1fr;
          }

          .category-filters {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default BlogDynamic
