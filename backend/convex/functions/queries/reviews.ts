import { query } from "../../_generated/server";
import { v } from "convex/values";

// Récupérer tous les avis produits (admin)
export const getAllProductReviews = query({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db
      .query("reviews")
      .order("desc")
      .collect();

    // Enrichir avec les infos utilisateur et produit
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        const product = await ctx.db.get(review.productId);

        return {
          ...review,
          userName: user
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
            : "Utilisateur supprimé",
          userEmail: user?.email || "N/A",
          productName: product?.name || "Produit supprimé",
          productImage: product?.images?.[0] || null,
        };
      })
    );

    return enrichedReviews;
  },
});

// Récupérer tous les avis de commandes (admin)
export const getAllOrderReviews = query({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db
      .query("orderReviews")
      .order("desc")
      .collect();

    // Enrichir avec les infos utilisateur, produit et vendeur
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const buyer = await ctx.db.get(review.buyerId);
        const seller = await ctx.db.get(review.sellerId);
        const product = await ctx.db.get(review.productId);
        const order = await ctx.db.get(review.orderId);

        return {
          ...review,
          buyerName: buyer
            ? `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || buyer.email
            : "Utilisateur supprimé",
          buyerEmail: buyer?.email || "N/A",
          sellerName: seller
            ? `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || seller.email
            : "Vendeur supprimé",
          sellerEmail: seller?.email || "N/A",
          sellerCompany: seller?.companyName || "N/A",
          productName: product?.name || "Produit supprimé",
          productImage: product?.images?.[0] || null,
          orderNumber: order?.orderNumber || "N/A",
        };
      })
    );

    return enrichedReviews;
  },
});

// Statistiques globales des avis
export const getReviewsStats = query({
  args: {},
  handler: async (ctx) => {
    const productReviews = await ctx.db.query("reviews").collect();
    const orderReviews = await ctx.db.query("orderReviews").collect();

    // Stats avis produits
    const productReviewsStats = {
      total: productReviews.length,
      approved: productReviews.filter((r) => !r.status || r.status === "approved").length,
      rejected: productReviews.filter((r) => r.status === "rejected").length,
      averageRating:
        productReviews.length > 0
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
          : 0,
    };

    // Stats avis commandes
    const orderReviewsStats = {
      total: orderReviews.length,
      approved: orderReviews.filter((r) => !r.status || r.status === "approved").length,
      rejected: orderReviews.filter((r) => r.status === "rejected").length,
      averageRating:
        orderReviews.length > 0
          ? orderReviews.reduce((sum, r) => sum + r.rating, 0) / orderReviews.length
          : 0,
      averageDeliveryRating:
        orderReviews.filter((r) => r.deliveryRating).length > 0
          ? orderReviews
              .filter((r) => r.deliveryRating)
              .reduce((sum, r) => sum + (r.deliveryRating || 0), 0) /
            orderReviews.filter((r) => r.deliveryRating).length
          : 0,
      averageProductQualityRating:
        orderReviews.filter((r) => r.productQualityRating).length > 0
          ? orderReviews
              .filter((r) => r.productQualityRating)
              .reduce((sum, r) => sum + (r.productQualityRating || 0), 0) /
            orderReviews.filter((r) => r.productQualityRating).length
          : 0,
      averageSellerServiceRating:
        orderReviews.filter((r) => r.sellerServiceRating).length > 0
          ? orderReviews
              .filter((r) => r.sellerServiceRating)
              .reduce((sum, r) => sum + (r.sellerServiceRating || 0), 0) /
            orderReviews.filter((r) => r.sellerServiceRating).length
          : 0,
      recommendedCount: orderReviews.filter((r) => r.isRecommended).length,
    };

    return {
      productReviews: productReviewsStats,
      orderReviews: orderReviewsStats,
      totalReviews: productReviews.length + orderReviews.length,
      totalRejected: productReviewsStats.rejected + orderReviewsStats.rejected,
    };
  },
});

// Récupérer un avis produit par ID
export const getProductReviewById = query({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      return null;
    }

    const user = await ctx.db.get(review.userId);
    const product = await ctx.db.get(review.productId);

    return {
      ...review,
      userName: user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
        : "Utilisateur supprimé",
      userEmail: user?.email || "N/A",
      productName: product?.name || "Produit supprimé",
      productImage: product?.images?.[0] || null,
    };
  },
});

// Récupérer un avis de commande par ID
export const getOrderReviewById = query({
  args: {
    reviewId: v.id("orderReviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      return null;
    }

    const buyer = await ctx.db.get(review.buyerId);
    const seller = await ctx.db.get(review.sellerId);
    const product = await ctx.db.get(review.productId);
    const order = await ctx.db.get(review.orderId);

    return {
      ...review,
      buyerName: buyer
        ? `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || buyer.email
        : "Utilisateur supprimé",
      buyerEmail: buyer?.email || "N/A",
      sellerName: seller
        ? `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || seller.email
        : "Vendeur supprimé",
      sellerEmail: seller?.email || "N/A",
      sellerCompany: seller?.companyName || "N/A",
      productName: product?.name || "Produit supprimé",
      productImage: product?.images?.[0] || null,
      orderNumber: order?.orderNumber || "N/A",
    };
  },
});
