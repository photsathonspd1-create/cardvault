import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-client"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test 1: simple select
    const { data: simple, error: e1 } = await supabaseAdmin
      .from("Listing")
      .select("*")
      .eq("status", "ACTIVE")
      .limit(2)

    // Test 2: with embedded resources via Supabase JS client
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

    // Test 4: prisma proxy findMany (what browse page uses)
    let prismaResult: unknown[] = []
    let prismaError: string | null = null
    try {
      prismaResult = await prisma.listing.findMany({
        where: { status: "ACTIVE" },
        include: {
          images: { take: 1, orderBy: { order: "asc" } },
          seller: { include: { user: { select: { name: true, username: true } } } },
        },
        take: 2,
        orderBy: { createdAt: "desc" },
      })
    } catch (err) {
      prismaError = String(err)
    }

    // Test 5: raw PostgREST fetch (bypasses Supabase JS client)
    let test5Result: unknown = null
    let test5Error: string | null = null
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ruugptsudyxyozywevcu.supabase.co"
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
      const selectStr = "*,ListingImage(*),SellerProfile(*,User(name,username))"
      const url = `${supabaseUrl}/rest/v1/Listing?select=${encodeURIComponent(selectStr)}&status=eq.ACTIVE&limit=2&order=createdAt.desc`
      const res = await fetch(url, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      })
      if (!res.ok) {
        test5Error = `HTTP ${res.status}: ${await res.text()}`
      } else {
        const data = await res.json()
        test5Result = {
          count: data.length,
          hasSellerProfile: data[0] ? "SellerProfile" in data[0] : false,
          sellerProfile: data[0]?.SellerProfile,
          keys: data[0] ? Object.keys(data[0]) : [],
        }
      }
    } catch (err) {
      test5Error = String(err)
    }

    return NextResponse.json({
      test1_simple: { count: simple?.length ?? 0, error: e1?.message },
      test2_supabaseJs: {
        count: withInclude?.length ?? 0,
        error: e2?.message,
        hasSellerProfile: withInclude?.[0] ? "SellerProfile" in (withInclude[0] as Record<string, unknown>) : false,
      },
      test3_count: { count, error: e3?.message },
      test4_prismaProxy: {
        count: prismaResult.length,
        error: prismaError,
        hasSellerProfile: prismaResult[0] ? "SellerProfile" in (prismaResult[0] as Record<string, unknown>) : false,
        hasImages: prismaResult[0] ? "ListingImage" in (prismaResult[0] as Record<string, unknown>) : false,
      },
      test5_rawPostgREST: test5Result ?? test5Error,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
