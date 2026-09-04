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
    class="flex max-h-[calc(100dvh-3rem)] w-[17.5rem] flex-col overflow-hidden rounded-xl border border-hairline bg-panel shadow-panel backdrop-blur-[12px] max-md:max-h-[60dvh] max-md:w-full"
    aria-label="Simulation controls"
  >
    <header
      class="flex items-center justify-between gap-3 px-3.5 py-3"
      :class="isOpen ? 'border-b border-hairline' : ''"
    >
      <div class="flex min-w-0 items-baseline gap-2">
        <h2 class="text-[0.8125rem] font-semibold tracking-[0.04em] text-ink uppercase">
          Controls
        </h2>
        <span class="text-[0.6875rem] text-muted tabular-nums">{{ fpsLabel }}</span>
      </div>
      <button
        type="button"
        class="shrink-0 cursor-pointer rounded border-none bg-transparent px-1 py-0.5 text-xs text-accent-ink hover:bg-accent-wash"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        {{ isOpen ? 'Hide' : 'Show' }}
      </button>
    </header>

    <div
      v-show="isOpen"
      class="flex flex-col gap-4 overflow-y-auto p-3.5"
    >
      <fieldset class="flex flex-col gap-3">
        <legend class="mb-0.5 p-0 text-[0.625rem] font-[650] tracking-[0.08em] text-muted uppercase">
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

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-0.5 p-0 text-[0.625rem] font-[650] tracking-[0.08em] text-muted uppercase">
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

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-0.5 p-0 text-[0.625rem] font-[650] tracking-[0.08em] text-muted uppercase">
          Patterns
        </legend>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in PRESETS"
            :key="preset.id"
            type="button"
            class="cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors duration-[120ms] motion-reduce:transition-none"
            :class="preset.id === activePresetId
              ? 'border-accent bg-accent text-on-accent'
              : 'border-hairline bg-transparent text-ink hover:border-accent'"
            :aria-pressed="preset.id === activePresetId"
            @click="applyPreset(preset.params)"
          >
            {{ preset.label }}
          </button>
        </div>
      </fieldset>

      <fieldset class="flex flex-col gap-3">
        <legend class="mb-0.5 p-0 text-[0.625rem] font-[650] tracking-[0.08em] text-muted uppercase">
          Aspect
        </legend>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="mode in aspectModes"
            :key="mode.value"
            type="button"
            class="cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors duration-[120ms] motion-reduce:transition-none"
            :class="mode.value === render.aspectMode
              ? 'border-accent bg-accent text-on-accent'
              : 'border-hairline bg-transparent text-ink hover:border-accent'"
            :aria-pressed="mode.value === render.aspectMode"
            @click="setAspectMode(mode.value)"
          >
            {{ mode.label }}
          </button>
        </div>
      </fieldset>

      <div class="flex gap-2">
        <button
          type="button"
          class="flex-1 cursor-pointer rounded-lg border border-accent bg-accent px-3 py-[0.4375rem] text-[0.8125rem] font-[550] text-on-accent transition-[filter] duration-[120ms] hover:brightness-[0.94] motion-reduce:transition-none"
          @click="paused = !paused"
        >
          {{ paused ? 'Resume' : 'Pause' }}
        </button>
        <button
          type="button"
          class="flex-1 cursor-pointer rounded-lg border border-hairline bg-transparent px-3 py-[0.4375rem] text-[0.8125rem] font-[550] text-ink transition-colors duration-[120ms] hover:border-accent motion-reduce:transition-none"
          @click="emit('scatter')"
        >
          Scatter
        </button>
      </div>
    </div>
  </section>
</template>
