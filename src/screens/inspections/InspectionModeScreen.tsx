import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated as RNAnimated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '@/navigation';
import { useInspectionStore } from '@/store';
import { Button } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

export const InspectionModeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'InspectionMode'>>();
  const { inspectionId } = route.params;
  
  const inspection = useInspectionStore(state => state.getInspectionById(inspectionId));
  const updateInspectionStatus = useInspectionStore(state => state.updateInspectionStatus);
  const addTimelineEvent = useInspectionStore(state => state.addTimelineEvent);

  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'active' | 'error'>('searching');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pulsing animation for active badge
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 1;
    }
  }, [isActive]);

  // Timer effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  // Simulate GPS status
  useEffect(() => {
    const timeout = setTimeout(() => {
      setGpsStatus('active');
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartInspection = () => {
    setIsActive(true);
    updateInspectionStatus(inspectionId, 'in_progress');
    
    addTimelineEvent(inspectionId, {
      type: 'inspection_started',
      title: 'Inspection Started',
      description: 'Physical inspection commenced at school premises',
      timestamp: new Date().toISOString(),
      performedBy: 'Inspector Rajesh Kumar',
      status: 'completed',
      icon: 'play-circle',
      color: Colors.primary,
    });
  };

  const handleEndInspection = () => {
    Alert.alert(
      'End Inspection',
      'Are you sure you want to end this inspection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => {
            setIsActive(false);
            updateInspectionStatus(inspectionId, 'completed');
            
            addTimelineEvent(inspectionId, {
              type: 'inspection_completed',
              title: 'Inspection Completed',
              description: `Physical inspection completed. Duration: ${formatTime(elapsedTime)}`,
              timestamp: new Date().toISOString(),
              performedBy: 'Inspector Rajesh Kumar',
              status: 'completed',
              icon: 'check-all',
              color: Colors.success,
            });

            Alert.alert(
              'Inspection Completed',
              'What would you like to do next?',
              [
                { text: 'Go Back', onPress: () => navigation.goBack() },
                { text: 'Submit Report', onPress: () => navigation.navigate('FinalReport', { inspectionId }) },
              ]
            );
          },
        },
      ]
    );
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  if (!inspection) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Inspection not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Mode</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Active Status Badge */}
      <View style={styles.statusContainer}>
        {isActive ? (
          <AnimatedView style={[styles.activeBadge, pulseStyle]}>
            <View style={styles.activeIndicator} />
            <Text style={styles.activeText}>INSPECTION ACTIVE</Text>
          </AnimatedView>
        ) : (
          <View style={styles.inactiveBadge}>
            <Icon name="pause-circle" size={20} color={Colors.textMuted} />
            <Text style={styles.inactiveText}>READY TO START</Text>
          </View>
        )}
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Elapsed Time</Text>
        <Text style={styles.timerValue}>{formatTime(elapsedTime)}</Text>
      </View>

      {/* Status Indicators */}
      <View style={styles.indicatorsContainer}>
        {/* GPS Status */}
        <View style={styles.indicatorCard}>
          <View style={[
            styles.indicatorIcon,
            { backgroundColor: gpsStatus === 'active' ? Colors.successLight : Colors.warningLight }
          ]}>
            <Icon 
              name="crosshairs-gps" 
              size={28} 
              color={gpsStatus === 'active' ? Colors.success : Colors.warning} 
            />
          </View>
          <Text style={styles.indicatorLabel}>GPS</Text>
          <Text style={[
            styles.indicatorValue,
            { color: gpsStatus === 'active' ? Colors.success : Colors.warning }
          ]}>
            {gpsStatus === 'searching' ? 'Searching...' : gpsStatus === 'active' ? 'Active' : 'Error'}
          </Text>
        </View>

        {/* Offline Mode */}
        <TouchableOpacity 
          style={styles.indicatorCard}
          onPress={() => setIsOfflineMode(!isOfflineMode)}
        >
          <View style={[
            styles.indicatorIcon,
            { backgroundColor: isOfflineMode ? Colors.infoLight : Colors.background }
          ]}>
            <Icon 
              name={isOfflineMode ? 'wifi-off' : 'wifi'} 
              size={28} 
              color={isOfflineMode ? Colors.info : Colors.textMuted} 
            />
          </View>
          <Text style={styles.indicatorLabel}>Mode</Text>
          <Text style={[
            styles.indicatorValue,
            { color: isOfflineMode ? Colors.info : Colors.textMuted }
          ]}>
            {isOfflineMode ? 'Offline' : 'Online'}
          </Text>
        </TouchableOpacity>

        {/* Session Status */}
        <View style={styles.indicatorCard}>
          <View style={[
            styles.indicatorIcon,
            { backgroundColor: isActive ? Colors.successLight : Colors.background }
          ]}>
            <Icon 
              name="shield-check" 
              size={28} 
              color={isActive ? Colors.success : Colors.textMuted} 
            />
          </View>
          <Text style={styles.indicatorLabel}>Session</Text>
          <Text style={[
            styles.indicatorValue,
            { color: isActive ? Colors.success : Colors.textMuted }
          ]}>
            {isActive ? 'Secure' : 'Idle'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('EvidenceUpload', { inspectionId })}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.infoLight }]}>
              <Icon name="camera" size={28} color={Colors.info} />
            </View>
            <Text style={styles.actionLabel}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('EvidenceUpload', { inspectionId })}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.warningLight }]}>
              <Icon name="video" size={28} color={Colors.warning} />
            </View>
            <Text style={styles.actionLabel}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('DigitalChecklist', { inspectionId })}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.successLight }]}>
              <Icon name="clipboard-list" size={28} color={Colors.success} />
            </View>
            <Text style={styles.actionLabel}>Checklist</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Timeline', { inspectionId })}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primaryLight }]}>
              <Icon name="timeline" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Timeline</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Action Button */}
      <View style={styles.mainActionContainer}>
        {!isActive ? (
          <Button
            title="Start Inspection"
            onPress={handleStartInspection}
            size="large"
            style={styles.startButton}
          />
        ) : (
          <Button
            title="End Inspection"
            onPress={handleEndInspection}
            variant="danger"
            size="large"
            style={styles.endButton}
          />
        )}
      </View>

      {/* School Info Footer */}
      <View style={styles.footer}>
        <Icon name="school" size={20} color={Colors.textMuted} />
        <Text style={styles.footerText} numberOfLines={1}>
          {inspection.school.name}
        </Text>
      </View>
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
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textInverse,
    marginRight: Spacing.sm,
  },
  activeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  inactiveText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  timerLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  timerValue: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  indicatorCard: {
    alignItems: 'center',
  },
  indicatorIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  indicatorLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  indicatorValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  actionsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  actionsTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '22%',
    marginBottom: Spacing.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text,
    textAlign: 'center',
  },
  mainActionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  startButton: {
    backgroundColor: Colors.success,
  },
  endButton: {},
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    maxWidth: '80%',
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

export default InspectionModeScreen;
