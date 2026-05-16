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

    // Test 4: prisma proxy findMany (what browse page uses)
    let prismaResult: unknown[] = []
    let prismaError: string | null = null
    let prismaMethod = "unknown"
    try {
      // Patch: temporarily capture console.error to detect which method was used
      const origError = console.error
      const errors: string[] = []
      console.error = (...args: unknown[]) => { errors.push(args.map(String).join(" ' ')); origError(...args) }
      
      prismaResult = await prisma.listing.findMany({
        where: { status: "ACTIVE" },
        include: {
          images: { take: 1, orderBy: { order: "asc" } },
          seller: { include: { user: { select: { name: true, username: true } } } },
        },
        take: 2,
        orderBy: { createdAt: "desc" },
      })
      
      console.error = origError
      
      if (errors.some(e => e.includes("PostgREST"))) {
        prismaMethod = "postgrest-fallback-supabase-js"
      } else if (errors.some(e => e.includes("fetchIncludes"))) {
        prismaMethod = "supabase-js-fetchIncludes"
      } else {
        prismaMethod = "postgrest-raw"
      }
    } catch (err) {
      prismaError = String(err)
    }

    // Test 6: raw fetch direct test
    let test6Result: unknown = null
    let test6Error: string | null = null
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
        test6Error = `HTTP ${res.status}: ${await res.text()}`
      } else {
        const data = await res.json()
        test6Result = {
          count: data.length,
          hasSellerProfile: data[0] ? "SellerProfile" in data[0] : false,
          sellerProfile: data[0]?.SellerProfile,
        }
      }
    } catch (err) {
      test6Error = String(err)
    }

    // Test 5: check what select string the proxy builds
    let selectStringInfo = ""
    try {
      // Manually test the embedded select that the proxy should build
      const testSelect = "*,ListingImage(*),SellerProfile(*,User(name,username))"
      const { data: test5Data, error: test5Err } = await supabaseAdmin
        .from("Listing")
        .select(testSelect)
        .eq("status", "ACTIVE")
        .limit(1)
      selectStringInfo = JSON.stringify({
        select: testSelect,
        error: test5Err?.message,
        count: test5Data?.length,
        hasSellerProfile: test5Data?.[0] ? "SellerProfile" in test5Data[0] : false,
        sellerProfileValue: test5Data?.[0]?.SellerProfile,
        keys: test5Data?.[0] ? Object.keys(test5Data[0]) : [],
      })
    } catch (err) {
      selectStringInfo = String(err)
    }

    return NextResponse.json({
      test1_simple: { count: simple?.length ?? 0, error: e1?.message },
      test2_include: { count: withInclude?.length ?? 0, error: e2?.message, sample: withInclude?.[0]?.customName },
      test3_count: { count, error: e3?.message },
      test4_prisma: { count: prismaResult.length, error: prismaError, sample: prismaResult[0] },
      test5_selectString: selectStringInfo,
      test6_rawFetch: test6Result ?? test6Error,
      prismaMethod: prismaMethod,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
