import { Text, View } from 'react-native';

const sizeClasses: Record<number, string> = {
  40: 'h-10 w-10',
  48: 'h-12 w-12',
  64: 'h-16 w-16',
  80: 'h-20 w-20',
};

export function Avatar({ name, size = 48 }: { name: string; size?: 40 | 48 | 64 | 80 }) {
  const textSize = size >= 64 ? 'text-2xl' : size >= 48 ? 'text-lg' : 'text-base';
  return (
    <View className={`items-center justify-center rounded-full bg-primary-soft ${sizeClasses[size]}`}>
      <Text className={`font-bold text-primary ${textSize}`}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}
