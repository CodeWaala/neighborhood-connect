import { router } from 'expo-router';
import { Coffee, House, Sun, TreePine, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { fonts, radius, spacing, textStyles, useTheme, type ThemeColors } from '@/theme';

interface Tile {
  label: string;
  icon: LucideIcon;
  background: keyof ThemeColors;
  iconColor: keyof ThemeColors;
  offset?: boolean;
}

const TILES: Tile[] = [
  { label: 'Morning walks', icon: Sun, background: 'accentSoft', iconColor: 'badge' },
  { label: 'Coffee runs', icon: Coffee, background: 'muted', iconColor: 'foreground', offset: true },
  { label: 'Park visits', icon: TreePine, background: 'primarySoft', iconColor: 'primary' },
];

export default function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <Screen style={styles.screen}>
      <View style={styles.brand}>
        <View style={[styles.mark, { backgroundColor: colors.primary }]}>
          <House size={18} color={colors.onPrimary} strokeWidth={2} />
        </View>
        <Text style={[styles.brandName, { color: colors.foreground }]}>NearbyPals</Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.tiles} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {TILES.map(({ label, icon: Icon, background, iconColor, offset }) => (
            <View
              key={label}
              style={[styles.tile, { backgroundColor: colors[background] }, offset && styles.tileOffset]}
            >
              <Icon size={28} color={colors[iconColor]} strokeWidth={2} />
              <Text style={[styles.tileLabel, { color: colors.foreground }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.copy}>
          <Text accessibilityRole="header" style={[styles.headline, { color: colors.foreground }]}>
            Connect with nearby parents and pet parents through{' '}
            <Text style={{ color: colors.primary }}>shared routines</Text>
          </Text>
          <Text style={[textStyles.body, { color: colors.mutedForeground }]}>
            Local, safe, and intentional connections for your daily walks, park visits, and coffee runs.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button label="Get Started" onPress={() => router.push({ pathname: '/sign-in', params: { mode: 'new' } })} />
        <Button label="I already have an account" variant="outline" onPress={() => router.push('/sign-in')} />
        <Text style={[styles.footnote, { color: colors.mutedForeground }]}>Private & safe · No ads, ever</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.xxl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  mark: {
    width: 32,
    height: 32,
    borderRadius: radius.banner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  tileOffset: {
    transform: [{ translateY: 20 }],
  },
  tileLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  copy: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  headline: {
    ...textStyles.title,
    lineHeight: 37,
  },
  actions: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  footnote: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 13,
  },
});
