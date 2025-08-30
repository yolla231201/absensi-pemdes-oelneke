import { createClient } from "@supabase/supabase-js";

// ⚠️ Hanya untuk server-side (API routes, server actions)
// Jangan dipakai di komponen React!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing! 🚨");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
