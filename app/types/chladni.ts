/**
 * Parameters of the Chladni standing-wave field.
 *
 * The field is the superposition of two vibration modes of a square plate.
 * Sand collects on the *nodal lines*, where the field value is zero.
 */
export interface ChladniParams {
  /** First mode number. Higher values produce a finer pattern. */
  readonly m: number
  /** Second mode number. `m === n` gives a plain grid. */
  readonly n: number
  /** Weight of the first mode. */
  readonly a: number
  /** Weight of the second mode. Flipping its sign gives a different pattern family. */
  readonly b: number
  /** Vibration strength. Scales how far a particle walks per frame. */
  readonly vibration: number
  /** Lower bound on the walk, so particles never freeze in a false node. */
  readonly minWalk: number
}

/**
 * How the unit-square field is mapped onto a non-square canvas.
 * - `stretch`: the square is stretched to fill the canvas; pattern cells become oblong.
 * - `square`: cells stay square and the pattern continues periodically past the edges.
 */
export type AspectMode = 'stretch' | 'square'

/** Parameters of the renderer, as opposed to the physics. */
export interface ChladniRenderParams {
  /** How many of the allocated particles are currently simulated. */
  readonly particleCount: number
  /** Per-frame persistence of the accumulation buffer, `0` (no trail) to `1` (never fades). */
  readonly trail: number
  /** Opacity a single particle adds to the pixel it lands on, 0-255. */
  readonly deposit: number
  readonly aspectMode: AspectMode
}

export interface ChladniInput extends Pick<ChladniParams, 'm' | 'n' | 'a' | 'b'> {
  /** Horizontal field coordinate. `0` and `1` are the plate edges. */
  readonly x: number
  /** Vertical field coordinate. */
  readonly y: number
}

export interface SimulationSize {
  readonly width: number
  readonly height: number
}
