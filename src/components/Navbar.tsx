import Link from "next/link";
import Image from "next/image";
import { BadgePlus, LogOut } from "lucide-react";
import { auth, signOut, signIn } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = async () => {
  type SessionShape = {
    id?: string;
    user?: { image?: string | null; name?: string | null };
  } | null;
  const session = (await auth()) as SessionShape;

  return (
    <header className="px-5 py-3 bg-white shadow-sm font-work-sans">
      <nav className="flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={144} height={30} />
        </Link>

        <div className="flex items-center gap-5 text-black">
          {session?.user ? (
            <>
              <Link href="/startup/create" aria-label="Create startup">
                {/* Visible label on larger screens */}
                <span className="max-sm:hidden">Create</span>
                {/* Hidden accessible label for small screens when text is hidden */}
                <span className="sr-only sm:hidden">Create startup</span>
                <BadgePlus aria-hidden="true" className="size-6 sm:hidden" />
              </Link>

              <form
                action={async () => {
                  "use server";

                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" aria-label="Logout">
                  {/* Visible label on larger screens */}
                  <span className="max-sm:hidden">Logout</span>
                  {/* Hidden accessible label for small screens */}
                  <span className="sr-only sm:hidden">Logout</span>
                  <LogOut aria-hidden="true" className="size-6 sm:hidden text-red-500" />
                </button>
              </form>

              {session?.id ? (
                <Link href={`/user/${session.id}`}>
                  <Avatar className="size-10">
                    <AvatarImage
                      src={session.user?.image || ""}
                      alt={session.user?.name || "User avatar"}
                    />
                    <AvatarFallback>{(session.user?.name || "U").slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Avatar className="size-10 opacity-60" aria-hidden>
                  <AvatarImage src={session.user?.image || ""} alt="" />
                  <AvatarFallback>--</AvatarFallback>
                </Avatar>
              )}
            </>
          ) : (
            <form
              action={async () => {
                "use server";

                await signIn("github");
              }}
            >
              <button type="submit">Login</button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;