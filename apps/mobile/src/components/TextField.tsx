import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { fonts, radius, textStyles, useTheme } from '@/theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
}

/** Labelled text input (52px, 14px radius) as in the Sign in and onboarding designs. */
export function TextField({ label, ...inputProps }: TextFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.placeholder}
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
        ]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    ...textStyles.label,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  input: {
    height: 52,
    borderRadius: radius.button,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 17,
  },
});
