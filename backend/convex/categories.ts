import { query } from "./_generated/server";

// Récupérer toutes les catégories
export const getAllCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories;
  },
});

// Récupérer les catégories principales (niveau 0)
export const getMainCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_level", (q) => q.eq("level", 0))
      .collect();
    return categories;
  },
});

// Récupérer les sous-catégories d'une catégorie
export const getSubCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_level", (q) => q.eq("level", 1))
      .collect();
    return categories;
  },
});
