/**
 * Omise payment client wrapper
 *
 * Required env vars:
 *   OMISE_PUBLIC_KEY   - pkey_...
 *   OMISE_SECRET_KEY   - skey_...
 *
 * Docs: https://www.omise.co/docs
 */

const OMISE_API_URL = "https://api.omise.co"

const publicKey = process.env.OMISE_PUBLIC_KEY
const secretKey = process.env.OMISE_SECRET_KEY

export function isOmiseConfigured(): boolean {
  return !!publicKey && !!secretKey
}

function getAuthHeader(): string {
  if (!secretKey) throw new Error("OMISE_SECRET_KEY ไม่ได้ตั้งค่า")
  return "Basic " + Buffer.from(secretKey + ":").toString("base64")
}

async function omiseRequest<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const url = `${OMISE_API_URL}${path}`
  const options: RequestInit = {
    method,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
  }

  if (body) {
    options.body = new URLSearchParams(
      Object.entries(body).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === "object") {
              for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
                acc[`${key}[${k}]`] = String(v)
              }
            } else {
              acc[key] = String(value)
            }
          }
          return acc
        },
        {} as Record<string, string>
      )
    ).toString()
    ;(options.headers as Record<string, string>)["Content-Type"] =
      "application/x-www-form-urlencoded"
  }

  const response = await fetch(url, options)
  const data = await response.json()

  if (!response.ok) {
    const error = data as { code?: string; message?: string }
    throw new Error(
      `Omise error (${error.code ?? response.status}): ${error.message ?? "Unknown error"}`
    )
  }

  return data as T
}

// ─── Types ───────────────────────────────────────────────────────────

export interface OmiseCharge {
  id: string
  object: "charge"
  amount: number
  currency: string
  status: "pending" | "successful" | "failed" | "reversed"
  source?: {
    id: string
    type: string
    scannable_code?: string
  }
  authorize_uri?: string
  return_uri?: string
  metadata?: Record<string, string>
  paid: boolean
  created: string
}

export interface OmiseTransfer {
  id: string
  object: "transfer"
  amount: number
  currency: string
  recipient: string
  created: string
}

export interface OmiseRecipient {
  id: string
  object: "recipient"
  name: string
  type: string
  bank_account: {
    bank_code: string
    name: string
    number: string
  }
  created: string
}

// ─── Charges ─────────────────────────────────────────────────────────

/**
 * Create a PromptPay charge
 * Returns charge with scannable_code (QR code) for the buyer to scan
 */
export async function createPromptPayCharge(
  amount: number,
  orderId: string,
  description: string
): Promise<OmiseCharge> {
  return omiseRequest<OmiseCharge>("POST", "/charges", {
    amount,
    currency: "THB",
    source: { type: "promptpay" },
    metadata: { order_id: orderId },
    description,
  })
}

/**
 * Create a credit card charge (requires token from Omise.js frontend)
 */
export async function createCardCharge(
  amount: number,
  orderId: string,
  cardToken: string,
  description: string
): Promise<OmiseCharge> {
  return omiseRequest<OmiseCharge>("POST", "/charges", {
    amount,
    currency: "THB",
    card: cardToken,
    metadata: { order_id: orderId },
    description,
  })
}

/**
 * Get charge status
 */
export async function getCharge(chargeId: string): Promise<OmiseCharge> {
  return omiseRequest<OmiseCharge>("GET", `/charges/${chargeId}`)
}

// ─── Transfers (Escrow Release) ─────────────────────────────────────

/**
 * Transfer funds to a recipient (seller's bank account)
 * Used when releasing escrow after order completion
 */
export async function createTransfer(
  amount: number,
  recipientId: string,
  description: string
): Promise<OmiseTransfer> {
  return omiseRequest<OmiseTransfer>("POST", "/transfers", {
    amount,
    currency: "THB",
    recipient: recipientId,
    description,
  })
}

/**
 * Create a recipient (seller's bank account) for payouts
 */
export async function createRecipient(
  name: string,
  bankCode: string,
  accountNumber: string,
  accountName: string
): Promise<OmiseRecipient> {
  return omiseRequest<OmiseRecipient>("POST", "/recipients", {
    name,
    type: "individual",
    bank_account: {
      bank_code: bankCode,
      name: accountName,
      number: accountNumber,
    },
  })
}

/**
 * Refund a charge (full or partial)
 */
export async function refundCharge(
  chargeId: string,
  amount?: number
): Promise<{ id: string; amount: number; status: string }> {
  const body: Record<string, unknown> = {}
  if (amount) body.amount = amount
  return omiseRequest("POST", `/charges/${chargeId}/refund`, body)
}
