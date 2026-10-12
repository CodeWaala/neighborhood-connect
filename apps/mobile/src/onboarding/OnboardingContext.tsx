import {
  replaceAvailability,
  replaceInterests,
  updateProfile,
  type Neighborhood,
  type ProfileRole,
} from '@neighborhood-connect/api-client';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/auth/AuthContext';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface OnboardingState {
  displayName: string;
  neighborhood: Neighborhood | null;
  role: ProfileRole | null;
  interestIds: string[];
  /** Days (`mon`…`sun`) and time-window IDs; saved as every day × window pair. */
  days: string[];
  windowIds: string[];
}

interface OnboardingContextValue extends OnboardingState {
  update: (patch: Partial<OnboardingState>) => void;
  /** Creates the profile, interests and availability, then hands off to the tabs. */
  submit: () => Promise<void>;
  isSubmitting: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const INITIAL_STATE: OnboardingState = {
  displayName: '',
  neighborhood: null,
  role: null,
  interestIds: [],
  days: [],
  windowIds: [],
};

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { markProfileComplete } = useAuth();
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const submit = useCallback(async () => {
    const { displayName, neighborhood, role, interestIds, days, windowIds } = state;
    if (!displayName.trim() || !neighborhood || !role) {
      throw new Error('Please complete all onboarding steps.');
    }
    if (interestIds.length === 0) {
      throw new Error('Please pick at least one interest.');
    }
    if (days.length === 0 || windowIds.length === 0) {
      throw new Error('Please select at least one day and time.');
    }

    setIsSubmitting(true);
    try {
      // Same calls, in the same order, as the web onboarding
      await updateProfile({ displayName: displayName.trim(), role, neighborhoodId: neighborhood.id });
      await replaceInterests(interestIds);
      await replaceAvailability(
        days.flatMap((dayOfWeek) => windowIds.map((availabilityId) => ({ availabilityId, dayOfWeek }))),
      );
      // The routing guard now moves the user on to the tabs
      markProfileComplete();
    } finally {
      setIsSubmitting(false);
    }
  }, [state, markProfileComplete]);

  const value = useMemo<OnboardingContextValue>(
    () => ({ ...state, update, submit, isSubmitting }),
    [state, update, submit, isSubmitting],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
