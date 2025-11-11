import { query } from "../../_generated/server";
import { v } from "convex/values";

// Récupérer toutes les bannières actives pour le carrousel (page publique)
export const getActiveBanners = query({
  args: {},
  handler: async (ctx) => {
    const banners = await ctx.db
      .query("homeCarouselBanners")
      .withIndex("by_active_order", (q) => q.eq("isActive", true))
      .order("asc")
      .take(5); // Maximum 5 bannières

    return banners;
  },
});

// Récupérer toutes les bannières (admin)
export const getAllBanners = query({
  args: {},
  handler: async (ctx) => {
    const banners = await ctx.db
      .query("homeCarouselBanners")
      .order("asc")
      .collect();

    // Trier par ordre
    return banners.sort((a, b) => a.order - b.order);
  },
});

// Récupérer une bannière par ID
export const getBannerById = query({
  args: {
    bannerId: v.id("homeCarouselBanners"),
  },
  handler: async (ctx, args) => {
    const banner = await ctx.db.get(args.bannerId);
    return banner;
  },
});

// Compter le nombre de bannières actives
export const getActiveBannersCount = query({
  args: {},
  handler: async (ctx) => {
    const banners = await ctx.db
      .query("homeCarouselBanners")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return banners.length;
  },
});
