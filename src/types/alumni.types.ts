// ============================================================================
// iQuire — Alumni Types
// ============================================================================

export interface Alumni {
  id: string;
  full_name: string;
  professional_title: string;
  photo_url: string | null;
  programme: string | null;
  cohort: string | null;
  short_summary: string;
  professional_summary: string | null;
  areas_of_expertise: string[];
  key_skills: string[];
  career_experience: string | null;
  feedback: string | null;
  trustpilot_url: string | null;
  linkedin_url: string | null;
  featured: boolean;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface AlumniInput {
  full_name: string;
  professional_title: string;
  photo_url?: string | null;
  programme?: string | null;
  cohort?: string | null;
  short_summary: string;
  professional_summary?: string | null;
  areas_of_expertise?: string[];
  key_skills?: string[];
  career_experience?: string | null;
  feedback?: string | null;
  trustpilot_url?: string | null;
  linkedin_url?: string | null;
  featured?: boolean;
  display_order?: number;
  status?: 'draft' | 'published' | 'archived';
}