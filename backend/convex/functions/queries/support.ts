import { query } from "../../_generated/server";
import { v } from "convex/values";

// Récupérer tous les tickets de support (pour admin)
export const getAllSupportTickets = query({
  args: {
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("waiting_response"),
      v.literal("resolved"),
      v.literal("closed")
    )),
    category: v.optional(v.union(
      v.literal("complaint"),
      v.literal("clarification"),
      v.literal("technical"),
      v.literal("billing"),
      v.literal("other")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tickets;
    
    if (args.status) {
      tickets = await ctx.db
        .query("supportTickets")
        .withIndex("by_status")
        .filter((q) => q.eq(q.field("status"), args.status))
        .order("desc")
        .take(args.limit || 50);
    } else if (args.category) {
      tickets = await ctx.db
        .query("supportTickets")
        .withIndex("by_category")
        .filter((q) => q.eq(q.field("category"), args.category))
        .order("desc")
        .take(args.limit || 50);
    } else if (args.priority) {
      tickets = await ctx.db
        .query("supportTickets")
        .withIndex("by_priority")
        .filter((q) => q.eq(q.field("priority"), args.priority))
        .order("desc")
        .take(args.limit || 50);
    } else {
      tickets = await ctx.db
        .query("supportTickets")
        .withIndex("by_created_date")
        .order("desc")
        .take(args.limit || 50);
    }
    
    // Enrichir avec les informations utilisateur
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        let user = null;
        if (ticket.userId) {
          user = await ctx.db.get(ticket.userId);
        }
        
        let assignedUser = null;
        if (ticket.assignedTo) {
          assignedUser = await ctx.db.get(ticket.assignedTo);
        }
        
        return {
          ...ticket,
          user: user ? {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          } : null,
          assignedUser: assignedUser ? {
            _id: assignedUser._id,
            firstName: assignedUser.firstName,
            lastName: assignedUser.lastName,
            email: assignedUser.email,
          } : null,
        };
      })
    );
    
    return enrichedTickets;
  },
});

// Récupérer les tickets d'un utilisateur spécifique
export const getUserSupportTickets = query({
  args: {
    userId: v.optional(v.id("users")),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId && !args.email) {
      return [];
    }
    
    let tickets;
    if (args.userId) {
      tickets = await ctx.db
        .query("supportTickets")
        .withIndex("by_user")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .order("desc")
        .collect();
    } else if (args.email) {
      tickets = await ctx.db
        .query("supportTickets")
        .withIndex("by_email")
        .filter((q) => q.eq(q.field("email"), args.email))
        .order("desc")
        .collect();
    }
    
    return tickets || [];
  },
});

// Récupérer un ticket spécifique avec ses réponses
export const getSupportTicketById = query({
  args: {
    ticketId: v.id("supportTickets"),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      return null;
    }
    
    // Récupérer les réponses
    const responses = await ctx.db
      .query("supportTicketResponses")
      .withIndex("by_ticket")
      .filter((q) => q.eq(q.field("ticketId"), args.ticketId))
      .order("asc")
      .collect();
    
    // Enrichir les réponses avec les informations utilisateur
    const enrichedResponses = await Promise.all(
      responses.map(async (response) => {
        const responder = await ctx.db.get(response.responderId);
        return {
          ...response,
          responder: responder ? {
            _id: responder._id,
            firstName: responder.firstName,
            lastName: responder.lastName,
            email: responder.email,
            userType: responder.userType,
          } : null,
        };
      })
    );
    
    // Enrichir le ticket avec les informations utilisateur
    let user = null;
    if (ticket.userId) {
      user = await ctx.db.get(ticket.userId);
    }
    
    let assignedUser = null;
    if (ticket.assignedTo) {
      assignedUser = await ctx.db.get(ticket.assignedTo);
    }
    
    return {
      ...ticket,
      user: user ? {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      } : null,
      assignedUser: assignedUser ? {
        _id: assignedUser._id,
        firstName: assignedUser.firstName,
        lastName: assignedUser.lastName,
        email: assignedUser.email,
      } : null,
      responses: enrichedResponses,
    };
  },
});

// Récupérer un ticket par son numéro
export const getSupportTicketByNumber = query({
  args: {
    ticketNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db
      .query("supportTickets")
      .withIndex("by_ticket_number")
      .filter((q) => q.eq(q.field("ticketNumber"), args.ticketNumber))
      .first();
    
    if (!ticket) {
      return null;
    }
    
    return ticket;
  },
});

// Statistiques des tickets de support (pour admin)
export const getSupportTicketStats = query({
  handler: async (ctx) => {
    const allTickets = await ctx.db.query("supportTickets").collect();
    
    const stats = {
      total: allTickets.length,
      open: allTickets.filter(t => t.status === "open").length,
      inProgress: allTickets.filter(t => t.status === "in_progress").length,
      waitingResponse: allTickets.filter(t => t.status === "waiting_response").length,
      resolved: allTickets.filter(t => t.status === "resolved").length,
      closed: allTickets.filter(t => t.status === "closed").length,
      byCategory: {
        complaint: allTickets.filter(t => t.category === "complaint").length,
        clarification: allTickets.filter(t => t.category === "clarification").length,
        technical: allTickets.filter(t => t.category === "technical").length,
        billing: allTickets.filter(t => t.category === "billing").length,
        other: allTickets.filter(t => t.category === "other").length,
      },
      byPriority: {
        low: allTickets.filter(t => t.priority === "low").length,
        medium: allTickets.filter(t => t.priority === "medium").length,
        high: allTickets.filter(t => t.priority === "high").length,
        urgent: allTickets.filter(t => t.priority === "urgent").length,
      },
    };
    
    return stats;
  },
});

// Rechercher des tickets
export const searchSupportTickets = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allTickets = await ctx.db.query("supportTickets").collect();
    
    const searchTerm = args.query.toLowerCase();
    const filteredTickets = allTickets.filter(ticket => 
      ticket.subject.toLowerCase().includes(searchTerm) ||
      ticket.description.toLowerCase().includes(searchTerm) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm) ||
      ticket.email.toLowerCase().includes(searchTerm) ||
      (ticket.firstName && ticket.firstName.toLowerCase().includes(searchTerm)) ||
      (ticket.lastName && ticket.lastName.toLowerCase().includes(searchTerm))
    );
    
    // Trier par date de création (plus récent en premier)
    filteredTickets.sort((a, b) => b.createdAt - a.createdAt);
    
    return filteredTickets.slice(0, args.limit || 20);
  },
});

// Récupérer les tickets assignés à un admin spécifique
export const getAssignedSupportTickets = query({
  args: {
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("supportTickets")
      .withIndex("by_assigned")
      .filter((q) => q.eq(q.field("assignedTo"), args.adminId))
      .order("desc")
      .collect();
    
    return tickets;
  },
});

// Récupérer la liste des vendeurs/boutiques pour sélection dans le support
export const getSellersForSupport = query({
  args: {
    userId: v.optional(v.id("users")), // Utilisateur connecté pour filtrer ses interactions
  },
  handler: async (ctx, args) => {
    // Récupérer tous les vendeurs (professionnels et grossistes)
    const sellers = await ctx.db
      .query("users")
      .withIndex("by_user_type")
      .filter((q) => 
        q.or(
          q.eq(q.field("userType"), "professionnel"),
          q.eq(q.field("userType"), "grossiste")
        )
      )
      .collect();
    
    // Si un utilisateur est connecté, on peut enrichir avec ses interactions
    let userOrders: any[] = [];
    if (args.userId) {
      userOrders = await ctx.db
        .query("orders")
        .withIndex("by_buyer")
        .filter((q) => q.eq(q.field("buyerId"), args.userId))
        .collect();
    }
    
    // Créer une map des vendeurs avec lesquels l'utilisateur a interagi
    const interactedSellerIds = new Set(userOrders.map(order => order.sellerId));
    
    // Formater les données des vendeurs
    const formattedSellers = sellers.map(seller => ({
      _id: seller._id,
      firstName: seller.firstName || '',
      lastName: seller.lastName || '',
      companyName: seller.companyName || '',
      email: seller.email,
      userType: seller.userType,
      hasInteracted: interactedSellerIds.has(seller._id),
    }));
    
    // Trier : vendeurs avec interactions en premier, puis par nom de société/nom
    formattedSellers.sort((a, b) => {
      if (a.hasInteracted && !b.hasInteracted) return -1;
      if (!a.hasInteracted && b.hasInteracted) return 1;
      
      const nameA = a.companyName || `${a.firstName} ${a.lastName}`.trim();
      const nameB = b.companyName || `${b.firstName} ${b.lastName}`.trim();
      return nameA.localeCompare(nameB);
    });
    
    return formattedSellers;
  },
});
