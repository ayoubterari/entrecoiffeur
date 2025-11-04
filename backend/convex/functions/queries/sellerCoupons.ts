import { query } from "../../_generated/server";
import { v } from "convex/values";

// Récupérer tous les coupons d'un vendeur
export const getSellerCoupons = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const coupons = await ctx.db
      .query("coupons")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    // Enrichir avec les informations des produits et catégories
    const enrichedCoupons = await Promise.all(
      coupons.map(async (coupon) => {
        let productNames: string[] = [];
        let categoryNames: string[] = [];

        if (coupon.specificProductIds && coupon.specificProductIds.length > 0) {
          const products = await Promise.all(
            coupon.specificProductIds.map((id) => ctx.db.get(id))
          );
          productNames = products.filter((p) => p !== null).map((p) => p!.name);
        }

        if (coupon.specificCategoryIds && coupon.specificCategoryIds.length > 0) {
          const categories = await Promise.all(
            coupon.specificCategoryIds.map((id) => ctx.db.get(id))
          );
          categoryNames = categories.filter((c) => c !== null).map((c) => c!.name);
        }

        return {
          ...coupon,
          productNames,
          categoryNames,
        };
      })
    );

    return enrichedCoupons;
  },
});

// Récupérer les coupons actifs d'un vendeur
export const getActiveCoupons = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const coupons = await ctx.db
      .query("coupons")
      .withIndex("by_seller_active", (q) => 
        q.eq("sellerId", args.sellerId).eq("isActive", true)
      )
      .collect();

    // Filtrer les coupons valides (dans la période de validité)
    const now = Date.now();
    const validCoupons = coupons.filter((coupon) => {
      const isStarted = coupon.validFrom <= now;
      const isNotExpired = !coupon.validUntil || coupon.validUntil >= now;
      const hasUsagesLeft = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;
      
      return isStarted && isNotExpired && hasUsagesLeft;
    });

    return validCoupons;
  },
});

// Récupérer un coupon par son ID
export const getCouponById = query({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      return null;
    }

    // Enrichir avec les informations des produits et catégories
    let productNames: string[] = [];
    let categoryNames: string[] = [];

    if (coupon.specificProductIds && coupon.specificProductIds.length > 0) {
      const products = await Promise.all(
        coupon.specificProductIds.map((id) => ctx.db.get(id))
      );
      productNames = products.filter((p) => p !== null).map((p) => p!.name);
    }

    if (coupon.specificCategoryIds && coupon.specificCategoryIds.length > 0) {
      const categories = await Promise.all(
        coupon.specificCategoryIds.map((id) => ctx.db.get(id))
      );
      categoryNames = categories.filter((c) => c !== null).map((c) => c!.name);
    }

    // Récupérer les statistiques d'utilisation
    const usages = await ctx.db
      .query("couponUsages")
      .withIndex("by_coupon", (q) => q.eq("couponId", args.couponId))
      .collect();

    const uniqueUsers = new Set(usages.map((u) => u.userId)).size;

    return {
      ...coupon,
      productNames,
      categoryNames,
      uniqueUsers,
      totalUsages: usages.length,
    };
  },
});

// Vérifier si un coupon est valide pour un utilisateur
export const validateCoupon = query({
  args: {
    code: v.string(),
    userId: v.id("users"),
    sellerId: v.id("users"),
    cartTotal: v.number(),
    productIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    // Trouver le coupon
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!coupon) {
      return { valid: false, error: "Code coupon invalide" };
    }

    // Vérifier que le coupon appartient au vendeur
    if (coupon.sellerId !== args.sellerId) {
      return { valid: false, error: "Ce coupon n'est pas valide pour ce vendeur" };
    }

    // Vérifier si le coupon est actif
    if (!coupon.isActive) {
      return { valid: false, error: "Ce coupon n'est plus actif" };
    }

    // Vérifier la période de validité
    const now = Date.now();
    if (coupon.validFrom > now) {
      return { valid: false, error: "Ce coupon n'est pas encore valide" };
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      return { valid: false, error: "Ce coupon a expiré" };
    }

    // Vérifier la limite globale d'utilisation
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, error: "Ce coupon a atteint sa limite d'utilisation" };
    }

    // Vérifier la limite par utilisateur
    if (coupon.usageLimitPerUser) {
      const userUsage = await ctx.db
        .query("couponUsages")
        .withIndex("by_coupon_user", (q) => 
          q.eq("couponId", coupon._id).eq("userId", args.userId)
        )
        .first();

      if (userUsage && userUsage.usageCount >= coupon.usageLimitPerUser) {
        return { 
          valid: false, 
          error: `Vous avez déjà utilisé ce coupon ${coupon.usageLimitPerUser} fois` 
        };
      }
    }

    // Vérifier le montant minimum
    if (coupon.minimumAmount && args.cartTotal < coupon.minimumAmount) {
      return { 
        valid: false, 
        error: `Montant minimum requis: ${coupon.minimumAmount} DH` 
      };
    }

    // Vérifier les restrictions de type d'utilisateur
    if (!coupon.applicableToAllUsers && coupon.specificUserTypes) {
      const user = await ctx.db.get(args.userId);
      if (!user || !coupon.specificUserTypes.includes(user.userType)) {
        return { 
          valid: false, 
          error: "Ce coupon n'est pas disponible pour votre type de compte" 
        };
      }
    }

    // Vérifier les restrictions de produits
    if (!coupon.applicableToAllProducts) {
      if (coupon.specificProductIds && coupon.specificProductIds.length > 0) {
        const hasValidProduct = args.productIds.some((pid) => 
          coupon.specificProductIds!.includes(pid)
        );
        if (!hasValidProduct) {
          return { 
            valid: false, 
            error: "Ce coupon ne s'applique à aucun produit de votre panier" 
          };
        }
      }

      if (coupon.specificCategoryIds && coupon.specificCategoryIds.length > 0) {
        // Récupérer les catégories des produits du panier
        const products = await Promise.all(
          args.productIds.map((id) => ctx.db.get(id))
        );
        const productCategoryIds = products
          .filter((p) => p !== null)
          .map((p) => p!.categoryId)
          .filter((cid) => cid !== undefined);

        const hasValidCategory = productCategoryIds.some((cid) => 
          coupon.specificCategoryIds!.includes(cid!)
        );
        if (!hasValidCategory) {
          return { 
            valid: false, 
            error: "Ce coupon ne s'applique à aucune catégorie de votre panier" 
          };
        }
      }
    }

    // Calculer la réduction
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (args.cartTotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return { 
      valid: true, 
      coupon,
      discountAmount: Math.min(discountAmount, args.cartTotal),
    };
  },
});

// Récupérer les statistiques des coupons d'un vendeur
export const getCouponStats = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allCoupons = await ctx.db
      .query("coupons")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    const now = Date.now();
    const activeCoupons = allCoupons.filter((c) => c.isActive);
    const expiredCoupons = allCoupons.filter((c) => c.validUntil && c.validUntil < now);
    const upcomingCoupons = allCoupons.filter((c) => c.validFrom > now);

    const totalUsages = allCoupons.reduce((sum, c) => sum + c.usageCount, 0);

    // Calculer le total des réductions accordées (estimation)
    let totalDiscountGiven = 0;
    for (const coupon of allCoupons) {
      if (coupon.discountType === "fixed") {
        totalDiscountGiven += coupon.discountValue * coupon.usageCount;
      }
      // Pour les pourcentages, on ne peut pas calculer sans les montants des commandes
    }

    return {
      total: allCoupons.length,
      active: activeCoupons.length,
      expired: expiredCoupons.length,
      upcoming: upcomingCoupons.length,
      totalUsages,
      totalDiscountGiven,
    };
  },
});

// Récupérer l'historique d'utilisation d'un coupon
export const getCouponUsageHistory = query({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    const usages = await ctx.db
      .query("couponUsages")
      .withIndex("by_coupon", (q) => q.eq("couponId", args.couponId))
      .collect();

    // Enrichir avec les informations des utilisateurs
    const enrichedUsages = await Promise.all(
      usages.map(async (usage) => {
        const user = await ctx.db.get(usage.userId);
        return {
          ...usage,
          userName: user ? `${user.firstName} ${user.lastName}` : "Utilisateur inconnu",
          userEmail: user?.email || "",
        };
      })
    );

    return enrichedUsages.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  },
});
