"use client"

import { useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Camera,
  RefreshCw,
  CheckCircle,
  ImagePlus,
  X,
  Loader2,
} from "lucide-react"
import { useCardScanner, type ScanStep } from "./useCardScanner"

interface CardScannerProps {
  onComplete: (images: File[]) => void
  onCancel: () => void
}

const SCAN_STEPS: ScanStep[] = ["front", "back", "holo"]

const STEP_LABELS: Record<ScanStep, string> = {
  front: "ด้านหน้า",
  back: "ด้านหลัง",
  holo: "Holo Pattern",
}

const STEP_ICONS: Record<ScanStep, string> = {
  front: "🃏",
  back: "🔄",
  holo: "✨",
}

/**
 * Animated corner markers for the card frame overlay
 */
function CornerMarkers() {
  const cornerSize = 24
  const strokeWidth = 3
  const color = "#22c55e" // green-500

  const corners = [
    { x: "15%", y: "20%", rotate: 0 },
    { x: "85%", y: "20%", rotate: 90 },
    { x: "85%", y: "80%", rotate: 180 },
    { x: "15%", y: "80%", rotate: 270 },
  ]

  return (
    <>
      {corners.map((corner, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: corner.x,
            top: corner.y,
            transform: `translate(-50%, -50%) rotate(${corner.rotate}deg)`,
          }}
        >
          <svg
            width={cornerSize}
            height={cornerSize}
            viewBox={`0 0 ${cornerSize} ${cornerSize}`}
            className="animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <path
              d={`M 0 ${cornerSize} L 0 0 L ${cornerSize} 0`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </>
  )
}

/**
 * Step indicator showing progress through front → back → holo
 */
function StepIndicator({
  currentStep,
  capturedImages,
}: {
  currentStep: ScanStep
  capturedImages: Record<ScanStep, { file: File; preview: string } | null>
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {SCAN_STEPS.map((step, i) => {
        const isCaptured = capturedImages[step] !== null
        const isCurrent = step === currentStep

        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${isCaptured
                  ? "bg-green-600 text-white"
                  : isCurrent
                  ? "bg-purple-600 text-white ring-2 ring-purple-400 ring-offset-2 ring-offset-black"
                  : "bg-white/10 text-white/50"
                }
              `}
            >
              <span>{STEP_ICONS[step]}</span>
              <span>{STEP_LABELS[step]}</span>
              {isCaptured && <CheckCircle className="h-3 w-3" />}
            </div>
            {i < SCAN_STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${isCaptured ? "bg-green-500" : "bg-white/20"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Sharpness indicator bar
 */
function SharpnessBar({
  value,
  threshold,
}: {
  value: number
  threshold: number
}) {
  const ratio = Math.min(value / threshold, 2)
  const isSharp = value >= threshold

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-white/60 w-16">ความคมชัด</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isSharp ? "bg-green-500" : "bg-yellow-500"
          }`}
          style={{ width: `${Math.min(ratio * 50, 100)}%` }}
        />
      </div>
      <span className={isSharp ? "text-green-400" : "text-yellow-400"}>
        {isSharp ? "✓ ชัด" : "เคลื่อนไหว"}
      </span>
    </div>
  )
}

export function CardScanner({ onComplete, onCancel }: CardScannerProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const sharpnessIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    videoRef,
    canvasRef,
    stream,
    currentStep,
    scanStatus,
    sharpness,
    sharpnessThreshold,
    capturedImages,
    cameraError,
    allCaptured,
    stepLabel,
    startCamera,
    stopCamera,
    checkSharpness,
    capturePhoto,
    retakePhoto,
    acceptPhoto,
    complete,
    handleGallerySelect,
  } = useCardScanner({ onComplete })

  // Start camera on mount
  useEffect(() => {
    startCamera()
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Continuously check sharpness while camera is active
  useEffect(() => {
    if (stream && scanStatus === "idle") {
      sharpnessIntervalRef.current = setInterval(checkSharpness, 300)
    }
    return () => {
      if (sharpnessIntervalRef.current) {
        clearInterval(sharpnessIntervalRef.current)
      }
    }
  }, [stream, scanStatus, checkSharpness])

  const handleGalleryClick = useCallback(() => {
    galleryInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files) handleGallerySelect(files)
    },
    [handleGallerySelect]
  )

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Hidden canvas for sharpness calculation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => {
            stopCamera()
            onCancel()
          }}
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-white font-medium">สแกนการ์ด</h2>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Step Indicator */}
      <div className="py-3 bg-black/60">
        <StepIndicator
          currentStep={currentStep}
          capturedImages={capturedImages}
        />
      </div>

      {/* Camera View */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="text-center space-y-4 px-6">
            <Camera className="h-16 w-16 text-white/30 mx-auto" />
            <p className="text-white/70 text-sm">{cameraError}</p>
            <Button variant="outline" onClick={handleGalleryClick} className="gap-2">
              <ImagePlus className="h-4 w-4" />
              เลือกจาก Gallery
            </Button>
          </div>
        ) : scanStatus === "scanning" || scanStatus === "sharpness-check" ? (
          <div className="text-center space-y-3">
            <Loader2 className="h-12 w-12 text-white animate-spin mx-auto" />
            <p className="text-white text-sm">
              {scanStatus === "scanning" ? "กำลังถ่าย..." : "กำลังตรวจสอบความคมชัด..."}
            </p>
          </div>
        ) : scanStatus === "captured" && capturedImages[currentStep] ? (
          /* Show captured preview */
          <div className="relative w-full h-full">
            <img
              src={capturedImages[currentStep]!.preview}
              alt={`รูป${stepLabel}`}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          /* Live camera feed */
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Card frame overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Dark overlay outside frame */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Clear frame area (2.5:3.5 ratio, centered) */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white/30 rounded-lg"
                style={{
                  width: "60%",
                  aspectRatio: "2.5 / 3.5",
                }}
              >
                {/* Animated corner markers */}
                <CornerMarkers />
              </div>

              {/* Guide text */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/70 text-xs">
                  วางการ์ดให้อยู่ในกรอบ • ถือให้นิ่ง
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Captured image thumbnails */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 bg-black/60">
        {SCAN_STEPS.map((step) => {
          const result = capturedImages[step]
          return (
            <div
              key={step}
              className={`
                relative w-14 h-20 rounded-md overflow-hidden border-2 transition-all
                ${result
                  ? "border-green-500"
                  : step === currentStep
                  ? "border-purple-500 ring-1 ring-purple-400"
                  : "border-white/20"
                }
              `}
            >
              {result ? (
                <>
                  <img
                    src={result.preview}
                    alt={STEP_LABELS[step]}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => retakePhoto(step)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                    title="ถ่ายใหม่"
                  >
                    <RefreshCw className="h-4 w-4 text-white" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <span className="text-lg">{STEP_ICONS[step]}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sharpness bar (only when scanning) */}
      {stream && scanStatus === "idle" && !allCaptured && (
        <div className="px-4 py-1 bg-black/60">
          <SharpnessBar value={sharpness} threshold={sharpnessThreshold} />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-4 py-4 bg-black/80">
        {scanStatus === "captured" ? (
          <>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => retakePhoto(currentStep)}
            >
              <RefreshCw className="h-4 w-4" />
              ถ่ายใหม่
            </Button>
            <Button
              variant="success"
              size="lg"
              className="gap-2"
              onClick={acceptPhoto}
            >
              <CheckCircle className="h-4 w-4" />
              ใช้รูปนี้
            </Button>
          </>
        ) : allCaptured ? (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={handleGalleryClick}
              className="gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              เลือกจาก Gallery
            </Button>
            <Button
              variant="gold"
              size="lg"
              className="gap-2"
              onClick={complete}
            >
              <CheckCircle className="h-4 w-4" />
              ใช้รูปทั้งหมด
            </Button>
          </>
        ) : cameraError ? (
          <Button
            variant="outline"
            size="lg"
            onClick={handleGalleryClick}
            className="gap-2"
          >
            <ImagePlus className="h-4 w-4" />
            เลือกจาก Gallery
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={handleGalleryClick}
              className="gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              เลือกจาก Gallery
            </Button>
            <Button
              variant="purple"
              size="xl"
              className="rounded-full w-16 h-16 p-0"
              onClick={capturePhoto}
              disabled={sharpness < sharpnessThreshold * 0.5}
            >
              <Camera className="h-7 w-7" />
            </Button>
            <div className="w-[120px]" /> {/* Spacer for centering */}
          </>
        )}
      </div>
    </div>
  )
}
