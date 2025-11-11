import { mutation } from "../../_generated/server"
import { v } from "convex/values"

// Mettre à jour ou créer un paramètre système
export const updateSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    // Vérifier si le paramètre existe déjà
    const existingSetting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first()

    const now = Date.now()

    if (existingSetting) {
      // Mettre à jour
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        description: args.description,
        updatedBy: user._id,
        updatedAt: now,
      })
      return { success: true, action: "updated", settingId: existingSetting._id }
    } else {
      // Créer
      const settingId = await ctx.db.insert("systemSettings", {
        key: args.key,
        value: args.value,
        description: args.description,
        updatedBy: user._id,
        updatedAt: now,
        createdAt: now,
      })
      return { success: true, action: "created", settingId }
    }
  },
})

// Mettre à jour les limites de produits
export const updateProductLimits = mutation({
  args: {
    userId: v.id("users"),
    professionnel: v.number(),
    grossiste: v.number(),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur existe et est un superadmin
    const user = await ctx.db.get(args.userId)
    
    if (!user) {
      throw new Error("Utilisateur non trouvé")
    }

    if (user.userType !== "superadmin") {
      throw new Error("Accès refusé : réservé aux superadmins")
    }

    // Validation
    if (args.professionnel < -1 || args.grossiste < -1) {
      throw new Error("Les limites doivent être >= -1 (-1 = illimité)")
    }

    const now = Date.now()
    const key = "product_limits"

    // Vérifier si le paramètre existe déjà
    const existingSetting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first()

    const value = {
      professionnel: args.professionnel,
      grossiste: args.grossiste,
    }

    if (existingSetting) {
      // Mettre à jour
      await ctx.db.patch(existingSetting._id, {
        value,
        updatedBy: user._id,
        updatedAt: now,
      })
      return { 
        success: true, 
        message: "Limites de produits mises à jour avec succès",
        limits: value
      }
    } else {
      // Créer
      await ctx.db.insert("systemSettings", {
        key,
        value,
        description: "Limites de produits par type d'utilisateur",
        updatedBy: user._id,
        updatedAt: now,
        createdAt: now,
      })
      return { 
        success: true, 
        message: "Limites de produits créées avec succès",
        limits: value
      }
    }
  },
})

// Supprimer un paramètre système
export const deleteSetting = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
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

    const setting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first()

    if (!setting) {
      throw new Error("Paramètre non trouvé")
    }

    await ctx.db.delete(setting._id)
    return { success: true, message: "Paramètre supprimé avec succès" }
  },
})
