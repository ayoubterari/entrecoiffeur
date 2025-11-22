import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// Créer un nouveau coupon
export const createCoupon = mutation({
  args: {
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    usageLimit: v.optional(v.number()),
    usageLimitPerUser: v.optional(v.number()),
    validFrom: v.number(),
    validUntil: v.optional(v.number()),
    minimumAmount: v.optional(v.number()),
    maximumDiscount: v.optional(v.number()),
    applicableToAllProducts: v.boolean(),
    specificProductIds: v.optional(v.array(v.id("products"))),
    specificCategoryIds: v.optional(v.array(v.id("categories"))),
    applicableToAllUsers: v.boolean(),
    specificUserTypes: v.optional(v.array(v.string())),
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que le vendeur est bien un professionnel ou grossiste
    const seller = await ctx.db.get(args.sellerId);
    if (!seller) {
      throw new Error("Vendeur introuvable");
    }
    
    if (seller.userType !== "professionnel" && seller.userType !== "grossiste" && seller.userType !== "superadmin") {
      throw new Error("Seuls les professionnels, grossistes et administrateurs peuvent créer des coupons");
    }

    // Vérifier si le code existe déjà pour ce vendeur
    const existingCoupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (existingCoupon && existingCoupon.sellerId === args.sellerId) {
      throw new Error("Un coupon avec ce code existe déjà");
    }

    // Valider les valeurs
    if (args.discountType === "percentage" && (args.discountValue < 0 || args.discountValue > 100)) {
      throw new Error("Le pourcentage doit être entre 0 et 100");
    }

    if (args.discountType === "fixed" && args.discountValue < 0) {
      throw new Error("Le montant de réduction doit être positif");
    }

    // Créer le coupon
    const couponId = await ctx.db.insert("coupons", {
      code: args.code.toUpperCase(),
      discountType: args.discountType,
      discountValue: args.discountValue,
      description: args.description,
      isActive: args.isActive,
      usageLimit: args.usageLimit,
      usageLimitPerUser: args.usageLimitPerUser,
      usageCount: 0,
      validFrom: args.validFrom,
      validUntil: args.validUntil,
      minimumAmount: args.minimumAmount,
      maximumDiscount: args.maximumDiscount,
      applicableToAllProducts: args.applicableToAllProducts,
      specificProductIds: args.specificProductIds,
      specificCategoryIds: args.specificCategoryIds,
      applicableToAllUsers: args.applicableToAllUsers,
      specificUserTypes: args.specificUserTypes,
      sellerId: args.sellerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { couponId };
  },
});

// Mettre à jour un coupon
export const updateCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
    code: v.optional(v.string()),
    discountType: v.optional(v.union(v.literal("percentage"), v.literal("fixed"))),
    discountValue: v.optional(v.number()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    usageLimit: v.optional(v.number()),
    usageLimitPerUser: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    minimumAmount: v.optional(v.number()),
    maximumDiscount: v.optional(v.number()),
    applicableToAllProducts: v.optional(v.boolean()),
    specificProductIds: v.optional(v.array(v.id("products"))),
    specificCategoryIds: v.optional(v.array(v.id("categories"))),
    applicableToAllUsers: v.optional(v.boolean()),
    specificUserTypes: v.optional(v.array(v.string())),
    updatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Coupon introuvable");
    }

    // Vérifier que l'updater est le propriétaire
    if (coupon.sellerId !== args.updatedBy) {
      throw new Error("Vous n'avez pas la permission de modifier ce coupon");
    }

    // Préparer les mises à jour
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.code !== undefined) {
      // Vérifier si le nouveau code existe déjà
      const existingCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", args.code!.toUpperCase()))
        .first();

      if (existingCoupon && existingCoupon._id !== args.couponId) {
        throw new Error("Un coupon avec ce code existe déjà");
      }
      updates.code = args.code.toUpperCase();
    }

    if (args.discountType !== undefined) updates.discountType = args.discountType;
    if (args.discountValue !== undefined) {
      if (args.discountType === "percentage" && (args.discountValue < 0 || args.discountValue > 100)) {
        throw new Error("Le pourcentage doit être entre 0 et 100");
      }
      updates.discountValue = args.discountValue;
    }
    if (args.description !== undefined) updates.description = args.description;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.usageLimit !== undefined) updates.usageLimit = args.usageLimit;
    if (args.usageLimitPerUser !== undefined) updates.usageLimitPerUser = args.usageLimitPerUser;
    if (args.validFrom !== undefined) updates.validFrom = args.validFrom;
    if (args.validUntil !== undefined) updates.validUntil = args.validUntil;
    if (args.minimumAmount !== undefined) updates.minimumAmount = args.minimumAmount;
    if (args.maximumDiscount !== undefined) updates.maximumDiscount = args.maximumDiscount;
    if (args.applicableToAllProducts !== undefined) updates.applicableToAllProducts = args.applicableToAllProducts;
    if (args.specificProductIds !== undefined) updates.specificProductIds = args.specificProductIds;
    if (args.specificCategoryIds !== undefined) updates.specificCategoryIds = args.specificCategoryIds;
    if (args.applicableToAllUsers !== undefined) updates.applicableToAllUsers = args.applicableToAllUsers;
    if (args.specificUserTypes !== undefined) updates.specificUserTypes = args.specificUserTypes;

    await ctx.db.patch(args.couponId, updates);

    return { success: true };
  },
});

// Activer/Désactiver un coupon
export const toggleCouponStatus = mutation({
  args: {
    couponId: v.id("coupons"),
    updatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Coupon introuvable");
    }

    // Vérifier que l'updater est le propriétaire
    if (coupon.sellerId !== args.updatedBy) {
      throw new Error("Vous n'avez pas la permission de modifier ce coupon");
    }

    await ctx.db.patch(args.couponId, {
      isActive: !coupon.isActive,
      updatedAt: Date.now(),
    });

    return { success: true, isActive: !coupon.isActive };
  },
});

// Supprimer un coupon
export const deleteCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Coupon introuvable");
    }

    // Vérifier que le deleter est le propriétaire
    if (coupon.sellerId !== args.deletedBy) {
      throw new Error("Vous n'avez pas la permission de supprimer ce coupon");
    }

    // Supprimer le coupon
    await ctx.db.delete(args.couponId);

    // Supprimer les usages associés
    const usages = await ctx.db
      .query("couponUsages")
      .withIndex("by_coupon", (q) => q.eq("couponId", args.couponId))
      .collect();

    for (const usage of usages) {
      await ctx.db.delete(usage._id);
    }

    return { success: true };
  },
});

// Dupliquer un coupon
export const duplicateCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
    newCode: v.string(),
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const originalCoupon = await ctx.db.get(args.couponId);
    if (!originalCoupon) {
      throw new Error("Coupon introuvable");
    }

    // Vérifier que le seller est le propriétaire
    if (originalCoupon.sellerId !== args.sellerId) {
      throw new Error("Vous n'avez pas la permission de dupliquer ce coupon");
    }

    // Vérifier si le nouveau code existe déjà
    const existingCoupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.newCode.toUpperCase()))
      .first();

    if (existingCoupon) {
      throw new Error("Un coupon avec ce code existe déjà");
    }

    // Créer le nouveau coupon avec les mêmes paramètres
    const newCouponId = await ctx.db.insert("coupons", {
      code: args.newCode.toUpperCase(),
      discountType: originalCoupon.discountType,
      discountValue: originalCoupon.discountValue,
      description: originalCoupon.description,
      isActive: false, // Désactivé par défaut
      usageLimit: originalCoupon.usageLimit,
      usageLimitPerUser: originalCoupon.usageLimitPerUser,
      usageCount: 0,
      validFrom: Date.now(), // Nouvelle date de début
      validUntil: originalCoupon.validUntil,
      minimumAmount: originalCoupon.minimumAmount,
      maximumDiscount: originalCoupon.maximumDiscount,
      applicableToAllProducts: originalCoupon.applicableToAllProducts,
      specificProductIds: originalCoupon.specificProductIds,
      specificCategoryIds: originalCoupon.specificCategoryIds,
      applicableToAllUsers: originalCoupon.applicableToAllUsers,
      specificUserTypes: originalCoupon.specificUserTypes,
      sellerId: args.sellerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { couponId: newCouponId };
  },
});
