import React, { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../lib/convex'
import './SellerPostCard.css'

const SellerPostCard = ({ post, currentUserId, isOwner, onPostUpdated }) => {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Queries
  const isLiked = useQuery(
    api.sellerPosts.isPostLikedByUser,
    currentUserId ? { postId: post._id, userId: currentUserId } : "skip"
  )
  
  const comments = useQuery(
    api.sellerPosts.getPostComments,
    showComments ? { postId: post._id } : "skip"
  )

  // Mutations
  const toggleLike = useMutation(api.sellerPosts.togglePostLike)
  const addComment = useMutation(api.sellerPosts.addPostComment)
  const deletePost = useMutation(api.sellerPosts.deleteSellerPost)
  const toggleStatus = useMutation(api.sellerPosts.togglePostStatus)

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return diffInMinutes <= 1 ? 'À l\'instant' : `Il y a ${diffInMinutes}min`
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return diffInDays === 1 ? 'Hier' : `Il y a ${diffInDays}j`
    }
  }

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'text': return '📝'
      case 'image': return '📸'
      case 'promotion': return '🎯'
      case 'announcement': return '📢'
      default: return '📝'
    }
  }

  const getPostTypeLabel = (type) => {
    switch (type) {
      case 'text': return 'Post'
      case 'image': return 'Photo'
      case 'promotion': return 'Promotion'
      case 'announcement': return 'Annonce'
      default: return 'Post'
    }
  }

  const handleLike = async () => {
    if (!currentUserId) return
    
    try {
      await toggleLike({ postId: post._id, userId: currentUserId })
      if (onPostUpdated) onPostUpdated()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!currentUserId || !newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      await addComment({
        postId: post._id,
        userId: currentUserId,
        content: newComment.trim()
      })
      setNewComment('')
      if (onPostUpdated) onPostUpdated()
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeletePost = async () => {
    if (!isOwner || !window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) return

    try {
      await deletePost({ postId: post._id, sellerId: post.sellerId })
      if (onPostUpdated) onPostUpdated()
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleToggleStatus = async () => {
    if (!isOwner) return

    try {
      await toggleStatus({ postId: post._id, sellerId: post.sellerId })
      if (onPostUpdated) onPostUpdated()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  return (
    <div className={`seller-post-card ${!post.isActive ? 'inactive' : ''}`}>
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.seller?.firstName?.charAt(0)?.toUpperCase() || 'V'}
          </div>
          <div className="author-info">
            <div className="author-name">
              {post.seller?.firstName} {post.seller?.lastName}
            </div>
            <div className="post-meta">
              <span className="post-type">
                {getPostTypeIcon(post.type)} {getPostTypeLabel(post.type)}
              </span>
              <span className="post-date">{formatDate(post.createdAt)}</span>
              {!post.isActive && <span className="inactive-badge">🔒 Masqué</span>}
            </div>
          </div>
        </div>

        {/* Owner Actions */}
        {isOwner && (
          <div className="post-actions-menu">
            <button
              className="action-btn toggle-status"
              onClick={handleToggleStatus}
              title={post.isActive ? 'Masquer le post' : 'Afficher le post'}
            >
              {post.isActive ? '🔒' : '👁️'}
            </button>
            <button
              className="action-btn delete"
              onClick={handleDeletePost}
              title="Supprimer le post"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="post-content">
        <p className="post-text">{post.content}</p>
        
        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className={`post-images ${post.images.length === 1 ? 'single' : 'grid'}`}>
            {post.images.map((image, index) => (
              <div key={index} className="post-image-container">
                <img src={image} alt={`Post image ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="post-stats">
        <div className="stats-row">
          <span className="stat-item">
            ❤️ {post.likesCount} J'aime
          </span>
          <span className="stat-item">
            💬 {post.commentsCount} Commentaires
          </span>
          <span className="stat-item">
            👁️ {post.viewsCount} Vues
          </span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <button
          className={`action-button like ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={!currentUserId}
        >
          <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span className="action-text">J'aime</span>
        </button>
        
        <button
          className="action-button comment"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="action-icon">💬</span>
          <span className="action-text">Commenter</span>
        </button>
        
        <button className="action-button share">
          <span className="action-icon">📤</span>
          <span className="action-text">Partager</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {/* Add Comment Form */}
          {currentUserId && (
            <form onSubmit={handleAddComment} className="add-comment-form">
              <div className="comment-input-container">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Écrivez un commentaire..."
                  maxLength={500}
                  rows={2}
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="submit-comment-btn"
                >
                  {isSubmittingComment ? '⏳' : '📤'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="comments-list">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </span>
                      <span className="comment-date">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">
                <p>💭 Aucun commentaire pour le moment</p>
                <p>Soyez le premier à commenter !</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerPostCard
