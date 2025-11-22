import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Enregistrer ou mettre à jour un abonnement push pour un utilisateur
 */
export const savePushSubscription = mutation({
  args: {
    userId: v.id("users"),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier si un abonnement existe déjà pour cet endpoint
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("endpoint"), args.endpoint))
      .first();

    if (existing) {
      // Mettre à jour l'abonnement existant
      await ctx.db.patch(existing._id, {
        keys: args.keys,
        userAgent: args.userAgent,
        isActive: true,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Créer un nouvel abonnement
      const subscriptionId = await ctx.db.insert("pushSubscriptions", {
        userId: args.userId,
        endpoint: args.endpoint,
        keys: args.keys,
        userAgent: args.userAgent,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return subscriptionId;
    }
  },
});

/**
 * Désactiver un abonnement push
 */
export const unsubscribePush = mutation({
  args: {
    userId: v.id("users"),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("endpoint"), args.endpoint))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
      return true;
    }
    return false;
  },
});

/**
 * Supprimer tous les abonnements inactifs d'un utilisateur
 */
export const cleanupInactiveSubscriptions = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const inactiveSubscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", false)
      )
      .collect();

    for (const sub of inactiveSubscriptions) {
      await ctx.db.delete(sub._id);
    }

    return inactiveSubscriptions.length;
  },
});
