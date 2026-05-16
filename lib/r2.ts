import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "crypto"

/**
 * Cloudflare R2 client (S3-compatible)
 *
 * Required env vars:
 *   R2_ENDPOINT            - e.g. https://<account-id>.r2.cloudflarestorage.com
 *   R2_ACCESS_KEY_ID       - R2 API token access key
 *   R2_SECRET_ACCESS_KEY   - R2 API token secret key
 *   R2_BUCKET_NAME         - e.g. cardvault-assets
 *   R2_PUBLIC_URL          - e.g. https://assets.cardvault.co.th
 */

const r2Endpoint = process.env.R2_ENDPOINT
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const r2BucketName = process.env.R2_BUCKET_NAME
const r2PublicUrl = process.env.R2_PUBLIC_URL

function createR2Client(): S3Client | null {
  if (!r2Endpoint || !r2AccessKeyId || !r2SecretAccessKey) {
    return null
  }
  return new S3Client({
    region: "auto",
    endpoint: r2Endpoint,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
    },
  })
}

const client = createR2Client()

/**
 * Check whether R2 is configured (all env vars present)
 */
export function isR2Configured(): boolean {
  return client !== null && !!r2BucketName && !!r2PublicUrl
}

const ALLOWED_CONTENT_TYPES = ["image/webp", "image/jpeg", "image/png"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface PresignedUrlResult {
  uploadUrl: string
  publicUrl: string
  key: string
}

/**
 * Generate a presigned PUT URL for direct client-side upload to R2.
 *
 * @param userId   - the uploading user's ID (used in key path)
 * @param filename - original filename (used for extension)
 * @param contentType - MIME type of the file
 * @param fileSize - file size in bytes (optional, for validation)
 */
export async function generatePresignedUploadUrl(
  userId: string,
  filename: string,
  contentType: string,
  fileSize?: number
): Promise<PresignedUrlResult> {
  if (!isR2Configured() || !client || !r2BucketName || !r2PublicUrl) {
    throw new Error("R2 ไม่ได้ตั้งค่า กรุณาตั้งค่า environment variables")
  }

  // Validate content type
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new Error("อนุญาตเฉพาะไฟล์ WebP, JPEG, PNG เท่านั้น")
  }

  // Validate file size
  if (fileSize && fileSize > MAX_FILE_SIZE) {
    throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 5MB")
  }

  // Generate unique key: uploads/{userId}/{uuid}.{ext}
  const ext = getExtensionFromContentType(contentType) ?? filename.split(".").pop() ?? "webp"
  const key = `uploads/${userId}/${crypto.randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: r2BucketName,
    Key: key,
    ContentType: contentType,
    // R2 presigned URLs have a max TTL of 7 days (604800 seconds)
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 }) // 10 min
  const publicUrl = `${r2PublicUrl}/${key}`

  return { uploadUrl, publicUrl, key }
}

/**
 * Derive file extension from MIME type
 */
function getExtensionFromContentType(contentType: string): string | null {
  const map: Record<string, string> = {
    "image/webp": "webp",
    "image/jpeg": "jpg",
    "image/png": "png",
  }
  return map[contentType] ?? null
}
