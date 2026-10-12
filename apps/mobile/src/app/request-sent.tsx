import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { fonts, radius, spacing, textStyles, useTheme } from '@/theme';

/** Confirmation after sending a connection request. */
export default function RequestSentScreen() {
  const { colors } = useTheme();
  const { name = 'Your neighbor' } = useLocalSearchParams<{ name?: string }>();

  const steps = [
    { title: 'They’ll review your profile', body: `${name} sees your shared interests and times.` },
    { title: 'Once accepted', body: 'They’ll appear in your Connections.' },
    { title: 'Messaging unlocks', body: 'Plan a walk or coffee together.' },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.ring, { backgroundColor: colors.primarySoft }]}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]}>
              <Check size={32} color={colors.onPrimary} strokeWidth={3} />
            </View>
          </View>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
            Request sent
          </Text>
          <Text style={[textStyles.body, { color: colors.mutedForeground }]}>{name} will see it in their Connections</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text accessibilityRole="header" style={[styles.cardTitle, { color: colors.foreground }]}>
            What happens next?
          </Text>
          {steps.map((step, i) => (
            <View key={step.title} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.stepNumberText, { color: colors.onPrimarySoft }]}>{i + 1}</Text>
              </View>
              <View style={styles.stepText}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
                <Text style={[textStyles.label, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
                  {step.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button label="Back to matches" onPress={() => router.dismissTo('/')} />
        <Button label="View connections" variant="outline" onPress={() => router.dismissTo('/connections')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: 72,
    gap: 32,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...textStyles.title,
    fontSize: 28,
    lineHeight: 34,
    marginTop: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: 18,
  },
  cardTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  actions: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
});
