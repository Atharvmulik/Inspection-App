import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolateColor 
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  icon?: string;
  secureTextEntry?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  helperText?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Input: React.FC<InputProps> = ({
  label,
  error,
  touched,
  icon,
  secureTextEntry = false,
  containerStyle,
  labelStyle,
  inputStyle,
  helperText,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const focusProgress = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [Colors.border, Colors.primary]
    ),
    borderWidth: 1 + focusProgress.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    focusProgress.value = withSpring(1, { damping: 20 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusProgress.value = withSpring(0, { damping: 20 });
  };

  const showError = error && touched;
  const showHelper = helperText && !showError;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <AnimatedView
        style={[
          styles.inputContainer,
          animatedBorderStyle,
          showError && styles.errorBorder,
        ]}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={showError ? Colors.error : isFocused ? Colors.primary : Colors.textMuted}
            style={styles.icon}
          />
        )}
        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            inputStyle,
          ]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </AnimatedView>
      {showError && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      {showHelper && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  inputWithIcon: {
    marginLeft: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
  errorBorder: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  errorText: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  helperText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});

export default Input;
