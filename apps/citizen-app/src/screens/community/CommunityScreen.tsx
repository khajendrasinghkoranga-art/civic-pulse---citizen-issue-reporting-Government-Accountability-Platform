import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
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
import { COLORS, formatDateTime, getMediaUrl } from '@/constants/theme';
import { EmptyState } from '@/components/EmptyState';
import type { ApiResponse, CommunityPost } from '@/types';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [locality, setLocality] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await apiClient.get<ApiResponse<CommunityPost[]>>('/community/posts?limit=30');
      setPosts(res.data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation', 'Title and content are required.');
      return;
    }
    setCreating(true);
    try {
      await apiClient.post('/community/posts', {
        title: title.trim(),
        content: content.trim(),
        locality: locality.trim() || undefined,
        city: 'Dehradun',
      });
      setTitle('');
      setContent('');
      setLocality('');
      setModalOpen(false);
      fetchPosts(true);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Community & Transparency</Text>
          <Text style={styles.sub}>Official updates & citizen discussions</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={() => setModalOpen(true)}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.newBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPosts(true)} />}
          ListEmptyComponent={<EmptyState icon="chatbubbles-outline" title="No community posts yet" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.authorRow}>
                <Text style={styles.author}>{item.user?.name || 'Official'}</Text>
                <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              {item.imageUrl ? (
                <Image source={{ uri: getMediaUrl(item.imageUrl) }} style={styles.postImg} resizeMode="cover" />
              ) : null}
              <Text style={styles.body}>{item.content}</Text>
              {item.locality ? <Text style={styles.loc}>📍 {item.locality}</Text> : null}
            </View>
          )}
        />
      )}

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Community Post</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Post title"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 10 }]}
              placeholder="Share a local update or discussion..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              value={content}
              onChangeText={setContent}
            />
            <TextInput
              style={styles.input}
              placeholder="Locality (optional, e.g. Rajpur Road)"
              placeholderTextColor={COLORS.textMuted}
              value={locality}
              onChangeText={setLocality}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleCreatePost} disabled={creating}>
              <Text style={styles.submitText}>{creating ? 'Publishing...' : 'Publish Post'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heading: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  newBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  authorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  author: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  date: { fontSize: 11, color: COLORS.textMuted },
  title: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  postImg: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10, backgroundColor: '#E2E8F0' },
  body: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  loc: { fontSize: 12, color: COLORS.primary, marginTop: 8, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F8FAFC',
    color: COLORS.text,
  },
  submitBtn: { backgroundColor: COLORS.primary, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  submitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
