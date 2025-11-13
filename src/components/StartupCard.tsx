import Link from "next/link";
import Image from "next/image";
import { EyeIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Author, Startup } from "@/sanity/sanity.types";
import { Skeleton } from "@/components/ui/skeleton";

export type StartupTypeCard = Omit<Startup, "author"> & { author?: Author };

const StartupCard = ({ post }: { post: StartupTypeCard }) => {
  const {
    _createdAt,
    views,
    author,
    title,
    category,
    _id,
    image,
    description,
  } = post;

  return (
    <li className="startup-card group">
      <div className="flex-between">
        <p className="startup-card_date">{formatDate(_createdAt)}</p>
        <div className="flex gap-1.5">
          <EyeIcon className="size-6 text-primary" />
          <span className="text-16-medium">{typeof views === "number" ? views : 0}</span>
        </div>
      </div>

      <div className="flex-between mt-5 gap-5">
        <div className="flex-1">  
          {author?._id ? (  
            <Link href={`/user/${author._id}`}>  
             <p className="text-16-medium line-clamp-1">{author.name}</p>  
            </Link>  
          ) : (  
            <p className="text-16-medium line-clamp-1 text-black-300">Unknown author</p>  
          )}  
        </div>
        <Link href={`/user/${author?._id}`}>
          <Image
            src={author?.image || "/placeholder.png"}
            alt={author?.name || "User avatar"}
            width={48}
            height={48}
            className="rounded-full"
            unoptimized
          />
        </Link>
      </div>

      <Link href={`/startup/${_id}`}>
        <p className="startup-card_desc">{description}</p>

        <Image
          src={image || "/placeholder.png"}
          alt={title ? `Thumbnail for ${title}` : "Startup thumbnail"}
          width={1200}
          height={800}
          className="startup-card_img"
          sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          unoptimized
        />
      </Link>

      <div className="flex-between gap-3 mt-5">
        <Link href={`/?query=${category?.toLowerCase()}`}>
          <p className="text-16-medium">{category}</p>
        </Link>
        <Button className="startup-card_btn" asChild>
          <Link href={`/startup/${_id}`}>Details</Link>
        </Button>
      </div>
    </li>
  );
};

export const StartupCardSkeleton = () => (
  <>
    {[0, 1, 2, 3, 4].map((index: number) => (
      <li key={cn("skeleton", index)}>
        <Skeleton className="startup-card_skeleton" />
      </li>
    ))}
  </>
);

export default StartupCard;