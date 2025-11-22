import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Enregistrer ou mettre à jour le token de notification push d'un utilisateur
 */
export const savePushToken = mutation({
  args: {
    userId: v.id("users"),
    pushToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Mettre à jour le token de l'utilisateur
    await ctx.db.patch(args.userId, {
      pushToken: args.pushToken,
      pushNotificationsEnabled: true,
    });

    console.log(`✅ Push token enregistré pour l'utilisateur ${args.userId}`);
    
    return { success: true };
  },
});

/**
 * Activer/désactiver les notifications push pour un utilisateur
 */
export const togglePushNotifications = mutation({
  args: {
    userId: v.id("users"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      pushNotificationsEnabled: args.enabled,
    });

    console.log(`🔔 Notifications ${args.enabled ? 'activées' : 'désactivées'} pour ${args.userId}`);
    
    return { success: true };
  },
});

/**
 * Supprimer le token de notification push d'un utilisateur
 */
export const removePushToken = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      pushToken: undefined,
      pushNotificationsEnabled: false,
    });

    console.log(`🗑️ Push token supprimé pour l'utilisateur ${args.userId}`);
    
    return { success: true };
  },
});
