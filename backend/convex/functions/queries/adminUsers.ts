import { v } from "convex/values";
import { query } from "../../_generated/server";

// Récupérer tous les utilisateurs admin
export const getAllAdminUsers = query({
  handler: async (ctx) => {
    const adminUsers = await ctx.db.query("adminUsers").collect();
    return adminUsers;
  },
});

// Récupérer les permissions d'un utilisateur spécifique
export const getUserPermissions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!adminUser) {
      return null;
    }

    return {
      role: adminUser.role,
      permissions: adminUser.permissions,
      isActive: adminUser.isActive,
    };
  },
});

// Vérifier si un utilisateur a accès à un module spécifique
export const checkModuleAccess = query({
  args: {
    userId: v.id("users"),
    module: v.string(),
  },
  handler: async (ctx, args) => {
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!adminUser || !adminUser.isActive) {
      return false;
    }

    // Superadmin a accès à tout
    if (adminUser.role === "superadmin") {
      return true;
    }

    // Vérifier la permission spécifique
    return adminUser.permissions[args.module as keyof typeof adminUser.permissions] || false;
  },
});

// Récupérer un utilisateur admin par son ID
export const getAdminUserById = query({
  args: { adminUserId: v.id("adminUsers") },
  handler: async (ctx, args) => {
    const adminUser = await ctx.db.get(args.adminUserId);
    return adminUser;
  },
});

// Récupérer les utilisateurs admin actifs
export const getActiveAdminUsers = query({
  handler: async (ctx) => {
    const adminUsers = await ctx.db
      .query("adminUsers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    return adminUsers;
  },
});
