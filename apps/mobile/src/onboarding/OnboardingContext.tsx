import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { useAuth } from '@/auth/AuthContext';
import { replaceAvailability, replaceInterests, updateProfile } from '@/lib/profile-api';

export type OnboardingRole = 'parent' | 'pet' | 'both';

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
  setInterestIds: (ids: string[]) => void;
  setAvailabilityEntries: (entries: { availabilityId: string; dayOfWeek: string }[]) => void;
  /** Throws on validation or API failure; caller shows the error. */
  submitOnboarding: () => Promise<void>;
  isSubmitting: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { markProfileComplete } = useAuth();

  const [state, setState] = useState<OnboardingState>({
    neighborhoodId: null,
    neighborhoodName: null,
    role: null,
    displayName: '',
    bio: '',
    interestIds: [],
    availability: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setNeighborhood = useCallback(
    (id: string, name: string) => update({ neighborhoodId: id, neighborhoodName: name }),
    [update],
  );
  const setRole = useCallback((role: OnboardingRole) => update({ role }), [update]);
  const setDisplayName = useCallback((displayName: string) => update({ displayName }), [update]);
  const setInterestIds = useCallback((interestIds: string[]) => update({ interestIds }), [update]);
  const setAvailabilityEntries = useCallback(
    (availability: { availabilityId: string; dayOfWeek: string }[]) => update({ availability }),
    [update],
  );

  const submitOnboarding = useCallback(async () => {
    if (!state.neighborhoodId || !state.role || !state.displayName.trim()) {
      throw new Error('Please complete all onboarding steps.');
    }
    if (state.interestIds.length === 0) {
      throw new Error('Please pick at least one interest.');
    }
    if (state.availability.length === 0) {
      throw new Error('Please select at least one day and time.');
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        displayName: state.displayName.trim(),
        role: state.role,
        neighborhoodId: state.neighborhoodId,
        bio: state.bio.trim() || undefined,
      });
      await replaceInterests(state.interestIds);
      await replaceAvailability(state.availability);
      markProfileComplete();
    } finally {
      setIsSubmitting(false);
    }
  }, [state, markProfileComplete]);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setNeighborhood,
        setRole,
        setDisplayName,
        setInterestIds,
        setAvailabilityEntries,
        submitOnboarding,
        isSubmitting,
      }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
