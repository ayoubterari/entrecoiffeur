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
    // Champ pour les notifications push
    pushToken: v.optional(v.string()), // Token pour les notifications push PWA
    pushNotificationsEnabled: v.optional(v.boolean()), // Si les notifications sont activées
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
    // Champs détaillés optionnels pour la description
    marque: v.optional(v.string()), // Marque du produit
    contenance: v.optional(v.string()), // Contenance (ex: 500ml, 1L)
    typeProduit: v.optional(v.string()), // Type de produit
    typePublic: v.optional(v.string()), // Type de public (homme, femme, enfant, mixte)
    genre: v.optional(v.string()), // Genre
    specificiteHygiene: v.optional(v.string()), // Spécificités - Hygiène
    contenanceBeaute: v.optional(v.string()), // Contenance - Beauté
    pourQui: v.optional(v.string()), // Pour qui ?
    textureHygiene: v.optional(v.string()), // Texture - Hygiène
    protectionUV: v.optional(v.string()), // Protection UV
    produitsBio: v.optional(v.string()), // Produits Bio
    isElectricalDevice: v.optional(v.boolean()), // Indique si c'est un appareil électrique
    // Champs pour appareils électriques
    coloris: v.optional(v.string()),
    natureCheveux: v.optional(v.string()),
    actionProduit: v.optional(v.string()),
    specificites: v.optional(v.string()),
    alimentation: v.optional(v.string()),
    poids: v.optional(v.string()),
    puissance: v.optional(v.string()),
    niveauxTemperature: v.optional(v.string()),
    longueurCable: v.optional(v.string()),
    fluxAir: v.optional(v.string()),
    arretAutomatique: v.optional(v.string()),
    accessoiresFournis: v.optional(v.string()),
    technologie: v.optional(v.string()),
    nombreVitesse: v.optional(v.string()),
    moteur: v.optional(v.string()),
    zonesSpecifiques: v.optional(v.string()),
    origineFabrication: v.optional(v.string()),
    // Champs de livraison
    freeShipping: v.optional(v.boolean()), // Livraison gratuite ou non
    shippingCost: v.optional(v.number()), // Prix de la livraison si non gratuite
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
    paymentId: v.optional(v.string()), // Optionnel pour COD
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
    status: v.optional(v.union(v.literal("approved"), v.literal("rejected"))), // Statut de modération (approved par défaut)
    moderatedBy: v.optional(v.id("users")), // Admin qui a modéré
    moderatedAt: v.optional(v.number()), // Date de modération
    moderationNote: v.optional(v.string()), // Note de modération
    createdAt: v.number(),
  }).index("by_product", ["productId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

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
    status: v.optional(v.union(v.literal("approved"), v.literal("rejected"))), // Statut de modération (approved par défaut)
    moderatedBy: v.optional(v.id("users")), // Admin qui a modéré
    moderatedAt: v.optional(v.number()), // Date de modération
    moderationNote: v.optional(v.string()), // Note de modération
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_order", ["orderId"])
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_product", ["productId"])
    .index("by_rating", ["rating"])
    .index("by_created_date", ["createdAt"])
    .index("by_status", ["status"]),

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

  // Coupons table - Advanced discount codes management for sellers
  coupons: defineTable({
    code: v.string(), // Unique coupon code (e.g., "SUMMER20", "WELCOME10")
    discountType: v.union(v.literal("percentage"), v.literal("fixed")), // Type de réduction
    discountValue: v.number(), // Valeur de la réduction (pourcentage 0-100 ou montant fixe)
    description: v.optional(v.string()), // Description du coupon
    isActive: v.boolean(), // Statut actif/inactif
    
    // Limitations d'utilisation
    usageLimit: v.optional(v.number()), // Limite globale d'utilisation (null = illimité)
    usageLimitPerUser: v.optional(v.number()), // Limite par utilisateur (null = illimité)
    usageCount: v.number(), // Nombre total d'utilisations
    
    // Période de validité
    validFrom: v.number(), // Date de début (timestamp)
    validUntil: v.optional(v.number()), // Date de fin (timestamp, null = pas d'expiration)
    
    // Restrictions de montant
    minimumAmount: v.optional(v.number()), // Montant minimum de commande
    maximumDiscount: v.optional(v.number()), // Réduction maximale (pour les pourcentages)
    
    // Restrictions de produits et catégories
    applicableToAllProducts: v.boolean(), // S'applique à tous les produits
    specificProductIds: v.optional(v.array(v.id("products"))), // IDs des produits spécifiques
    specificCategoryIds: v.optional(v.array(v.id("categories"))), // IDs des catégories spécifiques
    
    // Restrictions utilisateur
    applicableToAllUsers: v.boolean(), // S'applique à tous les utilisateurs
    specificUserTypes: v.optional(v.array(v.string())), // Types d'utilisateurs (particulier, professionnel, grossiste)
    
    // Métadonnées
    sellerId: v.id("users"), // Vendeur qui a créé le coupon
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_code", ["code"])
    .index("by_active", ["isActive"])
    .index("by_seller", ["sellerId"])
    .index("by_valid_from", ["validFrom"])
    .index("by_seller_active", ["sellerId", "isActive"]),
  
  // Coupon Usage Tracking - Suivi des utilisations par utilisateur
  couponUsages: defineTable({
    couponId: v.id("coupons"),
    userId: v.id("users"),
    orderId: v.optional(v.id("orders")), // Commande associée
    usageCount: v.number(), // Nombre d'utilisations par cet utilisateur
    lastUsedAt: v.number(), // Dernière utilisation
    createdAt: v.number(),
  }).index("by_coupon", ["couponId"])
    .index("by_user", ["userId"])
    .index("by_coupon_user", ["couponId", "userId"])
    .index("by_order", ["orderId"]),

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
      invoices: v.optional(v.boolean()), // Gestion des factures
      commissions: v.boolean(), // Gestion des commissions
      netvendeur: v.boolean(), // Gestion du net vendeur
      paiement: v.boolean(), // Gestion des paiements
      blog: v.boolean(), // Gestion du blog
      coupons: v.boolean(), // Gestion des coupons
      reviews: v.optional(v.boolean()), // Gestion des avis
      newsletter: v.optional(v.boolean()), // Gestion de la newsletter
      analytics: v.optional(v.boolean()), // Accès aux analytics et traçabilité
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

  // Seller Users - Sous-utilisateurs créés par les professionnels/grossistes
  sellerUsers: defineTable({
    userId: v.id("users"), // Référence vers le compte utilisateur créé
    parentSellerId: v.id("users"), // ID du professionnel/grossiste qui a créé ce compte
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(
      v.literal("manager"), // Gestionnaire avec accès étendu
      v.literal("employee"), // Employé avec accès limité
      v.literal("viewer") // Observateur en lecture seule
    ),
    permissions: v.object({
      profile: v.boolean(), // Accès au profil
      products: v.boolean(), // Gestion des produits
      orders: v.boolean(), // Gestion des commandes/ventes
      purchases: v.boolean(), // Voir les achats
      messages: v.boolean(), // Accès aux messages
      complaints: v.boolean(), // Gestion des réclamations
      coupons: v.boolean(), // Gestion des coupons
      support: v.boolean(), // Accès au support
      stats: v.boolean(), // Voir les statistiques
      settings: v.boolean(), // Modifier les paramètres
    }),
    isActive: v.boolean(), // Compte actif ou désactivé
    createdBy: v.id("users"), // Qui a créé ce sous-utilisateur
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_parent_seller", ["parentSellerId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"])
    .index("by_parent_active", ["parentSellerId", "isActive"]),

  // Business Sales (Fonds de commerce)
  businessSales: defineTable({
    // Informations générales
    activityType: v.string(), // Type d'activité (café, boulangerie, salon de coiffure, etc.)
    businessName: v.optional(v.string()), // Nom commercial (facultatif)
    address: v.string(), // Adresse complète
    city: v.string(), // Ville
    district: v.optional(v.string()), // Quartier
    totalArea: v.string(), // Surface totale (ex: 120 m²)
    creationYear: v.number(), // Année de création
    legalStatus: v.string(), // Statut juridique (SARL, personne physique, etc.)
    saleReason: v.string(), // Motif de la vente
    
    // Données financières
    salePrice: v.number(), // Prix de vente
    annualRevenue: v.string(), // Chiffre d'affaires annuel
    netProfit: v.optional(v.string()), // Résultat net
    monthlyRent: v.number(), // Loyer mensuel
    fixedCharges: v.optional(v.string()), // Charges fixes
    leaseRemaining: v.string(), // Durée du bail restante
    deposit: v.optional(v.string()), // Dépôt de garantie
    
    // Détails du local
    localDescription: v.string(), // Description du local
    includedEquipment: v.string(), // Équipements inclus
    recentWorks: v.optional(v.string()), // Travaux récents
    compliance: v.optional(v.string()), // Conformité et autorisations
    
    // Clientèle et potentiel
    clienteleType: v.string(), // Type de clientèle
    footTraffic: v.string(), // Flux de passage
    developmentPotential: v.optional(v.string()), // Potentiel de développement
    
    // Contenu visuel
    images: v.optional(v.array(v.union(v.string(), v.id("_storage")))), // Photos du local (max 5)
    floorPlan: v.optional(v.union(v.string(), v.id("_storage"))), // Plan du local
    videoUrl: v.optional(v.string()), // URL vidéo (deprecated, pour rétrocompatibilité)
    
    // Métadonnées
    sellerId: v.id("users"), // Vendeur
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("sold"),
      v.literal("inactive")
    ), // Statut de l'annonce
    views: v.optional(v.number()), // Nombre de vues
    contactCount: v.optional(v.number()), // Nombre de contacts
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_seller", ["sellerId"])
    .index("by_city", ["city"])
    .index("by_status", ["status"])
    .index("by_activity_type", ["activityType"])
    .index("by_created_at", ["createdAt"]),

  // Newsletter Subscribers - Abonnés à la newsletter
  newsletterSubscribers: defineTable({
    email: v.string(), // Email de l'abonné
    subscribedAt: v.number(), // Date d'abonnement
    isActive: v.boolean(), // Statut actif/désactivé
    source: v.optional(v.string()), // Source d'inscription (homepage, checkout, etc.)
  }).index("by_email", ["email"])
    .index("by_active", ["isActive"])
    .index("by_subscribed_date", ["subscribedAt"]),

  // User Activity Tracking - Traçabilité du temps passé par les utilisateurs
  userActivityTracking: defineTable({
    userId: v.optional(v.id("users")), // Utilisateur (optionnel pour les non-connectés)
    sessionId: v.string(), // ID de session unique (pour les non-connectés)
    activityType: v.union(
      v.literal("product_view"), // Vue d'un produit
      v.literal("page_view"), // Vue d'une page
      v.literal("category_browse"), // Navigation dans une catégorie
      v.literal("search"), // Recherche
      v.literal("store_visit") // Visite d'une boutique
    ),
    resourceId: v.optional(v.string()), // ID de la ressource (productId, pageUrl, etc.)
    resourceName: v.optional(v.string()), // Nom de la ressource (nom du produit, titre de la page)
    timeSpent: v.number(), // Temps passé en secondes
    startTime: v.number(), // Timestamp de début
    endTime: v.number(), // Timestamp de fin
    pageUrl: v.string(), // URL de la page
    referrer: v.optional(v.string()), // Page de provenance
    deviceType: v.optional(v.string()), // Type d'appareil (mobile, desktop, tablet)
    userAgent: v.optional(v.string()), // User agent du navigateur
    metadata: v.optional(v.any()), // Données additionnelles (JSON)
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_activity_type", ["activityType"])
    .index("by_resource", ["resourceId"])
    .index("by_date", ["createdAt"])
    .index("by_user_activity", ["userId", "activityType"])
    .index("by_resource_date", ["resourceId", "createdAt"]),

  // Invoices table - Factures conformes aux normes françaises
  invoices: defineTable({
    // Numérotation unique et séquentielle (obligatoire)
    invoiceNumber: v.string(), // Format: FAC-YYYY-XXXXX (ex: FAC-2025-00001)
    invoiceDate: v.number(), // Date d'émission (timestamp)
    
    // Référence à la commande
    orderId: v.id("orders"),
    orderNumber: v.string(), // Numéro de commande pour référence
    
    // Informations vendeur (émetteur de la facture)
    seller: v.object({
      userId: v.id("users"),
      companyName: v.optional(v.string()), // Raison sociale
      firstName: v.string(),
      lastName: v.string(),
      address: v.string(),
      city: v.string(),
      postalCode: v.optional(v.string()),
      country: v.string(),
      siret: v.optional(v.string()), // Numéro SIRET (obligatoire pour professionnels français)
      tvaNumber: v.optional(v.string()), // Numéro TVA intracommunautaire
      email: v.string(),
      phone: v.optional(v.string()),
    }),
    
    // Informations acheteur (destinataire de la facture)
    buyer: v.object({
      userId: v.id("users"),
      companyName: v.optional(v.string()), // Si professionnel
      firstName: v.string(),
      lastName: v.string(),
      address: v.string(),
      city: v.string(),
      postalCode: v.string(),
      country: v.string(),
      email: v.string(),
      siret: v.optional(v.string()), // Si professionnel
      tvaNumber: v.optional(v.string()), // Si professionnel avec TVA
    }),
    
    // Lignes de la facture
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      description: v.optional(v.string()),
      quantity: v.number(),
      unitPriceHT: v.number(), // Prix unitaire HT
      tvaRate: v.number(), // Taux de TVA (ex: 20, 10, 5.5, 2.1)
      tvaAmount: v.number(), // Montant TVA
      totalHT: v.number(), // Total HT pour cette ligne
      totalTTC: v.number(), // Total TTC pour cette ligne
    })),
    
    // Totaux (obligatoires)
    subtotalHT: v.number(), // Sous-total HT (produits uniquement)
    shippingHT: v.number(), // Frais de port HT
    shippingTVA: v.number(), // TVA sur frais de port
    discountHT: v.optional(v.number()), // Réduction HT
    discountTVA: v.optional(v.number()), // TVA sur réduction
    totalHT: v.number(), // Total HT (avec frais de port et réductions)
    totalTVA: v.number(), // Total TVA
    totalTTC: v.number(), // Total TTC (montant à payer)
    
    // Détail TVA par taux (obligatoire)
    tvaBreakdown: v.array(v.object({
      rate: v.number(), // Taux de TVA
      baseHT: v.number(), // Base HT
      tvaAmount: v.number(), // Montant TVA
    })),
    
    // Informations de paiement
    paymentMethod: v.string(), // Mode de paiement
    paymentDate: v.optional(v.number()), // Date de paiement
    paymentStatus: v.union(
      v.literal("paid"), // Payé
      v.literal("pending"), // En attente
      v.literal("partial"), // Partiellement payé
      v.literal("cancelled") // Annulé
    ),
    
    // Conditions de paiement (obligatoire selon loi française)
    paymentTerms: v.string(), // Ex: "Paiement à réception", "30 jours net"
    paymentDueDate: v.optional(v.number()), // Date d'échéance
    
    // Pénalités de retard (obligatoire selon loi française)
    latePenaltyRate: v.number(), // Taux de pénalités (ex: 10%)
    latePenaltyText: v.string(), // Texte légal des pénalités
    recoveryIndemnity: v.number(), // Indemnité forfaitaire de recouvrement (40€ en France)
    
    // Mentions légales obligatoires
    legalMentions: v.object({
      noVAT: v.optional(v.boolean()), // Si TVA non applicable (micro-entreprise)
      noVATReason: v.optional(v.string()), // Raison (ex: "TVA non applicable, art. 293 B du CGI")
      reverseCharge: v.optional(v.boolean()), // Autoliquidation (pour export UE)
      escompte: v.optional(v.string()), // Conditions d'escompte si applicable
    }),
    
    // Informations de coupon si applicable
    couponCode: v.optional(v.string()),
    couponDescription: v.optional(v.string()),
    
    // Statut de la facture
    status: v.union(
      v.literal("draft"), // Brouillon
      v.literal("issued"), // Émise
      v.literal("sent"), // Envoyée au client
      v.literal("paid"), // Payée
      v.literal("cancelled"), // Annulée
      v.literal("credited") // Avoir émis
    ),
    
    // Avoir (credit note) si applicable
    creditNoteId: v.optional(v.id("invoices")), // Référence à l'avoir
    originalInvoiceId: v.optional(v.id("invoices")), // Si c'est un avoir, référence à la facture originale
    
    // Métadonnées
    generatedBy: v.optional(v.id("users")), // Qui a généré la facture (admin ou automatique)
    sentAt: v.optional(v.number()), // Date d'envoi au client
    pdfUrl: v.optional(v.union(v.string(), v.id("_storage"))), // URL du PDF généré
    notes: v.optional(v.string()), // Notes internes
    
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_invoice_number", ["invoiceNumber"])
    .index("by_order", ["orderId"])
    .index("by_seller", ["seller.userId"])
    .index("by_buyer", ["buyer.userId"])
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_invoice_date", ["invoiceDate"])
    .index("by_created_at", ["createdAt"]),
  
  // System settings - Configuration globale du système
  systemSettings: defineTable({
    key: v.string(), // Clé unique du paramètre (ex: "product_limits")
    value: v.any(), // Valeur du paramètre (peut être un objet, nombre, string, etc.)
    description: v.optional(v.string()), // Description du paramètre
    updatedBy: v.optional(v.id("users")), // Dernier admin qui a modifié
    updatedAt: v.number(),
    createdAt: v.number(),
  }).index("by_key", ["key"]),

  // Home Carousel Banners - Bannières du carrousel de la page d'accueil
  homeCarouselBanners: defineTable({
    title: v.string(), // Titre de la bannière
    subtitle: v.optional(v.string()), // Sous-titre
    description: v.optional(v.string()), // Description
    imageUrl: v.optional(v.string()), // URL de l'image (si externe)
    imageStorageId: v.optional(v.string()), // ID de stockage Convex (si uploadée)
    buttonText: v.optional(v.string()), // Texte du bouton CTA
    buttonLink: v.optional(v.string()), // Lien du bouton
    backgroundColor: v.optional(v.string()), // Couleur de fond
    textColor: v.optional(v.string()), // Couleur du texte
    order: v.number(), // Ordre d'affichage (1-5)
    isActive: v.boolean(), // Si la bannière est active
    createdBy: v.id("users"), // Admin qui a créé
    updatedBy: v.optional(v.id("users")), // Dernier admin qui a modifié
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_order", ["order"])
    .index("by_active", ["isActive"])
    .index("by_active_order", ["isActive", "order"]),
});
