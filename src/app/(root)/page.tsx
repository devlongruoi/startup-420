import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import StartupCard, { type StartupTypeCard } from "@/components/StartupCard";
import { STARTUPS_QUERY, STARTUPS_SEARCH_QUERY, PLAYLIST_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";

/**
 * Render the home page showing a search form, startup listings, and an optional featured playlist.
 *
 * When a non-empty `query` is provided in `searchParams`, the component fetches and displays search results.
 * When no query is provided, it fetches all startups and additionally retrieves a featured playlist (slug from
 * NEXT_PUBLIC_FEATURED_PLAYLIST_SLUG or `"trending"`) to showcase curated items.
 *
 * @param searchParams - A promise that resolves to an object with an optional `query` string used to filter startups.
 * @returns The page's JSX including the hero/search section, an optional featured playlist block, a grid of startup cards
 *          (or a "No startups found" message), and a SanityLive component.
 */
export default async function Home({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ query?: string }>;
}>) {
  const { query } = await searchParams;
  const trimmed = query?.trim();
  const isSearching = Boolean(trimmed);

  const { data: posts } = await sanityFetch({
    query: isSearching ? STARTUPS_SEARCH_QUERY : STARTUPS_QUERY,
    params: isSearching ? { search: `${trimmed}*` } : {},
  });

  // When not searching, also fetch a featured playlist to showcase curated items
  let featured: { title?: string; slug?: { current?: string }; select?: StartupTypeCard[] } | null = null;
  if (!isSearching) {
    const featuredSlug = process.env.NEXT_PUBLIC_FEATURED_PLAYLIST_SLUG || "trending";
    const { data } = await sanityFetch({
      query: PLAYLIST_BY_SLUG_QUERY,
      params: { slug: featuredSlug },
    });
    featured = data ?? null;
  }

  return (
    <>
      <section className="pink_container">
        <h1 className="heading">
          Pitch Your Startup, <br />
          Connect With Entrepreneurs
        </h1>

        <p className="sub-heading !max-w-3xl">
          Submit Ideas, Vote on Pitches, and Get Noticed in Virtual
          Competitions.
        </p>

        <SearchForm query={query} />
      </section>

      <section className="section_container space-y-14">
        {!isSearching && featured?.select?.length ? (
          <div className="space-y-8">
            <div className="flex items-baseline justify-between">
              <p className="text-30-semibold">{featured.title}</p>
              {featured.slug?.current ? (
                <Link className="text-16-medium underline" href={`/playlist/${featured.slug.current}`}>
                  Xem tất cả
                </Link>
              ) : null}
            </div>
            <ul className="card_grid">
              {featured.select.slice(0, 6).map((post: StartupTypeCard) => (
                <StartupCard key={post._id} post={post} />
              ))}
            </ul>
            <hr className="divider" />
          </div>
        ) : null}

        <p className="text-30-semibold">
          {isSearching ? `Search results for "${trimmed}"` : "All Startups"}
        </p>

        {posts?.length > 0 ? (
          <ul className="card_grid">
            {posts.map((post: StartupTypeCard) => (
              <StartupCard key={post?._id} post={post} />
            ))}
          </ul>
        ) : (
          <p className="no-result">No startups found</p>
        )}
      </section>

      <SanityLive />
    </>
  );
}