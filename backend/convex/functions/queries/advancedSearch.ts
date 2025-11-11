import { query } from "../../_generated/server";
import { v } from "convex/values";

export const advancedSearchProducts = query({
  args: {
    searchTerm: v.optional(v.string()),
    categoryId: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    location: v.optional(v.string()),
    marque: v.optional(v.string()),
    typeProduit: v.optional(v.string()),
    typePublic: v.optional(v.string()),
    genre: v.optional(v.string()),
    onSale: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
    userType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    // Filtrage par visibilité selon le type d'utilisateur
    if (args.userType) {
      products = products.filter((product) => {
        if (args.userType === "particulier") {
          return product.visibleByParticulier === true;
        } else if (args.userType === "professionnel") {
          return product.visibleByProfessionnel === true || product.visibleByProfessionnel === undefined;
        } else if (args.userType === "grossiste") {
          return product.visibleByGrossiste === true || product.visibleByGrossiste === undefined;
        }
        return true;
      });
    } else {
      // Non connecté : voir uniquement les produits pour particuliers
      products = products.filter((product) => product.visibleByParticulier === true);
    }

    // Filtrage par visibilité générale
    products = products.filter((product) => product.isVisible !== false);

    // Recherche par terme
    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase();
      products = products.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const descriptionMatch = product.description.toLowerCase().includes(searchLower);
        const marqueMatch = product.marque?.toLowerCase().includes(searchLower);
        const tagsMatch = product.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
        
        return nameMatch || descriptionMatch || marqueMatch || tagsMatch;
      });
    }

    // Filtrage par catégorie
    if (args.categoryId) {
      products = products.filter((product) => product.categoryId === args.categoryId);
    }

    // Filtrage par prix
    if (args.minPrice !== undefined && args.minPrice !== null) {
      products = products.filter((product) => product.price >= args.minPrice!);
    }
    if (args.maxPrice !== undefined && args.maxPrice !== null) {
      products = products.filter((product) => product.price <= args.maxPrice!);
    }

    // Filtrage par localisation
    if (args.location) {
      products = products.filter((product) => product.location === args.location);
    }

    // Filtrage par marque
    if (args.marque) {
      products = products.filter((product) => product.marque === args.marque);
    }

    // Filtrage par type de produit
    if (args.typeProduit) {
      products = products.filter((product) => product.typeProduit === args.typeProduit);
    }

    // Filtrage par type de public
    if (args.typePublic) {
      products = products.filter((product) => product.typePublic === args.typePublic);
    }

    // Filtrage par genre
    if (args.genre) {
      products = products.filter((product) => product.genre === args.genre);
    }

    // Filtrage par promotion
    if (args.onSale) {
      products = products.filter((product) => product.onSale === true);
    }

    // Filtrage par vedette
    if (args.featured) {
      products = products.filter((product) => product.featured === true);
    }

    // Filtrage par stock
    if (args.inStock) {
      products = products.filter((product) => product.stock > 0);
    }

    // Tri par pertinence (produits vedettes en premier, puis par date)
    products.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.createdAt - a.createdAt;
    });

    // Limiter les résultats
    const limit = args.limit || 50;
    products = products.slice(0, limit);

    // Enrichir avec les informations du vendeur
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const seller = await ctx.db.get(product.sellerId);
        return {
          ...product,
          sellerName: seller?.companyName || seller?.firstName + " " + seller?.lastName || "Vendeur",
          sellerType: seller?.userType || "particulier",
        };
      })
    );

    return enrichedProducts;
  },
});
