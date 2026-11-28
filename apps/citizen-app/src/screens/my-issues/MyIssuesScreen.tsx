import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/RootNavigator';
import { apiClient } from '@/services/apiClient';
import { COLORS, PRIORITY_META, STATUS_META, formatDateTime } from '@/constants/theme';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import type { ApiResponse, Issue, IssueStatus } from '@/types';

const STATUS_FILTERS: Array<'ALL' | IssueStatus> = [
  'ALL',
  'SUBMITTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
];

export default function MyIssuesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [scope, setScope] = useState<'my' | 'all'>('my');
  const [statusFilter, setStatusFilter] = useState<'ALL' | IssueStatus>('ALL');
  const [search, setSearch] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIssues = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const endpoint = scope === 'my' ? '/issues/my?limit=50' : '/issues?limit=50';
      const res = await apiClient.get<ApiResponse<Issue[]>>(endpoint);
      setIssues(res.data || []);
    } catch {
      setIssues([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const filtered = issues.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.sector || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topHeader}>
        <Text style={styles.heading}>Civic Issues</Text>
        <View style={styles.segment}>
          <TouchableOpacity
            style={[styles.segBtn, scope === 'my' && styles.segActive]}
            onPress={() => setScope('my')}
          >
            <Text style={[styles.segText, scope === 'my' && styles.segTextActive]}>My Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, scope === 'all' && styles.segActive]}
            onPress={() => setScope('all')}
          >
            <Text style={[styles.segText, scope === 'all' && styles.segTextActive]}>All City</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search issues, sectors..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {STATUS_FILTERS.map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.chip, statusFilter === st && styles.chipActive]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.chipText, statusFilter === st && styles.chipTextActive]}>
                {st === 'ALL' ? 'All' : STATUS_META[st].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchIssues(true)} />}
          ListEmptyComponent={
            <EmptyState
              title="No matching issues"
              subtitle={scope === 'my' ? 'You have not reported any issues yet.' : 'Try adjusting your filters.'}
            />
          }
          renderItem={({ item }) => {
            const st = STATUS_META[item.status] || STATUS_META.SUBMITTED;
            const pr = PRIORITY_META[item.priority] || PRIORITY_META.MEDIUM;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => nav.navigate('IssueDetail', { issueId: item.id })}
              >
                <View style={styles.cardTop}>
                  <Badge label={st.label} color={st.color} bg={st.bg} />
                  <Badge label={pr.label} color={pr.color} bg={pr.bg} />
                </View>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.meta} numberOfLines={1}>
                    {item.sector || item.locality || 'Dehradun'}
                  </Text>
                  <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  heading: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  segment: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 10, padding: 3, marginBottom: 10 },
  segBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  segActive: { backgroundColor: COLORS.primary },
  segText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  segTextActive: { color: '#FFFFFF' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  filterRow: { gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  desc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  meta: { fontSize: 11, color: COLORS.textMuted, maxWidth: '55%' },
});
