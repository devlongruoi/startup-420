import StartupCard, { type StartupTypeCard } from "@/components/StartupCard";
import { client } from "@/sanity/lib/client";
import { STARTUPS_BY_AUTHOR_QUERY } from "@/sanity/lib/queries";

const UserStartups = async ({ id }: { id: string }) => {
  // Guard against missing id (e.g., session race condition)
  if (!id) {
    return (
      <p className="text-sm text-muted-foreground">
        No user id available.
      </p>
    );
  }

  let startups: StartupTypeCard[] = [];
  try {
    startups = await client.fetch(STARTUPS_BY_AUTHOR_QUERY, { id });
  } catch (error) {
    // Structured contextual logging; avoid crashing the page
    console.error('[UserStartups] Failed fetching startups by author', {
      authorId: id,
      error,
    });
    return (
      <p className="text-sm text-muted-foreground">
        Your startups are temporarily unavailable.
      </p>
    );
  }

  if (!Array.isArray(startups) || startups.length === 0) {
    return <p className="no-result">No posts yet</p>;
  }

  return startups.map((startup: StartupTypeCard) => (
    <StartupCard key={startup._id} post={startup} />
  ));
};
export default UserStartups;