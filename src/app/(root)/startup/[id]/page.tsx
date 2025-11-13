import ReactMarkdown from 'react-markdown';
import Link from "next/link";
import remarkGfm from 'remark-gfm';
import { notFound } from "next/navigation";
import Image from 'next/image';
import rehypeSanitize from 'rehype-sanitize';
import { Suspense, type AnchorHTMLAttributes } from "react";
import { client } from "@/sanity/lib/client";
import {
  PLAYLIST_BY_SLUG_QUERY,
  STARTUP_BY_ID_QUERY,
} from "@/sanity/lib/queries";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/components/View";
import StartupCard, { type StartupTypeCard } from "@/components/StartupCard";

export const experimental_ppr = true;

// Stable server components for ReactMarkdown renderers
function MarkdownLink(props: Readonly<AnchorHTMLAttributes<HTMLAnchorElement>>) {
  const { children, ...rest } = props;
  return (
    <a {...rest} target="_blank" rel="noopener noreferrer">
      {children ?? rest.href}
    </a>
  );
}


const Page = async ({ params }: Readonly<{ params: Promise<{ id: string }> }>) => {
  const { id } = await params;

  const [post, playlist] = await Promise.all([
    client.fetch(STARTUP_BY_ID_QUERY, { id }),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, { slug: "editor-picks-new" }),
  ]);

  type PlaylistShape = { select?: StartupTypeCard[] } | null;
  const editorPosts: StartupTypeCard[] = (playlist as PlaylistShape)?.select ?? [];

  if (!post) return notFound();

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <p className="tag">{formatDate(post?._createdAt)}</p>

        <h1 className="heading">{post.title}</h1>
        <p className="sub-heading !max-w-5xl">{post.description}</p>
      </section>

      <section className="section_container">
        {/* Use next/image with descriptive alt */}
        <Image
          src={post.image || '/placeholder.png'}
          alt={post?.title ? `Thumbnail for ${post.title}` : 'Post thumbnail'}
          width={1200}
          height={630}
          className="w-full h-auto rounded-xl object-cover"
          unoptimized
        />

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link
              href={`/user/${post.author?._id}`}
              className="flex gap-2 items-center mb-3"
            >
              {post.author?.image && (
                <Image
                  src={post.author.image}
                  alt={post.author?.name || 'User avatar'}
                  width={64}
                  height={64}
                  className="rounded-full drop-shadow-lg"
                  unoptimized
                />
              )}

              <div>
                <p className="text-20-medium">{post.author.name}</p>
                <p className="text-16-medium !text-black-300">
                  @{post.author.username}
                </p>
              </div>
            </Link>

            <p className="category-tag">{post.category}</p>
          </div>

          <h3 className="text-30-bold">Pitch Details</h3>
          {post?.pitch ? (
            <article className="prose max-w-4xl font-work-sans break-all">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{ a: MarkdownLink }}
              >
                {post.pitch}
              </ReactMarkdown>
            </article>
          ) : (
            <p className="no-result">No details provided</p>
          )}
        </div>

        <hr className="divider my-12" />

        {editorPosts.length > 0 && (
          <div className="max-w-4xl mx-auto mt-4 space-y-6">
            <p className="text-30-semibold">Editor Picks</p>

            <ul className="card_grid-sm">
              {editorPosts.map((post: StartupTypeCard) => (
                <StartupCard key={post._id} post={post} />
              ))}
            </ul>
          </div>
        )}

        <Suspense fallback={<Skeleton className="view_skeleton" />}>
          <View id={id} />
        </Suspense>
      </section>
    </>
  );
};

export default Page;