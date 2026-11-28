import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList, MainTabParamList } from '@/navigation/RootNavigator';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/services/authContext';
import { DEHRADUN_SECTORS } from '@/constants/sectors';
import { COLORS, PRIORITY_META, STATUS_META, formatDateTime } from '@/constants/theme';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import type { ApiResponse, Issue, IssueStatus, SectorWorkloadResponse } from '@/types';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const stackNav = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [cityIssues, setCityIssues] = useState<Issue[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [workload, setWorkload] = useState<SectorWorkloadResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | IssueStatus>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [allRes, myRes, secRes] = await Promise.allSettled([
        apiClient.get<ApiResponse<Issue[]>>('/issues?limit=50&sortBy=createdAt&sortOrder=desc'),
        apiClient.get<ApiResponse<Issue[]>>('/issues/my?limit=50&sortBy=createdAt&sortOrder=desc'),
        apiClient.get<ApiResponse<SectorWorkloadResponse>>('/issues/sectors/workload'),
      ]);

      if (allRes.status === 'fulfilled') setCityIssues(allRes.value.data || []);
      if (myRes.status === 'fulfilled') setMyIssues(myRes.value.data || []);
      if (secRes.status === 'fulfilled') setWorkload(secRes.value.data || null);

      setLastSyncTime(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resolvedCount = cityIssues.filter((i) => i.status === 'RESOLVED').length;
  const inProgressCount = cityIssues.filter((i) => i.status === 'IN_PROGRESS').length;
  const underReviewCount = cityIssues.filter((i) => i.status === 'UNDER_REVIEW' || i.status === 'SUBMITTED').length;

  const baseIssues = activeTab === 'all' ? cityIssues : myIssues;
  const cleanText = (str?: string | null) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const filteredIssues = baseIssues.filter((issue) => {
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'UNDER_REVIEW'
          ? issue.status === 'UNDER_REVIEW' || issue.status === 'SUBMITTED'
          : issue.status === statusFilter;

    const matchesSector =
      sectorFilter === 'ALL'
        ? true
        : cleanText(issue.sector).includes(cleanText(sectorFilter)) ||
          cleanText(issue.locality).includes(cleanText(sectorFilter));

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q
      ? issue.title.toLowerCase().includes(q) ||
        issue.description?.toLowerCase().includes(q) ||
        issue.sector?.toLowerCase().includes(q) ||
        issue.locality?.toLowerCase().includes(q)
      : true;

    return matchesStatus && matchesSector && matchesSearch;
  });

  const sectorCards = workload?.sectors || DEHRADUN_SECTORS.map((s) => ({
    ...s,
    totalCount: 0,
    activeCount: 0,
    resolvedCount: 0,
    urgentCount: 0,
    loadRatio: 0,
    loadPercentage: 0,
    loadStatus: 'OPTIMAL' as const,
    statusBadgeColor: '#10B981',
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Official Government Header Bar matching website */}
      <View style={styles.govBar}>
        <View style={styles.govLeft}>
          <Image source={require('../../../assets/ashok-stambh.png')} style={styles.emblemImg} resizeMode="contain" />
          <Image source={require('../../../assets/civicpulse-logo.png')} style={styles.logoImg} resizeMode="contain" />
          <View>
            <Text style={styles.govTitle}>CivicPulse</Text>
            <Text style={styles.govSub}>Government of India • सत्यमेव जयते</Text>
          </View>
        </View>
        <View style={styles.govRight}>
          <View style={styles.liveDbPill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveDbText}>Live DB</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={14} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
      >
        {/* Welcome Action Banner matching website */}
        <View style={styles.welcomeCard}>
          <Text style={styles.greeting}>Namaste, {user?.name || 'Citizen'}!</Text>
          <Text style={styles.welcomeHeadline}>Live Municipal Grievance & Accountability Hub</Text>
          <Text style={styles.welcomeSub}>
            Real-time tracking of civic complaints synced with Dehradun Municipal Corporation & Supabase.
          </Text>
          <View style={styles.welcomeActions}>
            <TouchableOpacity style={styles.refreshOutlineBtn} onPress={() => loadData(true)}>
              <Ionicons name="refresh" size={14} color="#FFFFFF" />
              <Text style={styles.refreshOutlineText}>Refresh Live DB</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportCta} onPress={() => tabNav.navigate('Report')}>
              <Ionicons name="megaphone-outline" size={15} color="#FFFFFF" />
              <Text style={styles.reportCtaText}>Report New Issue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Metric Cards matching website */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#2563EB' }]}>{cityIssues.length}</Text>
            <Text style={styles.metricTitle}>Total City Issues</Text>
            <Text style={styles.metricFoot}>Your reports: {myIssues.length}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#D97706' }]}>{underReviewCount}</Text>
            <Text style={styles.metricTitle}>Under Review</Text>
            <Text style={styles.metricFoot}>Awaiting verification</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#0891B2' }]}>{inProgressCount}</Text>
            <Text style={styles.metricTitle}>In Progress</Text>
            <Text style={styles.metricFoot}>Dept assigned</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#16A34A' }]}>{resolvedCount}</Text>
            <Text style={styles.metricTitle}>Resolved & Closed</Text>
            <Text style={styles.metricFoot}>Completed</Text>
          </View>
        </View>

        {/* Dehradun Municipal Sector Load Balancing */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏛️ Sector Load Balancing</Text>
            {sectorFilter !== 'ALL' ? (
              <TouchableOpacity onPress={() => setSectorFilter('ALL')}>
                <Text style={styles.clearFilter}>✕ Clear ({sectorFilter})</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.loadActivePill}>
                <Text style={styles.loadActiveText}>● Active</Text>
              </View>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {sectorCards.map((sec) => {
              const selected =
                sectorFilter !== 'ALL' &&
                (sectorFilter.toLowerCase().includes(sec.id.toLowerCase()) ||
                  sec.name.toLowerCase().includes(sectorFilter.toLowerCase()));
              return (
                <TouchableOpacity
                  key={sec.id}
                  style={[styles.sectorCard, selected && styles.sectorCardSelected]}
                  onPress={() => setSectorFilter(selected ? 'ALL' : sec.id)}
                >
                  <View style={styles.sectorTop}>
                    <Text style={styles.sectorId}>{sec.id}</Text>
                    <Badge label={sec.loadStatus} color={sec.statusBadgeColor || COLORS.primary} bg="#F1F5F9" />
                  </View>
                  <Text style={styles.sectorName} numberOfLines={1}>{sec.zone}</Text>
                  <Text style={styles.sectorStats}>Active: {sec.activeCount} • Resolved: {sec.resolvedCount}</Text>
                  <Text style={styles.sectorUnit} numberOfLines={1}>🏢 {sec.dispatchUnit}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Real-Time Civic Issues Feed */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Real-Time Civic Issues ({filteredIssues.length})</Text>
              <Text style={styles.syncSub}>Updated {lastSyncTime || 'now'}</Text>
            </View>
          </View>

          <View style={styles.tabSwitch}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'all' && styles.tabBtnTextActive]}>
                All City ({cityIssues.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'my' && styles.tabBtnActive]}
              onPress={() => setActiveTab('my')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'my' && styles.tabBtnTextActive]}>
                My Complaints ({myIssues.length})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search issues, sectors, localities..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 10 }}>
            {(['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.filterChip, statusFilter === st && styles.filterChipActive]}
                onPress={() => setStatusFilter(st)}
              >
                <Text style={[styles.filterChipText, statusFilter === st && styles.filterChipTextActive]}>
                  {st === 'ALL' ? 'All Statuses' : STATUS_META[st].label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 24 }} />
          ) : filteredIssues.length === 0 ? (
            <EmptyState title="No issues found" subtitle="Try adjusting your filters or report a new civic issue." />
          ) : (
            filteredIssues.slice(0, 15).map((item) => {
              const st = STATUS_META[item.status] || STATUS_META.SUBMITTED;
              const pr = PRIORITY_META[item.priority] || PRIORITY_META.MEDIUM;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.issueCard}
                  onPress={() => stackNav.navigate('IssueDetail', { issueId: item.id })}
                >
                  <View style={styles.issueTop}>
                    <Badge label={st.label} color={st.color} bg={st.bg} />
                    <Badge label={pr.label} color={pr.color} bg={pr.bg} />
                  </View>
                  <Text style={styles.issueTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.issueMeta} numberOfLines={1}>
                    {item.category?.name || 'Civic'} • {item.sector || item.locality || 'Dehradun'}
                  </Text>
                  <Text style={styles.issueDate}>{formatDateTime(item.createdAt)}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
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
    justifyContent: 'space-between',
  },
  govLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emblemImg: { width: 22, height: 28 },
  logoImg: { width: 28, height: 28, backgroundColor: '#FFFFFF', borderRadius: 6, padding: 2 },
  govTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  govSub: { color: '#CBD5E1', fontSize: 10 },
  govRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDbPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  liveDbText: { fontSize: 10, fontWeight: '700', color: '#065F46' },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  scroll: { padding: 14, paddingBottom: 32, gap: 12 },
  welcomeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
  },
  greeting: { fontSize: 13, fontWeight: '700', color: '#FDE68A' },
  welcomeHeadline: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginTop: 2 },
  welcomeSub: { fontSize: 11, color: '#CBD5E1', marginTop: 4, lineHeight: 16 },
  welcomeActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  refreshOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  refreshOutlineText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  reportCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reportCtaText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricCard: {
    width: '48.5%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricVal: { fontSize: 22, fontWeight: '800' },
  metricTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  metricFoot: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  syncSub: { fontSize: 11, color: COLORS.textMuted },
  loadActivePill: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  loadActiveText: { fontSize: 10, fontWeight: '700', color: '#15803D' },
  clearFilter: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  sectorCard: {
    width: 195,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  sectorCardSelected: { borderColor: '#2563EB', borderWidth: 2, backgroundColor: '#EFF6FF' },
  sectorTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectorId: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  sectorName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  sectorStats: { fontSize: 11, color: COLORS.textSecondary },
  sectorUnit: { fontSize: 10, color: COLORS.textMuted },
  tabSwitch: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 3, borderRadius: 10, marginBottom: 10 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#FFFFFF' },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  tabBtnTextActive: { color: COLORS.text, fontWeight: '700' },
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
  searchInput: { flex: 1, fontSize: 13, color: COLORS.text },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  filterChipText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: '#1D4ED8', fontWeight: '700' },
  issueCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  issueTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  issueTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  issueMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  issueDate: { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
});
