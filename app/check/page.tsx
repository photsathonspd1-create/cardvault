"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { Search, Shield, AlertTriangle, Phone, CreditCard, ExternalLink } from "lucide-react"

export default function ScammerCheckPage() {
  const [searchType, setSearchType] = useState<"phone" | "bank">("phone")
  const [searchValue, setSearchValue] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!searchValue) return

    setLoading(true)
    setSearched(true)
    try {
      const param = searchType === "phone" ? `phone=${searchValue}` : `bank=${searchValue}`
      const res = await fetch(`/api/reports/scammer?${param}`)
      const data = await res.json()
      setResults(data.reports ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-12 max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold">ตรวจสอบคนโกง</h1>
            <p className="text-muted-foreground mt-2">
              ค้นหาเบอร์โทรหรือเลขบัญชีธนาคารในฐานข้อมูล Scammer
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={searchType === "phone" ? "purple" : "outline"}
                  onClick={() => setSearchType("phone")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  เบอร์โทร
                </Button>
                <Button
                  variant={searchType === "bank" ? "purple" : "outline"}
                  onClick={() => setSearchType("bank")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  เลขบัญชี
                </Button>
              </div>

              <div className="space-y-2">
                <Label>
                  {searchType === "phone" ? "เบอร์โทรศัพท์" : "เลขบัญชีธนาคาร"}
                </Label>
                <Input
                  placeholder={searchType === "phone" ? "0812345678" : "1234567890"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Button
                variant="gold"
                className="w-full"
                onClick={handleSearch}
                disabled={loading || !searchValue}
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "กำลังค้นหา..." : "ตรวจสอบ"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && (
            <div className="mt-8 space-y-4">
              {results.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-green-400">ไม่พบข้อมูล</h2>
                    <p className="text-muted-foreground mt-2">
                      ไม่พบ {searchType === "phone" ? "เบอร์โทร" : "เลขบัญชี"} นี้ในฐานข้อมูล Scammer
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ⚠️ ไม่ได้หมายความว่าปลอดภัย 100% กรุณาตรวจสอบเพิ่มเติม
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-destructive/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-bold">พบ {results.length} รายงาน!</span>
                      </div>
                    </CardContent>
                  </Card>

                  {results.map((report) => (
                    <Card key={report.id} className="border-destructive/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="destructive">⚠️ ถูกรายงาน</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString("th-TH")}
                          </span>
                        </div>
                        {report.bankCode && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">ธนาคาร:</span>{" "}
                            <span className="font-medium">{report.bankCode}</span>
                            {report.bankNumber && (
                              <> • <span className="font-mono">{report.bankNumber}</span></>
                            )}
                            {report.bankName && (
                              <> • <span>{report.bankName}</span></>
                            )}
                          </div>
                        )}
                        {report.phone && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">เบอร์โทร:</span>{" "}
                            <span className="font-mono">{report.phone}</span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground space-y-1">
            <p>ฐานข้อมูลนี้รวบรวมจากรายงานของชุมชนและตรวจสอบโดยแอดมิน</p>
            <p>ข้อมูลนี้เป็นเพียงส่วนหนึ่ง กรุณาใช้วิจารณญาณ</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
