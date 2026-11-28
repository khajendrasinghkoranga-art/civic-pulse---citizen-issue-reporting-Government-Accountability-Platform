'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'How do I report a pothole or road issue?',
  'Which department handles water leakage?',
  'How can I track my complaint status?',
  'Emergency helpline numbers',
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Namaste! I am your CivicPulse AI Assistant for Dehradun Municipal Corporation. Ask me how to report an issue, check departments, or track your complaints (in English or Hindi).',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#1E3A8A] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold leading-tight">
                  <span>CivicPulse AI Helpdesk</span>
                  <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                </div>
                <p className="text-[11px] text-blue-100">Dehradun Municipal Assistant • Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-lg p-1.5 text-blue-100 transition hover:bg-white/15 hover:text-white"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3.5">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isUser ? 'bg-orange-500 text-white' : 'bg-[#1E3A8A] text-white'
                    }`}
                  >
                    {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'rounded-tr-sm bg-[#1E3A8A] text-white'
                        : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-white">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-500 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1E3A8A]" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="pt-1">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Quick Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-left text-xs font-medium text-[#1E3A8A] transition hover:bg-blue-100"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about civic issues, sectors..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#1E3A8A] focus:bg-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A] text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Toggle CivicPulse AI Chatbot"
        className="group flex items-center gap-2 rounded-full bg-[#1E3A8A] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-blue-900"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <MessageSquare className="h-5 w-5 text-orange-400" />
            <span className="hidden sm:inline">CivicPulse AI</span>
          </>
        )}
      </button>
    </div>
  );
}
