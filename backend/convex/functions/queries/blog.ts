import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Récupère tous les articles publiés pour la page blog publique
 */
export const getPublishedArticles = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let articlesQuery = ctx.db
      .query("blogArticles")
      .withIndex("by_status", (q) => q.eq("status", "published"));

    if (args.category) {
      articlesQuery = articlesQuery.filter((q) => q.eq(q.field("category"), args.category));
    }

    const articles = await articlesQuery
      .order("desc")
      .take(args.limit || 50);

    // Enrichir avec les informations de l'auteur
    const enrichedArticles = await Promise.all(
      articles.map(async (article) => {
        const author = await ctx.db.get(article.authorId);
        return {
          ...article,
          author: author ? {
            firstName: author.firstName,
            lastName: author.lastName,
            email: author.email,
          } : null,
        };
      })
    );

    return enrichedArticles;
  },
});

/**
 * Récupère tous les articles (pour debug) - à utiliser temporairement
 */
export const getAllArticles = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let articlesQuery = ctx.db
      .query("blogArticles");

    if (args.category) {
      articlesQuery = articlesQuery.filter((q) => q.eq(q.field("category"), args.category));
    }

    const articles = await articlesQuery
      .order("desc")
      .take(args.limit || 50);

    // Enrichir avec les informations de l'auteur
    const enrichedArticles = await Promise.all(
      articles.map(async (article) => {
        const author = await ctx.db.get(article.authorId);
        return {
          ...article,
          author: author ? {
            firstName: author.firstName,
            lastName: author.lastName,
            email: author.email,
          } : null,
        };
      })
    );

    return enrichedArticles;
  },
});

/**
 * Récupère un article par son slug
 */
export const getArticleBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("blogArticles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!article) {
      return null;
    }

    // Enrichir avec les informations de l'auteur
    const author = await ctx.db.get(article.authorId);

    return {
      ...article,
      author: author ? {
        firstName: author.firstName,
        lastName: author.lastName,
        email: author.email,
      } : null,
    };
  },
});

/**
 * Récupère tous les articles pour l'administration (tous statuts)
 */
export const getAllArticlesForAdmin = query({
  args: {
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Pour l'instant, on permet l'accès sans vérification stricte
    // TODO: Implémenter l'authentification Convex complète
    
    // Si un email est fourni, vérifier qu'il s'agit d'un admin
    if (args.userEmail) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.userEmail))
        .first();

      if (user && user.userType !== "superadmin") {
        throw new Error("Accès refusé - Admin requis");
      }
    }

    const articles = await ctx.db
      .query("blogArticles")
      .order("desc")
      .collect();

    // Enrichir avec les informations de l'auteur
    const enrichedArticles = await Promise.all(
      articles.map(async (article) => {
        const author = await ctx.db.get(article.authorId);
        return {
          ...article,
          author: author ? {
            firstName: author.firstName,
            lastName: author.lastName,
            email: author.email,
          } : null,
        };
      })
    );

    return enrichedArticles;
  },
});

/**
 * Récupère les articles en vedette pour la page d'accueil
 */
export const getFeaturedArticles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("blogArticles")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc")
      .take(args.limit || 3);

    // Enrichir avec les informations de l'auteur
    const enrichedArticles = await Promise.all(
      articles.map(async (article) => {
        const author = await ctx.db.get(article.authorId);
        return {
          ...article,
          author: author ? {
            firstName: author.firstName,
            lastName: author.lastName,
            email: author.email,
          } : null,
        };
      })
    );

    return enrichedArticles;
  },
});

/**
 * Récupère les catégories de blog avec le nombre d'articles
 */
export const getBlogCategories = query({
  args: {},
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("blogArticles")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Compter les articles par catégorie
    const categoryCount: Record<string, number> = {};
    
    articles.forEach((article) => {
      if (article.category) {
        categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
      }
    });

    // Convertir en tableau avec les informations de catégorie
    const categories = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));

    return categories.sort((a, b) => b.count - a.count);
  },
});

/**
 * Récupère un article par son ID (pour l'administration)
 */
export const getArticleById = query({
  args: {
    articleId: v.id("blogArticles"),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Pour l'instant, on permet l'accès sans vérification stricte
    // TODO: Implémenter l'authentification Convex complète
    
    // Si un email est fourni, vérifier qu'il s'agit d'un admin
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
      return null;
    }

    // Enrichir avec les informations de l'auteur
    const author = await ctx.db.get(article.authorId);

    return {
      ...article,
      author: author ? {
        firstName: author.firstName,
        lastName: author.lastName,
        email: author.email,
      } : null,
    };
  },
});
