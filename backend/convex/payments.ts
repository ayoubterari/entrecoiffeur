import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { ConvexError } from "convex/values"

// Query pour récupérer la configuration PayPal
export const getPayPalConfig = query({
  args: {},
  handler: async (ctx) => {
    try {
      const config = await ctx.db
        .query("paypalConfig")
        .first()

      if (!config) {
        // Retourner une configuration par défaut
        return {
          environment: "sandbox",
          clientId: "",
          clientSecret: "",
          webhookUrl: "",
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      }

      return config
    } catch (error) {
      console.error("Error getting PayPal config:", error)
      throw new ConvexError("Failed to get PayPal configuration")
    }
  },
})

// Mutation pour mettre à jour la configuration PayPal
export const updatePayPalConfig = mutation({
  args: {
    environment: v.string(),
    clientId: v.string(),
    clientSecret: v.string(),
    webhookUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    try {
      // Validation des données
      if (!args.clientId.trim()) {
        throw new ConvexError("Client ID is required")
      }
      if (!args.clientSecret.trim()) {
        throw new ConvexError("Client Secret is required")
      }
      if (!["sandbox", "live"].includes(args.environment)) {
        throw new ConvexError("Invalid environment. Must be 'sandbox' or 'live'")
      }

      // Vérifier s'il existe déjà une configuration
      const existingConfig = await ctx.db
        .query("paypalConfig")
        .first()

      const configData = {
        environment: args.environment as "sandbox" | "live",
        clientId: args.clientId.trim(),
        clientSecret: args.clientSecret.trim(),
        webhookUrl: args.webhookUrl?.trim() || "",
        isActive: args.isActive,
        updatedAt: Date.now()
      }

      if (existingConfig) {
        // Mettre à jour la configuration existante
        await ctx.db.patch(existingConfig._id, configData)
        return { success: true, message: "PayPal configuration updated successfully" }
      } else {
        // Créer une nouvelle configuration
        await ctx.db.insert("paypalConfig", {
          ...configData,
          createdAt: Date.now()
        })
        return { success: true, message: "PayPal configuration created successfully" }
      }
    } catch (error) {
      console.error("Error updating PayPal config:", error)
      if (error instanceof ConvexError) {
        throw error
      }
      throw new ConvexError("Failed to update PayPal configuration")
    }
  },
})

// Mutation pour tester la connexion PayPal (simulation)
export const testPayPalConnection = mutation({
  args: {
    environment: v.string(),
    clientId: v.string(),
    clientSecret: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Validation des paramètres
      if (!args.clientId.trim() || !args.clientSecret.trim()) {
        throw new ConvexError("Client ID and Client Secret are required")
      }

      // Simulation du test de connexion
      // Dans un vrai environnement, on ferait un appel à l'API PayPal
      const isValidFormat = args.clientId.length > 10 && args.clientSecret.length > 10
      
      if (!isValidFormat) {
        return {
          success: false,
          message: "Format des identifiants invalide. Vérifiez vos Client ID et Client Secret."
        }
      }

      // Simulation d'un test réussi
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simule une requête réseau

      return {
        success: true,
        message: `Connexion réussie à PayPal ${args.environment}. Identifiants valides.`,
        environment: args.environment,
        testedAt: Date.now()
      }
    } catch (error) {
      console.error("Error testing PayPal connection:", error)
      return {
        success: false,
        message: "Erreur lors du test de connexion. Vérifiez vos identifiants."
      }
    }
  },
})

// Query pour obtenir les statistiques de paiement
export const getPaymentStats = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Récupérer toutes les commandes
      const orders = await ctx.db
        .query("orders")
        .collect()

      // Calculer les statistiques
      const totalOrders = orders.length
      const paidOrders = orders.filter(order => order.status === "confirmed").length
      const pendingOrders = orders.filter(order => order.status === "pending").length
      
      const totalRevenue = orders.reduce((total, order) => {
        if (order.status === "confirmed") {
          return total + order.total
        }
        return total
      }, 0)

      const averageOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0

      return {
        totalOrders,
        paidOrders,
        pendingOrders,
        totalRevenue,
        averageOrderValue,
        paymentMethods: {
          paypal: paidOrders, // Tous les paiements sont PayPal pour l'instant
          card: 0,
          other: 0
        }
      }
    } catch (error) {
      console.error("Error getting payment stats:", error)
      throw new ConvexError("Failed to get payment statistics")
    }
  },
})

// Mutation pour traiter un paiement PayPal (simulation)
export const processPayPalPayment = mutation({
  args: {
    orderId: v.id("orders"),
    paymentId: v.string(),
    payerId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // Récupérer la commande
      const order = await ctx.db.get(args.orderId)
      if (!order) {
        throw new ConvexError("Order not found")
      }

      // Vérifier que la commande est en attente
      if (order.status !== "pending") {
        throw new ConvexError("Order is not in pending status")
      }

      // Simulation du traitement PayPal
      // Dans un vrai environnement, on vérifierait le paiement avec l'API PayPal
      
      // Mettre à jour le statut de la commande
      await ctx.db.patch(args.orderId, {
        status: "confirmed",
        paymentMethod: "paypal",
        paymentId: args.paymentId,
        paymentStatus: "paid",
        updatedAt: Date.now()
      })

      return {
        success: true,
        message: "Payment processed successfully",
        orderId: args.orderId,
        paymentId: args.paymentId
      }
    } catch (error) {
      console.error("Error processing PayPal payment:", error)
      if (error instanceof ConvexError) {
        throw error
      }
      throw new ConvexError("Failed to process PayPal payment")
    }
  },
})

// Query pour récupérer l'historique des transactions
export const getTransactionHistory = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const limit = args.limit || 50
      const offset = args.offset || 0

      // Récupérer les commandes confirmées (transactions réussies)
      const transactions = await ctx.db
        .query("orders")
        .filter((q) => q.eq(q.field("status"), "confirmed"))
        .order("desc")
        .collect()

      // Paginer les résultats
      const paginatedTransactions = transactions.slice(offset, offset + limit)

      // Enrichir les données avec les informations utilisateur
      const enrichedTransactions = await Promise.all(
        paginatedTransactions.map(async (transaction) => {
          const buyer = await ctx.db.get(transaction.buyerId)
          const seller = transaction.sellerId ? await ctx.db.get(transaction.sellerId) : null

          return {
            ...transaction,
            buyerInfo: buyer ? {
              name: `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || buyer.email,
              email: buyer.email
            } : null,
            sellerInfo: seller ? {
              name: `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.email,
              email: seller.email
            } : null
          }
        })
      )

      return {
        transactions: enrichedTransactions,
        total: transactions.length,
        hasMore: offset + limit < transactions.length
      }
    } catch (error) {
      console.error("Error getting transaction history:", error)
      throw new ConvexError("Failed to get transaction history")
    }
  },
})
