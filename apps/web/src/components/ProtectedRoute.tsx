import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** If true, also requires a completed profile (redirects to /onboarding otherwise). */
    requireProfile?: boolean;
}

const LoadingScreen = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
    </div>
);

const ProtectedRoute = ({ children, requireProfile = true }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, hasProfile } = useAuth();
    const location = useLocation();

    if (isLoading || (isAuthenticated && hasProfile === null)) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/dev-login" state={{ from: location }} replace />;
    }

    if (requireProfile && hasProfile === false) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
