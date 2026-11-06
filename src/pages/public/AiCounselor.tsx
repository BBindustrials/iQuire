/* eslint-disable @typescript-eslint/no-unused-vars */
// ============================================================================
// iQuire — Public AI Career Counselor (Phase 17.26 — AI-Driven Conversation)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import {
  fetchPublishedFaqsByCategory,
  type Faq,
} from '../../services/faqs.service';
import {
  createInitialState,
  getQuestionsForRole,
  getToolsForRole,
  getSalaryRanges,
  calculateScore,
  recommendCourse,
  type QuizState,
  type CourseRecommendation,
} from '../../services/career-quiz.service';
import {
  generateQuizAcknowledgement,
  generateGapAnalysis,
  generateCourseBridge,
  generateSoftAsk,
  generateObjectionResponse,
  generateCourseReveal,
  generateGracefulClose,
} from '../../services/ai.service';
import styles from './AiCounselor.module.css';
import logo from '../../assets/logo/iquire-logo.png';

// ============================================================================
// Types
// ============================================================================

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  suggestions?: { label: string; value: string }[];
}

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

// ============================================================================
// Static content (unchanged)
// ============================================================================

const FEATURES: Feature[] = [
  {
    id: 'direction',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    title: 'Career direction',
    description: 'Understand what roles actually fit you and why.',
  },
  {
    id: 'skills',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Skill gap analysis',
    description: 'See exactly what skills you have and what you need to reach your target role.',
  },
  {
    id: 'courses',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: 'Course recommendations',
    description: 'Get matched to the right iQuire courses to close the gap.',
  },
  {
    id: 'cv',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'CV & profile review',
    description: 'Build and improve your CV, LinkedIn, and professional profile with AI guided feedback.',
  },
  {
    id: 'opportunities',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: 'Opportunity matching',
    description: 'Discover jobs, internships, and apprenticeships that match your actual profile.',
  },
  {
    id: 'interviews',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    title: 'Interview preparation',
    description: 'Practice with role specific questions and walk into interviews with confidence.',
  },
];

// ============================================================================
// Component
// ============================================================================

export const AiCounselor: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isFaqLoading, setIsFaqLoading] = useState(true);

  const [state, setState] = useState<QuizState>(createInitialState);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: "Hello! I'm your iQuire Career Counselor. Let's find the perfect path for you." },
    { sender: 'bot', text: "First, what's your name?" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<CourseRecommendation | null>(null);

  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll ONLY the chat body to the bottom on new message
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isLoadingRecommendation]);

  // Load FAQs
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const res = await fetchPublishedFaqsByCategory('ai-counselor');
      if (!isMounted) return;
      if (res.success && res.data) setFaqs(res.data);
      setIsFaqLoading(false);
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Helper to safely add an AI message
  const addBotMessage = (text: string, suggestions?: { label: string; value: string }[]) => {
    setMessages((prev) => [...prev, { sender: 'bot', text, suggestions }]);
  };

  // --------------------------------------------------------------------------
  // ADVANCE CONVERSATION
  // --------------------------------------------------------------------------
  const advanceConversation = async (value: string, displayText?: string) => {
    const currentState = state;
    const newMessages: ChatMessage[] = [];
    let nextState: QuizState = { ...currentState };
    let needsRecommendationFetch = false;

    switch (currentState.stage) {
      case 'greeting':
      case 'ask_name':
        nextState.name = value;
        nextState.stage = 'ask_purpose';
        newMessages.push({ sender: 'bot', text: `Nice to meet you, ${value}! 👋` });
        newMessages.push({
          sender: 'bot',
          text: 'What are you aiming to achieve right now?',
          suggestions: [
            { label: 'Find a new job', value: 'find_job' },
            { label: 'Upskill for a promotion', value: 'upskill' },
            { label: 'Switch careers', value: 'switch' },
            { label: 'Explore opportunities', value: 'explore' },
          ],
        });
        break;

      case 'ask_purpose':
        nextState.purpose = displayText || value;
        nextState.stage = 'ask_background';
        newMessages.push({
          sender: 'bot',
          text: "Got it. Where are you right now in your career journey?",
          suggestions: [
            { label: 'Final-year student', value: 'student' },
            { label: 'Recent graduate', value: 'graduate' },
            { label: 'Working professional', value: 'professional' },
            { label: 'Career changer', value: 'changer' },
          ],
        });
        break;

      case 'ask_background':
        nextState.background = displayText || value;
        nextState.stage = 'ask_role';
        newMessages.push({
          sender: 'bot',
          text: 'What kind of role are you targeting? Pick one or type your own.',
          suggestions: [
            { label: 'Data Analyst', value: 'data analyst' },
            { label: 'Product Manager', value: 'product manager' },
            { label: 'UX Designer', value: 'ux designer' },
            { label: 'Software Developer', value: 'software developer' },
          ],
        });
        break;

      case 'ask_role':
        nextState.targetRole = value;
        nextState.stage = 'ask_experience';
        newMessages.push({
          sender: 'bot',
          text: `Great — ${value} is a strong path. How much experience do you have in this field?`,
          suggestions: [
            { label: 'Zero — completely new', value: 'none' },
            { label: 'Less than 1 year', value: 'beginner' },
            { label: '1–3 years', value: 'intermediate' },
            { label: '3+ years', value: 'advanced' },
          ],
        });
        break;

      case 'ask_experience':
        nextState.experienceLevel = displayText || value;
        nextState.stage = 'ask_tools';
        newMessages.push({
          sender: 'bot',
          text: `Which of these tools do you already use or have used?`,
          suggestions: getToolsForRole(currentState.targetRole).map((t) => ({
            label: t,
            value: t,
          })),
        });
        newMessages.push({
          sender: 'bot',
          text: "Select one that fits best, or type your own.",
        });
        break;

      case 'ask_tools':
        nextState.selectedTools = [value];
        nextState.stage = 'ask_tool_proficiency';
        newMessages.push({
          sender: 'bot',
          text: `Great. How would you rate your proficiency with "${displayText || value}"?`,
          suggestions: [
            { label: 'Beginner — I know the basics', value: 'beginner' },
            { label: 'Intermediate — I use it regularly', value: 'intermediate' },
            { label: 'Advanced — I\'ve shipped real work with it', value: 'advanced' },
          ],
        });
        break;

      case 'ask_tool_proficiency':
        nextState.toolProficiency = { ...currentState.toolProficiency, selected: value };
        nextState.stage = 'ask_portfolio';
        newMessages.push({
          sender: 'bot',
          text: `What have you actually built or shipped using your skills?`,
          suggestions: [
            { label: 'Nothing yet', value: 'none' },
            { label: 'A small personal project', value: 'small' },
            { label: 'A portfolio of projects', value: 'portfolio' },
            { label: 'Real work for a company/client', value: 'professional' },
          ],
        });
        break;

      case 'ask_portfolio':
        nextState.portfolio = displayText || value;
        nextState.stage = 'ask_salary';
        newMessages.push({
          sender: 'bot',
          text: `Last question before the quiz — what salary range are you targeting?`,
          suggestions: getSalaryRanges(currentState.background).map((r) => ({
            label: r,
            value: r,
          })),
        });
        break;

      case 'ask_salary':
        nextState.salaryRange = displayText || value;
        nextState.stage = 'quiz_intro';
        newMessages.push({
          sender: 'bot',
          text: `Perfect. Now I'll ask you 15 questions — a mix of tool proficiency, real-world scenarios, and technical knowledge.`,
        });
        newMessages.push({
          sender: 'bot',
          text: `Answer honestly. There's no penalty for "I don't know" — that's how we find the real gaps.`,
        });
        newMessages.push({
          sender: 'bot',
          text: 'Ready?',
          suggestions: [{ label: "Let's go", value: 'start_quiz' }],
        });
        break;

      case 'quiz_intro':
        if (value === 'start_quiz') {
          const questions = getQuestionsForRole(currentState.targetRole);
          nextState.questions = questions;
          nextState.stage = 'quiz_question';
          nextState.currentQuestionIndex = 0;

          const firstQ = questions[0];
          newMessages.push({
            sender: 'bot',
            text: `Question 1 of ${questions.length}: ${firstQ.question}`,
            suggestions: firstQ.options.map((o) => ({
              label: o.label,
              value: o.value,
            })),
          });
        }
        break;

      case 'quiz_question': {
        const currentQ = currentState.questions[currentState.currentQuestionIndex];
        const selectedOption = currentQ.options.find((o) => o.value === value);

        const updatedAnswers = {
          ...currentState.answers,
          [currentQ.id]: {
            value,
            weight: selectedOption?.weight ?? 0,
          },
        };
        nextState.answers = updatedAnswers;
        const nextIndex = currentState.currentQuestionIndex + 1;

        if (nextIndex < currentState.questions.length) {
          nextState.currentQuestionIndex = nextIndex;
          const nextQ = currentState.questions[nextIndex];
          newMessages.push({
            sender: 'bot',
            text: `Question ${nextIndex + 1} of ${currentState.questions.length}: ${nextQ.question}`,
            suggestions: nextQ.options.map((o) => ({
              label: o.label,
              value: o.value,
            })),
          });
        } else {
          // Quiz complete → go to REVIEW stage
          const { score, gaps } = calculateScore(currentState.questions, updatedAnswers);
          nextState.score = score;
          nextState.gaps = gaps;
          nextState.stage = 'quiz_review';

          // Set recommendation fetch flag and push a "typing" message
          needsRecommendationFetch = true;
        }
        break;
      }

      case 'quiz_review': {
        if (value === 'accept') {
          nextState.stage = 'quiz_result';
          const rec = recommendation;

          if (rec) {
            addBotMessage("Great — I thought you might. Here's what I'd recommend:");
            addBotMessage(`"${rec.courseTitle}" — a ${rec.duration || 'flexible'} programme that focuses on ${rec.skillsAddressed.slice(0, 3).join(', ')}.`);
            if (rec.nextCohort) {
              addBotMessage(`The next cohort starts soon. If you want, you can view the course details and see the full syllabus — nothing to pay or commit to yet.`);
            }
          } else {
            addBotMessage("Reach out through our Contact page and our team can walk you through your options.");
          }
        } else if (value === 'not_sure') {
          nextState.stage = 'quiz_soft_pitch';

          // Call AI for the objection question
          const response = await generateObjectionResponse({
            name: currentState.name || 'friend',
            objection: 'other',
            courseTitle: recommendation?.courseTitle ?? 'the programme',
            courseDuration: recommendation?.duration ?? '8 weeks',
            role: currentState.targetRole,
          });

          addBotMessage(
            response.text || "That's fair — no rush at all. Can I ask what's holding you back? Sometimes the answer isn't a full course, just a nudge in the right direction.",
            [
              { label: "I don't have the time", value: 'time' },
              { label: "I'm not sure it's worth it", value: 'value' },
              { label: "I'd rather learn on my own", value: 'self_learn' },
              { label: 'Something else', value: 'other' },
            ]
          );
        } else if (value === 'no_thanks') {
          nextState.stage = 'quiz_result';

          // Call AI for a graceful close
          const closeRes = await generateGracefulClose({ name: currentState.name || 'friend' });
          addBotMessage(closeRes.text || "Totally understood. If you ever want to pick this up later, I'll be right here. Good luck!");
        }
        break;
      }

      case 'quiz_soft_pitch': {
        const rec = recommendation;
        const objectionType = (['time', 'value', 'self_learn'].includes(value) ? value : 'other') as 'time' | 'value' | 'self_learn' | 'other';

        // Call AI to respond to the specific objection
        const response = await generateObjectionResponse({
          name: currentState.name || 'friend',
          objection: objectionType,
          courseTitle: rec?.courseTitle ?? 'the programme',
          courseDuration: rec?.duration ?? '8 weeks',
          role: currentState.targetRole,
        });

        addBotMessage(response.text || "That's completely fair. Can I leave you with one thing? The gap between where you are and where you want to be isn't talent — it's a few weeks of focused practice.");

        // Ask again
        const followup = await generateSoftAsk({
          name: currentState.name || 'friend',
          courseTitle: rec?.courseTitle ?? 'the programme',
        });

        addBotMessage(
          followup.text || 'If you\'d like, I can show you the course details — no commitment, just a look.',
          [
            { label: 'Okay, show me', value: 'accept' },
            { label: "I'll think about it", value: 'no_thanks' },
          ]
        );
        break;
      }

      default:
        break;
    }

    setState(nextState);

    if (newMessages.length > 0) {
      setMessages((prev) => [...prev, ...newMessages]);
    }

    if (needsRecommendationFetch) {
      setIsLoadingRecommendation(true);

      // 1. Fetch the course data
      const rec = await recommendCourse(
        currentState.targetRole,
        nextState.score,
        nextState.gaps,
        currentState.experienceLevel
      );
      setRecommendation(rec);
      setIsLoadingRecommendation(false);

      if (rec) {
        // 2. Call AI for the conversational text
        const ackRes = await generateQuizAcknowledgement({
          name: currentState.name || 'friend',
          score: nextState.score,
          role: currentState.targetRole,
          experienceLevel: currentState.experienceLevel,
        });
        if (ackRes.success && ackRes.text) addBotMessage(ackRes.text);

        const gapRes = await generateGapAnalysis({
          name: currentState.name || 'friend',
          gaps: nextState.gaps,
          role: currentState.targetRole,
        });
        if (gapRes.success && gapRes.text) addBotMessage(gapRes.text);

        const bridgeRes = await generateCourseBridge({
          name: currentState.name || 'friend',
          gaps: nextState.gaps,
          courseTitle: rec.courseTitle,
          courseDuration: rec.duration ?? '8 weeks',
          courseSkills: rec.skillsAddressed,
          role: currentState.targetRole,
        });
        if (bridgeRes.success && bridgeRes.text) addBotMessage(bridgeRes.text);

        const softAskRes = await generateSoftAsk({
          name: currentState.name || 'friend',
          courseTitle: rec.courseTitle,
        });
        addBotMessage(
          softAskRes.text || 'Want me to show you how? I can point you to a short programme that builds exactly these skills — no pressure, just a look.',
          [
            { label: "Yes, I'm interested", value: 'accept' },
            { label: 'Not sure yet', value: 'not_sure' },
            { label: 'No, thanks', value: 'no_thanks' },
          ]
        );
      } else {
        addBotMessage(
          "I couldn't find the right course match just now, but our team can help. Want me to point you to the contact page?",
          [
            { label: 'Yes, please', value: 'accept' },
            { label: "No, I'm fine", value: 'no_thanks' },
          ]
        );
      }
    }
  };

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleUserSubmit = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputValue('');
    setTimeout(() => { advanceConversation(text); }, 300);
  };

  const handleSuggestionClick = (s: { label: string; value: string }) => {
    setMessages((prev) => [...prev, { sender: 'user', text: s.label }]);
    setTimeout(() => { advanceConversation(s.value, s.label); }, 300);
  };

  const restart = () => {
    setState(createInitialState());
    setRecommendation(null);
    setMessages([
      { sender: 'bot', text: "Hello again! I'm your iQuire Career Counselor." },
      { sender: 'bot', text: "First, what's your name?" },
    ]);
  };

  // --------------------------------------------------------------------------
  // Render (styling preserved)
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* HERO (Netted Blue) */}
      <section className={styles.hero}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="aiHeroNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#aiHeroNet)" />
        </svg>

        <div className={styles.heroBlobOne} aria-hidden="true" />
        <div className={styles.heroBlobTwo} aria-hidden="true" />

        <div className="container">
          <div className={styles.heroGrid}>
            {/* Left — Copy */}
            <div className={`${styles.heroContent} ${styles.slideUpText}`}>
              <span className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} />
                AI Powered
              </span>
              <h1 className={styles.heroTitle}>
                Meet your{' '}
                <span className={styles.heroHighlight}>
                  AI Career Counselor.
                </span>
              </h1>
              <p className={styles.heroSubtitle}>
                A personal career guide that understands where you are and
                tells you exactly what to do next. Available any time.
              </p>
              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Free for iQuire students & alumni
                </span>
                <span className={styles.heroTrustDot}>·</span>
                <span className={styles.heroTrustItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Private & secure
                </span>
              </div>
            </div>

            {/* Right — Chatbot UI */}
            <div className={`${styles.heroVisual} ${styles.slideUpText} ${styles['delay-1']}`}>
              <div className={styles.chatMockup}>
                <div className={styles.chatMockupHeader}>
                  <div className={styles.chatMockupAvatar}>
                    <img src={logo} alt="IQuire" className={styles.chatHeaderLogo} />
                  </div>
                  <div className={styles.chatMockupHeaderText}>
                    <strong>iQuire AI Counselor</strong>
                    <span>
                      <span className={styles.onlineDot} />
                      Online
                    </span>
                  </div>
                </div>

                <div className={styles.chatMockupBody} ref={chatBodyRef}>
                  {messages.map((msg, i) => (
                    <div key={i} className={`${styles.mockBubble} ${msg.sender === 'bot' ? styles.mockBubbleAi : styles.mockBubbleUser}`}>
                      <p>{msg.text}</p>
                      {msg.suggestions && (
                        <div className={styles.suggestionPills}>
                          {msg.suggestions.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              className={styles.suggestionPill}
                              onClick={() => handleSuggestionClick(s)}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoadingRecommendation && (
                    <div className={`${styles.mockBubble} ${styles.mockBubbleAi}`}>
                      <div className={styles.chatMockupTyping}>
                        <span className={styles.typingDot} />
                        <span className={styles.typingDot} />
                        <span className={styles.typingDot} />
                      </div>
                    </div>
                  )}

                  {recommendation && state.stage === 'quiz_result' && (
                    <div className={styles.recommendationCard}>
                      <div className={styles.recommendationHeader}>
                        <span className={styles.recommendationBadge}>Recommended Course</span>
                      </div>
                      <h3 className={styles.recommendationTitle}>{recommendation.courseTitle}</h3>
                      <div className={styles.recommendationMeta}>
                        {recommendation.duration && (
                          <span className={styles.recommendationMetaItem}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {recommendation.duration}
                          </span>
                        )}
                        {recommendation.fee && (
                          <span className={styles.recommendationMetaItem}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23" />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            {recommendation.fee}
                          </span>
                        )}
                      </div>
                      {recommendation.nextCohort && (
                        <div className={styles.recommendationCohort}>
                          <span className={styles.recommendationCohortLabel}>Next cohort</span>
                          <span className={styles.recommendationCohortValue}>{recommendation.nextCohort.name}</span>
                        </div>
                      )}
                      <Link to={`/courses/${recommendation.courseSlug}`} className={styles.recommendationCta}>
                        View Course →
                      </Link>
                    </div>
                  )}
                </div>

                <div className={styles.chatMockupFooter}>
                  <form onSubmit={(e) => { e.preventDefault(); handleUserSubmit(inputValue); }} className={styles.chatInputForm}>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your answer..."
                      className={styles.chatInput}
                    />
                    <button type="submit" className={styles.chatSendBtn} disabled={!inputValue.trim()}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                      </svg>
                    </button>
                  </form>

                  {(state.stage === 'quiz_result' || state.stage === 'quiz_soft_pitch') && (
                    <button type="button" className={styles.restartBtn} onClick={restart}>
                      Start over
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={`${styles.sectionHeader} ${styles.slideUpText} ${styles['delay-2']}`}>
            <span className={styles.sectionBadge}>What it does</span>
            <h2 className={styles.sectionTitle}>
              Six ways your AI counselor{' '}
              <span className={styles.sectionHighlight}>helps you move forward.</span>
            </h2>
          </div>
          <div className={`${styles.featuresGrid} ${styles.slideUpText} ${styles['delay-3']}`}>
            {FEATURES.map((f) => (
              <div key={f.id} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {!isFaqLoading && faqs.length > 0 && (
        <section className={styles.faqSection}>
          <div className="container">
            <div className={`${styles.sectionHeader} ${styles.slideUpText} ${styles['delay-2']}`}>
              <span className={styles.sectionBadge}>Questions</span>
              <h2 className={styles.sectionTitle}>Frequently asked.</h2>
            </div>
            <div className={`${styles.faqList} ${styles.slideUpText} ${styles['delay-3']}`}>
              {faqs.map((faq) => (
                <details key={faq.id} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>
                    {faq.question}
                    <span className={styles.faqIcon}>+</span>
                  </summary>
                  <div className={styles.faqAnswer}>
                    {faq.answer.split('\n').map((para, i) => (
                      <p key={i}>{para || <br />}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA (Netted Blue) */}
      <section className={styles.finalCta}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="aiCtaNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#aiCtaNet)" />
        </svg>

        <div className={styles.finalCtaBlob} aria-hidden="true" />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className={`${styles.finalCtaInner} ${styles.slideUpText} ${styles['delay-4']}`}>
            <h2 className={styles.finalCtaTitle}>Your career journey starts with one conversation.</h2>
            <p className={styles.finalCtaSubtitle}>
              Explore our courses and take the first step toward your goal.
            </p>
            <div className={styles.finalCtaButtons}>
              <Button variant="primary" color="gradient" size="lg" href="/courses">
                Explore Courses
              </Button>
              <Link to="/login" className={styles.finalCtaSecondary}>
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};