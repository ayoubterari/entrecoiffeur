import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// User schema for our authentication
export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    userType: v.union(v.literal("particulier"), v.literal("professionnel"), v.literal("grossiste"), v.literal("superadmin")),
    companyName: v.optional(v.string()),
    siret: v.optional(v.string()),
    tvaNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("User with this email already exists");
    }

    // Validation pour les professionnels et grossistes
    if ((args.userType === "professionnel" || args.userType === "grossiste")) {
      if (!args.companyName) {
        throw new ConvexError("Company name is required for professional and wholesale accounts");
      }
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password, // In production, hash this password
      firstName: args.firstName,
      lastName: args.lastName,
      userType: args.userType,
      companyName: args.companyName,
      siret: args.siret,
      tvaNumber: args.tvaNumber,
      createdAt: Date.now(),
    });

    return { 
      userId, 
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      userType: args.userType,
      companyName: args.companyName
    };
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Check password (in production, compare hashed passwords)
    if (user.password !== args.password) {
      throw new ConvexError("Invalid password");
    }

    return { 
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      companyName: user.companyName,
    };
  },
});

// Get current user
export const getCurrentUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.userId);
      if (!user) {
        return null;
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },
});

// Get user by ID (for seller store)
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

// Create admin user (should be run once)
export const createAdminUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if admin already exists
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "admin@entre-coiffeur.com"))
      .first();

    if (existingAdmin) {
      throw new ConvexError("Admin user already exists");
    }

    // Create admin user
    const adminId = await ctx.db.insert("users", {
      email: "admin@entre-coiffeur.com",
      password: "admin123", // En production, utiliser un hash
      firstName: "Super",
      lastName: "Admin",
      userType: "superadmin",
      companyName: "Entre Coiffeur Administration",
      createdAt: Date.now(),
    });

    return {
      message: "Admin user created successfully",
      adminId: adminId,
      email: "admin@entre-coiffeur.com",
      password: "admin123"
    };
  },
});

// Get all users (for admin purposes)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    // Don't return passwords
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },
});

// Update user (admin only)
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    userType: v.optional(v.union(v.literal("particulier"), v.literal("professionnel"), v.literal("grossiste"), v.literal("superadmin"))),
    companyName: v.optional(v.string()),
    siret: v.optional(v.string()),
    tvaNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined && value !== '')
    );

    await ctx.db.patch(userId, cleanUpdates);
    return userId;
  },
});

// Delete user (admin only)
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Prevent deletion of superadmin users
    if (user.userType === "superadmin") {
      throw new ConvexError("Cannot delete superadmin users");
    }

    await ctx.db.delete(args.userId);
    return { success: true, message: "User deleted successfully" };
  },
});

// Get users by type (for admin/statistics purposes)
export const getUsersByType = query({
  args: { 
    userType: v.optional(v.union(v.literal("particulier"), v.literal("professionnel"), v.literal("grossiste"), v.literal("superadmin")))
  },
  handler: async (ctx, args) => {
    if (args.userType) {
      return await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userType"), args.userType))
        .collect();
    } else {
      // Return all users grouped by type
      const users = await ctx.db.query("users").collect();
      return {
        particulier: users.filter(u => u.userType === "particulier").length,
        professionnel: users.filter(u => u.userType === "professionnel").length,
        grossiste: users.filter(u => u.userType === "grossiste").length,
        superadmin: users.filter(u => u.userType === "superadmin").length,
        total: users.length
      };
    }
  },
});
