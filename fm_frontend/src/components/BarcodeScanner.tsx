import { useEffect, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    const reader = new BrowserMultiFormatReader()
    let stopped = false

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result, _err, controls) => {
          if (result && !stopped) {
            stopped = true
            controls.stop()
            onScan(result.getText())
          }
        },
      )
      .catch(() => {
        // Camera access denied or unavailable
      })

    return () => {
      stopped = true
      BrowserMultiFormatReader.releaseAllStreams()
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 pt-safe pt-4">
        <p className="text-white text-sm font-medium">Scan barcode</p>
        <button
          onClick={onClose}
          className="text-white text-sm px-3 py-1.5 rounded border border-white/40 hover:bg-white/10"
        >
          Cancel
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden mt-4">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Dimmed overlay with a clear window in the centre */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-72 h-36 rounded-lg border-2 border-white shadow-lg" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }} />
        </div>
      </div>

      <p className="text-white/60 text-xs text-center py-4">
        Center the barcode in the frame
      </p>
    </div>
  )
}
