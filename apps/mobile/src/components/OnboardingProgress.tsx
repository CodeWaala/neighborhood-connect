import { ChevronLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useThemeColors } from '@/lib/theme-colors';

const TOTAL_STEPS = 4;

export function OnboardingProgress({ step, onBack }: { step: number; onBack?: () => void }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 px-4 pt-4">
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" className="p-1">
          <ChevronLeft size={24} color={colors.foreground} />
        </Pressable>
      ) : (
        <View className="w-6" />
      )}
      <View className="flex-1 flex-row gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-border'}`}
          />
        ))}
      </View>
    </View>
  );
}
