import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useThemedStyles } from '@/theme';
import { createStyles } from './OTPInput.styles';

export interface OTPInputProps {
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  error?: boolean;
  disabled?: boolean;
  length?: number;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  onComplete,
  error = false,
  disabled = false,
  length = 6,
}) => {
  const styles = useThemedStyles(createStyles);
  const inputRef = useRef<TextInput | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Blinking cursor in active box
  useEffect(() => {
    if (!isFocused) return;
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 550);
    return () => clearInterval(interval);
  }, [isFocused]);

  const handleChangeText = (text: string) => {
    if (disabled) return;
    const cleaned = text.replace(/\D/g, '').slice(0, length);
    onChange(cleaned);

    if (cleaned.length === length && onComplete) {
      onComplete(cleaned);
    }
  };

  const handlePress = () => {
    if (disabled) return;
    inputRef.current?.focus();
  };

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="none"
      accessibilityLabel="OTP Input Container"
    >
      <View style={styles.inputWrapper}>
        {/* Single Hidden TextInput handling all keystrokes, pastes, and SMS autofill */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={value}
          onChangeText={handleChangeText}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={length}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          caretHidden
          autoFocus={false}
          accessibilityLabel="Enter 6-digit verification code"
        />

        {/* Visual Digit Boxes */}
        <View style={styles.row} pointerEvents="none">
          {digits.map((digit, idx) => {
            const isBoxFocused =
              isFocused &&
              (idx === value.length || (idx === length - 1 && value.length === length));
            const isFilled = Boolean(digit);
            const showCursor = isFocused && idx === value.length && cursorVisible;

            return (
              <View
                key={idx}
                style={[
                  styles.box,
                  isBoxFocused && styles.boxFocused,
                  isFilled && styles.boxFilled,
                  error && styles.boxError,
                ]}
              >
                {digit ? (
                  <Text style={styles.digitText}>{digit}</Text>
                ) : showCursor ? (
                  <View style={styles.cursor} />
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </Pressable>
  );
};
