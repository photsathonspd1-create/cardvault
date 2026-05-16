"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function ForumReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!content.trim()) return

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/forum/threads/${threadId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "เกิดข้อผิดพลาด")
        return
      }

      setContent("")
      router.refresh()
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="เขียนตอบกลับ..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button
          variant="purple"
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          ตอบกลับ
        </Button>
      </div>
    </div>
  )
}
