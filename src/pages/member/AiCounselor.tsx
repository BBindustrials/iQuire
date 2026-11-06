/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — AI Career Counselor (Phase 17.4 - Voice, Attachments & Actions)
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

const SUGGESTED_PROMPTS = [
  { icon: '🎯', text: 'What should I do next in my career?' },
  { icon: '📊', text: 'Help me identify my skill gaps' },
  { icon: '📄', text: 'Review my CV and give feedback' },
  { icon: '🎤', text: 'Prepare me for an interview' },
  { icon: '📚', text: 'Which iQuire course should I take?' },
  { icon: '🔍', text: 'Find opportunities that match my skills' },
];

// Helper for Text-to-Speech
const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Text-to-speech is not supported in your browser.');
  }
};

// Declare webkitSpeechRecognition type for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const AiCounselor: React.FC = () => {
  const { profile } = useAuth();

  const [conversations, setConversations] = useState<CareerConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  const [messages, setMessages] = useState<CareerMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // New Chatbot Features State
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  // --------------------------------------------------------------------------
  // Initialize Speech Recognition
  // --------------------------------------------------------------------------
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Append the final transcript to the input
        if (finalTranscript) {
          setInput((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert('Speech recognition is not supported in your browser.');
        return;
      }
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // ... (Existing useEffect hooks for loading conversations and messages remain the same) ...
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
      if (list.length > 0) setActiveConversationId(list[0].id);
      setIsLoadingConversations(false);
    };
    load();
    return () => { isMounted = false; };
  }, []);

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
    return () => { isMounted = false; };
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  useEffect(() => {
    if (!isLoadingMessages) inputRef.current?.focus();
  }, [activeConversationId, isLoadingMessages]);


  // --------------------------------------------------------------------------
  // Core Send Message Logic
  // --------------------------------------------------------------------------
  const executeSend = useCallback(
    async (messageText: string, optimisticId?: string) => {
      setError(null);
      setIsStreaming(true);
      setStreamingText('');

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const wasNewConversation = !activeConversationId;
      let receivedAnyText = false;

      const result = await streamChat({
        message: messageText,
        conversationId: activeConversationId ?? undefined,
        signal: controller.signal,
        onChunk: (chunk) => {
          receivedAnyText = true;
          setStreamingText((prev) => prev + chunk);
        },
        onComplete: () => {},
        onError: (err) => setError(err),
      });

      setIsStreaming(false);

      if (!result.conversationId) {
        if (!receivedAnyText) {
          if (optimisticId) setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          if (!error) setError('Connection failed. Please try again.');
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              conversation_id: activeConversationId ?? '',
              user_id: 'system',
              role: 'assistant',
              content: `*(Connection interrupted. Partial response saved.)*`,
              created_at: new Date().toISOString(),
            },
          ]);
        }
        setStreamingText('');
        abortControllerRef.current = null;
        return;
      }

      setStreamingText('');
      if (wasNewConversation) setActiveConversationId(result.conversationId);

      const reload = await fetchMessages(result.conversationId);
      if (reload.success) setMessages(reload.data ?? []);

      const convs = await fetchConversations();
      if (convs.success) setConversations(convs.data ?? []);
      
      abortControllerRef.current = null;
    },
    [activeConversationId, error]
  );

  const handleSend = (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isStreaming) return;

    setInput('');
    setAttachedFile(null); // Clear attachment after send

    const tempId = `temp-user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        conversation_id: activeConversationId ?? '',
        user_id: profile?.id ?? '',
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString(),
      },
    ]);

    executeSend(messageText, tempId);
  };

  const handleRegenerate = async () => {
    if (messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      setMessages((prev) => prev.slice(0, -1));
      executeSend(lastUserMsg.content);
    }
  };

  // --------------------------------------------------------------------------
  // Action Handlers (Copy, Like, Share)
  // --------------------------------------------------------------------------
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'iQuire AI Career Counselor',
          text: 'Check out my career advice from iQuire!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopy(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleLike = (id: string) => {
    setLikedMessages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setStreamingText('');
    setError(null);
    setAttachedFile(null);
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    const res = await deleteConversation(id);
    if (!res.success) return setError(res.error ?? 'Failed to delete');
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) handleNewConversation();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isWelcomeState = !activeConversationId && messages.length === 0;

  return (
    <div className={styles.page}>
      {/* Mobile sidebar toggle */}
      <button type="button" className={styles.sidebarToggle} onClick={() => setSidebarOpen((v) => !v)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <button type="button" className={styles.newChatBtn} onClick={handleNewConversation}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New conversation
          </button>
        </div>

        <div className={styles.conversationsList}>
          {isLoadingConversations ? (
            <div className={styles.sidebarLoading}><div className={styles.spinnerSmall} /></div>
          ) : conversations.length === 0 ? (
            <p className={styles.sidebarEmpty}>No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <div key={c.id} className={`${styles.conversationItem} ${c.id === activeConversationId ? styles.conversationActive : ''}`}>
                <button type="button" className={styles.conversationBtn} onClick={() => { setActiveConversationId(c.id); setSidebarOpen(false); }}>
                  <span className={styles.conversationTitle}>{c.title}</span>
                  <span className={styles.conversationMeta}>{c.message_count} message{c.message_count === 1 ? '' : 's'}</span>
                </button>
                <button type="button" className={styles.conversationDelete} onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}>×</button>
              </div>
            ))
          )}
        </div>

        <div className={styles.sidebarFooter}>
          <Link to="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
        </div>
      </aside>

      <main className={styles.chatArea}>
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={handleShare} className={styles.headerDeleteBtn} style={{ color: '#0f172a' }}>
              Share
            </button>
            {activeConversationId && (
              <button type="button" className={styles.headerDeleteBtn} onClick={() => handleDelete(activeConversationId)}>
                Delete
              </button>
            )}
          </div>
        </div>

        {error && <div className={styles.errorBanner} role="alert">{error}</div>}

        <div className={styles.messagesArea}>
          {isWelcomeState ? (
            <WelcomeState firstName={profile?.first_name} onSelectPrompt={(text) => handleSend(text)} />
          ) : isLoadingMessages ? (
            <div className={styles.messagesLoading}><div className={styles.spinner} /></div>
          ) : (
            <>
              {messages.map((m, idx) => (
                <MessageBubble 
                  key={m.id} 
                  message={m} 
                  isLastMessage={idx === messages.length - 1}
                  isLiked={likedMessages[m.id]}
                  onCopy={() => handleCopy(m.content)}
                  onSpeak={() => speak(m.content)}
                  onLike={() => handleLike(m.id)}
                  onRegenerate={handleRegenerate}
                  onShare={handleShare}
                />
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

        <div className={styles.inputArea}>
          {/* Attachment Preview */}
          {attachedFile && (
            <div style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span>📎 {attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>×</button>
            </div>
          )}

          <div className={styles.inputWrapper}>
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              style={{ display: 'none' }} 
              accept="image/*,.pdf,.doc,.docx"
            />
            
            {/* Attachment Button */}
            <button 
              type="button" 
              className={styles.attachBtn} 
              onClick={() => fileInputRef.current?.click()}
              title="Attach a file"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0 0.5rem' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            {/* Microphone Button */}
            <button 
              type="button" 
              className={styles.attachBtn} 
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Start voice input"}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isListening ? '#ef4444' : '#64748b', padding: '0 0.5rem', animation: isListening ? 'pulse 1.5s infinite' : 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

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
              <button type="button" className={styles.stopBtn} onClick={handleStop} title="Stop">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button type="button" className={styles.sendBtn} onClick={() => handleSend()} disabled={!input.trim() && !attachedFile} title="Send">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          <p className={styles.inputHint}>AI responses are suggestions. Always use your own judgment.</p>
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

const WelcomeState: React.FC<{ firstName?: string | null; onSelectPrompt: (text: string) => void }> = ({ firstName, onSelectPrompt }) => (
  <div className={styles.welcome}>
    <div className={styles.welcomeAvatar}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20.02L12 16.77L7.09 20.02L8.45 13.97L4 9.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
    <h2 className={styles.welcomeTitle}>Hi {firstName || 'there'} 👋</h2>
    <p className={styles.welcomeText}>
      I'm your iQuire AI Career Counselor. I'm here to help you figure out your next career step.
    </p>
    <div className={styles.suggestedGrid}>
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button key={prompt.text} type="button" className={styles.suggestedBtn} onClick={() => onSelectPrompt(prompt.text)}>
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
  isLastMessage?: boolean;
  isLiked?: boolean;
  onCopy?: () => void;
  onSpeak?: () => void;
  onLike?: () => void;
  onRegenerate?: () => void;
  onShare?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, isStreaming, isLastMessage, isLiked, onCopy, onSpeak, onLike, onRegenerate, onShare 
}) => {
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

      {/* Action Buttons for AI Messages - Now placed directly beneath the bubble */}
      {!isUser && !isStreaming && (
        <div className={styles.messageActions}>
          <button onClick={onCopy} title="Copy text" className={styles.actionBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button onClick={onSpeak} title="Read aloud" className={styles.actionBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          </button>
          <button onClick={onLike} title="Like" className={styles.actionBtn} style={{ color: isLiked ? '#F9A825' : 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
          </button>
          {isLastMessage && onRegenerate && (
            <button onClick={onRegenerate} title="Regenerate response" className={styles.actionBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
          )}
          <button onClick={onShare} title="Share" className={styles.actionBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
        </div>
      )}
    </div>
  );
};

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
    if (!line) { flushList(idx); return; }
    if (/^[-*]\s/.test(line)) { listBuffer.push(line.slice(2)); return; }
    flushList(idx);
    blocks.push(
      <p key={idx} className={styles.msgParagraph} dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
    );
  });

  flushList(lines.length);
  return <>{blocks}</>;
};

const inlineFormat = (text: string): string => {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return html;
};