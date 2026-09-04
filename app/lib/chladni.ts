import type {
  ChladniInput,
  ChladniParams,
  ChladniRenderParams,
  SimulationSize,
} from '~/types/chladni'

/**
 * Closed-form solution for the standing wave on a square plate, as a
 * superposition of two modes. Returns a value in `[-(|a| + |b|), |a| + |b|]`;
 * zeroes are the nodal lines where sand comes to rest.
 *
 * Positional arguments are deliberate: this runs once per particle per frame,
 * so it must not allocate. Use `chladniValue` for a readable call site.
 */
const chladniAt = (x: number, y: number, m: number, n: number, a: number, b: number): number =>
  a * Math.sin(Math.PI * n * x) * Math.sin(Math.PI * m * y)
  + b * Math.sin(Math.PI * m * x) * Math.sin(Math.PI * n * y)

/** Object-argument form of {@link chladniAt}, for tests and one-off sampling. */
export const chladniValue = (input: ChladniInput): number =>
  chladniAt(input.x, input.y, input.m, input.n, input.a, input.b)

export interface ChladniSimulationOptions {
  /** Upper bound on allocated particles. Buffers are sized once, at this count. */
  readonly maxParticles: number
  /**
   * Upper bound on simulated pixels. The accumulation buffer is scaled down to
   * respect this, then upscaled by CSS, which keeps the cost of a full-screen
   * background independent of the viewport size.
   */
  readonly maxPixels: number
  /** Particle colour as an `[r, g, b]` triple. */
  readonly rgb: readonly [number, number, number]
}

export interface ChladniSimulation {
  /** Buffer dimensions in pixels, which are not the canvas' CSS dimensions. */
  readonly size: () => SimulationSize
  /** (Re)allocate the accumulation buffer for a canvas of this CSS size. */
  readonly resize: (size: SimulationSize) => void
  /** Scatter every particle uniformly and wipe the accumulation buffer. */
  readonly reset: () => void
  /** Advance the random walk by one frame and deposit particles into the buffer. */
  readonly step: (params: ChladniParams, render: ChladniRenderParams) => void
  /** Blit the accumulation buffer to the canvas. */
  readonly draw: () => void
}

/**
 * Creates the simulation for one canvas.
 *
 * The accumulation buffer holds a constant RGB (the particle colour) and varies
 * only the alpha channel, so "how much sand is here" is a single number per
 * pixel and fading is one multiply per pixel. Everywhere alpha is zero the
 * canvas is transparent and the page background shows through, which is why the
 * plate colour is CSS and not something we ever have to blend by hand.
 *
 * The particle and pixel buffers are mutated in place. That is confined to this
 * factory on purpose: allocating per frame at these counts would guarantee
 * garbage-collection stutter.
 */
export const createChladniSimulation = (
  canvas: HTMLCanvasElement,
  options: ChladniSimulationOptions,
): ChladniSimulation => {
  const context = canvas.getContext('2d', { alpha: true })
  if (context === null) throw new Error('Canvas 2D context unavailable')

  const [red, green, blue] = options.rgb

  const xs = new Float32Array(options.maxParticles)
  const ys = new Float32Array(options.maxParticles)

  let image: ImageData | null = null
  let pixels: Uint8ClampedArray | null = null
  let width = 0
  let height = 0

  const scatter = (): void => {
    for (let i = 0; i < options.maxParticles; i++) {
      xs[i] = Math.random()
      ys[i] = Math.random()
    }
  }

  scatter()

  const resize = ({ width: cssWidth, height: cssHeight }: SimulationSize): void => {
    const area = Math.max(1, cssWidth * cssHeight)
    const scale = Math.min(1, Math.sqrt(options.maxPixels / area))

    width = Math.max(1, Math.floor(cssWidth * scale))
    height = Math.max(1, Math.floor(cssHeight * scale))

    canvas.width = width
    canvas.height = height

    image = context.createImageData(width, height)
    pixels = image.data

    // RGB is written once and never touched again; only alpha changes per frame.
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = red
      pixels[i + 1] = green
      pixels[i + 2] = blue
    }
  }

  const reset = (): void => {
    scatter()
    if (pixels === null) return
    for (let i = 3; i < pixels.length; i += 4) pixels[i] = 0
  }

  const step = (params: ChladniParams, render: ChladniRenderParams): void => {
    const data = pixels
    if (data === null) return

    const { m, n, a, b, vibration, minWalk } = params
    const { particleCount, trail, deposit, aspectMode } = render

    // Fade what is already deposited. Truncating instead of rounding matters:
    // a Uint8ClampedArray rounds on write, so `3 * 0.94` would round back to 3
    // and the faintest trails would never reach zero.
    for (let i = 3; i < data.length; i += 4) data[i] = (data[i]! * trail) | 0

    // Keeping pattern cells square means covering more than one unit of field
    // along the longer axis; the sine terms simply continue past the edge.
    const squareX = width >= height ? width / height : 1
    const squareY = height > width ? height / width : 1
    const fieldX = aspectMode === 'square' ? squareX : 1
    const fieldY = aspectMode === 'square' ? squareY : 1

    const maxX = width - 1
    const maxY = height - 1
    const count = Math.min(particleCount, options.maxParticles)

    for (let i = 0; i < count; i++) {
      let x = xs[i]!
      let y = ys[i]!

      // The whole trick: step length is proportional to the local vibration
      // amplitude. Particles far from a node get thrown around; particles on a
      // node barely move, so they pile up there. `minWalk` keeps the ones that
      // land in a shallow minimum from freezing on the spot.
      const amplitude = Math.abs(chladniAt(x * fieldX, y * fieldY, m, n, a, b))
      const walk = Math.max(minWalk, vibration * amplitude)

      x += (Math.random() * 2 - 1) * walk
      y += (Math.random() * 2 - 1) * walk

      // Reflect off the edges rather than clamping to them. Clamping pins every
      // overshooting particle to the exact boundary and builds up a rim that is
      // an artefact of the arithmetic rather than of the physics.
      if (x < 0) x = -x
      else if (x > 1) x = 2 - x
      if (y < 0) y = -y
      else if (y > 1) y = 2 - y

      xs[i] = x
      ys[i] = y

      const alpha = (((y * maxY) | 0) * width + ((x * maxX) | 0)) * 4 + 3
      data[alpha] = data[alpha]! + deposit
    }
  }

  const draw = (): void => {
    if (image !== null) context.putImageData(image, 0, 0)
  }

  return {
    size: () => ({ width, height }),
    resize,
    reset,
    step,
    draw,
  }
}
