import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const shimmerProgress = useSharedValue(0);

  React.useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerProgress.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[
      styles.container,
      { width, height, borderRadius },
      style,
    ]}>
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
};

interface CardShimmerProps {
  count?: number;
}

export const CardShimmer: React.FC<CardShimmerProps> = ({ count = 3 }) => {
  return (
    <View style={styles.cardContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <Shimmer width={120} height={16} style={styles.cardTitle} />
          <Shimmer width="80%" height={14} style={styles.cardLine} />
          <Shimmer width="60%" height={14} style={styles.cardLine} />
          <View style={styles.cardFooter}>
            <Shimmer width={80} height={24} borderRadius={BorderRadius.full} />
            <Shimmer width={60} height={24} borderRadius={BorderRadius.full} />
          </View>
        </View>
      ))}
    </View>
  );
};

interface ListShimmerProps {
  count?: number;
}

export const ListShimmer: React.FC<ListShimmerProps> = ({ count = 5 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <Shimmer width={48} height={48} borderRadius={BorderRadius.full} />
          <View style={styles.listContent}>
            <Shimmer width="70%" height={16} style={styles.listLine} />
            <Shimmer width="50%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
};

interface StatsShimmerProps {
  count?: number;
}

export const StatsShimmer: React.FC<StatsShimmerProps> = ({ count = 4 }) => {
  return (
    <View style={styles.statsContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.statCard}>
          <Shimmer width={40} height={40} borderRadius={BorderRadius.md} style={styles.statIcon} />
          <Shimmer width={60} height={24} style={styles.statValue} />
          <Shimmer width={80} height={14} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardContainer: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
  },
  cardLine: {
    marginBottom: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  listContainer: {
    padding: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  listLine: {
    marginBottom: Spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: (SCREEN_WIDTH - Spacing.md * 3) / 2,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: Spacing.sm,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
});

import { Shadows } from '@/theme';

export default Shimmer;
