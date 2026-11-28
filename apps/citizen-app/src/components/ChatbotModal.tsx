import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { COLORS } from '@/constants/theme';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'How do I report a pothole?',
  'Which department handles water leakage?',
  'How to track my complaint status?',
  'Emergency helpline numbers',
];

export default function ChatbotFloatingButton() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Namaste! I am your CivicPulse AI Assistant for Dehradun Municipal Corporation. Ask me how to report an issue, check departments, or track your complaints (English or Hindi).',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, visible, loading]);

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    setError('');
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    if (!textOverride) setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post<{ success: boolean; data: { reply: string } }>('/chat', {
        messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
      });
      const reply = res?.data?.reply || 'Sorry, I could not generate a response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach CivicPulse AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
        accessibilityLabel="Open CivicPulse AI Assistant"
      >
        <Ionicons name="chatbubbles" size={22} color={COLORS.accent} />
        <Text style={styles.fabText}>AI Help</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={styles.modalSafe}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.botAvatar}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>CivicPulse AI Helpdesk</Text>
                <Text style={styles.headerSub}>Dehradun Municipal Assistant • Online</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatContent}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <View
                    key={idx}
                    style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.bubbleUser : styles.bubbleBot,
                      ]}
                    >
                      <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextBot]}>
                        {msg.content}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {loading && (
                <View style={[styles.msgRow, styles.msgRowBot]}>
                  <View style={[styles.bubble, styles.bubbleBot, styles.loadingRow]}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Thinking...</Text>
                  </View>
                </View>
              )}

              {!!error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {messages.length === 1 && !loading && (
                <View style={styles.quickWrap}>
                  <Text style={styles.quickLabel}>QUICK QUESTIONS</Text>
                  <View style={styles.quickList}>
                    {QUICK_PROMPTS.map((q) => (
                      <TouchableOpacity
                        key={q}
                        style={styles.quickChip}
                        onPress={() => sendMessage(q)}
                      >
                        <Text style={styles.quickChipText}>{q}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask about civic issues, sectors..."
                placeholderTextColor={COLORS.textMuted}
                editable={!loading}
                onSubmitEditing={() => sendMessage()}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                onPress={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 76,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 99,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSafe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  headerSub: {
    color: '#DBEAFE',
    fontSize: 11,
  },
  closeBtn: {
    padding: 6,
  },
  chatScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatContent: {
    padding: 14,
    gap: 10,
  },
  msgRow: {
    flexDirection: 'row',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowBot: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextUser: {
    color: '#FFFFFF',
  },
  msgTextBot: {
    color: COLORS.text,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
  },
  quickWrap: {
    marginTop: 6,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  quickList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  quickChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
});
