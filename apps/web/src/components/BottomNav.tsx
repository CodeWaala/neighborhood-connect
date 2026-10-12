import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Compass, Users, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { listConnections } from "@neighborhood-connect/api-client";

// Routes where the bottom nav should NOT appear
const HIDDEN_ROUTES = ["/", "/dev-login", "/onboarding", "/connection-sent"];

function shouldHideNav(pathname: string): boolean {
    // Hide on exact matches
    if (HIDDEN_ROUTES.includes(pathname)) return true;
    // Hide on onboarding sub-routes
    if (pathname.startsWith("/onboarding/")) return true;
    // Hide on messages pages (full-screen chat)
    if (pathname.startsWith("/messages/")) return true;
    // Hide on connection-sent
    if (pathname.startsWith("/connection-sent/")) return true;
    return false;
}

const tabs = [
    { id: "discover", label: "Discover", icon: Compass, path: "/discovery" },
    { id: "connections", label: "Connections", icon: Users, path: "/connections" },
    { id: "profile", label: "Profile", icon: UserCircle, path: "/profile/edit" },
] as const;

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, userId } = useAuth();

    // Fetch connections to show pending count badge
    const { data: connections } = useQuery({
        queryKey: ["connections"],
        queryFn: listConnections,
        enabled: isAuthenticated,
        staleTime: 30_000,
    });

    if (!isAuthenticated || shouldHideNav(location.pathname)) {
        return null;
    }

    const pendingCount = connections?.filter(
        (c) => c.status === "pending" && c.recipientId === userId,
    ).length ?? 0;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border animate-fade-in-up">
            <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive =
                        location.pathname === tab.path ||
                        (tab.id === "discover" && location.pathname.startsWith("/profile/") && !location.pathname.startsWith("/profile/edit"));

                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 relative",
                                "hover:bg-primary/5",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground",
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                                {tab.id === "connections" && pendingCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
                                        {pendingCount > 9 ? "9+" : pendingCount}
                                    </span>
                                )}
                            </div>
                            <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                                {tab.label}
                            </span>
                            {isActive && (
                                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
