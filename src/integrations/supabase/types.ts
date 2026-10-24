export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      alumni: {
        Row: {
          after_journey: string | null
          areas_of_expertise: string[] | null
          before_journey: string | null
          career_experience: string | null
          cohort: string | null
          created_at: string
          display_order: number
          featured: boolean
          feedback: string | null
          full_name: string
          id: string
          key_skills: string[] | null
          linkedin_url: string | null
          organization: string | null
          photo_url: string | null
          professional_summary: string | null
          professional_title: string
          programme: string | null
          short_summary: string
          status: Database["public"]["Enums"]["alumni_status"]
          trustpilot_url: string | null
          updated_at: string
        }
        Insert: {
          after_journey?: string | null
          areas_of_expertise?: string[] | null
          before_journey?: string | null
          career_experience?: string | null
          cohort?: string | null
          created_at?: string
          display_order?: number
          featured?: boolean
          feedback?: string | null
          full_name: string
          id?: string
          key_skills?: string[] | null
          linkedin_url?: string | null
          organization?: string | null
          photo_url?: string | null
          professional_summary?: string | null
          professional_title: string
          programme?: string | null
          short_summary: string
          status?: Database["public"]["Enums"]["alumni_status"]
          trustpilot_url?: string | null
          updated_at?: string
        }
        Update: {
          after_journey?: string | null
          areas_of_expertise?: string[] | null
          before_journey?: string | null
          career_experience?: string | null
          cohort?: string | null
          created_at?: string
          display_order?: number
          featured?: boolean
          feedback?: string | null
          full_name?: string
          id?: string
          key_skills?: string[] | null
          linkedin_url?: string | null
          organization?: string | null
          photo_url?: string | null
          professional_summary?: string | null
          professional_title?: string
          programme?: string | null
          short_summary?: string
          status?: Database["public"]["Enums"]["alumni_status"]
          trustpilot_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_avatar_url: string | null
          author_name: string | null
          author_profile_id: string | null
          author_role: string | null
          category_id: string | null
          content: string | null
          created_at: string
          display_order: number | null
          excerpt: string | null
          featured: boolean
          featured_image_url: string | null
          id: string
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string | null
          author_profile_id?: string | null
          author_role?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          display_order?: number | null
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string | null
          author_profile_id?: string | null
          author_role?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          display_order?: number | null
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      career_conversations: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          last_message_at: string | null
          message_count: number
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number
          summary?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_messages: {
        Row: {
          completion_tokens: number | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          model: string | null
          prompt_tokens: number | null
          role: string
          user_id: string
        }
        Insert: {
          completion_tokens?: number | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model?: string | null
          prompt_tokens?: number | null
          role: string
          user_id: string
        }
        Update: {
          completion_tokens?: number | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model?: string | null
          prompt_tokens?: number | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "career_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_profiles: {
        Row: {
          ai_summary: string | null
          areas_for_development: string[] | null
          career_field: string | null
          career_goal: string | null
          certifications: string[] | null
          completed_at: string | null
          created_at: string
          current_skills: string[] | null
          digital_skills: string[] | null
          education_level: string | null
          experience_level: string | null
          field_of_study: string | null
          id: string
          institution: string | null
          internship_experience: string | null
          last_assessed_at: string | null
          open_to_international: boolean | null
          opportunity_types: string[] | null
          preferred_locations: string[] | null
          professional_skills: string[] | null
          profile_completed: boolean
          projects: string | null
          readiness_assessment: Json | null
          readiness_score: number | null
          target_industries: string[] | null
          target_roles: string[] | null
          technical_skills: string[] | null
          updated_at: string
          user_id: string
          volunteer_experience: string | null
          work_arrangements: string[] | null
          work_experience: string | null
          years_of_experience: number | null
        }
        Insert: {
          ai_summary?: string | null
          areas_for_development?: string[] | null
          career_field?: string | null
          career_goal?: string | null
          certifications?: string[] | null
          completed_at?: string | null
          created_at?: string
          current_skills?: string[] | null
          digital_skills?: string[] | null
          education_level?: string | null
          experience_level?: string | null
          field_of_study?: string | null
          id?: string
          institution?: string | null
          internship_experience?: string | null
          last_assessed_at?: string | null
          open_to_international?: boolean | null
          opportunity_types?: string[] | null
          preferred_locations?: string[] | null
          professional_skills?: string[] | null
          profile_completed?: boolean
          projects?: string | null
          readiness_assessment?: Json | null
          readiness_score?: number | null
          target_industries?: string[] | null
          target_roles?: string[] | null
          technical_skills?: string[] | null
          updated_at?: string
          user_id: string
          volunteer_experience?: string | null
          work_arrangements?: string[] | null
          work_experience?: string | null
          years_of_experience?: number | null
        }
        Update: {
          ai_summary?: string | null
          areas_for_development?: string[] | null
          career_field?: string | null
          career_goal?: string | null
          certifications?: string[] | null
          completed_at?: string | null
          created_at?: string
          current_skills?: string[] | null
          digital_skills?: string[] | null
          education_level?: string | null
          experience_level?: string | null
          field_of_study?: string | null
          id?: string
          institution?: string | null
          internship_experience?: string | null
          last_assessed_at?: string | null
          open_to_international?: boolean | null
          opportunity_types?: string[] | null
          preferred_locations?: string[] | null
          professional_skills?: string[] | null
          profile_completed?: boolean
          projects?: string | null
          readiness_assessment?: Json | null
          readiness_score?: number | null
          target_industries?: string[] | null
          target_roles?: string[] | null
          technical_skills?: string[] | null
          updated_at?: string
          user_id?: string
          volunteer_experience?: string | null
          work_arrangements?: string[] | null
          work_experience?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "career_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          capacity: number | null
          cohort_token: string | null
          course_id: string
          created_at: string
          end_date: string | null
          fee: string | null
          format: string | null
          id: string
          is_next: boolean | null
          name: string
          registration_url: string | null
          schedule: string | null
          spots_left: number | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          cohort_token?: string | null
          course_id: string
          created_at?: string
          end_date?: string | null
          fee?: string | null
          format?: string | null
          id?: string
          is_next?: boolean | null
          name: string
          registration_url?: string | null
          schedule?: string | null
          spots_left?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          cohort_token?: string | null
          course_id?: string
          created_at?: string
          end_date?: string | null
          fee?: string | null
          format?: string | null
          id?: string
          is_next?: boolean | null
          name?: string
          registration_url?: string | null
          schedule?: string | null
          spots_left?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          read_at: string | null
          replied_at: string | null
          replied_by: string | null
          status: Database["public"]["Enums"]["contact_message_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          read_at?: string | null
          replied_at?: string | null
          replied_by?: string | null
          status?: Database["public"]["Enums"]["contact_message_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read_at?: string | null
          replied_at?: string | null
          replied_by?: string | null
          status?: Database["public"]["Enums"]["contact_message_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_replied_by_fkey"
            columns: ["replied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          accent: string | null
          certificate_included: boolean | null
          challenges: Json | null
          created_at: string
          curriculum: Json | null
          description: string | null
          display_order: number | null
          duration: string | null
          emoji: string | null
          experience: Json | null
          faqs: Json | null
          final_cta: Json | null
          format: string | null
          hero_image_url: string | null
          id: string
          level: string | null
          outcomes: Json | null
          prerequisites: string | null
          pricing: Json | null
          skills_career: Json | null
          skills_digital: Json | null
          skills_professional: Json | null
          slug: string
          status: string
          tagline: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          week_journey: Json | null
          what_you_learn: Json | null
          whats_included: Json | null
          who_its_for: Json | null
          why_this_program: string | null
        }
        Insert: {
          accent?: string | null
          certificate_included?: boolean | null
          challenges?: Json | null
          created_at?: string
          curriculum?: Json | null
          description?: string | null
          display_order?: number | null
          duration?: string | null
          emoji?: string | null
          experience?: Json | null
          faqs?: Json | null
          final_cta?: Json | null
          format?: string | null
          hero_image_url?: string | null
          id?: string
          level?: string | null
          outcomes?: Json | null
          prerequisites?: string | null
          pricing?: Json | null
          skills_career?: Json | null
          skills_digital?: Json | null
          skills_professional?: Json | null
          slug: string
          status?: string
          tagline?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          week_journey?: Json | null
          what_you_learn?: Json | null
          whats_included?: Json | null
          who_its_for?: Json | null
          why_this_program?: string | null
        }
        Update: {
          accent?: string | null
          certificate_included?: boolean | null
          challenges?: Json | null
          created_at?: string
          curriculum?: Json | null
          description?: string | null
          display_order?: number | null
          duration?: string | null
          emoji?: string | null
          experience?: Json | null
          faqs?: Json | null
          final_cta?: Json | null
          format?: string | null
          hero_image_url?: string | null
          id?: string
          level?: string | null
          outcomes?: Json | null
          prerequisites?: string | null
          pricing?: Json | null
          skills_career?: Json | null
          skills_digital?: Json | null
          skills_professional?: Json | null
          slug?: string
          status?: string
          tagline?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          week_journey?: Json | null
          what_you_learn?: Json | null
          whats_included?: Json | null
          who_its_for?: Json | null
          why_this_program?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          applied_at: string
          cohort_id: string | null
          completed_at: string | null
          course_id: string
          created_at: string
          dropped_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          cohort_id?: string | null
          completed_at?: string | null
          course_id: string
          created_at?: string
          dropped_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          cohort_id?: string | null
          completed_at?: string | null
          course_id?: string
          created_at?: string
          dropped_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          display_order: number
          id: string
          published: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          published?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          published?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      impact_metrics: {
        Row: {
          accent: string
          created_at: string
          description: string | null
          display_order: number
          emoji: string
          id: string
          label: string
          published: boolean
          updated_at: string
          value: string
        }
        Insert: {
          accent?: string
          created_at?: string
          description?: string | null
          display_order?: number
          emoji: string
          id?: string
          label: string
          published?: boolean
          updated_at?: string
          value: string
        }
        Update: {
          accent?: string
          created_at?: string
          description?: string | null
          display_order?: number
          emoji?: string
          id?: string
          label?: string
          published?: boolean
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      interest_submissions: {
        Row: {
          cohort_id: string | null
          course_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cohort_id?: string | null
          course_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cohort_id?: string | null
          course_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interest_submissions_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interest_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          admin_approved: boolean
          apply_url: string | null
          company: string
          company_logo_url: string | null
          course_id: string | null
          created_at: string
          deadline: string | null
          description: string
          display_order: number
          experience_level: Database["public"]["Enums"]["job_experience_level"]
          featured: boolean
          id: string
          location: string | null
          opportunity_type: Database["public"]["Enums"]["job_opportunity_type"]
          required_skills: string[] | null
          salary_range: string | null
          slug: string
          status: Database["public"]["Enums"]["job_status"]
          submitted_by_recruiter: string | null
          title: string
          updated_at: string
          work_mode: Database["public"]["Enums"]["job_work_mode"]
        }
        Insert: {
          admin_approved?: boolean
          apply_url?: string | null
          company: string
          company_logo_url?: string | null
          course_id?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          display_order?: number
          experience_level?: Database["public"]["Enums"]["job_experience_level"]
          featured?: boolean
          id?: string
          location?: string | null
          opportunity_type?: Database["public"]["Enums"]["job_opportunity_type"]
          required_skills?: string[] | null
          salary_range?: string | null
          slug: string
          status?: Database["public"]["Enums"]["job_status"]
          submitted_by_recruiter?: string | null
          title: string
          updated_at?: string
          work_mode?: Database["public"]["Enums"]["job_work_mode"]
        }
        Update: {
          admin_approved?: boolean
          apply_url?: string | null
          company?: string
          company_logo_url?: string | null
          course_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          display_order?: number
          experience_level?: Database["public"]["Enums"]["job_experience_level"]
          featured?: boolean
          id?: string
          location?: string | null
          opportunity_type?: Database["public"]["Enums"]["job_opportunity_type"]
          required_skills?: string[] | null
          salary_range?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["job_status"]
          submitted_by_recruiter?: string | null
          title?: string
          updated_at?: string
          work_mode?: Database["public"]["Enums"]["job_work_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "jobs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_submitted_by_recruiter_fkey"
            columns: ["submitted_by_recruiter"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nysc_details: {
        Row: {
          cohort_batch: string
          cohort_stream: string
          created_at: string
          id: string
          profile_id: string
          state_of_deployment: string
          updated_at: string
          year_of_deployment: string
        }
        Insert: {
          cohort_batch: string
          cohort_stream: string
          created_at?: string
          id?: string
          profile_id: string
          state_of_deployment: string
          updated_at?: string
          year_of_deployment: string
        }
        Update: {
          cohort_batch?: string
          cohort_stream?: string
          created_at?: string
          id?: string
          profile_id?: string
          state_of_deployment?: string
          updated_at?: string
          year_of_deployment?: string
        }
        Relationships: [
          {
            foreignKeyName: "nysc_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      previous_cohorts: {
        Row: {
          course_id: string
          created_at: string
          date_range: string
          display_order: number | null
          format: string | null
          id: string
          name: string
          outcome: string | null
          participants: number | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          date_range: string
          display_order?: number | null
          format?: string | null
          id?: string
          name: string
          outcome?: string | null
          participants?: number | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          date_range?: string
          display_order?: number | null
          format?: string | null
          id?: string
          name?: string
          outcome?: string | null
          participants?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "previous_cohorts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_url: string | null
          bio_title: string | null
          country: string | null
          created_at: string
          created_by_admin: string | null
          email: string
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          iq_id: string | null
          last_name: string
          lga: string | null
          marketing_opt_in: boolean
          middle_name: string | null
          must_change_password: boolean
          participant_id: string | null
          phone: string | null
          profile_completion: number
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          tier: Database["public"]["Enums"]["account_tier"]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          bio_title?: string | null
          country?: string | null
          created_at?: string
          created_by_admin?: string | null
          email: string
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          iq_id?: string | null
          last_name?: string
          lga?: string | null
          marketing_opt_in?: boolean
          middle_name?: string | null
          must_change_password?: boolean
          participant_id?: string | null
          phone?: string | null
          profile_completion?: number
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          tier?: Database["public"]["Enums"]["account_tier"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          bio_title?: string | null
          country?: string | null
          created_at?: string
          created_by_admin?: string | null
          email?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          iq_id?: string | null
          last_name?: string
          lga?: string | null
          marketing_opt_in?: boolean
          middle_name?: string | null
          must_change_password?: boolean
          participant_id?: string | null
          phone?: string | null
          profile_completion?: number
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          tier?: Database["public"]["Enums"]["account_tier"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_created_by_admin_fkey"
            columns: ["created_by_admin"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_profiles: {
        Row: {
          company_description: string | null
          company_linkedin_url: string | null
          company_name: string
          company_size: string | null
          company_website: string | null
          created_at: string
          hiring_needs: string | null
          id: string
          industry: string
          linkedin_url: string | null
          position: string
          profile_id: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          updated_at: string
          verification_notes: string | null
          verification_status: Database["public"]["Enums"]["recruiter_verification_status"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          company_description?: string | null
          company_linkedin_url?: string | null
          company_name: string
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          hiring_needs?: string | null
          id?: string
          industry: string
          linkedin_url?: string | null
          position: string
          profile_id: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["recruiter_verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          company_description?: string | null
          company_linkedin_url?: string | null
          company_name?: string
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          hiring_needs?: string | null
          id?: string
          industry?: string
          linkedin_url?: string | null
          position?: string
          profile_id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["recruiter_verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_profiles_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_profiles_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          apply_url: string | null
          course_id: string | null
          coverage: string | null
          created_at: string
          deadline: string | null
          description: string
          display_order: number
          eligibility: string | null
          id: string
          slug: string
          status: Database["public"]["Enums"]["scholarship_status"]
          title: string
          updated_at: string
        }
        Insert: {
          apply_url?: string | null
          course_id?: string | null
          coverage?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          display_order?: number
          eligibility?: string | null
          id?: string
          slug: string
          status?: Database["public"]["Enums"]["scholarship_status"]
          title: string
          updated_at?: string
        }
        Update: {
          apply_url?: string | null
          course_id?: string | null
          coverage?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          display_order?: number
          eligibility?: string | null
          id?: string
          slug?: string
          status?: Database["public"]["Enums"]["scholarship_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          page: string
          section: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          page: string
          section: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          page?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_invites: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          email_error: string | null
          email_sent_at: string | null
          email_status: string | null
          full_name: string | null
          id: string
          iq_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          email_error?: string | null
          email_sent_at?: string | null
          email_status?: string | null
          full_name?: string | null
          id?: string
          iq_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          email_error?: string | null
          email_sent_at?: string | null
          email_status?: string | null
          full_name?: string | null
          id?: string
          iq_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_invites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          cohort_id: string | null
          course_id: string | null
          granted_at: string
          granted_by: string | null
          id: string
          revoked_at: string | null
          revoked_by: string | null
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Insert: {
          cohort_id?: string | null
          course_id?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Update: {
          cohort_id?: string | null
          course_id?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          role?: Database["public"]["Enums"]["user_role_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_by_role: {
        Args: { p_role: Database["public"]["Enums"]["user_role"] }
        Returns: number
      }
      generate_iq_id: { Args: { p_cohort_token: string }; Returns: string }
      generate_participant_id: { Args: never; Returns: string }
      generate_temp_password: { Args: never; Returns: string }
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      account_status: "active" | "suspended" | "deleted"
      account_tier: "guest" | "verified"
      account_type: "member" | "recruiter" | "admin"
      alumni_status: "draft" | "published" | "archived"
      blog_status: "draft" | "published" | "archived"
      contact_message_status: "new" | "read" | "replied" | "archived"
      enrollment_status: "applied" | "active" | "completed" | "dropped"
      gender_type: "male" | "female" | "other" | "prefer-not-to-say"
      job_experience_level: "entry" | "junior" | "mid" | "senior" | "any"
      job_opportunity_type:
        | "full-time"
        | "part-time"
        | "internship"
        | "paid-internship"
        | "unpaid-internship"
        | "freelance"
        | "contract"
        | "volunteer"
        | "graduate-trainee"
        | "apprenticeship"
      job_status: "draft" | "published" | "closed" | "archived"
      job_work_mode: "remote" | "hybrid" | "on-site"
      recruiter_verification_status:
        | "pending"
        | "verified"
        | "rejected"
        | "suspended"
      scholarship_status: "draft" | "published" | "closed" | "archived"
      user_role: "student" | "nysc" | "recruiter" | "admin"
      user_role_type: "student" | "alumni" | "recruiter" | "admin"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "suspended", "deleted"],
      account_tier: ["guest", "verified"],
      account_type: ["member", "recruiter", "admin"],
      alumni_status: ["draft", "published", "archived"],
      blog_status: ["draft", "published", "archived"],
      contact_message_status: ["new", "read", "replied", "archived"],
      enrollment_status: ["applied", "active", "completed", "dropped"],
      gender_type: ["male", "female", "other", "prefer-not-to-say"],
      job_experience_level: ["entry", "junior", "mid", "senior", "any"],
      job_opportunity_type: [
        "full-time",
        "part-time",
        "internship",
        "paid-internship",
        "unpaid-internship",
        "freelance",
        "contract",
        "volunteer",
        "graduate-trainee",
        "apprenticeship",
      ],
      job_status: ["draft", "published", "closed", "archived"],
      job_work_mode: ["remote", "hybrid", "on-site"],
      recruiter_verification_status: [
        "pending",
        "verified",
        "rejected",
        "suspended",
      ],
      scholarship_status: ["draft", "published", "closed", "archived"],
      user_role: ["student", "nysc", "recruiter", "admin"],
      user_role_type: ["student", "alumni", "recruiter", "admin"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
    },
  },
} as const
