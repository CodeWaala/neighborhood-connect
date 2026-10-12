import type { ProfileRole } from '@neighborhood-connect/api-client';
import { Baby, Heart, PawPrint, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, spacing, textStyles, useTheme } from '@/theme';

const ROLE_OPTIONS: { id: ProfileRole; title: string; description: string; icon: LucideIcon }[] = [
  {
    id: 'parent',
    title: 'Parent of young child',
    description: 'Ages 0–5 years. Morning walks, playground visits, nap schedules.',
    icon: Baby,
  },
  { id: 'pet', title: 'Pet parent', description: 'Daily walks, dog parks, pet-friendly hangouts.', icon: PawPrint },
  {
    id: 'both',
    title: 'Both',
    description: 'You’ve got your hands full! We’ll match you with both communities.',
    icon: Heart,
  },
];

/** Short label for a role, e.g. on profile rows. */
export function roleTitle(role: ProfileRole): string {
  return ROLE_OPTIONS.find((r) => r.id === role)?.title ?? role;
}

/** Role radio cards (onboarding step 2 and the profile editor). */
export function RolePicker({ value, onChange }: { value: ProfileRole | null; onChange: (role: ProfileRole) => void }) {
  const { colors } = useTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Role" style={styles.list}>
      {ROLE_OPTIONS.map(({ id, title, description, icon: Icon }) => {
        const selected = value === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${title}. ${description}`}
            onPress={() => onChange(id)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: selected ? colors.primarySoft : colors.card,
                borderColor: selected ? colors.primary : colors.border,
              },
              pressed && !selected && { backgroundColor: colors.muted },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: selected ? colors.primary : colors.muted }]}>
              <Icon size={24} color={selected ? colors.onPrimary : colors.foreground} strokeWidth={2} />
            </View>
            <View style={styles.text}>
              <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
              <Text style={[textStyles.label, styles.description, { color: colors.mutedForeground }]}>
                {description}
              </Text>
            </View>
            <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.controlBorder }]}>
              {selected && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  card: {
    minHeight: 88,
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  description: {
    fontFamily: fonts.regular,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
