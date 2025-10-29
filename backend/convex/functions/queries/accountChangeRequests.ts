import { v } from "convex/values";
import { query } from "../../_generated/server";

// Récupérer toutes les demandes (pour admin)
export const getAllAccountChangeRequests = query({
  handler: async (ctx) => {
    const requests = await ctx.db
      .query("accountChangeRequests")
      .collect();

    // Trier par date de création décroissante
    return requests.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Récupérer les demandes par statut
export const getAccountChangeRequestsByStatus = query({
  args: {
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("accountChangeRequests")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    return requests;
  },
});

// Récupérer les demandes d'un utilisateur
export const getUserAccountChangeRequests = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("accountChangeRequests")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // Trier par date de création décroissante
    return requests.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Récupérer une demande par ID
export const getAccountChangeRequestById = query({
  args: {
    requestId: v.id("accountChangeRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    return request;
  },
});

// Vérifier si un utilisateur a une demande en cours
export const hasPendingRequest = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("accountChangeRequests")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    return request !== null;
  },
});
