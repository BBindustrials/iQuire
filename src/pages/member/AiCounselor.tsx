/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — AI Career Counselor (Phase 12A.4)
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchConversations,
  fetchMessages,
  deleteConversation,
  streamChat,
  type CareerConversation,
  type CareerMessage,
} from '../../services/career.service';
import styles from './AiCounselor.module.css';

// ============================================================================
// Suggested prompts for the welcome state
// ============================================================================

const SUGGESTED_PROMPTS = [
  { icon: '🎯', text: 'What should I do next in my career?' },
  { icon: '📊', text: 'Help me identify my skill gaps' },
  { icon: '📄', text: 'Review my CV and give feedback' },
  { icon: '🎤', text: 'Prepare me for an interview' },
  { icon: '📚', text: 'Which IQuire course should I take?' },
  { icon: '🔍', text: 'Find opportunities that match my skills' },
];

// ============================================================================
// Component
// ============================================================================

export const AiCounselor: React.FC = () => {
  const { profile } = useAuth();

  // Conversations
  const [conversations, setConversations] = useState<CareerConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // Messages
  const [messages, setMessages] = useState<CareerMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Input + streaming
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sidebar (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // --------------------------------------------------------------------------
  // Load conversations on mount
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoadingConversations(true);
      const res = await fetchConversations();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load conversations');
        setIsLoadingConversations(false);
        return;
      }

      const list = res.data ?? [];
      setConversations(list);

      // Auto-select the most recent conversation
      if (list.length > 0) {
        setActiveConversationId(list[0].id);
      }

      setIsLoadingConversations(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Load messages when active conversation changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    const load = async () => {
      setIsLoadingMessages(true);
      const res = await fetchMessages(activeConversationId);
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load messages');
        setIsLoadingMessages(false);
        return;
      }

      setMessages(res.data ?? []);
      setIsLoadingMessages(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  // --------------------------------------------------------------------------
  // Auto-scroll to bottom on new messages
  // --------------------------------------------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // --------------------------------------------------------------------------
  // Focus input when switching conversations
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoadingMessages) {
      inputRef.current?.focus();
    }
  }, [activeConversationId, isLoadingMessages]);

  // --------------------------------------------------------------------------
  // Send a message
  // --------------------------------------------------------------------------
  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = (text ?? input).trim();
      if (!messageText || isStreaming) return;

      setError(null);
      setInput('');

      // Optimistically add user message
      const tempUserMsg: CareerMessage = {
        id: `temp-user-${Date.now()}`,
        conversation_id: activeConversationId ?? '',
        user_id: profile?.id ?? '',
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      setIsStreaming(true);
      setStreamingText('');

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const wasNewConversation = !activeConversationId;

      const result = await streamChat({
        message: messageText,
        conversationId: activeConversationId ?? undefined,
        signal: controller.signal,
        onChunk: (chunk) => {
          setStreamingText((prev) => prev + chunk);
        },
        onComplete: () => {
          // handled below
        },
        onError: (err) => {
          setError(err);
        },
      });

      setIsStreaming(false);
      setStreamingText('');

      if (result.conversationId) {

        // If this was a new conversation, set it as active
        if (wasNewConversation) {
          setActiveConversationId(result.conversationId);
        }

        // Reload messages from DB (source of truth)
        const reload = await fetchMessages(result.conversationId);
        if (reload.success) {
          setMessages(reload.data ?? []);
        }

        // Refresh sidebar (title / last_message_at changed)
        const convs = await fetchConversations();
        if (convs.success) {
          setConversations(convs.data ?? []);
        }
      }

      abortControllerRef.current = null;
    },
    [input, isStreaming, activeConversationId, profile?.id]
  );

  // --------------------------------------------------------------------------
  // Stop streaming
  // --------------------------------------------------------------------------
  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  // --------------------------------------------------------------------------
  // New conversation
  // --------------------------------------------------------------------------
  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setStreamingText('');
    setError(null);
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // --------------------------------------------------------------------------
  // Delete conversation
  // --------------------------------------------------------------------------
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this conversation? This cannot be undone.')) {
      return;
    }

    const res = await deleteConversation(id);
    if (!res.success) {
      setError(res.error ?? 'Failed to delete');
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  };

  // --------------------------------------------------------------------------
  // Keyboard: Enter to send, Shift+Enter for newline
  // --------------------------------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --------------------------------------------------------------------------
  // Welcome state?
  // --------------------------------------------------------------------------
  const isWelcomeState = !activeConversationId && messages.length === 0;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle conversations"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <button
            type="button"
            className={styles.newChatBtn}
            onClick={handleNewConversation}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New conversation
          </button>
        </div>

        <div className={styles.conversationsList}>
          {isLoadingConversations ? (
            <div className={styles.sidebarLoading}>
              <div className={styles.spinnerSmall} />
            </div>
          ) : conversations.length === 0 ? (
            <p className={styles.sidebarEmpty}>No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={`${styles.conversationItem} ${
                  c.id === activeConversationId ? styles.conversationActive : ''
                }`}
              >
                <button
                  type="button"
                  className={styles.conversationBtn}
                  onClick={() => {
                    setActiveConversationId(c.id);
                    setSidebarOpen(false);
                  }}
                >
                  <span className={styles.conversationTitle}>{c.title}</span>
                  <span className={styles.conversationMeta}>
                    {c.message_count} message{c.message_count === 1 ? '' : 's'}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.conversationDelete}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c.id);
                  }}
                  aria-label="Delete conversation"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.sidebarFooter}>
          <Link to="/dashboard" className={styles.backLink}>
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main chat area */}
      <main className={styles.chatArea}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <div className={styles.aiAvatarSmall}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20.02L12 16.77L7.09 20.02L8.45 13.97L4 9.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className={styles.chatTitle}>AI Career Counselor</h1>
              <p className={styles.chatSubtitle}>Your personal career guide</p>
            </div>
          </div>
          {activeConversationId && (
            <button
              type="button"
              className={styles.headerDeleteBtn}
              onClick={() => handleDelete(activeConversationId)}
            >
              Delete chat
            </button>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        {/* Message area */}
        <div className={styles.messagesArea}>
          {isWelcomeState ? (
            <WelcomeState
              firstName={profile?.first_name}
              onSelectPrompt={(text) => handleSend(text)}
            />
          ) : isLoadingMessages ? (
            <div className={styles.messagesLoading}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}

              {isStreaming && streamingText && (
                <MessageBubble
                  message={{
                    id: 'streaming',
                    conversation_id: '',
                    user_id: '',
                    role: 'assistant',
                    content: streamingText,
                    created_at: new Date().toISOString(),
                  }}
                  isStreaming
                />
              )}

              {isStreaming && !streamingText && (
                <div className={styles.typingIndicator}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your career…"
              className={styles.inputBox}
              rows={1}
              disabled={isStreaming}
            />

            {isStreaming ? (
              <button
                type="button"
                className={styles.stopBtn}
                onClick={handleStop}
                title="Stop"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className={styles.sendBtn}
                onClick={() => handleSend()}
                disabled={!input.trim()}
                title="Send"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          <p className={styles.inputHint}>
            AI responses are suggestions. Always use your own judgment.
          </p>
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

const WelcomeState: React.FC<{
  firstName?: string | null;
  onSelectPrompt: (text: string) => void;
}> = ({ firstName, onSelectPrompt }) => (
  <div className={styles.welcome}>
    <div className={styles.welcomeAvatar}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20.02L12 16.77L7.09 20.02L8.45 13.97L4 9.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>

    <h2 className={styles.welcomeTitle}>
      Hi {firstName || 'there'} 👋
    </h2>

    <p className={styles.welcomeText}>
      I'm your IQuire AI Career Counselor. I'm here to help you figure out your
      next career step — whether that's finding your direction, building
      skills, improving your CV, or preparing for interviews.
    </p>

    <p className={styles.welcomeText}>
      Pick a topic below, or just start typing.
    </p>

    <div className={styles.suggestedGrid}>
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt.text}
          type="button"
          className={styles.suggestedBtn}
          onClick={() => onSelectPrompt(prompt.text)}
        >
          <span className={styles.suggestedIcon}>{prompt.icon}</span>
          <span className={styles.suggestedText}>{prompt.text}</span>
        </button>
      ))}
    </div>
  </div>
);

interface MessageBubbleProps {
  message: CareerMessage;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`${styles.messageRow} ${isUser ? styles.messageRowUser : ''}`}>
      {!isUser && (
        <div className={styles.aiAvatar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20.02L12 16.77L7.09 20.02L8.45 13.97L4 9.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAi}`}>
        <MessageContent content={message.content} />
        {isStreaming && <span className={styles.cursor} />}
      </div>
    </div>
  );
};

/**
 * Renders message content with basic formatting:
 * - Paragraphs
 * - Bullet lists (lines starting with "- " or "* ")
 * - Bold (**text**)
 * - Italic (*text*)
 */
const MessageContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: number) => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`list-${key}`} className={styles.msgList}>
        {listBuffer.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();

    if (!line) {
      flushList(idx);
      return;
    }

    if (/^[-*]\s/.test(line)) {
      listBuffer.push(line.slice(2));
      return;
    }

    flushList(idx);
    blocks.push(
      <p
        key={idx}
        className={styles.msgParagraph}
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    );
  });

  flushList(lines.length);
  return <>{blocks}</>;
};

const inlineFormat = (text: string): string => {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

  return html;
};