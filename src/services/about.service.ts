// ============================================================================
// iQuire — About Service (Phase 14.11)
// ============================================================================
// Reads/writes About page content from site_content table.
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export interface SiteSection<T = Record<string, unknown>> {
  id: string;
  page: string;
  section: string;
  content: T;
  created_at: string;
  updated_at: string;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---- Section-specific content shapes ----

export interface AboutHeroContent {
  badge: string;
  title_prefix: string;
  title_highlight: string;
  subtitle: string;
}

export interface AboutStoryContent {
  badge: string;
  title: string;
  paragraphs: string[];
  image_url: string;
}

export interface AboutMissionVisionCard {
  icon: string;
  title: string;
  paragraphs: string[];
}

export interface AboutMissionVisionContent {
  badge: string;
  title_prefix: string;
  title_highlight: string;
  cards: AboutMissionVisionCard[];
}

export interface AboutCommitmentCard {
  number: string;
  title: string;
  text: string;
}

export interface AboutCommitmentContent {
  badge: string;
  title: string;
  cards: AboutCommitmentCard[];
}

export interface AboutFounderContent {
  badge: string;
  name: string;
  credentials: string;
  roles: string;
  bio_paragraphs: string[];
  photo_url: string;
  linkedin_url: string;
}

export interface AboutContentBundle {
  hero: AboutHeroContent | null;
  story: AboutStoryContent | null;
  mission_vision: AboutMissionVisionContent | null;
  commitment: AboutCommitmentContent | null;
  founder: AboutFounderContent | null;
}

// ============================================================================
// PUBLIC — Fetch all About sections in one query
// ============================================================================

export const fetchAboutContent = async (): Promise<
  ServiceResponse<AboutContentBundle>
> => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('section, content')
      .eq('page', 'about');

    if (error) return { success: false, error: error.message };

    const rows = (data ?? []) as { section: string; content: unknown }[];
    const map = new Map(rows.map((r) => [r.section, r.content]));

    return {
      success: true,
      data: {
        hero: (map.get('hero') as AboutHeroContent | undefined) ?? null,
        story: (map.get('story') as AboutStoryContent | undefined) ?? null,
        mission_vision:
          (map.get('mission_vision') as AboutMissionVisionContent | undefined) ??
          null,
        commitment:
          (map.get('commitment') as AboutCommitmentContent | undefined) ?? null,
        founder: (map.get('founder') as AboutFounderContent | undefined) ?? null,
      },
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Update one section (upsert)
// ============================================================================

export const updateAboutSection = async <T extends Record<string, unknown>>(
  section: string,
  content: T
): Promise<ServiceResponse<SiteSection<T>>> => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .upsert(
        { page: 'about', section, content },
        { onConflict: 'page,section' }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as SiteSection<T> };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};