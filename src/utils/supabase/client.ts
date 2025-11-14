import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

let supabaseClientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createSupabaseClient(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'farmer-assistant-auth',
        storage: window.localStorage,
      },
    });
  }
  return supabaseClientInstance;
}
