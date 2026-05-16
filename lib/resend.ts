/**
 * Resend email client (fetch-based, no SDK dependency)
 *
 * Required env vars:
 *   RESEND_API_KEY      - re_xxxxx API key
 *   RESEND_FROM_EMAIL   - e.g. "CardVault <noreply@cardvault.co.th>"
 */

const RESEND_API_URL = "https://api.resend.com/emails"

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

/**
 * Send an email via Resend API
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "CardVault <noreply@cardvault.co.th>"

  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY not configured, skipping email send")
    return { id: "skipped" }
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Resend API error (${response.status}): ${errorBody}`)
  }

  const data = (await response.json()) as { id: string }
  return data
}

// ─── Email Templates ───────────────────────────────────────────────

function wrapTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #262626;">
      <span style="font-size:24px;font-weight:bold;">
        <span style="color:#9355FF;">Card</span><span style="color:#D4AF37;">Vault</span>
      </span>
    </div>

    <!-- Content -->
    <div style="padding:24px 0;color:#e5e5e5;line-height:1.6;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="padding-top:24px;border-top:1px solid #262626;color:#737373;font-size:12px;text-align:center;">
      <p>อีเมลนี้ถูกส่งจาก CardVault — Marketplace การ์ด TCG อันดับ 1 ของไทย</p>
      <p style="margin-top:8px;">
        <a href="https://cardvault.co.th" style="color:#9355FF;text-decoration:none;">cardvault.co.th</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

export function orderPaidTemplate(data: {
  buyerName: string
  orderNumber: string
  cardName: string
  totalAmount: string
  sellerName: string
}): string {
  return wrapTemplate(
    "ยืนยันการชำระเงิน",
    `
    <h2 style="color:#22c55e;margin:0 0 16px;">✅ ชำระเงินสำเร็จ</h2>
    <p>สวัสดีครับ คุณ<strong>${data.buyerName}</strong></p>
    <p>การชำระเงินสำหรับออเดอร์ <strong>#${data.orderNumber}</strong> เรียบร้อยแล้ว</p>

    <div style="background:#171717;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;"><strong>สินค้า:</strong> ${data.cardName}</p>
      <p style="margin:0 0 8px;"><strong>ยอดชำระ:</strong> ${data.totalAmount}</p>
      <p style="margin:0;"><strong>ผู้ขาย:</strong> ${data.sellerName}</p>
    </div>

    <p>เงินของคุณจะถูกเก็บไว้ในระบบ Escrow จนกว่าจะได้รับสินค้าและยืนยันว่าถูกต้อง</p>
    <p style="color:#737373;font-size:13px;">ผู้ขายจะได้รับแจ้งเตือนเพื่อจัดส่งสินค้าต่อไป</p>
    `
  )
}

export function orderShippedTemplate(data: {
  buyerName: string
  orderNumber: string
  cardName: string
  trackingNumber: string
  shippingProvider: string
  sellerName: string
}): string {
  return wrapTemplate(
    "สินค้าถูกจัดส่งแล้ว",
    `
    <h2 style="color:#9355FF;margin:0 0 16px;">📦 สินค้าถูกจัดส่งแล้ว</h2>
    <p>สวัสดีครับ คุณ<strong>${data.buyerName}</strong></p>
    <p>ออเดอร์ <strong>#${data.orderNumber}</strong> ถูกจัดส่งเรียบร้อยแล้ว</p>

    <div style="background:#171717;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;"><strong>สินค้า:</strong> ${data.cardName}</p>
      <p style="margin:0 0 8px;"><strong>ขนส่ง:</strong> ${data.shippingProvider}</p>
      <p style="margin:0;"><strong>เลข Tracking:</strong> <span style="color:#D4AF37;font-weight:bold;">${data.trackingNumber}</span></p>
    </div>

    <p>กรุณาติดตามพัสดุ และเมื่อได้รับสินค้าแล้ว กรุณายืนยันรับสินค้าในระบบ</p>
    <p style="color:#737373;font-size:13px;">เงินจะถูกปล่อยให้ผู้ขายหลังจากที่คุณยืนยัน หรืออัตโนมัติภายใน 7 วัน</p>
    `
  )
}

export function orderCompletedTemplate(data: {
  buyerName: string
  orderNumber: string
  cardName: string
  sellerName: string
  isSeller: boolean
}): string {
  if (data.isSeller) {
    return wrapTemplate(
      "ออเดอร์สำเร็จ — เงินถูกปล่อยแล้ว",
      `
      <h2 style="color:#22c55e;margin:0 0 16px;">💰 ออเดอร์สำเร็จ</h2>
      <p>สวัสดีครับ คุณ<strong>${data.sellerName}</strong></p>
      <p>ออเดอร์ <strong>#${data.orderNumber}</strong> เสร็จสมบูรณ์แล้ว</p>

      <div style="background:#171717;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>สินค้า:</strong> ${data.cardName}</p>
        <p style="margin:0;">เงินถูกปล่อยเข้าบัญชีของคุณเรียบร้อยแล้ว</p>
      </div>

      <p>ขอบคุณที่ขายสินค้าคุณภาพบน CardVault!</p>
      `
    )
  }

  return wrapTemplate(
    "ออเดอร์สำเร็จ",
    `
    <h2 style="color:#22c55e;margin:0 0 16px;">🎉 ออเดอร์สำเร็จ</h2>
    <p>สวัสดีครับ คุณ<strong>${data.buyerName}</strong></p>
    <p>ออเดอร์ <strong>#${data.orderNumber}</strong> เสร็จสมบูรณ์แล้ว</p>

    <div style="background:#171717;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;"><strong>สินค้า:</strong> ${data.cardName}</p>
      <p style="margin:0;"><strong>ผู้ขาย:</strong> ${data.sellerName}</p>
    </div>

    <p>หวังว่าคุณจะพอใจกับสินค้า! อย่าลืมให้รีวิวแก่ผู้ขายเพื่อช่วยเหลือผู้ซื้อคนอื่นๆ</p>
    `
  )
}

export function disputeOpenedTemplate(data: {
  recipientName: string
  orderNumber: string
  cardName: string
  reason: string
  description: string
  isSeller: boolean
}): string {
  if (data.isSeller) {
    return wrapTemplate(
      "มีข้อพิพาทสำหรับออเดอร์ของคุณ",
      `
      <h2 style="color:#ef4444;margin:0 0 16px;">⚠️ มีข้อพิพาท</h2>
      <p>สวัสดีครับ คุณ<strong>${data.recipientName}</strong></p>
      <p>มีการเปิดข้อพิพาทสำหรับออเดอร์ <strong>#${data.orderNumber}</strong></p>

      <div style="background:#171717;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>สินค้า:</strong> ${data.cardName}</p>
        <p style="margin:0 0 8px;"><strong>เหตุผล:</strong> ${data.reason}</p>
        <p style="margin:0;"><strong>รายละเอียด:</strong> ${data.description}</p>
      </div>

      <p>กรุณาเข้าสู่ระบบเพื่อตอบกลับข้อพิพาทภายใน <strong>48 ชั่วโมง</strong></p>
      <p style="color:#737373;font-size:13px;">เงินในระบบ Escrow ถูกอายัดไว้จนกว่าจะแก้ไขเรียบร้อย</p>
      `
    )
  }

  return wrapTemplate(
    "คุณเปิดข้อพิพาทสำเร็จ",
    `
    <h2 style="color:#f59e0b;margin:0 0 16px;">📋 ข้อพิพาทถูกเปิดแล้ว</h2>
    <p>สวัสดีครับ คุณ<strong>${data.recipientName}</strong></p>
    <p>ข้อพิพาทสำหรับออเดอร์ <strong>#${data.orderNumber}</strong> ถูกเปิดเรียบร้อยแล้ว</p>

    <div style="background:#171717;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;"><strong>สินค้า:</strong> ${data.cardName}</p>
      <p style="margin:0 0 8px;"><strong>เหตุผล:</strong> ${data.reason}</p>
      <p style="margin:0;"><strong>รายละเอียด:</strong> ${data.description}</p>
    </div>

    <p>ทีมงานจะตรวจสอบข้อพิพาทและติดต่อกลับภายใน 24-48 ชั่วโมง</p>
    <p style="color:#737373;font-size:13px;">เงินในระบบ Escrow ถูกอายัดไว้จนกว่าจะแก้ไขเรียบร้อย</p>
    `
  )
}
