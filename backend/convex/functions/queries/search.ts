import { query } from "../../_generated/server";
import { v } from "convex/values";

// Recherche intelligente de produits
export const searchProducts = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    categoryId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { query: searchQuery, limit = 10, categoryId } = args;
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    const searchTerm = searchQuery.toLowerCase().trim();
    
    // Récupérer tous les produits
    let products = await ctx.db.query("products").collect();
    
    // Filtrer par catégorie si spécifiée
    if (categoryId && categoryId !== 'all') {
      products = products.filter(product => product.categoryId === categoryId);
    }
    
    // Fonction de scoring pour la pertinence
    const calculateScore = (product: any) => {
      let score = 0;
      const name = product.name.toLowerCase();
      const description = (product.description || '').toLowerCase();
      const tags = (product.tags || []).map((tag: string) => tag.toLowerCase());
      
      // Score pour correspondance exacte dans le nom (poids le plus élevé)
      if (name.includes(searchTerm)) {
        score += 100;
        // Bonus si c'est au début du nom
        if (name.startsWith(searchTerm)) {
          score += 50;
        }
      }
      
      // Score pour correspondance dans la description
      if (description.includes(searchTerm)) {
        score += 30;
      }
      
      // Score pour correspondance dans les tags
      tags.forEach((tag: string) => {
        if (tag.includes(searchTerm)) {
          score += 20;
        }
      });
      
      // Bonus pour les produits en vedette
      if (product.featured) {
        score += 10;
      }
      
      // Bonus pour les produits en stock
      if (product.stock > 0) {
        score += 5;
      }
      
      // Recherche par mots-clés individuels
      const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
      searchWords.forEach(word => {
        if (name.includes(word)) score += 15;
        if (description.includes(word)) score += 8;
        tags.forEach((tag: string) => {
          if (tag.includes(word)) score += 5;
        });
      });
      
      return score;
    };
    
    // Calculer le score pour chaque produit et filtrer ceux avec un score > 0
    const scoredProducts = products
      .map(product => ({
        ...product,
        searchScore: calculateScore(product)
      }))
      .filter(product => product.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, limit);
    
    return scoredProducts;
  },
});

// Obtenir des suggestions de recherche basées sur les produits existants
export const getSearchSuggestions = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query: searchQuery, limit = 5 } = args;
    
    if (!searchQuery || searchQuery.trim().length < 1) {
      // Retourner des suggestions populaires si pas de query
      return [
        "shampooing",
        "après-shampooing",
        "masque cheveux",
        "huile capillaire",
        "brosse",
        "sérum",
        "coloration",
        "soins"
      ].slice(0, limit);
    }

    const searchTerm = searchQuery.toLowerCase().trim();
    
    // Récupérer tous les produits
    const products = await ctx.db.query("products").collect();
    
    const suggestions = new Set<string>();
    
    products.forEach(product => {
      const name = product.name.toLowerCase();
      const tags = product.tags || [];
      
      // Ajouter le nom du produit s'il correspond partiellement
      if (name.includes(searchTerm) && name !== searchTerm) {
        suggestions.add(product.name);
      }
      
      // Ajouter les tags qui correspondent
      tags.forEach((tag: string) => {
        const tagLower = tag.toLowerCase();
        if (tagLower.includes(searchTerm) && tagLower !== searchTerm) {
          suggestions.add(tag);
        }
      });
      
      // Ajouter des mots du nom qui commencent par la recherche
      const words = name.split(' ');
      words.forEach(word => {
        if (word.startsWith(searchTerm) && word.length > searchTerm.length) {
          suggestions.add(word);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, limit);
  },
});

// Obtenir les recherches populaires/tendances
export const getTrendingSearches = query({
  args: {},
  handler: async (ctx) => {
    // Pour l'instant, retourner des recherches populaires statiques
    // Dans une vraie app, on stockerait les statistiques de recherche
    return [
      { term: "shampooing bio", count: 156 },
      { term: "masque réparateur", count: 142 },
      { term: "huile argan", count: 128 },
      { term: "brosse démêlante", count: 115 },
      { term: "sérum anti-frizz", count: 98 },
      { term: "coloration naturelle", count: 87 },
      { term: "après-shampooing", count: 76 },
      { term: "soins cheveux bouclés", count: 65 }
    ];
  },
});

// Recherche par catégorie avec suggestions
export const searchByCategory = query({
  args: {
    categoryId: v.id("categories"),
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { categoryId, query, limit = 10 } = args;
    
    let products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("categoryId"), categoryId))
      .collect();
    
    if (query && query.trim().length > 0) {
      const searchTerm = query.toLowerCase().trim();
      
      products = products.filter(product => {
        const name = product.name.toLowerCase();
        const description = (product.description || '').toLowerCase();
        const tags = (product.tags || []).map((tag: string) => tag.toLowerCase());
        
        return name.includes(searchTerm) || 
               description.includes(searchTerm) || 
               tags.some((tag: string) => tag.includes(searchTerm));
      });
    }
    
    return products.slice(0, limit);
  },
});
