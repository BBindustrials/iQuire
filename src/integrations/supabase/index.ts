// ============================================================================
// Supabase Integration — Barrel Export
// ============================================================================

export { supabase, SUPABASE_URL } from './client';
export type { Database, Tables, TablesInsert, TablesUpdate, Json } from './types';

// Storage helpers
export {
  uploadFile,
  deleteFile,
  getSignedUrl,
  validateFile,
} from './storage';

export type {
  BucketName,
  UploadResult,
} from './storage';