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

    // Enrichir avec les URLs des images depuis Convex storage
    const bannersWithUrls = await Promise.all(
      banners.map(async (banner) => {
        let imageUrl = banner.imageUrl;
        
        // Si une image est stockée dans Convex, récupérer son URL
        if (banner.imageStorageId) {
          try {
            imageUrl = await ctx.storage.getUrl(banner.imageStorageId as any);
          } catch (error) {
            console.error('Erreur lors de la récupération de l\'URL de l\'image:', error);
          }
        }
        
        return {
          ...banner,
          imageUrl, // Remplacer ou ajouter l'URL de l'image
        };
      })
    );

    return bannersWithUrls;
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
