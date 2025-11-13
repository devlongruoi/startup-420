import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

/**
 * Combines multiple class value inputs into a single class string while resolving Tailwind CSS class conflicts.
 *
 * @param inputs - Class values to combine (strings, arrays, objects, etc.)
 * @returns A string containing merged class names with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date into a localized string using long month, numeric day, and numeric year.
 *
 * @param date - A Date instance, timestamp, or date string to format
 * @param locale - BCP 47 language tag for localization (defaults to "vi-VN")
 * @returns The formatted date (e.g., "January 1, 2020") or an empty string if the input is an invalid date
 */
export function formatDate(date: string | number | Date, locale = "vi-VN"): string {
  const d = date instanceof Date ? date : new Date(date);
  // Gracefully handle invalid dates
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Create a deep clone of a JSON-serializable value, removing non-serializable parts.
 *
 * @param response - The JSON-serializable value to clone (e.g., plain objects/arrays, primitives)
 * @returns A deep-cloned version of `response` containing only JSON-serializable data
 */
export function parseServerActionResponse<T>(response: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(response);
  }
  const clone = (val: unknown): unknown => {
    if (val === null || typeof val !== "object") return val;
    if (Array.isArray(val)) return val.map(clone);
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      out[k] = clone(v);
    }
    return out;
  };
  return clone(response) as T;
}