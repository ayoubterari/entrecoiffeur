import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Récupérer toutes les notifications en attente pour un utilisateur
 */
export const getPendingNotifications = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("pendingNotifications")
      .withIndex("by_user_delivered", (q) => 
        q.eq("userId", args.userId).eq("isDelivered", false)
      )
      .order("desc")
      .collect();

    return notifications;
  },
});

/**
 * Compter les notifications en attente pour un utilisateur
 */
export const countPendingNotifications = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("pendingNotifications")
      .withIndex("by_user_delivered", (q) => 
        q.eq("userId", args.userId).eq("isDelivered", false)
      )
      .collect();

    return notifications.length;
  },
});
