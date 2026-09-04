<script setup lang="ts">
const model = defineModel<number>({ required: true })

defineProps<{
  label: string
  min: number
  max: number
  step: number
  /** The value as the user should read it, e.g. `"5.20"` or `"60k"`. */
  display: string
  /** Optional one-line explanation of what the control does. */
  hint?: string
}>()

const inputId = useId()
const hintId = useId()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-baseline justify-between gap-3">
      <label
        :for="inputId"
        class="text-[0.8125rem] font-[550] tracking-[0.01em] text-ink"
      >{{ label }}</label>
      <output
        :for="inputId"
        class="rounded bg-accent-wash px-1.5 py-px text-xs text-accent-ink tabular-nums"
      >{{ display }}</output>
    </div>

    <input
      :id="inputId"
      v-model.number="model"
      class="chladni-slider h-5 w-full cursor-grab appearance-none bg-transparent focus-visible:outline-none active:cursor-grabbing"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :aria-describedby="hint ? hintId : undefined"
    >

    <p
      v-if="hint"
      :id="hintId"
      class="text-[0.6875rem] leading-[1.4] text-muted"
    >
      {{ hint }}
    </p>
  </div>
</template>
