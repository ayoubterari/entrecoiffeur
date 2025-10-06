import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

// Query pour obtenir les paiements des vendeurs
export const getSellerPayments = query({
  args: {
    sellerId: v.optional(v.id("users")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Récupérer les commandes
      let orders;
      if (args.sellerId) {
        orders = await ctx.db
          .query("orders")
          .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
          .collect();
      } else {
        orders = await ctx.db.query("orders").collect();
      }

      // Filtrer par période si spécifiée
      if (args.startDate && args.endDate) {
        orders = orders.filter(order => 
          order.createdAt >= args.startDate! && order.createdAt <= args.endDate!
        );
      }

      // Grouper par vendeur et calculer les montants nets
      const sellerPayments = new Map();

      for (const order of orders) {
        const sellerId = order.sellerId;
        const seller = await ctx.db.get(sellerId);
        const sellerEmail = seller?.email || 'Email non trouvé';
        
        const orderTotal = order.total || (order.productPrice * order.quantity) || 0;
        const commission = (orderTotal * 10) / 100; // 10% de commission
        const netAmount = orderTotal - commission;

        if (!sellerPayments.has(sellerId)) {
          sellerPayments.set(sellerId, {
            sellerId,
            sellerEmail,
            sellerName: `${seller?.firstName || ''} ${seller?.lastName || ''}`.trim(),
            totalOrders: 0,
            totalRevenue: 0,
            totalCommissions: 0,
            totalNetAmount: 0,
            transferStatus: 'pending', // pending, processing, completed
            lastTransferDate: null,
            orders: []
          });
        }

        const sellerData = sellerPayments.get(sellerId);
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
          createdAt: order.createdAt,
          status: order.status
        });
      }

      return Array.from(sellerPayments.values());
    } catch (error) {
      console.error("Error getting seller payments:", error);
      throw new ConvexError("Failed to get seller payments");
    }
  },
});

// Query pour obtenir les statistiques des versements
export const getTransferStats = query({
  args: {},
  handler: async (ctx) => {
    try {
      const orders = await ctx.db.query("orders").collect();
      
      // Calculer les statistiques globales
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.total || (order.productPrice * order.quantity) || 0);
      }, 0);
      
      const totalCommissions = (totalRevenue * 10) / 100;
      const totalNetAmount = totalRevenue - totalCommissions;

      // Grouper par vendeur pour compter les vendeurs uniques
      const uniqueSellers = new Set(orders.map(order => order.sellerId));

      // Calculer les statistiques par période
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const monthOrders = orders.filter(order => new Date(order.createdAt) >= startOfMonth);
      const weekOrders = orders.filter(order => new Date(order.createdAt) >= startOfWeek);

      const calculatePeriodStats = (periodOrders: any[]) => {
        const revenue = periodOrders.reduce((sum, order) => {
          return sum + (order.total || (order.productPrice * order.quantity) || 0);
        }, 0);
        const commissions = (revenue * 10) / 100;
        const netAmount = revenue - commissions;
        
        return { revenue, commissions, netAmount, orders: periodOrders.length };
      };

      return {
        global: {
          totalSellers: uniqueSellers.size,
          totalRevenue,
          totalCommissions,
          totalNetAmount,
          totalOrders: orders.length
        },
        month: calculatePeriodStats(monthOrders),
        week: calculatePeriodStats(weekOrders),
        commissionRate: 10
      };
    } catch (error) {
      console.error("Error getting transfer stats:", error);
      throw new ConvexError("Failed to get transfer statistics");
    }
  },
});

// Mutation pour marquer un transfert comme effectué
export const markTransferCompleted = mutation({
  args: {
    sellerId: v.id("users"),
    transferAmount: v.optional(v.number()),
    transferReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Vérifier que le vendeur existe
      const seller = await ctx.db.get(args.sellerId);
      if (!seller) {
        throw new ConvexError("Seller not found");
      }

      // Pour l'instant, on simule le marquage du transfert
      // Dans une vraie application, on créerait une table "transfers" pour tracer les versements
      
      // Récupérer les commandes du vendeur pour calculer le montant
      const orders = await ctx.db
        .query("orders")
        .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
        .collect();

      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.total || (order.productPrice * order.quantity) || 0);
      }, 0);

      const commission = (totalRevenue * 10) / 100;
      const netAmount = totalRevenue - commission;

      // Simuler l'enregistrement du transfert
      const transferRecord = {
        sellerId: args.sellerId,
        sellerEmail: seller.email,
        transferAmount: args.transferAmount || netAmount,
        transferReference: args.transferReference || `TRF-${Date.now()}`,
        transferDate: Date.now(),
        status: 'completed',
        ordersCount: orders.length,
        totalRevenue,
        commission,
        netAmount
      };

      // Dans une vraie application, on sauvegarderait ceci dans une table "transfers"
      console.log('Transfer completed:', transferRecord);

      return {
        success: true,
        transferId: `TRF-${Date.now()}`,
        message: `Transfer of ${new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(netAmount)} completed for seller ${seller.email}`,
        transferRecord
      };
    } catch (error) {
      console.error("Error marking transfer as completed:", error);
      throw new ConvexError("Failed to mark transfer as completed");
    }
  },
});

// Mutation pour créer un lot de transferts
export const createTransferBatch = mutation({
  args: {
    sellerIds: v.array(v.id("users")),
    batchReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const batchId = `BATCH-${Date.now()}`;
      const transfers = [];

      for (const sellerId of args.sellerIds) {
        const seller = await ctx.db.get(sellerId);
        if (!seller) {
          console.warn(`Seller ${sellerId} not found, skipping`);
          continue;
        }

        // Calculer le montant net pour ce vendeur
        const orders = await ctx.db
          .query("orders")
          .filter((q) => q.eq(q.field("sellerId"), sellerId))
          .collect();

        const totalRevenue = orders.reduce((sum, order) => {
          return sum + (order.total || (order.productPrice * order.quantity) || 0);
        }, 0);

        const commission = (totalRevenue * 10) / 100;
        const netAmount = totalRevenue - commission;

        if (netAmount > 0) {
          transfers.push({
            sellerId,
            sellerEmail: seller.email,
            transferAmount: netAmount,
            transferReference: `${batchId}-${sellerId.slice(-6)}`,
            ordersCount: orders.length,
            totalRevenue,
            commission,
            netAmount
          });
        }
      }

      const batchTotal = transfers.reduce((sum, transfer) => sum + transfer.transferAmount, 0);

      return {
        success: true,
        batchId,
        batchReference: args.batchReference || batchId,
        transfersCount: transfers.length,
        batchTotal,
        transfers,
        message: `Batch transfer created with ${transfers.length} transfers totaling ${new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(batchTotal)}`
      };
    } catch (error) {
      console.error("Error creating transfer batch:", error);
      throw new ConvexError("Failed to create transfer batch");
    }
  },
});

// Query pour obtenir l'historique des transferts d'un vendeur
export const getSellerTransferHistory = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      // Vérifier que le vendeur existe
      const seller = await ctx.db.get(args.sellerId);
      if (!seller) {
        throw new ConvexError("Seller not found");
      }

      // Dans une vraie application, on récupérerait l'historique depuis une table "transfers"
      // Pour l'instant, on simule avec les données des commandes
      
      const orders = await ctx.db
        .query("orders")
        .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
        .collect();

      // Grouper par mois pour simuler l'historique
      const monthlyTransfers = new Map();
      
      orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
        
        const orderTotal = order.total || (order.productPrice * order.quantity) || 0;
        const commission = (orderTotal * 10) / 100;
        const netAmount = orderTotal - commission;
        
        if (!monthlyTransfers.has(monthKey)) {
          monthlyTransfers.set(monthKey, {
            period: orderDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }),
            ordersCount: 0,
            totalRevenue: 0,
            totalCommissions: 0,
            totalNetAmount: 0,
            transferStatus: 'completed', // Simulé
            transferDate: orderDate.getTime()
          });
        }
        
        const monthData = monthlyTransfers.get(monthKey);
        monthData.ordersCount += 1;
        monthData.totalRevenue += orderTotal;
        monthData.totalCommissions += commission;
        monthData.totalNetAmount += netAmount;
      });

      return {
        sellerId: args.sellerId,
        sellerEmail: seller.email,
        transferHistory: Array.from(monthlyTransfers.values()).sort((a, b) => b.transferDate - a.transferDate)
      };
    } catch (error) {
      console.error("Error getting seller transfer history:", error);
      throw new ConvexError("Failed to get seller transfer history");
    }
  },
});

// Query pour calculer le montant net à verser pour un vendeur spécifique
export const calculateSellerNetAmount = query({
  args: {
    sellerId: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const seller = await ctx.db.get(args.sellerId);
      if (!seller) {
        throw new ConvexError("Seller not found");
      }

      let orders = await ctx.db
        .query("orders")
        .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
        .collect();

      // Filtrer par période si spécifiée
      if (args.startDate && args.endDate) {
        orders = orders.filter(order => 
          order.createdAt >= args.startDate! && order.createdAt <= args.endDate!
        );
      }

      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.total || (order.productPrice * order.quantity) || 0);
      }, 0);

      const commission = (totalRevenue * 10) / 100;
      const netAmount = totalRevenue - commission;

      return {
        sellerId: args.sellerId,
        sellerEmail: seller.email,
        sellerName: `${seller.firstName || ''} ${seller.lastName || ''}`.trim(),
        ordersCount: orders.length,
        totalRevenue,
        commission,
        netAmount,
        commissionRate: 10,
        calculatedAt: Date.now()
      };
    } catch (error) {
      console.error("Error calculating seller net amount:", error);
      throw new ConvexError("Failed to calculate seller net amount");
    }
  },
});
