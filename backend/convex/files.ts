import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    // Generate a unique upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

// Store file metadata after upload
export const storeFile = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    // Store file metadata in database if needed
    // For now, just return the storage ID
    return args.storageId;
  },
});

// Get file URL from storage ID
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Delete file from storage
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    return { success: true };
  },
});
