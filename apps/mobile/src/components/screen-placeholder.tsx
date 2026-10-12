import { SafeAreaView, Text, View } from 'react-native';

export function ScreenPlaceholder({ title, blurb }: { title: string; blurb: string }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-4 p-6">
        <Text className="font-sans text-3xl font-bold text-foreground">{title}</Text>
        <Text className="font-sans text-base text-muted-foreground">{blurb}</Text>

        <View className="mt-4 rounded-2xl border border-border/50 bg-card p-5">
          <Text className="font-sans text-sm font-medium text-card-foreground">Card surface</Text>
        </View>

        <View className="flex-row gap-3">
          <View className="rounded-full bg-primary-soft px-3 py-1.5">
            <Text className="font-sans text-sm font-medium text-primary">Primary soft</Text>
          </View>
          <View className="rounded-full bg-accent-soft px-3 py-1.5">
            <Text className="font-sans text-sm font-medium text-accent">Accent soft</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
