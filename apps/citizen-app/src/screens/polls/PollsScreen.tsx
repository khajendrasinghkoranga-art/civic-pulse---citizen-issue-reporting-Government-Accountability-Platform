import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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
import { EmptyState } from '@/components/EmptyState';
import type { ApiResponse, Poll } from '@/types';

export default function PollsScreen() {
  const { user, refreshUser } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voterId, setVoterId] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchPolls = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await apiClient.get<ApiResponse<Poll[]>>('/polls');
      setPolls(res.data || []);
    } catch {
      setPolls([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleVerifyIdentity = async () => {
    if (!voterId.trim()) {
      Alert.alert('Required', 'Please enter your Voter ID number.');
      return;
    }
    setVerifying(true);
    try {
      await apiClient.post('/citizens/me/verify', { voterIdNumber: voterId.trim() });
      await refreshUser();
      Alert.alert('Verified', 'Your identity is now verified for civic voting.');
    } catch (err) {
      Alert.alert('Verification Failed', err instanceof Error ? err.message : 'Unable to verify identity');
    } finally {
      setVerifying(false);
    }
  };

  const handleVote = async (pollId: string, candidateId: string) => {
    try {
      await apiClient.post(`/polls/${pollId}/vote`, { candidateId });
      Alert.alert('Vote Cast', 'Your vote has been securely recorded.');
      fetchPolls(true);
    } catch (err) {
      Alert.alert('Vote Failed', err instanceof Error ? err.message : 'Could not cast vote');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Civic Polls & Elections</Text>
        <Text style={styles.sub}>Vote on municipal initiatives and local proposals</Text>
      </View>

      {!user?.identityVerified ? (
        <View style={styles.verifyCard}>
          <Text style={styles.verifyTitle}>Verify Identity to Vote</Text>
          <Text style={styles.verifySub}>Enter your Voter ID number once to unlock poll voting.</Text>
          <View style={styles.verifyRow}>
            <TextInput
              style={styles.verifyInput}
              placeholder="Voter ID Number"
              placeholderTextColor={COLORS.textMuted}
              value={voterId}
              onChangeText={setVoterId}
            />
            <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyIdentity} disabled={verifying}>
              <Text style={styles.verifyBtnText}>{verifying ? '...' : 'Verify'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={polls}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPolls(true)} />}
          ListEmptyComponent={<EmptyState icon="checkbox-outline" title="No active polls right now" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Badge
                  label={item.status}
                  color={item.status === 'ACTIVE' ? COLORS.success : COLORS.textSecondary}
                  bg={item.status === 'ACTIVE' ? '#D1FAE5' : '#F1F5F9'}
                />
                <Text style={styles.date}>Ends {formatDateTime(item.endDate)}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}

              <View style={styles.options}>
                {(item.candidates || []).map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.optionBtn}
                    onPress={() => handleVote(item.id, c.id)}
                  >
                    <Ionicons name="radio-button-off" size={18} color={COLORS.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionName}>{c.name}</Text>
                      {c.description ? <Text style={styles.optionDesc}>{c.description}</Text> : null}
                    </View>
                    {c._count?.votes !== undefined ? (
                      <Text style={styles.voteCount}>{c._count.votes} votes</Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 16, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  heading: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  verifyCard: {
    margin: 16,
    marginBottom: 4,
    padding: 14,
    backgroundColor: COLORS.accentSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  verifyTitle: { fontSize: 14, fontWeight: '800', color: '#9A3412' },
  verifySub: { fontSize: 12, color: '#9A3412', marginTop: 2, marginBottom: 10 },
  verifyRow: { flexDirection: 'row', gap: 8 },
  verifyInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FDBA74',
    color: COLORS.text,
  },
  verifyBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  verifyBtnText: { color: '#FFFFFF', fontWeight: '700' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 11, color: COLORS.textMuted },
  title: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  desc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  options: { marginTop: 12, gap: 8 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  optionName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  optionDesc: { fontSize: 12, color: COLORS.textSecondary },
  voteCount: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
});
