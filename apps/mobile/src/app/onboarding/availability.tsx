import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Check, Moon, Sun, Sunset } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { Screen } from '@/components/Screen';
import { listAvailabilityWindows } from '@/lib/availability-api';
import { useThemeColors } from '@/lib/theme-colors';
import { useOnboarding } from '@/onboarding/OnboardingContext';

const DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

function windowIcon(label: string, color: string) {
  const props = { size: 20, color };
  if (label === 'Afternoon') return <Sunset {...props} />;
  if (label === 'Evening') return <Moon {...props} />;
  return <Sun {...props} />;
}

export default function OnboardingAvailability() {
  const router = useRouter();
  const colors = useThemeColors();
  const { availability, setAvailabilityEntries, submitOnboarding, isSubmitting } = useOnboarding();

  const [selectedDays, setSelectedDays] = useState<string[]>(() => [
    ...new Set(availability.map((a) => a.dayOfWeek)),
  ]);
  const [selectedWindowIds, setSelectedWindowIds] = useState<string[]>(() => [
    ...new Set(availability.map((a) => a.availabilityId)),
  ]);

  const { data: windows, isLoading, isError } = useQuery({
    queryKey: ['availabilityWindows'],
    queryFn: listAvailabilityWindows,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setAvailabilityEntries(
      selectedDays.flatMap((day) => selectedWindowIds.map((windowId) => ({ availabilityId: windowId, dayOfWeek: day }))),
    );
  }, [selectedDays, selectedWindowIds, setAvailabilityEntries]);

  function toggleDay(id: string) {
    setSelectedDays((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }
  function toggleWindow(id: string) {
    setSelectedWindowIds((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  }

  async function handleFinish() {
    try {
      await submitOnboarding();
      router.replace('/discovery');
    } catch (error) {
      Alert.alert('Something went wrong', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  const isValid = selectedDays.length > 0 && selectedWindowIds.length > 0;

  return (
    <Screen>
      <OnboardingProgress step={4} onBack={() => router.back()} />
      <ScrollView contentContainerClassName="flex-1 justify-center gap-6 p-6">
        <View className="gap-2">
          <Text className="text-center font-sans text-2xl font-bold text-foreground">
            When are you free?
          </Text>
          <Text className="text-center font-sans text-base text-muted-foreground">
            This helps coordinate meetups with neighbors who have similar schedules.
          </Text>
        </View>

        <View className="gap-3">
          <Text className="font-sans text-sm font-medium text-foreground">Days available</Text>
          <View className="flex-row flex-wrap gap-2">
            {DAYS.map((day) => {
              const isSelected = selectedDays.includes(day.id);
              return (
                <Pressable
                  key={day.id}
                  onPress={() => toggleDay(day.id)}
                  className={`h-11 w-11 items-center justify-center rounded-full border-2 ${
                    isSelected ? 'border-primary bg-primary' : 'border-border bg-card'
                  }`}>
                  <Text
                    className={`font-sans text-sm font-medium ${
                      isSelected ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-3">
          <Text className="font-sans text-sm font-medium text-foreground">Preferred times</Text>
          {isLoading && <ActivityIndicator color={colors.primary} />}
          {isError && (
            <Text className="font-sans text-sm text-destructive">
              Failed to load time windows. Please try again.
            </Text>
          )}
          <View className="gap-2">
            {windows?.map((window) => {
              const isSelected = selectedWindowIds.includes(window.id);
              return (
                <Pressable
                  key={window.id}
                  onPress={() => toggleWindow(window.id)}
                  className={`flex-row items-center justify-between rounded-xl border-2 p-4 ${
                    isSelected ? 'border-primary bg-primary-soft' : 'border-border bg-card'
                  }`}>
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-full ${
                        isSelected ? 'bg-primary' : 'bg-primary-soft'
                      }`}>
                      {windowIcon(window.label, isSelected ? colors.primaryForeground : colors.primary)}
                    </View>
                    <View>
                      <Text className="font-sans font-medium text-foreground">{window.label}</Text>
                      <Text className="font-sans text-sm text-muted-foreground">{window.timeRange}</Text>
                    </View>
                  </View>
                  {isSelected && <Check size={20} color={colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button
          label={isSubmitting ? 'Setting up your profile…' : 'Finish Setup'}
          onPress={handleFinish}
          disabled={!isValid || isSubmitting || isLoading}
          loading={isSubmitting}
        />

        {!isValid && (
          <Text className="text-center font-sans text-sm text-muted-foreground">
            Select at least one day and one time
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}
