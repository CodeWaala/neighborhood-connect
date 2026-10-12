import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme as NavTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { UnreachableScreen } from '@/components/UnreachableScreen';
import { fontAssets, fonts, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Same defaults as the web app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const { scheme, colors } = useTheme();

  // Keep the splash screen up until Nunito is ready (fall back to system font on error)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme: NavTheme = {
    ...base,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.foreground,
      border: colors.border,
      notification: colors.badge,
    },
    fonts: {
      regular: { fontFamily: fonts.regular, fontWeight: '400' },
      medium: { fontFamily: fonts.semibold, fontWeight: '600' },
      bold: { fontFamily: fonts.bold, fontWeight: '700' },
      heavy: { fontFamily: fonts.extrabold, fontWeight: '800' },
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={navTheme}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <RootNavigator />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

/**
 * Routing guard:
 * - no user              → Welcome / Sign in
 * - user without profile → Onboarding
 * - user with profile    → Tabs
 */
function RootNavigator() {
  const { status, hasProfile } = useAuth();
  const restoring = status === 'restoring';

  useEffect(() => {
    if (!restoring) {
      SplashScreen.hideAsync();
    }
  }, [restoring]);

  if (restoring) {
    return null;
  }
  if (status === 'unreachable') {
    return <UnreachableScreen />;
  }

  const signedIn = status === 'signedIn';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn && hasProfile}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="neighbor/[id]" />
        <Stack.Screen name="request-sent" options={{ gestureEnabled: false }} />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="edit/role" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit/interests" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit/availability" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit/about" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !hasProfile}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
