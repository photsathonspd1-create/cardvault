// @ts-nocheck
/**
 * Prisma-compatible wrapper using Supabase REST API (PostgREST).
 *
 * Drop-in replacement — all existing code that uses `prisma.model.findMany(...)`
 * continues to work without changes.
 */

import { supabaseAdmin } from "./supabase-client"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!SUPABASE_URL) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required")
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required")

// ─── Raw PostgREST fetch (bypasses Supabase JS client limitations) ──
async function postgrestFetch<T = unknown[]>(
  table: string,
  params: Record<string, string>,
  signal?: AbortSignal
): Promise<{ data: T | null; error: string | null }> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: "return=representation",
      },
      signal,
    })

    if (!res.ok) {
      const body = await res.text()
      return { data: null, error: `PostgREST ${res.status}: ${body}` }
    }

    const data = await res.json()
    return { data: data as T, error: null }
  } catch (err: unknown) {
    return { data: null, error: String(err) }
  }
}

// ─── Relation name mapping (Prisma → PostgREST table names) ───────
// SCOPED: keyed by parent table → relation → target table
// This avoids collisions when the same relation name (e.g. "seller") 
// maps to different tables depending on the parent.
const RELATION_MAP_SCOPED: Record<string, Record<string, string>> = {
  Listing: {
    images: "ListingImage",
    seller: "SellerProfile",
    card: "CardCatalog",
    shippingOptions: "ShippingOption",
    orders: "Order",
    reports: "Report",
    watchlists: "Watchlist",
    priceAlerts: "PriceAlert",
  },
  SellerProfile: {
    user: "User",
    bankAccount: "BankAccount",
    subscription: "SellerSubscription",
    listings: "Listing",
  },
  User: {
    sellerProfile: "SellerProfile",
    buyerOrders: "Order",
    sellerOrders: "Order",
    accounts: "Account",
    sessions: "Session",
    reviewsGiven: "Review",
    reviewsReceived: "Review",
    watchlist: "Watchlist",
    notifications: "Notification",
    disputes: "Dispute",
    priceAlerts: "PriceAlert",
    communityPosts: "CommunityPost",
    postComments: "PostComment",
    postLikes: "PostLike",
    forumThreads: "ForumThread",
    forumReplies: "ForumReply",
    scammerReports: "ScammerReport",
    reports: "Report",
  },
  Order: {
    listing: "Listing",
    buyer: "User",
    seller: "User",
    dispute: "Dispute",
    review: "Review",
    statusHistory: "OrderStatusHistory",
  },
  CardCatalog: {
    priceHistory: "PriceHistory",
    listings: "Listing",
  },
  CommunityPost: {
    author: "User",
    comments: "PostComment",
    likes: "PostLike",
  },
  PostComment: {
    author: "User",
    post: "CommunityPost",
    parent: "PostComment",
    replies: "PostComment",
  },
  Dispute: {
    order: "Order",
    raisedBy: "User",
    evidence: "DisputeEvidence",
  },
  Review: {
    order: "Order",
    reviewer: "User",
    reviewee: "User",
  },
  Report: {
    listing: "Listing",
    reporter: "User",
  },
}

/** Resolve a Prisma relation name to a PostgREST table name, scoped by parent table. */
function resolveRelation(parentTable: string, relation: string): string {
  return RELATION_MAP_SCOPED[parentTable]?.[relation] ?? relation
}

// Keep a flat fallback map for contexts where parent table is unknown
const RELATION_MAP: Record<string, string> = {
  images: "ListingImage",
  seller: "SellerProfile",
  card: "CardCatalog",
  shippingOptions: "ShippingOption",
  orders: "Order",
  reports: "Report",
  watchlists: "Watchlist",
  priceAlerts: "PriceAlert",
  user: "User",
  bankAccount: "BankAccount",
  subscription: "SellerSubscription",
  listings: "Listing",
  sellerProfile: "SellerProfile",
  buyerOrders: "Order",
  sellerOrders: "Order",
  accounts: "Account",
  sessions: "Session",
  reviewsGiven: "Review",
  reviewsReceived: "Review",
  watchlist: "Watchlist",
  notifications: "Notification",
  disputes: "Dispute",
  communityPosts: "CommunityPost",
  postComments: "PostComment",
  postLikes: "PostLike",
  forumThreads: "ForumThread",
  forumReplies: "ForumReply",
  scammerReports: "ScammerReport",
  listing: "Listing",
  buyer: "User",
  dispute: "Dispute",
  review: "Review",
  statusHistory: "OrderStatusHistory",
  priceHistory: "PriceHistory",
  author: "User",
  comments: "PostComment",
  likes: "PostLike",
  post: "CommunityPost",
  parent: "PostComment",
  replies: "PostComment",
  order: "Order",
  raisedBy: "User",
  evidence: "DisputeEvidence",
  reviewer: "User",
  reviewee: "User",
  reporter: "User",
}

// PostgREST embed hints for ambiguous relationships (multiple relations → same table)
// Key: parentTable → relationName → PostgREST constraint name
const AMBIGUOUS_HINTS: Record<string, Record<string, string>> = {
  Order: {
    buyer: "Order_buyerId_fkey",
    seller: "Order_sellerId_fkey",
  },
}

// Per-relation FK overrides for cases where guessForeignKey can't determine the correct FK
// because multiple relations from the same parent point to the same child table.
// Key: parentTable → relationName → { table, fkColumn on child OR parentFk on parent }
const RELATION_FK_HINTS: Record<string, Record<string, { fkColumn?: string; parentFk?: string }>> = {
  User: {
    buyerOrders: { fkColumn: "buyerId" },
    sellerOrders: { fkColumn: "sellerId" },
    reviewsGiven: { fkColumn: "reviewerId" },
    reviewsReceived: { fkColumn: "revieweeId" },
  },
  Order: {
    seller: { parentFk: "sellerId" },
  },
}

// ─── Helpers ──────────────────────────────────────────────────────

/** Convert a Prisma `where` clause into an array of PostgREST filter objects. */
function buildFilters(where: Record<string, unknown> | undefined): {
  column: string
  op: string
  value: unknown
  negated?: boolean
}[] {
  if (!where || typeof where !== "object") return []
  const filters: { column: string; op: string; value: unknown; negated?: boolean }[] = []

  for (const [key, val] of Object.entries(where)) {
    if (key === "OR" || key === "AND" || key === "NOT") continue // handled separately

    if (val === null || val === undefined) {
      if (val === null) {
        filters.push({ column: key, op: "is", value: "null" })
      }
      continue
    }

    if (typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
      const ops = val as Record<string, unknown>
      for (const [op, opVal] of Object.entries(ops)) {
        switch (op) {
          case "equals":
            filters.push({ column: key, op: "eq", value: opVal })
            break
          case "not":
            if (opVal === null) {
              filters.push({ column: key, op: "not.is", value: "null" })
            } else if (typeof opVal === "object") {
              const inner = opVal as Record<string, unknown>
              for (const [innerOp, innerVal] of Object.entries(inner)) {
                filters.push({
                  column: key,
                  op: mapOp(innerOp),
                  value: innerVal,
                  negated: true,
                })
              }
            } else {
              filters.push({ column: key, op: "not.eq", value: opVal })
            }
            break
          case "in":
            filters.push({
              column: key,
              op: "in",
              value: `(${(opVal as unknown[]).map(formatVal).join(",")})`,
            })
            break
          case "notIn":
            filters.push({
              column: key,
              op: "not.in",
              value: `(${(opVal as unknown[]).map(formatVal).join(",")})`,
            })
            break
          case "gt":
          case "gte":
          case "lt":
          case "lte":
            filters.push({ column: key, op: mapOp(op), value: opVal })
            break
          case "contains":
            if ((ops as Record<string, unknown>).mode === "insensitive") {
              filters.push({ column: key, op: "ilike", value: `*${opVal}*` })
            } else {
              filters.push({ column: key, op: "like", value: `*${opVal}*` })
            }
            break
          case "startsWith":
            filters.push({ column: key, op: "like", value: `${opVal}*` })
            break
          case "endsWith":
            filters.push({ column: key, op: "like", value: `*${opVal}` })
            break
          case "has":
            filters.push({ column: key, op: "cs", value: `{${formatVal(opVal)}}` })
            break
          case "hasEvery":
            filters.push({
              column: key,
              op: "cs",
              value: `{${(opVal as unknown[]).map(formatVal).join(",")}}`,
            })
            break
          case "hasSome":
            filters.push({
              column: key,
              op: "ov",
              value: `{${(opVal as unknown[]).map(formatVal).join(",")}}`,
            })
            break
          case "isEmpty":
            filters.push({ column: key, op: "eq", value: "{}" })
            break
          case "increment":
          case "decrement":
            // Handled in update data, not as filter
            break
          case "mode":
            // Already handled in contains
            break
          case "is":
            if (opVal === null) {
              filters.push({ column: key, op: "is", value: "null" })
            }
            break
          case "isNot":
            if (opVal === null) {
              filters.push({ column: key, op: "not.is", value: "null" })
            }
            break
          default:
            // Nested relation filter — skip for now (handled via join)
            break
        }
      }
    } else {
      // Simple equality
      filters.push({ column: key, op: "eq", value: val })
    }
  }

  return filters
}

function mapOp(op: string): string {
  const map: Record<string, string> = {
    gt: "gt",
    gte: "gte",
    lt: "lt",
    lte: "lte",
    equals: "eq",
    not: "not.eq",
    in: "in",
    notIn: "not.in",
    contains: "like",
    startsWith: "like",
    endsWith: "like",
  }
  return map[op] ?? "eq"
}

function formatVal(v: unknown): string {
  if (v === null) return "null"
  if (typeof v === "string") return `"${v}"`
  if (v instanceof Date) return `"${v.toISOString()}"`
  return String(v)
}

/** Apply filters to a Supabase query builder. */
function applyFilters(
  query: ReturnType<typeof supabaseAdmin.from>,
  where: Record<string, unknown> | undefined
) {
  if (!where) return query

  const filters = buildFilters(where)

  // Handle OR conditions
  if (where.OR && Array.isArray(where.OR)) {
    const orClauses = (where.OR as Record<string, unknown>[]).map((clause) => {
      const orFilters = buildFilters(clause)
      return orFilters
        .map((f) => {
          const col = f.column
          const op = f.op
          const val = typeof f.value === "string" ? f.value : String(f.value)
          if (op === "ilike") return `${col}.ilike.${val}`
          if (op === "like") return `${col}.like.${val}`
          if (op === "in") return `${col}.in.${val}`
          if (op === "is") return `${col}.is.${val}`
          if (op === "not.is") return `${col}.not.is.${val}`
          if (op === "not.eq") return `${col}.not.eq.${val}`
          return `${col}.${op}.${val}`
        })
        .join(",")
    })

    // PostgREST or filter
    const orString = orClauses.join(",")
    query = (query as any).or(orString)
  }

  for (const f of filters) {
    const col = f.column
    const op = f.op
    const val = typeof f.value === "string" ? f.value : String(f.value)

    if (f.negated) {
      query = query.not(col, mapOp(op), val)
    } else {
      ;(query as any) = (query as any)[op]
        ? (query as any).filter(col, op, val)
        : (query as any)
    }
  }

  return query
}

/** Build PostgREST select string from Prisma `include` or `select`. */
/** Simple select string builder — no limit/order suffixes (PostgREST-safe). */
function buildSelectStringSimple(
  include: Record<string, unknown> | undefined,
  select: Record<string, unknown> | undefined,
  parentTable: string = ""
): string {
  if (select && !include) {
    return Object.entries(select).filter(([, v]) => v === true).map(([k]) => k).join(",")
  }
  if (!include) return "*"

  const parts: string[] = ["*"]
  // Track tables already added to detect ambiguous relationships (same table, different relation)
  const seenTables = new Map<string, string>() // tableName → firstRelationName

  for (const [relation, spec] of Object.entries(include)) {
    const tableName = parentTable ? resolveRelation(parentTable, relation) : (RELATION_MAP[relation] ?? relation)
    if (spec === true || spec === false) {
      if (spec === true) {
        const hint = AMBIGUOUS_HINTS[parentTable]?.[relation]
        if (hint) {
          parts.push(`${relation}:${tableName}!${hint}(*)`)
        } else {
          parts.push(`${tableName}(*)`)
        }
        seenTables.set(tableName, relation)
      }
      continue
    }
    if (typeof spec === "object" && spec !== null) {
      // _count: { select: { field: true } } — skip in select string, handled in fetchIncludes
      if (relation === "_count") continue

      const relSpec = spec as Record<string, unknown>
      const nestedInclude = relSpec.include as Record<string, unknown> | undefined
      const nestedSelect = relSpec.select as Record<string, unknown> | undefined

      if (nestedInclude || nestedSelect) {
        const innerParts: string[] = ["*"] // Always include parent table columns
        if (nestedSelect) {
          for (const [k, v] of Object.entries(nestedSelect)) {
            if (v === true) innerParts.push(k)
          }
        }
        if (nestedInclude) {
          for (const [k, v] of Object.entries(nestedInclude)) {
            if (k === "_count") continue // Skip _count — handled separately in fetchIncludes
            const innerTableName = resolveRelation(tableName, k)
            if (v === true) innerParts.push(`${innerTableName}(*)`)
            else if (typeof v === "object") {
              const deepSelect = (v as Record<string, unknown>).select as Record<string, unknown> | undefined
              if (deepSelect) {
                const deepCols = Object.entries(deepSelect).filter(([, dv]) => dv === true).map(([dk]) => dk)
                innerParts.push(`${innerTableName}(${deepCols.join(",")})`)
              } else {
                innerParts.push(`${innerTableName}(*)`)
              }
            }
          }
        }
        const hint = AMBIGUOUS_HINTS[parentTable]?.[relation]
        if (hint) {
          parts.push(`${relation}:${tableName}!${hint}(${innerParts.join(",")})`)
        } else {
          parts.push(`${tableName}(${innerParts.join(",")})`)
        }
        seenTables.set(tableName, relation)
      } else {
        const hint = AMBIGUOUS_HINTS[parentTable]?.[relation]
        if (hint) {
          parts.push(`${relation}:${tableName}!${hint}(*)`)
        } else {
          parts.push(`${tableName}(*)`)
        }
        seenTables.set(tableName, relation)
      }
    }
  }
  return parts.join(",")
}

/** Apply Prisma-style `take` on nested relation arrays (PostgREST returns all). */
function applyNestedTake(
  rows: Record<string, unknown>[],
  include: Record<string, unknown>,
  parentTable: string = ""
): Record<string, unknown>[] {
  for (const [relation, spec] of Object.entries(include)) {
    if (!spec || typeof spec !== "object" || spec === true || spec === false) continue
    const relSpec = spec as Record<string, unknown>
    const take = relSpec.take as number | undefined
    if (take === undefined) continue

    const tableName = parentTable ? resolveRelation(parentTable, relation) : (RELATION_MAP[relation] ?? relation)
    for (const row of rows) {
      // Check relation name first (for aliased/ambiguous relations), then table name
      const val = row[relation] ?? row[tableName]
      if (Array.isArray(val)) {
        const key = relation in row ? relation : tableName
        row[key] = val.slice(0, take)
      }
    }
  }
  return rows
}

/** Remap PascalCase PostgREST table keys back to camelCase Prisma relation names. */
function remapTableKeys(
  rows: Record<string, unknown>[],
  include: Record<string, unknown>,
  parentTable: string = ""
): Record<string, unknown>[] {
  if (!include) return rows
  for (const row of rows) {
    for (const [relation, spec] of Object.entries(include)) {
      if (relation === "_count") continue
      const tableName = parentTable ? resolveRelation(parentTable, relation) : (RELATION_MAP[relation] ?? relation)
      if (tableName === relation) continue // No remap needed
      if (tableName in row && !(relation in row)) {
        row[relation] = row[tableName]
        delete row[tableName]
        // Recursively remap nested relations
        if (spec && typeof spec === "object" && spec !== true && spec !== false) {
          const nestedInclude = (spec as Record<string, unknown>).include as Record<string, unknown> | undefined
          const nestedSelect = (spec as Record<string, unknown>).select as Record<string, unknown> | undefined
          const nestedSpec = nestedInclude || nestedSelect
          if (nestedSpec) {
            const val = row[relation]
            if (Array.isArray(val)) {
              remapTableKeys(val, nestedSpec, tableName)
            } else if (val && typeof val === "object") {
              remapTableKeys([val as Record<string, unknown>], nestedSpec, tableName)
            }
          }
        }
      }
    }
  }
  return rows
}

/** Guess if a relation is one-to-one (returns single object) or one-to-many (returns array). */
function isOneToOne(parentTable: string, childTable: string): boolean {
  const oneToOne: Record<string, string[]> = {
    Listing: ["SellerProfile", "CardCatalog"],
    SellerProfile: ["User", "BankAccount", "SellerSubscription"],
    User: ["SellerProfile"],
    Order: ["Listing", "User", "Dispute", "Review"],
    CardCatalog: [],
    CommunityPost: ["User"],
    PostComment: ["User", "CommunityPost"],
    Dispute: ["Order", "User"],
    Review: ["Order", "User"],
  }
  return (oneToOne[parentTable] ?? []).includes(childTable)
}

/** Fetch embedded resources separately (avoids PostgREST select issues). */
async function fetchIncludes(
  parentTable: string,
  rows: Record<string, unknown>[],
  include: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const result = rows.map((r) => ({ ...r }))

  // Process _count entries: count child rows for each relation in _count.select
  if (include._count && typeof include._count === "object") {
    const countSpec = include._count as Record<string, unknown>
    const countSelect = countSpec.select as Record<string, boolean> | undefined
    if (countSelect) {
      for (const row of result) {
        if (!row._count) row._count = {} as Record<string, number>
        for (const [countRelation, enabled] of Object.entries(countSelect)) {
          if (!enabled) continue
          const countTable = resolveRelation(parentTable, countRelation)
          const fk = guessForeignKey(parentTable, countTable, countRelation)
          let count = 0
          if (fk.fkColumn) {
            // FK on child table — count children where fkColumn = parent.id
            const { count: c } = await supabaseAdmin
              .from(countTable)
              .select("id", { count: "exact", head: true })
              .eq(fk.fkColumn, row.id)
            count = c ?? 0
          } else if (fk.parentFk) {
            // FK on parent table — count children whose id = parent.parentFk
            const fkVal = row[fk.parentFk]
            if (fkVal) {
              const { count: c } = await supabaseAdmin
                .from(countTable)
                .select("id", { count: "exact", head: true })
                .eq("id", fkVal)
              count = c ?? 0
            }
          }
          ;(row._count as Record<string, number>)[countRelation] = count
        }
      }
    }
  }

  for (const [relation, spec] of Object.entries(include)) {
    if (relation === "_count") continue
    const tableName = resolveRelation(parentTable, relation)
    // Use relation as the key for storing data (handles ambiguous cases where alias ≠ tableName)
    const resultKey = relation

    if (typeof spec !== "object" || spec === null || spec === true || spec === false) {
      if (spec === true) {
        const fk = guessForeignKey(parentTable, tableName, relation)
        const isSingle = isOneToOne(parentTable, tableName)
        if (isSingle && fk.parentFk) {
          const childIds = rows.map((r) => r[fk.parentFk!]).filter(Boolean)
          if (childIds.length > 0) {
            const { data } = await supabaseAdmin.from(tableName).select("*").in("id", childIds)
            if (data) {
              const lookup = new Map(data.map((d: Record<string, unknown>) => [d.id, d]))
              for (const row of result) { row[resultKey] = lookup.get(row[fk.parentFk!]) ?? null }
            }
          }
        } else if (!isSingle && fk.fkColumn) {
          const parentIds = rows.map((r) => r.id).filter(Boolean)
          if (parentIds.length > 0) {
            const { data } = await supabaseAdmin.from(tableName).select("*").in(fk.fkColumn, parentIds)
            if (data) {
              for (const row of result) {
                row[resultKey] = data.filter((d: Record<string, unknown>) => d[fk.fkColumn!] === row.id)
              }
            }
          }
        }
      }
      continue
    }

    const relSpec = spec as Record<string, unknown>
    const take = relSpec.take as number | undefined
    const orderBy = relSpec.orderBy as Record<string, string> | undefined

    // Build inner select for nested includes (avoid PostgREST nested selects via JS client)
    const nestedInclude = relSpec.include as Record<string, unknown> | undefined
    const nestedSelect = relSpec.select as Record<string, unknown> | undefined
    let innerSelect = "*"
    if (nestedSelect && !nestedInclude) {
      innerSelect = Object.entries(nestedSelect)
        .filter(([, v]) => v === true)
        .map(([k]) => k)
        .join(",")
    }
    // Skip nested includes in the PostgREST select — fetch them separately below
    const pendingNested = nestedInclude || null

    const fk = guessForeignKey(parentTable, tableName, relation)
    const isSingle = isOneToOne(parentTable, tableName)

    if (isSingle && fk.parentFk) {
      // One-to-one: FK is on parent table (e.g., Listing.sellerId → SellerProfile.id)
      const childIds = rows.map((r) => r[fk.parentFk!]).filter(Boolean)
      if (childIds.length === 0) continue
      const { data } = await supabaseAdmin.from(tableName).select(innerSelect).in("id", childIds)
      if (data) {
        const lookup = new Map(data.map((d: Record<string, unknown>) => [d.id, d]))
        for (const row of result) {
          row[resultKey] = lookup.get(row[fk.parentFk!]) ?? null
        }
      }
    } else if (!isSingle && fk.fkColumn) {
      // One-to-many: FK is on child table (e.g., ListingImage.listingId → Listing.id)
      const parentIds = rows.map((r) => r.id).filter(Boolean)
      if (parentIds.length === 0) continue
      let query = supabaseAdmin.from(tableName).select(innerSelect).in(fk.fkColumn, parentIds)
      if (orderBy) {
        const [field, dir] = Object.entries(orderBy)[0]
        query = query.order(field, { ascending: dir === "asc" })
      }
      const { data } = await query
      if (data) {
        for (const row of result) {
          let related = data.filter((d: Record<string, unknown>) => d[fk.fkColumn!] === row.id)
          if (take !== undefined) related = related.slice(0, take)
          row[resultKey] = related
        }
      }
    } else {
      // Fallback: try both patterns
      console.warn(`[supabase-db] No FK mapping for ${parentTable} → ${tableName} (relation: ${relation})`)
    }

    // Fetch nested includes separately (e.g., User inside SellerProfile)
    if (pendingNested) {
      const nestedRows = result.flatMap((r) => {
        const val = r[resultKey]
        return Array.isArray(val) ? val : val ? [val] : []
      }) as Record<string, unknown>[]
      if (nestedRows.length > 0) {
        try {
          await fetchIncludes(tableName, nestedRows, pendingNested)
          // If one-to-one, reassign back
          if (isSingle) {
            const val = result[0]?.[resultKey]
            if (val && !Array.isArray(val)) {
              // Already mutated in-place since nestedRows contains the same object reference
            }
          }
        } catch (nestedErr) {
          console.error(`[supabase-db] nested fetchIncludes ${tableName} error:`, nestedErr)
        }
      }
    }
  }

  return result
}

/** Guess foreign key column and direction for a relation.
 *  Returns { fkColumn, parentFk } where:
 *  - fkColumn: column in the child table that holds the parent's id (for one-to-many)
 *  - parentFk: column in the parent table that holds the child's id (for one-to-one with FK on parent)
 */
function guessForeignKey(parentTable: string, childTable: string, relation?: string): { fkColumn: string | null; parentFk: string | null } {
  // Check per-relation overrides first (for ambiguous relations like Order→buyer/seller)
  if (relation) {
    const hint = RELATION_FK_HINTS[parentTable]?.[relation]
    if (hint) {
      return { fkColumn: hint.fkColumn ?? null, parentFk: hint.parentFk ?? null }
    }
  }

  // fkColumn: column in CHILD table referencing parent.id
  const fkChild: Record<string, Record<string, string>> = {
    Listing: { ListingImage: "listingId", ShippingOption: "listingId", Order: "listingId" },
    SellerProfile: { Listing: "sellerId" },
    User: { SellerProfile: "userId", Session: "userId", Account: "userId", Notification: "userId", CommunityPost: "authorId", PostComment: "authorId", PostLike: "userId" },
    Order: { OrderStatusHistory: "orderId", Dispute: "orderId", Review: "orderId" },
    CardCatalog: { PriceHistory: "cardId" },
    CommunityPost: { PostComment: "postId", PostLike: "postId" },
    Dispute: { DisputeEvidence: "disputeId" },
  }
  // parentFk: column in PARENT table referencing child.id (for one-to-one with FK on parent)
  const fkParent: Record<string, Record<string, string>> = {
    Listing: { SellerProfile: "sellerId", CardCatalog: "cardId" },
    SellerProfile: { User: "userId", BankAccount: "sellerId", SellerSubscription: "sellerId" },
    Order: { Listing: "listingId", User: "buyerId" },
  }
  return {
    fkColumn: fkChild[parentTable]?.[childTable] ?? null,
    parentFk: fkParent[parentTable]?.[childTable] ?? null,
  }
}

function buildSelectString(
  include: Record<string, unknown> | undefined,
  select: Record<string, unknown> | undefined,
  _model: string
): { selectStr: string; extraParams: Record<string, string> } {
  const extraParams: Record<string, string> = {}

  if (select && !include) {
    // Explicit select
    const cols = Object.entries(select)
      .filter(([, v]) => v === true)
      .map(([k]) => k)
    return { selectStr: cols.join(","), extraParams }
  }

  if (!include) return { selectStr: "*", extraParams }

  const parts: string[] = ["*"]

  for (const [relation, spec] of Object.entries(include)) {
    // Map Prisma relation name → PostgREST table name
    const tableName = resolveRelation(_model, relation)

    if (spec === true || spec === false) {
      if (spec === true) {
        const hint = AMBIGUOUS_HINTS[_model]?.[relation]
        if (hint) {
          parts.push(`${relation}:${tableName}!${hint}(*)`)
        } else {
          parts.push(`${tableName}(*)`)
        }
      }
      continue
    }

    if (typeof spec === "object" && spec !== null) {
      const relSpec = spec as Record<string, unknown>

      // _count: { select: { field: true } } — skip in select string, handled in fetchIncludes
      if (relation === "_count") {
        continue
      }

      // Check if it has nested include or select
      const nestedInclude = relSpec.include as Record<string, unknown> | undefined
      const nestedSelect = relSpec.select as Record<string, unknown> | undefined
      const take = relSpec.take as number | undefined
      const orderBy = relSpec.orderBy as Record<string, string> | undefined

      if (nestedInclude || nestedSelect) {
        const innerParts: string[] = ["*"] // Always include parent table columns
        if (nestedSelect) {
          for (const [k, v] of Object.entries(nestedSelect)) {
            if (v === true) innerParts.push(k)
          }
        }
        if (nestedInclude) {
          for (const [k, v] of Object.entries(nestedInclude)) {
            if (k === "_count") continue // Skip _count — handled separately
            const innerTableName = resolveRelation(tableName, k)
            if (v === true) {
              innerParts.push(`${innerTableName}(*)`)
            } else if (typeof v === "object") {
              // One more level deep
              const deepSelect = (v as Record<string, unknown>).select as
                | Record<string, unknown>
                | undefined
              if (deepSelect) {
                const deepCols = Object.entries(deepSelect)
                  .filter(([, dv]) => dv === true)
                  .map(([dk]) => dk)
                innerParts.push(`${innerTableName}(${deepCols.join(",")})`)
              } else {
                innerParts.push(`${innerTableName}(*)`)
              }
            }
          }
        }

        // Collect limit/order as separate PostgREST query params
        if (take !== undefined) extraParams[`${tableName}.limit`] = String(take)
        if (orderBy) {
          const [field, dir] = Object.entries(orderBy)[0]
          extraParams[`${tableName}.order`] = `${field}.${dir}`
        }

        const inner = innerParts.length > 0 ? innerParts.join(",") : "*"
        const hint = AMBIGUOUS_HINTS[_model]?.[relation]
        if (hint) {
          parts.push(`${relation}:${tableName}!${hint}(${inner})`)
        } else {
          parts.push(`${tableName}(${inner})`)
        }
      } else {
        // Simple include with take
        if (take !== undefined) extraParams[`${tableName}.limit`] = String(take)
        if (orderBy) {
          const [field, dir] = Object.entries(orderBy)[0]
          extraParams[`${tableName}.order`] = `${field}.${dir}`
        }
        const hint = AMBIGUOUS_HINTS[_model]?.[relation]
        if (hint) {
          parts.push(`${relation}:${tableName}!${hint}(*)`)
        } else {
          parts.push(`${tableName}(*)`)
        }
      }
    }
  }

  return { selectStr: parts.join(","), extraParams }
}

/** Build PostgREST filter params from a Prisma where clause. */
function buildPostgrestFilters(where: Record<string, unknown>): Record<string, string> {
  const params: Record<string, string> = {}

  for (const [key, val] of Object.entries(where)) {
    if (key === "OR" || key === "AND" || key === "NOT") {
      // Handle OR as PostgREST or param
      if (key === "OR" && Array.isArray(val)) {
        const orParts: string[] = []
        for (const clause of val) {
          const parts: string[] = []
          for (const [k, v] of Object.entries(clause as Record<string, unknown>)) {
            if (v === null) {
              parts.push(`${k}.is.null`)
            } else if (typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
              const ops = v as Record<string, unknown>
              for (const [op, opVal] of Object.entries(ops)) {
                if (op === "mode") continue // modifier for contains, not a filter
                if (op === "contains") {
                  const mode = (ops as Record<string, unknown>).mode === "insensitive" ? "ilike" : "like"
                  parts.push(`${k}.${mode}.*${opVal}*`)
                } else if (op === "in") {
                  parts.push(`${k}.in.(${(opVal as unknown[]).map(formatVal).join(",")})`)
                } else if (op === "equals") {
                  parts.push(`${k}.eq.${formatVal(opVal)}`)
                } else if (op === "not") {
                  if (opVal === null) parts.push(`${k}.not.is.null`)
                  else parts.push(`${k}.not.eq.${formatVal(opVal)}`)
                } else {
                  parts.push(`${k}.${op}.${formatVal(opVal)}`)
                }
              }
            } else {
              parts.push(`${k}.eq.${formatVal(v)}`)
            }
          }
          orParts.push(parts.join(","))
        }
        params.or = `(${orParts.join(",")})`
      }
      continue
    }

    if (val === null) {
      params[key] = "is.null"
    } else if (typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
      const ops = val as Record<string, unknown>
      for (const [op, opVal] of Object.entries(ops)) {
        if (op === "mode") continue
        if (op === "not") {
          if (opVal === null) {
            params[key] = "not.is.null"
          } else if (typeof opVal === "object") {
            const innerOps = opVal as Record<string, unknown>
            for (const [innerOp, innerVal] of Object.entries(innerOps)) {
              if (innerOp === "in") {
                params[key] = `not.in.(${(innerVal as unknown[]).map(formatVal).join(",")})`
              } else {
                params[key] = `not.${mapOp(innerOp)}.${formatVal(innerVal)}`
              }
            }
          } else {
            params[key] = `not.eq.${formatVal(opVal)}`
          }
        } else if (op === "in") {
          params[key] = `in.(${(opVal as unknown[]).map(formatVal).join(",")})`
        } else if (op === "notIn") {
          params[key] = `not.in.(${(opVal as unknown[]).map(formatVal).join(",")})`
        } else if (op === "contains") {
          const mode = (ops as Record<string, unknown>).mode === "insensitive" ? "ilike" : "like"
          params[key] = `${mode}.*${opVal}*`
        } else if (op === "startsWith") {
          params[key] = `like.${opVal}*`
        } else if (op === "endsWith") {
          params[key] = `like.*${opVal}`
        } else if (op === "gt" || op === "gte" || op === "lt" || op === "lte") {
          params[key] = `${op}.${opVal instanceof Date ? opVal.toISOString() : opVal}`
        } else if (op === "equals") {
          params[key] = `eq.${opVal instanceof Date ? opVal.toISOString() : opVal}`
        } else if (op === "is") {
          if (opVal === null) params[key] = "is.null"
        } else if (op === "isNot") {
          if (opVal === null) params[key] = "not.is.null"
        }
      }
    } else {
      params[key] = `eq.${val instanceof Date ? val.toISOString() : val}`
    }
  }

  return params
}

/** Build PostgREST order string from Prisma orderBy. */
function buildOrderString(orderBy: unknown): string | null {
  if (!orderBy) return null

  const parts: string[] = []

  if (Array.isArray(orderBy)) {
    for (const ob of orderBy) {
      if (typeof ob === "object" && ob !== null) {
        const [field, dir] = Object.entries(ob as Record<string, string>)[0]
        parts.push(`${field}.${dir}`)
      }
    }
  } else if (typeof orderBy === "object" && orderBy !== null) {
    const [field, dir] = Object.entries(orderBy as Record<string, string>)[0]
    parts.push(`${field}.${dir}`)
  }

  return parts.length > 0 ? parts.join(",") : null
}

/** Apply ordering to query. */
function applyOrdering(
  query: ReturnType<typeof supabaseAdmin.from>,
  orderBy: unknown
) {
  if (!orderBy) return query

  if (Array.isArray(orderBy)) {
    for (const ob of orderBy) {
      if (typeof ob === "object" && ob !== null) {
        const [field, dir] = Object.entries(ob as Record<string, string>)[0]
        query = query.order(field, { ascending: dir === "asc" })
      }
    }
  } else if (typeof orderBy === "object" && orderBy !== null) {
    const [field, dir] = Object.entries(orderBy as Record<string, string>)[0]
    query = query.order(field, { ascending: dir === "asc" })
  }

  return query
}

/** Extract plain data from where clause (for findUnique etc.) */
function extractUniqueWhere(where: Record<string, unknown>): {
  column: string
  value: unknown
} | null {
  if (!where) return null
  const entries = Object.entries(where).filter(
    ([, v]) => typeof v !== "object" || v === null
  )
  if (entries.length === 1) {
    return { column: entries[0][0], value: entries[0][1] }
  }
  // Multiple simple conditions — use first
  if (entries.length > 0) {
    return { column: entries[0][0], value: entries[0][1] }
  }
  return null
}

/** Extract data mutations from Prisma data object (handle increment, decrement, nested creates). */
function extractData(
  data: Record<string, unknown>
): {
  simple: Record<string, unknown>
  increments: Record<string, number>
  nested: Record<string, unknown>
} {
  const simple: Record<string, unknown> = {}
  const increments: Record<string, number> = {}
  const nested: Record<string, unknown> = {}

  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) continue

    if (typeof val === "object" && val !== null && !Array.isArray(val) && !(val instanceof Date)) {
      // Check for increment/decrement
      if ("increment" in (val as Record<string, unknown>)) {
        increments[key] = (val as Record<string, number>).increment
        continue
      }
      if ("decrement" in (val as Record<string, unknown>)) {
        increments[key] = -((val as Record<string, number>).decrement)
        continue
      }
      // Check for set operation
      if ("set" in (val as Record<string, unknown>)) {
        simple[key] = (val as Record<string, unknown>).set
        continue
      }
      // Nested create/update — skip for now, handle separately
      if ("create" in (val as Record<string, unknown>) || "update" in (val as Record<string, unknown>)) {
        nested[key] = val
        continue
      }
    }

    simple[key] = val
  }

  return { simple, increments, nested }
}

// ─── Model Proxy ──────────────────────────────────────────────────

function createModelProxy(modelName: string) {
  // Prisma model names are camelCase (e.g. listing, cardCatalog)
  // PostgreSQL table names are PascalCase (e.g. Listing, CardCatalog)
  const table = modelName.charAt(0).toUpperCase() + modelName.slice(1)

  return {
    async findMany(args: Record<string, unknown> = {}) {
      const { where, include, select, orderBy, skip, take, distinct } = args as {
        where?: Record<string, unknown>
        include?: Record<string, unknown>
        select?: Record<string, unknown>
        orderBy?: unknown
        skip?: number
        take?: number
        distinct?: unknown
      }

      // Build embedded select string (e.g. "*,ListingImage(*),SellerProfile(*,User(name,username))")
      const selectStr = buildSelectStringSimple(include, select, table)

      // Build PostgREST params
      const pgParams: Record<string, string> = {
        select: selectStr,
      }

      // Apply filters as PostgREST params
      if (where) {
        const pgFilters = buildPostgrestFilters(where)
        Object.assign(pgParams, pgFilters)
      }

      // Apply ordering
      if (orderBy) {
        const orderStr = buildOrderString(orderBy)
        if (orderStr) pgParams.order = orderStr
      }

      // Apply pagination
      if (skip !== undefined && take !== undefined) {
        // PostgREST Range header — we'll use limit/offset params instead
        pgParams.limit = String(take)
        pgParams.offset = String(skip)
      } else if (take !== undefined) {
        pgParams.limit = String(take)
      }

      // Try raw PostgREST fetch first (handles nested selects correctly)
      const { data, error } = await postgrestFetch<Record<string, unknown>[]>(table, pgParams)

      if (error) {
        console.error(`[supabase-db] findMany ${table} PostgREST error:`, error)
        // Fallback: Supabase JS client with plain select + fetchIncludes
        console.warn(`[supabase-db] Retrying ${table} with Supabase JS fallback`)
        let fallbackQuery = supabaseAdmin.from(table).select("*", { count: "exact" })
        if (where) fallbackQuery = applyWhereClause(fallbackQuery, where)
        if (orderBy) fallbackQuery = applyOrdering(fallbackQuery, orderBy)
        if (skip !== undefined && take !== undefined) {
          fallbackQuery = fallbackQuery.range(skip, skip + take - 1)
        } else if (take !== undefined) {
          fallbackQuery = fallbackQuery.range(0, take - 1)
        }
        const { data: fallbackData, error: fallbackError } = await fallbackQuery
        if (fallbackError) {
          console.error(`[supabase-db] fallback findMany ${table} error:`, fallbackError.message)
          return []
        }
        let result = fallbackData ?? []
        if (include && result.length > 0) {
          try {
            result = await fetchIncludes(table, result, include)
          } catch (incErr) {
            console.error(`[supabase-db] fetchIncludes fallback ${table} error:`, incErr)
          }
        }
        return result
      }

      // Apply Prisma-style take on nested relations (PostgREST returns all nested rows)
      let result = data ?? []
      if (include && result.length > 0) {
        result = applyNestedTake(result, include, table)
        result = remapTableKeys(result, include, table)
        // Process _count if present (not handled by PostgREST select)
        if (include._count && typeof include._count === "object") {
          const countSpec = include._count as Record<string, unknown>
          const countSelect = countSpec.select as Record<string, boolean> | undefined
          if (countSelect) {
            for (const row of result) {
              if (!row._count) row._count = {} as Record<string, number>
              for (const [countRelation, enabled] of Object.entries(countSelect)) {
                if (!enabled) continue
                const countTable = resolveRelation(table, countRelation)
                const fk = guessForeignKey(table, countTable, countRelation)
                let count = 0
                if (fk.fkColumn) {
                  const { count: c } = await supabaseAdmin
                    .from(countTable)
                    .select("id", { count: "exact", head: true })
                    .eq(fk.fkColumn, row.id)
                  count = c ?? 0
                } else if (fk.parentFk) {
                  const fkVal = row[fk.parentFk]
                  if (fkVal) {
                    const { count: c } = await supabaseAdmin
                      .from(countTable)
                      .select("id", { count: "exact", head: true })
                      .eq("id", fkVal)
                    count = c ?? 0
                  }
                }
                ;(row._count as Record<string, number>)[countRelation] = count
              }
            }
          }
        }
      }
      return result
    },

    async findFirst(args: Record<string, unknown> = {}) {
      const result = await this.findMany({ ...args, take: 1 })
      return result[0] ?? null
    },

    async findUnique(args: Record<string, unknown>) {
      const { where, include, select } = args as {
        where: Record<string, unknown>
        include?: Record<string, unknown>
        select?: Record<string, unknown>
      }

      const selectStr = buildSelectStringSimple(include, select, table)
      const pgFilters = buildPostgrestFilters(where)

      // Use raw PostgREST fetch
      const { data, error } = await postgrestFetch<Record<string, unknown>[]>(
        table,
        { select: selectStr, limit: "1", ...pgFilters }
      )

      if (error) {
        console.error(`[supabase-db] findUnique ${table} PostgREST error:`, error)
        // Fallback: Supabase JS
        let fb = supabaseAdmin.from(table).select("*")
        fb = applyWhereClause(fb, where)
        fb = fb.limit(1).maybeSingle()
        const { data: fbData, error: fbErr } = await fb
        if (fbErr || !fbData) return null
        if (include) {
          try {
            const [enriched] = await fetchIncludes(table, [fbData], include)
            return enriched
          } catch { return fbData }
        }
        return null
      }

      if (!data || data.length === 0) return null
      let result = data[0]
      if (include) {
        result = applyNestedTake([result], include, table)[0]
        result = remapTableKeys([result], include, table)[0]
        // Process _count if present (not handled by PostgREST select)
        if (include._count && typeof include._count === "object") {
          const countSpec = include._count as Record<string, unknown>
          const countSelect = countSpec.select as Record<string, boolean> | undefined
          if (countSelect) {
            if (!result._count) result._count = {} as Record<string, number>
            for (const [countRelation, enabled] of Object.entries(countSelect)) {
              if (!enabled) continue
              const countTable = resolveRelation(table, countRelation)
              const fk = guessForeignKey(table, countTable, countRelation)
              let count = 0
              if (fk.fkColumn) {
                const { count: c } = await supabaseAdmin
                  .from(countTable)
                  .select("id", { count: "exact", head: true })
                  .eq(fk.fkColumn, result.id)
                count = c ?? 0
              } else if (fk.parentFk) {
                const fkVal = result[fk.parentFk]
                if (fkVal) {
                  const { count: c } = await supabaseAdmin
                    .from(countTable)
                    .select("id", { count: "exact", head: true })
                    .eq("id", fkVal)
                  count = c ?? 0
                }
              }
              ;(result._count as Record<string, number>)[countRelation] = count
            }
          }
        }
      }
      return result
    },

    async findUniqueOrThrow(args: Record<string, unknown>) {
      const result = await this.findUnique(args)
      if (!result) throw new Error(`Record not found in ${table}`)
      return result
    },

    async findFirstOrThrow(args: Record<string, unknown> = {}) {
      const result = await this.findFirst(args)
      if (!result) throw new Error(`Record not found in ${table}`)
      return result
    },

    async create(args: Record<string, unknown>) {
      const { data: inputData, include, select } = args as {
        data: Record<string, unknown>
        include?: Record<string, unknown>
        select?: Record<string, unknown>
      }

      const { simple, nested } = extractData(inputData)

      // Handle nested creates (e.g., images: { create: [...] })
      const nestedCreates: Record<string, unknown[]> = {}
      for (const [key, val] of Object.entries(nested)) {
        if (typeof val === "object" && val !== null && "create" in (val as Record<string, unknown>)) {
          nestedCreates[key] = Array.isArray(
            (val as Record<string, unknown>).create
          )
            ? (val as Record<string, unknown>).create as unknown[]
            : [(val as Record<string, unknown>).create]
        }
      }

      // Add Prisma defaults that PostgREST won't auto-fill
      if (!simple.createdAt) simple.createdAt = new Date()
      if (!simple.updatedAt) simple.updatedAt = new Date()

      // Convert dates
      const insertData = convertDates(simple)

      const { data, error } = await supabaseAdmin
        .from(table)
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error(`[supabase-db] create ${table} error:`, error.message)
        throw error
      }

      // Handle nested creates
      for (const [relation, items] of Object.entries(nestedCreates)) {
        // Find the foreign key convention
        const fkKey = `${camelToPascal(table)}Id` // e.g., ListingId for images under listing
        // Also try without casing
        const fkKeyLower = `${table.charAt(0).toLowerCase() + table.slice(1)}Id`

        for (const item of items as Record<string, unknown>[]) {
          const insertItem = {
            ...convertDates(item as Record<string, unknown>),
          }
          // Try to find the FK — look for common patterns
          // If the item doesn't already have a foreign key, add it
          const fkCandidates = [fkKey, fkKeyLower, "orderId", "listingId", "userId", "sellerId"]
          let fkSet = false
          for (const fk of fkCandidates) {
            if (fk in insertItem) {
              fkSet = true
              break
            }
          }
          if (!fkSet) {
            // Guess: use the table name + "Id" in PascalCase
            insertItem[fkKeyLower] = data.id
          }

          const { error: nestedError } = await supabaseAdmin
            .from(relation)
            .insert(insertItem)

          if (nestedError) {
            console.error(`[supabase-db] nested create ${relation} error:`, nestedError.message)
          }
        }
      }

      return data
    },

    async createMany(args: Record<string, unknown>) {
      const { data: inputData, skipDuplicates } = args as {
        data: Record<string, unknown>[]
        skipDuplicates?: boolean
      }

      const insertData = inputData.map((d) => {
        if (!d.createdAt) d.createdAt = new Date()
        if (!d.updatedAt) d.updatedAt = new Date()
        return convertDates(d)
      })

      const { data, error, count } = await supabaseAdmin
        .from(table)
        .insert(insertData, { count: "exact" })

      if (error) {
        console.error(`[supabase-db] createMany ${table} error:`, error.message)
        throw error
      }

      return { count: count ?? insertData.length }
    },

    async update(args: Record<string, unknown>) {
      const { where, data: inputData, include, select } = args as {
        where: Record<string, unknown>
        data: Record<string, unknown>
        include?: Record<string, unknown>
        select?: Record<string, unknown>
      }

      const { simple, increments, nested } = extractData(inputData)

      // Build update data
      let updateData: Record<string, unknown> = { ...convertDates(simple) }

      // Handle increments — need to use RPC or raw SQL
      if (Object.keys(increments).length > 0) {
        // For increments, we need to read the current value first
        const current = await this.findUnique({ where })
        if (current) {
          for (const [field, inc] of Object.entries(increments)) {
            updateData[field] = (current[field] ?? 0) + inc
          }
        }
      }

      let query = supabaseAdmin.from(table).update(updateData)
      query = applyWhereClause(query, where)

      const { selectStr } = buildSelectString(include, select, table)
      query = query.select(selectStr).maybeSingle()

      const { data, error } = await query
      if (error) {
        console.error(`[supabase-db] update ${table} error:`, error.message)
        throw error
      }

      // Handle nested creates in update
      for (const [key, val] of Object.entries(nested)) {
        if (typeof val === "object" && val !== null && "create" in (val as Record<string, unknown>)) {
          const items = Array.isArray(
            (val as Record<string, unknown>).create
          )
            ? (val as Record<string, unknown>).create as unknown[]
            : [(val as Record<string, unknown>).create]

          const fkKeyLower = `${table.charAt(0).toLowerCase() + table.slice(1)}Id`

          for (const item of items as Record<string, unknown>[]) {
            const insertItem = convertDates(item as Record<string, unknown>)
            if (!(fkKeyLower in insertItem) && data) {
              insertItem[fkKeyLower] = data.id
            }

            const { error: nestedError } = await supabaseAdmin
              .from(key)
              .insert(insertItem)

            if (nestedError) {
              console.error(`[supabase-db] nested create in update ${key} error:`, nestedError.message)
            }
          }
        }
      }

      return data
    },

    async updateMany(args: Record<string, unknown>) {
      const { where, data: inputData } = args as {
        where?: Record<string, unknown>
        data: Record<string, unknown>
      }

      const { simple, increments } = extractData(inputData)
      let updateData: Record<string, unknown> = { ...convertDates(simple) }

      if (Object.keys(increments).length > 0 && where) {
        // Read current values
        const current = await this.findMany({ where })
        // This is a simplified approach — for many records, increment is tricky
        for (const record of current) {
          const recordUpdate: Record<string, unknown> = { ...updateData }
          for (const [field, inc] of Object.entries(increments)) {
            recordUpdate[field] = (record[field] ?? 0) + inc
          }
          await supabaseAdmin
            .from(table)
            .update(recordUpdate)
            .eq("id", record.id)
        }
        return { count: current.length }
      }

      let query = supabaseAdmin.from(table).update(updateData, { count: "exact" })
      if (where) {
        query = applyWhereClause(query, where)
      }

      const { error, count } = await query
      if (error) {
        console.error(`[supabase-db] updateMany ${table} error:`, error.message)
        throw error
      }

      return { count: count ?? 0 }
    },

    async upsert(args: Record<string, unknown>) {
      const { where, create, update } = args as {
        where: Record<string, unknown>
        create: Record<string, unknown>
        update: Record<string, unknown>
      }

      const existing = await this.findUnique({ where })
      if (existing) {
        return this.update({ where, data: update })
      } else {
        return this.create({ data: create })
      }
    },

    async delete(args: Record<string, unknown>) {
      const { where } = args as { where: Record<string, unknown> }

      let query = supabaseAdmin.from(table).delete()
      query = applyWhereClause(query, where)
      query = query.select().maybeSingle()

      const { data, error } = await query
      if (error) {
        console.error(`[supabase-db] delete ${table} error:`, error.message)
        throw error
      }
      return data
    },

    async deleteMany(args: Record<string, unknown> = {}) {
      const { where } = args as { where?: Record<string, unknown> }

      let query = supabaseAdmin.from(table).delete({ count: "exact" })
      if (where) {
        query = applyWhereClause(query, where)
      }

      const { error, count } = await query
      if (error) {
        console.error(`[supabase-db] deleteMany ${table} error:`, error.message)
        throw error
      }
      return { count: count ?? 0 }
    },

    async count(args: Record<string, unknown> = {}) {
      const { where } = args as { where?: Record<string, unknown> }

      // Use raw PostgREST fetch with head=true for count
      const pgParams: Record<string, string> = {
        select: "*",
        Prefer: "count=exact",
      }
      if (where) {
        Object.assign(pgParams, buildPostgrestFilters(where))
      }

      const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`)
      for (const [k, v] of Object.entries(pgParams)) {
        if (k === "Prefer") continue
        url.searchParams.set(k, v)
      }

      try {
        const res = await fetch(url.toString(), {
          method: "HEAD",
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            Prefer: "count=exact",
            Range: "0-0",
          },
        })

        const contentRange = res.headers.get("content-range")
        if (contentRange) {
          // Format: "0-0/12" — total is after the slash
          const total = parseInt(contentRange.split("/")[1])
          if (!isNaN(total)) return total
        }

        // Fallback: Supabase JS client
        let query = supabaseAdmin
          .from(table)
          .select("*", { count: "exact", head: true })
        if (where) query = applyWhereClause(query, where)
        const { count, error } = await query
        if (error) {
          console.error(`[supabase-db] count ${table} error:`, error.message)
          return 0
        }
        return count ?? 0
      } catch {
        // Fallback to Supabase JS
        let query = supabaseAdmin
          .from(table)
          .select("*", { count: "exact", head: true })
        if (where) query = applyWhereClause(query, where)
        const { count, error } = await query
        if (error) return 0
        return count ?? 0
      }
    },

    async aggregate(args: Record<string, unknown>) {
      const { where, _sum, _count, _avg, _min, _max } = args as {
        where?: Record<string, unknown>
        _sum?: Record<string, boolean>
        _count?: Record<string, boolean> | boolean
        _avg?: Record<string, boolean>
        _min?: Record<string, boolean>
        _max?: Record<string, boolean>
      }

      // Fetch rows matching where, then aggregate in JS
      const rows = await this.findMany({ where, take: 10000 })

      const result: Record<string, unknown> = {}

      if (_sum) {
        const sumResult: Record<string, number | null> = {}
        for (const field of Object.keys(_sum)) {
          const total = rows.reduce(
            (acc: number, r: Record<string, unknown>) => acc + ((r[field] as number) ?? 0),
            0
          )
          sumResult[field] = rows.length > 0 ? total : null
        }
        result._sum = sumResult
      }

      if (_count) {
        if (_count === true) {
          result._count = rows.length
        } else {
          const countResult: Record<string, number> = {}
          for (const field of Object.keys(_count)) {
            countResult[field] = rows.filter(
              (r: Record<string, unknown>) => r[field] !== null && r[field] !== undefined
            ).length
          }
          result._count = countResult
        }
      }

      if (_avg) {
        const avgResult: Record<string, number | null> = {}
        for (const field of Object.keys(_avg)) {
          const values = rows
            .map((r: Record<string, unknown>) => r[field] as number)
            .filter((v: number) => v !== null && v !== undefined)
          avgResult[field] =
            values.length > 0
              ? values.reduce((a: number, b: number) => a + b, 0) / values.length
              : null
        }
        result._avg = avgResult
      }

      if (_min) {
        const minResult: Record<string, unknown> = {}
        for (const field of Object.keys(_min)) {
          const values = rows
            .map((r: Record<string, unknown>) => r[field])
            .filter((v: unknown) => v !== null && v !== undefined)
          minResult[field] = values.length > 0 ? values.reduce((a: unknown, b: unknown) => (a < b ? a : b)) : null
        }
        result._min = minResult
      }

      if (_max) {
        const maxResult: Record<string, unknown> = {}
        for (const field of Object.keys(_max)) {
          const values = rows
            .map((r: Record<string, unknown>) => r[field])
            .filter((v: unknown) => v !== null && v !== undefined)
          maxResult[field] = values.length > 0 ? values.reduce((a: unknown, b: unknown) => (a > b ? a : b)) : null
        }
        result._max = maxResult
      }

      return result
    },

    async groupBy(args: Record<string, unknown>) {
      const { by, where, _sum, _count, _avg, orderBy: groupOrderBy, take } = args as {
        by: string[]
        where?: Record<string, unknown>
        _sum?: Record<string, boolean>
        _count?: Record<string, boolean> | boolean
        _avg?: Record<string, boolean>
        orderBy?: unknown
        take?: number
      }

      // Fetch rows
      const rows = await this.findMany({ where, take: take ?? 10000 })

      // Group
      const groups = new Map<string, Record<string, unknown>[]>()
      for (const row of rows) {
        const key = by.map((f: string) => String((row as Record<string, unknown>)[f])).join("|||")
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(row as Record<string, unknown>)
      }

      const result: Record<string, unknown>[] = []
      for (const [key, groupRows] of groups) {
        const group: Record<string, unknown> = {}

        // Set group by fields
        const keyParts = key.split("|||")
        by.forEach((f: string, i: number) => {
          group[f] = keyParts[i]
        })

        if (_sum) {
          const sumResult: Record<string, number | null> = {}
          for (const field of Object.keys(_sum)) {
            sumResult[field] = groupRows.reduce(
              (acc, r) => acc + ((r[field] as number) ?? 0),
              0
            )
          }
          group._sum = sumResult
        }

        if (_count) {
          if (_count === true) {
            group._count = { id: groupRows.length }
          } else {
            const countResult: Record<string, number> = {}
            for (const field of Object.keys(_count)) {
              countResult[field] = groupRows.filter(
                (r) => r[field] !== null && r[field] !== undefined
              ).length
            }
            group._count = countResult
          }
        }

        if (_avg) {
          const avgResult: Record<string, number | null> = {}
          for (const field of Object.keys(_avg)) {
            const values = groupRows
              .map((r) => r[field] as number)
              .filter((v) => v !== null && v !== undefined)
            avgResult[field] =
              values.length > 0
                ? values.reduce((a, b) => a + b, 0) / values.length
                : null
          }
          group._avg = avgResult
        }

        result.push(group)
      }

      // Sort
      if (groupOrderBy) {
        if (Array.isArray(groupOrderBy)) {
          for (const ob of groupOrderBy) {
            const [field, dir] = Object.entries(ob as Record<string, string>)[0]
            result.sort((a, b) => {
              const av = (a as Record<string, unknown>)[field] as number
              const bv = (b as Record<string, unknown>)[field] as number
              return dir === "asc" ? av - bv : bv - av
            })
          }
        } else if (typeof groupOrderBy === "object") {
          const [field, dir] = Object.entries(
            groupOrderBy as Record<string, string>
          )[0]
          result.sort((a, b) => {
            const av = (a as Record<string, unknown>)[field] as number
            const bv = (b as Record<string, unknown>)[field] as number
            return dir === "asc" ? av - bv : bv - av
          })
        }
      }

      return result
    },
  }
}

// ─── Utility functions ────────────────────────────────────────────

function convertDates(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(data)) {
    if (val instanceof Date) {
      result[key] = val.toISOString()
    } else if (val !== undefined) {
      result[key] = val
    }
  }
  return result
}

function camelToPascal(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Apply a Prisma-style where clause to a Supabase query using PostgREST filters. */
function applyWhereClause(
  query: ReturnType<typeof supabaseAdmin.from>,
  where: Record<string, unknown>
): any {
  if (!where) return query

  // Handle OR
  if (where.OR && Array.isArray(where.OR)) {
    const orParts: string[] = []
    for (const clause of where.OR as Record<string, unknown>[]) {
      const parts: string[] = []
      for (const [key, val] of Object.entries(clause)) {
        if (val === null) {
          parts.push(`${key}.is.null`)
        } else if (typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
          const ops = val as Record<string, unknown>
          for (const [op, opVal] of Object.entries(ops)) {
            if (op === "mode") continue // modifier for contains, not a filter
            if (op === "contains") {
              const mode = ops.mode === "insensitive" ? "ilike" : "like"
              parts.push(`${key}.${mode}.*${opVal}*`)
            } else if (op === "in") {
              parts.push(
                `${key}.in.(${(opVal as unknown[]).map(formatVal).join(",")})`
              )
            } else if (op === "equals") {
              parts.push(`${key}.eq.${formatVal(opVal)}`)
            } else if (op === "not") {
              if (opVal === null) {
                parts.push(`${key}.not.is.null`)
              } else {
                parts.push(`${key}.not.eq.${formatVal(opVal)}`)
              }
            } else {
              parts.push(`${key}.${op}.${formatVal(opVal)}`)
            }
          }
        } else {
          parts.push(`${key}.eq.${formatVal(val)}`)
        }
      }
      orParts.push(parts.join(","))
    }
    query = query.or(orParts.join(","))
  }

  // Apply simple filters
  for (const [key, val] of Object.entries(where)) {
    if (key === "OR" || key === "AND" || key === "NOT") continue

    if (val === null) {
      query = query.is(key, null)
    } else if (typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
      const ops = val as Record<string, unknown>
      for (const [op, opVal] of Object.entries(ops)) {
        if (op === "mode") continue // modifier, not a filter
        if (op === "not") {
          if (opVal === null) {
            query = query.not(key, "is", null)
          } else if (typeof opVal === "object" && opVal !== null) {
            const innerOps = opVal as Record<string, unknown>
            for (const [innerOp, innerVal] of Object.entries(innerOps)) {
              if (innerOp === "in") {
                query = query.not(
                  key,
                  "in",
                  `(${(innerVal as unknown[]).map(formatVal).join(",")})`
                )
              } else {
                query = query.not(key, mapOp(innerOp), formatVal(innerVal))
              }
            }
          } else {
            query = query.not(key, "eq", formatVal(opVal))
          }
        } else if (op === "in") {
          query = query.in(
            key,
            (opVal as unknown[]).map((v) => (typeof v === "string" ? v : String(v)))
          )
        } else if (op === "notIn") {
          // PostgREST doesn't have a direct notIn, use not.in
          ;(query as any) = (query as any).not(
            key,
            "in",
            `(${(opVal as unknown[]).map(formatVal).join(",")})`
          )
        } else if (op === "contains") {
          const mode = ops.mode === "insensitive" ? "ilike" : "like"
          query = (query as any)[mode](key, `*${opVal}*`)
        } else if (op === "startsWith") {
          query = query.like(key, `${opVal}*`)
        } else if (op === "endsWith") {
          query = query.like(key, `*${opVal}`)
        } else if (op === "gt" || op === "gte" || op === "lt" || op === "lte") {
          query = (query as any)[op](key, opVal instanceof Date ? opVal.toISOString() : opVal)
        } else if (op === "equals") {
          query = query.eq(key, opVal instanceof Date ? opVal.toISOString() : opVal)
        } else if (op === "has") {
          query = query.contains(key, `{${formatVal(opVal)}}`)
        } else if (op === "hasEvery") {
          query = query.contains(
            key,
            `{${(opVal as unknown[]).map(formatVal).join(",")}}`
          )
        } else if (op === "hasSome") {
          query = query.overlaps(
            key,
            `{${(opVal as unknown[]).map(formatVal).join(",")}}`
          )
        } else if (op === "isEmpty") {
          query = query.eq(key, "{}")
        } else if (op === "is") {
          if (opVal === null) query = query.is(key, null)
        } else if (op === "isNot") {
          if (opVal === null) query = query.not(key, "is", null)
        }
      }
    } else {
      // Simple equality
      if (val instanceof Date) {
        query = query.eq(key, val.toISOString())
      } else {
        query = query.eq(key, val)
      }
    }
  }

  return query
}

// ─── $queryRaw and $transaction ───────────────────────────────────

const MANAGEMENT_API_URL = process.env.SUPABASE_MANAGEMENT_API_URL || "https://api.supabase.com/v1/projects/ruugptsudyxyozywevcu/database/query"
const MANAGEMENT_API_KEY = process.env.SUPABASE_MANAGEMENT_KEY || ""

async function queryRaw(sql: string, ...params: unknown[]): Promise<unknown[]> {
  try {
    // Replace $1, $2, etc. with actual values
    let processedSql = sql
    for (let i = 0; i < params.length; i++) {
      const param = params[i]
      let replacement: string
      if (param === null || param === undefined) {
        replacement = "NULL"
      } else if (typeof param === "string") {
        replacement = `'${param.replace(/'/g, "''")}'`
      } else if (param instanceof Date) {
        replacement = `'${param.toISOString()}'`
      } else if (typeof param === "number") {
        replacement = String(param)
      } else if (typeof param === "boolean") {
        replacement = param ? "TRUE" : "FALSE"
      } else {
        replacement = `'${String(param).replace(/'/g, "''")}'`
      }
      processedSql = processedSql.replace(`$${i + 1}`, replacement)
    }

    // Also handle template literal style: ${value}
    // This is tricky — the values are already interpolated in tagged template literals

    const response = await fetch(MANAGEMENT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MANAGEMENT_API_KEY}`,
        apikey: MANAGEMENT_API_KEY,
      },
      body: JSON.stringify({ query: processedSql }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[supabase-db] queryRaw error:", errText)
      // Fallback: try using Supabase RPC
      return []
    }

    const result = await response.json()
    return Array.isArray(result) ? result : result.result ?? []
  } catch (error) {
    console.error("[supabase-db] queryRaw failed:", error)
    return []
  }
}

async function executeTransaction(
  fn: (tx: Record<string, unknown>) => Promise<unknown>
): Promise<unknown> {
  // Simulate transaction by creating a proxy that uses the same Supabase client
  // Note: This is NOT a real database transaction. For production, you'd want
  // to use Supabase's RPC functions for true transactional behavior.
  const txProxy = createPrismaProxy()
  return fn(txProxy)
}

// ─── Main Proxy ───────────────────────────────────────────────────

function createPrismaProxy() {
  const models = new Map<string, ReturnType<typeof createModelProxy>>()

  return new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string) {
      if (prop === "$queryRawUnsafe") {
        return async (sql: string, ...params: unknown[]) => queryRaw(sql, ...params)
      }

      if (prop === "$queryRaw") {
        // Handle tagged template literals
        return async (
          strings: TemplateStringsArray | string,
          ...values: unknown[]
        ) => {
          if (typeof strings === "string") {
            return queryRaw(strings, ...values)
          }
          // Tagged template literal
          let sql = ""
          for (let i = 0; i < strings.length; i++) {
            sql += strings[i]
            if (i < values.length) {
              sql += `$${i + 1}`
            }
          }
          return queryRaw(sql, ...values)
        }
      }

      if (prop === "$transaction") {
        return async (arg: unknown) => {
          if (typeof arg === "function") {
            return executeTransaction(arg as (tx: Record<string, unknown>) => Promise<unknown>)
          }
          // Array of promises
          if (Array.isArray(arg)) {
            return Promise.all(arg)
          }
          return arg
        }
      }

      if (prop === "$disconnect" || prop === "$connect") {
        return async () => {} // No-op for Supabase
      }

      if (prop === "$extends") {
        return () => createPrismaProxy() // Pass through
      }

      // Model access — PascalCase table names
      if (!models.has(prop)) {
        models.set(prop, createModelProxy(prop))
      }
      return models.get(prop)
    },
  })
}

// ─── Export ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaProxy = createPrismaProxy()

/** Typed interface so downstream code doesn't get implicit-any on .map() etc */
type ModelProxy = {
  findMany: (...args: any[]) => Promise<any[]>
  findFirst: (...args: any[]) => Promise<any>
  findFirstOrThrow: (...args: any[]) => Promise<any>
  findUnique: (...args: any[]) => Promise<any>
  findUniqueOrThrow: (...args: any[]) => Promise<any>
  create: (...args: any[]) => Promise<any>
  createMany: (...args: any[]) => Promise<any>
  update: (...args: any[]) => Promise<any>
  updateMany: (...args: any[]) => Promise<any>
  upsert: (...args: any[]) => Promise<any>
  delete: (...args: any[]) => Promise<any>
  deleteMany: (...args: any[]) => Promise<any>
  count: (...args: any[]) => Promise<number>
  aggregate: (...args: any[]) => Promise<any>
  groupBy: (...args: any[]) => Promise<any>
}

type PrismaClient = {
  [key: string]: ModelProxy
  $queryRaw: (...args: any[]) => Promise<any>
  $executeRaw: (...args: any[]) => Promise<any>
  $transaction: (...args: any[]) => Promise<any>
  $disconnect: () => Promise<void>
  $connect: () => Promise<void>
}

export const prisma = prismaProxy as unknown as PrismaClient

// Re-export types that might be needed
export type { SupabaseClient }
