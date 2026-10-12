import { listInterests } from '@neighborhood-connect/api-client';
import { useQuery } from '@tanstack/react-query';
import { Baby, Check, Coffee, Dog, MessageCircle, Sparkles, TreePine, type LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { fonts, spacing, textStyles, useTheme } from '@/theme';

// Seeded interest labels → icons (same mapping idea as the web app); anything new gets Sparkles
const INTEREST_ICONS: Record<string, LucideIcon> = {
  'Stroller walks': Baby,
  'Coffee outings': Coffee,
  'Park visits': TreePine,
  'Dog walks': Dog,
  'Casual chats': MessageCircle,
};

export function interestIcon(label: string): LucideIcon {
  return INTEREST_ICONS[label] ?? Sparkles;
}

export function useInterests() {
  return useQuery({ queryKey: ['interests'], queryFn: listInterests, staleTime: 5 * 60_000 });
}

interface InterestPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** `tiles`: two-column cards (onboarding). `list`: checklist rows (profile editor). */
  layout?: 'tiles' | 'list';
}

/** Multi-select interests (onboarding step 3 and the profile editor). */
export function InterestPicker({ selectedIds, onChange, layout = 'tiles' }: InterestPickerProps) {
  const { colors } = useTheme();
  const { data: interests, isLoading, isError, refetch } = useInterests();

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }
  if (isError || !interests) {
    return (
      <View style={styles.error}>
        <Text style={[textStyles.bodySmall, { color: colors.mutedForeground }]}>Couldn’t load interests.</Text>
        <Button label="Try again" variant="outline" size="md" onPress={() => void refetch()} />
      </View>
    );
  }

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  if (layout === 'list') {
    return (
      <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {interests.map(({ id, label }, i) => {
          const selected = selectedIds.includes(id);
          const Icon = interestIcon(label);
          return (
            <Pressable
              key={id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={label}
              onPress={() => toggle(id)}
              style={({ pressed }) => [
                styles.row,
                i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                pressed && { backgroundColor: colors.muted },
              ]}
            >
              <View style={[styles.rowIcon, { backgroundColor: selected ? colors.primarySoft : colors.muted }]}>
                <Icon size={20} color={selected ? colors.primary : colors.mutedForeground} strokeWidth={2} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
              <View
                style={[
                  styles.rowCheck,
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
    );
  }

  return (
    <View style={styles.grid}>
      {interests.map(({ id, label }) => {
        const selected = selectedIds.includes(id);
        const Icon = interestIcon(label);
        return (
          <Pressable
            key={id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={label}
            onPress={() => toggle(id)}
            style={({ pressed }) => [
              styles.tile,
              {
                backgroundColor: selected ? colors.primarySoft : colors.card,
                borderColor: selected ? colors.primary : colors.border,
              },
              pressed && !selected && { backgroundColor: colors.muted },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: selected ? colors.primary : colors.muted }]}>
              <Icon size={22} color={selected ? colors.onPrimary : colors.foreground} strokeWidth={2} />
            </View>
            <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
            {selected && (
              <View style={[styles.check, { backgroundColor: colors.primary }]}>
                <Check size={14} color={colors.onPrimary} strokeWidth={3.5} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: spacing.xxl,
  },
  error: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    // Two per row: (100% - one 12px gap) / 2
    width: '47.5%',
    flexGrow: 1,
    minHeight: 112,
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  list: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  rowCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
