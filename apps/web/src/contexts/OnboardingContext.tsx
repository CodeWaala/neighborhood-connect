import {
    createContext,
    useContext,
    useCallback,
    useState,
    type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile, replaceInterests, replaceAvailability } from "@/api/profile";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type OnboardingRole = "parent" | "pet" | "both";

export interface OnboardingState {
    neighborhoodId: string | null;
    neighborhoodName: string | null;
    role: OnboardingRole | null;
    displayName: string;
    bio: string;
    interestIds: string[];
    availability: { availabilityId: string; dayOfWeek: string }[];
}

interface OnboardingContextValue extends OnboardingState {
    setNeighborhood: (id: string, name: string) => void;
    setRole: (role: OnboardingRole) => void;
    setDisplayName: (name: string) => void;
    setBio: (bio: string) => void;
    setInterestIds: (ids: string[]) => void;
    setAvailabilityEntries: (entries: { availabilityId: string; dayOfWeek: string }[]) => void;
    submitOnboarding: () => Promise<void>;
    isSubmitting: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// ──────────────────────────────────────────────
// Session storage helpers (survive back-button navigation)
// ──────────────────────────────────────────────

const STORAGE_KEY = "nc_onboarding";

function loadFromSession(): Partial<OnboardingState> {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveToSession(state: OnboardingState) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearSession() {
    sessionStorage.removeItem(STORAGE_KEY);
}

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const saved = loadFromSession();
    const { toast } = useToast();
    const { markProfileComplete } = useAuth();

    const [state, setState] = useState<OnboardingState>({
        neighborhoodId: saved.neighborhoodId ?? null,
        neighborhoodName: saved.neighborhoodName ?? null,
        role: saved.role ?? null,
        displayName: saved.displayName ?? "",
        bio: saved.bio ?? "",
        interestIds: saved.interestIds ?? [],
        availability: saved.availability ?? [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper to update state + persist to sessionStorage
    const update = useCallback((patch: Partial<OnboardingState>) => {
        setState((prev) => {
            const next = { ...prev, ...patch };
            saveToSession(next);
            return next;
        });
    }, []);

    const setNeighborhood = useCallback((id: string, name: string) => {
        update({ neighborhoodId: id, neighborhoodName: name });
    }, [update]);

    const setRole = useCallback((role: OnboardingRole) => {
        update({ role });
    }, [update]);

    const setDisplayName = useCallback((displayName: string) => {
        update({ displayName });
    }, [update]);

    const setBio = useCallback((bio: string) => {
        update({ bio });
    }, [update]);

    const setInterestIds = useCallback((interestIds: string[]) => {
        update({ interestIds });
    }, [update]);

    const setAvailabilityEntries = useCallback(
        (availability: { availabilityId: string; dayOfWeek: string }[]) => {
            update({ availability });
        },
        [update],
    );

    const submitOnboarding = useCallback(async () => {
        // Validate
        if (!state.neighborhoodId || !state.role || !state.displayName.trim()) {
            toast({
                title: "Missing information",
                description: "Please complete all onboarding steps.",
                variant: "destructive",
            });
            return;
        }

        if (state.interestIds.length === 0) {
            toast({
                title: "Select interests",
                description: "Please pick at least one interest.",
                variant: "destructive",
            });
            return;
        }

        if (state.availability.length === 0) {
            toast({
                title: "Set availability",
                description: "Please select at least one day and time.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create profile
            await updateProfile({
                displayName: state.displayName.trim(),
                role: state.role,
                neighborhoodId: state.neighborhoodId,
                bio: state.bio.trim() || undefined,
            });

            // 2. Set interests
            await replaceInterests(state.interestIds);

            // 3. Set availability
            await replaceAvailability(state.availability);

            // Clear session storage
            clearSession();

            // Update AuthContext so ProtectedRoute knows the profile now exists
            markProfileComplete();

            toast({
                title: "You're all set! 🎉",
                description: "Let's find some neighbors for you.",
            });
        } catch (error) {
            toast({
                title: "Something went wrong",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
            throw error; // Re-throw so caller knows it failed
        } finally {
            setIsSubmitting(false);
        }
    }, [state, toast]);

    return (
        <OnboardingContext.Provider
            value={{
                ...state,
                setNeighborhood,
                setRole,
                setDisplayName,
                setBio,
                setInterestIds,
                setAvailabilityEntries,
                submitOnboarding,
                isSubmitting,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useOnboarding(): OnboardingContextValue {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
}
