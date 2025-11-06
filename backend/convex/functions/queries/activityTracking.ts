import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Query pour obtenir les statistiques globales d'activité
 */
export const getActivityStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db.query("userActivityTracking").collect();

    // Filtrer par date si spécifié
    if (args.startDate) {
      const startDate = args.startDate;
      activities = activities.filter(a => a.createdAt >= startDate);
    }
    if (args.endDate) {
      const endDate = args.endDate;
      activities = activities.filter(a => a.createdAt <= endDate);
    }

    // Calculer les statistiques
    const totalActivities = activities.length;
    const totalTimeSpent = activities.reduce((sum, a) => sum + a.timeSpent, 0);
    const averageTimeSpent = totalActivities > 0 ? totalTimeSpent / totalActivities : 0;

    // Par type d'activité
    const byActivityType = activities.reduce((acc, a) => {
      if (!acc[a.activityType]) {
        acc[a.activityType] = { count: 0, totalTime: 0 };
      }
      acc[a.activityType]!.count++;
      acc[a.activityType]!.totalTime += a.timeSpent;
      return acc;
    }, {} as Record<string, { count: number; totalTime: number }>);

    // Utilisateurs uniques
    const uniqueUsers = new Set(activities.filter(a => a.userId).map(a => a.userId)).size;
    const uniqueSessions = new Set(activities.map(a => a.sessionId)).size;

    // Par appareil
    const byDevice = activities.reduce((acc, a) => {
      const device = a.deviceType || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActivities,
      totalTimeSpent,
      averageTimeSpent,
      uniqueUsers,
      uniqueSessions,
      byActivityType,
      byDevice,
    };
  },
});

/**
 * Query pour obtenir les produits les plus consultés
 */
export const getTopViewedProducts = query({
  args: {
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    let activities = await ctx.db
      .query("userActivityTracking")
      .withIndex("by_activity_type", (q) => q.eq("activityType", "product_view"))
      .collect();

    // Filtrer par date si spécifié
    if (args.startDate) {
      const startDate = args.startDate;
      activities = activities.filter(a => a.createdAt >= startDate);
    }
    if (args.endDate) {
      const endDate = args.endDate;
      activities = activities.filter(a => a.createdAt <= endDate);
    }

    // Grouper par produit
    const productStats = activities.reduce((acc, a) => {
      if (!a.resourceId) return acc;
      
      if (!acc[a.resourceId]) {
        acc[a.resourceId] = {
          productId: a.resourceId,
          productName: a.resourceName || "Produit inconnu",
          viewCount: 0,
          totalTimeSpent: 0,
          averageTimeSpent: 0,
          uniqueUsers: new Set(),
        };
      }
      
      acc[a.resourceId].viewCount++;
      acc[a.resourceId].totalTimeSpent += a.timeSpent;
      if (a.userId) {
        acc[a.resourceId].uniqueUsers.add(a.userId);
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculer les moyennes et convertir en array
    const products = Object.values(productStats).map((p: any) => ({
      productId: p.productId,
      productName: p.productName,
      viewCount: p.viewCount,
      totalTimeSpent: p.totalTimeSpent,
      averageTimeSpent: p.viewCount > 0 ? p.totalTimeSpent / p.viewCount : 0,
      uniqueUsers: p.uniqueUsers.size,
    }));

    // Trier par nombre de vues et limiter
    return products
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  },
});

/**
 * Query de debug pour voir toutes les activités brutes
 */
export const getAllActivitiesDebug = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const activities = await ctx.db
      .query("userActivityTracking")
      .order("desc")
      .take(limit);

    return activities;
  },
});

/**
 * Query pour obtenir l'activité d'un utilisateur spécifique
 */
export const getUserActivity = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const activities = await ctx.db
      .query("userActivityTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return activities;
  },
});

/**
 * Query pour obtenir l'activité sur un produit spécifique
 */
export const getProductActivity = query({
  args: {
    productId: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db
      .query("userActivityTracking")
      .withIndex("by_resource", (q) => q.eq("resourceId", args.productId))
      .collect();

    // Filtrer par date si spécifié
    if (args.startDate) {
      const startDate = args.startDate;
      activities = activities.filter(a => a.createdAt >= startDate);
    }
    if (args.endDate) {
      const endDate = args.endDate;
      activities = activities.filter(a => a.createdAt <= endDate);
    }

    // Calculer les statistiques
    const totalViews = activities.length;
    const totalTimeSpent = activities.reduce((sum, a) => sum + a.timeSpent, 0);
    const averageTimeSpent = totalViews > 0 ? totalTimeSpent / totalViews : 0;
    const uniqueUsers = new Set(activities.filter(a => a.userId).map(a => a.userId)).size;

    // Activité par jour
    const activityByDay = activities.reduce((acc, a) => {
      const date = new Date(a.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { views: 0, timeSpent: 0 };
      }
      acc[date]!.views++;
      acc[date]!.timeSpent += a.timeSpent;
      return acc;
    }, {} as Record<string, { views: number; timeSpent: number }>);

    return {
      productId: args.productId,
      totalViews,
      totalTimeSpent,
      averageTimeSpent,
      uniqueUsers,
      activityByDay,
      recentActivities: activities.slice(0, 10),
    };
  },
});

/**
 * Query pour obtenir les pages les plus visitées
 */
export const getTopPages = query({
  args: {
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    let activities = await ctx.db.query("userActivityTracking").collect();

    // Filtrer par date si spécifié
    if (args.startDate) {
      const startDate = args.startDate;
      activities = activities.filter(a => a.createdAt >= startDate);
    }
    if (args.endDate) {
      const endDate = args.endDate;
      activities = activities.filter(a => a.createdAt <= endDate);
    }

    // Grouper par page
    const pageStats = activities.reduce((acc, a) => {
      if (!acc[a.pageUrl]) {
        acc[a.pageUrl] = {
          pageUrl: a.pageUrl,
          viewCount: 0,
          totalTimeSpent: 0,
          uniqueUsers: new Set(),
        };
      }
      
      acc[a.pageUrl].viewCount++;
      acc[a.pageUrl].totalTimeSpent += a.timeSpent;
      if (a.userId) {
        acc[a.pageUrl].uniqueUsers.add(a.userId);
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Convertir en array et calculer les moyennes
    const pages = Object.values(pageStats).map((p: any) => ({
      pageUrl: p.pageUrl,
      viewCount: p.viewCount,
      totalTimeSpent: p.totalTimeSpent,
      averageTimeSpent: p.viewCount > 0 ? p.totalTimeSpent / p.viewCount : 0,
      uniqueUsers: p.uniqueUsers.size,
    }));

    // Trier par nombre de vues et limiter
    return pages
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  },
});

/**
 * Query pour obtenir l'activité en temps réel (dernières 24h)
 */
export const getRealtimeActivity = query({
  args: {},
  handler: async (ctx) => {
    const last24h = Date.now() - (24 * 60 * 60 * 1000);

    const activities = await ctx.db
      .query("userActivityTracking")
      .withIndex("by_date", (q) => q.gte("createdAt", last24h))
      .order("desc")
      .take(100);

    // Activité par heure
    const activityByHour = activities.reduce((acc, a) => {
      const hour = new Date(a.createdAt).getHours();
      if (!acc[hour]) acc[hour] = 0;
      acc[hour]!++;
      return acc;
    }, {} as Record<number, number>);

    return {
      recentActivities: activities.slice(0, 20),
      activityByHour,
      totalLast24h: activities.length,
    };
  },
});

/**
 * Query pour obtenir les utilisateurs les plus actifs
 */
export const getTopActiveUsers = query({
  args: {
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    let activities = await ctx.db.query("userActivityTracking").collect();

    // Filtrer par date et utilisateurs connectés uniquement
    activities = activities.filter(a => {
      if (!a.userId) return false;
      if (args.startDate && a.createdAt < args.startDate) return false;
      if (args.endDate && a.createdAt > args.endDate) return false;
      return true;
    });

    // Grouper par utilisateur
    const userStats = activities.reduce((acc, a) => {
      const userId = a.userId!;
      
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          activityCount: 0,
          totalTimeSpent: 0,
          lastActivity: 0,
        };
      }
      
      acc[userId].activityCount++;
      acc[userId].totalTimeSpent += a.timeSpent;
      acc[userId].lastActivity = Math.max(acc[userId].lastActivity, a.createdAt);
      
      return acc;
    }, {} as Record<string, any>);

    // Enrichir avec les infos utilisateur
    const users = await Promise.all(
      Object.values(userStats).map(async (stat: any) => {
        const user = await ctx.db.get(stat.userId);
        const userDoc = user as any;
        return {
          userId: stat.userId,
          userEmail: userDoc?.email || "Utilisateur inconnu",
          userName: userDoc ? `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() : "Inconnu",
          activityCount: stat.activityCount,
          totalTimeSpent: stat.totalTimeSpent,
          averageTimeSpent: stat.activityCount > 0 ? stat.totalTimeSpent / stat.activityCount : 0,
          lastActivity: stat.lastActivity,
        };
      })
    );

    // Trier par nombre d'activités et limiter
    return users
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, limit);
  },
});
