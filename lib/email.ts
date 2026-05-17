/**
 * Email Service — Resend API
 * 
 * Requires RESEND_API_KEY env variable.
 * Free tier: 100 emails/day
 * 
 * @see https://resend.com/docs
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || "CardVault <noreply@cardvault.co.th>"

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — email not sent")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        text,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      console.error("Resend error:", data)
      return { success: false, error: data.message || "Failed to send email" }
    }

    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error: "Network error" }
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cardvault-drab.vercel.app"
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`

  return sendEmail({
    to: email,
    subject: "รีเซ็ตรหัสผ่าน CardVault",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #F59E0B; margin: 0;">CardVault</h1>
        </div>
        <div style="background: #18181b; border-radius: 12px; padding: 24px; color: #fafafa;">
          <h2 style="margin-top: 0;">รีเซ็ตรหัสผ่าน</h2>
          <p style="color: #a1a1aa;">คุณได้ขอรีเซ็ตรหัสผ่าน กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #F59E0B; color: #000; font-weight: bold; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
              รีเซ็ตรหัสผ่าน
            </a>
          </div>
          <p style="color: #71717a; font-size: 12px;">ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
          <p style="color: #71717a; font-size: 12px;">หากคุณไม่ได้ขอรีเซ็ต กรุณาละเลยอีเมลนี้</p>
        </div>
      </div>
    `,
  })
}
