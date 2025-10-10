import { query } from "../../_generated/server";
import { v } from "convex/values";

// Récupérer les notifications d'un utilisateur
export const getUserNotifications = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let notificationsQuery = ctx.db
      .query("notifications")
      .withIndex("by_user")
      .filter((q) => q.eq(q.field("userId"), args.userId));

    if (args.unreadOnly) {
      notificationsQuery = ctx.db
        .query("notifications")
        .withIndex("by_user_unread")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), args.userId),
            q.eq(q.field("isRead"), false)
          )
        );
    }

    const notifications = await notificationsQuery
      .order("desc")
      .take(args.limit || 50);

    return notifications;
  },
});

// Compter les notifications non lues
export const getUnreadNotificationsCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("isRead"), false)
        )
      )
      .collect();

    return unreadNotifications.length;
  },
});

// Récupérer les notifications de support pour un vendeur
export const getSellerSupportNotifications = query({
  args: {
    sellerId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.sellerId),
          q.eq(q.field("type"), "support_complaint")
        )
      )
      .order("desc")
      .take(args.limit || 20);

    return notifications;
  },
});
