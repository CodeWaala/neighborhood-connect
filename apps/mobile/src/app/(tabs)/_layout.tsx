import { Tabs } from 'expo-router';
import { Compass, MessageCircle, User, Users } from 'lucide-react-native';
import { useEffect } from 'react';

import { useThemeColors } from '@/lib/theme-colors';
import { registerForPushNotifications } from '@/lib/push';

export default function TabsLayout() {
  const colors = useThemeColors();

  useEffect(() => {
    void registerForPushNotifications();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}>
      <Tabs.Screen
        name="discovery"
        options={{ title: 'Discovery', tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="connections"
        options={{ title: 'Connections', tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: 'Messages', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
