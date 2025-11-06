import { query } from "../../_generated/server";
import { v } from "convex/values";

// Récupérer tous les fonds de commerce d'un vendeur
export const getSellerBusinessSales = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const businessSales = await ctx.db
      .query("businessSales")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .collect();

    return businessSales;
  },
});

// Récupérer un fonds de commerce par ID
export const getBusinessSaleById = query({
  args: {
    id: v.id("businessSales"),
  },
  handler: async (ctx, args) => {
    const businessSale = await ctx.db.get(args.id);
    if (!businessSale) {
      return null;
    }

    // Récupérer les infos du vendeur
    const seller = await ctx.db.get(businessSale.sellerId);

    return {
      ...businessSale,
      seller: seller ? {
        _id: seller._id,
        firstName: seller.firstName,
        lastName: seller.lastName,
        email: seller.email,
        companyName: seller.companyName,
        phone: seller.phone,
      } : null,
    };
  },
});

// Alias pour getBusinessSaleById
export const getById = getBusinessSaleById;

// Récupérer tous les fonds de commerce actifs (pour la page publique)
export const getActiveBusinessSales = query({
  args: {
    city: v.optional(v.string()),
    activityType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let businessSales = await ctx.db
      .query("businessSales")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();

    // Filtrer par ville si spécifié
    if (args.city) {
      businessSales = businessSales.filter((bs) => bs.city === args.city);
    }

    // Filtrer par type d'activité si spécifié
    if (args.activityType) {
      businessSales = businessSales.filter((bs) => bs.activityType === args.activityType);
    }

    // Enrichir avec les infos du vendeur
    const enrichedBusinessSales = await Promise.all(
      businessSales.map(async (bs) => {
        const seller = await ctx.db.get(bs.sellerId);
        return {
          ...bs,
          seller: seller ? {
            _id: seller._id,
            companyName: seller.companyName,
            phone: seller.phone,
          } : null,
        };
      })
    );

    return enrichedBusinessSales;
  },
});

// Statistiques pour un vendeur
export const getSellerBusinessSalesStats = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const businessSales = await ctx.db
      .query("businessSales")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    const total = businessSales.length;
    const active = businessSales.filter((bs) => bs.status === "active").length;
    const pending = businessSales.filter((bs) => bs.status === "pending").length;
    const sold = businessSales.filter((bs) => bs.status === "sold").length;
    const inactive = businessSales.filter((bs) => bs.status === "inactive").length;

    const totalViews = businessSales.reduce((sum, bs) => sum + (bs.views || 0), 0);
    const totalContacts = businessSales.reduce((sum, bs) => sum + (bs.contactCount || 0), 0);

    return {
      total,
      active,
      pending,
      sold,
      inactive,
      totalViews,
      totalContacts,
    };
  },
});

// Rechercher des fonds de commerce
export const searchBusinessSales = query({
  args: {
    searchTerm: v.optional(v.string()),
    city: v.optional(v.string()),
    activityType: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let businessSales = await ctx.db
      .query("businessSales")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Filtrer par terme de recherche
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      businessSales = businessSales.filter(
        (bs) =>
          bs.activityType.toLowerCase().includes(term) ||
          bs.businessName?.toLowerCase().includes(term) ||
          bs.city.toLowerCase().includes(term) ||
          bs.address.toLowerCase().includes(term)
      );
    }

    // Filtrer par ville
    if (args.city) {
      businessSales = businessSales.filter((bs) => bs.city === args.city);
    }

    // Filtrer par type d'activité
    if (args.activityType) {
      businessSales = businessSales.filter((bs) => bs.activityType === args.activityType);
    }

    // Filtrer par prix
    if (args.minPrice !== undefined) {
      businessSales = businessSales.filter((bs) => bs.salePrice >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      businessSales = businessSales.filter((bs) => bs.salePrice <= args.maxPrice!);
    }

    return businessSales;
  },
});
