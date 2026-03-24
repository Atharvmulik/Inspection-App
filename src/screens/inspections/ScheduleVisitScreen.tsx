import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';

import { RootStackParamList } from '@/navigation';
import { useInspectionStore } from '@/store';
import { Card, Button, Input } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

export const ScheduleVisitScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleVisit'>>();
  const { inspectionId } = route.params;
  
  const inspection = useInspectionStore(state => state.getInspectionById(inspectionId));
  const scheduleVisit = useInspectionStore(state => state.scheduleVisit);
  const addTimelineEvent = useInspectionStore(state => state.addTimelineEvent);

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    inspection?.scheduledDate ? new Date(inspection.scheduledDate) : null
  );
  const [selectedTime, setSelectedTime] = useState<Date | null>(
    inspection?.scheduledDate ? new Date(inspection.scheduledDate) : null
  );
  const [remarks, setRemarks] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  React.useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 500 });
    contentTranslateY.value = withSpring(0, { damping: 12 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  if (!inspection) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Inspection not found</Text>
      </View>
    );
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    // Combine date and time
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(selectedTime.getHours());
    scheduledDateTime.setMinutes(selectedTime.getMinutes());

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    scheduleVisit(inspectionId, scheduledDateTime.toISOString(), remarks);
    
    addTimelineEvent(inspectionId, {
      type: 'visit_scheduled',
      title: 'Visit Scheduled',
      description: `Inspection visit scheduled for ${scheduledDateTime.toLocaleDateString()} at ${scheduledDateTime.toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      performedBy: 'Inspector Rajesh Kumar',
      status: 'completed',
      icon: 'calendar-check',
      color: Colors.secondary,
    });

    setIsSubmitting(false);
    setShowConfirmation(true);
  };

  const isFormValid = selectedDate && selectedTime;

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Select Time';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Visit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedView style={animatedStyle}>
          {/* School Info Card */}
          <Card style={styles.schoolCard}>
            <Icon name="school" size={32} color={Colors.primary} />
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>{inspection.school.name}</Text>
              <Text style={styles.schoolAddress}>
                {inspection.school.city}, {inspection.school.state}
              </Text>
            </View>
          </Card>

          {/* Date Selection */}
          <Text style={styles.sectionLabel}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={24} color={Colors.primary} />
            <Text style={[
              styles.dateTimeText,
              !selectedDate && styles.dateTimePlaceholder
            ]}>
              {formatDate(selectedDate)}
            </Text>
            <Icon name="chevron-right" size={24} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Time Selection */}
          <Text style={styles.sectionLabel}>Select Time</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="clock-outline" size={24} color={Colors.primary} />
            <Text style={[
              styles.dateTimeText,
              !selectedTime && styles.dateTimePlaceholder
            ]}>
              {formatTime(selectedTime)}
            </Text>
            <Icon name="chevron-right" size={24} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Remarks */}
          <Text style={styles.sectionLabel}>Remarks (Optional)</Text>
          <View style={styles.remarksContainer}>
            <Icon name="note-text" size={24} color={Colors.primary} style={styles.remarksIcon} />
            <TextInput
              style={styles.remarksInput}
              multiline
              numberOfLines={4}
              placeholder="Add any special instructions or notes..."
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>

          {/* Summary */}
          {isFormValid && (
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Schedule Summary</Text>
              <View style={styles.summaryRow}>
                <Icon name="calendar-check" size={20} color={Colors.success} />
                <Text style={styles.summaryText}>
                  {formatDate(selectedDate)} at {formatTime(selectedTime)}
                </Text>
              </View>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            title="Confirm Schedule"
            onPress={handleConfirm}
            disabled={!isFormValid}
            loading={isSubmitting}
            size="large"
            style={styles.submitButton}
          />

          <View style={styles.bottomPadding} />
        </AnimatedView>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={showDatePicker}
        date={selectedDate || new Date()}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setSelectedDate(date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Time Picker Modal */}
      <DatePicker
        modal
        open={showTimePicker}
        date={selectedTime || new Date()}
        mode="time"
        onConfirm={(date) => {
          setShowTimePicker(false);
          setSelectedTime(date);
        }}
        onCancel={() => setShowTimePicker(false)}
      />

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowConfirmation(false);
          navigation.goBack();
        }}
      >
        <View style={styles.confirmationOverlay}>
          <AnimatedView style={[styles.confirmationContent]}>
            <View style={styles.confirmationIcon}>
              <Icon name="check-circle" size={64} color={Colors.success} />
            </View>
            <Text style={styles.confirmationTitle}>Visit Scheduled!</Text>
            <Text style={styles.confirmationMessage}>
              Your inspection visit has been scheduled successfully.
            </Text>
            <Text style={styles.confirmationDetails}>
              {selectedDate && formatDate(selectedDate)} at {selectedTime && formatTime(selectedTime)}
            </Text>
            <Button
              title="Done"
              onPress={() => {
                setShowConfirmation(false);
                navigation.goBack();
              }}
              style={styles.confirmationButton}
            />
          </AnimatedView>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  schoolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  schoolInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  schoolName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  schoolAddress: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateTimeText: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
  dateTimePlaceholder: {
    color: Colors.textMuted,
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  remarksIcon: {
    marginTop: Spacing.xs,
  },
  remarksInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginLeft: Spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  summaryTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.xl,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  confirmationContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  confirmationIcon: {
    marginBottom: Spacing.lg,
  },
  confirmationTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    marginBottom: Spacing.sm,
  },
  confirmationMessage: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  confirmationDetails: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  confirmationButton: {
    minWidth: 120,
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

export default ScheduleVisitScreen;
