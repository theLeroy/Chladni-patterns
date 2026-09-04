import type { Ref, WritableComputedRef } from 'vue'

/**
 * Exposes one key of an object-shaped ref as its own writable ref.
 *
 * Writing through it replaces the whole object instead of mutating it, so the
 * source stays effectively immutable and `watch` sees a genuinely new value,
 * while call sites still get a plain `v-model` target.
 */
export const fieldModel = <T extends object, K extends keyof T>(
  source: Ref<T>,
  key: K,
): WritableComputedRef<T[K]> =>
  computed({
    get: () => source.value[key],
    set: (value) => {
      source.value = { ...source.value, [key]: value }
    },
  })
