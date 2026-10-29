// @vitest-environment node
import { effectScope } from 'vue'

import { usePhoneLayout } from '@/composables/phoneLayout'

const PORTRAIT = '(max-width: 768px)'
const LANDSCAPE = '(max-height: 500px) and (orientation: landscape)'

const stubMatchMedia = matches => {
  const lists = {}
  globalThis.matchMedia = vi.fn(query => {
    const listeners = []
    lists[query] = {
      matches: Boolean(matches[query]),
      listeners,
      addEventListener: vi.fn((name, listener) => listeners.push(listener)),
      removeEventListener: vi.fn()
    }
    return lists[query]
  })
  return lists
}

const runInScope = () => {
  const scope = effectScope()
  const layout = scope.run(() => usePhoneLayout())
  return { scope, ...layout }
}

describe('composables/phoneLayout', () => {
  afterEach(() => {
    delete globalThis.matchMedia
  })

  test('is false on a desktop', () => {
    stubMatchMedia({})
    const { isPhone, isPhoneLandscape, scope } = runInScope()
    expect(isPhone.value).toBe(false)
    expect(isPhoneLandscape.value).toBe(false)
    scope.stop()
  })

  test('is a phone in portrait', () => {
    stubMatchMedia({ [PORTRAIT]: true })
    const { isPhone, isPhoneLandscape, scope } = runInScope()
    expect(isPhone.value).toBe(true)
    expect(isPhoneLandscape.value).toBe(false)
    scope.stop()
  })

  test('is a phone in landscape', () => {
    stubMatchMedia({ [LANDSCAPE]: true })
    const { isPhone, isPhoneLandscape, scope } = runInScope()
    expect(isPhone.value).toBe(true)
    expect(isPhoneLandscape.value).toBe(true)
    scope.stop()
  })

  test('follows a rotation', () => {
    const lists = stubMatchMedia({ [PORTRAIT]: true })
    const { isPhone, isPhoneLandscape, scope } = runInScope()

    lists[PORTRAIT].matches = false
    lists[PORTRAIT].listeners.forEach(listener => listener({ matches: false }))
    lists[LANDSCAPE].matches = true
    lists[LANDSCAPE].listeners.forEach(listener => listener({ matches: true }))

    expect(isPhone.value).toBe(true)
    expect(isPhoneLandscape.value).toBe(true)
    scope.stop()
  })

  test('stops listening once the scope stops', () => {
    const lists = stubMatchMedia({})
    const { scope } = runInScope()
    scope.stop()
    expect(lists[PORTRAIT].removeEventListener).toHaveBeenCalled()
    expect(lists[LANDSCAPE].removeEventListener).toHaveBeenCalled()
  })

  test('stays false without matchMedia', () => {
    const { isPhone, isPhoneLandscape, scope } = runInScope()
    expect(isPhone.value).toBe(false)
    expect(isPhoneLandscape.value).toBe(false)
    scope.stop()
  })
})
