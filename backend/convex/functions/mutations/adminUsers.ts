import { v } from "convex/values";
import { mutation } from "../../_generated/server";

// Créer un nouvel utilisateur admin complet (avec compte utilisateur)
export const createAdminUserComplete = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal("superadmin"), v.literal("admin"), v.literal("moderator")),
    permissions: v.object({
      dashboard: v.boolean(),
      users: v.boolean(),
      products: v.boolean(),
      categories: v.boolean(),
      orders: v.boolean(),
      commissions: v.boolean(),
      netvendeur: v.boolean(),
      paiement: v.boolean(),
      blog: v.boolean(),
      coupons: v.boolean(),
      support: v.boolean(),
      stats: v.boolean(),
      settings: v.boolean(),
    }),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier si l'email existe déjà
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    // Créer le compte utilisateur
    // Note: userType doit être différent de "superadmin" pour que les permissions soient vérifiées
    // On utilise "particulier" comme type de base, les permissions seront gérées via adminUsers
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password, // En production, hasher le mot de passe
      firstName: args.firstName,
      lastName: args.lastName,
      userType: "particulier", // Type de base, les permissions admin sont dans adminUsers
      createdAt: Date.now(),
    });

    // Créer l'entrée admin avec permissions
    const adminUserId = await ctx.db.insert("adminUsers", {
      userId: userId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role,
      permissions: args.permissions,
      isActive: true,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, adminUserId };
  },
});

// Créer un nouvel utilisateur admin (à partir d'un utilisateur existant)
export const createAdminUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal("superadmin"), v.literal("admin"), v.literal("moderator")),
    permissions: v.object({
      dashboard: v.boolean(),
      users: v.boolean(),
      products: v.boolean(),
      categories: v.boolean(),
      orders: v.boolean(),
      commissions: v.boolean(),
      netvendeur: v.boolean(),
      paiement: v.boolean(),
      blog: v.boolean(),
      coupons: v.boolean(),
      support: v.boolean(),
      stats: v.boolean(),
      settings: v.boolean(),
    }),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier si l'utilisateur admin existe déjà
    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      throw new Error("Cet utilisateur a déjà un accès admin");
    }

    // Créer l'utilisateur admin
    const adminUserId = await ctx.db.insert("adminUsers", {
      userId: args.userId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role,
      permissions: args.permissions,
      isActive: true,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return adminUserId;
  },
});

// Mettre à jour les permissions d'un utilisateur admin
export const updateAdminPermissions = mutation({
  args: {
    adminUserId: v.id("adminUsers"),
    permissions: v.object({
      dashboard: v.boolean(),
      users: v.boolean(),
      products: v.boolean(),
      categories: v.boolean(),
      orders: v.boolean(),
      commissions: v.boolean(),
      netvendeur: v.boolean(),
      paiement: v.boolean(),
      blog: v.boolean(),
      coupons: v.boolean(),
      support: v.boolean(),
      stats: v.boolean(),
      settings: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.adminUserId, {
      permissions: args.permissions,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mettre à jour le rôle d'un utilisateur admin
export const updateAdminRole = mutation({
  args: {
    adminUserId: v.id("adminUsers"),
    role: v.union(v.literal("superadmin"), v.literal("admin"), v.literal("moderator")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.adminUserId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Activer/Désactiver un utilisateur admin
export const toggleAdminStatus = mutation({
  args: {
    adminUserId: v.id("adminUsers"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.adminUserId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Supprimer un utilisateur admin
export const deleteAdminUser = mutation({
  args: {
    adminUserId: v.id("adminUsers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.adminUserId);
    return { success: true };
  },
});
