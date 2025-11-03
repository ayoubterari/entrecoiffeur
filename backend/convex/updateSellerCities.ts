import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Mutation pour ajouter une ville à un vendeur spécifique
 */
export const updateSellerCity = mutation({
  args: {
    sellerId: v.id("users"),
    city: v.string(),
  },
  handler: async (ctx, args) => {
    // Vérifier que le vendeur existe
    const seller = await ctx.db.get(args.sellerId);
    
    if (!seller) {
      throw new Error("Vendeur non trouvé");
    }
    
    // Mettre à jour la ville du vendeur
    await ctx.db.patch(args.sellerId, {
      city: args.city
    });
    
    return {
      success: true,
      message: `Ville "${args.city}" ajoutée au vendeur ${seller.firstName} ${seller.lastName}`,
      seller: {
        id: seller._id,
        name: `${seller.firstName} ${seller.lastName}`,
        email: seller.email,
        city: args.city
      }
    };
  },
});

/**
 * Mutation pour ajouter des villes par défaut aux vendeurs sans ville
 * Utilise Paris par défaut
 */
export const addDefaultCitiesToSellers = mutation({
  args: {},
  handler: async (ctx) => {
    // Récupérer tous les professionnels et grossistes
    const professionals = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userType"), "professionnel"))
      .collect();
      
    const wholesalers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userType"), "grossiste"))
      .collect();
    
    const allSellers = [...professionals, ...wholesalers];
    
    let updatedCount = 0;
    const defaultCity = "Paris"; // Ville par défaut
    
    for (const seller of allSellers) {
      // Si le vendeur n'a pas de ville
      if (!seller.city || seller.city.trim() === '') {
        await ctx.db.patch(seller._id, {
          city: defaultCity
        });
        updatedCount++;
      }
    }
    
    return {
      success: true,
      message: `${updatedCount} vendeurs mis à jour avec la ville "${defaultCity}"`,
      updatedCount,
      totalSellers: allSellers.length,
      defaultCity
    };
  },
});
