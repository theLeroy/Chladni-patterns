<script setup lang="ts">
import { DEFAULT_PARAMS, DEFAULT_RENDER } from '~/lib/presets'
import type { ChladniParams, ChladniRenderParams } from '~/types/chladni'

const params = ref<ChladniParams>(DEFAULT_PARAMS)
const render = ref<ChladniRenderParams>(DEFAULT_RENDER)
const paused = ref(false)
const fps = ref(0)
const resetToken = ref(0)

const scatter = (): void => {
  resetToken.value++
}

useHead({
  title: 'Chladni patterns — an animated sand background',
  meta: [
    {
      name: 'description',
      content:
        'A Chladni pattern sand simulation running as a live website background, '
        + 'with controls for the vibration frequency.',
    },
  ],
})
</script>

<template>
  <div>
    <ChladniBackground
      :params="params"
      :render="render"
      :paused="paused"
      :reset-token="resetToken"
      @fps="fps = $event"
    />

    <main class="page">
      <section class="hero">
        <article class="card">
          <p class="eyebrow">
            Standing waves
          </p>
          <h1 class="title">
            Chladni patterns
          </h1>
          <p class="lede">
            Drive a metal plate at the right frequency and the sand on top of it stops
            moving randomly. It drains off the parts that vibrate and settles along the
            nodal lines, where the plate is standing still. Every grain behind this text
            is doing exactly that, sixty times a second.
          </p>
          <p class="body">
            Drag the frequency sliders and watch the figure reorganise itself. Nothing
            here is drawn: there is no path, no shape and no image. There are sixty
            thousand particles taking random steps, and the only rule is that a grain
            steps further when the plate under it is moving more.
          </p>
        </article>
      </section>

      <section class="hero hero--secondary">
        <article class="card card--narrow">
          <h2 class="subtitle">
            How it works
          </h2>
          <p class="body">
            The plate's displacement at any point is the sum of two vibration modes,
            which has a closed form for a square plate:
          </p>
          <pre class="formula"><code>f(x, y) = a · sin(πnx) · sin(πmy)
        + b · sin(πmx) · sin(πny)</code></pre>
          <p class="body">
            Sand comes to rest where <code class="inline">f</code> is zero. Rather than
            solve for those curves, each particle takes a random step whose length is
            proportional to <code class="inline">|f|</code> at its own position. Grains
            over a violently vibrating region get thrown around and never settle; grains
            that wander onto a nodal line have almost nowhere left to go, so they stay.
            The pattern is not computed, it accumulates.
          </p>
          <p class="body">
            The <strong>Frequency</strong> sliders are <code class="inline">m</code> and
            <code class="inline">n</code> above, and <strong>Strength</strong> is how hard
            the plate is driven. Fractional frequencies are not physically reachable on a
            real plate, which is precisely why they look the way they do.
          </p>
        </article>
      </section>
    </main>

    <div class="dock">
      <ChladniControls
        v-model:params="params"
        v-model:render="render"
        v-model:paused="paused"
        :fps="fps"
        @scatter="scatter"
      />
    </div>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  z-index: 1;
  padding: 0 1.5rem;
}

.hero {
  display: flex;
  align-items: center;
  min-height: 100dvh;
  max-width: 46rem;
}

.hero--secondary {
  min-height: auto;
  padding-bottom: 6rem;
}

/*
 * The grain is high-frequency detail and text sitting directly on it is tiring
 * to read. A translucent, blurred plate keeps the pattern visible behind the
 * words without competing with them.
 */
.card {
  padding: clamp(1.5rem, 4vw, 2.75rem);
  border: 1px solid var(--color-hairline);
  border-radius: 1rem;
  background: var(--color-panel);
  backdrop-filter: blur(16px) saturate(1.1);
  box-shadow: 0 24px 48px -32px rgb(0 0 0 / 0.35);
}

.card--narrow {
  max-width: 36rem;
}

.eyebrow {
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent-ink);
}

.title {
  margin-top: 0.5rem;
  font-size: clamp(2.25rem, 7vw, 4rem);
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -0.03em;
}

.subtitle {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.lede {
  margin-top: 1.25rem;
  font-size: clamp(1rem, 2vw, 1.1875rem);
  color: var(--color-ink);
  max-width: 34rem;
}

.body {
  margin-top: 1rem;
  font-size: 0.9375rem;
  color: var(--color-muted);
  max-width: 34rem;
}

.formula {
  margin: 1rem 0 0;
  padding: 0.875rem 1rem;
  overflow-x: auto;
  border-left: 2px solid var(--color-accent);
  border-radius: 0 0.375rem 0.375rem 0;
  background: rgb(26 26 25 / 0.04);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-ink);
}

.inline {
  padding: 0.0625rem 0.25rem;
  border-radius: 0.1875rem;
  background: var(--color-accent-wash);
  font-family: var(--font-mono);
  font-size: 0.875em;
  color: var(--color-accent-ink);
}

.dock {
  position: fixed;
  z-index: 2;
  top: 1.5rem;
  right: 1.5rem;
}

@media (max-width: 48rem) {
  .dock {
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .hero--secondary {
    padding-bottom: 60dvh;
  }
}
</style>
