import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '@/theme';
import { createStyles } from './PhoneInput.styles';

export interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  label = 'Mobile number',
  placeholder = 'Enter 10-digit number',
  error,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (raw: string) => {
    // Only accept numeric digits, up to 10 characters
    const clean = raw.replace(/\D/g, '').slice(0, 10);
    onChangeText(clean);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputRow,
          isFocused && styles.inputRowFocused,
          Boolean(error) && styles.inputRowError,
        ]}
      >
        <View style={styles.prefixContainer}>
          <Text style={styles.flag}>🇮🇳</Text>
          <Text style={styles.prefixText}>+91</Text>
        </View>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="phone-pad"
          maxLength={10}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel="Phone number input"
        />

        {value.length > 0 && !disabled && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
