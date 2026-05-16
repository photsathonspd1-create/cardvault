"use client"

import { useCallback, useRef, useState } from "react"

export type ScanStep = "front" | "back" | "holo"
export type ScanStatus = "idle" | "scanning" | "sharpness-check" | "captured"

export interface ScanResult {
  file: File
  preview: string
}

const SCAN_STEPS: ScanStep[] = ["front", "back", "holo"]

const STEP_LABELS: Record<ScanStep, string> = {
  front: "ถ่ายด้านหน้า",
  back: "ถ่ายด้านหลัง",
  holo: "ถ่าย Holo Pattern",
}

/**
 * Compute Laplacian variance as sharpness metric.
 * Higher value = sharper image. Threshold: 100 = acceptably sharp.
 */
function computeLaplacianVariance(imageData: ImageData): number {
  const { data, width, height } = imageData
  // Convert to grayscale
  const gray = new Float32Array(width * height)
  for (let i = 0; i < gray.length; i++) {
    const idx = i * 4
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
  }

  // Apply 3x3 Laplacian kernel [0,1,0, 1,-4,1, 0,1,0]
  let sum = 0
  let sumSq = 0
  let count = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const laplacian =
        gray[(y - 1) * width + x] +
        gray[y * width + (x - 1)] +
        gray[y * width + (x + 1)] +
        gray[(y + 1) * width + x] -
        4 * gray[y * width + x]
      sum += laplacian
      sumSq += laplacian * laplacian
      count++
    }
  }

  const mean = sum / count
  const variance = sumSq / count - mean * mean
  return variance
}

/**
 * Crop canvas to the card frame region (center 60% area with 2.5:3.5 ratio)
 */
function cropToFrame(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const targetRatio = 2.5 / 3.5

  // Frame occupies ~60% of the smaller dimension
  const frameScale = 0.6
  const frameW = Math.round(width * frameScale)
  const frameH = Math.round(frameW / targetRatio)

  const frameX = Math.round((width - frameW) / 2)
  const frameY = Math.round((height - frameH) / 2)

  const cropped = document.createElement("canvas")
  cropped.width = frameW
  cropped.height = frameH
  const ctx = cropped.getContext("2d")!
  ctx.drawImage(sourceCanvas, frameX, frameY, frameW, frameH, 0, 0, frameW, frameH)
  return cropped
}

/**
 * Convert canvas to WebP File, enforcing max 2MB by reducing quality iteratively.
 */
async function canvasToWebPFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
  let quality = 0.92
  let blob: Blob | null = null

  for (let attempt = 0; attempt < 5; attempt++) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    )
    if (!blob) throw new Error("ไม่สามารถแปลงรูปภาพเป็น WebP ได้")
    if (blob.size <= 2 * 1024 * 1024) break
    quality -= 0.08
  }

  if (!blob) throw new Error("ไม่สามารถแปลงรูปภาพเป็น WebP ได้")

  return new File([blob], filename, { type: "image/webp" })
}

export interface UseCardScannerOptions {
  onComplete: (images: File[]) => void
}

export function useCardScanner({ onComplete }: UseCardScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [currentStep, setCurrentStep] = useState<ScanStep>("front")
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle")
  const [sharpness, setSharpness] = useState(0)
  const [capturedImages, setCapturedImages] = useState<Record<ScanStep, ScanResult | null>>({
    front: null,
    back: null,
    holo: null,
  })
  const [cameraError, setCameraError] = useState<string | null>(null)

  const sharpnessThreshold = 100

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
    } catch {
      setCameraError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้องหรือใช้รูปจาก Gallery")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  /**
   * Continuously check sharpness from the live video feed
   */
  const checkSharpness = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 320
    canvas.height = 240
    ctx.drawImage(video, 0, 0, 320, 240)
    const imageData = ctx.getImageData(0, 0, 320, 240)
    const variance = computeLaplacianVariance(imageData)
    setSharpness(variance)
  }, [])

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    setScanStatus("scanning")

    // Use full resolution from video
    const captureCanvas = document.createElement("canvas")
    captureCanvas.width = video.videoWidth
    captureCanvas.height = video.videoHeight
    const ctx = captureCanvas.getContext("2d")!
    ctx.drawImage(video, 0, 0)

    // Check sharpness
    setScanStatus("sharpness-check")
    const sharpnessCanvas = document.createElement("canvas")
    sharpnessCanvas.width = 640
    sharpnessCanvas.height = 480
    const sharpCtx = sharpnessCanvas.getContext("2d")!
    sharpCtx.drawImage(captureCanvas, 0, 0, 640, 480)
    const imageData = sharpCtx.getImageData(0, 0, 640, 480)
    const variance = computeLaplacianVariance(imageData)

    if (variance < sharpnessThreshold) {
      setScanStatus("idle")
      return // Image too blurry, stay on current step
    }

    // Auto-crop to frame
    const croppedCanvas = cropToFrame(captureCanvas)
    const filename = `card-${currentStep}-${Date.now()}.webp`
    const file = await canvasToWebPFile(croppedCanvas, filename)
    const preview = URL.createObjectURL(file)

    setCapturedImages((prev) => ({
      ...prev,
      [currentStep]: { file, preview },
    }))
    setScanStatus("captured")
  }, [currentStep])

  const retakePhoto = useCallback((step: ScanStep) => {
    setCapturedImages((prev) => ({
      ...prev,
      [step]: null,
    }))
    setCurrentStep(step)
    setScanStatus("idle")
  }, [])

  const acceptPhoto = useCallback(() => {
    const stepIndex = SCAN_STEPS.indexOf(currentStep)
    if (stepIndex < SCAN_STEPS.length - 1) {
      setCurrentStep(SCAN_STEPS[stepIndex + 1])
      setScanStatus("idle")
    }
  }, [currentStep])

  const allCaptured = SCAN_STEPS.every((step) => capturedImages[step] !== null)

  const complete = useCallback(() => {
    const images = SCAN_STEPS.map((step) => capturedImages[step]!.file)
    onComplete(images)
    stopCamera()
  }, [capturedImages, onComplete, stopCamera])

  /**
   * Handle gallery file selection (fallback)
   */
  const handleGallerySelect = useCallback(
    (files: FileList) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      )
      if (imageFiles.length === 0) return
      onComplete(imageFiles.slice(0, 3))
      stopCamera()
    },
    [onComplete, stopCamera]
  )

  return {
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
    stepLabel: STEP_LABELS[currentStep],
    startCamera,
    stopCamera,
    checkSharpness,
    capturePhoto,
    retakePhoto,
    acceptPhoto,
    complete,
    handleGallerySelect,
  }
}
