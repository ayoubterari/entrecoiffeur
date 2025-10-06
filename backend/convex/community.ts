import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Schéma pour les posts de la communauté
const postSchema = {
  title: v.string(),
  content: v.string(),
  authorId: v.id("users"),
  authorName: v.string(),
  authorEmail: v.string(),
  category: v.union(
    v.literal("general"),
    v.literal("conseils"),
    v.literal("techniques"),
    v.literal("produits"),
    v.literal("annonces")
  ),
  type: v.union(
    v.literal("discussion"),
    v.literal("question"),
    v.literal("conseil"),
    v.literal("annonce")
  ),
  tags: v.optional(v.array(v.string())),
  votes: v.number(),
  upvotes: v.array(v.id("users")),
  downvotes: v.array(v.id("users")),
  commentCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
};

// Schéma pour les commentaires
const commentSchema = {
  postId: v.id("posts"),
  content: v.string(),
  authorId: v.id("users"),
  authorName: v.string(),
  authorEmail: v.string(),
  votes: v.number(),
  upvotes: v.array(v.id("users")),
  downvotes: v.array(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.number(),
};

// Créer un nouveau post
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("conseils"),
      v.literal("techniques"),
      v.literal("produits"),
      v.literal("annonces")
    ),
    type: v.union(
      v.literal("discussion"),
      v.literal("question"),
      v.literal("conseil"),
      v.literal("annonce")
    ),
    tags: v.optional(v.array(v.string())),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Récupérer les informations de l'auteur
    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Utilisateur non trouvé");
    }

    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      authorId: args.authorId,
      authorName: `${author.firstName} ${author.lastName}`,
      authorEmail: author.email,
      category: args.category,
      type: args.type,
      tags: args.tags || [],
      votes: 0,
      upvotes: [],
      downvotes: [],
      commentCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return postId;
  },
});

// Récupérer tous les posts
export const getAllPosts = query({
  args: {
    category: v.optional(v.string()),
    sortBy: v.optional(v.union(
      v.literal("recent"),
      v.literal("popular"),
      v.literal("comments")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("posts");

    // Filtrer par catégorie si spécifiée
    if (args.category && args.category !== "all") {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    // Récupérer les posts
    let posts = await query.collect();

    // Trier selon le critère
    switch (args.sortBy) {
      case "popular":
        posts.sort((a, b) => b.votes - a.votes);
        break;
      case "comments":
        posts.sort((a, b) => b.commentCount - a.commentCount);
        break;
      case "recent":
      default:
        posts.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    // Limiter le nombre de résultats si spécifié
    if (args.limit) {
      posts = posts.slice(0, args.limit);
    }

    return posts;
  },
});

// Récupérer un post par ID avec ses commentaires
export const getPostById = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      return null;
    }

    // Récupérer les commentaires du post
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .order("desc")
      .collect();

    return {
      ...post,
      comments,
    };
  },
});

// Voter pour un post
export const votePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
    voteType: v.union(v.literal("up"), v.literal("down"), v.literal("remove")),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    let upvotes = [...post.upvotes];
    let downvotes = [...post.downvotes];

    // Supprimer l'utilisateur des deux listes d'abord
    upvotes = upvotes.filter(id => id !== args.userId);
    downvotes = downvotes.filter(id => id !== args.userId);

    // Ajouter le vote selon le type
    if (args.voteType === "up") {
      upvotes.push(args.userId);
    } else if (args.voteType === "down") {
      downvotes.push(args.userId);
    }
    // Si voteType === "remove", on ne fait rien (déjà supprimé ci-dessus)

    const newVotes = upvotes.length - downvotes.length;

    await ctx.db.patch(args.postId, {
      upvotes,
      downvotes,
      votes: newVotes,
      updatedAt: Date.now(),
    });

    return { votes: newVotes };
  },
});

// Créer un commentaire
export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que le post existe
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    // Récupérer les informations de l'auteur
    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Utilisateur non trouvé");
    }

    // Créer le commentaire
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      content: args.content,
      authorId: args.authorId,
      authorName: `${author.firstName} ${author.lastName}`,
      authorEmail: author.email,
      votes: 0,
      upvotes: [],
      downvotes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Mettre à jour le compteur de commentaires du post
    await ctx.db.patch(args.postId, {
      commentCount: post.commentCount + 1,
      updatedAt: Date.now(),
    });

    return commentId;
  },
});

// Récupérer les commentaires d'un post
export const getCommentsByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .order("asc") // Les plus anciens en premier
      .collect();
  },
});

// Voter pour un commentaire
export const voteComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.id("users"),
    voteType: v.union(v.literal("up"), v.literal("down"), v.literal("remove")),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Commentaire non trouvé");
    }

    let upvotes = [...comment.upvotes];
    let downvotes = [...comment.downvotes];

    // Supprimer l'utilisateur des deux listes d'abord
    upvotes = upvotes.filter(id => id !== args.userId);
    downvotes = downvotes.filter(id => id !== args.userId);

    // Ajouter le vote selon le type
    if (args.voteType === "up") {
      upvotes.push(args.userId);
    } else if (args.voteType === "down") {
      downvotes.push(args.userId);
    }

    const newVotes = upvotes.length - downvotes.length;

    await ctx.db.patch(args.commentId, {
      upvotes,
      downvotes,
      votes: newVotes,
      updatedAt: Date.now(),
    });

    return { votes: newVotes };
  },
});

// Supprimer un post (auteur ou admin seulement)
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier que l'utilisateur est l'auteur ou un admin
    if (post.authorId !== args.userId && user.userType !== "superadmin") {
      throw new Error("Vous n'avez pas l'autorisation de supprimer ce post");
    }

    // Supprimer tous les commentaires du post
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Supprimer le post
    await ctx.db.delete(args.postId);

    return { success: true };
  },
});

// Supprimer un commentaire (auteur ou admin seulement)
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Commentaire non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier que l'utilisateur est l'auteur ou un admin
    if (comment.authorId !== args.userId && user.userType !== "superadmin") {
      throw new Error("Vous n'avez pas l'autorisation de supprimer ce commentaire");
    }

    // Récupérer le post pour décrémenter le compteur
    const post = await ctx.db.get(comment.postId);
    if (post) {
      await ctx.db.patch(comment.postId, {
        commentCount: Math.max(0, post.commentCount - 1),
        updatedAt: Date.now(),
      });
    }

    // Supprimer le commentaire
    await ctx.db.delete(args.commentId);

    return { success: true };
  },
});

// Rechercher dans les posts
export const searchPosts = query({
  args: {
    searchTerm: v.string(),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db.query("posts").collect();

    // Filtrer par catégorie si spécifiée
    if (args.category && args.category !== "all") {
      posts = posts.filter(post => post.category === args.category);
    }

    // Recherche textuelle dans le titre et le contenu
    const searchTerm = args.searchTerm.toLowerCase();
    posts = posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );

    // Trier par pertinence (posts récents en premier)
    posts.sort((a, b) => b.createdAt - a.createdAt);

    // Limiter les résultats
    if (args.limit) {
      posts = posts.slice(0, args.limit);
    }

    return posts;
  },
});

// Obtenir les statistiques de la communauté
export const getCommunityStats = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    const comments = await ctx.db.query("comments").collect();

    const totalVotes = posts.reduce((sum, post) => sum + post.votes, 0);
    const totalComments = comments.length;

    // Statistiques par catégorie
    const categoryStats = posts.reduce((stats, post) => {
      stats[post.category] = (stats[post.category] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    return {
      totalPosts: posts.length,
      totalComments,
      totalVotes,
      categoryStats,
      activeUsers: new Set([...posts.map(p => p.authorId), ...comments.map(c => c.authorId)]).size,
    };
  },
});
