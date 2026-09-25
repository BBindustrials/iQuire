// ============================================================================
// Supabase Database Types — Phase 7A.2 (corrected)
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'student' | 'nysc' | 'recruiter' | 'admin';
          account_type: 'member' | 'recruiter' | 'admin';
          tier: 'guest' | 'verified';
          participant_id: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null;
          email: string;
          phone: string | null;
          country: string | null;
          state: string | null;
          lga: string | null;
          avatar_url: string | null;
          profile_completion: number;
          verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
          account_status: 'active' | 'suspended' | 'deleted';
          marketing_opt_in: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'student' | 'nysc' | 'recruiter' | 'admin';
          account_type?: 'member' | 'recruiter' | 'admin';
          tier?: 'guest' | 'verified';
          participant_id?: string;
          first_name?: string;
          middle_name?: string | null;
          last_name?: string;
          gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null;
          email: string;
          phone?: string | null;
          country?: string | null;
          state?: string | null;
          lga?: string | null;
          avatar_url?: string | null;
          profile_completion?: number;
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
          account_status?: 'active' | 'suspended' | 'deleted';
          marketing_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'student' | 'nysc' | 'recruiter' | 'admin';
          account_type?: 'member' | 'recruiter' | 'admin';
          tier?: 'guest' | 'verified';
          participant_id?: string;
          first_name?: string;
          middle_name?: string | null;
          last_name?: string;
          gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null;
          email?: string;
          phone?: string | null;
          country?: string | null;
          state?: string | null;
          lga?: string | null;
          avatar_url?: string | null;
          profile_completion?: number;
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
          account_status?: 'active' | 'suspended' | 'deleted';
          marketing_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'student' | 'alumni' | 'recruiter' | 'admin';
          course_id: string | null;
          cohort_id: string | null;
          granted_at: string;
          granted_by: string | null;
          revoked_at: string | null;
          revoked_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'student' | 'alumni' | 'recruiter' | 'admin';
          course_id?: string | null;
          cohort_id?: string | null;
          granted_at?: string;
          granted_by?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'student' | 'alumni' | 'recruiter' | 'admin';
          course_id?: string | null;
          cohort_id?: string | null;
          granted_at?: string;
          granted_by?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
        };
        Relationships: [];
      };

      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      cohorts: {
        Row: {
          id: string;
          course_id: string;
          name: string;
          start_date: string | null;
          end_date: string | null;
          capacity: number | null;
          status: 'open' | 'closed' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          name: string;
          start_date?: string | null;
          end_date?: string | null;
          capacity?: number | null;
          status?: 'open' | 'closed' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          name?: string;
          start_date?: string | null;
          end_date?: string | null;
          capacity?: number | null;
          status?: 'open' | 'closed' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          cohort_id: string | null;
          status: 'applied' | 'active' | 'completed' | 'dropped';
          applied_at: string;
          started_at: string | null;
          completed_at: string | null;
          dropped_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          cohort_id?: string | null;
          status?: 'applied' | 'active' | 'completed' | 'dropped';
          applied_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          dropped_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          cohort_id?: string | null;
          status?: 'applied' | 'active' | 'completed' | 'dropped';
          applied_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          dropped_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      nysc_details: {
        Row: {
          id: string;
          profile_id: string;
          year_of_deployment: string;
          state_of_deployment: string;
          cohort_batch: string;
          cohort_stream: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          year_of_deployment: string;
          state_of_deployment: string;
          cohort_batch: string;
          cohort_stream: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          year_of_deployment?: string;
          state_of_deployment?: string;
          cohort_batch?: string;
          cohort_stream?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      recruiter_profiles: {
        Row: {
          id: string;
          profile_id: string;
          position: string;
          company_name: string;
          industry: string;
          company_website: string | null;
          company_size: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          position: string;
          company_name: string;
          industry: string;
          company_website?: string | null;
          company_size?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          position?: string;
          company_name?: string;
          industry?: string;
          company_website?: string | null;
          company_size?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      generate_participant_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      account_type: 'member' | 'recruiter' | 'admin';
      account_tier: 'guest' | 'verified';
      user_role_type: 'student' | 'alumni' | 'recruiter' | 'admin';
      user_role: 'student' | 'nysc' | 'recruiter' | 'admin';
      gender_type: 'male' | 'female' | 'other' | 'prefer-not-to-say';
      enrollment_status: 'applied' | 'active' | 'completed' | 'dropped';
      verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
      account_status: 'active' | 'suspended' | 'deleted';
    };
    CompositeTypes: Record<string, never>;
  };
}

// ============================================================================
// Convenience helpers
// ============================================================================

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database['public']['Tables'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database['public']['Tables'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'])
    ? (Database['public']['Tables'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database['public']['Tables'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database['public']['Tables'])[TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'])
    ? (Database['public']['Tables'])[PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database['public']['Tables'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database['public']['Tables'])[TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'])
    ? (Database['public']['Tables'])[PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;