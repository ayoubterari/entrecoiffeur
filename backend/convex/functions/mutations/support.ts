import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// Créer un nouveau ticket de support
export const createSupportTicket = mutation({
  args: {
    userId: v.optional(v.id("users")),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    subject: v.string(),
    category: v.union(
      v.literal("complaint"),
      v.literal("clarification"),
      v.literal("technical"),
      v.literal("billing"),
      v.literal("other")
    ),
    description: v.string(),
    voiceRecording: v.optional(v.id("_storage")),
    attachments: v.optional(v.array(v.string())),
    relatedSellerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Générer un numéro de ticket unique
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Compter les tickets du jour pour générer un numéro séquentiel
    const startOfDay = new Date(year, now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    
    const todayTickets = await ctx.db
      .query("supportTickets")
      .withIndex("by_created_date")
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), startOfDay),
          q.lt(q.field("createdAt"), endOfDay)
        )
      )
      .collect();
    
    const ticketNumber = `SUP-${year}${month}${day}-${String(todayTickets.length + 1).padStart(3, '0')}`;
    
    // Déterminer la priorité automatiquement basée sur la catégorie
    let priority: "low" | "medium" | "high" | "urgent" = "medium";
    if (args.category === "technical" || args.category === "billing") {
      priority = "high";
    } else if (args.category === "complaint") {
      priority = "medium";
    } else {
      priority = "low";
    }
    
    // Créer le ticket
    const ticketId = await ctx.db.insert("supportTickets", {
      ticketNumber,
      userId: args.userId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      subject: args.subject,
      category: args.category,
      priority,
      status: "open",
      description: args.description,
      voiceRecording: args.voiceRecording,
      attachments: args.attachments,
      relatedSellerId: args.relatedSellerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Si c'est une réclamation avec un vendeur spécifique, créer une notification pour le vendeur
    if (args.category === "complaint" && args.relatedSellerId) {
      try {
        // Créer une notification pour le vendeur concerné
        await ctx.db.insert("notifications", {
          userId: args.relatedSellerId,
          type: "support_complaint",
          title: `Nouvelle réclamation - Ticket #${ticketNumber}`,
          message: `Une réclamation a été déposée concernant votre boutique. Sujet: ${args.subject}`,
          data: {
            ticketId,
            ticketNumber,
            category: args.category,
            subject: args.subject,
            customerEmail: args.email
          },
          isRead: false,
          createdAt: Date.now(),
        });
      } catch (error) {
        console.error("Erreur lors de la création de la notification vendeur:", error);
        // Ne pas faire échouer la création du ticket si la notification échoue
      }
    }
    
    return {
      ticketId,
      ticketNumber,
      priority,
      status: "open",
      notifiedSeller: args.category === "complaint" && args.relatedSellerId
    };
  },
});

// Ajouter une réponse à un ticket
export const addTicketResponse = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    responderId: v.id("users"),
    responderType: v.union(v.literal("client"), v.literal("admin"), v.literal("seller")),
    content: v.string(),
    attachments: v.optional(v.array(v.string())),
    isInternal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Vérifier que le ticket existe
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket non trouvé");
    }

    // Si c'est un vendeur qui répond, vérifier qu'il est concerné par le ticket
    if (args.responderType === "seller") {
      if (ticket.relatedSellerId !== args.responderId) {
        throw new Error("Vous ne pouvez répondre qu'aux réclamations qui vous concernent");
      }
      if (ticket.category !== "complaint") {
        throw new Error("Les vendeurs ne peuvent répondre qu'aux réclamations");
      }
    }
    
    // Ajouter la réponse
    const responseId = await ctx.db.insert("supportTicketResponses", {
      ticketId: args.ticketId,
      responderId: args.responderId,
      responderType: args.responderType,
      content: args.content,
      attachments: args.attachments,
      isInternal: args.isInternal || false,
      createdAt: Date.now(),
    });
    
    // Mettre à jour le ticket
    await ctx.db.patch(args.ticketId, {
      lastResponseAt: Date.now(),
      updatedAt: Date.now(),
      status: args.responderType === "admin" ? "waiting_response" : "in_progress",
    });
    
    return responseId;
  },
});

// Mettre à jour le statut d'un ticket
export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("waiting_response"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };
    
    if (args.assignedTo !== undefined) {
      updateData.assignedTo = args.assignedTo;
    }
    
    if (args.status === "resolved" || args.status === "closed") {
      updateData.resolvedAt = Date.now();
    }
    
    await ctx.db.patch(args.ticketId, updateData);
    
    return { success: true };
  },
});

// Mettre à jour la priorité d'un ticket
export const updateTicketPriority = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      priority: args.priority,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Assigner un ticket à un admin
export const assignTicket = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    assignedTo: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      assignedTo: args.assignedTo,
      status: "in_progress",
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Ajouter des tags à un ticket
export const updateTicketTags = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      tags: args.tags,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});
