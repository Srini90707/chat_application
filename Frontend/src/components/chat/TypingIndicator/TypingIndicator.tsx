import React, { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import { useThemedStyles } from '@/theme';
import { createStyles } from './TypingIndicator.styles';

interface TypingIndicatorProps {
  userName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = () => {
  const styles = useThemedStyles(createStyles);
  const [dot1] = useState(() => new Animated.Value(0.3));
  const [dot2] = useState(() => new Animated.Value(0.3));
  const [dot3] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 350,
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    };

    const anim1 = createPulse(dot1, 0);
    const anim2 = createPulse(dot2, 180);
    const anim3 = createPulse(dot3, 360);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
};
