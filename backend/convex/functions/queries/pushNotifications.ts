import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Récupérer le token de notification push d'un utilisateur
 */
export const getUserPushToken = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      return null;
    }

    return {
      pushToken: user.pushToken,
      pushNotificationsEnabled: user.pushNotificationsEnabled || false,
    };
  },
});

/**
 * Vérifier si un utilisateur a activé les notifications push
 */
export const isPushNotificationsEnabled = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    return user?.pushNotificationsEnabled || false;
  },
});
