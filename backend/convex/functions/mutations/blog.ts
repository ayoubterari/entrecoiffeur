import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Crée un nouvel article de blog
 */
export const createArticle = mutation({
  args: {
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    featuredImage: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    featured: v.boolean(),
    status: v.union(v.literal("draft"), v.literal("published")),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Pour l'instant, créer un utilisateur admin par défaut si pas d'email fourni
    let user;
    
    if (args.userEmail) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.userEmail))
        .first();

      if (!user || user.userType !== "superadmin") {
        throw new Error("Accès refusé - Admin requis");
      }
    } else {
      // Créer ou récupérer un utilisateur admin par défaut
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", "admin@entre-coiffeur.com"))
        .first();
        
      if (!user) {
        // Créer l'utilisateur admin par défaut
        const adminId = await ctx.db.insert("users", {
          email: "admin@entre-coiffeur.com",
          password: "admin123",
          firstName: "Admin",
          lastName: "System",
          userType: "superadmin",
          createdAt: Date.now(),
        });
        user = await ctx.db.get(adminId);
      }
    }

    if (!user) {
      throw new Error("Impossible de créer l'article - utilisateur admin introuvable");
    }

    // Générer un slug unique à partir du titre
    const baseSlug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Vérifier l'unicité du slug
    while (await ctx.db.query("blogArticles").withIndex("by_slug", (q) => q.eq("slug", slug)).first()) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const now = Date.now();
    const publishedAt = args.status === "published" ? now : undefined;

    const articleId = await ctx.db.insert("blogArticles", {
      title: args.title,
      slug,
      excerpt: args.excerpt,
      content: args.content,
      featuredImage: args.featuredImage,
      authorId: user._id,
      category: args.category,
      tags: args.tags,
      status: args.status,
      featured: args.featured,
      publishedAt,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      seoTitle: args.seoTitle || args.title,
      seoDescription: args.seoDescription || args.excerpt,
    });

    return { success: true, articleId, slug };
  },
});

/**
 * Met à jour un article de blog
 */
export const updateArticle = mutation({
  args: {
    articleId: v.id("blogArticles"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Pour l'instant, permettre la modification sans vérification stricte
    // TODO: Implémenter l'authentification Convex complète
    
    if (args.userEmail) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.userEmail))
        .first();

      if (user && user.userType !== "superadmin") {
        throw new Error("Accès refusé - Admin requis");
      }
    }

    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article non trouvé");
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };

    // Mettre à jour les champs fournis
    if (args.title !== undefined) {
      updateData.title = args.title;
      
      // Régénérer le slug si le titre change
      const baseSlug = args.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      let slug = baseSlug;
      let counter = 1;
      
      // Vérifier l'unicité du slug (exclure l'article actuel)
      while (true) {
        const existingArticle = await ctx.db
          .query("blogArticles")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();
        
        if (!existingArticle || existingArticle._id === args.articleId) {
          break;
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      updateData.slug = slug;
    }

    if (args.excerpt !== undefined) updateData.excerpt = args.excerpt;
    if (args.content !== undefined) updateData.content = args.content;
    if (args.featuredImage !== undefined) updateData.featuredImage = args.featuredImage;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.featured !== undefined) updateData.featured = args.featured;
    if (args.seoTitle !== undefined) updateData.seoTitle = args.seoTitle;
    if (args.seoDescription !== undefined) updateData.seoDescription = args.seoDescription;

    // Gérer le changement de statut
    if (args.status !== undefined) {
      updateData.status = args.status;
      
      // Si on publie l'article pour la première fois
      if (args.status === "published" && article.status !== "published") {
        updateData.publishedAt = Date.now();
      }
    }

    await ctx.db.patch(args.articleId, updateData);

    return { success: true };
  },
});

/**
 * Supprime un article de blog
 */
export const deleteArticle = mutation({
  args: {
    articleId: v.id("blogArticles"),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Pour l'instant, permettre la suppression sans vérification stricte
    // TODO: Implémenter l'authentification Convex complète
    
    if (args.userEmail) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.userEmail))
        .first();

      if (user && user.userType !== "superadmin") {
        throw new Error("Accès refusé - Admin requis");
      }
    }

    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article non trouvé");
    }

    await ctx.db.delete(args.articleId);

    return { success: true };
  },
});

/**
 * Incrémente le nombre de vues d'un article
 */
export const incrementViewCount = mutation({
  args: {
    articleId: v.id("blogArticles"),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article non trouvé");
    }

    await ctx.db.patch(args.articleId, {
      viewCount: (article.viewCount || 0) + 1,
    });

    return { success: true };
  },
});
