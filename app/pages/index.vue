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

    <main class="relative z-[1] px-6">
      <section class="mx-auto px-[5svw] h-screen flex flex-col justify-center items-center text-center text-[2.2svw] gap-2 text-ink-slightly-muted font-bold">
        <h3
          class="fade-in-up"
          style="animation-delay: 1s;"
        >
          Sometimes the frequencies just matches
        </h3>
        <h3
          class="fade-in-up"
          style="animation-delay: 2.5s;"
        >
          so beautiful patterns emerge.
        </h3>
      </section>
      <section class="flex min-h-dvh max-w-[46rem] items-center">
        <!--
          The grain is high-frequency detail and text sitting directly on it is
          tiring to read. A translucent, blurred plate keeps the pattern visible
          behind the words without competing with them.
        -->
        <article
          class="rounded-2xl border border-hairline bg-panel p-[clamp(1.5rem,4vw,2.75rem)] shadow-card backdrop-blur-[16px] backdrop-saturate-[1.1]"
        >
          <h3 class="text-[1.17em] font-bold">
            sometimes the frequency just matches
          </h3>
          <p class="text-[0.6875rem] font-[650] tracking-[0.14em] text-accent-ink uppercase">
            Standing waves
          </p>
          <h1 class="mt-2 text-[clamp(2.25rem,7vw,4rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            Chladni patterns
          </h1>
          <p class="mt-5 max-w-[34rem] text-[clamp(1rem,2vw,1.1875rem)] text-ink">
            Drive a metal plate at the right frequency and the sand on top of it stops
            moving randomly. It drains off the parts that vibrate and settles along the
            nodal lines, where the plate is standing still. Every grain behind this text
            is doing exactly that, sixty times a second.
          </p>
          <p class="mt-4 max-w-[34rem] text-[0.9375rem] text-muted">
            Drag the frequency sliders and watch the figure reorganise itself. Nothing
            here is drawn: there is no path, no shape and no image. There are sixty
            thousand particles taking random steps, and the only rule is that a grain
            steps further when the plate under it is moving more.
          </p>
        </article>
      </section>

      <section class="flex max-w-[46rem] items-center pb-24 max-md:pb-[60dvh]">
        <article
          class="max-w-xl rounded-2xl border border-hairline bg-panel p-[clamp(1.5rem,4vw,2.75rem)] shadow-card backdrop-blur-[16px] backdrop-saturate-[1.1]"
        >
          <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold tracking-[-0.02em]">
            How it works
          </h2>
          <p class="mt-4 max-w-[34rem] text-[0.9375rem] text-muted">
            The plate's displacement at any point is the sum of two vibration modes,
            which has a closed form for a square plate:
          </p>
          <pre
            class="mt-4 overflow-x-auto rounded-r-md border-l-2 border-accent bg-ink/4 px-4 py-3.5 font-mono text-[0.8125rem] leading-normal text-ink"
          ><code>f(x, y) = a · sin(πnx) · sin(πmy)
        + b · sin(πmx) · sin(πny)</code></pre>
          <p class="mt-4 max-w-[34rem] text-[0.9375rem] text-muted">
            Sand comes to rest where <code class="inline-code">f</code> is zero. Rather than
            solve for those curves, each particle takes a random step whose length is
            proportional to <code class="inline-code">|f|</code> at its own position. Grains
            over a violently vibrating region get thrown around and never settle; grains
            that wander onto a nodal line have almost nowhere left to go, so they stay.
            The pattern is not computed, it accumulates.
          </p>
          <p class="mt-4 max-w-[34rem] text-[0.9375rem] text-muted">
            The <strong>Frequency</strong> sliders are <code class="inline-code">m</code> and
            <code class="inline-code">n</code> above, and <strong>Strength</strong> is how hard
            the plate is driven. Fractional frequencies are not physically reachable on a
            real plate, which is precisely why they look the way they do.
          </p>
        </article>
      </section>
    </main>

    <div class="fixed top-6 right-6 z-[2] max-md:inset-x-0 max-md:top-auto max-md:bottom-0">
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
.fade-in-up {
  animation-name: fade-in-up;
  animation-duration: 2s;
  animation-timing-function: ease-in-out;
  animation-fill-mode: forwards;
  opacity: 0;
  transform: translateY(100px);
  filter: blur(200px);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(100px);
    filter: blur(200px);
  }
  to {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0);
  }
}
</style>
