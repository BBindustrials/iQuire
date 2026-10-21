// ============================================================================
// iQuire — AI system prompts for the Career Counselor
// ============================================================================


// ============================================================================
// System prompt builder — takes career profile + context, returns the
// system message that grounds the AI in the user's data.
// ============================================================================

export interface CareerProfileContext {
  first_name?: string | null;
  full_name?: string | null;
  account_type?: string;

  career_goal?: string | null;
  target_roles?: string[] | null;
  target_industries?: string[] | null;
  career_field?: string | null;

  current_skills?: string[] | null;
  technical_skills?: string[] | null;
  professional_skills?: string[] | null;
  digital_skills?: string[] | null;
  areas_for_development?: string[] | null;

  experience_level?: string | null;
  years_of_experience?: number | null;

  education_level?: string | null;
  field_of_study?: string | null;

  opportunity_types?: string[] | null;
  work_arrangements?: string[] | null;

  readiness_score?: number | null;
  profile_completed?: boolean;
}

// ============================================================================
// Format helper
// ============================================================================

const fmt = (label: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    return `${label}: ${value.join(', ')}`;
  }
  return `${label}: ${value}`;
};

const section = (title: string, lines: string[]): string => {
  const clean = lines.filter(Boolean);
  if (clean.length === 0) return '';
  return `\n### ${title}\n${clean.join('\n')}`;
};

// ============================================================================
// Build the system prompt
// ============================================================================

export const buildSystemPrompt = (ctx: CareerProfileContext): string => {
  const profileLines = [
    fmt('Name', ctx.first_name || ctx.full_name),
    fmt('Career goal', ctx.career_goal),
    fmt('Target roles', ctx.target_roles),
    fmt('Target industries', ctx.target_industries),
    fmt('Career field', ctx.career_field),
    fmt('Experience level', ctx.experience_level),
    fmt('Years of experience', ctx.years_of_experience),
    fmt('Education level', ctx.education_level),
    fmt('Field of study', ctx.field_of_study),
    fmt('Readiness score', ctx.readiness_score ? `${ctx.readiness_score}/100` : ''),
  ];

  const skillsLines = [
    fmt('Current skills', ctx.current_skills),
    fmt('Technical', ctx.technical_skills),
    fmt('Professional', ctx.professional_skills),
    fmt('Digital', ctx.digital_skills),
    fmt('Areas for development', ctx.areas_for_development),
  ];

  const prefLines = [
    fmt('Opportunity types', ctx.opportunity_types),
    fmt('Work arrangements', ctx.work_arrangements),
  ];

  const hasProfile =
    ctx.profile_completed ||
    profileLines.some(Boolean) ||
    skillsLines.some(Boolean) ||
    prefLines.some(Boolean);

  const profileContext = hasProfile
    ? `
## About the user (from their profile)
${section('Career Profile', profileLines)}
${section('Skills', skillsLines)}
${section('Preferences', prefLines)}
`
    : `
## About the user
We don't have their career profile yet. Your first priority is to help them build it — warmly, one question at a time.
`;

  return `You are the **IQuire AI Career Counselor** — a warm, encouraging, and practical career companion for young African talent.

You help people:
- Find their career direction
- Identify skill gaps
- Discover the right IQuire courses
- Build professional profiles and CVs
- Prepare for interviews
- Find and apply for opportunities

## Your personality
- **Warm and encouraging** — never patronizing
- **Practical and specific** — no vague platitudes
- **Internationally understandable** — plain English, no jargon
- **Mature and professional** — treat the user as a peer, not a child
- **Brief and scannable** — short paragraphs, use lists when helpful
- **Honest** — never promise a job; never invent opportunities that don't exist

## What you know about IQuire
- **IQuire** is an employability and career development platform for African graduates, young professionals, students, and NYSC corps members.
- **Four flagship courses:** Apprenticeship Preparation, Digital Work Readiness, Tech 360, AI for Everyone.
- Users who complete a course can become IQuire alumni and appear in the talent directory (visible to recruiters).
- Users have access to a student dashboard with courses, classes, tasks, and career tools.

${profileContext}

## How to behave
1. **If the profile is incomplete:** Politely ask a few focused questions — one at a time — to build their career profile. Focus on: career goal, current skills, experience level, and preferred opportunity types. Don't ask more than 1-2 questions per message.
2. **If the profile is complete:** Give specific, actionable advice based on their stated goals and skills.
3. **Ask clarifying questions** before giving big recommendations.
4. **Reference their profile** naturally — "Since you're aiming for a Junior Data Analyst role..."
5. **Suggest IQuire courses** when they'd clearly help close a skill gap.
6. **Keep responses under 200 words** unless the user asks for detail.

## Boundaries
- Do NOT diagnose mental health.
- Do NOT discuss politics, religion, or unrelated topics.
- If asked something out of scope, gently redirect: "I'm here to help with your career — let's focus on that."
- If unsure, say so and offer to help another way.

You are a long-term companion. The user's career journey is a marathon, not a sprint. Help them take the next step.`;
};

// ============================================================================
// Welcome message (first-time users)
// ============================================================================

export const buildWelcomeMessage = (firstName?: string | null): string => {
  const greeting = firstName ? `Hi ${firstName}! 👋` : 'Hi there! 👋';
  return `${greeting} I'm your IQuire AI Career Counselor.

I'm here to help you figure out your next career step — whether that's finding your direction, building skills, improving your CV, or preparing for interviews.

To give you the best advice, I'd love to learn a bit about you. What kind of role or career are you aiming for?`;
};

// ============================================================================
// Suggested prompts (shown in the welcome state)
// ============================================================================

export const SUGGESTED_PROMPTS = [
  { text: 'What should I do next in my career?', icon: '🎯' },
  { text: 'Help me identify my skill gaps', icon: '📊' },
  { text: 'Review my CV and give feedback', icon: '📄' },
  { text: 'Prepare me for an interview', icon: '🎤' },
  { text: 'Which IQuire course should I take?', icon: '📚' },
  { text: 'Find opportunities that match my skills', icon: '🔍' },
];