import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

import { RootStackParamList } from '@/navigation';
import { useInspectionStore } from '@/store';
import { Card, Button } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { ChecklistItem, ChecklistSection } from '@/types';

const AnimatedView = Animated.createAnimatedComponent(View);

type ItemStatus = 'pass' | 'fail' | 'needs_improvement' | 'not_checked';

const statusConfig: Record<ItemStatus, { label: string; color: string; icon: string }> = {
  pass: { label: 'Pass', color: Colors.success, icon: 'check' },
  fail: { label: 'Fail', color: Colors.error, icon: 'close' },
  needs_improvement: { label: 'Needs Work', color: Colors.warning, icon: 'alert' },
  not_checked: { label: 'Not Checked', color: Colors.textMuted, icon: 'minus' },
};

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onStatusChange: (status: ItemStatus) => void;
  onCommentChange: (comment: string) => void;
}

const ChecklistItemRow: React.FC<ChecklistItemRowProps> = ({
  item,
  onStatusChange,
  onCommentChange,
}) => {
  const [showComment, setShowComment] = useState(!!item.comment);

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.isRequired && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          )}
        </View>
        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}
      </View>

      {/* Status Buttons */}
      <View style={styles.statusButtons}>
        {(Object.keys(statusConfig) as ItemStatus[]).map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              item.status === status && { 
                backgroundColor: statusConfig[status].color,
                borderColor: statusConfig[status].color,
              }
            ]}
            onPress={() => onStatusChange(status)}
          >
            <Icon
              name={statusConfig[status].icon}
              size={16}
              color={item.status === status ? Colors.textInverse : statusConfig[status].color}
            />
            <Text style={[
              styles.statusButtonText,
              item.status === status && { color: Colors.textInverse }
            ]}>
              {statusConfig[status].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Comment Section */}
      <TouchableOpacity
        style={styles.commentToggle}
        onPress={() => setShowComment(!showComment)}
      >
        <Icon name="comment-text" size={16} color={Colors.primary} />
        <Text style={styles.commentToggleText}>
          {showComment ? 'Hide Comment' : 'Add Comment'}
        </Text>
      </TouchableOpacity>

      {showComment && (
        <TextInput
          style={styles.commentInput}
          multiline
          placeholder="Add your observations..."
          value={item.comment || ''}
          onChangeText={onCommentChange}
        />
      )}
    </View>
  );
};

interface SectionCardProps {
  section: ChecklistSection;
  onToggle: () => void;
  onItemUpdate: (itemId: string, updates: Partial<ChecklistItem>) => void;
  index: number;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  onToggle,
  onItemUpdate,
  index,
}) => {
  const height = useSharedValue(section.isExpanded ? 1 : 0);
  const rotation = useSharedValue(section.isExpanded ? 180 : 0);

  const handleToggle = () => {
    height.value = withTiming(section.isExpanded ? 0 : 1, { duration: 300 });
    rotation.value = withTiming(section.isExpanded ? 0 : 180, { duration: 300 });
    onToggle();
  };

  const contentStyle = useAnimatedStyle(() => ({
    height: section.isExpanded ? 'auto' : 0,
    opacity: height.value,
    overflow: 'hidden',
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const completedItems = section.items.filter(i => i.status !== 'not_checked').length;
  const progress = (completedItems / section.items.length) * 100;

  return (
    <Card style={styles.sectionCard}>
      <TouchableOpacity style={styles.sectionHeader} onPress={handleToggle}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconContainer}>
            <Icon name="format-list-checks" size={24} color={Colors.primary} />
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionDescription}>{section.description}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completedItems} / {section.items.length} checked
            </Text>
          </View>
        </View>
        <Animated.View style={iconStyle}>
          <Icon name="chevron-down" size={24} color={Colors.textMuted} />
        </Animated.View>
      </TouchableOpacity>

      {section.isExpanded && (
        <View style={styles.sectionContent}>
          {section.items.map(item => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onStatusChange={(status) => onItemUpdate(item.id, { status })}
              onCommentChange={(comment) => onItemUpdate(item.id, { comment })}
            />
          ))}
        </View>
      )}
    </Card>
  );
};

export const DigitalChecklistScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'DigitalChecklist'>>();
  const { inspectionId } = route.params;
  
  const inspection = useInspectionStore(state => state.getInspectionById(inspectionId));
  const updateChecklistItem = useInspectionStore(state => state.updateChecklistItem);

  const [sections, setSections] = useState<ChecklistSection[]>(inspection?.checklist || []);

  if (!inspection) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Inspection not found</Text>
      </View>
    );
  }

  const toggleSection = (sectionId: string) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
      )
    );
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    updateChecklistItem(inspectionId, sectionId, itemId, updates);
    
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map(i =>
                i.id === itemId ? { ...i, ...updates } : i
              ),
            }
          : s
      )
    );
  };

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const checkedItems = sections.reduce(
    (acc, s) => acc + s.items.filter(i => i.status !== 'not_checked').length,
    0
  );
  const overallProgress = (checkedItems / totalItems) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Digital Checklist</Text>
          <Text style={styles.headerSubtitle}>
            {Math.round(overallProgress)}% Complete
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Overall Progress */}
      <View style={styles.overallProgress}>
        <View style={styles.overallProgressBar}>
          <View style={[styles.overallProgressFill, { width: `${overallProgress}%` }]} />
        </View>
        <Text style={styles.overallProgressText}>
          {checkedItems} of {totalItems} items checked
        </Text>
      </View>

      {/* Sections List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            index={index}
            onToggle={() => toggleSection(section.id)}
            onItemUpdate={(itemId, updates) => updateItem(section.id, itemId, updates)}
          />
        ))}
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
  overallProgress: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  overallProgressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  overallProgressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionCard: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  sectionDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  itemRow: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemHeader: {
    marginBottom: Spacing.md,
  },
  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  requiredText: {
    fontSize: 10,
    color: Colors.error,
    fontWeight: Typography.weights.semibold,
  },
  itemDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  statusButtonText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  commentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  commentToggleText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
    marginTop: Spacing.md,
    backgroundColor: Colors.background,
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

export default DigitalChecklistScreen;
