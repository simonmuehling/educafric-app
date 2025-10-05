import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useAuthStore} from '../store/authStore';
import {colors, spacing} from '../theme';
import apiService from '../services/api';

export const DashboardScreen = () => {
  const {t} = useTranslation();
  const {user, logout} = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiService.logout();
      logout();
    } catch (error) {
      logout();
    }
  };

  const roleColor = {
    Director: colors.director,
    Teacher: colors.teacher,
    Student: colors.student,
    Parent: colors.parent,
    Freelancer: colors.freelancer,
    Commercial: colors.commercial,
  }[user?.role || 'Student'];

  const quickActions = [
    {id: 'attendance', label: t('dashboard.attendance'), icon: '📊'},
    {id: 'grades', label: t('dashboard.grades'), icon: '📚'},
    {id: 'homework', label: t('dashboard.homework'), icon: '✏️'},
    {id: 'timetable', label: t('dashboard.timetable'), icon: '📅'},
    {id: 'library', label: t('dashboard.library'), icon: '📖'},
    {id: 'documents', label: t('dashboard.documents'), icon: '📄'},
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, {backgroundColor: roleColor}]}>
        <Text style={styles.welcome}>
          {t('dashboard.welcome')}, {user?.firstName}!
        </Text>
        <Text style={styles.role}>{t(`roles.${user?.role.toLowerCase()}`)}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dashboard.overview')}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Coming Soon</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity key={action.id} style={styles.actionCard}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t('common.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  role: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  actionCard: {
    width: '31%',
    backgroundColor: colors.surface,
    margin: spacing.xs,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  logoutButton: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.error,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
