import { v } from "convex/values";
import { query } from "../../_generated/server";

// Statistiques globales
export const getGlobalStats = query({
  args: { timeRange: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { timeRange = "month" } = args;
    
    // Calculer la date de début selon la période
    const now = Date.now();
    let startDate = 0;
    
    switch (timeRange) {
      case "day":
        startDate = now - 24 * 60 * 60 * 1000;
        break;
      case "week":
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = 0;
    }

    // Récupérer toutes les commandes
    const allOrders = await ctx.db.query("orders").collect();
    const orders = allOrders.filter(order => order._creationTime >= startDate);

    // Récupérer tous les utilisateurs
    const allUsers = await ctx.db.query("users").collect();
    const users = allUsers.filter(user => user._creationTime >= startDate);

    // Calculer le taux de conversion (utilisateurs qui ont commandé / total utilisateurs)
    const usersWhoOrdered = new Set(orders.map(order => order.buyerId));
    const conversionRate = allUsers.length > 0 
      ? (usersWhoOrdered.size / allUsers.length) * 100 
      : 0;

    // Calculer le taux de satisfaction basé sur les avis de commandes (orderReviews)
    const orderReviews = await ctx.db.query("orderReviews").collect();
    const recentOrderReviews = orderReviews.filter(review => review._creationTime >= startDate);
    
    // Calculer la moyenne des étoiles (rating)
    const averageRating = recentOrderReviews.length > 0
      ? recentOrderReviews.reduce((sum, review) => sum + review.rating, 0) / recentOrderReviews.length
      : 0;
    
    // Convertir en pourcentage (sur 5 étoiles)
    const satisfactionRate = (averageRating / 5) * 100;

    // Compter les avis positifs (4-5 étoiles)
    const positiveReviews = recentOrderReviews.filter(review => review.rating >= 4).length;
    const positiveRate = recentOrderReviews.length > 0
      ? (positiveReviews / recentOrderReviews.length) * 100
      : 0;

    return {
      conversionRate,
      satisfactionRate,
      totalReviews: recentOrderReviews.length,
      averageRating,
      positiveReviews,
      positiveRate
    };
  },
});

// Statistiques utilisateurs
export const getUserStats = query({
  args: { timeRange: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { timeRange = "month" } = args;
    
    const now = Date.now();
    let startDate = 0;
    
    switch (timeRange) {
      case "day":
        startDate = now - 24 * 60 * 60 * 1000;
        break;
      case "week":
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = 0;
    }

    const allUsers = await ctx.db.query("users").collect();
    const users = allUsers.filter(user => user._creationTime >= startDate);

    // Compter par type
    const byType: Record<string, number> = {};
    allUsers.forEach(user => {
      const type = user.userType || "particulier";
      byType[type] = (byType[type] || 0) + 1;
    });

    // Nouveaux utilisateurs dans la période
    const newUsers = users.length;

    return {
      totalUsers: allUsers.length,
      newUsers,
      byType,
      activeUsers: allUsers.filter(u => u.isActive !== false).length
    };
  },
});

// Statistiques commandes
export const getOrderStats = query({
  args: { timeRange: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { timeRange = "month" } = args;
    
    const now = Date.now();
    let startDate = 0;
    let previousStartDate = 0;
    
    switch (timeRange) {
      case "day":
        startDate = now - 24 * 60 * 60 * 1000;
        previousStartDate = now - 48 * 60 * 60 * 1000;
        break;
      case "week":
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 14 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 60 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 730 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = 0;
        previousStartDate = 0;
    }

    const allOrders = await ctx.db.query("orders").collect();
    const orders = allOrders.filter(order => order._creationTime >= startDate);
    const previousOrders = allOrders.filter(
      order => order._creationTime >= previousStartDate && order._creationTime < startDate
    );

    // Compter par statut
    const byStatus: Record<string, number> = {};
    orders.forEach(order => {
      const status = order.status || "pending";
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    // Calculer le panier moyen (montant total des commandes)
    const totalOrderAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalOrderAmount / orders.length : 0;

    // Calculer le revenu total basé sur les commissions (10%)
    const COMMISSION_RATE = 0.10;
    const totalRevenue = orders.reduce((sum, order) => {
      const orderAmount = order.total || 0;
      const commission = orderAmount * COMMISSION_RATE;
      return sum + commission;
    }, 0);

    return {
      totalOrders: orders.length,
      previousOrders: previousOrders.length,
      byStatus,
      averageOrderValue,
      totalRevenue
    };
  },
});

// Statistiques produits
export const getProductStats = query({
  args: { timeRange: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();

    const activeProducts = products.filter(p => p.isActive !== false).length;
    const inactiveProducts = products.filter(p => p.isActive === false).length;

    // Compter par catégorie
    const byCategory: Record<string, number> = {};
    products.forEach(product => {
      const category = product.category || "Autre";
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      totalProducts: products.length,
      activeProducts,
      inactiveProducts,
      byCategory
    };
  },
});

// Statistiques revenus (basé sur les commissions)
export const getRevenueStats = query({
  args: { timeRange: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { timeRange = "month" } = args;
    
    const now = Date.now();
    let startDate = 0;
    let previousStartDate = 0;
    
    switch (timeRange) {
      case "day":
        startDate = now - 24 * 60 * 60 * 1000;
        previousStartDate = now - 48 * 60 * 60 * 1000;
        break;
      case "week":
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 14 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 60 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 730 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = 0;
        previousStartDate = 0;
    }

    // Récupérer toutes les commandes pour calculer les commissions
    const allOrders = await ctx.db.query("orders").collect();
    const orders = allOrders.filter(order => order._creationTime >= startDate);
    const previousOrders = allOrders.filter(
      order => order._creationTime >= previousStartDate && order._creationTime < startDate
    );

    // Calculer le revenu total basé sur les commissions (10% par défaut)
    const COMMISSION_RATE = 0.10; // 10% de commission
    const totalRevenue = orders.reduce((sum, order) => {
      const orderAmount = order.total || 0;
      const commission = orderAmount * COMMISSION_RATE;
      return sum + commission;
    }, 0);

    const previousRevenue = previousOrders.reduce((sum, order) => {
      const orderAmount = order.total || 0;
      const commission = orderAmount * COMMISSION_RATE;
      return sum + commission;
    }, 0);

    return {
      totalRevenue,
      previousRevenue
    };
  },
});

// Top produits
export const getTopProducts = query({
  args: { 
    limit: v.optional(v.number()),
    timeRange: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { limit = 5, timeRange = "month" } = args;
    
    const now = Date.now();
    let startDate = 0;
    
    switch (timeRange) {
      case "day":
        startDate = now - 24 * 60 * 60 * 1000;
        break;
      case "week":
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = 0;
    }

    // Récupérer toutes les commandes
    const allOrders = await ctx.db.query("orders").collect();
    const orders = allOrders.filter(order => order._creationTime >= startDate);

    // Compter les ventes par produit
    const productSales: Record<string, { sales: number; revenue: number }> = {};
    
    for (const order of orders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { sales: 0, revenue: 0 };
          }
          productSales[item.productId].sales += item.quantity || 1;
          productSales[item.productId].revenue += (item.price || 0) * (item.quantity || 1);
        }
      }
    }

    // Récupérer les détails des produits
    const topProductIds = Object.entries(productSales)
      .sort((a, b) => b[1].sales - a[1].sales)
      .slice(0, limit)
      .map(([id]) => id);

    const topProducts = [];
    for (const productId of topProductIds) {
      const product = await ctx.db.get(productId as any);
      if (product) {
        topProducts.push({
          _id: product._id,
          name: product.name,
          category: product.category,
          sales: productSales[productId].sales,
          revenue: productSales[productId].revenue
        });
      }
    }

    return topProducts;
  },
});

// Top vendeurs
export const getTopSellers = query({
  args: { 
    limit: v.optional(v.number()),
    timeRange: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { limit = 5, timeRange = "month" } = args;
    
    const now = Date.now();
    let startDate = 0;
    
    switch (timeRange) {
      case "day":
        startDate = now - 24 * 60 * 60 * 1000;
        break;
      case "week":
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = 0;
    }

    // Récupérer toutes les commandes
    const allOrders = await ctx.db.query("orders").collect();
    const orders = allOrders.filter(order => order._creationTime >= startDate);

    // Compter les ventes par vendeur
    const sellerStats: Record<string, { totalOrders: number; totalRevenue: number }> = {};
    
    for (const order of orders) {
      if (order.sellerId) {
        if (!sellerStats[order.sellerId]) {
          sellerStats[order.sellerId] = { totalOrders: 0, totalRevenue: 0 };
        }
        sellerStats[order.sellerId].totalOrders += 1;
        sellerStats[order.sellerId].totalRevenue += order.totalAmount || 0;
      }
    }

    // Récupérer les détails des vendeurs
    const topSellerIds = Object.entries(sellerStats)
      .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)
      .slice(0, limit)
      .map(([id]) => id);

    const topSellers = [];
    for (const sellerId of topSellerIds) {
      const seller = await ctx.db.get(sellerId as any);
      if (seller) {
        // Calculer la note moyenne du vendeur
        const reviews = await ctx.db
          .query("reviews")
          .filter((q) => q.eq(q.field("sellerId"), sellerId))
          .collect();
        
        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;

        topSellers.push({
          _id: seller._id,
          firstName: seller.firstName,
          lastName: seller.lastName,
          companyName: seller.companyName,
          totalOrders: sellerStats[sellerId].totalOrders,
          totalRevenue: sellerStats[sellerId].totalRevenue,
          rating: averageRating > 0 ? averageRating.toFixed(1) : null
        });
      }
    }

    return topSellers;
  },
});
