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
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
