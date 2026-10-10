import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
    /** Optional left-side slot (e.g. a back button). */
    left?: React.ReactNode;
    /** Optional right-side slot (e.g. a match count badge). */
    right?: React.ReactNode;
    /** Override the centre title. Defaults to the NearbyPals logo link. */
    title?: React.ReactNode;
    /** Additional class names for the <header> element. */
    className?: string;
    /** If true, renders a plain non-sticky header (onboarding pages). */
    plain?: boolean;
}

/**
 * Shared top app bar used across every page.
 *
 * - The NearbyPals logo is always a link:
 *     - Authenticated + hasProfile  → /discovery
 *     - Authenticated, no profile   → /onboarding
 *     - Not authenticated           → /
 * - Sticky + backdrop-blur on main app pages; plain on onboarding/auth pages.
 */
const AppHeader = ({ left, right, title, className, plain = false }: AppHeaderProps) => {
    const { isAuthenticated, hasProfile } = useAuth();

    const logoHref = !isAuthenticated
        ? "/"
        : hasProfile
          ? "/discovery"
          : "/onboarding";

    const logo = (
        <Link
            to={logoHref}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
            <div className="bg-primary-gradient shadow-soft flex h-8 w-8 items-center justify-center rounded-xl shrink-0">
                <span className="text-base">🏘️</span>
            </div>
            <span className="text-xl font-bold text-foreground">NearbyPals</span>
        </Link>
    );

    return (
        <header
            className={cn(
                "z-10 p-4",
                plain
                    ? "bg-background border-b border-border"
                    : "sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border",
                className,
            )}
        >
            <div className="max-w-lg mx-auto flex items-center gap-3">
                {/* Left slot (back button etc.) */}
                {left && <div className="shrink-0">{left}</div>}

                {/* Centre: title override, or NearbyPals logo */}
                <div className="flex-1 min-w-0">
                    {title ?? logo}
                </div>

                {/* Right slot (badges, icon buttons etc.) */}
                {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
            </div>
        </header>
    );
};

export default AppHeader;
