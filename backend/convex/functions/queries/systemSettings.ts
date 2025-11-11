import { query } from "../../_generated/server"
import { v } from "convex/values"

// Récupérer un paramètre système par sa clé
export const getSettingByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first()
    
    return setting
  },
})

// Récupérer les limites de produits
export const getProductLimits = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", "product_limits"))
      .first()
    
    // Valeurs par défaut si non configurées
    if (!setting) {
      return {
        professionnel: 2,
        grossiste: -1, // -1 = illimité
      }
    }
    
    return setting.value
  },
})

// Récupérer tous les paramètres système
export const getAllSettings = query({
  args: {},
  handler: async (ctx) => {
    // Vérifier que l'utilisateur est un superadmin
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Non authentifié")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user || user.userType !== "superadmin") {
      throw new Error("Accès refusé : réservé aux superadmins")
    }

    const settings = await ctx.db.query("systemSettings").collect()
    return settings
  },
})
