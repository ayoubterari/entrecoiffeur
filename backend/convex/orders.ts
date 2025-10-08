import { mutation, query } from "./_generated/server";
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
    paymentId: v.string(),
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
      status: "confirmed",
      paymentMethod: args.paymentMethod,
      paymentId: args.paymentId,
      paymentStatus: "paid",
      billingInfo: args.billingInfo,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      orderId,
      orderNumber,
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

// Update order status (admin only)
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
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
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
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
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
