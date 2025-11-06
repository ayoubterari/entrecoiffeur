import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Mutation pour enregistrer une activité utilisateur
 */
export const trackActivity = mutation({
  args: {
    userId: v.optional(v.id("users")),
    sessionId: v.string(),
    activityType: v.union(
      v.literal("product_view"),
      v.literal("page_view"),
      v.literal("category_browse"),
      v.literal("search"),
      v.literal("store_visit")
    ),
    resourceId: v.optional(v.string()),
    resourceName: v.optional(v.string()),
    timeSpent: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    pageUrl: v.string(),
    referrer: v.optional(v.string()),
    deviceType: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Enregistrer l'activité
    const activityId = await ctx.db.insert("userActivityTracking", {
      userId: args.userId,
      sessionId: args.sessionId,
      activityType: args.activityType,
      resourceId: args.resourceId,
      resourceName: args.resourceName,
      timeSpent: args.timeSpent,
      startTime: args.startTime,
      endTime: args.endTime,
      pageUrl: args.pageUrl,
      referrer: args.referrer,
      deviceType: args.deviceType,
      userAgent: args.userAgent,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return { success: true, activityId };
  },
});

/**
 * Mutation pour enregistrer plusieurs activités en batch
 */
export const trackActivitiesBatch = mutation({
  args: {
    activities: v.array(v.object({
      userId: v.optional(v.id("users")),
      sessionId: v.string(),
      activityType: v.union(
        v.literal("product_view"),
        v.literal("page_view"),
        v.literal("category_browse"),
        v.literal("search"),
        v.literal("store_visit")
      ),
      resourceId: v.optional(v.string()),
      resourceName: v.optional(v.string()),
      timeSpent: v.number(),
      startTime: v.number(),
      endTime: v.number(),
      pageUrl: v.string(),
      referrer: v.optional(v.string()),
      deviceType: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      metadata: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    const activityIds = [];

    for (const activity of args.activities) {
      const activityId = await ctx.db.insert("userActivityTracking", {
        ...activity,
        createdAt: Date.now(),
      });
      activityIds.push(activityId);
    }

    return { success: true, count: activityIds.length, activityIds };
  },
});

/**
 * Mutation pour supprimer les anciennes données (GDPR, nettoyage)
 */
export const deleteOldActivities = mutation({
  args: {
    olderThanDays: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);
    
    const oldActivities = await ctx.db
      .query("userActivityTracking")
      .withIndex("by_date", (q) => q.lt("createdAt", cutoffDate))
      .collect();

    let deletedCount = 0;
    for (const activity of oldActivities) {
      await ctx.db.delete(activity._id);
      deletedCount++;
    }

    return { success: true, deletedCount };
  },
});
