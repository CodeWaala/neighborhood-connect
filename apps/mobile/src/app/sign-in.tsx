import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/auth/AuthContext';

export default function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setIsSubmitting(true);
    try {
      await login(email.trim() || undefined);
      // Navigation to (tabs) happens automatically once the root layout
      // re-renders with isAuthenticated: true.
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof ApiError ? error.message : 'Could not reach the API. Is it running?',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-6 p-6">
        <View className="self-center rounded-full bg-amber-100 px-3 py-1">
          <Text className="font-sans text-xs font-semibold text-amber-700">DEV MODE</Text>
        </View>

        <View className="gap-2">
          <Text className="text-center font-sans text-3xl font-bold text-foreground">
            Developer Login
          </Text>
          <Text className="text-center font-sans text-base text-muted-foreground">
            Enter an email to log in as an existing user or create a new one. Leave blank to
            auto-generate a test account.
          </Text>
        </View>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com (optional)"
          placeholderTextColor="hsl(25, 15%, 50%)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          editable={!isSubmitting}
          onSubmitEditing={handleLogin}
          className="rounded-xl border border-border bg-card px-4 py-3 font-sans text-base text-foreground"
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isSubmitting}
          className="items-center rounded-xl bg-primary py-3.5"
          style={{ opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-sans text-base font-semibold text-primary-foreground">
              Continue
            </Text>
          )}
        </TouchableOpacity>

        <View className="rounded-2xl border border-border/50 bg-card p-4">
          <Text className="font-sans text-sm text-muted-foreground">
            This login is for development only. In production, authentication is handled by AWS
            Cognito through a dedicated Mobile Auth Client (see docs/adr/0002).
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
