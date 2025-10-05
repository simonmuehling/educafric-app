import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useAuthStore} from '../store/authStore';
import {colors} from '../theme/colors';
import apiService from '../services/api';
import {requestPostNotifications} from '../services/permissions';

export const DashboardScreen = () => {
  const {t} = useTranslation();
  const {user, logout} = useAuthStore();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      logout();
    } catch (error) {
      logout();
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('auth.deleteAccount'),
      t('auth.deleteAccountConfirm'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAccount();
              Alert.alert(t('common.error'), t('auth.deleteSuccess'));
              logout();
            } catch (error: any) {
              Alert.alert(t('common.error'), error.message);
            }
          },
        },
      ],
    );
  };

  const handleRequestNotifications = async () => {
    const granted = await requestPostNotifications();
    setShowPermissionPrompt(false);
    if (granted) {
      Alert.alert('Success', 'Notifications enabled');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>
          {t('dashboard.welcome')}, {user?.firstName}!
        </Text>
        <Text style={styles.role}>{user?.role}</Text>
      </View>

      <ScrollView style={styles.content}>
        {showPermissionPrompt && (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>
              {t('permissions.notificationsTitle')}
            </Text>
            <Text style={styles.permissionMessage}>
              {t('permissions.notificationsMessage')}
            </Text>
            <View style={styles.permissionButtons}>
              <TouchableOpacity
                style={styles.permissionButtonSecondary}
                onPress={() => setShowPermissionPrompt(false)}>
                <Text style={styles.permissionButtonSecondaryText}>
                  {t('permissions.notNow')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.permissionButtonPrimary}
                onPress={handleRequestNotifications}>
                <Text style={styles.permissionButtonPrimaryText}>
                  {t('permissions.allow')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowPermissionPrompt(true)}>
            <Text style={styles.actionText}>Enable Notifications</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>{t('auth.deleteAccount')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>{t('auth.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 24,
    paddingTop: 48,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  permissionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.info,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  permissionMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  permissionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  permissionButtonSecondary: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  permissionButtonSecondaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  permissionButtonPrimary: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  permissionButtonPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  deleteButton: {
    padding: 16,
    backgroundColor: colors.error,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 16,
    backgroundColor: colors.textSecondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
