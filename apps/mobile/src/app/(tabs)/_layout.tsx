import { Tabs } from 'expo-router/js-tabs';
import { CircleUserRound, Compass, Users, type LucideIcon } from 'lucide-react-native';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePendingRequestCount } from '@/hooks/usePendingRequestCount';
import { usePushNotifications } from '@/notifications/usePushNotifications';
import { fonts, useTheme } from '@/theme';

function tabIcon(Icon: LucideIcon) {
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon size={24} color={color as string} strokeWidth={focused ? 2.5 : 2} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const pendingCount = usePendingRequestCount();
  const insets = useSafeAreaInsets();
  usePushNotifications();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        // 50px items + 8px top padding, as in the designs, above the home indicator
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 58 + Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarItemStyle: {
          height: 50,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bold,
          fontSize: 11,
          lineHeight: 14,
        },
        tabBarBadgeStyle: {
          backgroundColor: colors.badge,
          color: colors.onBadge,
          fontFamily: fonts.extrabold,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Discover', tabBarIcon: tabIcon(Compass) }} />
      <Tabs.Screen
        name="connections"
        options={{
          title: 'Connections',
          tabBarIcon: tabIcon(Users),
          tabBarBadge: pendingCount > 0 ? (pendingCount > 9 ? '9+' : pendingCount) : undefined,
          tabBarAccessibilityLabel:
            pendingCount > 0 ? `Connections, ${pendingCount} new request${pendingCount === 1 ? '' : 's'}` : undefined,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon(CircleUserRound) }} />
    </Tabs>
  );
}
