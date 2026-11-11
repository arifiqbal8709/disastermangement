import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let supabaseClient = null;

if (config.supabase.url && config.supabase.serviceRoleKey) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    logger.info('Supabase client initialized successfully.');
  } catch (err) {
    logger.error('Failed to initialize Supabase client:', { error: err.message });
  }
} else {
  logger.warn('Supabase URL or Service Role Key missing. System will operate in local database emulation mode until configured.');
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = () => Boolean(supabaseClient);

