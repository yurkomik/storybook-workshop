/* ============================================================================
   ScifiScanline

   Horizontal scan line overlay that sweeps from top to bottom.
   Pure CSS animation — no JS needed.
   ============================================================================ */

import './ScifiUpload.css'

export function ScifiScanline() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="scifi-scanline absolute left-0 h-[2px] w-full"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, oklch(75% 0.15 195 / 0.5) 50%, transparent 100%)',
        }}
      />
    </div>
  )
}
