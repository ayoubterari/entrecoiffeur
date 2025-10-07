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
import type * as auth from "../auth.js";
import type * as commissions from "../commissions.js";
import type * as community from "../community.js";
import type * as favorites from "../favorites.js";
import type * as files from "../files.js";
import type * as functions_mutations_blog from "../functions/mutations/blog.js";
import type * as functions_queries_blog from "../functions/queries/blog.js";
import type * as netVendeur from "../netVendeur.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  commissions: typeof commissions;
  community: typeof community;
  favorites: typeof favorites;
  files: typeof files;
  "functions/mutations/blog": typeof functions_mutations_blog;
  "functions/queries/blog": typeof functions_queries_blog;
  netVendeur: typeof netVendeur;
  orders: typeof orders;
  payments: typeof payments;
  products: typeof products;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
