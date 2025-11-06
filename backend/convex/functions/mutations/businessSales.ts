import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// Créer un nouveau fonds de commerce
export const createBusinessSale = mutation({
  args: {
    activityType: v.string(),
    businessName: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    district: v.optional(v.string()),
    totalArea: v.string(),
    creationYear: v.number(),
    legalStatus: v.string(),
    saleReason: v.string(),
    salePrice: v.number(),
    annualRevenue: v.string(),
    netProfit: v.optional(v.string()),
    monthlyRent: v.number(),
    fixedCharges: v.optional(v.string()),
    leaseRemaining: v.string(),
    deposit: v.optional(v.string()),
    localDescription: v.string(),
    includedEquipment: v.string(),
    recentWorks: v.optional(v.string()),
    compliance: v.optional(v.string()),
    clienteleType: v.string(),
    footTraffic: v.string(),
    developmentPotential: v.optional(v.string()),
    images: v.optional(v.array(v.union(v.string(), v.id("_storage")))),
    floorPlan: v.optional(v.union(v.string(), v.id("_storage"))),
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Nettoyer les champs undefined
    const cleanedArgs: any = { ...args };
    Object.keys(cleanedArgs).forEach(key => {
      if (cleanedArgs[key] === undefined) {
        delete cleanedArgs[key];
      }
    });

    const businessSaleId = await ctx.db.insert("businessSales", {
      ...cleanedArgs,
      status: "active",
      views: 0,
      contactCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return businessSaleId;
  },
});

// Modifier un fonds de commerce
export const updateBusinessSale = mutation({
  args: {
    id: v.id("businessSales"),
    activityType: v.optional(v.string()),
    businessName: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    district: v.optional(v.string()),
    totalArea: v.optional(v.string()),
    creationYear: v.optional(v.number()),
    legalStatus: v.optional(v.string()),
    saleReason: v.optional(v.string()),
    salePrice: v.optional(v.number()),
    annualRevenue: v.optional(v.string()),
    netProfit: v.optional(v.string()),
    monthlyRent: v.optional(v.number()),
    fixedCharges: v.optional(v.string()),
    leaseRemaining: v.optional(v.string()),
    deposit: v.optional(v.string()),
    localDescription: v.optional(v.string()),
    includedEquipment: v.optional(v.string()),
    recentWorks: v.optional(v.string()),
    compliance: v.optional(v.string()),
    clienteleType: v.optional(v.string()),
    footTraffic: v.optional(v.string()),
    developmentPotential: v.optional(v.string()),
    images: v.optional(v.array(v.union(v.string(), v.id("_storage")))),
    floorPlan: v.optional(v.union(v.string(), v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Changer le statut d'un fonds de commerce
export const updateBusinessSaleStatus = mutation({
  args: {
    id: v.id("businessSales"),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("sold"),
      v.literal("inactive")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Supprimer un fonds de commerce
export const deleteBusinessSale = mutation({
  args: {
    id: v.id("businessSales"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Incrémenter le nombre de vues
export const incrementViews = mutation({
  args: {
    id: v.id("businessSales"),
  },
  handler: async (ctx, args) => {
    const businessSale = await ctx.db.get(args.id);
    if (!businessSale) {
      throw new Error("Fonds de commerce non trouvé");
    }

    await ctx.db.patch(args.id, {
      views: (businessSale.views || 0) + 1,
    });

    return { success: true };
  },
});

// Incrémenter le nombre de contacts
export const incrementContactCount = mutation({
  args: {
    id: v.id("businessSales"),
  },
  handler: async (ctx, args) => {
    const businessSale = await ctx.db.get(args.id);
    if (!businessSale) {
      throw new Error("Fonds de commerce non trouvé");
    }

    await ctx.db.patch(args.id, {
      contactCount: (businessSale.contactCount || 0) + 1,
    });

    return { success: true };
  },
});
