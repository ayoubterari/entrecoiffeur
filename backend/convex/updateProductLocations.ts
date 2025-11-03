import { mutation } from "./_generated/server";

/**
 * Mutation pour mettre à jour les produits sans location avec la ville du vendeur
 * À exécuter une seule fois pour migrer les données existantes
 */
export const updateProductLocations = mutation({
  args: {},
  handler: async (ctx) => {
    // Récupérer tous les produits
    const products = await ctx.db.query("products").collect();
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const product of products) {
      // Si le produit n'a pas de location
      if (!product.location || product.location.trim() === '') {
        // Récupérer le vendeur
        const seller = await ctx.db.get(product.sellerId);
        
        if (seller && seller.city) {
          // Mettre à jour le produit avec la ville du vendeur
          await ctx.db.patch(product._id, {
            location: seller.city
          });
          updatedCount++;
        } else {
          skippedCount++;
        }
      }
    }
    
    return {
      success: true,
      message: `${updatedCount} produits mis à jour, ${skippedCount} produits ignorés (vendeur sans ville)`,
      updatedCount,
      skippedCount,
      totalProducts: products.length
    };
  },
});
