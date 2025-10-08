import { query } from "../../_generated/server";
import { v } from "convex/values";

// Get all coupons (admin only)
export const getAllCoupons = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const offset = args.offset || 0;

    const coupons = await ctx.db
      .query("coupons")
      .order("desc")
      .collect();

    // Get creator information for each coupon
    const couponsWithCreator = await Promise.all(
      coupons.slice(offset, offset + limit).map(async (coupon) => {
        const creator = await ctx.db.get(coupon.createdBy);
        return {
          ...coupon,
          creatorName: creator ? `${creator.firstName} ${creator.lastName}` : "Utilisateur supprimé",
          creatorEmail: creator?.email || "",
        };
      })
    );

    return {
      coupons: couponsWithCreator,
      total: coupons.length,
      hasMore: offset + limit < coupons.length,
    };
  },
});

// Get active coupons only
export const getActiveCoupons = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const coupons = await ctx.db
      .query("coupons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter by date validity
    const validCoupons = coupons.filter(coupon => {
      const isValidFrom = now >= coupon.validFrom;
      const isValidUntil = !coupon.validUntil || now <= coupon.validUntil;
      const hasUsageLeft = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;
      
      return isValidFrom && isValidUntil && hasUsageLeft;
    });

    return validCoupons;
  },
});

// Get coupon by ID
export const getCouponById = query({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      return null;
    }

    const creator = await ctx.db.get(coupon.createdBy);
    
    return {
      ...coupon,
      creatorName: creator ? `${creator.firstName} ${creator.lastName}` : "Utilisateur supprimé",
      creatorEmail: creator?.email || "",
    };
  },
});

// Get coupon by code (for validation)
export const getCouponByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!coupon) {
      return null;
    }

    return coupon;
  },
});

// Get coupon statistics
export const getCouponStats = query({
  args: {},
  handler: async (ctx) => {
    const allCoupons = await ctx.db.query("coupons").collect();
    const now = Date.now();

    const stats = {
      total: allCoupons.length,
      active: 0,
      expired: 0,
      used: 0,
      totalUsage: 0,
      averageDiscount: 0,
    };

    let totalDiscount = 0;

    allCoupons.forEach(coupon => {
      // Count active coupons
      if (coupon.isActive && 
          now >= coupon.validFrom && 
          (!coupon.validUntil || now <= coupon.validUntil) &&
          (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)) {
        stats.active++;
      }

      // Count expired coupons
      if (coupon.validUntil && now > coupon.validUntil) {
        stats.expired++;
      }

      // Count used coupons
      if (coupon.usageCount > 0) {
        stats.used++;
      }

      // Total usage
      stats.totalUsage += coupon.usageCount;

      // For average discount calculation
      totalDiscount += coupon.discountPercentage;
    });

    // Calculate average discount
    if (allCoupons.length > 0) {
      stats.averageDiscount = Math.round(totalDiscount / allCoupons.length);
    }

    return stats;
  },
});

// Search coupons by code or description
export const searchCoupons = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchTerm = args.searchTerm.toLowerCase();

    const allCoupons = await ctx.db.query("coupons").collect();

    const filteredCoupons = allCoupons
      .filter(coupon => 
        coupon.code.toLowerCase().includes(searchTerm) ||
        (coupon.description && coupon.description.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit);

    // Get creator information for each coupon
    const couponsWithCreator = await Promise.all(
      filteredCoupons.map(async (coupon) => {
        const creator = await ctx.db.get(coupon.createdBy);
        return {
          ...coupon,
          creatorName: creator ? `${creator.firstName} ${creator.lastName}` : "Utilisateur supprimé",
          creatorEmail: creator?.email || "",
        };
      })
    );

    return couponsWithCreator;
  },
});

// Get coupons created by specific admin
export const getCouponsByCreator = query({
  args: {
    creatorId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const coupons = await ctx.db
      .query("coupons")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.creatorId))
      .order("desc")
      .take(limit);

    const creator = await ctx.db.get(args.creatorId);
    
    return coupons.map(coupon => ({
      ...coupon,
      creatorName: creator ? `${creator.firstName} ${creator.lastName}` : "Utilisateur supprimé",
      creatorEmail: creator?.email || "",
    }));
  },
});
