import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// Créer une nouvelle bannière
export const createBanner = mutation({
  args: {
    title: v.optional(v.string()), // Titre optionnel
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    buttonText: v.optional(v.string()),
    buttonLink: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
    userId: v.id("users"), // Admin qui crée
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const user = await ctx.db.get(args.userId);
    if (!user || user.userType !== "superadmin") {
      throw new Error("Seuls les administrateurs peuvent créer des bannières");
    }

    // Vérifier qu'il n'y a pas plus de 5 bannières
    const existingBanners = await ctx.db
      .query("homeCarouselBanners")
      .collect();

    if (existingBanners.length >= 5) {
      throw new Error("Maximum 5 bannières autorisées");
    }

    // Vérifier que l'ordre n'est pas déjà utilisé
    const bannerWithSameOrder = existingBanners.find(b => b.order === args.order);
    if (bannerWithSameOrder) {
      throw new Error(`L'ordre ${args.order} est déjà utilisé`);
    }

    const now = Date.now();

    const bannerId = await ctx.db.insert("homeCarouselBanners", {
      title: args.title || "", // Titre vide par défaut
      subtitle: args.subtitle,
      description: args.description,
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,
      buttonText: args.buttonText,
      buttonLink: args.buttonLink,
      backgroundColor: args.backgroundColor || "#f3f4f6",
      textColor: args.textColor || "#1f2937",
      order: args.order,
      isActive: args.isActive,
      createdBy: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    return bannerId;
  },
});

// Mettre à jour une bannière
export const updateBanner = mutation({
  args: {
    bannerId: v.id("homeCarouselBanners"),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    buttonText: v.optional(v.string()),
    buttonLink: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    userId: v.id("users"), // Admin qui modifie
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const user = await ctx.db.get(args.userId);
    if (!user || user.userType !== "superadmin") {
      throw new Error("Seuls les administrateurs peuvent modifier des bannières");
    }

    const banner = await ctx.db.get(args.bannerId);
    if (!banner) {
      throw new Error("Bannière introuvable");
    }

    // Si l'ordre change, vérifier qu'il n'est pas déjà utilisé
    if (args.order !== undefined && args.order !== banner.order) {
      const existingBanners = await ctx.db
        .query("homeCarouselBanners")
        .collect();

      const bannerWithSameOrder = existingBanners.find(
        b => b.order === args.order && b._id !== args.bannerId
      );

      if (bannerWithSameOrder) {
        throw new Error(`L'ordre ${args.order} est déjà utilisé`);
      }
    }

    const updateData: any = {
      updatedBy: args.userId,
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updateData.title = args.title;
    if (args.subtitle !== undefined) updateData.subtitle = args.subtitle;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.imageUrl !== undefined) updateData.imageUrl = args.imageUrl;
    if (args.imageStorageId !== undefined) updateData.imageStorageId = args.imageStorageId;
    if (args.buttonText !== undefined) updateData.buttonText = args.buttonText;
    if (args.buttonLink !== undefined) updateData.buttonLink = args.buttonLink;
    if (args.backgroundColor !== undefined) updateData.backgroundColor = args.backgroundColor;
    if (args.textColor !== undefined) updateData.textColor = args.textColor;
    if (args.order !== undefined) updateData.order = args.order;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;

    await ctx.db.patch(args.bannerId, updateData);

    return { success: true };
  },
});

// Supprimer une bannière
export const deleteBanner = mutation({
  args: {
    bannerId: v.id("homeCarouselBanners"),
    userId: v.id("users"), // Admin qui supprime
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const user = await ctx.db.get(args.userId);
    if (!user || user.userType !== "superadmin") {
      throw new Error("Seuls les administrateurs peuvent supprimer des bannières");
    }

    const banner = await ctx.db.get(args.bannerId);
    if (!banner) {
      throw new Error("Bannière introuvable");
    }

    await ctx.db.delete(args.bannerId);

    return { success: true };
  },
});

// Réorganiser les bannières (changer l'ordre)
export const reorderBanners = mutation({
  args: {
    bannerOrders: v.array(
      v.object({
        bannerId: v.id("homeCarouselBanners"),
        order: v.number(),
      })
    ),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const user = await ctx.db.get(args.userId);
    if (!user || user.userType !== "superadmin") {
      throw new Error("Seuls les administrateurs peuvent réorganiser les bannières");
    }

    // Mettre à jour l'ordre de chaque bannière
    for (const { bannerId, order } of args.bannerOrders) {
      await ctx.db.patch(bannerId, {
        order,
        updatedBy: args.userId,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Activer/Désactiver une bannière
export const toggleBannerStatus = mutation({
  args: {
    bannerId: v.id("homeCarouselBanners"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const user = await ctx.db.get(args.userId);
    if (!user || user.userType !== "superadmin") {
      throw new Error("Seuls les administrateurs peuvent modifier le statut des bannières");
    }

    const banner = await ctx.db.get(args.bannerId);
    if (!banner) {
      throw new Error("Bannière introuvable");
    }

    await ctx.db.patch(args.bannerId, {
      isActive: !banner.isActive,
      updatedBy: args.userId,
      updatedAt: Date.now(),
    });

    return { success: true, newStatus: !banner.isActive };
  },
});
