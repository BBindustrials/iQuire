// ============================================================================
// Supabase Integration — Barrel Export
// ============================================================================

export { supabase, SUPABASE_URL } from './client';

export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Json,
} from './types';

// Re-export enum types from the Database schema
import type { Database } from './types';

export type AccountTypeEnum = Database['public']['Enums']['account_type'];
export type AccountTierEnum = Database['public']['Enums']['account_tier'];
export type UserRoleTypeEnum = Database['public']['Enums']['user_role_type'];
export type EnrollmentStatusEnum = Database['public']['Enums']['enrollment_status'];

// Storage helpers
export {
  uploadFile,
  deleteFile,
  getSignedUrl,
  validateFile,
} from './storage';

export type { BucketName, UploadResult } from './storage';