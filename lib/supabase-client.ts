import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ruugptsudyxyozywevcu.supabase.co"
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dWdwdHN1ZHl4eW96eXdldmN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkzODEzMSwiZXhwIjoyMDk0NTE0MTMxfQ.sPpG_MTIrrOArwF0_QlS9opOL9KRhuO6QhL23V_h2b4"

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)
