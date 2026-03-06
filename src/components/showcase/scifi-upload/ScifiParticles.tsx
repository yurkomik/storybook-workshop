/* ============================================================================
   ScifiParticles

   CSS-only floating particle grid. Each particle gets staggered
   animation-delay and random-ish drift via CSS custom properties.
   ============================================================================ */

import './ScifiUpload.css'

interface ScifiParticlesProps {
  /** Number of particles. Defaults to 20. */
  count?: number
}

export function ScifiParticles({ count = 20 }: ScifiParticlesProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="scifi-particle"
          style={{
            left: `${(i * 37 + 13) % 100}%`,
            bottom: `${(i * 23 + 7) % 40}%`,
            '--particle-delay': `${(i * 0.3) % 4}s`,
            '--particle-duration': `${3 + (i % 3)}s`,
            '--particle-drift': `${((i % 5) - 2) * 8}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
