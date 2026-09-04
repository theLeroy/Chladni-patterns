<script setup lang="ts">
import { createChladniSimulation, type ChladniSimulation } from '~/lib/chladni'
import { PARTICLE_RGB, SIMULATION_LIMITS } from '~/lib/presets'
import type { ChladniParams, ChladniRenderParams } from '~/types/chladni'

const props = withDefaults(defineProps<{
  params: ChladniParams
  render: ChladniRenderParams
  /** Stops the loop without tearing anything down. */
  paused?: boolean
  /**
   * Changing this value scatters the particles again. A token rather than an
   * exposed method, so the parent stays declarative and never reaches into
   * this component's internals.
   */
  resetToken?: number
}>(), {
  paused: false,
  resetToken: 0,
})

const emit = defineEmits<{
  /** Sampled about twice a second, for the on-screen performance readout. */
  fps: [value: number]
}>()

/** Frames to run up front when motion is reduced, to settle a static pattern. */
const SETTLE_FRAMES = 600
/** Reallocating the pixel buffer is expensive, so coalesce resize bursts. */
const RESIZE_DEBOUNCE_MS = 150

const root = useTemplateRef<HTMLDivElement>('root')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

const reducedMotion = useReducedMotion()
const pageVisible = usePageVisible()

let simulation: ChladniSimulation | null = null
let frameHandle: number | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null

let framesSinceSample = 0
let lastSampleAt = 0

const applySize = (): void => {
  if (simulation === null || root.value === null) return
  const { width, height } = root.value.getBoundingClientRect()
  if (width === 0 || height === 0) return
  simulation.resize({ width, height })
}

const renderFrame = (timestamp: number): void => {
  frameHandle = requestAnimationFrame(renderFrame)
  if (simulation === null) return

  simulation.step(props.params, props.render)
  simulation.draw()

  framesSinceSample++
  const elapsed = timestamp - lastSampleAt
  if (elapsed >= 500) {
    emit('fps', Math.round((framesSinceSample * 1000) / elapsed))
    framesSinceSample = 0
    lastSampleAt = timestamp
  }
}

const stopLoop = (): void => {
  if (frameHandle === null) return
  cancelAnimationFrame(frameHandle)
  frameHandle = null
}

const startLoop = (): void => {
  if (frameHandle !== null || simulation === null) return
  framesSinceSample = 0
  lastSampleAt = performance.now()
  frameHandle = requestAnimationFrame(renderFrame)
}

/** One static, fully-settled pattern for users who asked not to see motion. */
const renderStatic = (): void => {
  if (simulation === null) return
  for (let frame = 0; frame < SETTLE_FRAMES; frame++) {
    simulation.step(props.params, props.render)
  }
  simulation.draw()
  emit('fps', 0)
}

const shouldAnimate = computed(() => !props.paused && pageVisible.value && !reducedMotion.value)

watch(shouldAnimate, (animate) => {
  if (animate) startLoop()
  else stopLoop()
})

watch(reducedMotion, (reduced) => {
  if (reduced) renderStatic()
})

watch(() => props.resetToken, () => {
  simulation?.reset()
  if (reducedMotion.value) renderStatic()
})

// A settled static pattern has to be recomputed when the shape of the field
// changes, because there is no running loop to converge on the new one.
watch(() => [props.params, props.render], () => {
  if (reducedMotion.value) renderStatic()
}, { deep: true })

onMounted(() => {
  if (canvas.value === null) return

  simulation = createChladniSimulation(canvas.value, {
    maxParticles: SIMULATION_LIMITS.maxParticles,
    maxPixels: SIMULATION_LIMITS.maxPixels,
    rgb: PARTICLE_RGB,
  })
  applySize()

  resizeObserver = new ResizeObserver(() => {
    if (resizeTimer !== null) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      applySize()
      if (!shouldAnimate.value) renderStatic()
    }, RESIZE_DEBOUNCE_MS)
  })
  if (root.value !== null) resizeObserver.observe(root.value)

  if (shouldAnimate.value) startLoop()
  else renderStatic()
})

onBeforeUnmount(() => {
  stopLoop()
  resizeObserver?.disconnect()
  if (resizeTimer !== null) clearTimeout(resizeTimer)
  simulation = null
})
</script>

<template>
  <div
    ref="root"
    class="chladni"
    aria-hidden="true"
  >
    <canvas
      ref="canvas"
      class="chladni__canvas"
    />
  </div>
</template>

<style scoped>
.chladni {
  position: fixed;
  inset: 0;
  z-index: 0;
  /* Decoration only: never intercept clicks meant for the page. */
  pointer-events: none;
}

/*
 * The canvas' backing store is smaller than its display size, and the browser
 * upscales it. Sand is high-frequency detail, so the softening is invisible,
 * while the frame cost stays fixed no matter how large the viewport gets.
 */
.chladni__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
