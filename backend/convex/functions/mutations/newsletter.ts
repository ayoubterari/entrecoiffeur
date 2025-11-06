import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Mutation pour s'abonner à la newsletter
 */
export const subscribeToNewsletter = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier si l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Email invalide");
    }

    // Vérifier si l'email existe déjà
    const existingSubscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingSubscriber) {
      // Si l'abonné existe mais est inactif, le réactiver
      if (!existingSubscriber.isActive) {
        await ctx.db.patch(existingSubscriber._id, {
          isActive: true,
          subscribedAt: Date.now(),
        });
        return { 
          success: true, 
          message: "Votre abonnement a été réactivé avec succès !" 
        };
      }
      
      return { 
        success: false, 
        message: "Cet email est déjà abonné à la newsletter" 
      };
    }

    // Créer un nouvel abonné
    const subscriberId = await ctx.db.insert("newsletterSubscribers", {
      email: args.email,
      subscribedAt: Date.now(),
      isActive: true,
      source: args.source || "homepage",
    });

    return { 
      success: true, 
      message: "Merci pour votre abonnement ! Vous recevrez bientôt nos offres exclusives.",
      subscriberId 
    };
  },
});

/**
 * Mutation pour désabonner un utilisateur (admin)
 */
export const unsubscribeFromNewsletter = mutation({
  args: {
    subscriberId: v.id("newsletterSubscribers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriberId, {
      isActive: false,
    });

    return { success: true, message: "Abonné désactivé avec succès" };
  },
});

/**
 * Mutation pour réactiver un abonné (admin)
 */
export const reactivateSubscriber = mutation({
  args: {
    subscriberId: v.id("newsletterSubscribers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriberId, {
      isActive: true,
      subscribedAt: Date.now(),
    });

    return { success: true, message: "Abonné réactivé avec succès" };
  },
});

/**
 * Mutation pour supprimer un abonné (admin)
 */
export const deleteSubscriber = mutation({
  args: {
    subscriberId: v.id("newsletterSubscribers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.subscriberId);

    return { success: true, message: "Abonné supprimé avec succès" };
  },
});
