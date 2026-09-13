
import React from 'react';
import { Pressable, Text, useWindowDimensions } from 'react-native';













import { s } from './styles';
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  stableLabel = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  stableLabel?: boolean;
}) {
  const { fontScale } = useWindowDimensions();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        (disabled || pressed) && { opacity: 0.45 },
      ]}
    >
      <Text
        style={[
          s.buttonLabel,
          stableLabel && { minHeight: 36 * fontScale, lineHeight: 18, textAlign: 'center' },
          secondary && { color: '#244348' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
