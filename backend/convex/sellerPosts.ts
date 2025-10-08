import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// QUERIES

// Get all posts for a specific seller
export const getSellerPosts = query({
  args: { 
    sellerId: v.id("users"),
    includeInactive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { sellerId, includeInactive = false } = args;
    
    let posts;
    if (includeInactive) {
      // Get all posts (for seller's own view)
      posts = await ctx.db
        .query("sellerPosts")
        .withIndex("by_seller", (q) => q.eq("sellerId", sellerId))
        .order("desc")
        .collect();
    } else {
      // Get only active posts (for public view)
      posts = await ctx.db
        .query("sellerPosts")
        .withIndex("by_seller_active", (q) => 
          q.eq("sellerId", sellerId).eq("isActive", true)
        )
        .order("desc")
        .collect();
    }

    // Get seller info for each post
    const postsWithSeller = await Promise.all(
      posts.map(async (post) => {
        const seller = await ctx.db.get(post.sellerId);
        return {
          ...post,
          seller: seller ? {
            _id: seller._id,
            firstName: seller.firstName,
            lastName: seller.lastName,
            userType: seller.userType
          } : null
        };
      })
    );

    return postsWithSeller;
  },
});

// Get a single post by ID
export const getSellerPostById = query({
  args: { postId: v.id("sellerPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const seller = await ctx.db.get(post.sellerId);
    
    return {
      ...post,
      seller: seller ? {
        _id: seller._id,
        firstName: seller.firstName,
        lastName: seller.lastName,
        userType: seller.userType
      } : null
    };
  },
});

// Get posts statistics for a seller
export const getSellerPostsStats = query({
  args: { sellerId: v.id("users") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("sellerPosts")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    const activePosts = posts.filter(post => post.isActive);
    const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);
    const totalViews = posts.reduce((sum, post) => sum + post.viewsCount, 0);

    return {
      totalPosts: posts.length,
      activePosts: activePosts.length,
      totalLikes,
      totalComments,
      totalViews,
      averageLikesPerPost: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0
    };
  },
});

// Check if user liked a specific post
export const isPostLikedByUser = query({
  args: { 
    postId: v.id("sellerPosts"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("sellerPostLikes")
      .withIndex("by_post_user", (q) => 
        q.eq("postId", args.postId).eq("userId", args.userId)
      )
      .first();

    return !!like;
  },
});

// Get comments for a specific post
export const getPostComments = query({
  args: { postId: v.id("sellerPosts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("sellerPostComments")
      .withIndex("by_post_created", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();

    // Get user info for each comment
    const commentsWithUser = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: user ? {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName
          } : null
        };
      })
    );

    return commentsWithUser;
  },
});

// MUTATIONS

// Create a new seller post
export const createSellerPost = mutation({
  args: {
    sellerId: v.id("users"),
    content: v.string(),
    images: v.optional(v.array(v.union(v.string(), v.id("_storage")))),
    type: v.union(
      v.literal("text"),
      v.literal("image"), 
      v.literal("promotion"),
      v.literal("announcement")
    )
  },
  handler: async (ctx, args) => {
    const { sellerId, content, images, type } = args;

    // Validate content length
    if (content.length < 1 || content.length > 2000) {
      throw new Error("Le contenu doit faire entre 1 et 2000 caractères");
    }

    // Validate seller exists
    const seller = await ctx.db.get(sellerId);
    if (!seller) {
      throw new Error("Vendeur non trouvé");
    }

    // Create the post
    const postId = await ctx.db.insert("sellerPosts", {
      sellerId,
      content,
      images: images || [],
      type,
      isActive: true,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return postId;
  },
});

// Update an existing seller post
export const updateSellerPost = mutation({
  args: {
    postId: v.id("sellerPosts"),
    sellerId: v.id("users"),
    content: v.optional(v.string()),
    images: v.optional(v.array(v.union(v.string(), v.id("_storage")))),
    type: v.optional(v.union(
      v.literal("text"),
      v.literal("image"), 
      v.literal("promotion"),
      v.literal("announcement")
    ))
  },
  handler: async (ctx, args) => {
    const { postId, sellerId, content, images, type } = args;

    // Get the existing post
    const existingPost = await ctx.db.get(postId);
    if (!existingPost) {
      throw new Error("Post non trouvé");
    }

    // Verify ownership
    if (existingPost.sellerId !== sellerId) {
      throw new Error("Vous n'êtes pas autorisé à modifier ce post");
    }

    // Validate content if provided
    if (content && (content.length < 1 || content.length > 2000)) {
      throw new Error("Le contenu doit faire entre 1 et 2000 caractères");
    }

    // Update the post
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (content !== undefined) updates.content = content;
    if (images !== undefined) updates.images = images;
    if (type !== undefined) updates.type = type;

    await ctx.db.patch(postId, updates);

    return postId;
  },
});

// Delete a seller post
export const deleteSellerPost = mutation({
  args: {
    postId: v.id("sellerPosts"),
    sellerId: v.id("users")
  },
  handler: async (ctx, args) => {
    const { postId, sellerId } = args;

    // Get the existing post
    const existingPost = await ctx.db.get(postId);
    if (!existingPost) {
      throw new Error("Post non trouvé");
    }

    // Verify ownership
    if (existingPost.sellerId !== sellerId) {
      throw new Error("Vous n'êtes pas autorisé à supprimer ce post");
    }

    // Delete related likes and comments first
    const likes = await ctx.db
      .query("sellerPostLikes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();

    const comments = await ctx.db
      .query("sellerPostComments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();

    // Delete all likes
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Delete all comments
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete the post
    await ctx.db.delete(postId);

    return { success: true };
  },
});

// Toggle post active status
export const togglePostStatus = mutation({
  args: {
    postId: v.id("sellerPosts"),
    sellerId: v.id("users")
  },
  handler: async (ctx, args) => {
    const { postId, sellerId } = args;

    // Get the existing post
    const existingPost = await ctx.db.get(postId);
    if (!existingPost) {
      throw new Error("Post non trouvé");
    }

    // Verify ownership
    if (existingPost.sellerId !== sellerId) {
      throw new Error("Vous n'êtes pas autorisé à modifier ce post");
    }

    // Toggle status
    await ctx.db.patch(postId, {
      isActive: !existingPost.isActive,
      updatedAt: Date.now(),
    });

    return { success: true, isActive: !existingPost.isActive };
  },
});

// Like/Unlike a post
export const togglePostLike = mutation({
  args: {
    postId: v.id("sellerPosts"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const { postId, userId } = args;

    // Check if post exists
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    // Check if user already liked this post
    const existingLike = await ctx.db
      .query("sellerPostLikes")
      .withIndex("by_post_user", (q) => 
        q.eq("postId", postId).eq("userId", userId)
      )
      .first();

    if (existingLike) {
      // Unlike: remove the like
      await ctx.db.delete(existingLike._id);
      
      // Decrease likes count
      await ctx.db.patch(postId, {
        likesCount: Math.max(0, post.likesCount - 1),
        updatedAt: Date.now(),
      });

      return { liked: false, likesCount: Math.max(0, post.likesCount - 1) };
    } else {
      // Like: add the like
      await ctx.db.insert("sellerPostLikes", {
        postId,
        userId,
        createdAt: Date.now(),
      });

      // Increase likes count
      await ctx.db.patch(postId, {
        likesCount: post.likesCount + 1,
        updatedAt: Date.now(),
      });

      return { liked: true, likesCount: post.likesCount + 1 };
    }
  },
});

// Add a comment to a post
export const addPostComment = mutation({
  args: {
    postId: v.id("sellerPosts"),
    userId: v.id("users"),
    content: v.string()
  },
  handler: async (ctx, args) => {
    const { postId, userId, content } = args;

    // Validate content
    if (content.length < 1 || content.length > 500) {
      throw new Error("Le commentaire doit faire entre 1 et 500 caractères");
    }

    // Check if post exists
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    // Check if user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Create the comment
    const commentId = await ctx.db.insert("sellerPostComments", {
      postId,
      userId,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Increase comments count
    await ctx.db.patch(postId, {
      commentsCount: post.commentsCount + 1,
      updatedAt: Date.now(),
    });

    return commentId;
  },
});

// Delete a comment
export const deletePostComment = mutation({
  args: {
    commentId: v.id("sellerPostComments"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const { commentId, userId } = args;

    // Get the comment
    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new Error("Commentaire non trouvé");
    }

    // Verify ownership (user can only delete their own comments)
    if (comment.userId !== userId) {
      throw new Error("Vous n'êtes pas autorisé à supprimer ce commentaire");
    }

    // Get the post to update comment count
    const post = await ctx.db.get(comment.postId);
    if (post) {
      await ctx.db.patch(comment.postId, {
        commentsCount: Math.max(0, post.commentsCount - 1),
        updatedAt: Date.now(),
      });
    }

    // Delete the comment
    await ctx.db.delete(commentId);

    return { success: true };
  },
});

// Increment post views
export const incrementPostViews = mutation({
  args: { postId: v.id("sellerPosts") },
  handler: async (ctx, args) => {
    const { postId } = args;

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    await ctx.db.patch(postId, {
      viewsCount: post.viewsCount + 1,
      updatedAt: Date.now(),
    });

    return { success: true, viewsCount: post.viewsCount + 1 };
  },
});
