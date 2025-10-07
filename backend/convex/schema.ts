import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    userType: v.union(v.literal("particulier"), v.literal("professionnel"), v.literal("grossiste"), v.literal("superadmin")),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    companyName: v.optional(v.string()), // Pour professionnels et grossistes
    siret: v.optional(v.string()), // Pour professionnels et grossistes
    tvaNumber: v.optional(v.string()), // Pour professionnels et grossistes
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_user_type", ["userType"]),
  
  categories: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    createdAt: v.number(),
  }),
  
  // Products table
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    stock: v.number(),
    category: v.string(),
    sellerId: v.id("users"),
    images: v.array(v.union(v.string(), v.id("_storage"))),
    tags: v.optional(v.array(v.string())),
    featured: v.boolean(),
    onSale: v.boolean(),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_seller", ["sellerId"])
    .index("by_category", ["category"])
    .index("by_featured", ["featured"])
    .index("by_sale", ["onSale"]),

  // Orders table
  orders: defineTable({
    orderNumber: v.string(),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    productId: v.id("products"),
    productName: v.string(),
    productPrice: v.number(),
    quantity: v.number(),
    subtotal: v.number(),
    shipping: v.number(),
    tax: v.number(),
    total: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"), 
      v.literal("preparing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    paymentMethod: v.string(),
    paymentId: v.string(),
    paymentStatus: v.union(v.literal("paid"), v.literal("pending"), v.literal("failed")),
    billingInfo: v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      address: v.string(),
      city: v.string(),
      postalCode: v.string(),
      country: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_status", ["status"])
    .index("by_order_number", ["orderNumber"]),
  
  // Reviews table
  reviews: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number(),
  }).index("by_product", ["productId"])
    .index("by_user", ["userId"]),

  // Blog articles table
  blogArticles: defineTable({
    title: v.string(),
    slug: v.string(), // URL-friendly version of title
    excerpt: v.string(), // Short description
    content: v.string(), // Full article content (HTML/Markdown)
    featuredImage: v.optional(v.string()), // Main image URL
    images: v.optional(v.array(v.string())), // Additional images
    authorId: v.id("users"), // Admin who created the article
    category: v.optional(v.string()), // Blog category (tips, trends, news, etc.)
    tags: v.optional(v.array(v.string())), // Tags for filtering
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    featured: v.boolean(), // Show on homepage/featured section
    publishedAt: v.optional(v.number()), // When it was published
    createdAt: v.number(),
    updatedAt: v.number(),
    viewCount: v.optional(v.number()), // Number of views
    seoTitle: v.optional(v.string()), // SEO optimized title
    seoDescription: v.optional(v.string()), // SEO meta description
  }).index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_author", ["authorId"])
    .index("by_category", ["category"])
    .index("by_featured", ["featured"])
    .index("by_published_date", ["publishedAt"]),

  // Community posts table
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    authorEmail: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("conseils"),
      v.literal("techniques"),
      v.literal("produits"),
      v.literal("annonces")
    ),
    type: v.union(
      v.literal("discussion"),
      v.literal("question"),
      v.literal("conseil"),
      v.literal("annonce")
    ),
    tags: v.optional(v.array(v.string())),
    votes: v.number(),
    upvotes: v.array(v.id("users")),
    downvotes: v.array(v.id("users")),
    commentCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_author", ["authorId"])
    .index("by_category", ["category"])
    .index("by_type", ["type"])
    .index("by_votes", ["votes"])
    .index("by_created_date", ["createdAt"]),

  // Community comments table
  comments: defineTable({
    postId: v.id("posts"),
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    authorEmail: v.string(),
    votes: v.number(),
    upvotes: v.array(v.id("users")),
    downvotes: v.array(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_post", ["postId"])
    .index("by_author", ["authorId"])
    .index("by_created_date", ["createdAt"]),

  // PayPal configuration table
  paypalConfig: defineTable({
    environment: v.union(v.literal("sandbox"), v.literal("live")),
    clientId: v.string(),
    clientSecret: v.string(),
    webhookUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Favorites table
  favorites: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("by_user_product", ["userId", "productId"]),
});
