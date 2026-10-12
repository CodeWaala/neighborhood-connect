import { House } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, radius, spacing, textStyles, useTheme } from '@/theme';

/** Placeholder home screen. Replaced by the auth/onboarding routing in M2–M3. */
export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.brand}>
        <View style={[styles.mark, { backgroundColor: colors.primary }]}>
          <House size={18} color={colors.onPrimary} strokeWidth={2} />
        </View>
        <Text style={[styles.brandName, { color: colors.foreground }]}>NearbyPals</Text>
      </View>
      <Text style={[textStyles.title, { color: colors.foreground }]}>App shell is ready</Text>
      <Text style={[textStyles.body, { color: colors.mutedForeground }]}>
        Sign-in, onboarding and discovery screens arrive in the next phases.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  mark: {
    width: 32,
    height: 32,
    borderRadius: radius.banner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...textStyles.heading,
    fontSize: 20,
    fontFamily: fonts.bold,
  },
});
