import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeft, Check, Moon, Sun, Sunset } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import type { AvailabilityWindow } from '@neighborhood-connect/types';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useInvalidateMyProfile, useMyProfile } from '@/hooks/useMyProfile';
import { listAvailabilityWindows } from '@/lib/availability-api';
import { replaceAvailability } from '@/lib/profile-api';
import { useThemeColors } from '@/lib/theme-colors';

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

function AvailabilityForm({
  windows,
  initialDays,
  initialWindowIds,
}: {
  windows: AvailabilityWindow[];
  initialDays: string[];
  initialWindowIds: string[];
}) {
  const colors = useThemeColors();
  const invalidate = useInvalidateMyProfile();
  const [selectedDays, setSelectedDays] = useState(initialDays);
  const [selectedWindowIds, setSelectedWindowIds] = useState(initialWindowIds);

  const save = useMutation({
    mutationFn: (entries: { availabilityId: string; dayOfWeek: string }[]) => replaceAvailability(entries),
    onSuccess: () => {
      invalidate();
      router.back();
    },
    onError: (error) => {
      Alert.alert('Couldn’t save', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  function toggleDay(id: string) {
    setSelectedDays((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }
  function toggleWindow(id: string) {
    setSelectedWindowIds((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  }

  function handleSave() {
    const entries = selectedDays.flatMap((day) =>
      selectedWindowIds.map((windowId) => ({ availabilityId: windowId, dayOfWeek: day })),
    );
    save.mutate(entries);
  }

  const isValid = selectedDays.length > 0 && selectedWindowIds.length > 0;

  return (
    <ScrollView contentContainerClassName="gap-6 p-4">
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
        <View className="gap-2">
          {windows.map((window) => {
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

      <Button label="Save" loading={save.isPending} disabled={!isValid} onPress={handleSave} />
    </ScrollView>
  );
}

export default function EditAvailability() {
  const colors = useThemeColors();
  const me = useMyProfile();

  const { data: windows } = useQuery({
    queryKey: ['availabilityWindows'],
    queryFn: listAvailabilityWindows,
    staleTime: 5 * 60 * 1000,
  });

  const isReady = !!me.data && !!windows;

  return (
    <Screen>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text className="font-sans text-lg font-semibold text-foreground">Availability</Text>
      </View>

      {isReady ? (
        <AvailabilityForm
          windows={windows}
          initialDays={[...new Set((me.data!.user?.availability ?? []).map((s) => s.dayOfWeek))]}
          initialWindowIds={[...new Set((me.data!.user?.availability ?? []).map((s) => s.availabilityId))]}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </Screen>
  );
}
