import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Follow a seller
export const followSeller = mutation({
  args: {
    followerId: v.id("users"),
    followedId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { followerId, followedId } = args;

    // Check if already following
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_followed", (q) =>
        q.eq("followerId", followerId).eq("followedId", followedId)
      )
      .first();

    if (existingFollow) {
      throw new Error("Already following this seller");
    }

    // Prevent self-following
    if (followerId === followedId) {
      throw new Error("Cannot follow yourself");
    }

    // Create follow relationship
    const followId = await ctx.db.insert("follows", {
      followerId,
      followedId,
      createdAt: Date.now(),
    });

    return followId;
  },
});

// Unfollow a seller
export const unfollowSeller = mutation({
  args: {
    followerId: v.id("users"),
    followedId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { followerId, followedId } = args;

    // Find the follow relationship
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_followed", (q) =>
        q.eq("followerId", followerId).eq("followedId", followedId)
      )
      .first();

    if (!existingFollow) {
      throw new Error("Not following this seller");
    }

    // Delete the follow relationship
    await ctx.db.delete(existingFollow._id);

    return { success: true };
  },
});

// Check if user is following a seller
export const isFollowing = query({
  args: {
    followerId: v.id("users"),
    followedId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { followerId, followedId } = args;

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_followed", (q) =>
        q.eq("followerId", followerId).eq("followedId", followedId)
      )
      .first();

    return !!follow;
  },
});

// Get followers count for a seller
export const getFollowersCount = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { sellerId } = args;

    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followed", (q) => q.eq("followedId", sellerId))
      .collect();

    return followers.length;
  },
});

// Get following count for a user
export const getFollowingCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();

    return following.length;
  },
});

// Get list of followers for a seller
export const getFollowers = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { sellerId } = args;

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followed", (q) => q.eq("followedId", sellerId))
      .collect();

    // Get follower details
    const followers = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        return {
          _id: follow._id,
          user,
          createdAt: follow.createdAt,
        };
      })
    );

    return followers;
  },
});

// Get list of users that a user is following
export const getFollowing = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();

    // Get followed user details
    const following = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followedId);
        return {
          _id: follow._id,
          user,
          createdAt: follow.createdAt,
        };
      })
    );

    return following;
  },
});

// Toggle follow/unfollow
export const toggleFollow = mutation({
  args: {
    followerId: v.id("users"),
    followedId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { followerId, followedId } = args;

    // Check if already following
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_followed", (q) =>
        q.eq("followerId", followerId).eq("followedId", followedId)
      )
      .first();

    if (existingFollow) {
      // Unfollow
      await ctx.db.delete(existingFollow._id);
      return { action: "unfollowed", isFollowing: false };
    } else {
      // Prevent self-following
      if (followerId === followedId) {
        throw new Error("Cannot follow yourself");
      }

      // Follow
      await ctx.db.insert("follows", {
        followerId,
        followedId,
        createdAt: Date.now(),
      });
      return { action: "followed", isFollowing: true };
    }
  },
});
