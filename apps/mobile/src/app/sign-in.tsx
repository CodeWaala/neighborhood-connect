import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Terminal } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { API_URL, DEV_LOGIN_ENABLED } from '@/config';
import { fonts, hitSize, radius, spacing, textStyles, useTheme } from '@/theme';

/**
 * Dev sign-in: email → `POST /v1/auth/dev-login`. Leave the email blank to create a new test user.
 * Replaced by the designed email + code flow when Cognito auth lands.
 */
export default function SignInScreen() {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isNew = mode === 'new';

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      // On success the routing guard moves on to onboarding or the tabs
      await signIn(email);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach the API. Is it running?');
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.back}
            hitSlop={8}
          >
            <ChevronLeft size={24} color={colors.foreground} strokeWidth={2.25} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={[styles.devBadge, { backgroundColor: colors.accentSoft }]}>
            <Terminal size={12} color={colors.onAccentSoft} strokeWidth={2.5} />
            <Text style={[styles.devBadgeText, { color: colors.onAccentSoft }]}>DEV MODE</Text>
          </View>

          <View style={styles.heading}>
            <Text accessibilityRole="header" style={[textStyles.title, styles.title, { color: colors.foreground }]}>
              {isNew ? 'Create a test account' : 'Welcome back'}
            </Text>
            <Text style={[textStyles.body, { color: colors.mutedForeground }]}>
              {DEV_LOGIN_ENABLED
                ? 'Enter an email to sign in as an existing user or create a new one. Leave it blank to make a new test account.'
                : 'Sign in isn’t available in this build yet.'}
            </Text>
          </View>

          {DEV_LOGIN_ENABLED && (
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com (optional)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="go"
              editable={!submitting}
              onSubmitEditing={() => !submitting && void handleSubmit()}
            />
          )}

          {error && (
            <View accessibilityRole="alert" style={[styles.error, { backgroundColor: colors.accentSoft }]}>
              <Text style={[textStyles.label, { color: colors.onAccentSoft }]}>{error}</Text>
              <Text style={[styles.errorHint, { color: colors.onAccentSoft }]}>API: {API_URL}</Text>
            </View>
          )}
        </View>

        {DEV_LOGIN_ENABLED && (
          <View style={styles.actions}>
            <Button label="Continue" onPress={() => void handleSubmit()} loading={submitting} />
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  back: {
    width: hitSize,
    height: hitSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    gap: 28,
  },
  devBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: radius.chip,
    marginBottom: -12,
  },
  devBadgeText: {
    fontFamily: fonts.extrabold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  heading: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  error: {
    borderRadius: radius.banner,
    padding: spacing.md,
    gap: 4,
  },
  errorHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  actions: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
