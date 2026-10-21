// ============================================================================
// Ambient declarations for Deno runtime (fixes VS Code errors)
// ============================================================================

declare namespace Deno {
  const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): Record<string, string>;
  };

  function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}