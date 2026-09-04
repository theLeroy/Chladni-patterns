/**
 * Tracks whether the page is currently visible, so an animated background can
 * stop burning frames in a backgrounded tab.
 */
export const usePageVisible = (): Readonly<Ref<boolean>> => {
  const visible = ref(true)

  const handleChange = (): void => {
    visible.value = document.visibilityState === 'visible'
  }

  onMounted(() => {
    handleChange()
    document.addEventListener('visibilitychange', handleChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleChange)
  })

  return readonly(visible)
}
