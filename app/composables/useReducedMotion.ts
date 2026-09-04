/**
 * Tracks the `prefers-reduced-motion` media query.
 *
 * SSR-safe: the query is only read after mount, so the server renders the
 * "motion allowed" default and the client corrects it immediately.
 */
export const useReducedMotion = (): Readonly<Ref<boolean>> => {
  const reduced = ref(false)
  let query: MediaQueryList | null = null

  const handleChange = (event: MediaQueryListEvent): void => {
    reduced.value = event.matches
  }

  onMounted(() => {
    query = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = query.matches
    query.addEventListener('change', handleChange)
  })

  onBeforeUnmount(() => {
    query?.removeEventListener('change', handleChange)
  })

  return readonly(reduced)
}
