import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/services/authContext';
import { COLORS, formatDateTime } from '@/constants/theme';
import { Badge } from '@/components/Badge';
import type { ApiResponse, AppNotification } from '@/types';

export default function ProfileScreen() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await apiClient.get<ApiResponse<AppNotification[]>>('/notifications');
      setNotifications(res.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleSaveProfile = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Validation', 'Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch('/users/me', {
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      await refreshUser();
      Alert.alert('Saved', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Validation', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 12) {
      Alert.alert('Validation', 'New password must be at least 12 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'New passwords do not match.');
      return;
    }
    setChangingPass(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully!');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setChangingPass(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      loadNotifications();
    } catch {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.govBar}>
        <View style={styles.govLeft}>
          <Image source={require('../../../assets/ashok-stambh.png')} style={styles.emblemImg} resizeMode="contain" />
          <Image source={require('../../../assets/civicpulse-logo.png')} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.govTitle}>My Profile & Notifications</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(true)} />}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'C')[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={{ marginTop: 6, flexDirection: 'row', gap: 6 }}>
              <Badge label={user?.role?.replace('_', ' ') || 'CITIZEN'} color={COLORS.primary} bg="#EFF6FF" />
              <Badge
                label={user?.isVerified || user?.identityVerified ? '✓ Verified' : 'Unverified'}
                color={user?.isVerified || user?.identityVerified ? COLORS.success : COLORS.warning}
                bg={user?.isVerified || user?.identityVerified ? '#D1FAE5' : '#FEF3C7'}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+91 ..."
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Enter current password"
            placeholderTextColor={COLORS.textMuted}
          />
          <Text style={styles.label}>New Password (min 12 characters)</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Enter new password"
            placeholderTextColor={COLORS.textMuted}
          />
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm new password"
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={changingPass}>
            <Text style={styles.saveBtnText}>{changingPass ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.notifHeader}>
            <Text style={styles.sectionTitle}>Notifications ({notifications.length})</Text>
            {notifications.some((n) => !n.isRead) ? (
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={styles.markRead}>Mark all read</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {notifications.length === 0 ? (
            <Text style={styles.emptyNotif}>No notifications yet.</Text>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <View key={n.id} style={[styles.notifItem, !n.isRead && styles.notifUnread]}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifBody}>{n.message}</Text>
                <Text style={styles.notifDate}>{formatDateTime(n.createdAt)}</Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  govBar: {
    backgroundColor: '#0F2557',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  govLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emblemImg: { width: 22, height: 28 },
  logoImg: { width: 26, height: 26, backgroundColor: '#FFFFFF', borderRadius: 6, padding: 2 },
  govTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 36, gap: 14 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  userName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  userEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginTop: 8, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F8FAFC',
    color: COLORS.text,
  },
  saveBtn: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  markRead: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 10 },
  emptyNotif: { fontSize: 13, color: COLORS.textMuted },
  notifItem: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  notifUnread: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, borderRadius: 8 },
  notifTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  notifBody: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  notifDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  logoutText: { color: COLORS.danger, fontWeight: '800', fontSize: 14 },
});
