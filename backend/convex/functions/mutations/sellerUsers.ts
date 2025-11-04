import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// Créer un sous-utilisateur complet (compte + permissions)
export const createSellerUserComplete = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    parentSellerId: v.id("users"),
    role: v.union(v.literal("manager"), v.literal("employee"), v.literal("viewer")),
    permissions: v.object({
      profile: v.boolean(),
      products: v.boolean(),
      orders: v.boolean(),
      purchases: v.boolean(),
      messages: v.boolean(),
      complaints: v.boolean(),
      coupons: v.boolean(),
      support: v.boolean(),
      stats: v.boolean(),
      settings: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    // Vérifier que le parent est bien un professionnel ou grossiste
    const parentSeller = await ctx.db.get(args.parentSellerId);
    if (!parentSeller) {
      throw new Error("Vendeur parent introuvable");
    }
    
    if (parentSeller.userType !== "professionnel" && parentSeller.userType !== "grossiste") {
      throw new Error("Seuls les professionnels et grossistes peuvent créer des sous-utilisateurs");
    }

    // Vérifier si l'email existe déjà
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    // Créer le compte utilisateur avec le même userType que le parent
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      firstName: args.firstName,
      lastName: args.lastName,
      userType: parentSeller.userType, // Hérite du type du parent
      createdAt: Date.now(),
    });

    // Créer l'entrée sellerUser avec les permissions
    const sellerUserId = await ctx.db.insert("sellerUsers", {
      userId: userId,
      parentSellerId: args.parentSellerId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role,
      permissions: args.permissions,
      isActive: true,
      createdBy: args.parentSellerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, sellerUserId };
  },
});

// Mettre à jour les permissions d'un sous-utilisateur
export const updateSellerUserPermissions = mutation({
  args: {
    sellerUserId: v.id("sellerUsers"),
    permissions: v.object({
      profile: v.boolean(),
      products: v.boolean(),
      orders: v.boolean(),
      purchases: v.boolean(),
      messages: v.boolean(),
      complaints: v.boolean(),
      coupons: v.boolean(),
      support: v.boolean(),
      stats: v.boolean(),
      settings: v.boolean(),
    }),
    updatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sellerUser = await ctx.db.get(args.sellerUserId);
    if (!sellerUser) {
      throw new Error("Sous-utilisateur introuvable");
    }

    // Vérifier que l'updater est le parent seller
    if (sellerUser.parentSellerId !== args.updatedBy) {
      throw new Error("Vous n'avez pas la permission de modifier ce sous-utilisateur");
    }

    await ctx.db.patch(args.sellerUserId, {
      permissions: args.permissions,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mettre à jour le rôle d'un sous-utilisateur
export const updateSellerUserRole = mutation({
  args: {
    sellerUserId: v.id("sellerUsers"),
    role: v.union(v.literal("manager"), v.literal("employee"), v.literal("viewer")),
    updatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sellerUser = await ctx.db.get(args.sellerUserId);
    if (!sellerUser) {
      throw new Error("Sous-utilisateur introuvable");
    }

    // Vérifier que l'updater est le parent seller
    if (sellerUser.parentSellerId !== args.updatedBy) {
      throw new Error("Vous n'avez pas la permission de modifier ce sous-utilisateur");
    }

    await ctx.db.patch(args.sellerUserId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Activer/Désactiver un sous-utilisateur
export const toggleSellerUserStatus = mutation({
  args: {
    sellerUserId: v.id("sellerUsers"),
    updatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sellerUser = await ctx.db.get(args.sellerUserId);
    if (!sellerUser) {
      throw new Error("Sous-utilisateur introuvable");
    }

    // Vérifier que l'updater est le parent seller
    if (sellerUser.parentSellerId !== args.updatedBy) {
      throw new Error("Vous n'avez pas la permission de modifier ce sous-utilisateur");
    }

    await ctx.db.patch(args.sellerUserId, {
      isActive: !sellerUser.isActive,
      updatedAt: Date.now(),
    });

    return { success: true, isActive: !sellerUser.isActive };
  },
});

// Supprimer un sous-utilisateur
export const deleteSellerUser = mutation({
  args: {
    sellerUserId: v.id("sellerUsers"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sellerUser = await ctx.db.get(args.sellerUserId);
    if (!sellerUser) {
      throw new Error("Sous-utilisateur introuvable");
    }

    // Vérifier que le deleter est le parent seller
    if (sellerUser.parentSellerId !== args.deletedBy) {
      throw new Error("Vous n'avez pas la permission de supprimer ce sous-utilisateur");
    }

    // Supprimer l'entrée sellerUser
    await ctx.db.delete(args.sellerUserId);

    // Optionnel : Désactiver le compte utilisateur principal plutôt que de le supprimer
    // Pour garder l'historique des actions
    // await ctx.db.delete(sellerUser.userId);

    return { success: true };
  },
});
