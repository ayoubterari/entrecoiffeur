import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import SellerPostCard from './SellerPostCard'
import CreatePostModal from './CreatePostModal'
import './SellerPostsTab.css'

const SellerPostsTab = ({ sellerId, currentUserId, isOwner }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Get seller posts
  const sellerPosts = useQuery(
    api.sellerPosts.getSellerPosts,
    sellerId ? { 
      sellerId, 
      includeInactive: isOwner // Show inactive posts only to owner
    } : "skip"
  )

  // Get posts statistics
  const postsStats = useQuery(
    api.sellerPosts.getSellerPostsStats,
    sellerId ? { sellerId } : "skip"
  )

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handlePostUpdated = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (sellerPosts === undefined || postsStats === undefined) {
    return (
      <div className="posts-tab-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="seller-posts-tab">
      {/* Posts Header with Stats */}
      <div className="posts-header">
        <div className="posts-title-section">
          <h2>📸 Posts & Actualités</h2>
          <p>Découvrez les dernières actualités et créations</p>
        </div>

        {/* Stats Cards */}
        <div className="posts-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-number">{postsStats.totalPosts}</div>
              <div className="stat-label">Posts totaux</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <div className="stat-number">{postsStats.totalLikes}</div>
              <div className="stat-label">J'aime reçus</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-content">
              <div className="stat-number">{postsStats.totalComments}</div>
              <div className="stat-label">Commentaires</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-content">
              <div className="stat-number">{postsStats.totalViews}</div>
              <div className="stat-label">Vues totales</div>
            </div>
          </div>
        </div>

        {/* Create Post Button (Owner Only) */}
        {isOwner && (
          <div className="create-post-section">
            <button
              className="create-post-btn"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <span className="btn-icon">✨</span>
              <span className="btn-text">Créer un nouveau post</span>
            </button>
          </div>
        )}
      </div>

      {/* Posts Content */}
      <div className="posts-content">
        {sellerPosts && sellerPosts.length > 0 ? (
          <div className="posts-list">
            {sellerPosts.map((post) => (
              <SellerPostCard
                key={`${post._id}-${refreshKey}`}
                post={post}
                currentUserId={currentUserId}
                isOwner={isOwner}
                onPostUpdated={handlePostUpdated}
              />
            ))}
          </div>
        ) : (
          <div className="no-posts">
            <div className="empty-state">
              <div className="empty-icon">📸</div>
              <h3>
                {isOwner 
                  ? "Vous n'avez pas encore créé de posts" 
                  : "Aucun post disponible"
                }
              </h3>
              <p>
                {isOwner 
                  ? "Partagez vos créations, promotions et actualités avec vos followers !" 
                  : "Ce vendeur n'a pas encore partagé de contenu."
                }
              </p>
              {isOwner && (
                <button
                  className="create-first-post-btn"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  ✨ Créer votre premier post
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        sellerId={sellerId}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}

export default SellerPostsTab
