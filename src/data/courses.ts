// ============================================================================
// iQuire — Course Data (Phase 8A.1)
// ============================================================================
// Static course data. Will be replaced by admin-managed DB reads in Phase 8B.
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export interface CourseCohort {
  name: string;
  startDate: string;      // ISO or "TBA"
  endDate: string;        // ISO or "TBA"
  schedule: string;       // "Mon & Wed · 6pm–8pm"
  format: 'Virtual' | 'Hybrid' | 'On-site';
  fee: string;            // "₦45,000" or "Free"
  capacity?: number;
  spotsLeft?: number;
  status: 'open' | 'closed' | 'coming_soon';
}

export interface PreviousCohort {
  name: string;
  date: string;
  format: string;
  participants: number;
  outcome?: string;
  testimonial?: string;
}

export interface CourseModule {
  number: string;
  title: string;
  description?: string;
}

export interface CourseOutcome {
  id: string;
  text: string;
}

export interface CourseFaq {
  id: string;
  question: string;
  answer: string;
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  duration: string;       // "6 weeks"
  format: string;         // "Virtual"
  level: string;          // "Beginner"
  accent: 'blue' | 'green' | 'purple' | 'orange';
  emoji: string;

  // Hero extras
  heroImage: string;
  certificateIncluded: boolean;

  // Next cohort (null if none)
  nextCohort: CourseCohort | null;

  // Previous cohorts
  previousCohorts: PreviousCohort[];

  // Content sections
  whyThisProgram: string;
  challenges: { title: string; description: string }[];

  whatYouLearn: CourseModule[];
  weekJourney: { week: string; title: string }[];
  experience: string[];
  outcomes: string[];

  whoItsFor: string[];
  prerequisites: string;

  skillsProfessional: string[];
  skillsDigital: string[];
  skillsCareer: string[];

  curriculum: CourseModule[];
  whatsIncluded: string[];

  pricing: {
    fee: string;
    includes: string[];
    paymentOptions?: string;
    financialSupport?: string;
  };

  faqs: CourseFaq[];

  // Final CTA
  finalCta: {
    headline: string;
    subheadline: string;
  };
}

// ============================================================================
// Course 1 — Apprenticeship Preparation
// ============================================================================

const apprenticeshipPreparation: Course = {
  id: 'apprenticeship',
  slug: 'apprenticeship-preparation',
  name: 'Apprenticeship Preparation',
  tagline: 'Prepare for your next opportunity.',
  description:
    'Build the practical, digital and professional skills needed to pursue apprenticeship opportunities and transition confidently from education into the workplace.',
  duration: '6 weeks',
  format: 'Virtual',
  level: 'Beginner',
  accent: 'blue',
  emoji: '🛠️',
  heroImage:
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop',
  certificateIncluded: true,

  nextCohort: {
    name: 'Cohort 5',
    startDate: '2026-05-12',
    endDate: '2026-06-23',
    schedule: 'Mon & Wed · 6:00pm – 8:00pm',
    format: 'Virtual',
    fee: '₦45,000',
    capacity: 40,
    spotsLeft: 12,
    status: 'open',
  },

  previousCohorts: [
    {
      name: 'Cohort 4',
      date: 'Jan – Feb 2026',
      format: 'Virtual',
      participants: 38,
      outcome: '82% completed with a portfolio project',
    },
    {
      name: 'Cohort 3',
      date: 'Sep – Oct 2025',
      format: 'Virtual',
      participants: 42,
      outcome: '76% reported improved workplace readiness',
    },
  ],

  whyThisProgram:
    'Moving from education into the workplace can be difficult when candidates have limited practical experience, workplace skills, digital skills, application knowledge or confidence. This programme helps bridge that gap through practical preparation and career-focused learning.',

  challenges: [
    {
      title: 'Limited experience',
      description: 'Hard to stand out without real workplace practice.',
    },
    {
      title: 'Applications & CVs',
      description: 'Unsure how to present yourself effectively.',
    },
    {
      title: 'Interview confidence',
      description: 'Anxiety about interviews and selection processes.',
    },
    {
      title: 'Workplace readiness',
      description: 'Missing the professional skills employers expect.',
    },
  ],

  whatYouLearn: [
    {
      number: '01',
      title: 'Apprenticeship Pathways',
      description:
        'Understand apprenticeship opportunities and identify relevant pathways.',
    },
    {
      number: '02',
      title: 'Workplace Readiness',
      description:
        'Build communication, teamwork, time-management and professional skills.',
    },
    {
      number: '03',
      title: 'Digital Workplace Skills',
      description:
        'Develop practical workplace productivity, collaboration and digital communication skills.',
    },
    {
      number: '04',
      title: 'Applications',
      description:
        'Create stronger CVs, applications and supporting statements.',
    },
    {
      number: '05',
      title: 'Interview Preparation',
      description:
        'Prepare for interviews and demonstrate skills with practical examples.',
    },
    {
      number: '06',
      title: 'Career Planning',
      description:
        'Identify opportunities and create an actionable next-step plan.',
    },
  ],

  weekJourney: [
    { week: 'Week 1', title: 'Apprenticeships & Career Pathways' },
    { week: 'Week 2', title: 'Workplace Readiness' },
    { week: 'Week 3', title: 'Digital Workplace Skills' },
    { week: 'Week 4', title: 'Professional Profile & Applications' },
    { week: 'Week 5', title: 'Interview & Selection Preparation' },
    { week: 'Week 6', title: 'Practical Skills & Apprenticeship Action Plan' },
  ],

  experience: [
    'Interactive instructor-led sessions',
    'Practical workshops',
    'Real-world workplace scenarios',
    'Individual and group activities',
    'CV and application exercises',
    'Mock interviews',
    'Digital-skills activities',
    'Feedback and facilitator support',
  ],

  outcomes: [
    'A polished CV and application materials',
    'Better interview confidence and technique',
    'Practical digital workplace skills',
    'Greater understanding of workplace expectations',
    'A clear apprenticeship action plan',
    'A certificate of completion',
  ],

  whoItsFor: [
    'Final-year students',
    'Recent graduates',
    'Young people exploring apprenticeship pathways',
    'Candidates transitioning into employment',
    'People with limited work experience',
    'Candidates who want help with CVs, applications and interviews',
  ],
  prerequisites: 'No prior work experience required. Open to anyone 18+.',

  skillsProfessional: [
    'Communication',
    'Teamwork',
    'Time Management',
    'Problem-Solving',
    'Adaptability',
  ],
  skillsDigital: [
    'Productivity Tools',
    'Online Collaboration',
    'Digital Communication',
    'Digital Organisation',
  ],
  skillsCareer: [
    'CV Development',
    'Applications',
    'Interview Preparation',
    'Opportunity Research',
    'Career Planning',
  ],

  curriculum: [
    { number: '01', title: 'Understanding Apprenticeships & Career Pathways' },
    { number: '02', title: 'Workplace Readiness' },
    { number: '03', title: 'Digital Workplace Skills' },
    { number: '04', title: 'Building Your Professional Profile' },
    { number: '05', title: 'Apprenticeship Applications' },
    { number: '06', title: 'Interview & Selection Preparation' },
    { number: '07', title: 'Practical Workplace Skills' },
    { number: '08', title: 'Apprenticeship Action Plan' },
  ],

  whatsIncluded: [
    '6-week virtual programme',
    'Live training sessions',
    'Course materials',
    'Practical activities',
    'Application preparation',
    'Interview preparation',
    'Certificate',
    'Additional support, where applicable',
  ],

  pricing: {
    fee: '₦45,000',
    includes: [
      'Live sessions',
      'Materials',
      'Practical activities',
      'Application & interview preparation',
      'Certificate',
    ],
    paymentOptions: 'Full payment or 2-installment plan available.',
    financialSupport: 'Scholarship support available for eligible applicants.',
  },

  faqs: [
    {
      id: 'f1',
      question: 'Who can apply?',
      answer:
        'Anyone 18+ — final-year students, graduates, and career changers. No prior work experience required.',
    },
    {
      id: 'f2',
      question: 'Do I need previous work experience?',
      answer: 'No. This programme is designed for people starting from scratch.',
    },
    {
      id: 'f3',
      question: 'How long is the programme?',
      answer: '6 weeks, delivered virtually.',
    },
    {
      id: 'f4',
      question: 'Is it completely virtual?',
      answer: 'Yes. All sessions are held online.',
    },
    {
      id: 'f5',
      question: 'Will I receive a certificate?',
      answer: 'Yes, on successful completion of the programme.',
    },
    {
      id: 'f6',
      question: 'What happens after I apply?',
      answer:
        'Your application is reviewed and you will be contacted with the outcome.',
    },
  ],

  finalCta: {
    headline: 'Ready to prepare for your next opportunity?',
    subheadline:
      'Build the practical, digital and professional skills you need to approach apprenticeship opportunities with greater confidence.',
  },
};

// ============================================================================
// Course 2 — Digital Work Readiness
// ============================================================================

const digitalWorkReadiness: Course = {
  id: 'digital',
  slug: 'digital-work-readiness',
  name: 'Digital Work Readiness',
  tagline: 'Build practical skills. Get workplace-ready.',
  description:
    'Build practical digital and workplace skills, strengthen your professional profile, and gain the confidence to pursue entry-level opportunities.',
  duration: '6 weeks',
  format: 'Virtual',
  level: 'Beginner',
  accent: 'green',
  emoji: '💼',
  heroImage:
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop',
  certificateIncluded: true,

  nextCohort: {
    name: 'Cohort 8',
    startDate: '2026-05-19',
    endDate: '2026-06-30',
    schedule: 'Tue & Thu · 6:00pm – 8:00pm',
    format: 'Virtual',
    fee: '₦50,000',
    capacity: 50,
    spotsLeft: 20,
    status: 'open',
  },

  previousCohorts: [
    {
      name: 'Cohort 7',
      date: 'Feb – Mar 2026',
      format: 'Virtual',
      participants: 45,
      outcome: '84% landed a first interview within 8 weeks',
    },
    {
      name: 'Cohort 6',
      date: 'Oct – Nov 2025',
      format: 'Virtual',
      participants: 40,
    },
  ],

  whyThisProgram:
    'Moving from education into the workplace can be difficult when candidates lack practical workplace experience, digital skills, confidence or familiarity with applications and interviews. This programme bridges the gap between education and workplace readiness through practical learning, real activities and mentor support.',

  challenges: [
    {
      title: 'Workplace Skills',
      description: 'Limited practical experience and professional skills.',
    },
    {
      title: 'Digital Skills',
      description: 'Gaps in workplace technology and digital confidence.',
    },
    {
      title: 'Professional Profile',
      description: 'Uncertainty around CVs, LinkedIn and portfolios.',
    },
    {
      title: 'Job Search',
      description: 'Difficulty identifying relevant opportunities.',
    },
    {
      title: 'Recruitment',
      description: 'Uncertainty about applications and interviews.',
    },
  ],

  whatYouLearn: [
    {
      number: '01',
      title: 'Workplace Readiness',
      description:
        'Understand what employers look for and identify relevant entry-level opportunities.',
    },
    {
      number: '02',
      title: 'Professional Skills',
      description:
        'Communication, teamwork, time management, problem-solving and professional behaviour.',
    },
    {
      number: '03',
      title: 'Digital & AI Skills',
      description:
        'Use productivity and collaboration tools, communicate professionally online, and use AI tools productively.',
    },
    {
      number: '04',
      title: 'Professional Profile',
      description:
        'Create and improve your CV, LinkedIn profile and portfolio.',
    },
    {
      number: '05',
      title: 'Applications & Interviews',
      description:
        'Prepare applications, supporting statements and interviews with confidence.',
    },
    {
      number: '06',
      title: 'Career Planning',
      description:
        'Research opportunities, set career goals and create an actionable plan.',
    },
  ],

  weekJourney: [
    { week: 'Week 1', title: 'Workplace Foundations' },
    { week: 'Week 2', title: 'Professional Skills' },
    { week: 'Week 3', title: 'Digital & AI Tools' },
    { week: 'Week 4', title: 'Building Your Profile' },
    { week: 'Week 5', title: 'Applications & Interviews' },
    { week: 'Week 6', title: 'Career Planning' },
  ],

  experience: [
    'Instructor-led sessions',
    'Practical workshops',
    'Workplace scenarios',
    'Individual and group activities',
    'CV, LinkedIn & portfolio exercises',
    'Mock interviews',
    'Digital-skills activities',
    'Mentorship & feedback',
  ],

  outcomes: [
    'Stronger digital and professional skills',
    'A polished CV, LinkedIn profile and portfolio',
    'Better interview confidence',
    'Greater understanding of workplace expectations',
    'A clearer career direction',
    'A practical plan for pursuing relevant opportunities',
  ],

  whoItsFor: [
    'Final-year students',
    'Fresh graduates',
    'Entry-level job seekers',
    'Interns',
    'Young professionals',
    'National-service participants',
    'People transitioning into professional environments',
  ],
  prerequisites: 'No prior experience required. Open to anyone 18+.',

  skillsProfessional: [
    'Communication',
    'Teamwork',
    'Time Management',
    'Problem-Solving',
    'Adaptability',
    'Professional Behaviour',
  ],
  skillsDigital: [
    'Google Workspace',
    'Microsoft 365',
    'Zoom',
    'Online Collaboration',
    'Digital Communication',
    'AI Productivity Tools',
    'Digital Organisation',
  ],
  skillsCareer: [
    'CV Development',
    'LinkedIn & Portfolio Development',
    'Application Preparation',
    'Interview Preparation',
    'Opportunity Research',
    'Career Planning',
  ],

  curriculum: [
    { number: '01', title: 'Workplace Readiness' },
    { number: '02', title: 'Professional Skills' },
    { number: '03', title: 'Digital & AI Skills' },
    { number: '04', title: 'Professional Profile' },
    { number: '05', title: 'Applications & Interviews' },
    { number: '06', title: 'Career Planning' },
  ],

  whatsIncluded: [
    'Live training sessions',
    'Course materials',
    'Practical activities',
    'CV, LinkedIn and portfolio preparation',
    'Application preparation',
    'Interview preparation',
    'Certificate',
    'Additional support, where applicable',
  ],

  pricing: {
    fee: '₦50,000',
    includes: [
      'Live training',
      'Materials',
      'Practical activities',
      'Career preparation',
      'Certificate',
    ],
    paymentOptions: 'Full payment or 2-installment plan available.',
    financialSupport: 'Scholarship support available for eligible applicants.',
  },

  faqs: [
    {
      id: 'f1',
      question: 'Who is the programme for?',
      answer:
        'Final-year students, fresh graduates, entry-level job seekers, interns, young professionals and national-service participants.',
    },
    {
      id: 'f2',
      question: 'Do I need previous work experience?',
      answer: 'No. The programme is designed for people starting their careers.',
    },
    {
      id: 'f3',
      question: 'How long is the programme?',
      answer: '6 weeks, delivered virtually.',
    },
    {
      id: 'f4',
      question: 'Is the programme fully virtual?',
      answer: 'Yes.',
    },
    {
      id: 'f5',
      question: 'Will I receive a certificate?',
      answer: 'Yes, on successful completion.',
    },
    {
      id: 'f6',
      question: 'What happens after I apply?',
      answer: 'Your application is reviewed and you will be contacted with the outcome.',
    },
  ],

  finalCta: {
    headline: 'Ready to get workplace-ready?',
    subheadline:
      'Build the practical, digital and professional skills you need to approach entry-level opportunities with confidence.',
  },
};

// ============================================================================
// Course 3 — Tech 360
// ============================================================================

const tech360: Course = {
  id: 'tech360',
  slug: 'tech-360',
  name: 'Tech 360',
  tagline: 'Explore tech. Find your path. Build your future.',
  description:
    'Explore different technology career paths through practical learning, hands-on projects and mentorship, while building the skills and experience needed to pursue tech opportunities.',
  duration: '8 weeks',
  format: 'Virtual',
  level: 'Beginner',
  accent: 'purple',
  emoji: '⚡',
  heroImage:
    'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200&h=800&fit=crop',
  certificateIncluded: true,

  nextCohort: {
    name: 'Cohort 6',
    startDate: '2026-06-02',
    endDate: '2026-07-28',
    schedule: 'Tue, Thu & Sat · 6:00pm – 8:00pm',
    format: 'Virtual',
    fee: '₦75,000',
    capacity: 60,
    spotsLeft: 25,
    status: 'open',
  },

  previousCohorts: [
    {
      name: 'Cohort 5',
      date: 'Jan – Mar 2026',
      format: 'Virtual',
      participants: 55,
      outcome: '72% moved into a tech role or internship within 4 months',
    },
    {
      name: 'Cohort 4',
      date: 'Aug – Oct 2025',
      format: 'Virtual',
      participants: 48,
      outcome: '65% started a tech portfolio project',
    },
  ],

  whyThisProgram:
    'Moving into tech can be difficult when someone has an interest in technology but doesn\'t know which path suits them or lacks practical experience, relevant skills and a clear route into the industry. TECH360 bridges the gap between interest in tech and readiness for a tech career through practical learning, real project experience and mentorship.',

  challenges: [
    {
      title: 'Which path is right for me?',
      description: 'Uncertainty about different tech roles and disciplines.',
    },
    {
      title: 'Where do I start?',
      description: 'Difficulty identifying relevant opportunities and entry points.',
    },
    {
      title: 'I need practical experience',
      description: 'Limited hands-on project experience.',
    },
    {
      title: "I don't know how to present myself",
      description: 'Uncertainty around CVs, portfolios, applications and interviews.',
    },
  ],

  whatYouLearn: [
    {
      number: '01',
      title: 'Tech & Industry Skills',
      description:
        'Build practical skills across selected technology paths and apply them through hands-on projects.',
    },
    {
      number: '02',
      title: 'Workplace Skills',
      description:
        'Develop communication, teamwork, problem-solving, time management and professional behaviour.',
    },
    {
      number: '03',
      title: 'Digital & Industry Tools',
      description:
        'Use relevant technology tools and platforms in practical work.',
    },
    {
      number: '04',
      title: 'Career Skills',
      description:
        'Develop your CV, portfolio, applications and interview skills.',
    },
    {
      number: '05',
      title: 'Job Search Skills',
      description:
        'Identify relevant tech and remote opportunities and develop a search strategy.',
    },
    {
      number: '06',
      title: 'Career Planning',
      description:
        'Set realistic goals and create a practical next-step plan.',
    },
  ],

  weekJourney: [
    { week: 'Week 1', title: 'Explore & Discover' },
    { week: 'Week 2', title: 'Tech Path Exploration' },
    { week: 'Week 3', title: 'Skills Development' },
    { week: 'Week 4', title: 'Practical Project Work' },
    { week: 'Week 5', title: 'Project & Collaboration' },
    { week: 'Week 6', title: 'Career & Professional Profile' },
    { week: 'Week 7', title: 'Applications & Interview Preparation' },
    { week: 'Week 8', title: 'Career Planning & Final Project' },
  ],

  experience: [
    'Practical, project-based learning',
    'Interactive sessions',
    'Real-world work scenarios',
    'Individual and group projects',
    'Hands-on technical activities',
    'CV and portfolio preparation',
    'Interview preparation',
    'Feedback and mentor support',
  ],

  outcomes: [
    'Greater understanding of different tech career paths',
    'Improved technical and workplace skills',
    'Practical project experience',
    'A polished CV and portfolio',
    'Improved interview confidence',
    'A clearer understanding of your next career direction',
    'A structured tech job-search strategy',
    'A practical career action plan',
    'A certificate of completion',
  ],

  whoItsFor: [
    'Fresh graduates',
    'Career changers',
    'Professionals considering a pivot into tech',
    'People who want to understand technology',
    'People preparing for entry-level technology roles',
    'People who want greater digital and technology readiness',
  ],
  prerequisites: 'No prior tech experience required. Open to anyone 18+.',

  skillsProfessional: [
    'Communication',
    'Teamwork',
    'Time Management',
    'Problem-Solving',
    'Adaptability',
    'Professional Behaviour',
  ],
  skillsDigital: [
    'Product Management',
    'Project Management',
    'Product Marketing',
    'UX Design & Research',
    'Data & Business Analysis',
    'Development',
    'Software Testing',
    'Digital Marketing',
    'AI Tools',
  ],
  skillsCareer: [
    'CV Development',
    'Portfolio Development',
    'Application Preparation',
    'Interview Preparation',
    'Opportunity Research',
    'Career Planning',
  ],

  curriculum: [
    { number: '01', title: 'Explore & Discover Tech Paths' },
    { number: '02', title: 'Tech Path Exploration' },
    { number: '03', title: 'Skills Development' },
    { number: '04', title: 'Practical Project Work' },
    { number: '05', title: 'Project & Collaboration' },
    { number: '06', title: 'Career & Professional Profile' },
    { number: '07', title: 'Applications & Interview Preparation' },
    { number: '08', title: 'Career Planning & Final Project' },
  ],

  whatsIncluded: [
    'Live training sessions',
    'Course materials',
    'Practical activities and projects',
    'Portfolio development',
    'Application preparation',
    'Interview preparation',
    'Mentorship',
    'Certificate',
    'Additional support, where applicable',
  ],

  pricing: {
    fee: '₦75,000',
    includes: [
      'Live training',
      'Course materials',
      'Practical projects',
      'Portfolio development',
      'Application & interview preparation',
      'Mentorship',
      'Certificate',
    ],
    paymentOptions: 'Full payment or 3-installment plan available.',
    financialSupport: 'Scholarship support available for eligible applicants.',
  },

  faqs: [
    {
      id: 'f1',
      question: 'Who is TECH360 for?',
      answer:
        'Fresh graduates, career changers, professionals pivoting into tech, and anyone preparing for entry-level tech roles.',
    },
    {
      id: 'f2',
      question: 'Do I need previous tech experience?',
      answer: 'No. TECH360 starts from fundamentals.',
    },
    {
      id: 'f3',
      question: 'Which technology paths will I explore?',
      answer:
        'Product Management, Project Management, UX Design, Data & Business Analysis, Front-end & Back-end Development, Software Testing, Digital Marketing and AI Tools.',
    },
    {
      id: 'f4',
      question: 'Do I have to choose a tech path before joining?',
      answer:
        'No. TECH360 is designed for exploration. You will narrow down as you go.',
    },
    {
      id: 'f5',
      question: 'How long is the programme?',
      answer: '8 weeks, delivered virtually.',
    },
    {
      id: 'f6',
      question: 'Will I work on real projects?',
      answer: 'Yes — hands-on projects are a core part of the programme.',
    },
    {
      id: 'f7',
      question: 'Will I receive a certificate?',
      answer: 'Yes, on successful completion.',
    },
  ],

  finalCta: {
    headline: 'Ready to start your tech journey?',
    subheadline:
      'Build practical, technical and professional skills and gain the experience to approach tech opportunities with confidence.',
  },
};

// ============================================================================
// Course 4 — AI for Everyone
// ============================================================================

const aiForEveryone: Course = {
  id: 'ai',
  slug: 'ai-for-everyone',
  name: 'AI for Everyone',
  tagline: 'Work smarter with AI.',
  description:
    'Learn how to use AI tools practically for work, content creation, business tasks and everyday productivity — and build real examples of what you can do with AI.',
  duration: '2 weeks',
  format: 'Virtual',
  level: 'Beginner',
  accent: 'orange',
  emoji: '🤖',
  heroImage:
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=800&fit=crop',
  certificateIncluded: true,

  nextCohort: {
    name: 'Cohort 4',
    startDate: '2026-05-05',
    endDate: '2026-05-16',
    schedule: 'Mon – Fri · 6:00pm – 8:00pm',
    format: 'Virtual',
    fee: '₦25,000',
    capacity: 100,
    spotsLeft: 60,
    status: 'open',
  },

  previousCohorts: [
    {
      name: 'Cohort 3',
      date: 'Mar 2026',
      format: 'Virtual',
      participants: 85,
      outcome: '90% built at least one AI-assisted project',
    },
    {
      name: 'Cohort 2',
      date: 'Jan 2026',
      format: 'Virtual',
      participants: 72,
    },
  ],

  whyThisProgram:
    'Many people have tried AI tools but still don\'t know how to use them effectively for real work. This workshop bridges the gap between basic AI use and practical AI productivity through hands-on learning, real tools and real-world tasks.',

  challenges: [
    {
      title: 'Getting useful results',
      description: 'Difficulty writing clear and effective prompts.',
    },
    {
      title: 'Knowing which tool to use',
      description: 'Uncertainty about which AI tool is suitable for different tasks.',
    },
    {
      title: 'Applying AI to real work',
      description: 'Limited experience using AI for business, content and everyday tasks.',
    },
    {
      title: 'Working productively with AI',
      description: 'Not knowing how to incorporate AI into an effective workflow.',
    },
    {
      title: 'Building confidence',
      description: 'Uncertainty about using AI professionally or creatively.',
    },
  ],

  whatYouLearn: [
    {
      number: '01',
      title: 'AI Fundamentals',
      description:
        'Understand how AI tools work, where they can be applied, and how to choose the right tool.',
    },
    {
      number: '02',
      title: 'Prompt Engineering',
      description:
        'Write clear, effective prompts and guide AI towards more useful results.',
    },
    {
      number: '03',
      title: 'AI for Work & Productivity',
      description:
        'Use AI for everyday work, administration, business tasks, research and productivity.',
    },
    {
      number: '04',
      title: 'AI for Content & Creativity',
      description:
        'Use AI for content creation, storytelling, cinematography and script-writing.',
    },
    {
      number: '05',
      title: 'AI & Digital Tools',
      description:
        'Work with productivity and creative tools, including Canva, and organise AI-assisted work effectively.',
    },
    {
      number: '06',
      title: 'Practical AI Projects',
      description:
        'Create AI-assisted content and projects that can be added to a portfolio.',
    },
    {
      number: '07',
      title: 'Applying AI to Your Career',
      description:
        'Identify how AI can support your current or future role and develop a plan.',
    },
  ],

  weekJourney: [
    { week: 'Week 1', title: 'Understand & Practise' },
    { week: 'Week 2', title: 'Create & Apply' },
  ],

  experience: [
    'Practical, hands-on learning',
    'Interactive sessions',
    'Real-world work and content scenarios',
    'Prompt-writing practice',
    'AI-tool exercises',
    'Individual and group activities',
    'Portfolio-building',
    'Feedback and improvement',
    'Mentor support',
  ],

  outcomes: [
    'Better understanding of practical AI use',
    'Stronger prompt-engineering skills',
    'Improved AI-assisted productivity',
    'Experience using AI for real work and content',
    'AI-assisted projects for your portfolio',
    'Greater confidence using AI tools',
    'A clearer understanding of how AI fits into your work',
    'A practical plan for continuing your AI learning',
  ],

  whoItsFor: [
    'Students',
    'Graduates',
    'Interns',
    'Entry-level professionals',
    'Existing employees',
    'Career changers',
    'Other professionals',
  ],
  prerequisites: 'No prior AI experience required. Open to anyone 16+.',

  skillsProfessional: [
    'Communication',
    'Problem-Solving',
    'Adaptability',
    'Professional Behaviour',
  ],
  skillsDigital: [
    'Prompt Engineering',
    'AI-Assisted Content Creation',
    'AI Productivity',
    'AI for Business Tasks',
    'AI for Storytelling & Script-Writing',
    'Canva',
    'Productivity Tools',
    'Collaboration Tools',
  ],
  skillsCareer: [
    'Portfolio Development',
    'Opportunity Research',
    'Career Planning',
  ],

  curriculum: [
    { number: '01', title: 'AI Fundamentals' },
    { number: '02', title: 'Prompt Engineering' },
    { number: '03', title: 'AI for Work & Productivity' },
    { number: '04', title: 'AI for Content & Creativity' },
    { number: '05', title: 'AI & Digital Tools' },
    { number: '06', title: 'Practical AI Projects' },
    { number: '07', title: 'Applying AI to Your Career' },
  ],

  whatsIncluded: [
    'Live training sessions',
    'Course materials',
    'Practical AI activities',
    'AI-assisted projects',
    'Portfolio-building experience',
    'Mentor support',
    'Certificate',
    'Additional support, where applicable',
  ],

  pricing: {
    fee: '₦25,000',
    includes: [
      'Live sessions',
      'Course materials',
      'Practical activities',
      'Projects',
      'Mentorship',
      'Certificate',
    ],
    paymentOptions: 'Full payment required at enrollment.',
    financialSupport: 'Scholarship support available for eligible applicants.',
  },

  faqs: [
    {
      id: 'f1',
      question: 'Who is this workshop for?',
      answer:
        'Anyone who wants to use AI practically — students, professionals, career changers, and entrepreneurs.',
    },
    {
      id: 'f2',
      question: 'Do I need previous AI experience?',
      answer: 'No. We start from fundamentals.',
    },
    {
      id: 'f3',
      question: 'What AI tools will I learn?',
      answer:
        'ChatGPT, Claude, Canva AI, and other leading productivity and creative AI tools.',
    },
    {
      id: 'f4',
      question: 'Will I work on practical projects?',
      answer: 'Yes. You will build AI-assisted content and projects.',
    },
    {
      id: 'f5',
      question: 'How long is the workshop?',
      answer: '2 weeks, delivered virtually.',
    },
    {
      id: 'f6',
      question: 'Will I receive a certificate?',
      answer: 'Yes, on successful completion.',
    },
  ],

  finalCta: {
    headline: 'Ready to work smarter with AI?',
    subheadline:
      'Build practical AI and productivity skills you can apply to your work, projects and career.',
  },
};

// ============================================================================
// Export all courses
// ============================================================================

export const COURSES: Course[] = [
  apprenticeshipPreparation,
  digitalWorkReadiness,
  tech360,
  aiForEveryone,
];

export const getCourseBySlug = (slug: string): Course | undefined =>
  COURSES.find((c) => c.slug === slug);

export const getCourseById = (id: string): Course | undefined =>
  COURSES.find((c) => c.id === id);