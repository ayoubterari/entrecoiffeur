import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all categories
export const getCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

// Create a new category (admin only)
export const createCategory = mutation({
  args: {
    name: v.string(),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if category with same name already exists
    const existingCategory = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingCategory) {
      throw new ConvexError("A category with this name already exists");
    }

    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      icon: args.icon || "📦",
      description: args.description || "",
      color: "#FF6B9D", // Couleur par défaut
      createdAt: Date.now(),
    });

    return categoryId;
  },
});

// Get featured products
export const getFeaturedProducts = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("featured"), true))
      .take(8);
  },
});

// Get products on sale
export const getSaleProducts = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("onSale"), true))
      .take(10);
  },
});

// Get products by category
export const getProductsByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    // Get the category name from categoryId
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      return [];
    }
    
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", category.name))
      .collect();
  },
});

// Get all products with pagination
export const getProducts = query({
  args: { 
    limit: v.optional(v.number()),
    search: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("products");
    
    if (args.search) {
      // Simple search implementation
      const allProducts = await query.collect();
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(args.search!.toLowerCase()) ||
        product.description.toLowerCase().includes(args.search!.toLowerCase())
      ).slice(0, args.limit || 20);
    }
    
    return await query.take(args.limit || 20);
  },
});

// Get single product
export const getProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

// Create a new product
export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    images: v.array(v.string()),
    categoryId: v.id("categories"),
    sellerId: v.id("users"), // Add sellerId as parameter
    stock: v.number(),
    tags: v.array(v.string()),
    featured: v.optional(v.boolean()),
    onSale: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get the seller information to check user type
    const seller = await ctx.db.get(args.sellerId);
    if (!seller) {
      throw new ConvexError("Seller not found");
    }

    // Check role-based limitations
    if (seller.userType === "particulier") {
      throw new ConvexError("Les particuliers ne peuvent pas vendre de produits");
    }

    // For professionals, check the 2-product limit
    if (seller.userType === "professionnel") {
      const existingProducts = await ctx.db
        .query("products")
        .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
        .collect();
      
      if (existingProducts.length >= 2) {
        throw new ConvexError("Limite atteinte : Les professionnels peuvent ajouter maximum 2 produits");
      }
    }

    // Grossistes have no limits, so we continue normally

    // Get the category name from categoryId
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    const productId = await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      price: args.price,
      originalPrice: args.originalPrice,
      stock: args.stock,
      category: category.name, // Use category name instead of categoryId
      sellerId: args.sellerId,
      images: args.images,
      tags: args.tags,
      featured: args.featured || false,
      onSale: args.onSale || false,
      createdAt: Date.now(),
    });

    return productId;
  },
});

// Get products by seller
export const getProductsBySeller = query({
  args: { sellerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
      .order("desc")
      .collect();
  },
});

// Get product by ID
export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

// Update a product
export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    categoryId: v.optional(v.id("categories")),
    stock: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    onSale: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { productId, categoryId, ...updates } = args;
    
    // Remove undefined values and categoryId from updates
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key, value]) => 
        value !== undefined && key !== 'categoryId'
      )
    );

    // If categoryId is provided, convert it to category name
    if (categoryId) {
      const category = await ctx.db.get(categoryId);
      if (category) {
        cleanUpdates.category = category.name;
      }
    }
  },
});

// Initialize mock categories
export const initializeMockCategories = mutation({
  handler: async (ctx) => {
    // Check if categories already exist
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return { message: "Categories already exist", count: existingCategories.length };
    }

    // Create mock categories
    const categories = [
      {
        name: "Soins Capillaires",
        description: "Shampoings, masques et soins pour cheveux secs, gras ou abîmés",
        icon: "🧴",
        color: "#ff6b9d",
        createdAt: Date.now(),
      },
      {
        name: "Coiffure",
        description: "Outils professionnels : sèche-cheveux, lisseurs, brosses",
        icon: "✂️",
        color: "#fd79a8",
        createdAt: Date.now(),
      },
      {
        name: "Coloration",
        description: "Produits de coloration, décoloration et mèches",
        icon: "🎨",
        color: "#e84393",
        createdAt: Date.now(),
      },
      {
        name: "Accessoires",
        description: "Bijoux, barrettes, élastiques et accessoires pour cheveux",
        icon: "💎",
        color: "#ffeaa7",
        createdAt: Date.now(),
      },
      {
        name: "Coiffure Homme",
        description: "Produits et outils spécialement conçus pour la coiffure masculine",
        icon: "👨‍🦲",
        color: "#74b9ff",
        createdAt: Date.now(),
      },
      {
        name: "Soins Bio",
        description: "Produits naturels et biologiques pour le soin des cheveux",
        icon: "🌿",
        color: "#00b894",
        createdAt: Date.now(),
      },
      {
        name: "Extensions",
        description: "Extensions de cheveux naturelles et synthétiques",
        icon: "💇‍♀️",
        color: "#a29bfe",
        createdAt: Date.now(),
      },
      {
        name: "Matériel Pro",
        description: "Équipement professionnel pour salons de coiffure",
        icon: "🏪",
        color: "#fd79a8",
        createdAt: Date.now(),
      },
    ];

    const categoryIds = [];
    for (const category of categories) {
      const id = await ctx.db.insert("categories", category);
      categoryIds.push(id);
    }

    return { 
      message: "Mock categories created successfully", 
      count: categoryIds.length,
      categoryIds 
    };
  },
});

// Create sample products for demonstration
export const createSampleProducts = mutation({
  handler: async (ctx) => {
    // Get categories
    const categories = await ctx.db.query("categories").collect();
    if (categories.length === 0) {
      throw new Error("No categories found. Please create categories first.");
    }

    // Check if products already exist
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return { message: "Products already exist", count: existingProducts.length };
    }

    // Create mock products
    const sampleProducts = [
      {
        name: "Shampoing Professionnel Kérastase",
        description: "Shampoing nutritif pour cheveux secs et abîmés. Formule enrichie en huiles essentielles.",
        price: 29.90,
        originalPrice: 35.00,
        images: ["🧴"],
        categoryId: categories.find(c => c.name === "Soins Capillaires")?._id,
        sellerId: "demo_seller" as any,
        stock: 50,
        rating: 4.8,
        reviewCount: 124,
        tags: ["professionnel", "nutritif", "cheveux secs", "kérastase"],
        featured: true,
        onSale: true,
        createdAt: Date.now(),
      },
      {
        name: "Sèche-cheveux Dyson Supersonic",
        description: "Sèche-cheveux haute technologie avec contrôle intelligent de la chaleur et du débit d'air.",
        price: 399.00,
        images: ["💨"],
        categoryId: categories.find(c => c.name === "Coiffure")?._id,
        sellerId: "demo_seller" as any,
        stock: 15,
        rating: 4.9,
        reviewCount: 89,
        tags: ["dyson", "professionnel", "technologie", "sèche-cheveux"],
        featured: true,
        onSale: false,
        createdAt: Date.now(),
      },
      {
        name: "Kit Coloration L'Oréal Excellence",
        description: "Kit complet pour coloration à domicile. Couvre 100% des cheveux blancs.",
        price: 12.50,
        images: ["🎨"],
        categoryId: categories.find(c => c.name === "Coloration")?._id,
        sellerId: "demo_seller" as any,
        stock: 100,
        rating: 4.3,
        reviewCount: 256,
        tags: ["coloration", "maison", "l'oréal", "facile"],
        featured: false,
        onSale: false,
        createdAt: Date.now(),
      },
      {
        name: "Barrettes Dorées Premium",
        description: "Set de 6 barrettes dorées élégantes. Parfaites pour les occasions spéciales.",
        price: 15.90,
        originalPrice: 22.00,
        images: ["💎"],
        categoryId: categories.find(c => c.name === "Accessoires")?._id,
        sellerId: "demo_seller" as any,
        stock: 75,
        rating: 4.6,
        reviewCount: 45,
        tags: ["accessoires", "doré", "élégant", "barrettes"],
        featured: false,
        onSale: true,
        createdAt: Date.now(),
      },
      {
        name: "Gel Coiffant Homme Strong Hold",
        description: "Gel coiffant extra fort pour hommes. Tenue 24h garantie, effet mouillé.",
        price: 8.90,
        images: ["💪"],
        categoryId: categories.find(c => c.name === "Coiffure Homme")?._id,
        sellerId: "demo_seller" as any,
        stock: 200,
        rating: 4.4,
        reviewCount: 78,
        tags: ["homme", "gel", "tenue forte", "coiffage"],
        featured: false,
        onSale: false,
        createdAt: Date.now(),
      },
      {
        name: "Masque Capillaire Bio Argan",
        description: "Masque réparateur à l'huile d'argan bio. 100% naturel, sans sulfates ni parabènes.",
        price: 24.90,
        originalPrice: 29.90,
        images: ["🌿"],
        categoryId: categories.find(c => c.name === "Soins Bio")?._id,
        sellerId: "demo_seller" as any,
        stock: 60,
        rating: 4.7,
        reviewCount: 92,
        tags: ["bio", "naturel", "argan", "masque", "réparateur"],
        featured: true,
        onSale: true,
        createdAt: Date.now(),
      },
      {
        name: "Extensions Cheveux Naturels 50cm",
        description: "Extensions 100% cheveux naturels, 50cm de longueur. Couleur châtain clair.",
        price: 89.00,
        images: ["💇‍♀️"],
        categoryId: categories.find(c => c.name === "Extensions")?._id,
        sellerId: "demo_seller" as any,
        stock: 25,
        rating: 4.5,
        reviewCount: 34,
        tags: ["extensions", "naturel", "50cm", "châtain"],
        featured: false,
        onSale: false,
        createdAt: Date.now(),
      },
      {
        name: "Casque Professionnel Salon",
        description: "Casque séchoir professionnel pour salon. Minuteur intégré, température réglable.",
        price: 299.00,
        images: ["🏪"],
        categoryId: categories.find(c => c.name === "Matériel Pro")?._id,
        sellerId: "demo_seller" as any,
        stock: 8,
        rating: 4.8,
        reviewCount: 23,
        tags: ["professionnel", "salon", "casque", "séchoir"],
        featured: true,
        onSale: false,
        createdAt: Date.now(),
      },
    ];

    const productIds = [];
    for (const product of sampleProducts) {
      if (product.categoryId) {
        // Get the category name from categoryId
        const category = await ctx.db.get(product.categoryId);
        if (category) {
          const { categoryId, ...productData } = product; // Remove categoryId from product
          const id = await ctx.db.insert("products", {
            ...productData,
            category: category.name, // Use category name instead of categoryId
          });
          productIds.push(id);
        }
      }
    }

    return { 
      message: "Sample products created successfully", 
      count: productIds.length,
    };
  },
});

// Clear all data (for development/testing)
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all products first (due to foreign key constraints)
    const products = await ctx.db.query("products").collect();
    for (const product of products) {
      await ctx.db.delete(product._id);
    }
    
    // Delete all categories
    const categories = await ctx.db.query("categories").collect();
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }
    
    return { 
      message: "All data cleared successfully",
      deletedProducts: products.length,
      deletedCategories: categories.length
    };
  },
});

// Update category (admin only)
export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updates } = args;
    
    // Check if category exists
    const existingCategory = await ctx.db.get(categoryId);
    if (!existingCategory) {
      throw new ConvexError("Category not found");
    }
    
    // If name is being updated, check for duplicates
    if (updates.name && updates.name !== existingCategory.name) {
      const duplicateCategory = await ctx.db
        .query("categories")
        .filter((q) => q.eq(q.field("name"), updates.name))
        .first();
      
      if (duplicateCategory) {
        throw new ConvexError("A category with this name already exists");
      }
    }
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined && value !== '')
    );

    await ctx.db.patch(categoryId, cleanUpdates);
    return categoryId;
  },
});

// Delete product (seller/admin only)
export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    // Check if product exists
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError("Product not found");
    }

    // TODO: Add authorization check - only seller or admin can delete
    // For now, allow any authenticated user to delete

    await ctx.db.delete(args.productId);
    return { success: true, message: "Product deleted successfully" };
  },
});

// Delete category (admin only)
export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    // Check if category exists
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Check if category is used by products
    const productsUsingCategory = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("category"), category.name))
      .collect();

    if (productsUsingCategory.length > 0) {
      throw new ConvexError(`Cannot delete category. ${productsUsingCategory.length} product(s) are using this category.`);
    }

    await ctx.db.delete(args.categoryId);
    return { success: true, message: "Category deleted successfully" };
  },
});
