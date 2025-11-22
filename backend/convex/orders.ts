import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Create a new order
export const createOrder = mutation({
  args: {
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    productId: v.id("products"),
    productName: v.string(),
    productPrice: v.number(),
    quantity: v.number(),
    subtotal: v.number(),
    shipping: v.number(),
    tax: v.number(),
    discount: v.optional(v.number()),
    couponCode: v.optional(v.string()),
    total: v.number(),
    paymentMethod: v.string(),
    paymentId: v.optional(v.string()), // Optionnel pour COD
    affiliateCode: v.optional(v.string()),
    billingInfo: v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      address: v.string(),
      city: v.string(),
      postalCode: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Traiter l'affiliation si présente
    let affiliateId = undefined;
    if (args.affiliateCode) {
      // Trouver l'affilié à partir du code
      const affiliateLink = await ctx.db
        .query("affiliateLinks")
        .withIndex("by_link_code", (q) => q.eq("linkCode", args.affiliateCode!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
      
      if (affiliateLink && affiliateLink.affiliateId !== args.buyerId) {
        affiliateId = affiliateLink.affiliateId;
      }
    }

    // Déterminer le statut de paiement selon la méthode
    const paymentStatus = args.paymentMethod === "COD" || args.paymentMethod === "Cash on Delivery" 
      ? "pending" 
      : "paid";
    
    // Déterminer le statut de la commande
    const orderStatus = args.paymentMethod === "COD" || args.paymentMethod === "Cash on Delivery"
      ? "pending"
      : "confirmed";

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      buyerId: args.buyerId,
      sellerId: args.sellerId,
      productId: args.productId,
      productName: args.productName,
      productPrice: args.productPrice,
      quantity: args.quantity,
      subtotal: args.subtotal,
      shipping: args.shipping,
      tax: args.tax,
      discount: args.discount || 0,
      couponCode: args.couponCode || undefined,
      total: args.total,
      status: orderStatus,
      paymentMethod: args.paymentMethod,
      paymentId: args.paymentId || undefined,
      paymentStatus: paymentStatus,
      billingInfo: args.billingInfo,
      // Ajouter les champs d'affiliation
      affiliateCode: args.affiliateCode || undefined,
      affiliateId: affiliateId,
      affiliateEarningProcessed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Traiter les gains d'affiliation si applicable
    if (args.affiliateCode && affiliateId) {
      try {
        // Calculer les points (5% du montant de la commande)
        const pointsRate = 0.05; // 5%
        const pointsEarned = Math.floor(args.total * pointsRate);

        // Trouver le lien d'affiliation pour obtenir son ID
        const affiliateLink = await ctx.db
          .query("affiliateLinks")
          .withIndex("by_link_code", (q) => q.eq("linkCode", args.affiliateCode!))
          .filter((q) => q.eq(q.field("isActive"), true))
          .first();

        // Créer l'enregistrement de gain seulement si le lien existe
        if (affiliateLink) {
          await ctx.db.insert("affiliateEarnings", {
            affiliateId: affiliateId,
            orderId: orderId,
            linkId: affiliateLink._id,
            sellerId: args.sellerId,
            buyerId: args.buyerId,
            orderAmount: args.total,
            pointsEarned,
            pointsRate,
            status: "pending", // En attente jusqu'à la livraison
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          // Initialiser les points de l'utilisateur si nécessaire
          const userPoints = await ctx.db
            .query("userPoints")
            .withIndex("by_user", (q) => q.eq("userId", affiliateId))
            .first();

          if (!userPoints) {
            await ctx.db.insert("userPoints", {
              userId: affiliateId,
              totalPoints: 0,
              totalEarned: 0,
              totalSpent: 0,
              pendingPoints: pointsEarned,
              updatedAt: Date.now(),
            });
          } else {
            await ctx.db.patch(userPoints._id, {
              pendingPoints: userPoints.pendingPoints + pointsEarned,
              updatedAt: Date.now(),
            });
          }

          // Mettre à jour les statistiques du lien d'affiliation
          await ctx.db.patch(affiliateLink._id, {
            conversionsCount: affiliateLink.conversionsCount + 1,
            totalEarnings: affiliateLink.totalEarnings + pointsEarned,
            updatedAt: Date.now(),
          });

          // Marquer la commande comme traitée pour l'affiliation
          await ctx.db.patch(orderId, {
            affiliateEarningProcessed: true,
          });
        }

      } catch (error) {
        console.error("Erreur lors du traitement de l'affiliation:", error);
        // Ne pas faire échouer la commande pour une erreur d'affiliation
      }
    }

    // Envoyer une notification push au vendeur pour la nouvelle commande
    // Note: Les notifications push sont gérées côté client via le Service Worker
    // L'envoi réel des notifications nécessite une configuration VAPID en production
    try {
      const seller = await ctx.db.get(args.sellerId);
      
      if (seller && (seller.userType === 'professionnel' || seller.userType === 'grossiste')) {
        console.log('📬 Nouvelle commande pour le vendeur:', args.sellerId);
        // En production, vous pouvez déclencher une action Convex ici
        // pour envoyer une vraie notification push via web-push
      }
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du vendeur:", error);
    }

    return {
      orderId,
      orderNumber,
      affiliateProcessed: !!(args.affiliateCode && affiliateId),
    };
  },
});

// Get orders for a buyer (customer orders)
export const getBuyerOrders = query({
  args: { buyerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("buyerId"), args.buyerId))
      .order("desc")
      .collect();
  },
});

// Get orders for a specific seller
export const getSellerOrders = query({
  args: { sellerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
      .order("desc")
      .collect();
  },
});

// Get all orders (admin only)
export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db
      .query("orders")
      .order("desc")
      .collect();

    // Enrichir chaque commande avec les informations des utilisateurs
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const buyer = await ctx.db.get(order.buyerId);
        const seller = await ctx.db.get(order.sellerId);
        
        return {
          ...order,
          buyerEmail: buyer?.email || 'Email non trouvé',
          buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Nom non trouvé',
          sellerEmail: seller?.email || 'Email non trouvé',
          sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'Nom non trouvé',
        };
      })
    );

    return enrichedOrders;
  },
});

// Mettre à jour le statut d'une commande et traiter l'affiliation si nécessaire
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"), 
      v.literal("preparing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    // Récupérer la commande
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Commande introuvable");
    }

    // Mettre à jour le statut de la commande
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Si la commande est livrée, confirmer les gains d'affiliation ET générer la facture
    if (args.status === "delivered") {
      // Générer la facture automatiquement si elle n'existe pas déjà
      try {
        const existingInvoice = await ctx.db
          .query("invoices")
          .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
          .first();

        if (!existingInvoice) {
          // Générer la facture via runMutation (version interne)
          await ctx.runMutation(internal.functions.mutations.invoices.generateInvoiceFromOrderInternal, {
            orderId: args.orderId,
            tvaRate: 20, // Taux de TVA par défaut
          });
          
          console.log(`Facture générée automatiquement pour la commande ${order.orderNumber}`);
        }
      } catch (error) {
        console.error("Erreur lors de la génération de la facture:", error);
        // Ne pas faire échouer la mise à jour du statut pour une erreur de facture
      }
      try {
        // Trouver les gains en attente pour cette commande
        const earnings = await ctx.db
          .query("affiliateEarnings")
          .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
          .filter((q) => q.eq(q.field("status"), "pending"))
          .collect();

        for (const earning of earnings) {
          // Confirmer le gain
          await ctx.db.patch(earning._id, {
            status: "confirmed",
            paidAt: Date.now(),
            updatedAt: Date.now(),
          });

          // Mettre à jour les points de l'utilisateur
          const userPoints = await ctx.db
            .query("userPoints")
            .withIndex("by_user", (q) => q.eq("userId", earning.affiliateId))
            .first();

          if (userPoints) {
            const newTotalPoints = userPoints.totalPoints + earning.pointsEarned;
            const newTotalEarned = userPoints.totalEarned + earning.pointsEarned;
            const newPendingPoints = Math.max(0, userPoints.pendingPoints - earning.pointsEarned);

            await ctx.db.patch(userPoints._id, {
              totalPoints: newTotalPoints,
              totalEarned: newTotalEarned,
              pendingPoints: newPendingPoints,
              updatedAt: Date.now(),
            });

            // Créer une transaction de points
            await ctx.db.insert("pointTransactions", {
              userId: earning.affiliateId,
              type: "earned",
              amount: earning.pointsEarned,
              description: `Points gagnés via affiliation - Commande livrée #${String(args.orderId)}`,
              relatedOrderId: args.orderId,
              relatedEarningId: earning._id,
              balanceAfter: newTotalPoints,
              createdAt: Date.now(),
            });
          }
        }

        console.log(`Confirmed ${earnings.length} affiliate earnings for delivered order ${args.orderId}`);
      } catch (error) {
        console.error("Erreur lors de la confirmation des gains d'affiliation:", error);
        // Ne pas faire échouer la mise à jour du statut pour une erreur d'affiliation
      }
    }

    return {
      success: true,
      orderId: args.orderId,
      status: args.status,
      affiliateEarningsConfirmed: args.status === "delivered",
    };
  },
});


// Get order by ID
export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

// Get order by order number
export const getOrderByNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("orderNumber"), args.orderNumber))
      .first();

    return order;
  },
});

// Get order statistics for seller
export const getSellerOrderStats = query({
  args: { sellerId: v.id("users") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
      .collect();

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      pendingOrders: orders.filter(order => order.status === "pending").length,
      confirmedOrders: orders.filter(order => order.status === "confirmed").length,
      shippedOrders: orders.filter(order => order.status === "shipped").length,
      deliveredOrders: orders.filter(order => order.status === "delivered").length,
    };

    return stats;
  },
});

// Get recent orders (last 10)
export const getRecentOrders = query({
  args: { 
    userId: v.id("users"),
    userType: v.union(v.literal("buyer"), v.literal("seller"))
  },
  handler: async (ctx, args) => {
    const field = args.userType === "buyer" ? "buyerId" : "sellerId";
    
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field(field), args.userId))
      .order("desc")
      .take(10);

    return orders;
  },
});
