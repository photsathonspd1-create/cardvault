/**
 * Card Identification Pipeline
 * 
 * 1. User uploads card image
 * 2. Tesseract.js extracts text (card name, set info, card number)
 * 3. Fuzzy search against Pokemon TCG API by name
 * 4. Return matched cards with confidence scores
 * 
 * Note: Pokemon TCG API (https://pokemontcg.io/) provides REST API
 * for card data. No image search available — we use OCR + text search.
 */

import { z } from "zod"

const PokemonTcgCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  supertype: z.string(),
  subtypes: z.array(z.string()).optional(),
  hp: z.string().optional(),
  types: z.array(z.string()).optional(),
  set: z.object({
    id: z.string(),
    name: z.string(),
    series: z.string(),
    printedTotal: z.number().optional(),
    total: z.number(),
    releaseDate: z.string().optional(),
    images: z.object({
      symbol: z.string().optional(),
      logo: z.string().optional(),
    }).optional(),
  }),
  number: z.string(),
  rarity: z.string().optional(),
  artist: z.string().optional(),
  images: z.object({
    small: z.string(),
    large: z.string(),
  }),
  tcgplayer: z.object({
    url: z.string().optional(),
    updatedAt: z.string().optional(),
    prices: z.record(z.object({
      low: z.number().optional(),
      mid: z.number().optional(),
      high: z.number().optional(),
      market: z.number().optional(),
      directLow: z.number().optional(),
    })).optional(),
  }).optional(),
})

export type PokemonTcgCard = z.infer<typeof PokemonTcgCardSchema>

const API_BASE = "https://api.pokemontcg.io/v2"
const API_KEY = process.env.POKEMON_TCG_API_KEY

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" }
  if (API_KEY) {
    headers["X-Api-Key"] = API_KEY
  }
  return headers
}

/**
 * Search Pokemon TCG API by card name
 * Uses q parameter with fuzzy name matching
 */
export async function searchPokemonCards(
  query: string,
  options?: { pageSize?: number; page?: number }
): Promise<{ cards: PokemonTcgCard[]; totalCount: number }> {
  const pageSize = options?.pageSize ?? 10
  const page = options?.page ?? 1

  // Pokemon TCG API search syntax: name:"query*" for prefix matching
  const searchQuery = `name:"${query.replace(/"/g, '\\"')}*"`
  const url = `${API_BASE}/cards?q=${encodeURIComponent(searchQuery)}&pageSize=${pageSize}&page=${page}&select=id,name,supertype,hp,types,set,number,rarity,artist,images,tcgplayer`

  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`Pokemon TCG API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    cards: z.array(PokemonTcgCardSchema).parse(data.data ?? []),
    totalCount: data.totalCount ?? 0,
  }
}

/**
 * Get a specific Pokemon card by ID
 */
export async function getPokemonCard(cardId: string): Promise<PokemonTcgCard | null> {
  const url = `${API_BASE}/cards/${cardId}`
  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Pokemon TCG API error: ${response.status}`)
  }

  const data = await response.json()
  return PokemonTcgCardSchema.parse(data.data)
}

/**
 * Extract card name from image using Tesseract.js (server-side OCR)
 * 
 * This runs on the server — Tesseract.js v5 uses worker threads
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<{
  text: string
  confidence: number
  words: Array<{ text: string; confidence: number }>
}> {
  // Dynamic import for server-only module
  const Tesseract = await import("tesseract.js")

  const result = await Tesseract.recognize(imageBuffer, "eng+jpn", {
    logger: () => {}, // Suppress logging
  })

  const words = result.data.words.map((w) => ({
    text: w.text,
    confidence: w.confidence,
  }))

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    words,
  }
}

/**
 * Full identification pipeline:
 * OCR image → extract potential card name → search Pokemon TCG API
 */
export async function identifyCard(imageBuffer: Buffer): Promise<{
  ocrText: string
  ocrConfidence: number
  candidates: PokemonTcgCard[]
}> {
  // Step 1: OCR the image
  const ocr = await extractTextFromImage(imageBuffer)

  // Step 2: Extract potential card name from OCR text
  // Heuristic: filter out short words, numbers, common noise
  const cleanedText = ocr.text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 2)
    .filter((line) => !/^\d+$/.test(line)) // Remove pure number lines
    .filter((line) => !/^(HP|LV|MP|ATK|DEF|Stage|Basic)$/i.test(line)) // Remove stats
    .slice(0, 3) // Take top 3 lines as potential names
    .join(" ")

  if (!cleanedText.trim()) {
    return { ocrText: ocr.text, ocrConfidence: ocr.confidence, candidates: [] }
  }

  // Step 3: Search Pokemon TCG API with extracted text
  // Try the full cleaned text first, then try individual words
  let candidates: PokemonTcgCard[] = []

  try {
    const result = await searchPokemonCards(cleanedText, { pageSize: 5 })
    candidates = result.cards
  } catch {
    // If full text search fails, try individual words
  }

  // If no results, try first meaningful word
  if (candidates.length === 0) {
    const firstWord = cleanedText.split(/\s+/).find((w) => w.length > 3)
    if (firstWord) {
      try {
        const result = await searchPokemonCards(firstWord, { pageSize: 5 })
        candidates = result.cards
      } catch {
        // Ignore
      }
    }
  }

  return {
    ocrText: ocr.text,
    ocrConfidence: ocr.confidence,
    candidates,
  }
}

/**
 * Extract market price from TCGPlayer data (in cents/สตางค์)
 */
export function extractMarketPrice(card: PokemonTcgCard, condition: "raw" | "holofoil" = "raw"): number | null {
  const prices = card.tcgplayer?.prices
  if (!prices) return null

  // Try different price types
  const priceTypes = condition === "raw"
    ? ["normal", "holofoil", "reverseHolofoil"]
    : ["holofoil", "reverseHolofoil", "normal"]

  for (const type of priceTypes) {
    const priceData = prices[type]
    if (priceData?.market) {
      return Math.round(priceData.market * 100) // Convert to สตางค์
    }
  }

  return null
}
