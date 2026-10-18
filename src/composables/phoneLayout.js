import { onScopeDispose, ref } from 'vue'

const PORTRAIT_QUERY = '(max-width: 768px)'
// a landscape phone is wider than 768px, up to 932px for the large ones:
// its short height tells it apart from a tablet
const LANDSCAPE_QUERY = '(max-height: 500px) and (orientation: landscape)'

export const usePhoneLayout = () => {
  const isPhone = ref(false)
  const isPhoneLandscape = ref(false)

  const portraitQuery = globalThis.matchMedia?.(PORTRAIT_QUERY)
  const landscapeQuery = globalThis.matchMedia?.(LANDSCAPE_QUERY)

  const update = () => {
    isPhoneLandscape.value = Boolean(landscapeQuery?.matches)
    isPhone.value = Boolean(portraitQuery?.matches) || isPhoneLandscape.value
  }

  update()
  portraitQuery?.addEventListener?.('change', update)
  landscapeQuery?.addEventListener?.('change', update)

  onScopeDispose(() => {
    portraitQuery?.removeEventListener?.('change', update)
    landscapeQuery?.removeEventListener?.('change', update)
  })

  return { isPhone, isPhoneLandscape }
}
