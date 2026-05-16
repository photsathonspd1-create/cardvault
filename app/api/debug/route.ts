import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-client"

export async function GET() {
  try {
    // Test 1: simple select
    const { data: simple, error: e1 } = await supabaseAdmin
      .from("Listing")
      .select("*")
      .eq("status", "ACTIVE")
      .limit(2)

    // Test 2: with embedded resources
    const { data: withInclude, error: e2 } = await supabaseAdmin
      .from("Listing")
      .select("*,ListingImage(*),SellerProfile(*,User(name,username))")
      .eq("status", "ACTIVE")
      .limit(2)

    // Test 3: count
    const { count, error: e3 } = await supabaseAdmin
      .from("Listing")
      .select("*", { count: "exact", head: true })
      .eq("status", "ACTIVE")

    return NextResponse.json({
      test1_simple: { count: simple?.length ?? 0, error: e1?.message },
      test2_include: { count: withInclude?.length ?? 0, error: e2?.message, sample: withInclude?.[0]?.customName },
      test3_count: { count, error: e3?.message },
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
