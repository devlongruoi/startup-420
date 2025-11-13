import { z } from "zod";

// Client-side schema: keep it fast and CORS-safe (no network requests here)
export const clientFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be at most 500 characters"),
  category: z
    .string()
    .trim()
    .min(3, "Category must be at least 3 characters")
    .max(20, "Category must be at most 20 characters"),
  link: z
    .string()
    .trim()
    .refine((value) => {
      try {
        const u = new URL(value);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, { message: "Please enter a valid http(s) URL" }),
  pitch: z.string().trim().min(10, "Pitch must be at least 10 characters"),
});

// Server-side schema: includes network-based validation for the image URL
export const serverFormSchema = clientFormSchema.superRefine(async (data, ctx) => {
  try {
    const res = await fetch(data.link, { method: "HEAD" });
    const contentType = res.headers.get("content-type");
    const url = new URL(data.link);
    const imageExt = /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(url.pathname);
    const looksLikeImage = Boolean(contentType?.startsWith("image/")) || imageExt;

    if (!res.ok) {
      ctx.addIssue({
        code: "custom",
        path: ["link"],
        message: `Image URL not reachable (status ${res.status})`,
      });
      return;
    }

    if (!looksLikeImage) {
      ctx.addIssue({
        code: "custom",
        path: ["link"],
        message: "URL must point to an image (content-type image/* or common image extension)",
      });
    }
  } catch {
    ctx.addIssue({
      code: "custom",
      path: ["link"],
      message: "Unable to reach the image URL",
    });
  }
});