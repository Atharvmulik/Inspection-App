import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '@/navigation';
import { Colors, Spacing, Typography } from '@/theme';

const { width, height } = Dimensions.get('window');

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Animation sequence
    logoOpacity.value = withTiming(1, { duration: 500 });
    
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 600, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
    );

    textOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 600 })
    );

    textTranslateY.value = withDelay(
      800,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) })
    );

    taglineOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 500 })
    );

    progressWidth.value = withDelay(
      1500,
      withTiming(100, { duration: 2000, easing: Easing.inOut(Easing.ease) })
    );

    // Navigate to login after animation
    const timeout = setTimeout(() => {
      navigation.replace('Login');
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo Container */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoBackground}>
            <AnimatedIcon
              name="shield-check"
              size={80}
              color={Colors.accent}
            />
          </View>
        </Animated.View>

        {/* App Title */}
        <Animated.View style={[styles.titleContainer, textAnimatedStyle]}>
          <Text style={styles.title}>EduInspect</Text>
          <Text style={styles.subtitle}>Government of India</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, taglineAnimatedStyle]}>
          School Inspection & Monitoring System
        </Animated.Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, progressAnimatedStyle]} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Ministry of Education</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.extrabold,
    color: Colors.textInverse,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.accent,
    marginTop: Spacing.xs,
  },
  tagline: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  progressContainer: {
    width: width * 0.6,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: Spacing.xs,
  },
  versionText: {
    fontSize: Typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export default SplashScreen;
