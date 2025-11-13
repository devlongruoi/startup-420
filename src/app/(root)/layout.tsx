import Navbar from "@/components/Navbar";

/**
 * Wraps page content with the site navbar and applies the base font styling.
 *
 * Renders a main container using the `font-work-sans` class, places the Navbar at the top,
 * and then renders the provided `children` as the page content.
 *
 * @param children - The content to render below the Navbar (typically the page or route content)
 * @returns The layout element containing the Navbar followed by `children`
 */
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="font-work-sans">
            <Navbar />

            {children}
        </main>
    )
}