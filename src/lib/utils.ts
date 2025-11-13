import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
 * Deep-clone plain JSON-serializable data. Useful in server actions to strip
 * non-serializable properties (e.g., proxies) before returning to the client.
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