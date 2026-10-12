import { replaceAvailability } from '@neighborhood-connect/api-client';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EditHint, EditScaffold } from '@/components/EditScaffold';
import { Loading } from '@/components/Loading';
import { DAYS, useAvailabilityWindows } from '@/components/pickers/AvailabilityPicker';
import { useMyProfile } from '@/hooks/useMyProfile';
import { saveErrorMessage, useSaveProfile } from '@/hooks/useSaveProfile';
import { formatTimeRange } from '@/onboarding/format';
import { fonts, spacing, useTheme } from '@/theme';

/** "tue|<windowId>" — one cell of the day × time grid. */
const key = (day: string, windowId: string) => `${day}|${windowId}`;

export default function EditAvailabilityScreen() {
  const me = useMyProfile();
  const windows = useAvailabilityWindows();
  if (!me.data || !windows.data) return <Loading />;
  return (
    <AvailabilityEditor
      initial={me.data.slots.map((s) => key(s.dayOfWeek, s.window.id))}
      windows={windows.data}
    />
  );
}

function AvailabilityEditor({
  initial,
  windows,
}: {
  initial: string[];
  windows: { id: string; label: string; timeRange: string }[];
}) {
  const { colors } = useTheme();
  const [cells, setCells] = useState(() => new Set(initial));
  const save = useSaveProfile(replaceAvailability);

  const changed = cells.size !== initial.length || initial.some((k) => !cells.has(k));

  function toggle(k: string) {
    setCells((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function handleSave() {
    // Unlike onboarding, the grid saves exactly the cells picked (not every day × window)
    save.mutate(
      [...cells].map((k) => {
        const [dayOfWeek, availabilityId] = k.split('|');
        return { dayOfWeek, availabilityId };
      }),
    );
  }

  return (
    <EditScaffold
      title="Availability"
      onCancel={() => router.back()}
      onSave={handleSave}
      canSave={changed && cells.size > 0}
      saving={save.isPending}
      error={saveErrorMessage(save.error)}
    >
      <EditHint>Tap the times you’re usually free. Neighbors only see these, never your exact schedule.</EditHint>

      <View style={[styles.grid, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.dayColumn} />
          {windows.map((w) => (
            <View key={w.id} style={styles.cellColumn}>
              <Text style={[styles.colLabel, { color: colors.foreground }]}>{w.label}</Text>
              <Text style={[styles.colRange, { color: colors.mutedForeground }]}>{formatTimeRange(w.timeRange)}</Text>
            </View>
          ))}
        </View>
        {DAYS.map((day) => (
          <View key={day.id} style={styles.row}>
            <Text style={[styles.dayLabel, { color: colors.foreground }]}>{day.short}</Text>
            {windows.map((w) => {
              const k = key(day.id, w.id);
              const selected = cells.has(k);
              return (
                <Pressable
                  key={w.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${day.full} ${w.label.toLowerCase()}`}
                  onPress={() => toggle(k)}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: selected ? colors.primary : colors.muted,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {selected && <Check size={18} color={colors.onPrimary} strokeWidth={3} />}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <EditHint>
        {cells.size === 0
          ? 'Pick at least one time to keep getting matches.'
          : `${cells.size} time slot${cells.size === 1 ? '' : 's'} selected`}
      </EditHint>
    </EditScaffold>
  );
}

const styles = StyleSheet.create({
  grid: {
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayColumn: {
    width: 48,
  },
  cellColumn: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 2,
  },
  colLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 13,
  },
  colRange: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  dayLabel: {
    width: 48,
    paddingLeft: spacing.xs,
    fontFamily: fonts.extrabold,
    fontSize: 15,
  },
  cell: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
