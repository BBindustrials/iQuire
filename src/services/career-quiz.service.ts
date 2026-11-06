
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// ============================================================================
// iQuire — Career Quiz Service (Phase 17.25 — Smart Matching & Raw Data)
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type ChatStage =
  | 'greeting'
  | 'ask_name'
  | 'ask_purpose'
  | 'ask_background'
  | 'ask_role'
  | 'ask_experience'
  | 'ask_tools'
  | 'ask_tool_proficiency'
  | 'ask_portfolio'
  | 'ask_salary'
  | 'quiz_intro'
  | 'quiz_question'
  | 'quiz_review'
  | 'quiz_soft_pitch'
  | 'quiz_result';

export interface QuizQuestion {
  id: string;
  question: string;
  options: { label: string; value: string; weight: number }[];
  category: 'knowledge' | 'tool' | 'practical' | 'situational';
  insight?: string;
}

export interface QuizState {
  stage: ChatStage;
  name: string;
  purpose: string;
  background: string;
  targetRole: string;
  experienceLevel: string;
  selectedTools: string[];
  toolProficiency: Record<string, string>;
  portfolio: string;
  salaryRange: string;
  questions: QuizQuestion[];
  answers: Record<string, { value: string; weight: number }>;
  currentQuestionIndex: number;
  score: number;
  gaps: string[];
  recommendation: CourseRecommendation | null;
}

export interface CourseRecommendation {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  duration: string | null;
  fee: string | null;
  nextCohort: {
    name: string;
    start_date: string | null;
    registration_url: string | null;
  } | null;
  skillsAddressed: string[];
  gapSummary: string; 
}

// ============================================================================
// TOOLS BY ROLE
// ============================================================================

export const TOOLS_BY_ROLE: Record<string, string[]> = {
  'data analyst': ['Excel / Google Sheets', 'SQL', 'Python', 'Power BI / Tableau', 'Looker Studio'],
  'product manager': ['Jira', 'Figma', 'Notion', 'Analytics tools (Mixpanel, GA)', 'Roadmapping tools (Aha, Productboard)'],
  'ux designer': ['Figma', 'Sketch', 'Adobe XD', 'User testing platforms (Maze, UserTesting)', 'Miro'],
  'software developer': ['Git / GitHub', 'VS Code', 'React / Vue', 'Node.js / Python', 'PostgreSQL / MongoDB'],
  'digital marketer': ['Google Analytics', 'Meta Ads Manager', 'SEO tools (Ahrefs, SEMrush)', 'Canva', 'Mailchimp'],
  'project manager': ['Jira / Asana', 'MS Project / Smartsheet', 'Slack', 'Notion', 'Confluence'],
};

export const getToolsForRole = (role: string): string[] => {
  const key = role.toLowerCase();
  for (const toolKey of Object.keys(TOOLS_BY_ROLE)) {
    if (key.includes(toolKey) || toolKey.includes(key)) {
      return TOOLS_BY_ROLE[toolKey];
    }
  }
  return ['Excel', 'Communication tools', 'Data analysis tools', 'Project tracking tools'];
};

// ============================================================================
// SALARY RANGES
// ============================================================================

export const getSalaryRanges = (background: string): string[] => {
  const bg = background.toLowerCase();
  if (bg.includes('student') || bg.includes('graduate')) {
    return ['£15k – £25k (Entry)', '£25k – £35k (Junior)', '£35k – £50k (Mid)', '£50k+ (Senior)'];
  }
  if (bg.includes('professional')) {
    return ['£25k – £40k (Junior)', '£40k – £60k (Mid)', '£60k – £80k (Senior)', '£80k+ (Lead)'];
  }
  return ['£20k – £30k (Entry)', '£30k – £45k (Mid)', '£45k – £65k (Senior)', '£65k+ (Lead)'];
};

// ============================================================================
// 15-QUESTION BANK
// ============================================================================

const PRODUCT_MANAGER_QUESTIONS: QuizQuestion[] = [
  {
    id: 'pm_tools_1',
    category: 'tool',
    question: 'Which of these product tools have you actually used to ship something real?',
    options: [
      { label: 'Jira — daily, on a live project', value: 'advanced', weight: 10 },
      { label: 'Jira — a few times', value: 'intermediate', weight: 6 },
      { label: 'Heard of it, never used', value: 'beginner', weight: 2 },
      { label: 'Never heard of it', value: 'none', weight: 0 },
    ],
    insight: "Employers don't just want you to know Jira — they want you to have shipped in it.",
  },
  {
    id: 'pm_tools_2',
    category: 'tool',
    question: 'How comfortable are you in Figma for reviewing designs with your team?',
    options: [
      { label: 'I can read and comment on designs independently', value: 'advanced', weight: 10 },
      { label: 'I can navigate but struggle to comment', value: 'intermediate', weight: 6 },
      { label: 'I only look at screenshots', value: 'beginner', weight: 2 },
      { label: 'I avoid it entirely', value: 'none', weight: 0 },
    ],
    insight: 'Real PMs live in Figma review loops.',
  },
  {
    id: 'pm_tools_3',
    category: 'tool',
    question: 'Which analytics tool have you used to make a real product decision?',
    options: [
      { label: 'Mixpanel / Amplitude — I\'ve run my own funnel analysis', value: 'advanced', weight: 10 },
      { label: 'Google Analytics — I can read basic dashboards', value: 'intermediate', weight: 6 },
      { label: 'I\'ve seen reports but never pulled data', value: 'beginner', weight: 2 },
      { label: 'None', value: 'none', weight: 0 },
    ],
    insight: 'The PMs who get hired fast are the ones who can say "I moved this metric by X%".',
  },
  {
    id: 'pm_practical_1',
    category: 'practical',
    question: 'What\'s the most recent product artefact you\'ve created?',
    options: [
      { label: 'A full PRD or product spec that got built', value: 'advanced', weight: 10 },
      { label: 'A lightweight spec or Notion doc', value: 'intermediate', weight: 6 },
      { label: 'A rough idea in a Google Doc', value: 'beginner', weight: 2 },
      { label: 'Nothing yet', value: 'none', weight: 0 },
    ],
    insight: 'Hiring managers look for tangible artefacts.',
  },
  {
    id: 'pm_practical_2',
    category: 'practical',
    question: 'Have you ever run a user interview or usability test?',
    options: [
      { label: 'Yes, multiple — I have a script and synthesis process', value: 'advanced', weight: 10 },
      { label: 'Yes, once or twice informally', value: 'intermediate', weight: 6 },
      { label: 'No, but I\'ve watched recordings', value: 'beginner', weight: 2 },
      { label: 'Never', value: 'none', weight: 0 },
    ],
    insight: 'User research is the fastest way to be seen as "product-minded".',
  },
  {
    id: 'pm_situational_1',
    category: 'situational',
    question: 'A feature is 90% complete but the launch is next week. Engineering says the last 10% is "the risky part". What do you do?',
    options: [
      { label: 'Evaluate if we can ship safely behind a flag and iterate', value: 'advanced', weight: 10 },
      { label: 'Ask leadership for more time', value: 'intermediate', weight: 6 },
      { label: 'Push engineering to finish anyway', value: 'beginner', weight: 2 },
      { label: 'Cancel the launch', value: 'none', weight: 0 },
    ],
    insight: 'Good PMs trade off risk vs. velocity with data.',
  },
  {
    id: 'pm_situational_2',
    category: 'situational',
    question: 'A stakeholder demands a feature that conflicts with your roadmap. What\'s your move?',
    options: [
      { label: 'Present trade-offs with data and negotiate priority', value: 'advanced', weight: 10 },
      { label: 'Add it to backlog and hope it fades', value: 'intermediate', weight: 6 },
      { label: 'Say yes and let engineering figure it out', value: 'beginner', weight: 2 },
      { label: 'Say no without explanation', value: 'none', weight: 0 },
    ],
    insight: 'Stakeholder management is 40% of the job.',
  },
  {
    id: 'pm_knowledge_1',
    category: 'knowledge',
    question: 'What does "north star metric" mean?',
    options: [
      { label: 'The single metric that best represents value delivered to users', value: 'correct', weight: 10 },
      { label: 'Company revenue target', value: 'wrong', weight: 0 },
      { label: 'CEO\'s favourite number', value: 'wrong', weight: 0 },
      { label: 'Marketing slogan', value: 'wrong', weight: 0 },
    ],
    insight: 'Real PMs anchor every decision to one metric.',
  },
  {
    id: 'pm_knowledge_2',
    category: 'knowledge',
    question: 'What is an MVP?',
    options: [
      { label: 'Minimum Viable Product — smallest thing that tests a real hypothesis', value: 'correct', weight: 10 },
      { label: 'Most Valuable Product', value: 'wrong', weight: 0 },
      { label: 'Maximum Volume Production', value: 'wrong', weight: 0 },
      { label: 'Multi-Vendor Platform', value: 'wrong', weight: 0 },
    ],
    insight: 'Understanding what "minimum" really means separates PMs who ship.',
  },
  {
    id: 'pm_knowledge_3',
    category: 'knowledge',
    question: 'What does A/B testing reveal?',
    options: [
      { label: 'Whether two variants drive different outcomes statistically', value: 'correct', weight: 10 },
      { label: 'Which team works harder', value: 'wrong', weight: 0 },
      { label: 'If your product is buggy', value: 'wrong', weight: 0 },
      { label: 'How to price a product', value: 'wrong', weight: 0 },
    ],
    insight: 'Every PM interview has an A/B testing question.',
  },
  {
    id: 'pm_knowledge_4',
    category: 'knowledge',
    question: 'What\'s the difference between a product roadmap and a release plan?',
    options: [
      { label: 'Roadmap = strategy over time; Release plan = specific ship dates', value: 'correct', weight: 10 },
      { label: 'They\'re the same thing', value: 'wrong', weight: 0 },
      { label: 'Roadmap is for engineering, release plan is for marketing', value: 'wrong', weight: 0 },
      { label: 'Release plan comes before roadmap', value: 'wrong', weight: 0 },
    ],
    insight: 'This is a classic senior PM interview question.',
  },
  {
    id: 'pm_knowledge_5',
    category: 'knowledge',
    question: 'What does TAM / SAM / SOM mean?',
    options: [
      { label: 'Total, Serviceable, Obtainable market sizes', value: 'correct', weight: 10 },
      { label: 'Types of product managers', value: 'wrong', weight: 0 },
      { label: 'Internal team acronyms', value: 'wrong', weight: 0 },
      { label: 'A marketing framework', value: 'wrong', weight: 0 },
    ],
    insight: 'Real PMs can size a market before building anything.',
  },
  {
    id: 'pm_knowledge_6',
    category: 'knowledge',
    question: 'When does a PM say NO to a feature request?',
    options: [
      { label: 'When it doesn\'t serve the north star metric', value: 'correct', weight: 10 },
      { label: 'When engineering is too busy', value: 'wrong', weight: 0 },
      { label: 'When it comes from sales', value: 'wrong', weight: 0 },
      { label: 'Only after it\'s built', value: 'wrong', weight: 0 },
    ],
    insight: 'Knowing what to say NO to is the mark of a senior PM.',
  },
  {
    id: 'pm_knowledge_7',
    category: 'knowledge',
    question: 'What is "jobs-to-be-done" (JTBD) thinking?',
    options: [
      { label: 'Focusing on the outcome a user wants, not the feature', value: 'correct', weight: 10 },
      { label: 'A job board for PMs', value: 'wrong', weight: 0 },
      { label: 'Scheduling work for the day', value: 'wrong', weight: 0 },
      { label: 'A job description template', value: 'wrong', weight: 0 },
    ],
    insight: 'JTBD is the #1 mental model for product discovery.',
  },
  {
    id: 'pm_knowledge_8',
    category: 'knowledge',
    question: 'A/B test shows a 2% lift, but your boss says "not good enough." What do you do?',
    options: [
      { label: 'Analyse segment differences and statistical significance', value: 'correct', weight: 10 },
      { label: 'Revert immediately', value: 'wrong', weight: 0 },
      { label: 'Launch it anyway', value: 'wrong', weight: 0 },
      { label: 'Stop running A/B tests', value: 'wrong', weight: 0 },
    ],
    insight: 'Most A/B "wins" hide behind segments.',
  },
];

const DATA_ANALYST_QUESTIONS: QuizQuestion[] = [
  {
    id: 'da_tools_1',
    category: 'tool',
    question: 'How would you describe your SQL proficiency today?',
    options: [
      { label: 'I write JOINs, window functions, and CTEs daily', value: 'advanced', weight: 10 },
      { label: 'I can do JOINs and basic aggregation', value: 'intermediate', weight: 6 },
      { label: 'I know SELECT and WHERE', value: 'beginner', weight: 2 },
      { label: 'I\'ve never written SQL', value: 'none', weight: 0 },
    ],
    insight: 'SQL is the #1 skill in every data analyst job description.',
  },
  {
    id: 'da_tools_2',
    category: 'tool',
    question: 'How do you currently work with Excel / Google Sheets?',
    options: [
      { label: 'VLOOKUP, pivots, and dashboard-building regularly', value: 'advanced', weight: 10 },
      { label: 'Basic formulas and pivots', value: 'intermediate', weight: 6 },
      { label: 'Entering data, not much more', value: 'beginner', weight: 2 },
      { label: 'Rarely', value: 'none', weight: 0 },
    ],
    insight: 'Most analysts start with Excel — being truly strong separates you.',
  },
  {
    id: 'da_tools_3',
    category: 'tool',
    question: 'Have you used Power BI, Tableau, or Looker Studio for a real dashboard?',
    options: [
      { label: 'Yes — I\'ve built and shipped at least one', value: 'advanced', weight: 10 },
      { label: 'I\'ve clicked around in one', value: 'intermediate', weight: 6 },
      { label: 'I\'ve only seen screenshots', value: 'beginner', weight: 2 },
      { label: 'Never', value: 'none', weight: 0 },
    ],
    insight: 'The #1 thing hiring managers look for is a real dashboard.',
  },
  {
    id: 'da_practical_1',
    category: 'practical',
    question: 'Have you ever cleaned a messy dataset end-to-end?',
    options: [
      { label: 'Yes, I have a repeatable process for it', value: 'advanced', weight: 10 },
      { label: 'Yes, but it\'s ad-hoc', value: 'intermediate', weight: 6 },
      { label: 'Only small cleanups', value: 'beginner', weight: 2 },
      { label: 'Never', value: 'none', weight: 0 },
    ],
    insight: 'Cleaning is 70% of a data analyst\'s job.',
  },
  {
    id: 'da_practical_2',
    category: 'practical',
    question: 'What\'s the most recent analysis you delivered?',
    options: [
      { label: 'A full analysis that led to a real business decision', value: 'advanced', weight: 10 },
      { label: 'A small report I shared with a team', value: 'intermediate', weight: 6 },
      { label: 'A personal project', value: 'beginner', weight: 2 },
      { label: 'Nothing yet', value: 'none', weight: 0 },
    ],
    insight: 'Real analysis beats course certificates every single time.',
  },
  {
    id: 'da_situational_1',
    category: 'situational',
    question: 'A stakeholder says the dashboard is "too slow." What\'s your first step?',
    options: [
      { label: 'Profile query performance and data volumes', value: 'advanced', weight: 10 },
      { label: 'Add more colours', value: 'beginner', weight: 2 },
      { label: 'Remove all filters', value: 'beginner', weight: 2 },
      { label: 'Rebuild from scratch', value: 'none', weight: 0 },
    ],
    insight: 'Performance diagnosis separates junior and senior analysts.',
  },
  {
    id: 'da_situational_2',
    category: 'situational',
    question: 'The data contradicts your team\'s assumption. What do you do?',
    options: [
      { label: 'Present evidence calmly and open a discussion', value: 'advanced', weight: 10 },
      { label: 'Change the analysis to match the assumption', value: 'none', weight: 0 },
      { label: 'Hide the results', value: 'none', weight: 0 },
      { label: 'Blame the data', value: 'none', weight: 0 },
    ],
    insight: 'Analysts are paid for their integrity.',
  },
  {
    id: 'da_knowledge_1',
    category: 'knowledge',
    question: 'What does a SQL JOIN do?',
    options: [
      { label: 'Combines rows from multiple tables on a related column', value: 'correct', weight: 10 },
      { label: 'Deletes duplicate rows', value: 'wrong', weight: 0 },
      { label: 'Renames a column', value: 'wrong', weight: 0 },
      { label: 'Sorts data', value: 'wrong', weight: 0 },
    ],
    insight: 'JOINs are the #1 SQL question in every interview.',
  },
  {
    id: 'da_knowledge_2',
    category: 'knowledge',
    question: 'What is a primary key?',
    options: [
      { label: 'A column that uniquely identifies each row', value: 'correct', weight: 10 },
      { label: 'The first column in a table', value: 'wrong', weight: 0 },
      { label: 'A password for the database', value: 'wrong', weight: 0 },
      { label: 'Largest value in a column', value: 'wrong', weight: 0 },
    ],
    insight: 'Data modelling questions trip up most junior analysts.',
  },
  {
    id: 'da_knowledge_3',
    category: 'knowledge',
    question: 'Ice cream sales correlate with shark attacks. What do you conclude?',
    options: [
      { label: 'Correlation doesn\'t imply causation — both are seasonal', value: 'correct', weight: 10 },
      { label: 'Ice cream causes shark attacks', value: 'wrong', weight: 0 },
      { label: 'Shark attacks cause ice cream sales', value: 'wrong', weight: 0 },
      { label: 'The data is fake', value: 'wrong', weight: 0 },
    ],
    insight: 'Correlation vs. causation is the analyst\'s #1 red flag.',
  },
  {
    id: 'da_knowledge_4',
    category: 'knowledge',
    question: 'When would you use a line chart instead of a bar chart?',
    options: [
      { label: 'To show change over time', value: 'correct', weight: 10 },
      { label: 'To compare categories', value: 'wrong', weight: 0 },
      { label: 'To show distribution', value: 'wrong', weight: 0 },
      { label: 'To highlight maximums', value: 'wrong', weight: 0 },
    ],
    insight: 'Chart selection questions are common.',
  },
  {
    id: 'da_knowledge_5',
    category: 'knowledge',
    question: 'What is a data dictionary?',
    options: [
      { label: 'A document describing each field, its type, and source', value: 'correct', weight: 10 },
      { label: 'A list of all passwords', value: 'wrong', weight: 0 },
      { label: 'A CSV of raw data', value: 'wrong', weight: 0 },
      { label: 'A translation guide', value: 'wrong', weight: 0 },
    ],
    insight: 'Data governance is what separates analyst from data engineer.',
  },
  {
    id: 'da_knowledge_6',
    category: 'knowledge',
    question: 'What is a window function used for?',
    options: [
      { label: 'Calculating aggregates per group without collapsing rows', value: 'correct', weight: 10 },
      { label: 'Renaming a column', value: 'wrong', weight: 0 },
      { label: 'Joining two tables', value: 'wrong', weight: 0 },
      { label: 'Sorting data', value: 'wrong', weight: 0 },
    ],
    insight: 'Window functions appear in almost every advanced interview.',
  },
  {
    id: 'da_knowledge_7',
    category: 'knowledge',
    question: 'What does churn rate measure?',
    options: [
      { label: 'Percentage of customers who stop using your product', value: 'correct', weight: 10 },
      { label: 'Total revenue', value: 'wrong', weight: 0 },
      { label: 'Support ticket volume', value: 'wrong', weight: 0 },
      { label: 'New sign-ups', value: 'wrong', weight: 0 },
    ],
    insight: 'Every business cares about churn.',
  },
  {
    id: 'da_knowledge_8',
    category: 'knowledge',
    question: 'What\'s the main purpose of a data pipeline?',
    options: [
      { label: 'Move and transform data from source to destination reliably', value: 'correct', weight: 10 },
      { label: 'Store customer records', value: 'wrong', weight: 0 },
      { label: 'Visualise dashboards', value: 'wrong', weight: 0 },
      { label: 'Process payments', value: 'wrong', weight: 0 },
    ],
    insight: 'Understanding pipelines means understanding your data.',
  },
];

const QUESTION_BANKS: Record<string, QuizQuestion[]> = {
  'product manager': PRODUCT_MANAGER_QUESTIONS,
  'data analyst': DATA_ANALYST_QUESTIONS,
};

const DEFAULT_QUESTIONS = PRODUCT_MANAGER_QUESTIONS;

// ============================================================================
// HELPERS
// ============================================================================

export const getQuestionsForRole = (role: string): QuizQuestion[] => {
  const key = role.toLowerCase();
  for (const bankKey of Object.keys(QUESTION_BANKS)) {
    if (key.includes(bankKey) || bankKey.includes(key)) {
      return QUESTION_BANKS[bankKey];
    }
  }
  return DEFAULT_QUESTIONS;
};

// ============================================================================
// SCORING + GAP DETECTION
// ============================================================================

export const calculateScore = (
  questions: QuizQuestion[],
  answers: Record<string, { value: string; weight: number }>
): { score: number; gaps: string[] } => {
  let totalWeight = 0;
  let earnedWeight = 0;
  const gaps: string[] = [];

  questions.forEach((q) => {
    const maxWeight = Math.max(...q.options.map((o) => o.weight));
    totalWeight += maxWeight;

    const answer = answers[q.id];
    if (!answer) return;

    earnedWeight += answer.weight;

    if (answer.weight < maxWeight * 0.6) {
      if (q.category === 'tool') {
        gaps.push(`Tool proficiency gap: ${q.question.substring(0, 60)}...`);
      } else if (q.category === 'practical') {
        gaps.push(`Practical experience gap: ${q.question.substring(0, 60)}...`);
      } else if (q.category === 'knowledge') {
        gaps.push(`Knowledge gap: ${q.question.substring(0, 60)}...`);
      } else {
        gaps.push(`Decision-making gap: ${q.question.substring(0, 60)}...`);
      }
    }
  });

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  return { score, gaps };
};

// ============================================================================
// COURSE RECOMMENDATION (SMART MATCHING)
// ============================================================================

export const recommendCourse = async (
  role: string,
  _score: number,
  gaps: string[],
  _experienceLevel: string
): Promise<CourseRecommendation | null> => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (error || !courses || courses.length === 0) return null;

    const roleLower = role.toLowerCase();
    const roleWords = roleLower.split(' ').filter((w) => w.length > 2);

    // 1. Score each course based on how well it matches the user's target role
    const scoredCourses = courses.map((c: any) => {
      const haystack = [
        c.title,
        c.tagline,
        c.description,
        ...(c.skills_professional ?? []),
        ...(c.skills_digital ?? []),
        ...(c.skills_career ?? []),
        ...(c.who_its_for ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      let score = 0;
      // Match role keywords (e.g., "product", "manager", "analyst")
      roleWords.forEach((w) => {
        if (haystack.includes(w)) score += 5;
      });

      // Bonus if course teaches specific skills relevant to the role
      (c.skills_professional ?? []).forEach((skill: string) => {
        if (roleLower.includes(skill.toLowerCase())) score += 3;
      });

      return { course: c, score };
    });

    // 2. Sort by score (descending) and pick the best match
    scoredCourses.sort((a, b) => b.score - a.score);
    
    // Fallback to first course only if NO course has a score > 0
    const matchedCourse = scoredCourses[0].score > 0 ? scoredCourses[0].course : courses[0];

    // 3. Fetch next cohort
    const { data: cohort } = await supabase
      .from('cohorts')
      .select('name, start_date, registration_url')
      .eq('course_id', matchedCourse.id)
      .eq('is_next', true)
      .maybeSingle();

    // 4. Extract the skills the course teaches
    const skillsAddressed: string[] = [];
    if (Array.isArray(matchedCourse.skills_professional)) {
      skillsAddressed.push(...matchedCourse.skills_professional);
    }
    if (Array.isArray(matchedCourse.skills_digital)) {
      skillsAddressed.push(...matchedCourse.skills_digital);
    }
    if (Array.isArray(matchedCourse.skills_career)) {
      skillsAddressed.push(...matchedCourse.skills_career);
    }

    // 5. Build a conversational gap summary
    const hasToolGap = gaps.some((g) => g.startsWith('Tool proficiency gap'));
    const hasPracticalGap = gaps.some((g) => g.startsWith('Practical experience gap'));
    const hasKnowledgeGap = gaps.some((g) => g.startsWith('Knowledge gap'));
    const hasDecisionGap = gaps.some((g) => g.startsWith('Decision-making gap'));

    const namedGaps: string[] = [];
    if (hasToolGap) namedGaps.push('hands-on experience with industry tools');
    if (hasPracticalGap) namedGaps.push('real-world project work');
    if (hasKnowledgeGap) namedGaps.push('deeper technical knowledge');
    if (hasDecisionGap) namedGaps.push('decision-making confidence');

    const gapSummary =
      namedGaps.length > 0 ? namedGaps.join(', ') : 'practical readiness';

    return {
      courseId: matchedCourse.id,
      courseTitle: matchedCourse.title,
      courseSlug: matchedCourse.slug,
      duration: matchedCourse.duration,
      fee: matchedCourse.pricing?.fee ?? null,
      nextCohort: cohort ?? null,
      skillsAddressed: skillsAddressed.slice(0, 4),
      gapSummary,
    };
  } catch (err) {
    console.error('[recommendCourse] error:', err);
    return null;
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

export const createInitialState = (): QuizState => ({
  stage: 'greeting',
  name: '',
  purpose: '',
  background: '',
  targetRole: '',
  experienceLevel: '',
  selectedTools: [],
  toolProficiency: {},
  portfolio: '',
  salaryRange: '',
  questions: [],
  answers: {},
  currentQuestionIndex: 0,
  score: 0,
  gaps: [],
  recommendation: null,
});