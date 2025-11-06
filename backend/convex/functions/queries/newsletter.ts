import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Query pour récupérer tous les abonnés à la newsletter (admin)
 */
export const getAllNewsletterSubscribers = query({
  args: {},
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("newsletterSubscribers")
      .order("desc")
      .collect();

    return subscribers;
  },
});

/**
 * Query pour récupérer les statistiques de la newsletter (admin)
 */
export const getNewsletterStats = query({
  args: {},
  handler: async (ctx) => {
    const allSubscribers = await ctx.db
      .query("newsletterSubscribers")
      .collect();

    const activeSubscribers = allSubscribers.filter(sub => sub.isActive);
    const inactiveSubscribers = allSubscribers.filter(sub => !sub.isActive);

    // Calculer les abonnements par source
    const bySource = allSubscribers.reduce((acc, sub) => {
      const source = sub.source || "unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculer les nouveaux abonnés des 7 derniers jours
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const newSubscribersLastWeek = allSubscribers.filter(
      sub => sub.subscribedAt >= sevenDaysAgo
    ).length;

    // Calculer les nouveaux abonnés du mois en cours
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const newSubscribersThisMonth = allSubscribers.filter(
      sub => sub.subscribedAt >= firstDayOfMonth
    ).length;

    return {
      total: allSubscribers.length,
      active: activeSubscribers.length,
      inactive: inactiveSubscribers.length,
      newLastWeek: newSubscribersLastWeek,
      newThisMonth: newSubscribersThisMonth,
      bySource,
    };
  },
});

/**
 * Query pour rechercher des abonnés (admin)
 */
export const searchNewsletterSubscribers = query({
  args: {
    searchTerm: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let subscribers = await ctx.db
      .query("newsletterSubscribers")
      .order("desc")
      .collect();

    // Filtrer par statut si spécifié
    if (args.isActive !== undefined) {
      subscribers = subscribers.filter(sub => sub.isActive === args.isActive);
    }

    // Filtrer par terme de recherche si spécifié
    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase();
      subscribers = subscribers.filter(sub =>
        sub.email.toLowerCase().includes(searchLower)
      );
    }

    return subscribers;
  },
});

/**
 * Query pour vérifier si un email est déjà abonné
 */
export const checkEmailSubscribed = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return {
      isSubscribed: !!subscriber,
      isActive: subscriber?.isActive || false,
    };
  },
});
