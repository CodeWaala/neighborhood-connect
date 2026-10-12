import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

const colors = {
  light: { active: 'hsl(150, 30%, 45%)', inactive: 'hsl(25, 15%, 50%)', bg: 'hsl(45, 40%, 99%)' },
  dark: { active: 'hsl(150, 35%, 55%)', inactive: 'hsl(30, 10%, 60%)', bg: 'hsl(25, 18%, 14%)' },
};

export default function TabsLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = colors[scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.active,
        tabBarInactiveTintColor: palette.inactive,
        tabBarStyle: { backgroundColor: palette.bg },
      }}>
      <Tabs.Screen name="discovery" options={{ title: 'Discovery' }} />
      <Tabs.Screen name="connections" options={{ title: 'Connections' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
