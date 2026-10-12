import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { fonts, hitSize, spacing, textStyles, useTheme } from '@/theme';

const STEP_COUNT = 4;

interface OnboardingScaffoldProps {
  step: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  onBack: () => void;
  backLabel?: string;
  children: ReactNode;
  /** Pinned under the scrolling content: the Continue button and any note above it. */
  footer: ReactNode;
}

/** Shared layout for the four onboarding steps: back button, progress bar, heading, pinned footer. */
export function OnboardingScaffold({
  step,
  title,
  subtitle,
  onBack,
  backLabel = 'Go back',
  children,
  footer,
}: OnboardingScaffoldProps) {
  const { colors } = useTheme();

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            onPress={onBack}
            hitSlop={8}
            style={styles.back}
          >
            <ChevronLeft size={24} color={colors.foreground} strokeWidth={2.25} />
          </Pressable>
          <View
            style={styles.progress}
            accessibilityRole="progressbar"
            accessibilityLabel={`Step ${step} of ${STEP_COUNT}`}
            accessibilityValue={{ min: 0, max: STEP_COUNT, now: step }}
          >
            {Array.from({ length: STEP_COUNT }, (_, i) => (
              <View
                key={i}
                style={[styles.segment, { backgroundColor: i < step ? colors.primary : colors.border }]}
              />
            ))}
          </View>
          <Text style={[styles.stepLabel, { color: colors.mutedForeground }]} importantForAccessibility="no">
            {step} of {STEP_COUNT}
          </Text>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
              {title}
            </Text>
            <Text style={[textStyles.body, { color: colors.mutedForeground }]}>{subtitle}</Text>
          </View>
          {children}
        </ScrollView>

        <View style={styles.footer}>{footer}</View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  back: {
    width: hitSize,
    height: hitSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  stepLabel: {
    width: hitSize,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.xxl,
  },
  heading: {
    gap: spacing.sm,
  },
  title: {
    ...textStyles.title,
    fontSize: 28,
    lineHeight: 34,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 10,
  },
});
