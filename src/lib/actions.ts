"use server";

import slugify from "slugify";
import { auth } from "@/auth";
import { parseServerActionResponse } from "@/lib/utils";
import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";
import { serverFormSchema } from "@/lib/validation";

type ActionState = {
  error: string;
  status: "INITIAL" | "SUCCESS" | "ERROR";
  // Optional structured validation errors for actionable feedback
  errors?: Record<string, string[]> | string;
};
export type CreatePitchResult = ActionState & { _id?: string };

const aggregateZodIssues = (issues: Array<{ path?: PropertyKey[]; message: string }>): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const first = issue.path?.[0];
    const key = typeof first === "string" || typeof first === "number" ? String(first) : "form";
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
};

const summarizeFieldErrors = (fieldErrors: Record<string, string[]>): string => {
  const messages = Object.entries(fieldErrors).flatMap(([field, msgs]) => (msgs ?? []).map((m) => `${field}: ${m}`));
  return messages.length ? `Validation failed: ${messages.join("; ")}` : "Validation failed";
};

export const createPitch = async (
  _state: ActionState,
  form: FormData,
  pitch: string
): Promise<CreatePitchResult> => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const authorId = (session as { id?: string } | null)?.id;
  if (!authorId) {
    return parseServerActionResponse({
      error: "Unable to resolve author for this session",
      status: "ERROR",
    });
  }

  // Normalize and extract values from FormData
  const titleEntry = form.get("title");
  const descEntry = form.get("description");
  const categoryEntry = form.get("category");
  const linkEntry = form.get("link");

  const title = typeof titleEntry === "string" ? titleEntry : "";
  const description = typeof descEntry === "string" ? descEntry : "";
  const category = typeof categoryEntry === "string" ? categoryEntry : "";
  const link = typeof linkEntry === "string" ? linkEntry : "";

  // Server-side validation (includes image content-type check)
  const validation = await serverFormSchema.safeParseAsync({
    title,
    description,
    category,
    link,
    pitch,
  });

  if (!validation.success) {
    const fieldErrors = aggregateZodIssues(validation.error.issues);
    const summary = summarizeFieldErrors(fieldErrors);

    return parseServerActionResponse({
      error: summary,
      status: "ERROR",
      errors: fieldErrors,
    });
  }

  // Generate a URL-safe slug and ensure uniqueness
  const baseSlug = slugify(title || "untitled", { lower: true, strict: true });
  let slug = baseSlug;
  try {
    const existingSlugs: string[] = await client.fetch(
      `*[_type == "startup" && defined(slug.current) && slug.current match $prefix + "*"]{ "s": slug.current }[].s`,
      { prefix: baseSlug }
    );

    if (existingSlugs.includes(slug)) {
      let i = 1;
      while (existingSlugs.includes(`${baseSlug}-${i}`)) i += 1;
      slug = `${baseSlug}-${i}`;
    }
  } catch (error) {
    // Surface the failure and avoid silent duplicates
    console.error('[createPitch] Slug uniqueness check failed', {
      baseSlug,
      error,
    });
    // Degraded-mode deterministic fallback to minimize collision risk
    // Append a millisecond timestamp to the base slug
    slug = `${baseSlug}-${Date.now()}`;
  }

  try {
    const startup = {
      title,
      description,
      category,
      image: link,
      slug: {
        _type: "slug",
        current: slug,
      },
      author: {
        _type: "reference",
        _ref: authorId,
      },
      pitch,
    };

    const result = await writeClient.create({ _type: "startup", ...startup });

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    } as CreatePitchResult);
  } catch (error) {
    console.error('[createPitch] Failed to create startup', { error });

    return parseServerActionResponse({
      error: "Failed to create startup",
      status: "ERROR",
    } as CreatePitchResult);
  }
};
