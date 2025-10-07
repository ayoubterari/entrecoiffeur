import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Ajouter un produit aux favoris
export const addToFavorites = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Vérifier si le produit est déjà dans les favoris
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_product", (q) => 
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    if (existingFavorite) {
      throw new Error("Ce produit est déjà dans vos favoris");
    }

    // Ajouter aux favoris
    const favoriteId = await ctx.db.insert("favorites", {
      userId: args.userId,
      productId: args.productId,
      createdAt: Date.now(),
    });

    return favoriteId;
  },
});

// Supprimer un produit des favoris
export const removeFromFavorites = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_product", (q) => 
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    if (!favorite) {
      throw new Error("Ce produit n'est pas dans vos favoris");
    }

    await ctx.db.delete(favorite._id);
    return { success: true };
  },
});

// Basculer l'état favori d'un produit (ajouter/supprimer)
export const toggleFavorite = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_product", (q) => 
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    if (existingFavorite) {
      // Supprimer des favoris
      await ctx.db.delete(existingFavorite._id);
      return { action: "removed", isFavorite: false };
    } else {
      // Ajouter aux favoris
      await ctx.db.insert("favorites", {
        userId: args.userId,
        productId: args.productId,
        createdAt: Date.now(),
      });
      return { action: "added", isFavorite: true };
    }
  },
});

// Obtenir tous les favoris d'un utilisateur
export const getUserFavorites = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Récupérer les détails des produits favoris
    const favoriteProducts = await Promise.all(
      favorites.map(async (favorite) => {
        const product = await ctx.db.get(favorite.productId);
        return {
          favoriteId: favorite._id,
          product,
          addedAt: favorite.createdAt,
        };
      })
    );

    return favoriteProducts.filter(fp => fp.product !== null);
  },
});

// Vérifier si un produit est dans les favoris d'un utilisateur
export const isFavorite = query({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_product", (q) => 
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    return favorite !== null;
  },
});

// Obtenir le nombre de favoris d'un utilisateur
export const getFavoritesCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return favorites.length;
  },
});

// Obtenir les IDs des produits favoris d'un utilisateur (pour optimisation)
export const getUserFavoriteIds = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return favorites.map(favorite => favorite.productId);
  },
});
