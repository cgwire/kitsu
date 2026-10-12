import WrongBrowser from '@/components/pages/WrongBrowser.vue'

import { mountWithI18n } from '../fixtures/i18n'

const mountPage = () => mountWithI18n(WrongBrowser)

const setUserAgent = value =>
  Object.defineProperty(window.navigator, 'userAgent', {
    value,
    configurable: true
  })

describe('pages/WrongBrowser', () => {
  const originalUserAgent = window.navigator.userAgent

  afterEach(() => {
    setUserAgent(originalUserAgent)
  })

  test('names the detected browser and its major version', () => {
    setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
    )
    const text = mountPage().find('p').text()
    expect(text).toContain('Your browser (Chrome 90) is too old')
    expect(text).toContain('please update it')
  })

  test('falls back to the generic unknown label on an exotic user agent', () => {
    setUserAgent('Some exotic robot')
    expect(mountPage().find('p').text()).toContain(
      'Your browser (Unknown) is too old'
    )
  })
})
