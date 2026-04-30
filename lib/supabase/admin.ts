import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

/**
 * Returns a cached Singleton Supabase client.
 * Specialized for background tasks and manager singletons to prevent memory leaks.
 */
export const createAdminClient = () => {
  if (adminClient) return adminClient;

  adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  return adminClient;
};
