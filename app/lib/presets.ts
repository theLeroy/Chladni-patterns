import type { ChladniParams, ChladniRenderParams } from '~/types/chladni'

export const PARTICLE_RGB = [255, 138, 61] as const satisfies readonly [number, number, number]

/** Hard ceilings the simulation allocates against. */
export const SIMULATION_LIMITS = {
  maxParticles: 160_000,
  /**
   * Roughly a 1440x760 buffer. The accumulation buffer is fully rewritten every
   * frame, so this - not the viewport - is what sets the frame cost.
   */
  maxPixels: 1_100_000,
} as const

export const DEFAULT_PARAMS: ChladniParams = {
  m: 5,
  n: 3,
  a: 1,
  b: 1,
  vibration: 0.018,
  minWalk: 0.0018,
}

export const DEFAULT_RENDER: ChladniRenderParams = {
  particleCount: 60_000,
  trail: 0.86,
  deposit: 46,
  aspectMode: 'stretch',
}

/** Bounds for the controls, kept next to the defaults so they cannot drift apart. */
export const CONTROL_RANGES = {
  frequency: { min: 1, max: 14, step: 0.05 },
  vibration: { min: 0.002, max: 0.06, step: 0.001 },
  particleCount: { min: 2_000, max: SIMULATION_LIMITS.maxParticles, step: 2_000 },
  trail: { min: 0.5, max: 0.98, step: 0.01 },
  symmetry: { min: -1, max: 1, step: 0.05 },
} as const

export interface ChladniPreset {
  readonly id: string
  readonly label: string
  readonly params: Pick<ChladniParams, 'm' | 'n' | 'b'>
}

export const PRESETS: readonly ChladniPreset[] = [
  { id: 'grid', label: 'Grid', params: { m: 6, n: 6, b: 1 } },
  { id: 'lattice', label: 'Lattice', params: { m: 5, n: 3, b: 1 } },
  { id: 'rings', label: 'Rings', params: { m: 4, n: 1, b: -1 } },
  { id: 'weave', label: 'Weave', params: { m: 8.4, n: 3.15, b: -0.6 } },
  { id: 'bloom', label: 'Bloom', params: { m: 11.7, n: 2.35, b: 0.4 } },
]
