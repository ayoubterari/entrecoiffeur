import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// Modérer un avis produit (approuver ou rejeter)
export const moderateProductReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    moderationNote: v.optional(v.string()),
    moderatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Avis non trouvé");
    }

    await ctx.db.patch(args.reviewId, {
      status: args.status,
      moderatedBy: args.moderatedBy,
      moderatedAt: Date.now(),
      moderationNote: args.moderationNote,
    });

    return true;
  },
});

// Modérer un avis de commande (approuver ou rejeter)
export const moderateOrderReview = mutation({
  args: {
    reviewId: v.id("orderReviews"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    moderationNote: v.optional(v.string()),
    moderatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Avis non trouvé");
    }

    await ctx.db.patch(args.reviewId, {
      status: args.status,
      moderatedBy: args.moderatedBy,
      moderatedAt: Date.now(),
      moderationNote: args.moderationNote,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Supprimer un avis produit
export const deleteProductReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Avis non trouvé");
    }

    await ctx.db.delete(args.reviewId);
    return true;
  },
});

// Supprimer un avis de commande
export const deleteOrderReview = mutation({
  args: {
    reviewId: v.id("orderReviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Avis non trouvé");
    }

    await ctx.db.delete(args.reviewId);
    return true;
  },
});

// Approuver plusieurs avis produits en masse
export const bulkApproveProductReviews = mutation({
  args: {
    reviewIds: v.array(v.id("reviews")),
    moderatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    for (const reviewId of args.reviewIds) {
      const review = await ctx.db.get(reviewId);
      if (review) {
        await ctx.db.patch(reviewId, {
          status: "approved",
          moderatedBy: args.moderatedBy,
          moderatedAt: Date.now(),
        });
      }
    }
    return true;
  },
});

// Approuver plusieurs avis de commandes en masse
export const bulkApproveOrderReviews = mutation({
  args: {
    reviewIds: v.array(v.id("orderReviews")),
    moderatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    for (const reviewId of args.reviewIds) {
      const review = await ctx.db.get(reviewId);
      if (review) {
        await ctx.db.patch(reviewId, {
          status: "approved",
          moderatedBy: args.moderatedBy,
          moderatedAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
    return true;
  },
});

// Rejeter plusieurs avis produits en masse
export const bulkRejectProductReviews = mutation({
  args: {
    reviewIds: v.array(v.id("reviews")),
    moderatedBy: v.id("users"),
    moderationNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    for (const reviewId of args.reviewIds) {
      const review = await ctx.db.get(reviewId);
      if (review) {
        await ctx.db.patch(reviewId, {
          status: "rejected",
          moderatedBy: args.moderatedBy,
          moderatedAt: Date.now(),
          moderationNote: args.moderationNote,
        });
      }
    }
    return true;
  },
});

// Rejeter plusieurs avis de commandes en masse
export const bulkRejectOrderReviews = mutation({
  args: {
    reviewIds: v.array(v.id("orderReviews")),
    moderatedBy: v.id("users"),
    moderationNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    for (const reviewId of args.reviewIds) {
      const review = await ctx.db.get(reviewId);
      if (review) {
        await ctx.db.patch(reviewId, {
          status: "rejected",
          moderatedBy: args.moderatedBy,
          moderatedAt: Date.now(),
          moderationNote: args.moderationNote,
          updatedAt: Date.now(),
        });
      }
    }
    return true;
  },
});
