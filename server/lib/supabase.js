// server/lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase URL or Service Role Key is missing in server environment. Supabase calls will fail.');
}

// Supabase admin client for database manipulation (bypass RLS where needed)
export const supabase = createClient(supabaseUrl || 'https://your-project.supabase.co', supabaseServiceKey || 'your-key', {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
