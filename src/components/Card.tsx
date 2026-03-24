import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, Shadows } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  pressable?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  pressable = false,
  elevation = 'md',
  padding = 'md',
}) => {
  const scale = useSharedValue(1);
  const elevationAnim = useSharedValue(elevation === 'none' ? 0 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.95, { damping: 12, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 15 });
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'sm': return Spacing.sm;
      case 'md': return Spacing.md;
      case 'lg': return Spacing.lg;
      default: return Spacing.md;
    }
  };

  const getShadow = () => {
    switch (elevation) {
      case 'none': return {};
      case 'sm': return Shadows.sm;
      case 'md': return Shadows.md;
      case 'lg': return Shadows.lg;
      case 'xl': return Shadows.xl;
      default: return Shadows.md;
    }
  };

  const content = (
    <AnimatedView
      style={[
        styles.card,
        {
          padding: getPadding(),
          ...getShadow(),
        },
        pressable && animatedStyle,
        style,
      ]}
    >
      {children}
    </AnimatedView>
  );

  if (pressable && onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
});

export default Card;
