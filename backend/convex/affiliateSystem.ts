import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Générer un code unique pour les liens d'affiliation
function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Créer ou récupérer un lien d'affiliation pour un vendeur
export const createAffiliateLink = mutation({
  args: {
    affiliateId: v.id("users"), // Utilisateur qui partage
    sellerId: v.id("users"), // Vendeur à partager
  },
  handler: async (ctx, args) => {
    // Vérifier si un lien existe déjà pour cette combinaison
    const existingLink = await ctx.db
      .query("affiliateLinks")
      .withIndex("by_affiliate_seller", (q) => 
        q.eq("affiliateId", args.affiliateId).eq("sellerId", args.sellerId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingLink) {
      return {
        success: true,
        linkId: existingLink._id,
        linkCode: existingLink.linkCode,
        linkUrl: existingLink.linkUrl,
        isNew: false
      };
    }

    // Générer un nouveau code unique
    let linkCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      linkCode = generateAffiliateCode();
      const existing = await ctx.db
        .query("affiliateLinks")
        .withIndex("by_link_code", (q) => q.eq("linkCode", linkCode))
        .first();
      
      isUnique = !existing;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      throw new Error("Impossible de générer un code unique");
    }

    // Créer l'URL du lien d'affiliation
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const linkUrl = `${baseUrl}/seller/${args.sellerId}?ref=${linkCode}`;

    // Créer le lien d'affiliation
    const linkId = await ctx.db.insert("affiliateLinks", {
      affiliateId: args.affiliateId,
      sellerId: args.sellerId,
      linkCode,
      linkUrl,
      clicksCount: 0,
      conversionsCount: 0,
      totalEarnings: 0,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      linkId,
      linkCode,
      linkUrl,
      isNew: true
    };
  },
});

// Enregistrer un clic sur un lien d'affiliation
export const trackAffiliateClick = mutation({
  args: {
    linkCode: v.string(),
    visitorId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Trouver le lien d'affiliation
    const affiliateLink = await ctx.db
      .query("affiliateLinks")
      .withIndex("by_link_code", (q) => q.eq("linkCode", args.linkCode))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!affiliateLink) {
      return { success: false, error: "Lien d'affiliation invalide" };
    }

    // Enregistrer le clic
    const clickId = await ctx.db.insert("affiliateClicks", {
      linkId: affiliateLink._id,
      affiliateId: affiliateLink.affiliateId,
      sellerId: affiliateLink.sellerId,
      visitorId: args.visitorId,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      referrer: args.referrer,
      convertedToOrder: false,
      createdAt: Date.now(),
    });

    // Mettre à jour le compteur de clics
    await ctx.db.patch(affiliateLink._id, {
      clicksCount: affiliateLink.clicksCount + 1,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      clickId,
      sellerId: affiliateLink.sellerId,
      affiliateId: affiliateLink.affiliateId
    };
  },
});

// Récupérer les liens d'affiliation d'un utilisateur
export const getUserAffiliateLinks = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const links = await ctx.db
      .query("affiliateLinks")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .take(limit);

    // Enrichir avec les informations du vendeur
    const enrichedLinks = await Promise.all(
      links.map(async (link) => {
        const seller = await ctx.db.get(link.sellerId);
        return {
          ...link,
          sellerName: seller ? `${seller.firstName} ${seller.lastName}` : "Vendeur inconnu",
          sellerCompany: seller?.companyName,
        };
      })
    );

    return enrichedLinks;
  },
});

// Récupérer les statistiques d'affiliation d'un utilisateur
export const getUserAffiliateStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Statistiques des liens
    const links = await ctx.db
      .query("affiliateLinks")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const totalLinks = links.length;
    const totalClicks = links.reduce((sum, link) => sum + link.clicksCount, 0);
    const totalConversions = links.reduce((sum, link) => sum + link.conversionsCount, 0);
    const totalEarnings = links.reduce((sum, link) => sum + link.totalEarnings, 0);

    // Statistiques des gains
    const earnings = await ctx.db
      .query("affiliateEarnings")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.userId))
      .collect();

    const pendingEarnings = earnings
      .filter(e => e.status === "pending")
      .reduce((sum, e) => sum + e.pointsEarned, 0);

    const confirmedEarnings = earnings
      .filter(e => e.status === "confirmed")
      .reduce((sum, e) => sum + e.pointsEarned, 0);

    // Points de l'utilisateur
    const userPoints = await ctx.db
      .query("userPoints")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      totalLinks,
      totalClicks,
      totalConversions,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      totalEarnings,
      pendingEarnings,
      confirmedEarnings,
      availablePoints: userPoints?.totalPoints || 0,
      totalPointsEarned: userPoints?.totalEarned || 0,
    };
  },
});

// Initialiser le solde de points d'un utilisateur
export const initializeUserPoints = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPoints")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      return { success: true, pointsId: existing._id, isNew: false };
    }

    const pointsId = await ctx.db.insert("userPoints", {
      userId: args.userId,
      totalPoints: 0,
      totalEarned: 0,
      totalSpent: 0,
      pendingPoints: 0,
      updatedAt: Date.now(),
    });

    return { success: true, pointsId, isNew: true };
  },
});

// Récupérer l'historique des transactions de points
export const getUserPointTransactions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const transactions = await ctx.db
      .query("pointTransactions")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return transactions;
  },
});

// Fonction pour traiter les gains d'affiliation lors d'une commande
export const processAffiliateEarning = mutation({
  args: {
    orderId: v.id("orders"),
    linkCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.linkCode) {
      return { success: false, message: "Aucun code d'affiliation" };
    }

    // Récupérer la commande
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      return { success: false, message: "Commande introuvable" };
    }

    // Trouver le lien d'affiliation
    const affiliateLink = await ctx.db
      .query("affiliateLinks")
      .withIndex("by_link_code", (q) => q.eq("linkCode", args.linkCode!))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!affiliateLink) {
      return { success: false, message: "Lien d'affiliation invalide" };
    }

    // Vérifier que l'affilié n'est pas l'acheteur (pas d'auto-référencement)
    if (affiliateLink.affiliateId === order.buyerId) {
      return { success: false, message: "Auto-référencement non autorisé" };
    }

    // Calculer les points (5% du montant de la commande)
    const pointsRate = 0.05; // 5%
    const pointsEarned = Math.floor(order.total * pointsRate);

    // Créer l'enregistrement de gain
    const earningId = await ctx.db.insert("affiliateEarnings", {
      affiliateId: affiliateLink.affiliateId,
      orderId: args.orderId,
      linkId: affiliateLink._id,
      sellerId: order.sellerId,
      buyerId: order.buyerId,
      orderAmount: order.total,
      pointsEarned,
      pointsRate,
      status: "pending", // En attente jusqu'à la livraison
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Mettre à jour les statistiques du lien
    await ctx.db.patch(affiliateLink._id, {
      conversionsCount: affiliateLink.conversionsCount + 1,
      totalEarnings: affiliateLink.totalEarnings + pointsEarned,
      updatedAt: Date.now(),
    });

    // Marquer le clic comme converti
    const recentClick = await ctx.db
      .query("affiliateClicks")
      .withIndex("by_link", (q) => q.eq("linkId", affiliateLink._id))
      .filter((q) => q.eq(q.field("convertedToOrder"), false))
      .order("desc")
      .first();

    if (recentClick) {
      await ctx.db.patch(recentClick._id, {
        convertedToOrder: true,
        orderId: args.orderId,
      });
    }

    // Initialiser les points de l'utilisateur si nécessaire
    const initResult = await ctx.db
      .query("userPoints")
      .withIndex("by_user", (q) => q.eq("userId", affiliateLink.affiliateId))
      .first();
    
    if (!initResult) {
      await ctx.db.insert("userPoints", {
        userId: affiliateLink.affiliateId,
        totalPoints: 0,
        totalEarned: 0,
        totalSpent: 0,
        pendingPoints: 0,
        updatedAt: Date.now(),
      });
    }

    // Mettre à jour les points en attente
    const userPoints = await ctx.db
      .query("userPoints")
      .withIndex("by_user", (q) => q.eq("userId", affiliateLink.affiliateId))
      .first();

    if (userPoints) {
      await ctx.db.patch(userPoints._id, {
        pendingPoints: userPoints.pendingPoints + pointsEarned,
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      earningId,
      pointsEarned,
      affiliateId: affiliateLink.affiliateId,
    };
  },
});

// Confirmer les gains d'affiliation (quand la commande est livrée)
export const confirmAffiliateEarning = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    // Trouver les gains en attente pour cette commande
    const earnings = await ctx.db
      .query("affiliateEarnings")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const confirmedEarnings = [];

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
          description: `Points gagnés via affiliation - Commande #${String(args.orderId)}`,
          relatedOrderId: args.orderId,
          relatedEarningId: earning._id,
          balanceAfter: newTotalPoints,
          createdAt: Date.now(),
        });
      }

      confirmedEarnings.push(earning);
    }

    return {
      success: true,
      confirmedCount: confirmedEarnings.length,
      totalPointsConfirmed: confirmedEarnings.reduce((sum, e) => sum + e.pointsEarned, 0),
    };
  },
});
