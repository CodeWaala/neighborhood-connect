import type { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { fonts, hitSize, radius, spacing, textStyles, useTheme } from '@/theme';

interface EditScaffoldProps {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  canSave: boolean;
  saving: boolean;
  error?: string | null;
  children: ReactNode;
}

/** Profile editor layout: Cancel | Title | Save header over scrolling content. */
export function EditScaffold({ title, onCancel, onSave, canSave, saving, error, children }: EditScaffoldProps) {
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={8} style={styles.side}>
          <Text style={[styles.cancel, { color: colors.primary }]}>Cancel</Text>
        </Pressable>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave || saving, busy: saving }}
          disabled={!canSave || saving}
          onPress={onSave}
          hitSlop={8}
          style={[styles.side, styles.right]}
        >
          {saving ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.save, { color: canSave ? colors.primary : colors.placeholder }]}>Save</Text>
          )}
        </Pressable>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {error && (
            <View accessibilityRole="alert" style={[styles.error, { backgroundColor: colors.accentSoft }]}>
              <Text style={[textStyles.label, { color: colors.onAccentSoft }]}>{error}</Text>
            </View>
          )}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** Small explanatory text used under editor headers and fields. */
export function EditHint({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.hint, { color: colors.mutedForeground }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  side: {
    width: 88,
    height: hitSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  right: {
    alignItems: 'flex-end',
  },
  cancel: {
    fontFamily: fonts.semibold,
    fontSize: 17,
  },
  save: {
    fontFamily: fonts.extrabold,
    fontSize: 17,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.extrabold,
    fontSize: 17,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  error: {
    borderRadius: radius.banner,
    padding: spacing.md,
  },
  hint: {
    marginHorizontal: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
