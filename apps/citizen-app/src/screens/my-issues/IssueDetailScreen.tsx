import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/RootNavigator';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/services/authContext';
import { COLORS, PRIORITY_META, STATUS_META, formatDateTime, getMediaUrl } from '@/constants/theme';
import { Badge } from '@/components/Badge';
import type { ApiResponse, CommunityComment, Issue, IssueStatusHistory } from '@/types';

type Props = NativeStackScreenProps<AppStackParamList, 'IssueDetail'>;

export default function IssueDetailScreen({ route, navigation }: Props) {
  const { issueId } = route.params;
  const { user } = useAuth();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [history, setHistory] = useState<IssueStatusHistory[]>([]);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      const [issueRes, historyRes, commentsRes] = await Promise.allSettled([
        apiClient.get<ApiResponse<Issue>>(`/issues/${issueId}`),
        apiClient.get<ApiResponse<IssueStatusHistory[]>>(`/issues/${issueId}/history`),
        apiClient.get<ApiResponse<CommunityComment[]>>(`/community/issues/${issueId}/comments`),
      ]);
      if (issueRes.status === 'fulfilled') setIssue(issueRes.value.data);
      if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data || []);
      if (commentsRes.status === 'fulfilled') setComments(commentsRes.value.data || []);
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      await apiClient.post(`/community/issues/${issueId}/comments`, {
        content: commentText.trim(),
      });
      setCommentText('');
      const res = await apiClient.get<ApiResponse<CommunityComment[]>>(`/community/issues/${issueId}/comments`);
      setComments(res.data || []);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true);
    try {
      await apiClient.post(`/feedback/issues/${issueId}`, {
        rating,
        comment: feedbackComment.trim() || undefined,
      });
      Alert.alert('Thank you', 'Your feedback has been recorded.');
      setFeedbackComment('');
    } catch (err) {
      Alert.alert('Feedback', err instanceof Error ? err.message : 'Could not submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!issue) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Issue Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const st = STATUS_META[issue.status] || STATUS_META.SUBMITTED;
  const pr = PRIORITY_META[issue.priority] || PRIORITY_META.MEDIUM;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Issue Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Badge label={st.label} color={st.color} bg={st.bg} />
            <Badge label={`${pr.label} Priority`} color={pr.color} bg={pr.bg} />
          </View>
          <Text style={styles.title}>{issue.title}</Text>
          <Text style={styles.meta}>
            {issue.category?.name || 'Civic'} • {formatDateTime(issue.createdAt)}
          </Text>
          {issue.sector || issue.address ? (
            <Text style={styles.location}>
              📍 {[issue.sector, issue.address, issue.city].filter(Boolean).join(' • ')}
            </Text>
          ) : null}
          <Text style={styles.description}>{issue.description}</Text>

          {issue.evidence && issue.evidence.length > 0 ? (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.subHeading}>Photographic Evidence</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {issue.evidence.map((ev) => (
                  <Image
                    key={ev.id}
                    source={{ uri: getMediaUrl(ev.fileUrl) }}
                    style={styles.evidenceImg}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {issue.resolutionProofUrl ? (
            <View style={styles.resolutionBox}>
              <Text style={styles.resolutionTitle}>Official Resolution Proof</Text>
              <Image
                source={{ uri: getMediaUrl(issue.resolutionProofUrl) }}
                style={styles.resolutionImg}
                resizeMode="cover"
              />
              {issue.resolutionRemarks ? (
                <Text style={styles.resolutionRemarks}>{issue.resolutionRemarks}</Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {issue.status === 'RESOLVED' && issue.reporterId === user?.id ? (
          <View style={styles.card}>
            <Text style={styles.subHeading}>Rate Resolution</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color={COLORS.warning}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Optional feedback comment..."
              placeholderTextColor={COLORS.textMuted}
              value={feedbackComment}
              onChangeText={setFeedbackComment}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, submittingFeedback && { opacity: 0.7 }]}
              onPress={handleSubmitFeedback}
              disabled={submittingFeedback}
            >
              <Text style={styles.primaryBtnText}>
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {history.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.subHeading}>Status Timeline</Text>
            {history.map((h) => (
              <View key={h.id} style={styles.timelineItem}>
                <Text style={styles.timelineStatus}>
                  {h.oldStatus} → {h.newStatus}
                </Text>
                {h.remarks ? <Text style={styles.timelineRemarks}>{h.remarks}</Text> : null}
                <Text style={styles.timelineMeta}>
                  {h.changer?.name || 'System'} • {formatDateTime(h.changedAt)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.subHeading}>Discussion ({comments.length})</Text>
          <View style={styles.commentInputRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Add a comment..."
              placeholderTextColor={COLORS.textMuted}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleAddComment}
              disabled={postingComment}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {comments.map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <Text style={styles.commentAuthor}>{c.user?.name || 'Citizen'}</Text>
              <Text style={styles.commentBody}>{c.comment}</Text>
              <Text style={styles.commentDate}>{formatDateTime(c.createdAt)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, flex: 1 },
  scroll: { padding: 16, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 19, fontWeight: '800', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  location: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 6 },
  description: { fontSize: 14, color: COLORS.text, lineHeight: 21, marginTop: 12 },
  subHeading: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  evidenceImg: { width: 200, height: 150, borderRadius: 10, backgroundColor: '#E2E8F0' },
  resolutionBox: { marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  resolutionTitle: { fontSize: 13, fontWeight: '800', color: '#065F46', marginBottom: 8 },
  resolutionImg: { width: '100%', height: 180, borderRadius: 10 },
  resolutionRemarks: { fontSize: 12, color: '#065F46', marginTop: 8 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F8FAFC',
    color: COLORS.text,
    marginBottom: 10,
  },
  primaryBtn: { backgroundColor: COLORS.primary, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  timelineItem: { borderLeftWidth: 2, borderLeftColor: COLORS.primaryLight, paddingLeft: 12, marginBottom: 12 },
  timelineStatus: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  timelineRemarks: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  timelineMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  commentInputRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  sendBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  commentItem: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  commentBody: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  commentDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
});
