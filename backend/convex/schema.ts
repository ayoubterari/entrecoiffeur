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
    city: v.optional(v.string()), // Ville de l'utilisateur (obligatoire à l'inscription)
    companyName: v.optional(v.string()), // Pour professionnels et grossistes
    siret: v.optional(v.string()), // Pour professionnels et grossistes
    tvaNumber: v.optional(v.string()), // Pour professionnels et grossistes
    rib: v.optional(v.string()), // RIB pour professionnels et grossistes
    // Champs pour la gestion des groupes
    isGroupMember: v.optional(v.boolean()), // Si l'utilisateur appartient à un groupe
    groupAccessCode: v.optional(v.string()), // Code d'accès du groupe utilisé lors de l'inscription
    hasSeenGroupWelcome: v.optional(v.boolean()), // Si l'utilisateur a déjà vu le modal de bienvenue groupe
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_user_type", ["userType"])
    .index("by_group_member", ["isGroupMember"])
    .index("by_city", ["city"]),
  
  categories: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    parentCategoryId: v.optional(v.id("categories")), // Pour les sous-catégories
    level: v.optional(v.number()), // 0 = catégorie principale, 1 = sous-catégorie
    order: v.optional(v.number()), // Pour l'ordre d'affichage
    createdAt: v.number(),
  }).index("by_parent", ["parentCategoryId"])
    .index("by_level", ["level"]),
  
  // Products table
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    stock: v.number(),
    category: v.string(),
    categoryId: v.optional(v.id("categories")),
    categoryName: v.optional(v.string()),
    sellerId: v.id("users"),
    images: v.array(v.union(v.string(), v.id("_storage"))),
    tags: v.optional(v.array(v.string())),
    location: v.optional(v.string()), // Ville où se trouve l'annonce
    // Visibilité du produit par type d'utilisateur
    visibleByParticulier: v.optional(v.boolean()), // Visible par les particuliers
    visibleByProfessionnel: v.optional(v.boolean()), // Visible par les professionnels
    visibleByGrossiste: v.optional(v.boolean()), // Visible par les grossistes
    isVisible: v.optional(v.boolean()), // Visibilité générale du produit (admin peut masquer)
    featured: v.boolean(),
    onSale: v.boolean(),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_seller", ["sellerId"])
    .index("by_category", ["category"])
    .index("by_featured", ["featured"])
    .index("by_sale", ["onSale"])
    .index("by_location", ["location"]),

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
    discount: v.optional(v.number()),
    couponCode: v.optional(v.string()),
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
    // Champs d'affiliation
    affiliateCode: v.optional(v.string()), // Code d'affiliation utilisé
    affiliateId: v.optional(v.id("users")), // Utilisateur qui a référé
    affiliateEarningProcessed: v.optional(v.boolean()), // Si les gains ont été traités
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_status", ["status"])
    .index("by_order_number", ["orderNumber"])
    .index("by_affiliate", ["affiliateId"])
    .index("by_affiliate_code", ["affiliateCode"]),
  
  // Reviews table
  reviews: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number(),
  }).index("by_product", ["productId"])
    .index("by_user", ["userId"]),

  // Order Reviews table - Évaluations des commandes livrées
  orderReviews: defineTable({
    orderId: v.id("orders"), // Commande évaluée
    buyerId: v.id("users"), // Acheteur qui évalue
    sellerId: v.id("users"), // Vendeur évalué
    productId: v.id("products"), // Produit de la commande
    rating: v.number(), // Note de 1 à 5 étoiles
    comment: v.optional(v.string()), // Commentaire optionnel
    deliveryRating: v.optional(v.number()), // Note pour la livraison (1-5)
    productQualityRating: v.optional(v.number()), // Note pour la qualité du produit (1-5)
    sellerServiceRating: v.optional(v.number()), // Note pour le service vendeur (1-5)
    isRecommended: v.optional(v.boolean()), // Recommande-t-il ce vendeur/produit ?
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_order", ["orderId"])
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_product", ["productId"])
    .index("by_rating", ["rating"])
    .index("by_created_date", ["createdAt"]),

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

  // Follows table - Users following sellers
  follows: defineTable({
    followerId: v.id("users"), // User who follows
    followedId: v.id("users"), // Seller being followed
    createdAt: v.number(),
  }).index("by_follower", ["followerId"])
    .index("by_followed", ["followedId"])
    .index("by_follower_followed", ["followerId", "followedId"]),

  // Conversations table - Chat conversations between buyers and sellers
  conversations: defineTable({
    buyerId: v.id("users"), // Buyer who initiated the conversation
    sellerId: v.id("users"), // Store owner
    lastMessageAt: v.number(),
    lastMessage: v.optional(v.string()),
    isReadByBuyer: v.boolean(),
    isReadBySeller: v.boolean(),
    status: v.union(v.literal("active"), v.literal("archived")), // active, archived
    createdAt: v.number(),
  }).index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_participants", ["buyerId", "sellerId"])
    .index("by_last_message", ["lastMessageAt"]),

  // Messages table - Individual messages in conversations
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"), // Who sent the message
    receiverId: v.id("users"), // Who receives the message
    content: v.string(),
    messageType: v.union(v.literal("text"), v.literal("image"), v.literal("system")),
    isRead: v.boolean(),
    createdAt: v.number(),
    editedAt: v.optional(v.number()),
  }).index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"])
    .index("by_conversation_created", ["conversationId", "createdAt"]),

  // Coupons table - Admin discount codes management
  coupons: defineTable({
    code: v.string(), // Unique coupon code (e.g., "SUMMER20", "WELCOME10")
    discountPercentage: v.number(), // Percentage discount (0-100)
    description: v.optional(v.string()), // Optional description of the coupon
    isActive: v.boolean(), // Whether the coupon is currently active
    usageLimit: v.optional(v.number()), // Maximum number of uses (null = unlimited)
    usageCount: v.number(), // Current number of uses
    validFrom: v.number(), // Start date timestamp
    validUntil: v.optional(v.number()), // End date timestamp (null = no expiry)
    minimumAmount: v.optional(v.number()), // Minimum order amount to use coupon
    createdBy: v.id("users"), // Admin who created the coupon
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_code", ["code"])
    .index("by_active", ["isActive"])
    .index("by_created_by", ["createdBy"])
    .index("by_valid_from", ["validFrom"]),

  // Seller Posts table - Posts created by sellers in their store
  sellerPosts: defineTable({
    sellerId: v.id("users"), // Seller who created the post
    content: v.string(), // Post text content
    images: v.optional(v.array(v.union(v.string(), v.id("_storage")))), // Post images
    type: v.union(
      v.literal("text"), // Text only post
      v.literal("image"), // Image post with optional text
      v.literal("promotion"), // Promotional post
      v.literal("announcement") // Store announcement
    ),
    isActive: v.boolean(), // Whether the post is visible
    likesCount: v.number(), // Number of likes
    commentsCount: v.number(), // Number of comments
    viewsCount: v.number(), // Number of views
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_seller", ["sellerId"])
    .index("by_active", ["isActive"])
    .index("by_type", ["type"])
    .index("by_created_date", ["createdAt"])
    .index("by_seller_active", ["sellerId", "isActive"]),

  // Seller Post Likes table - Track who liked which posts
  sellerPostLikes: defineTable({
    postId: v.id("sellerPosts"),
    userId: v.id("users"), // User who liked the post
    createdAt: v.number(),
  }).index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_post_user", ["postId", "userId"]),

  // Seller Post Comments table - Comments on seller posts
  sellerPostComments: defineTable({
    postId: v.id("sellerPosts"),
    userId: v.id("users"), // User who commented
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_post_created", ["postId", "createdAt"]),

  // Affiliate Links table - Liens d'affiliation générés par les utilisateurs
  affiliateLinks: defineTable({
    affiliateId: v.id("users"), // Utilisateur qui partage (affilié)
    sellerId: v.id("users"), // Vendeur dont le store est partagé
    linkCode: v.string(), // Code unique du lien (ex: "ABC123")
    linkUrl: v.string(), // URL complète du lien d'affiliation
    clicksCount: v.number(), // Nombre de clics sur le lien
    conversionsCount: v.number(), // Nombre de commandes passées via ce lien
    totalEarnings: v.number(), // Total des points gagnés via ce lien
    isActive: v.boolean(), // Si le lien est actif
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_seller", ["sellerId"])
    .index("by_link_code", ["linkCode"])
    .index("by_active", ["isActive"])
    .index("by_affiliate_seller", ["affiliateId", "sellerId"]),

  // Affiliate Clicks table - Tracking des clics sur les liens d'affiliation
  affiliateClicks: defineTable({
    linkId: v.id("affiliateLinks"),
    affiliateId: v.id("users"), // Affilié qui a généré le lien
    sellerId: v.id("users"), // Vendeur visité
    visitorId: v.optional(v.string()), // ID anonyme du visiteur (cookie/session)
    ipAddress: v.optional(v.string()), // Adresse IP du visiteur
    userAgent: v.optional(v.string()), // User agent du navigateur
    referrer: v.optional(v.string()), // Site de provenance
    convertedToOrder: v.boolean(), // Si ce clic a mené à une commande
    orderId: v.optional(v.id("orders")), // ID de la commande si conversion
    createdAt: v.number(),
  }).index("by_link", ["linkId"])
    .index("by_affiliate", ["affiliateId"])
    .index("by_seller", ["sellerId"])
    .index("by_visitor", ["visitorId"])
    .index("by_converted", ["convertedToOrder"])
    .index("by_order", ["orderId"]),

  // Affiliate Earnings table - Points gagnés par les affiliés
  affiliateEarnings: defineTable({
    affiliateId: v.id("users"), // Utilisateur qui a gagné les points
    orderId: v.id("orders"), // Commande qui a généré les points
    linkId: v.id("affiliateLinks"), // Lien d'affiliation utilisé
    sellerId: v.id("users"), // Vendeur de la commande
    buyerId: v.id("users"), // Acheteur de la commande
    orderAmount: v.number(), // Montant de la commande
    pointsEarned: v.number(), // Points gagnés (ex: 5% du montant)
    pointsRate: v.number(), // Taux de commission utilisé (ex: 0.05 pour 5%)
    status: v.union(
      v.literal("pending"), // En attente (commande pas encore livrée)
      v.literal("confirmed"), // Confirmé (commande livrée)
      v.literal("cancelled") // Annulé (commande annulée/remboursée)
    ),
    paidAt: v.optional(v.number()), // Quand les points ont été crédités
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_order", ["orderId"])
    .index("by_link", ["linkId"])
    .index("by_seller", ["sellerId"])
    .index("by_status", ["status"])
    .index("by_affiliate_status", ["affiliateId", "status"]),

  // User Points table - Solde de points des utilisateurs
  userPoints: defineTable({
    userId: v.id("users"),
    totalPoints: v.number(), // Total des points disponibles
    totalEarned: v.number(), // Total des points gagnés (historique)
    totalSpent: v.number(), // Total des points dépensés
    pendingPoints: v.number(), // Points en attente de confirmation
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Point Transactions table - Historique des transactions de points
  pointTransactions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("earned"), // Points gagnés
      v.literal("spent"), // Points dépensés
      v.literal("bonus"), // Bonus administrateur
      v.literal("refund") // Remboursement
    ),
    amount: v.number(), // Montant de la transaction (positif ou négatif)
    description: v.string(), // Description de la transaction
    relatedOrderId: v.optional(v.id("orders")), // Commande liée si applicable
    relatedEarningId: v.optional(v.id("affiliateEarnings")), // Gain d'affiliation lié
    balanceAfter: v.number(), // Solde après la transaction
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_order", ["relatedOrderId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Support Tickets table - Tickets de support client
  supportTickets: defineTable({
    ticketNumber: v.string(), // Numéro unique du ticket (ex: "SUP-2025-001")
    userId: v.optional(v.id("users")), // Utilisateur qui a créé le ticket (optionnel pour les non-connectés)
    email: v.string(), // Email de contact
    firstName: v.optional(v.string()), // Prénom
    lastName: v.optional(v.string()), // Nom
    subject: v.string(), // Sujet du ticket
    category: v.union(
      v.literal("complaint"), // Réclamation
      v.literal("clarification"), // Demande de clarification
      v.literal("technical"), // Problème technique
      v.literal("billing"), // Problème de facturation
      v.literal("other") // Autre
    ),
    priority: v.union(
      v.literal("low"), // Faible
      v.literal("medium"), // Moyenne
      v.literal("high"), // Élevée
      v.literal("urgent") // Urgente
    ),
    status: v.union(
      v.literal("open"), // Ouvert
      v.literal("in_progress"), // En cours
      v.literal("waiting_response"), // En attente de réponse client
      v.literal("resolved"), // Résolu
      v.literal("closed") // Fermé
    ),
    description: v.string(), // Description détaillée du problème
    voiceRecording: v.optional(v.id("_storage")), // Enregistrement vocal optionnel
    attachments: v.optional(v.array(v.union(v.string(), v.id("_storage")))), // Pièces jointes
    relatedSellerId: v.optional(v.id("users")), // Vendeur/boutique concerné(e) par le problème
    assignedTo: v.optional(v.id("users")), // Admin assigné au ticket
    tags: v.optional(v.array(v.string())), // Tags pour catégoriser
    lastResponseAt: v.optional(v.number()), // Dernière réponse
    resolvedAt: v.optional(v.number()), // Date de résolution
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_assigned", ["assignedTo"])
    .index("by_related_seller", ["relatedSellerId"])
    .index("by_ticket_number", ["ticketNumber"])
    .index("by_created_date", ["createdAt"]),

  // Support Ticket Responses table - Réponses aux tickets de support
  supportTicketResponses: defineTable({
    ticketId: v.id("supportTickets"),
    responderId: v.id("users"), // Utilisateur qui répond (client ou admin)
    responderType: v.union(v.literal("client"), v.literal("admin"), v.literal("seller")),
    content: v.string(), // Contenu de la réponse
    attachments: v.optional(v.array(v.union(v.string(), v.id("_storage")))), // Pièces jointes
    isInternal: v.boolean(), // Note interne (visible seulement par les admins)
    createdAt: v.number(),
  }).index("by_ticket", ["ticketId"])
    .index("by_responder", ["responderId"])
    .index("by_responder_type", ["responderType"])
    .index("by_ticket_created", ["ticketId", "createdAt"]),

  // Notifications table - Notifications pour les utilisateurs
  notifications: defineTable({
    userId: v.id("users"), // Utilisateur qui reçoit la notification
    type: v.string(), // Type de notification (support_complaint, order_update, etc.)
    title: v.string(), // Titre de la notification
    message: v.string(), // Message de la notification
    data: v.optional(v.any()), // Données additionnelles (JSON)
    isRead: v.boolean(), // Statut de lecture
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_type", ["type"])
    .index("by_created_date", ["createdAt"]),

  // Admin Users - Utilisateurs avec accès admin et permissions spécifiques
  adminUsers: defineTable({
    userId: v.id("users"), // Référence vers l'utilisateur principal
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(
      v.literal("superadmin"), // Accès complet à tout
      v.literal("admin"), // Accès selon permissions
      v.literal("moderator") // Accès limité
    ),
    permissions: v.object({
      dashboard: v.boolean(), // Accès au dashboard principal
      users: v.boolean(), // Gestion des utilisateurs
      products: v.boolean(), // Gestion des produits
      categories: v.boolean(), // Gestion des catégories
      orders: v.boolean(), // Gestion des commandes
      commissions: v.boolean(), // Gestion des commissions
      netvendeur: v.boolean(), // Gestion du net vendeur
      paiement: v.boolean(), // Gestion des paiements
      blog: v.boolean(), // Gestion du blog
      coupons: v.boolean(), // Gestion des coupons
      support: v.boolean(), // Gestion du support
      stats: v.boolean(), // Accès aux statistiques
      settings: v.boolean(), // Accès aux paramètres
    }),
    isActive: v.boolean(), // Compte actif ou désactivé
    createdBy: v.id("users"), // Qui a créé cet admin
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"]),

  // Account Type Change Requests - Demandes de changement de type de compte
  accountChangeRequests: defineTable({
    userId: v.id("users"), // Utilisateur qui fait la demande
    email: v.string(), // Email de l'utilisateur
    firstName: v.string(), // Prénom de l'utilisateur
    lastName: v.string(), // Nom de l'utilisateur
    currentType: v.union(v.literal("particulier"), v.literal("professionnel"), v.literal("grossiste")), // Type actuel
    requestedType: v.union(v.literal("particulier"), v.literal("professionnel"), v.literal("grossiste")), // Type demandé
    reason: v.string(), // Raison de la demande
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")), // Statut de la demande
    reviewedBy: v.optional(v.id("users")), // Admin qui a traité la demande
    reviewComment: v.optional(v.string()), // Commentaire de l'admin
    reviewedAt: v.optional(v.number()), // Date de traitement
    createdAt: v.number(), // Date de création
    updatedAt: v.number(), // Date de mise à jour
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),
});
