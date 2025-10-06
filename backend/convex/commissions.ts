import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

// Query pour obtenir la configuration des commissions
export const getCommissionConfig = query({
  args: {},
  handler: async (ctx) => {
    // Configuration par défaut des commissions
    return {
      rate: 10, // Taux fixe à 10%
      isActive: true,
      lastUpdated: Date.now(),
      currency: "EUR",
      description: "Taux de commission fixe appliqué à toutes les commandes"
    };
  },
});

// Query pour calculer les commissions d'une période
export const getCommissionsByPeriod = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Récupérer toutes les commandes
      const orders = await ctx.db.query("orders").collect();
      
      // Filtrer par période si spécifiée
      let filteredOrders = orders;
      if (args.startDate && args.endDate) {
        filteredOrders = orders.filter(order => 
          order.createdAt >= args.startDate! && order.createdAt <= args.endDate!
        );
      }

      // Calculer les commissions
      const commissionsData = await Promise.all(filteredOrders.map(async (order) => {
        const orderTotal = order.total || (order.productPrice * order.quantity) || 0;
        const commission = (orderTotal * 10) / 100; // 10% de commission
        const netAmount = orderTotal - commission;

        // Récupérer les informations des utilisateurs
        const buyer = await ctx.db.get(order.buyerId);
        const seller = await ctx.db.get(order.sellerId);

        return {
          orderId: order._id,
          orderNumber: order.orderNumber,
          buyerEmail: buyer?.email || 'Email non trouvé',
          sellerEmail: seller?.email || 'Email non trouvé',
          productName: order.productName,
          orderTotal,
          commission,
          netAmount,
          createdAt: order.createdAt,
          status: order.status
        };
      }));

      // Calculer les totaux
      const totalRevenue = commissionsData.reduce((sum, item) => sum + item.orderTotal, 0);
      const totalCommissions = commissionsData.reduce((sum, item) => sum + item.commission, 0);
      const totalNetAmount = commissionsData.reduce((sum, item) => sum + item.netAmount, 0);

      return {
        commissions: commissionsData,
        summary: {
          totalOrders: commissionsData.length,
          totalRevenue,
          totalCommissions,
          totalNetAmount,
          averageCommission: commissionsData.length > 0 ? totalCommissions / commissionsData.length : 0,
          commissionRate: 10
        }
      };
    } catch (error) {
      console.error("Error calculating commissions:", error);
      throw new ConvexError("Failed to calculate commissions");
    }
  },
});

// Query pour obtenir les commissions par vendeur
export const getCommissionsBySeller = query({
  args: {
    sellerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    try {
      // Récupérer les commandes du vendeur ou toutes les commandes
      let orders;
      if (args.sellerId) {
        orders = await ctx.db
          .query("orders")
          .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
          .collect();
      } else {
        orders = await ctx.db.query("orders").collect();
      }

      // Grouper par vendeur
      const sellerCommissions = new Map();

      for (const order of orders) {
        const sellerId = order.sellerId;
        const seller = await ctx.db.get(sellerId);
        const sellerEmail = seller?.email || 'Email non trouvé';
        const orderTotal = order.total || (order.productPrice * order.quantity) || 0;
        const commission = (orderTotal * 10) / 100;
        const netAmount = orderTotal - commission;

        if (!sellerCommissions.has(sellerId)) {
          sellerCommissions.set(sellerId, {
            sellerId,
            sellerEmail,
            totalOrders: 0,
            totalRevenue: 0,
            totalCommissions: 0,
            totalNetAmount: 0,
            orders: []
          });
        }

        const sellerData = sellerCommissions.get(sellerId);
        sellerData.totalOrders += 1;
        sellerData.totalRevenue += orderTotal;
        sellerData.totalCommissions += commission;
        sellerData.totalNetAmount += netAmount;
        sellerData.orders.push({
          orderId: order._id,
          orderNumber: order.orderNumber,
          productName: order.productName,
          orderTotal,
          commission,
          netAmount,
          createdAt: order.createdAt
        });
      }

      return Array.from(sellerCommissions.values());
    } catch (error) {
      console.error("Error getting seller commissions:", error);
      throw new ConvexError("Failed to get seller commissions");
    }
  },
});

// Mutation pour calculer la commission d'une commande spécifique
export const calculateOrderCommission = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    try {
      const order = await ctx.db.get(args.orderId);
      if (!order) {
        throw new ConvexError("Order not found");
      }

      const orderTotal = order.total || (order.productPrice * order.quantity) || 0;
      const commission = (orderTotal * 10) / 100; // 10% de commission
      const netAmount = orderTotal - commission;

      return {
        orderId: order._id,
        orderTotal,
        commission,
        netAmount,
        commissionRate: 10
      };
    } catch (error) {
      console.error("Error calculating order commission:", error);
      throw new ConvexError("Failed to calculate order commission");
    }
  },
});

// Mutation pour mettre à jour le taux de commission (pour usage futur)
export const updateCommissionRate = mutation({
  args: {
    newRate: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // Validation du taux
      if (args.newRate < 0 || args.newRate > 100) {
        throw new ConvexError("Commission rate must be between 0 and 100");
      }

      // Pour l'instant, on retourne juste la confirmation
      // Dans une vraie application, on sauvegarderait dans une table de configuration
      return {
        success: true,
        newRate: args.newRate,
        updatedAt: Date.now(),
        message: `Commission rate updated to ${args.newRate}%`
      };
    } catch (error) {
      console.error("Error updating commission rate:", error);
      throw new ConvexError("Failed to update commission rate");
    }
  },
});

// Query pour obtenir les statistiques globales des commissions
export const getCommissionStats = query({
  args: {},
  handler: async (ctx) => {
    try {
      const orders = await ctx.db.query("orders").collect();
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Filtrer par périodes
      const todayOrders = orders.filter(order => new Date(order.createdAt) >= startOfDay);
      const weekOrders = orders.filter(order => new Date(order.createdAt) >= startOfWeek);
      const monthOrders = orders.filter(order => new Date(order.createdAt) >= startOfMonth);

      const calculatePeriodStats = (periodOrders: any[]) => {
        const totalRevenue = periodOrders.reduce((sum, order) => {
          return sum + (order.total || (order.productPrice * order.quantity) || 0);
        }, 0);
        const totalCommissions = (totalRevenue * 10) / 100;
        return {
          orders: periodOrders.length,
          revenue: totalRevenue,
          commissions: totalCommissions,
          netAmount: totalRevenue - totalCommissions
        };
      };

      return {
        all: calculatePeriodStats(orders),
        today: calculatePeriodStats(todayOrders),
        week: calculatePeriodStats(weekOrders),
        month: calculatePeriodStats(monthOrders),
        commissionRate: 10
      };
    } catch (error) {
      console.error("Error getting commission stats:", error);
      throw new ConvexError("Failed to get commission statistics");
    }
  },
});
