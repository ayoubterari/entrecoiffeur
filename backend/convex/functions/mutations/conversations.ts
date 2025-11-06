import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// Créer ou récupérer une conversation et envoyer un message initial
export const startBusinessSaleConversation = mutation({
  args: {
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    businessSaleId: v.id("businessSales"),
    initialMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // Récupérer les infos du fonds de commerce
    const businessSale = await ctx.db.get(args.businessSaleId);
    if (!businessSale) {
      throw new Error("Business sale not found");
    }

    // Vérifier si une conversation existe déjà entre ces deux utilisateurs
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) => 
        q.eq("buyerId", args.buyerId).eq("sellerId", args.sellerId)
      )
      .first();

    let conversationId;
    const now = Date.now();

    // Construire le message avec contexte du fonds de commerce
    const messageContent = `🏢 Demande d'information concernant: ${businessSale.activityType}\n\n${args.initialMessage}`;

    if (existingConversation) {
      // Mettre à jour la conversation existante
      conversationId = existingConversation._id;
      await ctx.db.patch(conversationId, {
        lastMessageAt: now,
        lastMessage: messageContent,
        isReadByBuyer: true,
        isReadBySeller: false, // Le vendeur n'a pas encore lu
        status: "active",
      });
    } else {
      // Créer une nouvelle conversation
      conversationId = await ctx.db.insert("conversations", {
        buyerId: args.buyerId,
        sellerId: args.sellerId,
        lastMessageAt: now,
        lastMessage: messageContent,
        isReadByBuyer: true,
        isReadBySeller: false,
        status: "active",
        createdAt: now,
      });
    }

    // Créer le message initial
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId: args.buyerId,
      receiverId: args.sellerId,
      content: messageContent,
      messageType: "text",
      isRead: false,
      createdAt: now,
    });

    return {
      conversationId,
      messageId,
    };
  },
});

// Marquer les messages comme lus
export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Déterminer si l'utilisateur est l'acheteur ou le vendeur
    const isBuyer = conversation.buyerId === args.userId;

    // Mettre à jour le statut de lecture
    await ctx.db.patch(args.conversationId, {
      isReadByBuyer: isBuyer ? true : conversation.isReadByBuyer,
      isReadBySeller: isBuyer ? conversation.isReadBySeller : true,
    });

    // Marquer tous les messages non lus comme lus
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("receiverId"), args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const message of messages) {
      await ctx.db.patch(message._id, { isRead: true });
    }
  },
});
