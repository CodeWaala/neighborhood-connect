import * as api from '@neighborhood-connect/api-client';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useAuth } from '@/auth/AuthContext';

import { OnboardingProvider, useOnboarding } from '../OnboardingContext';

jest.mock('@neighborhood-connect/api-client', () => ({
  updateProfile: jest.fn(),
  replaceInterests: jest.fn(),
  replaceAvailability: jest.fn(),
}));
jest.mock('@/auth/AuthContext', () => ({ useAuth: jest.fn() }));

const markProfileComplete = jest.fn();
const calls: string[] = [];

let result: { current: ReturnType<typeof useOnboarding> };
const wrapper = ({ children }: { children: ReactNode }) => <OnboardingProvider>{children}</OnboardingProvider>;

beforeEach(async () => {
  jest.clearAllMocks();
  calls.length = 0;
  (useAuth as jest.Mock).mockReturnValue({ markProfileComplete });
  (api.updateProfile as jest.Mock).mockImplementation(async () => calls.push('profile'));
  (api.replaceInterests as jest.Mock).mockImplementation(async () => calls.push('interests'));
  (api.replaceAvailability as jest.Mock).mockImplementation(async () => calls.push('availability'));
  ({ result } = await renderHook(() => useOnboarding(), { wrapper }));
});

const COMPLETE = {
  displayName: '  Sam ',
  neighborhood: { id: 'hood-1', name: 'Hawthorne', city: 'Portland', region: 'OR', postalCode: '97214' },
  role: 'parent' as const,
  interestIds: ['i1', 'i2'],
  days: ['tue', 'thu'],
  windowIds: ['morning', 'evening'],
};

it('creates the profile, interests and availability in order, then completes', async () => {
  await act(async () => result.current.update(COMPLETE));
  await act(async () => result.current.submit());

  expect(calls).toEqual(['profile', 'interests', 'availability']);
  expect(api.updateProfile).toHaveBeenCalledWith({ displayName: 'Sam', role: 'parent', neighborhoodId: 'hood-1' });
  expect(api.replaceInterests).toHaveBeenCalledWith(['i1', 'i2']);
  // Every day x window pair, as on web
  expect(api.replaceAvailability).toHaveBeenCalledWith([
    { availabilityId: 'morning', dayOfWeek: 'tue' },
    { availabilityId: 'evening', dayOfWeek: 'tue' },
    { availabilityId: 'morning', dayOfWeek: 'thu' },
    { availabilityId: 'evening', dayOfWeek: 'thu' },
  ]);
  expect(markProfileComplete).toHaveBeenCalledTimes(1);
});

it.each([
  ['a name', { displayName: '   ' }, 'Please complete all onboarding steps.'],
  ['a neighborhood', { neighborhood: null }, 'Please complete all onboarding steps.'],
  ['a role', { role: null }, 'Please complete all onboarding steps.'],
  ['an interest', { interestIds: [] }, 'Please pick at least one interest.'],
  ['a day', { days: [] }, 'Please select at least one day and time.'],
  ['a time window', { windowIds: [] }, 'Please select at least one day and time.'],
])('refuses to submit without %s', async (_label, patch, message) => {
  await act(async () => result.current.update({ ...COMPLETE, ...patch }));
  await expect(act(async () => result.current.submit())).rejects.toThrow(message);
  expect(calls).toEqual([]);
  expect(markProfileComplete).not.toHaveBeenCalled();
});

it('does not complete onboarding if a call fails', async () => {
  (api.replaceInterests as jest.Mock).mockRejectedValue(new Error('Server error'));
  await act(async () => result.current.update(COMPLETE));
  await expect(act(async () => result.current.submit())).rejects.toThrow('Server error');
  expect(api.replaceAvailability).not.toHaveBeenCalled();
  expect(markProfileComplete).not.toHaveBeenCalled();
  expect(result.current.isSubmitting).toBe(false);
});
