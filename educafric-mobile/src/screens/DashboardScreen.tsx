import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await ApiService.getDashboardData(user.id);
      setDashboardData(data);
    } catch (error: any) {
      console.error('Dashboard data error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'student': 'Student',
      'parent': 'Parent',
      'teacher': 'Teacher',
      'admin': 'Administrator',
      'director': 'Director',
      'commercial': 'Commercial',
      'freelancer': 'Freelancer',
      'siteadmin': 'Site Admin'
    };
    return roleMap[role] || role;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.userRole}>{getRoleDisplayName(user?.role || '')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Quick Overview</Text>
        <View style={styles.statsGrid}>
          {user?.role === 'student' && (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>85%</Text>
                <Text style={styles.statLabel}>Attendance</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>15.2</Text>
                <Text style={styles.statLabel}>Average Grade</Text>
              </View>
            </>
          )}
          
          {user?.role === 'teacher' && (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>My Classes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>120</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
            </>
          )}

          {user?.role === 'parent' && (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Children</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>New Messages</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {user?.role === 'student' && (
            <>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>View Grades</Text>
                <Text style={styles.actionDescription}>Check your latest grades</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Homework</Text>
                <Text style={styles.actionDescription}>View assignments</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Schedule</Text>
                <Text style={styles.actionDescription}>View timetable</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Messages</Text>
                <Text style={styles.actionDescription}>Check communications</Text>
              </TouchableOpacity>
            </>
          )}

          {user?.role === 'teacher' && (
            <>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>My Classes</Text>
                <Text style={styles.actionDescription}>Manage your classes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Grade Book</Text>
                <Text style={styles.actionDescription}>Enter grades</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Attendance</Text>
                <Text style={styles.actionDescription}>Take attendance</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Homework</Text>
                <Text style={styles.actionDescription}>Assign homework</Text>
              </TouchableOpacity>
            </>
          )}

          {user?.role === 'parent' && (
            <>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Child Progress</Text>
                <Text style={styles.actionDescription}>View grades & attendance</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Messages</Text>
                <Text style={styles.actionDescription}>School communications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Schedule</Text>
                <Text style={styles.actionDescription}>Child's timetable</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Payments</Text>
                <Text style={styles.actionDescription}>School fees & billing</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.userInfoCard}>
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoLabel}>Email:</Text>
            <Text style={styles.userInfoValue}>{user?.email}</Text>
          </View>
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoLabel}>Role:</Text>
            <Text style={styles.userInfoValue}>{getRoleDisplayName(user?.role || '')}</Text>
          </View>
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoLabel}>Status:</Text>
            <Text style={[styles.userInfoValue, { color: user?.isActive ? '#10b981' : '#ef4444' }]}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          {user?.schoolId && (
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>School ID:</Text>
              <Text style={styles.userInfoValue}>{user.schoolId}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#0079F2',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  userRole: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: 4,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0079F2',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  userInfoContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  userInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userInfoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
});

export default DashboardScreen;