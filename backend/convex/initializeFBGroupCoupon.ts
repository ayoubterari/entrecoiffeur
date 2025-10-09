import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Initialize FBGROUP coupon for group members
export const initializeFBGroupCoupon = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if FBGROUP coupon already exists
    const existingCoupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", "FBGROUP"))
      .first();

    if (existingCoupon) {
      return {
        success: true,
        message: "Le coupon FBGROUP existe déjà",
        couponId: existingCoupon._id
      };
    }

    // Find or create admin user to be the creator
    let adminUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "admin@entre-coiffeur.com"))
      .first();

    if (!adminUser) {
      // Create admin user if it doesn't exist
      const adminId = await ctx.db.insert("users", {
        email: "admin@entre-coiffeur.com",
        password: "admin123", // En production, utiliser un hash
        firstName: "Super",
        lastName: "Admin",
        userType: "superadmin",
        companyName: "Entre Coiffeur Administration",
        createdAt: Date.now(),
      });
      
      adminUser = await ctx.db.get(adminId);
    }

    const now = Date.now();
    const oneYearFromNow = now + (365 * 24 * 60 * 60 * 1000); // 1 an

    // Create FBGROUP coupon
    const couponId = await ctx.db.insert("coupons", {
      code: "FBGROUP",
      discountPercentage: 15, // 15% de réduction
      description: "Coupon exclusif pour les membres du groupe Facebook - 15% de réduction sur votre première commande !",
      isActive: true,
      usageLimit: 1000, // Limite à 1000 utilisations
      usageCount: 0,
      validFrom: now,
      validUntil: oneYearFromNow,
      minimumAmount: 25, // Commande minimum de 25€
      createdBy: adminUser!._id,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Coupon FBGROUP créé avec succès !",
      couponId: couponId,
      details: {
        code: "FBGROUP",
        discount: "15%",
        description: "Coupon exclusif pour les membres du groupe Facebook",
        minimumAmount: "25€",
        validUntil: new Date(oneYearFromNow).toLocaleDateString('fr-FR')
      }
    };
  },
});

// Get FBGROUP coupon details
export const getFBGroupCouponDetails = mutation({
  args: {},
  handler: async (ctx) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", "FBGROUP"))
      .first();

    if (!coupon) {
      return null;
    }

    return {
      ...coupon,
      isValid: coupon.isActive && 
               Date.now() >= coupon.validFrom && 
               (!coupon.validUntil || Date.now() <= coupon.validUntil) &&
               (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)
    };
  },
});
