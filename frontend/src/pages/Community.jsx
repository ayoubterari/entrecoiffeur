import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'

const Community = ({ isAuthenticated, userEmail, userFirstName, userLastName }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const [searchTerm, setSearchTerm] = useState('')

  // États pour créer un post
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    type: 'discussion'
  })

  // États pour les commentaires
  const [expandedPost, setExpandedPost] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioContext, setAudioContext] = useState(null)
  const [analyser, setAnalyser] = useState(null)

  // Queries Convex
  const allPosts = useQuery(api.community.getAllPosts, {
    category: selectedCategory,
    sortBy: sortBy,
    limit: 50
  })
  const createPostMutation = useMutation(api.community.createPost)
  const createCommentMutation = useMutation(api.community.createComment)
  const votePostMutation = useMutation(api.community.votePost)
  const communityStats = useQuery(api.community.getCommunityStats)
  
  // Query pour récupérer les commentaires du post étendu
  const postComments = useQuery(
    api.community.getCommentsByPost, 
    expandedPost ? { postId: expandedPost } : "skip"
  )

  // Données mock pour le développement
  const mockPosts = [
    {
      _id: '1',
      title: 'Quels sont vos produits capillaires préférés pour cheveux bouclés ?',
      content: 'Je cherche des recommandations pour prendre soin de mes cheveux bouclés. Quels sont vos produits chouchous ?',
      author: 'Marie L.',
      authorEmail: 'marie@example.com',
      category: 'conseils',
      type: 'question',
      votes: 15,
      comments: 8,
      createdAt: Date.now() - 3600000,
      tags: ['cheveux-bouclés', 'soins']
    },
    {
      _id: '2',
      title: 'Nouveau salon ouvert dans le 15ème arrondissement !',
      content: 'Bonjour la communauté ! Je viens d\'ouvrir mon salon "Coiffure & Style" rue de Vaugirard. Spécialisé dans les coupes modernes et la coloration. N\'hésitez pas à passer !',
      author: 'Thomas C.',
      authorEmail: 'thomas@example.com',
      category: 'annonces',
      type: 'annonce',
      votes: 23,
      comments: 12,
      createdAt: Date.now() - 7200000,
      tags: ['nouveau-salon', 'paris']
    },
    {
      _id: '3',
      title: 'Technique de balayage : vos conseils ?',
      content: 'Je suis coiffeuse débutante et j\'aimerais perfectionner ma technique de balayage. Avez-vous des conseils ou des formations à recommander ?',
      author: 'Sophie M.',
      authorEmail: 'sophie@example.com',
      category: 'techniques',
      type: 'discussion',
      votes: 31,
      comments: 18,
      createdAt: Date.now() - 10800000,
      tags: ['balayage', 'formation', 'techniques']
    }
  ]

  const categories = [
    { id: 'all', name: 'Tous', icon: '🌟', color: '#FF6B9D' },
    { id: 'conseils', name: 'Conseils', icon: '💡', color: '#4ECDC4' },
    { id: 'techniques', name: 'Techniques', icon: '✂️', color: '#45B7D1' },
    { id: 'produits', name: 'Produits', icon: '🧴', color: '#96CEB4' },
    { id: 'annonces', name: 'Annonces', icon: '📢', color: '#FFEAA7' },
    { id: 'general', name: 'Général', icon: '💬', color: '#DDA0DD' }
  ]

  const postTypes = [
    { id: 'discussion', name: 'Discussion', icon: '💬' },
    { id: 'question', name: 'Question', icon: '❓' },
    { id: 'conseil', name: 'Conseil', icon: '💡' },
    { id: 'annonce', name: 'Annonce', icon: '📢' }
  ]

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour créer un post')
      return
    }

    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Erreur d\'authentification')
      return
    }

    try {
      await createPostMutation({
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        type: newPost.type,
        tags: newPost.title.split(' ').filter(word => word.length > 3).slice(0, 3), // Auto-generate tags
        authorId: userId
      })
      
      // Reset form
      setNewPost({ title: '', content: '', category: 'general', type: 'discussion' })
      setShowCreatePost(false)
    } catch (error) {
      console.error('Erreur lors de la création du post:', error)
      alert('Erreur lors de la création du post')
    }
  }

  const handleVote = async (postId, direction) => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour voter')
      return
    }

    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Erreur d\'authentification')
      return
    }

    try {
      await votePostMutation({
        postId: postId,
        userId: userId,
        voteType: direction
      })
    } catch (error) {
      console.error('Erreur lors du vote:', error)
      alert('Erreur lors du vote')
    }
  }

  const handleComment = async (postId) => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour commenter')
      return
    }
    if (!newComment.trim()) return

    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Erreur d\'authentification')
      return
    }

    try {
      await createCommentMutation({
        postId: postId,
        content: newComment,
        authorId: userId
      })
      setNewComment('')
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error)
      alert('Erreur lors de la création du commentaire')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      // Configuration de l'analyseur audio pour la visualisation
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyserNode = audioCtx.createAnalyser()
      analyserNode.fftSize = 256
      source.connect(analyserNode)

      setAudioContext(audioCtx)
      setAnalyser(analyserNode)

      // Animation du niveau sonore
      const updateAudioLevel = () => {
        if (analyserNode) {
          const dataArray = new Uint8Array(analyserNode.frequencyBinCount)
          analyserNode.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(Math.min(100, (average / 128) * 100))
        }
      }

      const levelInterval = setInterval(updateAudioLevel, 100)

      // Timer d'enregistrement
      const startTime = Date.now()
      const timeInterval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)

      recorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
        clearInterval(levelInterval)
        clearInterval(timeInterval)
        setAudioLevel(0)
        setRecordingTime(0)
        if (audioCtx) {
          audioCtx.close()
        }
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error)
      alert('Impossible d\'accéder au microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const playAudio = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob))
      audio.play()
    }
  }

  const submitAudioComment = async (postId) => {
    if (!audioBlob) return

    // Pour l'instant, on simule l'envoi d'un commentaire audio
    // En production, il faudrait uploader l'audio vers un service de stockage
    const audioUrl = URL.createObjectURL(audioBlob)
    
    try {
      await createCommentMutation({
        postId: postId,
        content: `[Commentaire audio] ${audioUrl}`,
        authorId: localStorage.getItem('userId')
      })
      setAudioBlob(null)
      alert('Commentaire audio envoyé !')
    } catch (error) {
      console.error('Erreur lors de l\'envoi du commentaire audio:', error)
      alert('Erreur lors de l\'envoi du commentaire audio')
    }
  }

  // Utiliser les vraies données ou les données mock en fallback
  const posts = allPosts || mockPosts
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    return matchesSearch
  })

  // Le tri est déjà fait côté serveur, mais on peut filtrer par recherche
  const sortedPosts = filteredPosts

  const formatTimeAgo = (timestamp) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Il y a moins d\'une heure'
    if (hours < 24) return `Il y a ${hours}h`
    const days = Math.floor(hours / 24)
    return `Il y a ${days}j`
  }

  // Ajouter une classe au body pour supprimer les marges
  useEffect(() => {
    document.body.classList.add('community-body')
    document.documentElement.classList.add('community-html')
    
    return () => {
      document.body.classList.remove('community-body')
      document.documentElement.classList.remove('community-html')
    }
  }, [])

  return (
    <div className="community-page">
      {/* Header avec gradient */}
      <div className="community-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="back-btn"
              onClick={() => window.history.back()}
            >
              <span className="back-icon">←</span>
              Retour
            </button>
            <div className="header-text">
              <h1>
                <span className="community-icon">👥</span>
                Community Entre Coiffeur
              </h1>
              <p>Partagez, discutez et découvrez avec la communauté beauté & coiffure</p>
            </div>
          </div>
          {isAuthenticated && (
            <button 
              className="create-post-btn"
              onClick={() => setShowCreatePost(true)}
            >
              <span className="btn-icon">✏️</span>
              Créer un post
            </button>
          )}
        </div>
      </div>

      <div className="community-container">
        {/* Sidebar avec catégories */}
        <div className="community-sidebar">
          <div className="sidebar-section">
            <h3>📂 Catégories</h3>
            <div className="categories-list">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{ '--category-color': category.color }}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">
                    {category.id === 'all' ? 
                      (communityStats?.totalPosts || posts.length) : 
                      (communityStats?.categoryStats?.[category.id] || posts.filter(p => p.category === category.id).length)
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>📊 Statistiques</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{communityStats?.totalPosts || posts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{communityStats?.totalComments || posts.reduce((sum, p) => sum + (p.commentCount || p.comments || 0), 0)}</span>
                <span className="stat-label">Commentaires</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{communityStats?.totalVotes || posts.reduce((sum, p) => sum + p.votes, 0)}</span>
                <span className="stat-label">Votes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="community-main">
          {/* Barre de recherche et filtres */}
          <div className="community-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Rechercher dans la communauté..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="sort-container">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recent">📅 Plus récents</option>
                <option value="popular">🔥 Plus populaires</option>
                <option value="comments">💬 Plus commentés</option>
              </select>
            </div>
          </div>

          {/* Liste des posts */}
          <div className="posts-container">
            {sortedPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🤷‍♀️</div>
                <h3>Aucun post trouvé</h3>
                <p>Essayez de changer vos filtres ou créez le premier post !</p>
              </div>
            ) : (
              sortedPosts.map(post => (
                <div key={post._id} className="post-card">
                  <div className="post-votes">
                    <button 
                      className="vote-btn upvote"
                      onClick={() => handleVote(post._id, 'up')}
                    >
                      ⬆️
                    </button>
                    <span className="vote-count">{post.votes}</span>
                    <button 
                      className="vote-btn downvote"
                      onClick={() => handleVote(post._id, 'down')}
                    >
                      ⬇️
                    </button>
                  </div>

                  <div className="post-content">
                    <div className="post-header">
                      <div className="post-meta">
                        <span className="post-type" data-type={post.type}>
                          {postTypes.find(t => t.id === post.type)?.icon} {postTypes.find(t => t.id === post.type)?.name}
                        </span>
                        <span className="post-category" style={{ color: categories.find(c => c.id === post.category)?.color }}>
                          {categories.find(c => c.id === post.category)?.icon} {categories.find(c => c.id === post.category)?.name}
                        </span>
                        <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                      </div>
                      <div className="post-author">
                        <span className="author-avatar">👤</span>
                        <span className="author-name">{post.authorName || post.author}</span>
                      </div>
                    </div>

                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-text">{post.content}</p>

                    {post.tags && (
                      <div className="post-tags">
                        {post.tags.map(tag => (
                          <span key={tag} className="post-tag">#{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="post-actions">
                      <button 
                        className="action-btn comments-btn"
                        onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                      >
                        💬 {post.commentCount || post.comments || 0} commentaires
                      </button>
                      
                      <button 
                        className="action-btn audio-btn"
                        onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                        title="Commentaire audio"
                      >
                        🎤 Audio
                      </button>
                      
                      <button className="action-btn share-btn">
                        🔗 Partager
                      </button>
                    </div>

                    {/* Section commentaires */}
                    {expandedPost === post._id && (
                      <div className="comments-section">
                        <div className="comments-header">
                          <h4>💬 Commentaires ({post.commentCount || post.comments || 0})</h4>
                        </div>
                        
                        {isAuthenticated && (
                          <div className="comment-form">
                            <div className="comment-actions">
                              {/* Section commentaire texte */}
                              <div className="comment-text-section">
                                <textarea
                                  placeholder="Écrivez votre commentaire..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  className="comment-input"
                                />
                                <button 
                                  className="comment-submit-btn"
                                  onClick={() => handleComment(post._id)}
                                  disabled={!newComment.trim()}
                                >
                                  📝 Publier
                                </button>
                              </div>
                              
                              {/* Section commentaire audio */}
                              <div className="comment-audio-section">
                                <div className="audio-section-header">
                                  <span className="audio-icon">🎤</span>
                                  <span className="audio-title">Commentaire Audio</span>
                                </div>
                                
                                {!isRecording && !audioBlob && (
                                  <button 
                                    className="audio-record-btn"
                                    onClick={startRecording}
                                  >
                                    <span className="mic-icon">🎤</span>
                                    Maintenir pour enregistrer
                                  </button>
                                )}
                                
                                {isRecording && (
                                  <div className="recording-interface">
                                    <div className="recording-header">
                                      <span className="recording-dot"></span>
                                      <span className="recording-text">Enregistrement...</span>
                                      <span className="recording-time">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                                    </div>
                                    
                                    <div className="audio-visualizer">
                                      {[...Array(20)].map((_, i) => (
                                        <div 
                                          key={i}
                                          className="audio-bar"
                                          style={{
                                            height: `${Math.max(2, (audioLevel / 100) * 40 * Math.random())}px`,
                                            backgroundColor: audioLevel > 50 ? '#FF6B9D' : audioLevel > 20 ? '#4ECDC4' : '#e9ecef'
                                          }}
                                        ></div>
                                      ))}
                                    </div>
                                    
                                    <button 
                                      className="audio-stop-btn"
                                      onClick={stopRecording}
                                    >
                                      ⏹️ Arrêter l'enregistrement
                                    </button>
                                  </div>
                                )}
                                
                                {audioBlob && (
                                  <div className="audio-preview">
                                    <div className="audio-preview-header">
                                      <span className="audio-ready-icon">✅</span>
                                      <span>Enregistrement prêt</span>
                                    </div>
                                    
                                    <div className="audio-controls">
                                      <button 
                                        className="audio-play-btn"
                                        onClick={playAudio}
                                      >
                                        ▶️ Écouter
                                      </button>
                                      <button 
                                        className="audio-send-btn"
                                        onClick={() => submitAudioComment(post._id)}
                                      >
                                        📤 Envoyer
                                      </button>
                                      <button 
                                        className="audio-delete-btn"
                                        onClick={() => setAudioBlob(null)}
                                      >
                                        🗑️ Recommencer
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="comments-list">
                          {postComments && postComments.length > 0 ? (
                            postComments.map(comment => (
                              <div key={comment._id} className="comment-item">
                                <div className="comment-header">
                                  <span className="comment-author">👤 {comment.authorName}</span>
                                  <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                                </div>
                                <div className="comment-content">
                                  {comment.content.startsWith('[Commentaire audio]') ? (
                                    <div className="audio-comment">
                                      <span className="audio-comment-icon">🎵</span>
                                      <span>Commentaire audio</span>
                                      <button 
                                        className="play-audio-comment"
                                        onClick={() => {
                                          const audioUrl = comment.content.replace('[Commentaire audio] ', '')
                                          const audio = new Audio(audioUrl)
                                          audio.play()
                                        }}
                                      >
                                        ▶️ Écouter
                                      </button>
                                    </div>
                                  ) : (
                                    <p>{comment.content}</p>
                                  )}
                                </div>
                                <div className="comment-actions-mini">
                                  <button className="comment-vote-btn">
                                    👍 {comment.votes || 0}
                                  </button>
                                  <button className="comment-reply-btn">
                                    💬 Répondre
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="comment-placeholder">
                              <p>💭 Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de création de post */}
      {showCreatePost && (
        <div className="modal-overlay" onClick={() => setShowCreatePost(false)}>
          <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Créer un nouveau post</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowCreatePost(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="create-post-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Type de post</label>
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost({...newPost, type: e.target.value})}
                    className="form-select"
                  >
                    {postTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="form-select"
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Titre du post</label>
                <input
                  type="text"
                  placeholder="Donnez un titre accrocheur à votre post..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contenu</label>
                <textarea
                  placeholder="Partagez vos idées, posez vos questions..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="form-textarea"
                  rows="6"
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowCreatePost(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  🚀 Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Community
