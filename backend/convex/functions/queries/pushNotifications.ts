import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Récupérer tous les abonnements actifs d'un utilisateur
 */
export const getUserPushSubscriptions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();

    return subscriptions;
  },
});

/**
 * Récupérer tous les abonnements actifs pour un vendeur (pour envoyer des notifications)
 */
export const getSellerPushSubscriptions = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.sellerId).eq("isActive", true)
      )
      .collect();

    return subscriptions;
  },
});

/**
 * Vérifier si un utilisateur a des abonnements actifs
 */
export const hasActivePushSubscription = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();

    return !!subscription;
  },
});
