import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// Create a new coupon
export const createCoupon = mutation({
  args: {
    code: v.string(),
    discountPercentage: v.number(),
    description: v.optional(v.string()),
    usageLimit: v.optional(v.number()),
    validFrom: v.number(),
    validUntil: v.optional(v.number()),
    minimumAmount: v.optional(v.number()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if coupon code already exists
    const existingCoupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (existingCoupon) {
      throw new Error("Un coupon avec ce code existe déjà");
    }

    // Validate discount percentage
    if (args.discountPercentage < 1 || args.discountPercentage > 100) {
      throw new Error("Le pourcentage de réduction doit être entre 1 et 100");
    }

    // Validate dates
    if (args.validUntil && args.validUntil <= args.validFrom) {
      throw new Error("La date de fin doit être postérieure à la date de début");
    }

    const now = Date.now();
    
    const couponId = await ctx.db.insert("coupons", {
      code: args.code.toUpperCase(),
      discountPercentage: args.discountPercentage,
      description: args.description,
      isActive: true,
      usageLimit: args.usageLimit,
      usageCount: 0,
      validFrom: args.validFrom,
      validUntil: args.validUntil,
      minimumAmount: args.minimumAmount,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    return couponId;
  },
});

// Update an existing coupon
export const updateCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
    code: v.optional(v.string()),
    discountPercentage: v.optional(v.number()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    usageLimit: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    minimumAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { couponId, ...updates } = args;
    
    // Get existing coupon
    const existingCoupon = await ctx.db.get(couponId);
    if (!existingCoupon) {
      throw new Error("Coupon non trouvé");
    }

    // If updating code, check for duplicates
    if (updates.code && updates.code.toUpperCase() !== existingCoupon.code) {
      const duplicateCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", updates.code.toUpperCase()))
        .first();

      if (duplicateCoupon) {
        throw new Error("Un coupon avec ce code existe déjà");
      }
    }

    // Validate discount percentage
    if (updates.discountPercentage && (updates.discountPercentage < 1 || updates.discountPercentage > 100)) {
      throw new Error("Le pourcentage de réduction doit être entre 1 et 100");
    }

    // Validate dates
    const validFrom = updates.validFrom || existingCoupon.validFrom;
    const validUntil = updates.validUntil !== undefined ? updates.validUntil : existingCoupon.validUntil;
    
    if (validUntil && validUntil <= validFrom) {
      throw new Error("La date de fin doit être postérieure à la date de début");
    }

    // Prepare update object
    const updateData: any = {
      ...updates,
      updatedAt: Date.now(),
    };

    // Convert code to uppercase if provided
    if (updates.code) {
      updateData.code = updates.code.toUpperCase();
    }

    await ctx.db.patch(couponId, updateData);
    
    return couponId;
  },
});

// Delete a coupon
export const deleteCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Coupon non trouvé");
    }

    await ctx.db.delete(args.couponId);
    return true;
  },
});

// Toggle coupon active status
export const toggleCouponStatus = mutation({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Coupon non trouvé");
    }

    await ctx.db.patch(args.couponId, {
      isActive: !coupon.isActive,
      updatedAt: Date.now(),
    });

    return !coupon.isActive;
  },
});

// Validate and apply coupon (for checkout process)
export const validateCoupon = mutation({
  args: {
    code: v.string(),
    orderAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!coupon) {
      throw new Error("Code coupon invalide");
    }

    if (!coupon.isActive) {
      throw new Error("Ce coupon n'est plus actif");
    }

    const now = Date.now();

    // Check if coupon is valid (date range)
    if (now < coupon.validFrom) {
      throw new Error("Ce coupon n'est pas encore valide");
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      throw new Error("Ce coupon a expiré");
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new Error("Ce coupon a atteint sa limite d'utilisation");
    }

    // Check minimum amount
    if (coupon.minimumAmount && args.orderAmount < coupon.minimumAmount) {
      throw new Error(`Montant minimum de ${coupon.minimumAmount}€ requis pour ce coupon`);
    }

    // Calculate discount
    const discountAmount = (args.orderAmount * coupon.discountPercentage) / 100;
    const finalAmount = args.orderAmount - discountAmount;

    return {
      isValid: true,
      couponId: coupon._id,
      discountPercentage: coupon.discountPercentage,
      discountAmount,
      finalAmount,
      description: coupon.description,
    };
  },
});

// Apply coupon (increment usage count)
export const applyCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Coupon non trouvé");
    }

    await ctx.db.patch(args.couponId, {
      usageCount: coupon.usageCount + 1,
      updatedAt: Date.now(),
    });

    return true;
  },
});
