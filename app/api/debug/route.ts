import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-client"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  // Only allow ADMIN users
  const session = await getSession(request)
  const userId = session?.user?.id
  const userRole = (session?.user as any)?.role
  if (!userId || userRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

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

    // Test 4: prisma proxy findMany with fetch monitoring
    let prismaResult: unknown[] = []
    let prismaError: string | null = null
    let fetchLog: string[] = []
    try {
      const origFetch = globalThis.fetch
      globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
        const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
        fetchLog.push(urlStr.length > 200 ? urlStr.substring(0, 200) + "..." : urlStr)
        return origFetch(input as string, init)
      }

      prismaResult = await prisma.listing.findMany({
        where: { status: "ACTIVE" },
        include: {
          images: { take: 1, orderBy: { order: "asc" } },
          seller: { include: { user: { select: { name: true, username: true } } } },
        },
        take: 2,
        orderBy: { createdAt: "desc" },
      })

      globalThis.fetch = origFetch
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

    // Test 6: same as test5 but with URL.searchParams (same encoding as postgrestFetch)
    let test6Result: unknown = null
    let test6Error: string | null = null
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ruugptsudyxyozywevcu.supabase.co"
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dWdwdHN1ZHl4eW96eXdldmN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkzODEzMSwiZXhwIjoyMDk0NTE0MTMxfQ.sPpG_MTIrrOArwF0_QlS9opOL9KRhuO6QhL23V_h2b4"
      const urlObj = new URL(`${supabaseUrl}/rest/v1/Listing`)
      urlObj.searchParams.set("select", "*,ListingImage(*),SellerProfile(*,User(name,username))")
      urlObj.searchParams.set("status", "eq.ACTIVE")
      urlObj.searchParams.set("limit", "2")
      urlObj.searchParams.set("order", "createdAt.desc")
      const res = await fetch(urlObj.toString(), {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=representation",
        },
      })
      if (!res.ok) {
        test6Error = `HTTP ${res.status}: ${await res.text()}`
      } else {
        const data = await res.json()
        test6Result = {
          count: data.length,
          hasSellerProfile: data[0] ? "SellerProfile" in data[0] : false,
          url: urlObj.toString().substring(0, 300),
        }
      }
    } catch (err) {
      test6Error = String(err)
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
        fetchLog: fetchLog,
      },
      test5_rawPostgREST: test5Result ?? test5Error,
      test6_urlParamFetch: test6Result ?? test6Error,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
