import { DefaultTheme } from 'react-native-paper';

export const Colors = {
  // Primary Government Colors
  primary: '#0B3D91',
  primaryDark: '#082E6D',
  primaryLight: '#1A52B5',
  
  // Secondary Colors
  secondary: '#0F766E',
  secondaryDark: '#0A524D',
  secondaryLight: '#14A39A',
  
  // Accent Colors
  accent: '#C6A700',
  accentDark: '#9A8000',
  accentLight: '#E5C100',
  
  // Background Colors
  background: '#F4F6F9',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Text Colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Border Colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Priority Colors
  highPriority: '#DC2626',
  mediumPriority: '#F59E0B',
  lowPriority: '#10B981',
  
  // Gradient Colors
  gradientStart: '#0B3D91',
  gradientEnd: '#0F766E',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const Typography = {
  // Font Sizes
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Font Weights
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    accent: Colors.accent,
    background: Colors.background,
    surface: Colors.surface,
    text: Colors.text,
    error: Colors.error,
    success: Colors.success,
    warning: Colors.warning,
  },
  roundness: BorderRadius.md,
};

export type ThemeType = typeof Theme;
