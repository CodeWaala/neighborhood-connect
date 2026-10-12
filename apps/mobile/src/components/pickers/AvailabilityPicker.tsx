import { listAvailabilityWindows } from '@neighborhood-connect/api-client';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { formatTimeRange, rangeStartHour } from '@/onboarding/format';
import { fonts, radius, spacing, textStyles, useTheme } from '@/theme';

/** API day values (Prisma `DayOfWeek`) with short and full labels. */
export const DAYS = [
  { id: 'mon', short: 'Mon', full: 'Monday' },
  { id: 'tue', short: 'Tue', full: 'Tuesday' },
  { id: 'wed', short: 'Wed', full: 'Wednesday' },
  { id: 'thu', short: 'Thu', full: 'Thursday' },
  { id: 'fri', short: 'Fri', full: 'Friday' },
  { id: 'sat', short: 'Sat', full: 'Saturday' },
  { id: 'sun', short: 'Sun', full: 'Sunday' },
] as const;

/** Time windows, in time-of-day order (the API returns them alphabetically). */
export function useAvailabilityWindows() {
  return useQuery({
    queryKey: ['availabilityWindows'],
    queryFn: listAvailabilityWindows,
    staleTime: 5 * 60_000,
    select: (windows) => [...windows].sort((a, b) => rangeStartHour(a.timeRange) - rangeStartHour(b.timeRange)),
  });
}

function toggleIn(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

interface AvailabilityPickerProps {
  days: string[];
  windowIds: string[];
  onChange: (next: { days: string[]; windowIds: string[] }) => void;
}

/** Days row + time-window checkboxes (onboarding step 4). Saved as every day × window pair. */
export function AvailabilityPicker({ days, windowIds, onChange }: AvailabilityPickerProps) {
  const { colors } = useTheme();
  const { data: windows, isLoading, isError, refetch } = useAvailabilityWindows();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
          Days available
        </Text>
        <View style={styles.days}>
          {DAYS.map(({ id, short, full }) => {
            const selected = days.includes(id);
            return (
              <Pressable
                key={id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={full}
                onPress={() => onChange({ days: toggleIn(days, id), windowIds })}
                style={[
                  styles.day,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.dayText, { color: selected ? colors.onPrimary : colors.foreground }]}>
                  {short}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
          Preferred times
        </Text>
        {isLoading && <ActivityIndicator color={colors.primary} />}
        {(isError || (!isLoading && !windows)) && (
          <View style={styles.error}>
            <Text style={[textStyles.bodySmall, { color: colors.mutedForeground }]}>Couldn’t load times.</Text>
            <Button label="Try again" variant="outline" size="md" onPress={() => void refetch()} />
          </View>
        )}
        {windows?.map(({ id, label, timeRange }) => {
          const selected = windowIds.includes(id);
          return (
            <Pressable
              key={id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${label}, ${formatTimeRange(timeRange)}`}
              onPress={() => onChange({ days, windowIds: toggleIn(windowIds, id) })}
              style={[
                styles.window,
                {
                  backgroundColor: selected ? colors.primarySoft : colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={styles.windowText}>
                <Text style={[styles.windowLabel, { color: colors.foreground }]}>{label}</Text>
                <Text style={[textStyles.label, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
                  {formatTimeRange(timeRange)}
                </Text>
              </View>
              <View
                style={[
                  styles.box,
                  {
                    backgroundColor: selected ? colors.primary : 'transparent',
                    borderColor: selected ? colors.primary : colors.controlBorder,
                  },
                ]}
              >
                {selected && <Check size={14} color={colors.onPrimary} strokeWidth={3.5} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 28,
  },
  section: {
    gap: spacing.md,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  days: {
    flexDirection: 'row',
    gap: 6,
  },
  day: {
    flex: 1,
    height: 48,
    borderRadius: radius.button,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  error: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  window: {
    minHeight: 68,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  windowText: {
    flex: 1,
    gap: 2,
  },
  windowLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
