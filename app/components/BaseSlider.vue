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
  <div class="slider">
    <div class="slider__head">
      <label
        :for="inputId"
        class="slider__label"
      >{{ label }}</label>
      <output
        :for="inputId"
        class="slider__value"
      >{{ display }}</output>
    </div>

    <input
      :id="inputId"
      v-model.number="model"
      class="slider__input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :aria-describedby="hint ? hintId : undefined"
    >

    <p
      v-if="hint"
      :id="hintId"
      class="slider__hint"
    >
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
.slider {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.slider__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.slider__label {
  font-size: 0.8125rem;
  font-weight: 550;
  letter-spacing: 0.01em;
  color: var(--color-ink);
}

.slider__value {
  font-variant-numeric: tabular-nums;
  font-size: 0.75rem;
  color: var(--color-accent-ink);
  background: var(--color-accent-wash);
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
}

.slider__hint {
  margin: 0;
  font-size: 0.6875rem;
  line-height: 1.4;
  color: var(--color-muted);
}

.slider__input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 1.25rem;
  background: transparent;
  cursor: grab;
}

.slider__input:active {
  cursor: grabbing;
}

.slider__input::-webkit-slider-runnable-track {
  height: 0.25rem;
  border-radius: 999px;
  background: var(--color-track);
}

.slider__input::-moz-range-track {
  height: 0.25rem;
  border-radius: 999px;
  background: var(--color-track);
}

.slider__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0.875rem;
  height: 0.875rem;
  margin-top: -0.3125rem;
  border: none;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
  transition: transform 120ms ease;
}

.slider__input::-moz-range-thumb {
  width: 0.875rem;
  height: 0.875rem;
  border: none;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
  transition: transform 120ms ease;
}

.slider__input:hover::-webkit-slider-thumb,
.slider__input:active::-webkit-slider-thumb {
  transform: scale(1.15);
}

.slider__input:hover::-moz-range-thumb,
.slider__input:active::-moz-range-thumb {
  transform: scale(1.15);
}

.slider__input:focus-visible {
  outline: none;
}

.slider__input:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px var(--color-accent-wash);
}

.slider__input:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 3px var(--color-accent-wash);
}

@media (prefers-reduced-motion: reduce) {
  .slider__input::-webkit-slider-thumb,
  .slider__input::-moz-range-thumb {
    transition: none;
  }
}
</style>
