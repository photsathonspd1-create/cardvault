import { createClient, SupabaseClient } from "@supabase/supabase-js"

let _admin: SupabaseClient | null = null

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_admin) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required")
      if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required")
      _admin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    }
    return (_admin as any)[prop]
  },
})
