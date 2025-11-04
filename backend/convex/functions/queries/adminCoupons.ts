import { query } from "../../_generated/server";
import { v } from "convex/values";

// Récupérer tous les coupons de tous les vendeurs (pour admin)
export const getAllCoupons = query({
  handler: async (ctx) => {
    const coupons = await ctx.db.query("coupons").collect();

    // Enrichir avec les informations des vendeurs, produits et catégories
    const enrichedCoupons = await Promise.all(
      coupons.map(async (coupon) => {
        // Informations du vendeur
        const seller = await ctx.db.get(coupon.sellerId);
        const sellerName = seller ? `${seller.firstName} ${seller.lastName}` : "Inconnu";
        const sellerEmail = seller?.email || "";
        const sellerCompany = seller?.companyName || "";

        // Informations des produits
        let productNames: string[] = [];
        if (coupon.specificProductIds && coupon.specificProductIds.length > 0) {
          const products = await Promise.all(
            coupon.specificProductIds.map((id) => ctx.db.get(id))
          );
          productNames = products.filter((p) => p !== null).map((p) => p!.name);
        }

        // Informations des catégories
        let categoryNames: string[] = [];
        if (coupon.specificCategoryIds && coupon.specificCategoryIds.length > 0) {
          const categories = await Promise.all(
            coupon.specificCategoryIds.map((id) => ctx.db.get(id))
          );
          categoryNames = categories.filter((c) => c !== null).map((c) => c!.name);
        }

        return {
          ...coupon,
          sellerName,
          sellerEmail,
          sellerCompany,
          productNames,
          categoryNames,
        };
      })
    );

    return enrichedCoupons;
  },
});

// Récupérer les statistiques globales des coupons (pour admin)
export const getGlobalCouponStats = query({
  handler: async (ctx) => {
    const allCoupons = await ctx.db.query("coupons").collect();

    const now = Date.now();
    const activeCoupons = allCoupons.filter((c) => c.isActive);
    const expiredCoupons = allCoupons.filter((c) => c.validUntil && c.validUntil < now);
    const upcomingCoupons = allCoupons.filter((c) => c.validFrom > now);

    const totalUsages = allCoupons.reduce((sum, c) => sum + c.usageCount, 0);

    // Calculer le total des réductions accordées (estimation)
    let totalDiscountGiven = 0;
    for (const coupon of allCoupons) {
      if (coupon.discountType === "fixed") {
        totalDiscountGiven += (coupon.discountValue || 0) * coupon.usageCount;
      }
    }

    // Nombre de vendeurs utilisant des coupons
    const uniqueSellers = new Set(allCoupons.map((c) => c.sellerId)).size;

    return {
      total: allCoupons.length,
      active: activeCoupons.length,
      expired: expiredCoupons.length,
      upcoming: upcomingCoupons.length,
      totalUsages,
      totalDiscountGiven,
      uniqueSellers,
    };
  },
});

// Récupérer les coupons d'un vendeur spécifique (pour admin)
export const getCouponsBySeller = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const coupons = await ctx.db
      .query("coupons")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    return coupons;
  },
});

// Récupérer l'historique d'utilisation global (pour admin)
export const getGlobalCouponUsageHistory = query({
  handler: async (ctx) => {
    const usages = await ctx.db
      .query("couponUsages")
      .collect();

    // Enrichir avec les informations des utilisateurs et coupons
    const enrichedUsages = await Promise.all(
      usages.map(async (usage) => {
        const user = await ctx.db.get(usage.userId);
        const coupon = await ctx.db.get(usage.couponId);
        
        return {
          ...usage,
          userName: user ? `${user.firstName} ${user.lastName}` : "Utilisateur inconnu",
          userEmail: user?.email || "",
          couponCode: coupon?.code || "Coupon supprimé",
        };
      })
    );

    return enrichedUsages.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  },
});

// Récupérer les top coupons les plus utilisés (pour admin)
export const getTopCoupons = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const allCoupons = await ctx.db.query("coupons").collect();

    // Trier par nombre d'utilisations
    const sortedCoupons = allCoupons
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);

    // Enrichir avec les informations des vendeurs
    const enrichedCoupons = await Promise.all(
      sortedCoupons.map(async (coupon) => {
        const seller = await ctx.db.get(coupon.sellerId);
        return {
          ...coupon,
          sellerName: seller ? `${seller.firstName} ${seller.lastName}` : "Inconnu",
          sellerCompany: seller?.companyName || "",
        };
      })
    );

    return enrichedCoupons;
  },
});
