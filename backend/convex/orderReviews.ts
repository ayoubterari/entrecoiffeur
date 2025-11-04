import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Créer une évaluation de commande
export const createOrderReview = mutation({
  args: {
    orderId: v.id("orders"),
    rating: v.number(),
    comment: v.optional(v.string()),
    deliveryRating: v.optional(v.number()),
    productQualityRating: v.optional(v.number()),
    sellerServiceRating: v.optional(v.number()),
    isRecommended: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Récupérer la commande pour vérifier les informations
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new ConvexError("Commande non trouvée");
    }

    // Vérifier que la commande est livrée
    if (order.status !== "delivered") {
      throw new ConvexError("Vous ne pouvez évaluer que les commandes livrées");
    }

    // Vérifier qu'une évaluation n'existe pas déjà pour cette commande
    const existingReview = await ctx.db
      .query("orderReviews")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (existingReview) {
      throw new ConvexError("Cette commande a déjà été évaluée");
    }

    // Valider la note (1-5 étoiles)
    if (args.rating < 1 || args.rating > 5) {
      throw new ConvexError("La note doit être entre 1 et 5 étoiles");
    }

    // Valider les notes optionnelles
    if (args.deliveryRating && (args.deliveryRating < 1 || args.deliveryRating > 5)) {
      throw new ConvexError("La note de livraison doit être entre 1 et 5 étoiles");
    }
    if (args.productQualityRating && (args.productQualityRating < 1 || args.productQualityRating > 5)) {
      throw new ConvexError("La note de qualité doit être entre 1 et 5 étoiles");
    }
    if (args.sellerServiceRating && (args.sellerServiceRating < 1 || args.sellerServiceRating > 5)) {
      throw new ConvexError("La note de service doit être entre 1 et 5 étoiles");
    }

    // Créer l'évaluation
    const reviewId = await ctx.db.insert("orderReviews", {
      orderId: args.orderId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      productId: order.productId,
      rating: args.rating,
      comment: args.comment,
      deliveryRating: args.deliveryRating,
      productQualityRating: args.productQualityRating,
      sellerServiceRating: args.sellerServiceRating,
      isRecommended: args.isRecommended,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return reviewId;
  },
});

// Récupérer les commandes livrées en attente d'évaluation pour un acheteur
export const getPendingReviewOrders = query({
  args: {
    buyerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Récupérer toutes les commandes livrées de l'acheteur
    const deliveredOrders = await ctx.db
      .query("orders")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId))
      .filter((q) => q.eq(q.field("status"), "delivered"))
      .collect();

    // Filtrer celles qui n'ont pas encore d'évaluation
    const pendingOrders = [];
    
    for (const order of deliveredOrders) {
      const existingReview = await ctx.db
        .query("orderReviews")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .first();

      if (!existingReview) {
        // Récupérer les informations du produit et du vendeur
        const product = await ctx.db.get(order.productId);
        const seller = await ctx.db.get(order.sellerId);
        
        pendingOrders.push({
          ...order,
          productName: product?.name || order.productName,
          productImage: product?.images?.[0] || null,
          sellerName: seller ? `${seller.firstName} ${seller.lastName}` : "Vendeur",
          sellerCompany: seller?.companyName,
        });
      }
    }

    return pendingOrders.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Récupérer les évaluations d'un acheteur
export const getBuyerReviews = query({
  args: {
    buyerId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const reviews = await ctx.db
      .query("orderReviews")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId))
      .order("desc")
      .take(limit);

    // Enrichir avec les informations de commande, produit et vendeur
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const order = await ctx.db.get(review.orderId);
        const product = await ctx.db.get(review.productId);
        const seller = await ctx.db.get(review.sellerId);

        return {
          ...review,
          orderNumber: order?.orderNumber,
          productName: product?.name,
          productImage: product?.images?.[0],
          sellerName: seller ? `${seller.firstName} ${seller.lastName}` : "Vendeur",
          sellerCompany: seller?.companyName,
        };
      })
    );

    return enrichedReviews;
  },
});

// Récupérer les évaluations d'un vendeur
export const getSellerReviews = query({
  args: {
    sellerId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const allReviews = await ctx.db
      .query("orderReviews")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .collect();
    
    // Filtrer pour n'afficher que les avis approuvés
    const reviews = allReviews
      .filter(r => !r.status || r.status === "approved")
      .slice(0, limit);

    // Enrichir avec les informations de commande, produit et acheteur
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const order = await ctx.db.get(review.orderId);
        const product = await ctx.db.get(review.productId);
        const buyer = await ctx.db.get(review.buyerId);

        return {
          ...review,
          orderNumber: order?.orderNumber,
          productName: product?.name,
          productImage: product?.images?.[0],
          buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : "Acheteur",
        };
      })
    );

    return enrichedReviews;
  },
});

// Récupérer les statistiques d'évaluation d'un vendeur
export const getSellerReviewStats = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allReviews = await ctx.db
      .query("orderReviews")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();
    
    // Filtrer pour n'afficher que les avis approuvés
    const reviews = allReviews.filter(r => !r.status || r.status === "approved");

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        averageDeliveryRating: 0,
        averageProductQualityRating: 0,
        averageSellerServiceRating: 0,
        recommendationRate: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    // Calcul des moyennes pour les notes détaillées
    const deliveryRatings = reviews.filter(r => r.deliveryRating).map(r => r.deliveryRating!);
    const productQualityRatings = reviews.filter(r => r.productQualityRating).map(r => r.productQualityRating!);
    const sellerServiceRatings = reviews.filter(r => r.sellerServiceRating).map(r => r.sellerServiceRating!);
    const recommendations = reviews.filter(r => r.isRecommended === true);

    const averageDeliveryRating = deliveryRatings.length > 0 
      ? deliveryRatings.reduce((sum, rating) => sum + rating, 0) / deliveryRatings.length 
      : 0;

    const averageProductQualityRating = productQualityRatings.length > 0 
      ? productQualityRatings.reduce((sum, rating) => sum + rating, 0) / productQualityRatings.length 
      : 0;

    const averageSellerServiceRating = sellerServiceRatings.length > 0 
      ? sellerServiceRatings.reduce((sum, rating) => sum + rating, 0) / sellerServiceRatings.length 
      : 0;

    const recommendationRate = (recommendations.length / totalReviews) * 100;

    // Distribution des notes
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      averageDeliveryRating: Math.round(averageDeliveryRating * 10) / 10,
      averageProductQualityRating: Math.round(averageProductQualityRating * 10) / 10,
      averageSellerServiceRating: Math.round(averageSellerServiceRating * 10) / 10,
      recommendationRate: Math.round(recommendationRate),
      ratingDistribution,
    };
  },
});

// Vérifier si une commande peut être évaluée
export const canReviewOrder = query({
  args: {
    orderId: v.id("orders"),
    buyerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que la commande existe et appartient à l'acheteur
    const order = await ctx.db.get(args.orderId);
    if (!order || order.buyerId !== args.buyerId) {
      return false;
    }

    // Vérifier que la commande est livrée
    if (order.status !== "delivered") {
      return false;
    }

    // Vérifier qu'aucune évaluation n'existe déjà
    const existingReview = await ctx.db
      .query("orderReviews")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    return !existingReview;
  },
});

// Récupérer une évaluation spécifique par commande
export const getOrderReview = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db
      .query("orderReviews")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!review) {
      return null;
    }

    // Enrichir avec les informations de commande, produit et vendeur
    const order = await ctx.db.get(review.orderId);
    const product = await ctx.db.get(review.productId);
    const seller = await ctx.db.get(review.sellerId);
    const buyer = await ctx.db.get(review.buyerId);

    return {
      ...review,
      orderNumber: order?.orderNumber,
      productName: product?.name,
      productImage: product?.images?.[0],
      sellerName: seller ? `${seller.firstName} ${seller.lastName}` : "Vendeur",
      sellerCompany: seller?.companyName,
      buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : "Acheteur",
    };
  },
});

// Récupérer les évaluations d'un produit spécifique
export const getProductReviews = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const allReviews = await ctx.db
      .query("orderReviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
    
    // Filtrer pour n'afficher que les avis approuvés
    const reviews = allReviews
      .filter(r => !r.status || r.status === "approved")
      .slice(0, limit);

    // Enrichir avec les informations des acheteurs
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const buyer = await ctx.db.get(review.buyerId);
        const order = await ctx.db.get(review.orderId);

        return {
          ...review,
          buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : "Acheteur",
          buyerFirstName: buyer?.firstName,
          orderNumber: order?.orderNumber,
          // Masquer le nom complet pour la confidentialité
          displayName: buyer?.firstName ? `${buyer.firstName} ${buyer.lastName?.charAt(0)}.` : "Acheteur anonyme",
        };
      })
    );

    return enrichedReviews;
  },
});

// Récupérer les statistiques d'évaluation d'un produit
export const getProductReviewStats = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const allReviews = await ctx.db
      .query("orderReviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    
    // Filtrer pour n'afficher que les avis approuvés
    const reviews = allReviews.filter(r => !r.status || r.status === "approved");

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        averageDeliveryRating: 0,
        averageProductQualityRating: 0,
        averageSellerServiceRating: 0,
        recommendationRate: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    // Calcul des moyennes pour les notes détaillées
    const deliveryRatings = reviews.filter(r => r.deliveryRating).map(r => r.deliveryRating!);
    const productQualityRatings = reviews.filter(r => r.productQualityRating).map(r => r.productQualityRating!);
    const sellerServiceRatings = reviews.filter(r => r.sellerServiceRating).map(r => r.sellerServiceRating!);
    const recommendations = reviews.filter(r => r.isRecommended === true);

    const averageDeliveryRating = deliveryRatings.length > 0 
      ? deliveryRatings.reduce((sum, rating) => sum + rating, 0) / deliveryRatings.length 
      : 0;

    const averageProductQualityRating = productQualityRatings.length > 0 
      ? productQualityRatings.reduce((sum, rating) => sum + rating, 0) / productQualityRatings.length 
      : 0;

    const averageSellerServiceRating = sellerServiceRatings.length > 0 
      ? sellerServiceRatings.reduce((sum, rating) => sum + rating, 0) / sellerServiceRatings.length 
      : 0;

    const recommendationRate = (recommendations.length / totalReviews) * 100;

    // Distribution des notes
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      averageDeliveryRating: Math.round(averageDeliveryRating * 10) / 10,
      averageProductQualityRating: Math.round(averageProductQualityRating * 10) / 10,
      averageSellerServiceRating: Math.round(averageSellerServiceRating * 10) / 10,
      recommendationRate: Math.round(recommendationRate),
      ratingDistribution,
    };
  },
});
