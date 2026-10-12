import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type Variant = 'hero' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2',
  md: 'px-5 py-3',
  lg: 'px-6 py-3.5',
  xl: 'px-6 py-4',
};

export function Button({
  label,
  onPress,
  variant = 'hero',
  size = 'md',
  disabled,
  loading,
  icon,
  className = '',
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  const variantClasses =
    variant === 'hero' ? 'bg-primary' : variant === 'outline' ? 'border border-border bg-transparent' : 'bg-transparent';
  const textClasses = variant === 'hero' ? 'font-semibold text-primary-foreground' : 'font-medium text-foreground';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-row items-center justify-center gap-2 rounded-xl ${sizeClasses[size]} ${variantClasses} ${className}`}
      style={{ opacity: disabled || loading ? 0.6 : 1 }}>
      {loading ? (
        <ActivityIndicator color={variant === 'hero' ? 'white' : 'hsl(150, 30%, 45%)'} />
      ) : (
        <>
          {icon}
          <Text className={`text-base ${textClasses}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
