import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '@/navigation';
import { useAppStore, useAuthStore } from '@/store';
import { Card } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';

interface SettingItemProps {
  icon: string;
  label: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  description,
  value,
  onPress,
  toggle,
  toggleValue,
  onToggle,
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress && !toggle}>
      <Card style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
          <Icon name={icon} size={22} color={Colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={toggleValue ? Colors.surface : Colors.surface}
          />
        ) : value ? (
          <Text style={styles.settingValue}>{value}</Text>
        ) : (
          <Icon name="chevron-right" size={20} color={Colors.textMuted} />
        )}
      </Card>
    </TouchableOpacity>
  );
};

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const logout = useAuthStore(state => state.logout);
  
  const {
    isDarkMode,
    toggleDarkMode,
    isBiometricEnabled,
    setBiometricEnabled,
    autoLogoutMinutes,
    setAutoLogoutMinutes,
  } = useAppStore();

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <SettingItem
          icon={isDarkMode ? 'weather-night' : 'white-balance-sunny'}
          label="Dark Mode"
          description="Enable dark theme for the app"
          toggle
          toggleValue={isDarkMode}
          onToggle={toggleDarkMode}
        />

        {/* Security */}
        <Text style={styles.sectionTitle}>Security</Text>
        <SettingItem
          icon="fingerprint"
          label="Biometric Authentication"
          description="Use Face ID or Fingerprint to unlock"
          toggle
          toggleValue={isBiometricEnabled}
          onToggle={setBiometricEnabled}
        />
        <SettingItem
          icon="timer"
          label="Auto Logout"
          description="Automatically logout after inactivity"
          value={`${autoLogoutMinutes} min`}
          onPress={() => {
            const options = ['5 min', '15 min', '30 min', '1 hour', 'Cancel'];
            Alert.alert(
              'Auto Logout',
              'Select auto logout time',
              options.map((option, index) => ({
                text: option,
                onPress: () => {
                  if (option !== 'Cancel') {
                    const minutes = [5, 15, 30, 60][index];
                    setAutoLogoutMinutes(minutes);
                  }
                },
              }))
            );
          }}
        />

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          icon="bell"
          label="Push Notifications"
          description="Receive push notifications"
          toggle
          toggleValue={true}
          onToggle={() => {}}
        />
        <SettingItem
          icon="email"
          label="Email Notifications"
          description="Receive email updates"
          toggle
          toggleValue={true}
          onToggle={() => {}}
        />

        {/* Data */}
        <Text style={styles.sectionTitle}>Data</Text>
        <SettingItem
          icon="sync"
          label="Auto Sync"
          description="Automatically sync data when online"
          toggle
          toggleValue={true}
          onToggle={() => {}}
        />
        <SettingItem
          icon="delete-sweep"
          label="Clear Cache"
          description="Clear temporary files and data"
          onPress={handleClearCache}
        />

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <SettingItem
          icon="information"
          label="App Version"
          value="1.0.0"
        />
        <SettingItem
          icon="file-document"
          label="Terms of Service"
          onPress={() => {}}
        />
        <SettingItem
          icon="shield-lock"
          label="Privacy Policy"
          onPress={() => {}}
        />
        <SettingItem
          icon="help-circle"
          label="Help & Support"
          onPress={() => {}}
        />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

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
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  settingDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  logoutText: {
    fontSize: Typography.sizes.base,
    color: Colors.error,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});

export default SettingsScreen;
