// ============================================================================
// iQuire — AI Service (OpenRouter integration)
// ============================================================================

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// ============================================================================
// Types
// ============================================================================

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  success: boolean;
  text?: string;
  error?: string;
}

// ============================================================================
// CORE — Call OpenRouter
// ============================================================================

const callAI = async (
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7
): Promise<AIResponse> => {
  try {
    if (!OPENROUTER_API_KEY) {
      return {
        success: false,
        error: 'OpenRouter API key missing (VITE_OPENROUTER_API_KEY)',
      };
    }

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'iQuire AI Career Counselor',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages,
        temperature,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `OpenRouter: ${response.status} ${err}` };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim() ?? '';
    return { success: true, text };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// PROMPTS — One function per conversational moment
// ============================================================================

/**
 * 1) Post-quiz acknowledgement
 */
export const generateQuizAcknowledgement = async (params: {
  name: string;
  score: number;
  role: string;
  experienceLevel: string;
}): Promise<AIResponse> => {
  const system = `You are an AI career counselor for iQuire, a professional skills training company.
You are warm, conversational, honest, and not salesy. You speak to real people.
Keep responses to 1–2 sentences max. No emojis. No bullet points. No markdown.
Your tone should feel like a friend who knows careers well.`;

  const user = `The user's name is ${params.name}. They just completed a ${params.role} readiness quiz.
They scored ${params.score}%.
Their experience level is "${params.experienceLevel}".
Acknowledge their score honestly — celebrate if high, reassure if low.
Do NOT mention courses or recommendations yet. Just acknowledge them.`;

  return callAI(system, user, 0.8);
};

/**
 * 2) Gap analysis — name what's actually missing
 */
export const generateGapAnalysis = async (params: {
  name: string;
  gaps: string[];
  role: string;
}): Promise<AIResponse> => {
  const system = `You are an AI career counselor. Speak like a real person, not a bot.
Keep responses to 1–2 sentences. No markdown, no lists, no emojis.
Be specific about what's missing — don't be vague.`;

  const user = `The user's gaps (from their quiz) are: ${params.gaps.slice(0, 3).join('; ')}.
Their target role is ${params.role}.
Name their gaps in a way that feels human and honest — not clinical.
One specific insight per gap, maximum 2 sentences total.`;

  return callAI(system, user, 0.7);
};

/**
 * 3) Bridge to the course — what skills will they gain?
 */
export const generateCourseBridge = async (params: {
  name: string;
  gaps: string[];
  courseTitle: string;
  courseDuration: string;
  courseSkills: string[];
  role: string;
}): Promise<AIResponse> => {
  const system = `You are an AI career counselor. You're recommending a course — not selling.
Be conversational and honest. Max 2 sentences. No emojis, no markdown, no lists.`;

  const user = `The user's gaps: ${params.gaps.slice(0, 2).join('; ')}.
The course "${params.courseTitle}" is ${params.courseDuration} long and teaches: ${params.courseSkills.slice(0, 4).join(', ')}.
The target role is ${params.role}.
Explain in 2 sentences how this course fills their specific gaps.
Do NOT mention price or CTA yet. Just connect the dots for them.`;

  return callAI(system, user, 0.7);
};

/**
 * 4) Soft ask — would they like to see it?
 */
export const generateSoftAsk = async (params: {
  name: string;
  courseTitle: string;
}): Promise<AIResponse> => {
  const system = `You are an AI career counselor. You're being gentle, not pushy.
Max 1 sentence. No emojis, no markdown.`;

  const user = `Ask ${params.name} gently if they'd like to see the details of "${params.courseTitle}".
Frame it as "no pressure, just a look" — nothing to commit to.`;

  return callAI(system, user, 0.9);
};

/**
 * 5) Handle objections (second attempt)
 */
export const generateObjectionResponse = async (params: {
  name: string;
  objection: 'time' | 'value' | 'self_learn' | 'other';
  courseTitle: string;
  courseDuration: string;
  role: string;
}): Promise<AIResponse> => {
  const system = `You are an AI career counselor. You're warm and persuasive but never pushy.
Max 2 sentences. No emojis, no markdown, no lists.`;
  
  const objectionMap = {
    time: `The user says they don't have time. Their concern is that ${params.courseDuration} is too much commitment. Reassure them gently — this is built for people already working.`,
    value: `The user isn't sure the course is worth it. They're worried about ROI. Explain the practical value without being salesy.`,
    self_learn: `The user prefers to learn on their own. Acknowledge that's valid, but explain why structure matters.`,
    other: `The user says they're unsure for another reason. Ask what's really holding them back, gently.`,
  };

  const user = `${objectionMap[params.objection]}
The course is "${params.courseTitle}" (${params.courseDuration}). Target role: ${params.role}.`;

  return callAI(system, user, 0.8);
};

/**
 * 6) Show the course — final reveal
 */
export const generateCourseReveal = async (params: {
  name: string;
  courseTitle: string;
  courseDuration: string;
  courseFee: string;
  courseSkills: string[];
  nextCohortName: string | null;
  nextCohortDate: string | null;
}): Promise<AIResponse> => {
  const system = `You are an AI career counselor showing the user the recommended course.
Be clear and warm. Max 2 sentences. No emojis, no markdown, no bullet points.`;

  const cohortLine = params.nextCohortName
    ? `The next cohort "${params.nextCohortName}"${params.nextCohortDate ? ` starts ${params.nextCohortDate}` : ''}.`
    : 'No cohort is scheduled yet, but you can register interest.';

  const user = `Present "${params.courseTitle}" — a ${params.courseDuration} programme for ${params.courseFee} that teaches ${params.courseSkills.slice(0, 3).join(', ')}.
${cohortLine}
Tell ${params.name} they can view the details without any commitment yet.`;

  return callAI(system, user, 0.7);
};

/**
 * 7) Graceful close if they say no
 */
export const generateGracefulClose = async (params: {
  name: string;
}): Promise<AIResponse> => {
  const system = `You are an AI career counselor. The user has declined. Do not push further.
Max 1 sentence. No emojis.`;

  const user = `Say a warm, respectful goodbye to ${params.name}. Don't mention the course again. Wish them well.`;

  return callAI(system, user, 0.9);
};