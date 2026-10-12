import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

export function Chip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
}) {
  const className = `flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
    selected ? 'border-primary bg-primary-soft' : 'border-border bg-card'
  }`;
  const textClassName = `text-sm font-medium ${selected ? 'text-primary' : 'text-foreground'}`;

  if (!onPress) {
    return (
      <View className={className}>
        {icon}
        <Text className={textClassName}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} className={className}>
      {icon}
      <Text className={textClassName}>{label}</Text>
    </Pressable>
  );
}
