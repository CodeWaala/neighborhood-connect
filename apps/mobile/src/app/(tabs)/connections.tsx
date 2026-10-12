import { StyleSheet, Text, View } from 'react-native';

import { Screen, ScreenTitle } from '@/components/Screen';
import { usePendingRequestCount } from '@/hooks/usePendingRequestCount';
import { spacing, textStyles, useTheme } from '@/theme';

/** Connections tab. Requests / Connected / Sent lists land in M5. */
export default function ConnectionsScreen() {
  const { colors } = useTheme();
  const pendingCount = usePendingRequestCount();

  return (
    <Screen edges={['top']}>
      <ScreenTitle title="Connections" />
      <View style={styles.body}>
        <Text style={[textStyles.bodySmall, { color: colors.mutedForeground }]}>
          {pendingCount > 0
            ? `You have ${pendingCount} connection request${pendingCount === 1 ? '' : 's'} waiting.`
            : 'Requests and people you’ve connected with will show up here.'}
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
