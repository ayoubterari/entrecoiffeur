import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Start a new conversation or get existing one
export const startConversation = mutation({
  args: {
    buyerId: v.id("users"),
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { buyerId, sellerId } = args;

    // Prevent messaging yourself
    if (buyerId === sellerId) {
      throw new Error("Cannot start conversation with yourself");
    }

    // Check if conversation already exists
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) =>
        q.eq("buyerId", buyerId).eq("sellerId", sellerId)
      )
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      buyerId,
      sellerId,
      lastMessageAt: Date.now(),
      lastMessage: undefined,
      isReadByBuyer: true,
      isReadBySeller: false,
      status: "active",
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    messageType: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const { conversationId, senderId, receiverId, content, messageType = "text" } = args;

    // Verify conversation exists
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify sender is part of the conversation
    if (conversation.buyerId !== senderId && conversation.sellerId !== senderId) {
      throw new Error("Unauthorized to send message in this conversation");
    }

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId,
      receiverId,
      content,
      messageType,
      isRead: false,
      createdAt: Date.now(),
    });

    // Update conversation with last message info
    await ctx.db.patch(conversationId, {
      lastMessageAt: Date.now(),
      lastMessage: content.substring(0, 100), // Store first 100 chars as preview
      isReadByBuyer: conversation.buyerId === senderId,
      isReadBySeller: conversation.sellerId === senderId,
    });

    return messageId;
  },
});

// Get conversation messages
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { conversationId, userId } = args;

    // Verify user is part of the conversation
    const conversation = await ctx.db.get(conversationId);
    if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
      throw new Error("Unauthorized to view this conversation");
    }

    // Get messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_created", (q) => q.eq("conversationId", conversationId))
      .collect();

    // Get sender info for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender: sender ? {
            _id: sender._id,
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
          } : null,
        };
      })
    );

    return messagesWithSenders;
  },
});

// Get user conversations
export const getUserConversations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get conversations where user is buyer
    const buyerConversations = await ctx.db
      .query("conversations")
      .withIndex("by_buyer", (q) => q.eq("buyerId", userId))
      .collect();

    // Get conversations where user is seller
    const sellerConversations = await ctx.db
      .query("conversations")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .collect();

    // Combine and sort by last message time
    const allConversations = [...buyerConversations, ...sellerConversations]
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    // Get participant info for each conversation
    const conversationsWithParticipants = await Promise.all(
      allConversations.map(async (conversation) => {
        const buyer = await ctx.db.get(conversation.buyerId);
        const seller = await ctx.db.get(conversation.sellerId);
        
        // Determine who is the "other" participant
        const otherParticipant = conversation.buyerId === userId ? seller : buyer;
        const userRole = conversation.buyerId === userId ? "buyer" : "seller";

        return {
          ...conversation,
          buyer: buyer ? {
            _id: buyer._id,
            firstName: buyer.firstName,
            lastName: buyer.lastName,
            email: buyer.email,
          } : null,
          seller: seller ? {
            _id: seller._id,
            firstName: seller.firstName,
            lastName: seller.lastName,
            email: seller.email,
            companyName: seller.companyName,
          } : null,
          otherParticipant: otherParticipant ? {
            _id: otherParticipant._id,
            firstName: otherParticipant.firstName,
            lastName: otherParticipant.lastName,
            email: otherParticipant.email,
            companyName: otherParticipant.companyName,
          } : null,
          userRole,
        };
      })
    );

    return conversationsWithParticipants;
  },
});

// Mark conversation as read
export const markConversationAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { conversationId, userId } = args;

    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify user is part of the conversation
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new Error("Unauthorized to mark this conversation as read");
    }

    // Update read status based on user role
    const updateData: any = {};
    if (conversation.buyerId === userId) {
      updateData.isReadByBuyer = true;
    } else {
      updateData.isReadBySeller = true;
    }

    await ctx.db.patch(conversationId, updateData);

    // Mark all messages in conversation as read for this user
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .filter((q) => q.eq(q.field("receiverId"), userId))
      .collect();

    await Promise.all(
      messages.map((message) =>
        ctx.db.patch(message._id, { isRead: true })
      )
    );

    return { success: true };
  },
});

// Get unread message count for user
export const getUnreadMessageCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadMessages.length;
  },
});

// Archive conversation
export const archiveConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { conversationId, userId } = args;

    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify user is part of the conversation
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new Error("Unauthorized to archive this conversation");
    }

    await ctx.db.patch(conversationId, {
      status: "archived",
    });

    return { success: true };
  },
});
