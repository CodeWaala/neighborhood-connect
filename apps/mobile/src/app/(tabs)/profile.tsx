import { updateProfile } from '@neighborhood-connect/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { roleTitle } from '@/components/pickers/RolePicker';
import { Screen, ScreenTitle } from '@/components/Screen';
import { MY_PROFILE_KEY, useMyProfile } from '@/hooks/useMyProfile';
import { groupByWindow, joinDays, roleContext } from '@/lib/matching';
import { fonts, spacing, textStyles, useTheme } from '@/theme';

/** Profile tab: your routines (each opens an editor), privacy, sign out. */
export default function ProfileScreen() {
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const me = useMyProfile();

  if (me.isLoading) {
    return (
      <Screen edges={['top']}>
        <ScreenTitle title="Profile" />
        <Loading />
      </Screen>
    );
  }

  if (!me.data) {
    return (
      <Screen edges={['top']}>
        <ScreenTitle title="Profile" />
        <View style={styles.centered}>
          <Text style={[textStyles.body, styles.center, { color: colors.mutedForeground }]}>
            Couldn’t load your profile.
          </Text>
          <Button label="Try again" variant="outline" size="md" onPress={() => void me.refetch()} />
          <Button label="Sign out" variant="danger" size="md" onPress={() => void signOut()} />
        </View>
      </Screen>
    );
  }

  const { profile, interests, slots } = me.data;
  const availability = groupByWindow(slots)
    .map((g) => `${joinDays(g.days)} ${g.window.label.toLowerCase()}s`)
    .join(', ');

  const rows: { label: string; value: string; href: Href; placeholder?: boolean }[] = [
    {
      label: 'I am a...',
      value: profile.role === 'both' ? roleContext(profile.role) : roleTitle(profile.role),
      href: '/edit/role',
    },
    { label: 'Interests', value: interests.map((i) => i.label).join(', ') || 'Pick your interests', href: '/edit/interests' },
    { label: 'Availability', value: availability || 'Add your free times', href: '/edit/availability' },
    {
      label: 'About me',
      value: profile.bio || 'Add a short bio',
      href: '/edit/about',
      placeholder: !profile.bio,
    },
  ];

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTitle title="Profile" />

        <View style={styles.identity}>
          <Avatar name={profile.displayName} size={64} tone="solid" />
          <View style={styles.identityText}>
            <Text style={[styles.name, { color: colors.foreground }]}>{profile.displayName}</Text>
            {profile.neighborhood && (
              <View style={styles.hood}>
                <MapPin size={14} color={colors.mutedForeground} strokeWidth={2.25} />
                <Text style={[textStyles.label, styles.regular, { color: colors.mutedForeground }]}>
                  {profile.neighborhood.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Section title="Your routines">
          <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {rows.map((row, i) => (
              <Pressable
                key={row.label}
                accessibilityRole="button"
                accessibilityLabel={`${row.label}, ${row.value}, edit`}
                onPress={() => router.push(row.href)}
                style={({ pressed }) => [
                  styles.row,
                  i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                  pressed && { backgroundColor: colors.muted },
                ]}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>{row.label}</Text>
                  <Text
                    numberOfLines={1}
                    style={[textStyles.label, styles.regular, { color: colors.mutedForeground }]}
                  >
                    {row.value}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.placeholder} strokeWidth={2.25} />
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Privacy">
          <VisibilitySwitch isPublic={profile.isProfilePublic} />
        </Section>

        <Button label="Sign out" variant="danger" size="md" style={styles.signOut} onPress={() => void signOut()} />
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/** "Show me in matches" (isProfilePublic). Saves right away, optimistically. */
function VisibilitySwitch({ isPublic }: { isPublic: boolean }) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const toggle = useMutation({
    mutationFn: (next: boolean) => updateProfile({ isProfilePublic: next }),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: MY_PROFILE_KEY });
      const previous = queryClient.getQueryData(MY_PROFILE_KEY);
      queryClient.setQueryData(MY_PROFILE_KEY, (old: object | undefined) =>
        old ? { ...old, isProfilePublic: next } : old,
      );
      return { previous };
    },
    onError: (_error, _next, context) => {
      queryClient.setQueryData(MY_PROFILE_KEY, context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY });
    },
  });

  return (
    <View style={[styles.privacy, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.rowText}>
        <Text nativeID="visibility-label" style={[styles.rowLabel, { color: colors.foreground }]}>
          Show me in matches
        </Text>
        <Text style={[textStyles.label, styles.regular, { color: colors.mutedForeground }]}>
          {isPublic
            ? 'Only neighbors who match you can see your profile. Your exact address is never shown.'
            : 'You’re hidden from Discover. Existing connections can still message you.'}
        </Text>
        {toggle.isError && (
          <Text accessibilityRole="alert" style={[textStyles.label, { color: colors.danger }]}>
            Couldn’t update. Please try again.
          </Text>
        )}
      </View>
      <Switch
        accessibilityLabel="Show me in matches"
        value={isPublic}
        onValueChange={(next) => toggle.mutate(next)}
        disabled={toggle.isPending}
        trackColor={{ false: colors.controlBorder, true: colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.controlBorder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  regular: {
    fontFamily: fonts.regular,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  center: {
    textAlign: 'center',
  },
  content: {
    paddingBottom: spacing.xxl,
    gap: 22,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.xl,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.extrabold,
    fontSize: 21,
  },
  hood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  section: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    marginHorizontal: spacing.xs,
    fontFamily: fonts.extrabold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  group: {
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
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  privacy: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  signOut: {
    marginHorizontal: spacing.lg,
    height: 52,
    borderRadius: 16,
  },
});
