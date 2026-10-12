import { StyleSheet, Text, View } from 'react-native';

import { Screen, ScreenTitle } from '@/components/Screen';
import { spacing, textStyles, useTheme } from '@/theme';

/** Discover tab. Match cards, loading and empty states land in M4. */
export default function DiscoverScreen() {
  const { colors } = useTheme();

  return (
    <Screen edges={['top']}>
      <ScreenTitle title="Your matches" />
      <View style={styles.body}>
        <Text style={[textStyles.bodySmall, { color: colors.mutedForeground }]}>
          Neighbors who share your interests and schedule will show up here.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.xl,
  },
});
