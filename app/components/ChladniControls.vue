<script setup lang="ts">
import { CONTROL_RANGES, PRESETS } from '~/lib/presets'
import type { AspectMode, ChladniParams, ChladniRenderParams } from '~/types/chladni'

const params = defineModel<ChladniParams>('params', { required: true })
const render = defineModel<ChladniRenderParams>('render', { required: true })
const paused = defineModel<boolean>('paused', { required: true })

const props = defineProps<{
  fps: number
}>()

const emit = defineEmits<{
  scatter: []
}>()

const modeM = fieldModel(params, 'm')
const modeN = fieldModel(params, 'n')
const vibration = fieldModel(params, 'vibration')
const symmetry = fieldModel(params, 'b')
const particleCount = fieldModel(render, 'particleCount')
const trail = fieldModel(render, 'trail')

const isOpen = ref(true)

const aspectModes: readonly { value: AspectMode, label: string }[] = [
  { value: 'stretch', label: 'Stretch' },
  { value: 'square', label: 'Square cells' },
]

const activePresetId = computed(
  () => PRESETS.find(preset =>
    preset.params.m === params.value.m
    && preset.params.n === params.value.n
    && preset.params.b === params.value.b,
  )?.id ?? null,
)

const particleLabel = computed(() => `${Math.round(particleCount.value / 1000)}k`)
const fpsLabel = computed(() => (paused.value ? 'paused' : `${props.fps} fps`))

const applyPreset = (next: Pick<ChladniParams, 'm' | 'n' | 'b'>): void => {
  params.value = { ...params.value, ...next }
}

const setAspectMode = (mode: AspectMode): void => {
  render.value = { ...render.value, aspectMode: mode }
}
</script>

<template>
  <section
    class="panel"
    :class="{ 'panel--collapsed': !isOpen }"
    aria-label="Simulation controls"
  >
    <header class="panel__head">
      <div class="panel__title">
        <h2>Controls</h2>
        <span class="panel__meta">{{ fpsLabel }}</span>
      </div>
      <button
        type="button"
        class="panel__toggle"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        {{ isOpen ? 'Hide' : 'Show' }}
      </button>
    </header>

    <div
      v-show="isOpen"
      class="panel__body"
    >
      <fieldset class="group">
        <legend class="group__legend">
          Vibration
        </legend>

        <BaseSlider
          v-model="modeM"
          label="Frequency m"
          hint="First mode number. Higher means a finer pattern."
          :display="modeM.toFixed(2)"
          v-bind="CONTROL_RANGES.frequency"
        />
        <BaseSlider
          v-model="modeN"
          label="Frequency n"
          hint="Second mode number. Setting it equal to m gives a plain grid."
          :display="modeN.toFixed(2)"
          v-bind="CONTROL_RANGES.frequency"
        />
        <BaseSlider
          v-model="vibration"
          label="Strength"
          hint="How hard the plate is driven. Raise it and the sand goes loose and blurry."
          :display="vibration.toFixed(3)"
          v-bind="CONTROL_RANGES.vibration"
        />
        <BaseSlider
          v-model="symmetry"
          label="Symmetry"
          hint="Blends the two mirrored modes. Negative values flip the pattern family."
          :display="symmetry.toFixed(2)"
          v-bind="CONTROL_RANGES.symmetry"
        />
      </fieldset>

      <fieldset class="group">
        <legend class="group__legend">
          Sand
        </legend>

        <BaseSlider
          v-model="particleCount"
          label="Grains"
          hint="Particle count. The pattern gets denser, the frame rate does not care much."
          :display="particleLabel"
          v-bind="CONTROL_RANGES.particleCount"
        />
        <BaseSlider
          v-model="trail"
          label="Settling"
          hint="How long a grain's trace lingers. Low values look sharp, high values look drifted."
          :display="trail.toFixed(2)"
          v-bind="CONTROL_RANGES.trail"
        />
      </fieldset>

      <fieldset class="group">
        <legend class="group__legend">
          Patterns
        </legend>
        <div class="chips">
          <button
            v-for="preset in PRESETS"
            :key="preset.id"
            type="button"
            class="chip"
            :class="{ 'chip--active': preset.id === activePresetId }"
            :aria-pressed="preset.id === activePresetId"
            @click="applyPreset(preset.params)"
          >
            {{ preset.label }}
          </button>
        </div>
      </fieldset>

      <fieldset class="group">
        <legend class="group__legend">
          Aspect
        </legend>
        <div class="chips">
          <button
            v-for="mode in aspectModes"
            :key="mode.value"
            type="button"
            class="chip"
            :class="{ 'chip--active': mode.value === render.aspectMode }"
            :aria-pressed="mode.value === render.aspectMode"
            @click="setAspectMode(mode.value)"
          >
            {{ mode.label }}
          </button>
        </div>
      </fieldset>

      <div class="actions">
        <button
          type="button"
          class="button"
          @click="paused = !paused"
        >
          {{ paused ? 'Resume' : 'Pause' }}
        </button>
        <button
          type="button"
          class="button button--ghost"
          @click="emit('scatter')"
        >
          Scatter
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  width: 17.5rem;
  max-height: calc(100dvh - 3rem);
  border: 1px solid var(--color-hairline);
  border-radius: 0.75rem;
  background: var(--color-panel);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px -12px rgb(0 0 0 / 0.22);
  overflow: hidden;
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid var(--color-hairline);
}

.panel--collapsed .panel__head {
  border-bottom: none;
}

.panel__title {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}

.panel__title h2 {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink);
}

.panel__meta {
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-muted);
}

.panel__toggle {
  flex-shrink: 0;
  border: none;
  background: none;
  padding: 0.125rem 0.25rem;
  font: inherit;
  font-size: 0.75rem;
  color: var(--color-accent-ink);
  cursor: pointer;
  border-radius: 0.25rem;
}

.panel__toggle:hover {
  background: var(--color-accent-wash);
}

.panel__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.875rem;
  overflow-y: auto;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  border: none;
}

.group__legend {
  padding: 0;
  margin-bottom: 0.125rem;
  font-size: 0.625rem;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.chip {
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  padding: 0.25rem 0.625rem;
  font: inherit;
  font-size: 0.75rem;
  color: var(--color-ink);
  background: transparent;
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease;
}

.chip:hover {
  border-color: var(--color-accent);
}

.chip--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-accent);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.button {
  flex: 1;
  border: 1px solid var(--color-accent);
  border-radius: 0.5rem;
  padding: 0.4375rem 0.75rem;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 550;
  color: var(--color-on-accent);
  background: var(--color-accent);
  cursor: pointer;
  transition: filter 120ms ease;
}

.button:hover {
  filter: brightness(0.94);
}

.button--ghost {
  color: var(--color-ink);
  background: transparent;
  border-color: var(--color-hairline);
}

.button--ghost:hover {
  border-color: var(--color-accent);
  filter: none;
}

@media (max-width: 48rem) {
  .panel {
    width: 100%;
    max-height: 60dvh;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chip,
  .button {
    transition: none;
  }
}
</style>
