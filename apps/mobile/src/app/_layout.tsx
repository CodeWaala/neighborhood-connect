import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { vars } from 'nativewind';

import '../global.css';
import { AuthProvider, useAuth } from '@/auth/AuthContext';

// No-ops without a real DSN (ticket 008 — a Sentry project hasn't been
// created yet; set EXPO_PUBLIC_SENTRY_DSN once one exists).
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !__DEV__,
});

const themeVars = {
  light: vars({
    '--background': '45 30% 97%',
    '--foreground': '25 25% 20%',
    '--card': '45 40% 99%',
    '--card-foreground': '25 25% 20%',
    '--primary': '150 30% 45%',
    '--primary-foreground': '45 30% 98%',
    '--primary-soft': '150 25% 92%',
    '--primary-glow': '150 35% 55%',
    '--secondary': '30 20% 94%',
    '--secondary-foreground': '25 25% 25%',
    '--muted': '30 15% 92%',
    '--muted-foreground': '25 15% 50%',
    '--accent': '15 80% 65%',
    '--accent-foreground': '45 30% 98%',
    '--accent-soft': '15 60% 94%',
    '--destructive': '0 65% 55%',
    '--destructive-foreground': '45 30% 98%',
    '--border': '30 20% 88%',
    '--input': '30 20% 88%',
    '--ring': '150 30% 45%',
  }),
  dark: vars({
    '--background': '25 20% 10%',
    '--foreground': '45 20% 95%',
    '--card': '25 18% 14%',
    '--card-foreground': '45 20% 95%',
    '--primary': '150 35% 55%',
    '--primary-foreground': '25 20% 10%',
    '--primary-soft': '150 20% 20%',
    '--primary-glow': '150 40% 65%',
    '--secondary': '25 15% 20%',
    '--secondary-foreground': '45 20% 95%',
    '--muted': '25 15% 18%',
    '--muted-foreground': '30 10% 60%',
    '--accent': '15 70% 60%',
    '--accent-foreground': '25 20% 10%',
    '--accent-soft': '15 30% 20%',
    '--destructive': '0 55% 45%',
    '--destructive-foreground': '45 20% 95%',
    '--border': '25 15% 22%',
    '--input': '25 15% 22%',
    '--ring': '150 35% 55%',
  }),
};

/** Redirects between sign-in, onboarding, and the tabs based on auth state. */
function RootNavigator() {
  const { isLoading, isAuthenticated, hasProfile } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading || hasProfile === null) return;
    const onSignIn = segments[0] === 'sign-in';
    const onOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated) {
      if (!onSignIn) router.replace('/sign-in');
      return;
    }
    if (!hasProfile) {
      if (!onOnboarding) router.replace('/onboarding');
      return;
    }
    if (onSignIn || onOnboarding) {
      router.replace('/discovery');
    }
  }, [isLoading, isAuthenticated, hasProfile, segments, router]);

  if (isLoading || (isAuthenticated && hasProfile === null)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}

function RootLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={themeVars[scheme]} className="flex-1">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </View>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
