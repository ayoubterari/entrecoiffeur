import { query } from "../../_generated/server";
import { v } from "convex/values";

// Récupérer tous les sous-utilisateurs d'un vendeur
export const getSellerUsersByParent = query({
  args: {
    parentSellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sellerUsers = await ctx.db
      .query("sellerUsers")
      .withIndex("by_parent_seller", (q) => q.eq("parentSellerId", args.parentSellerId))
      .collect();

    return sellerUsers;
  },
});

// Récupérer les sous-utilisateurs actifs d'un vendeur
export const getActiveSellerUsers = query({
  args: {
    parentSellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sellerUsers = await ctx.db
      .query("sellerUsers")
      .withIndex("by_parent_active", (q) => 
        q.eq("parentSellerId", args.parentSellerId).eq("isActive", true)
      )
      .collect();

    return sellerUsers;
  },
});

// Récupérer les permissions d'un utilisateur
export const getUserPermissions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sellerUser = await ctx.db
      .query("sellerUsers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!sellerUser) {
      return null;
    }

    return {
      ...sellerUser,
      isSubUser: true,
    };
  },
});

// Vérifier l'accès à un module spécifique
export const checkModuleAccess = query({
  args: {
    userId: v.id("users"),
    module: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return false;
    }

    // Si l'utilisateur est un professionnel/grossiste principal, il a tous les accès
    if (user.userType === "professionnel" || user.userType === "grossiste") {
      const sellerUser = await ctx.db
        .query("sellerUsers")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      // Si pas d'entrée sellerUser, c'est le compte principal
      if (!sellerUser) {
        return true;
      }

      // Si c'est un sous-utilisateur, vérifier les permissions
      if (!sellerUser.isActive) {
        return false;
      }

      return sellerUser.permissions[args.module as keyof typeof sellerUser.permissions] || false;
    }

    return false;
  },
});

// Récupérer les détails d'un sous-utilisateur
export const getSellerUserById = query({
  args: {
    sellerUserId: v.id("sellerUsers"),
  },
  handler: async (ctx, args) => {
    const sellerUser = await ctx.db.get(args.sellerUserId);
    if (!sellerUser) {
      return null;
    }

    // Récupérer les infos du parent
    const parentSeller = await ctx.db.get(sellerUser.parentSellerId);

    return {
      ...sellerUser,
      parentSellerName: parentSeller ? `${parentSeller.firstName} ${parentSeller.lastName}` : "Inconnu",
      parentSellerEmail: parentSeller?.email || "",
    };
  },
});

// Récupérer les statistiques des sous-utilisateurs
export const getSellerUsersStats = query({
  args: {
    parentSellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db
      .query("sellerUsers")
      .withIndex("by_parent_seller", (q) => q.eq("parentSellerId", args.parentSellerId))
      .collect();

    const activeUsers = allUsers.filter(u => u.isActive);
    const inactiveUsers = allUsers.filter(u => !u.isActive);

    const byRole = {
      manager: allUsers.filter(u => u.role === "manager").length,
      employee: allUsers.filter(u => u.role === "employee").length,
      viewer: allUsers.filter(u => u.role === "viewer").length,
    };

    return {
      total: allUsers.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      byRole,
    };
  },
});
