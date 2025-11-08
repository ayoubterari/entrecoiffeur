import { mutation, internalMutation } from "../../_generated/server";
import { v } from "convex/values";

// Taux de TVA français standards
const TVA_RATES = {
  NORMAL: 20, // Taux normal
  INTERMEDIATE: 10, // Taux intermédiaire
  REDUCED: 5.5, // Taux réduit
  SUPER_REDUCED: 2.1, // Taux super réduit
};

// Générer un numéro de facture unique et séquentiel
async function generateInvoiceNumber(ctx: any): Promise<string> {
  const year = new Date().getFullYear();
  
  // Récupérer toutes les factures de l'année en cours
  const invoicesThisYear = await ctx.db
    .query("invoices")
    .filter((q: any) => {
      const invoiceYear = new Date(q.field("invoiceDate")).getFullYear();
      return invoiceYear === year;
    })
    .collect();
  
  // Calculer le prochain numéro séquentiel
  const nextNumber = invoicesThisYear.length + 1;
  const paddedNumber = String(nextNumber).padStart(5, '0');
  
  return `FAC-${year}-${paddedNumber}`;
}

// Calculer les montants HT et TVA à partir d'un montant TTC
function calculateHTFromTTC(ttc: number, tvaRate: number) {
  const ht = ttc / (1 + tvaRate / 100);
  const tva = ttc - ht;
  return {
    ht: Math.round(ht * 100) / 100,
    tva: Math.round(tva * 100) / 100,
  };
}

// Fonction helper pour générer une facture
async function generateInvoiceHandler(ctx: any, args: any) {
    // Récupérer la commande
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Commande introuvable");
    }

    // Vérifier si une facture existe déjà pour cette commande
    const existingInvoice = await ctx.db
      .query("invoices")
      .withIndex("by_order", (q: any) => q.eq("orderId", args.orderId))
      .first();
    
    if (existingInvoice) {
      throw new Error("Une facture existe déjà pour cette commande");
    }

    // Récupérer les informations du vendeur
    const seller = await ctx.db.get(order.sellerId);
    if (!seller) {
      throw new Error("Vendeur introuvable");
    }

    // Récupérer les informations de l'acheteur
    const buyer = await ctx.db.get(order.buyerId);
    if (!buyer) {
      throw new Error("Acheteur introuvable");
    }

    // Récupérer le produit
    const product = await ctx.db.get(order.productId);
    if (!product) {
      throw new Error("Produit introuvable");
    }

    // Générer le numéro de facture
    const invoiceNumber = await generateInvoiceNumber(ctx);
    const invoiceDate = Date.now();

    // Taux de TVA (défaut: 20%)
    const tvaRate = args.tvaRate || TVA_RATES.NORMAL;

    // Calculer les montants HT et TVA pour le produit
    const productTTC = order.productPrice * order.quantity;
    const productCalc = calculateHTFromTTC(productTTC, tvaRate);

    // Calculer les montants HT et TVA pour les frais de port
    const shippingCalc = calculateHTFromTTC(order.shipping, tvaRate);

    // Calculer les montants HT et TVA pour la réduction si applicable
    let discountHT = 0;
    let discountTVA = 0;
    if (order.discount && order.discount > 0) {
      const discountCalc = calculateHTFromTTC(order.discount, tvaRate);
      discountHT = discountCalc.ht;
      discountTVA = discountCalc.tva;
    }

    // Calculer les totaux
    const subtotalHT = productCalc.ht;
    const shippingHT = shippingCalc.ht;
    const shippingTVA = shippingCalc.tva;
    const totalHT = subtotalHT + shippingHT - discountHT;
    const totalTVA = productCalc.tva + shippingTVA - discountTVA;
    const totalTTC = order.total;

    // Détail TVA par taux
    const tvaBreakdown = [
      {
        rate: tvaRate,
        baseHT: totalHT,
        tvaAmount: totalTVA,
      },
    ];

    // Ligne de facture
    const items = [
      {
        productId: order.productId,
        productName: order.productName,
        description: product.description || undefined,
        quantity: order.quantity,
        unitPriceHT: productCalc.ht / order.quantity,
        tvaRate: tvaRate,
        tvaAmount: productCalc.tva,
        totalHT: productCalc.ht,
        totalTTC: productTTC,
      },
    ];

    // Conditions de paiement selon la loi française
    const paymentTerms = "Paiement à réception";
    const latePenaltyRate = 10; // 10% selon le taux légal
    const latePenaltyText = `En cas de retard de paiement, une pénalité de ${latePenaltyRate}% sera appliquée, ainsi qu'une indemnité forfaitaire de recouvrement de 40€ (articles L441-6 et D441-5 du Code de commerce).`;
    const recoveryIndemnity = 40; // 40€ selon la loi française

    // Mentions légales
    const legalMentions: any = {};
    
    // Si le vendeur n'a pas de numéro de TVA, c'est probablement une micro-entreprise
    if (!seller.tvaNumber) {
      legalMentions.noVAT = true;
      legalMentions.noVATReason = "TVA non applicable, art. 293 B du CGI";
    }

    // Créer la facture
    const invoiceId = await ctx.db.insert("invoices", {
      invoiceNumber,
      invoiceDate,
      orderId: order._id,
      orderNumber: order.orderNumber,
      
      // Informations vendeur
      seller: {
        userId: seller._id,
        companyName: seller.companyName || undefined,
        firstName: seller.firstName || "",
        lastName: seller.lastName || "",
        address: seller.address || "",
        city: seller.city || "",
        postalCode: undefined, // À ajouter dans le profil utilisateur si nécessaire
        country: "France",
        siret: seller.siret || undefined,
        tvaNumber: seller.tvaNumber || undefined,
        email: seller.email,
        phone: seller.phone || undefined,
      },
      
      // Informations acheteur
      buyer: {
        userId: buyer._id,
        companyName: buyer.companyName || undefined,
        firstName: order.billingInfo.firstName,
        lastName: order.billingInfo.lastName,
        address: order.billingInfo.address,
        city: order.billingInfo.city,
        postalCode: order.billingInfo.postalCode,
        country: order.billingInfo.country,
        email: order.billingInfo.email,
        siret: buyer.siret || undefined,
        tvaNumber: buyer.tvaNumber || undefined,
      },
      
      // Lignes de facture
      items,
      
      // Totaux
      subtotalHT,
      shippingHT,
      shippingTVA,
      discountHT: discountHT > 0 ? discountHT : undefined,
      discountTVA: discountTVA > 0 ? discountTVA : undefined,
      totalHT,
      totalTVA,
      totalTTC,
      
      // Détail TVA
      tvaBreakdown,
      
      // Paiement
      paymentMethod: order.paymentMethod,
      paymentDate: order.paymentStatus === "paid" ? order.createdAt : undefined,
      paymentStatus: order.paymentStatus === "failed" ? "cancelled" : order.paymentStatus,
      paymentTerms,
      paymentDueDate: undefined, // Paiement immédiat
      
      // Pénalités de retard
      latePenaltyRate,
      latePenaltyText,
      recoveryIndemnity,
      
      // Mentions légales
      legalMentions,
      
      // Coupon
      couponCode: order.couponCode || undefined,
      couponDescription: order.couponCode ? `Code promo: ${order.couponCode}` : undefined,
      
      // Statut
      status: order.paymentStatus === "paid" ? "issued" : "draft",
      
      // Métadonnées
      generatedBy: args.generatedBy || undefined,
      sentAt: undefined,
      pdfUrl: undefined,
      notes: undefined,
      
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

  return {
    invoiceId,
    invoiceNumber,
    message: "Facture générée avec succès",
  };
}

// Créer une facture à partir d'une commande (version publique)
export const generateInvoiceFromOrder = mutation({
  args: {
    orderId: v.id("orders"),
    tvaRate: v.optional(v.number()),
    generatedBy: v.optional(v.id("users")),
  },
  handler: generateInvoiceHandler,
});

// Créer une facture à partir d'une commande (version interne pour appels automatiques)
export const generateInvoiceFromOrderInternal = internalMutation({
  args: {
    orderId: v.id("orders"),
    tvaRate: v.optional(v.number()),
    generatedBy: v.optional(v.id("users")),
  },
  handler: generateInvoiceHandler,
});

// Mettre à jour le statut d'une facture
export const updateInvoiceStatus = mutation({
  args: {
    invoiceId: v.id("invoices"),
    status: v.union(
      v.literal("draft"),
      v.literal("issued"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("cancelled"),
      v.literal("credited")
    ),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) {
      throw new Error("Facture introuvable");
    }

    await ctx.db.patch(args.invoiceId, {
      status: args.status,
      sentAt: args.status === "sent" ? Date.now() : invoice.sentAt,
      updatedAt: Date.now(),
    });

    return { success: true, message: "Statut de la facture mis à jour" };
  },
});

// Marquer une facture comme envoyée
export const markInvoiceAsSent = mutation({
  args: {
    invoiceId: v.id("invoices"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, {
      status: "sent",
      sentAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, message: "Facture marquée comme envoyée" };
  },
});

// Annuler une facture
export const cancelInvoice = mutation({
  args: {
    invoiceId: v.id("invoices"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) {
      throw new Error("Facture introuvable");
    }

    await ctx.db.patch(args.invoiceId, {
      status: "cancelled",
      notes: args.reason || invoice.notes,
      updatedAt: Date.now(),
    });

    return { success: true, message: "Facture annulée" };
  },
});

// Créer un avoir (credit note) pour une facture
export const createCreditNote = mutation({
  args: {
    originalInvoiceId: v.id("invoices"),
    reason: v.string(),
    generatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Récupérer la facture originale
    const originalInvoice = await ctx.db.get(args.originalInvoiceId);
    if (!originalInvoice) {
      throw new Error("Facture originale introuvable");
    }

    // Générer le numéro d'avoir
    const invoiceNumber = await generateInvoiceNumber(ctx);
    const invoiceDate = Date.now();

    // Créer l'avoir avec les montants négatifs
    const { _id, _creationTime, ...invoiceData } = originalInvoice;
    const creditNoteId = await ctx.db.insert("invoices", {
      ...invoiceData,
      invoiceNumber,
      invoiceDate,
      
      // Inverser les montants pour l'avoir
      subtotalHT: -originalInvoice.subtotalHT,
      shippingHT: -originalInvoice.shippingHT,
      shippingTVA: -originalInvoice.shippingTVA,
      discountHT: originalInvoice.discountHT ? -originalInvoice.discountHT : undefined,
      discountTVA: originalInvoice.discountTVA ? -originalInvoice.discountTVA : undefined,
      totalHT: -originalInvoice.totalHT,
      totalTVA: -originalInvoice.totalTVA,
      totalTTC: -originalInvoice.totalTTC,
      
      // Inverser les montants des lignes
      items: originalInvoice.items.map(item => ({
        ...item,
        unitPriceHT: -item.unitPriceHT,
        tvaAmount: -item.tvaAmount,
        totalHT: -item.totalHT,
        totalTTC: -item.totalTTC,
      })),
      
      // Inverser le détail TVA
      tvaBreakdown: originalInvoice.tvaBreakdown.map(breakdown => ({
        ...breakdown,
        baseHT: -breakdown.baseHT,
        tvaAmount: -breakdown.tvaAmount,
      })),
      
      // Statut et références
      status: "issued",
      originalInvoiceId: args.originalInvoiceId,
      creditNoteId: undefined,
      
      // Notes
      notes: `Avoir pour la facture ${originalInvoice.invoiceNumber}. Raison: ${args.reason}`,
      
      // Métadonnées
      generatedBy: args.generatedBy || undefined,
      sentAt: undefined,
      pdfUrl: undefined,
      
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Mettre à jour la facture originale
    await ctx.db.patch(args.originalInvoiceId, {
      status: "credited",
      creditNoteId,
      updatedAt: Date.now(),
    });

    return {
      creditNoteId,
      invoiceNumber,
      message: "Avoir créé avec succès",
    };
  },
});

// Attacher un PDF à une facture
export const attachInvoicePDF = mutation({
  args: {
    invoiceId: v.id("invoices"),
    pdfUrl: v.union(v.string(), v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, {
      pdfUrl: args.pdfUrl,
      updatedAt: Date.now(),
    });

    return { success: true, message: "PDF attaché à la facture" };
  },
});
