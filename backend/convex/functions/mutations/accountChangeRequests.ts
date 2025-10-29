import { v } from "convex/values";
import { mutation } from "../../_generated/server";

// Créer une demande de changement de type de compte
export const createAccountChangeRequest = mutation({
  args: {
    userId: v.id("users"),
    requestedType: v.union(v.literal("particulier"), v.literal("professionnel"), v.literal("grossiste")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Récupérer les informations de l'utilisateur
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier s'il y a déjà une demande en cours
    const existingRequest = await ctx.db
      .query("accountChangeRequests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("Vous avez déjà une demande de changement en cours");
    }

    // Vérifier que le type demandé est différent du type actuel
    if (user.userType === args.requestedType) {
      throw new Error("Le type demandé est identique à votre type actuel");
    }

    // Créer la demande
    const requestId = await ctx.db.insert("accountChangeRequests", {
      userId: args.userId,
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      currentType: user.userType === "superadmin" ? "particulier" : user.userType,
      requestedType: args.requestedType,
      reason: args.reason,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return requestId;
  },
});

// Approuver une demande de changement
export const approveAccountChangeRequest = mutation({
  args: {
    requestId: v.id("accountChangeRequests"),
    reviewedBy: v.id("users"),
    reviewComment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Récupérer la demande
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Demande non trouvée");
    }

    if (request.status !== "pending") {
      throw new Error("Cette demande a déjà été traitée");
    }

    // Mettre à jour le type de l'utilisateur
    await ctx.db.patch(request.userId, {
      userType: request.requestedType,
    });

    // Mettre à jour la demande
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedBy: args.reviewedBy,
      reviewComment: args.reviewComment,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, newType: request.requestedType };
  },
});

// Rejeter une demande de changement
export const rejectAccountChangeRequest = mutation({
  args: {
    requestId: v.id("accountChangeRequests"),
    reviewedBy: v.id("users"),
    reviewComment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Récupérer la demande
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Demande non trouvée");
    }

    if (request.status !== "pending") {
      throw new Error("Cette demande a déjà été traitée");
    }

    // Mettre à jour la demande
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedBy: args.reviewedBy,
      reviewComment: args.reviewComment,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
