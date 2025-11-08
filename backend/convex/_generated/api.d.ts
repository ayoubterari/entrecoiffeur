/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as affiliateSystem from "../affiliateSystem.js";
import type * as auth from "../auth.js";
import type * as categories from "../categories.js";
import type * as commissions from "../commissions.js";
import type * as community from "../community.js";
import type * as favorites from "../favorites.js";
import type * as files from "../files.js";
import type * as follows from "../follows.js";
import type * as functions_mutations_accountChangeRequests from "../functions/mutations/accountChangeRequests.js";
import type * as functions_mutations_activityTracking from "../functions/mutations/activityTracking.js";
import type * as functions_mutations_adminUsers from "../functions/mutations/adminUsers.js";
import type * as functions_mutations_blog from "../functions/mutations/blog.js";
import type * as functions_mutations_businessSales from "../functions/mutations/businessSales.js";
import type * as functions_mutations_conversations from "../functions/mutations/conversations.js";
import type * as functions_mutations_coupons from "../functions/mutations/coupons.js";
import type * as functions_mutations_invoices from "../functions/mutations/invoices.js";
import type * as functions_mutations_newsletter from "../functions/mutations/newsletter.js";
import type * as functions_mutations_notifications from "../functions/mutations/notifications.js";
import type * as functions_mutations_reviews from "../functions/mutations/reviews.js";
import type * as functions_mutations_sellerCoupons from "../functions/mutations/sellerCoupons.js";
import type * as functions_mutations_sellerUsers from "../functions/mutations/sellerUsers.js";
import type * as functions_mutations_support from "../functions/mutations/support.js";
import type * as functions_mutations_updateProductLocations from "../functions/mutations/updateProductLocations.js";
import type * as functions_queries_accountChangeRequests from "../functions/queries/accountChangeRequests.js";
import type * as functions_queries_activityTracking from "../functions/queries/activityTracking.js";
import type * as functions_queries_adminCoupons from "../functions/queries/adminCoupons.js";
import type * as functions_queries_adminUsers from "../functions/queries/adminUsers.js";
import type * as functions_queries_blog from "../functions/queries/blog.js";
import type * as functions_queries_businessSales from "../functions/queries/businessSales.js";
import type * as functions_queries_coupons from "../functions/queries/coupons.js";
import type * as functions_queries_invoices from "../functions/queries/invoices.js";
import type * as functions_queries_newsletter from "../functions/queries/newsletter.js";
import type * as functions_queries_notifications from "../functions/queries/notifications.js";
import type * as functions_queries_reviews from "../functions/queries/reviews.js";
import type * as functions_queries_search from "../functions/queries/search.js";
import type * as functions_queries_sellerCoupons from "../functions/queries/sellerCoupons.js";
import type * as functions_queries_sellerUsers from "../functions/queries/sellerUsers.js";
import type * as functions_queries_stats from "../functions/queries/stats.js";
import type * as functions_queries_support from "../functions/queries/support.js";
import type * as initializeFBGroupCoupon from "../initializeFBGroupCoupon.js";
import type * as initializeTestReviews from "../initializeTestReviews.js";
import type * as messaging from "../messaging.js";
import type * as netVendeur from "../netVendeur.js";
import type * as orderReviews from "../orderReviews.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as sellerPosts from "../sellerPosts.js";
import type * as updateProductLocations from "../updateProductLocations.js";
import type * as updateSellerCities from "../updateSellerCities.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  affiliateSystem: typeof affiliateSystem;
  auth: typeof auth;
  categories: typeof categories;
  commissions: typeof commissions;
  community: typeof community;
  favorites: typeof favorites;
  files: typeof files;
  follows: typeof follows;
  "functions/mutations/accountChangeRequests": typeof functions_mutations_accountChangeRequests;
  "functions/mutations/activityTracking": typeof functions_mutations_activityTracking;
  "functions/mutations/adminUsers": typeof functions_mutations_adminUsers;
  "functions/mutations/blog": typeof functions_mutations_blog;
  "functions/mutations/businessSales": typeof functions_mutations_businessSales;
  "functions/mutations/conversations": typeof functions_mutations_conversations;
  "functions/mutations/coupons": typeof functions_mutations_coupons;
  "functions/mutations/invoices": typeof functions_mutations_invoices;
  "functions/mutations/newsletter": typeof functions_mutations_newsletter;
  "functions/mutations/notifications": typeof functions_mutations_notifications;
  "functions/mutations/reviews": typeof functions_mutations_reviews;
  "functions/mutations/sellerCoupons": typeof functions_mutations_sellerCoupons;
  "functions/mutations/sellerUsers": typeof functions_mutations_sellerUsers;
  "functions/mutations/support": typeof functions_mutations_support;
  "functions/mutations/updateProductLocations": typeof functions_mutations_updateProductLocations;
  "functions/queries/accountChangeRequests": typeof functions_queries_accountChangeRequests;
  "functions/queries/activityTracking": typeof functions_queries_activityTracking;
  "functions/queries/adminCoupons": typeof functions_queries_adminCoupons;
  "functions/queries/adminUsers": typeof functions_queries_adminUsers;
  "functions/queries/blog": typeof functions_queries_blog;
  "functions/queries/businessSales": typeof functions_queries_businessSales;
  "functions/queries/coupons": typeof functions_queries_coupons;
  "functions/queries/invoices": typeof functions_queries_invoices;
  "functions/queries/newsletter": typeof functions_queries_newsletter;
  "functions/queries/notifications": typeof functions_queries_notifications;
  "functions/queries/reviews": typeof functions_queries_reviews;
  "functions/queries/search": typeof functions_queries_search;
  "functions/queries/sellerCoupons": typeof functions_queries_sellerCoupons;
  "functions/queries/sellerUsers": typeof functions_queries_sellerUsers;
  "functions/queries/stats": typeof functions_queries_stats;
  "functions/queries/support": typeof functions_queries_support;
  initializeFBGroupCoupon: typeof initializeFBGroupCoupon;
  initializeTestReviews: typeof initializeTestReviews;
  messaging: typeof messaging;
  netVendeur: typeof netVendeur;
  orderReviews: typeof orderReviews;
  orders: typeof orders;
  payments: typeof payments;
  products: typeof products;
  sellerPosts: typeof sellerPosts;
  updateProductLocations: typeof updateProductLocations;
  updateSellerCities: typeof updateSellerCities;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
