import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';

type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'accent';

type BadgeSize = 'small' | 'medium';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'medium',
  style,
  icon,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'default': return Colors.background;
      case 'primary': return Colors.primary;
      case 'secondary': return Colors.secondary;
      case 'success': return Colors.success;
      case 'warning': return Colors.warning;
      case 'error': return Colors.error;
      case 'info': return Colors.info;
      case 'accent': return Colors.accent;
      default: return Colors.background;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'default': return Colors.text;
      case 'primary': return Colors.textInverse;
      case 'secondary': return Colors.textInverse;
      case 'success': return Colors.textInverse;
      case 'warning': return Colors.text;
      case 'error': return Colors.textInverse;
      case 'info': return Colors.textInverse;
      case 'accent': return Colors.text;
      default: return Colors.text;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: 2, paddingHorizontal: Spacing.sm };
      case 'medium': return { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md };
      default: return { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return Typography.sizes.xs;
      case 'medium': return Typography.sizes.sm;
      default: return Typography.sizes.sm;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          ...getPadding(),
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: getFontSize(),
            marginLeft: icon ? Spacing.xs : 0,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: Typography.weights.semibold,
  },
});

export default Badge;
