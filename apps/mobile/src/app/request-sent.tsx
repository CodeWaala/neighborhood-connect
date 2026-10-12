import { router, useLocalSearchParams } from 'expo-router';
import { Clock, Heart, MessageCircle, Sparkles, Users } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useThemeColors } from '@/lib/theme-colors';

function Step({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-soft">{icon}</View>
      <View className="flex-1">
        <Text className="font-sans text-sm font-medium text-foreground">{title}</Text>
        <Text className="font-sans text-sm text-muted-foreground">{body}</Text>
      </View>
    </View>
  );
}

export default function RequestSent() {
  const colors = useThemeColors();
  const { name } = useLocalSearchParams<{ name?: string }>();

  return (
    <Screen>
      <ScrollView contentContainerClassName="flex-1 justify-center gap-6 p-6">
        <View className="h-24 w-24 self-center items-center justify-center rounded-full bg-primary-soft">
          <Heart size={32} color={colors.primary} />
        </View>

        <View className="gap-2">
          <Text className="text-center font-sans text-2xl font-bold text-foreground">Request sent! 🎉</Text>
          <Text className="text-center font-sans text-lg text-muted-foreground">
            {name ? `${name} will be notified` : 'Your request is on its way'}
          </Text>
        </View>

        <View className="gap-4 rounded-2xl border border-border bg-card p-6">
          <Text className="font-sans font-semibold text-foreground">What happens next?</Text>
          <Step
            icon={<Clock size={16} color={colors.primary} />}
            title="They'll review your profile"
            body="Take your time — good connections are worth waiting for"
          />
          <Step
            icon={<Sparkles size={16} color={colors.primary} />}
            title="Once accepted"
            body="You'll both be able to message and plan meetups"
          />
          <Step
            icon={<MessageCircle size={16} color={colors.accent} />}
            title="Messaging unlocks"
            body="Chat becomes available after mutual connection"
          />
        </View>

        <Text className="text-center font-sans text-sm text-muted-foreground">
          We&rsquo;ll notify you when there&rsquo;s an update. No need to keep checking!
        </Text>

        <View className="gap-3">
          <Button label="Back to Matches" size="xl" onPress={() => router.replace('/discovery')} />
          <Button
            label="View My Connections"
            variant="outline"
            size="lg"
            icon={<Users size={16} color={colors.foreground} />}
            onPress={() => router.replace('/connections')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
