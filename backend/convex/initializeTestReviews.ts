import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Initialize test reviews for demonstration
export const initializeTestReviews = mutation({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if reviews already exist for this seller
    const existingReviews = await ctx.db
      .query("orderReviews")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    if (existingReviews.length > 0) {
      return {
        success: true,
        message: "Des avis existent déjà pour ce vendeur",
        reviewsCount: existingReviews.length
      };
    }

    // Find some orders for this seller to create reviews
    const sellerOrders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
      .take(5);

    if (sellerOrders.length === 0) {
      return {
        success: false,
        message: "Aucune commande trouvée pour ce vendeur"
      };
    }

    const now = Date.now();
    const createdReviews = [];

    // Sample review data
    const sampleReviews = [
      {
        rating: 5,
        comment: "Excellent service ! Produit de très bonne qualité, livraison rapide. Je recommande vivement ce vendeur.",
        deliveryRating: 5,
        productQualityRating: 5,
        sellerServiceRating: 5,
        isRecommended: true,
      },
      {
        rating: 4,
        comment: "Très satisfait de mon achat. Le produit correspond parfaitement à la description. Petit délai de livraison mais ça valait le coup d'attendre.",
        deliveryRating: 3,
        productQualityRating: 5,
        sellerServiceRating: 4,
        isRecommended: true,
      },
      {
        rating: 5,
        comment: "Parfait ! Communication excellente avec le vendeur, produit arrivé en parfait état. Je recommande à 100%.",
        deliveryRating: 5,
        productQualityRating: 5,
        sellerServiceRating: 5,
        isRecommended: true,
      },
      {
        rating: 4,
        comment: "Bon produit, conforme à mes attentes. Le vendeur est réactif et professionnel.",
        deliveryRating: 4,
        productQualityRating: 4,
        sellerServiceRating: 5,
        isRecommended: true,
      },
      {
        rating: 3,
        comment: "Produit correct mais j'attendais mieux pour le prix. La livraison a pris un peu de temps.",
        deliveryRating: 2,
        productQualityRating: 3,
        sellerServiceRating: 4,
        isRecommended: false,
      },
    ];

    // Create reviews for available orders
    for (let i = 0; i < Math.min(sellerOrders.length, sampleReviews.length); i++) {
      const order = sellerOrders[i];
      const reviewData = sampleReviews[i];

      // Get product info
      const product = await ctx.db.get(order.productId);
      
      const reviewId = await ctx.db.insert("orderReviews", {
        orderId: order._id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        productId: order.productId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        deliveryRating: reviewData.deliveryRating,
        productQualityRating: reviewData.productQualityRating,
        sellerServiceRating: reviewData.sellerServiceRating,
        isRecommended: reviewData.isRecommended,
        createdAt: now - (i * 24 * 60 * 60 * 1000), // Spread over several days
        updatedAt: now - (i * 24 * 60 * 60 * 1000),
      });

      createdReviews.push(reviewId);
    }

    return {
      success: true,
      message: `${createdReviews.length} avis de test créés avec succès !`,
      reviewsCount: createdReviews.length,
      reviewIds: createdReviews
    };
  },
});

// Clean up test reviews
export const cleanupTestReviews = mutation({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("orderReviews")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    const deletedCount = reviews.length;
    
    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }

    return {
      success: true,
      message: `${deletedCount} avis supprimés`,
      deletedCount
    };
  },
});
