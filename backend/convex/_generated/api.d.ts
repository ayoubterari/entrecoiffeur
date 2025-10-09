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
import type * as commissions from "../commissions.js";
import type * as community from "../community.js";
import type * as favorites from "../favorites.js";
import type * as files from "../files.js";
import type * as follows from "../follows.js";
import type * as functions_mutations_blog from "../functions/mutations/blog.js";
import type * as functions_mutations_coupons from "../functions/mutations/coupons.js";
import type * as functions_queries_blog from "../functions/queries/blog.js";
import type * as functions_queries_coupons from "../functions/queries/coupons.js";
import type * as functions_queries_search from "../functions/queries/search.js";
import type * as initializeFBGroupCoupon from "../initializeFBGroupCoupon.js";
import type * as initializeTestReviews from "../initializeTestReviews.js";
import type * as messaging from "../messaging.js";
import type * as netVendeur from "../netVendeur.js";
import type * as orderReviews from "../orderReviews.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as sellerPosts from "../sellerPosts.js";

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
  commissions: typeof commissions;
  community: typeof community;
  favorites: typeof favorites;
  files: typeof files;
  follows: typeof follows;
  "functions/mutations/blog": typeof functions_mutations_blog;
  "functions/mutations/coupons": typeof functions_mutations_coupons;
  "functions/queries/blog": typeof functions_queries_blog;
  "functions/queries/coupons": typeof functions_queries_coupons;
  "functions/queries/search": typeof functions_queries_search;
  initializeFBGroupCoupon: typeof initializeFBGroupCoupon;
  initializeTestReviews: typeof initializeTestReviews;
  messaging: typeof messaging;
  netVendeur: typeof netVendeur;
  orderReviews: typeof orderReviews;
  orders: typeof orders;
  payments: typeof payments;
  products: typeof products;
  sellerPosts: typeof sellerPosts;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
