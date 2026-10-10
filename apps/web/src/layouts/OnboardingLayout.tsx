import { Outlet, Navigate } from "react-router-dom";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Layout wrapper that provides OnboardingContext to all onboarding routes.
 * Used as a parent route in the router so the context persists across
 * the 4 onboarding steps.
 *
 * Redirect guards:
 * - Not authenticated → send to /dev-login
 * - Already onboarded → send to /discovery
 */
const OnboardingLayout = () => {
    const { isLoading, isAuthenticated, hasProfile } = useAuth();

    // Wait for auth to finish initializing
    if (isLoading) {
        return null;
    }

    // Not logged in — must authenticate first
    if (!isAuthenticated) {
        return <Navigate to="/dev-login" replace />;
    }

    // Still resolving profile status after login — wait briefly
    if (hasProfile === null) {
        return null;
    }

    // Already onboarded — redirect away
    if (hasProfile) {
        return <Navigate to="/discovery" replace />;
    }

    return (
        <OnboardingProvider>
            <Outlet />
        </OnboardingProvider>
    );
};

export default OnboardingLayout;
