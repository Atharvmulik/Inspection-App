import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '@/navigation';
import { useInspectionStore } from '@/store';
import { Card } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { TimelineEvent } from '@/types';

const AnimatedView = Animated.createAnimatedComponent(View);

interface TimelineItemProps {
  event: TimelineEvent;
  index: number;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, index, isLast }) => {
  const translateX = useSharedValue(-30);
  const opacity = useSharedValue(0);
  const lineHeight = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withDelay(index * 100, withSpring(0, { damping: 12 }));
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
    lineHeight.value = withDelay(index * 100 + 200, withTiming(1, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const lineStyle = useAnimatedStyle(() => ({
    opacity: lineHeight.value,
  }));

  const getStatusColor = () => {
    return event.color || Colors.primary;
  };

  const getStatusIcon = () => {
    return event.icon || 'circle';
  };

  return (
    <AnimatedView style={[styles.timelineItem, animatedStyle]}>
      {/* Timeline Line */}
      {!isLast && (
        <Animated.View 
          style={[
            styles.timelineLine, 
            lineStyle,
            { backgroundColor: getStatusColor() }
          ]} 
        />
      )}

      {/* Timeline Node */}
      <View style={[styles.timelineNode, { backgroundColor: getStatusColor() }]}>
        <Icon name={getStatusIcon()} size={16} color={Colors.textInverse} />
      </View>

      {/* Event Card */}
      <Card style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: event.status === 'completed' ? Colors.successLight : Colors.warningLight }
          ]}>
            <Text style={[
              styles.statusText,
              { color: event.status === 'completed' ? Colors.success : Colors.warning }
            ]}>
              {event.status === 'completed' ? 'Done' : 'Pending'}
            </Text>
          </View>
        </View>

        {event.description && (
          <Text style={styles.eventDescription}>{event.description}</Text>
        )}

        <View style={styles.eventFooter}>
          <View style={styles.eventMeta}>
            <Icon name="calendar" size={14} color={Colors.textMuted} />
            <Text style={styles.eventMetaText}>
              {new Date(event.timestamp).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.eventMeta}>
            <Icon name="clock-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.eventMetaText}>
              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <View style={styles.performedBy}>
          <Icon name="account" size={14} color={Colors.textMuted} />
          <Text style={styles.performedByText}>by {event.performedBy}</Text>
        </View>
      </Card>
    </AnimatedView>
  );
};

export const TimelineScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Timeline'>>();
  const { inspectionId } = route.params;
  
  const inspection = useInspectionStore(state => state.getInspectionById(inspectionId));

  if (!inspection) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Inspection not found</Text>
      </View>
    );
  }

  const sortedTimeline = [...inspection.timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const completedEvents = sortedTimeline.filter(e => e.status === 'completed').length;
  const progress = (completedEvents / sortedTimeline.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Timeline</Text>
          <Text style={styles.headerSubtitle}>
            {completedEvents} of {sortedTimeline.length} completed
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
      </View>

      {/* Timeline List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.timelineContainer}>
          {sortedTimeline.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              index={index}
              isLast={index === sortedTimeline.length - 1}
            />
          ))}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  progressContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  timelineContainer: {
    paddingLeft: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 40,
    width: 2,
    height: '100%',
    opacity: 0.3,
  },
  timelineNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    zIndex: 1,
  },
  eventCard: {
    flex: 1,
    padding: Spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  eventTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
  },
  eventDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.sizes.sm * 1.5,
  },
  eventFooter: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  eventMetaText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  performedBy: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performedByText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.text,
  },
});

export default TimelineScreen;
