import React, { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import { useThemedStyles } from '@/theme';
import { createStyles } from './ChatSkeleton.styles';

export const ChatSkeletonItem: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const [opacityAnim] = useState(() => new Animated.Value(0.35));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <View style={styles.itemContainer}>
      <Animated.View style={[styles.avatarSkeleton, { opacity: opacityAnim }]} />
      <View style={styles.contentSkeleton}>
        <View style={styles.topRowSkeleton}>
          <Animated.View style={[styles.nameSkeleton, { opacity: opacityAnim }]} />
          <Animated.View style={[styles.timeSkeleton, { opacity: opacityAnim }]} />
        </View>
        <Animated.View style={[styles.messageSkeleton, { opacity: opacityAnim }]} />
      </View>
    </View>
  );
};

export const ChatSkeletonList: React.FC<{ count?: number }> = ({ count = 6 }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, idx) => (
        <ChatSkeletonItem key={idx} />
      ))}
    </View>
  );
};
