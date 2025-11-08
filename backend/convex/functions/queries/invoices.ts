import { query } from "../../_generated/server";
import { v } from "convex/values";

// Récupérer toutes les factures (admin)
export const getAllInvoices = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db
      .query("invoices")
      .order("desc")
      .collect();

    return invoices;
  },
});

// Récupérer les factures d'un vendeur
export const getSellerInvoices = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .collect();

    // Filtrer les factures où le vendeur correspond
    const sellerInvoices = invoices.filter(
      (invoice) => invoice.seller.userId === args.sellerId
    );

    return sellerInvoices;
  },
});

// Récupérer les factures d'un acheteur
export const getBuyerInvoices = query({
  args: {
    buyerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .collect();

    // Filtrer les factures où l'acheteur correspond
    const buyerInvoices = invoices.filter(
      (invoice) => invoice.buyer.userId === args.buyerId
    );

    return buyerInvoices;
  },
});

// Récupérer une facture par son ID
export const getInvoiceById = query({
  args: {
    invoiceId: v.id("invoices"),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) {
      throw new Error("Facture introuvable");
    }

    return invoice;
  },
});

// Récupérer une facture par son numéro
export const getInvoiceByNumber = query({
  args: {
    invoiceNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_invoice_number", (q) => q.eq("invoiceNumber", args.invoiceNumber))
      .first();

    if (!invoice) {
      throw new Error("Facture introuvable");
    }

    return invoice;
  },
});

// Récupérer la facture d'une commande
export const getInvoiceByOrder = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    return invoice; // Peut être null si pas encore générée
  },
});

// Statistiques des factures (admin)
export const getInvoicesStats = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db
      .query("invoices")
      .collect();

    const totalInvoices = invoices.length;
    const draftInvoices = invoices.filter((inv) => inv.status === "draft").length;
    const issuedInvoices = invoices.filter((inv) => inv.status === "issued").length;
    const sentInvoices = invoices.filter((inv) => inv.status === "sent").length;
    const paidInvoices = invoices.filter((inv) => inv.status === "paid").length;
    const cancelledInvoices = invoices.filter((inv) => inv.status === "cancelled").length;

    const totalRevenueTTC = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalTTC, 0);

    const totalRevenueHT = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalHT, 0);

    const totalTVA = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalTVA, 0);

    return {
      totalInvoices,
      draftInvoices,
      issuedInvoices,
      sentInvoices,
      paidInvoices,
      cancelledInvoices,
      totalRevenueTTC,
      totalRevenueHT,
      totalTVA,
    };
  },
});

// Statistiques des factures d'un vendeur
export const getSellerInvoicesStats = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .collect();

    // Filtrer les factures du vendeur
    const sellerInvoices = invoices.filter(
      (invoice) => invoice.seller.userId === args.sellerId
    );

    const totalInvoices = sellerInvoices.length;
    const paidInvoices = sellerInvoices.filter((inv) => inv.status === "paid").length;
    const pendingInvoices = sellerInvoices.filter(
      (inv) => inv.status === "issued" || inv.status === "sent"
    ).length;

    const totalRevenueTTC = sellerInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalTTC, 0);

    const totalRevenueHT = sellerInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalHT, 0);

    const totalTVA = sellerInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalTVA, 0);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalRevenueTTC,
      totalRevenueHT,
      totalTVA,
    };
  },
});

// Rechercher des factures
export const searchInvoices = query({
  args: {
    searchTerm: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("issued"),
        v.literal("sent"),
        v.literal("paid"),
        v.literal("cancelled"),
        v.literal("credited")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let invoices = await ctx.db
      .query("invoices")
      .order("desc")
      .collect();

    // Filtrer par terme de recherche (numéro de facture, nom client, etc.)
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      invoices = invoices.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(term) ||
          inv.orderNumber.toLowerCase().includes(term) ||
          `${inv.buyer.firstName} ${inv.buyer.lastName}`.toLowerCase().includes(term) ||
          `${inv.seller.firstName} ${inv.seller.lastName}`.toLowerCase().includes(term) ||
          inv.buyer.email.toLowerCase().includes(term)
      );
    }

    // Filtrer par statut
    if (args.status) {
      invoices = invoices.filter((inv) => inv.status === args.status);
    }

    // Filtrer par période
    if (args.startDate) {
      invoices = invoices.filter((inv) => inv.invoiceDate >= args.startDate!);
    }
    if (args.endDate) {
      invoices = invoices.filter((inv) => inv.invoiceDate <= args.endDate!);
    }

    return invoices;
  },
});

// Récupérer les factures impayées
export const getUnpaidInvoices = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db
      .query("invoices")
      .collect();

    // Factures émises ou envoyées mais pas encore payées
    const unpaidInvoices = invoices.filter(
      (inv) =>
        (inv.status === "issued" || inv.status === "sent") &&
        inv.paymentStatus !== "paid"
    );

    return unpaidInvoices;
  },
});

// Récupérer les factures en retard de paiement
export const getOverdueInvoices = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const invoices = await ctx.db
      .query("invoices")
      .collect();

    // Factures avec date d'échéance dépassée et non payées
    const overdueInvoices = invoices.filter(
      (inv) =>
        inv.paymentDueDate &&
        inv.paymentDueDate < now &&
        inv.paymentStatus !== "paid" &&
        inv.status !== "cancelled"
    );

    return overdueInvoices;
  },
});
