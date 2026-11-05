import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || "https://hbpqgedsxbthvmmyjeol.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

/**
 * Cliente Supabase oficial do back-end para operações autenticadas,
 * bypass de RLS via secret key e integração com storage/auth.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

