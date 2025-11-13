import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
// Use inline shapes for callback params to avoid version-dependent type exports
// (we only need a few fields here, keep shapes minimal and explicit)

import { AUTHOR_BY_GITHUB_ID_QUERY } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";

type NextAuthExports = {
  handlers: Record<"GET" | "POST", (req: Request) => Promise<Response>>;
  auth: (...args: unknown[]) => Promise<Record<string, unknown> | null>;
  signIn: (...args: unknown[]) => Promise<unknown>;
  signOut: (...args: unknown[]) => Promise<unknown>;
};

type NextAuthFactory = (config: unknown) => NextAuthExports;

const nextAuth = (NextAuth as unknown as NextAuthFactory)({
  providers: [GitHub],
  callbacks: {
    async signIn({ user, profile }: { user?: Record<string, unknown> | null; profile?: Record<string, unknown> | null }) {
      try {
        const name = user?.name as string | undefined;
        const email = user?.email as string | undefined;
        const image = user?.image as string | undefined;
        const id = (profile?.id as string) ?? undefined;
        const login = profile?.login as string | undefined;
        const bio = profile?.bio as string | undefined;

        if (!id) return true;

        const existingUser = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id });

        if (!existingUser) {
          await writeClient.create({
            _type: "author",
            id,
            name,
            username: login,
            email,
            image,
            bio: bio || "",
          });
        }

        return true;
      } catch (e) {
        console.error("signIn callback failed", e);
        return false;
      }
    },

  async jwt({ token, account, profile }: { token?: Record<string, unknown> | null; account?: Record<string, unknown> | null; profile?: Record<string, unknown> | null }) {
      if (account && profile) {
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: profile.id });

        if (token && typeof token === "object") {
          return { ...token, id: user?._id } as Record<string, unknown>;
        }
        return { id: user?._id } as Record<string, unknown>;
      }

      return token as Record<string, unknown> | null;
    },

    async session({ session, token }: { session?: Record<string, unknown> | null; token?: Record<string, unknown> | null }) {
      if (session && token && typeof token === "object") {
        const id = (token as { [k: string]: unknown })["id"];
        return { ...session, id } as Record<string, unknown>;
      }
      return session as Record<string, unknown> | null;
    },
  },
});

export const { handlers, auth, signIn, signOut } = nextAuth;
export default nextAuth;