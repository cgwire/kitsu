// Composable has module-level state; each test re-imports via `vi.resetModules()`
// for a clean baseline. Listeners re-register on each import; orphans read
// disposed state but are harmless (bounded per test, isolated per file).
const loadComposable = async () => {
  vi.resetModules()
  const { useDesktopNotifications } = await import(
    '@/composables/desktopNotifications'
  )
  return useDesktopNotifications()
}

const setupNotification = (permission = 'default') => {
  const NotificationMock = vi.fn(function (title, options) {
    this.title = title
    this.options = options
    this.close = vi.fn()
    this.onclick = null
  })
  NotificationMock.permission = permission
  NotificationMock.requestPermission = vi.fn(async () => permission)
  Object.defineProperty(window, 'Notification', {
    value: NotificationMock,
    writable: true,
    configurable: true
  })
  return NotificationMock
}

describe('composables/desktopNotifications', () => {
  beforeEach(() => {
    localStorage.clear()
    delete window.Notification
  })

  it('reports unsupported when window.Notification is missing', async () => {
    const { isSupported, isActive, shouldShowBanner } = await loadComposable()
    expect(isSupported).toBe(false)
    expect(isActive.value).toBe(false)
    expect(shouldShowBanner.value).toBe(false)
  })

  it('initializes permission from window.Notification.permission', async () => {
    setupNotification('granted')
    const { isSupported, permission } = await loadComposable()
    expect(isSupported).toBe(true)
    expect(permission.value).toBe('granted')
  })

  it('shouldShowBanner is true when supported and not granted', async () => {
    setupNotification('default')
    const { shouldShowBanner } = await loadComposable()
    expect(shouldShowBanner.value).toBe(true)
  })

  it('respects persisted dismiss flag for the current permission', async () => {
    setupNotification('default')
    localStorage.setItem(
      'desktop-notifications:banner-dismissed-default',
      'true'
    )
    const { shouldShowBanner } = await loadComposable()
    expect(shouldShowBanner.value).toBe(false)
  })

  it('dismissBanner persists under the per-permission key and hides the banner', async () => {
    setupNotification('default')
    const { shouldShowBanner, dismissBanner } = await loadComposable()
    expect(shouldShowBanner.value).toBe(true)
    dismissBanner()
    expect(shouldShowBanner.value).toBe(false)
    expect(
      localStorage.getItem('desktop-notifications:banner-dismissed-default')
    ).toBe('true')
  })

  // The blocked banner must not be suppressed by a previous "Plus tard" the
  // user did while permission was still 'default'.
  it('default dismiss does not suppress the blocked banner on reload', async () => {
    setupNotification('denied')
    localStorage.setItem(
      'desktop-notifications:banner-dismissed-default',
      'true'
    )
    const { shouldShowBanner } = await loadComposable()
    expect(shouldShowBanner.value).toBe(true)
  })

  describe('setPreferenceEnabled', () => {
    it('requests permission, activates when granted, and signals transition', async () => {
      const NotificationMock = setupNotification('default')
      NotificationMock.requestPermission.mockResolvedValue('granted')
      const { setPreferenceEnabled, isActive, preferenceEnabled } =
        await loadComposable()
      const becameActive = await setPreferenceEnabled(true)
      expect(NotificationMock.requestPermission).toHaveBeenCalledTimes(1)
      expect(preferenceEnabled.value).toBe(true)
      expect(isActive.value).toBe(true)
      expect(becameActive).toBe(true)
      expect(localStorage.getItem('desktop-notifications:enabled')).toBe('true')
    })

    it('does not enable preference when permission is denied', async () => {
      const NotificationMock = setupNotification('default')
      NotificationMock.requestPermission.mockResolvedValue('denied')
      const { setPreferenceEnabled, preferenceEnabled, isActive } =
        await loadComposable()
      const becameActive = await setPreferenceEnabled(true)
      expect(preferenceEnabled.value).toBe(false)
      expect(isActive.value).toBe(false)
      expect(becameActive).toBe(false)
    })

    it('disables preference and reports no transition', async () => {
      setupNotification('granted')
      localStorage.setItem('desktop-notifications:enabled', 'true')
      const { setPreferenceEnabled, preferenceEnabled, isActive } =
        await loadComposable()
      expect(isActive.value).toBe(true)
      const becameActive = await setPreferenceEnabled(false)
      expect(preferenceEnabled.value).toBe(false)
      expect(isActive.value).toBe(false)
      expect(becameActive).toBe(false)
      expect(localStorage.getItem('desktop-notifications:enabled')).toBe(
        'false'
      )
    })

    it('does nothing when unsupported', async () => {
      const { setPreferenceEnabled, preferenceEnabled } =
        await loadComposable()
      const becameActive = await setPreferenceEnabled(true)
      expect(preferenceEnabled.value).toBe(false)
      expect(becameActive).toBe(false)
    })

    it('does not re-request permission when already denied', async () => {
      const NotificationMock = setupNotification('denied')
      const { setPreferenceEnabled, preferenceEnabled, isActive } =
        await loadComposable()
      const becameActive = await setPreferenceEnabled(true)
      expect(NotificationMock.requestPermission).not.toHaveBeenCalled()
      expect(preferenceEnabled.value).toBe(false)
      expect(isActive.value).toBe(false)
      expect(becameActive).toBe(false)
    })

    it('times out requestPermission after 30 seconds', async () => {
      const NotificationMock = setupNotification('default')
      // Resolves long after the 30s composable timeout, so the race must reject on timeout.
      NotificationMock.requestPermission.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('granted'), 60000))
      )
      const { setPreferenceEnabled } = await loadComposable()
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      // Install fake timers only once the module is loaded so the async import isn't run against fake timers.
      vi.useFakeTimers()
      try {
        const promise = setPreferenceEnabled(true)
        await vi.advanceTimersByTimeAsync(30000)
        await promise
        expect(errSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('timeout')
          })
        )
      } finally {
        vi.useRealTimers()
        errSpy.mockRestore()
      }
    })

    it('fires confirmationPayload as a one-shot notification when opt-in activates', async () => {
      const NotificationMock = setupNotification('default')
      NotificationMock.requestPermission.mockResolvedValue('granted')
      const { setPreferenceEnabled } = await loadComposable()
      await setPreferenceEnabled(true, { title: 'Confirmed', body: 'ok' })
      expect(NotificationMock).toHaveBeenCalledWith(
        'Confirmed',
        expect.objectContaining({ body: 'ok' })
      )
    })

    it('does not fire confirmationPayload outside an opt-in transition', async () => {
      setupNotification('granted')
      localStorage.setItem('desktop-notifications:enabled', 'true')
      const NotificationMock = window.Notification
      const { setPreferenceEnabled } = await loadComposable()
      // No-op opt-in (already active) — no confirmation.
      await setPreferenceEnabled(true, { title: 'should not fire' })
      expect(NotificationMock).not.toHaveBeenCalled()
      // Opt-out (active → inactive) — no confirmation either.
      await setPreferenceEnabled(false, { title: 'should not fire' })
      expect(NotificationMock).not.toHaveBeenCalled()
    })
  })

  describe('showNotification', () => {
    it('returns null when guards reject (inactive or missing title)', async () => {
      setupNotification('default')
      let { showNotification } = await loadComposable()
      expect(showNotification({ title: 'hi' })).toBeNull()

      setupNotification('granted')
      localStorage.setItem('desktop-notifications:enabled', 'true')
      ;({ showNotification } = await loadComposable())
      expect(showNotification({})).toBeNull()
    })

    it('constructs a Notification when active', async () => {
      const NotificationMock = setupNotification('granted')
      localStorage.setItem('desktop-notifications:enabled', 'true')
      const { showNotification } = await loadComposable()
      const notification = showNotification({
        title: 'hi',
        body: 'body',
        icon: '/icon.png',
        tag: 'tag-1'
      })
      expect(NotificationMock).toHaveBeenCalledWith('hi', {
        body: 'body',
        icon: '/icon.png',
        tag: 'tag-1'
      })
      expect(notification).not.toBeNull()
    })

    it('wires onclick to call callback, focus, and close', async () => {
      setupNotification('granted')
      localStorage.setItem('desktop-notifications:enabled', 'true')
      const focusSpy = vi.spyOn(window, 'focus').mockImplementation(() => {})
      const onClick = vi.fn()
      const { showNotification } = await loadComposable()
      const notification = showNotification({ title: 'hi', onClick })
      const event = { preventDefault: vi.fn() }
      notification.onclick(event)
      expect(event.preventDefault).toHaveBeenCalled()
      expect(focusSpy).toHaveBeenCalled()
      expect(onClick).toHaveBeenCalled()
      expect(notification.close).toHaveBeenCalled()
      focusSpy.mockRestore()
    })

    it('swallows Notification constructor errors', async () => {
      const NotificationMock = setupNotification('granted')
      NotificationMock.mockImplementationOnce(function () {
        throw new Error('boom')
      })
      localStorage.setItem('desktop-notifications:enabled', 'true')
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { showNotification } = await loadComposable()
      expect(showNotification({ title: 'hi' })).toBeNull()
      expect(errSpy).toHaveBeenCalled()
      errSpy.mockRestore()
    })
  })

  describe('permission resync', () => {
    it('updates permission on visibilitychange', async () => {
      const NotificationMock = setupNotification('granted')
      const { permission } = await loadComposable()
      expect(permission.value).toBe('granted')
      NotificationMock.permission = 'denied'
      document.dispatchEvent(new Event('visibilitychange'))
      expect(permission.value).toBe('denied')
    })

    it('resurfaces banner when permission becomes non-granted again', async () => {
      const NotificationMock = setupNotification('granted')
      const { shouldShowBanner, dismissBanner } = await loadComposable()
      expect(shouldShowBanner.value).toBe(false)
      dismissBanner()
      NotificationMock.permission = 'denied'
      document.dispatchEvent(new Event('visibilitychange'))
      expect(shouldShowBanner.value).toBe(true)
    })

    it('clears the stored preference when permission is downgraded', async () => {
      const NotificationMock = setupNotification('granted')
      localStorage.setItem('desktop-notifications:enabled', 'true')
      const { isActive, preferenceEnabled } = await loadComposable()
      expect(isActive.value).toBe(true)
      NotificationMock.permission = 'denied'
      document.dispatchEvent(new Event('visibilitychange'))
      expect(preferenceEnabled.value).toBe(false)
      expect(localStorage.getItem('desktop-notifications:enabled')).toBe(
        'false'
      )
    })
  })

  describe('cross-tab sync via storage event', () => {
    // jsdom rejects `storageArea` in the StorageEvent constructor (IDL check),
    // so we fabricate a plain Event and graft the props the handler reads.
    const fireStorage = (key, newValue, storageArea = localStorage) => {
      const event = new Event('storage')
      Object.assign(event, { key, newValue, storageArea })
      window.dispatchEvent(event)
    }

    it('mirrors preferenceEnabled when another tab toggles it on', async () => {
      setupNotification('granted')
      const { preferenceEnabled, isActive } = await loadComposable()
      expect(preferenceEnabled.value).toBe(false)
      fireStorage('desktop-notifications:enabled', 'true')
      expect(preferenceEnabled.value).toBe(true)
      expect(isActive.value).toBe(true)
    })

    it('mirrors preferenceEnabled when another tab toggles it off', async () => {
      setupNotification('granted')
      localStorage.setItem('desktop-notifications:enabled', 'true')
      const { preferenceEnabled, isActive } = await loadComposable()
      expect(isActive.value).toBe(true)
      fireStorage('desktop-notifications:enabled', 'false')
      expect(preferenceEnabled.value).toBe(false)
      expect(isActive.value).toBe(false)
    })

    it('mirrors banner dismissal for the current permission state', async () => {
      setupNotification('default')
      const { shouldShowBanner } = await loadComposable()
      expect(shouldShowBanner.value).toBe(true)
      fireStorage('desktop-notifications:banner-dismissed-default', 'true')
      expect(shouldShowBanner.value).toBe(false)
    })

  })

  describe('withDesktopNotificationLock', () => {
    let originalLocks
    beforeEach(() => {
      originalLocks = navigator.locks
    })
    afterEach(() => {
      if (originalLocks === undefined) delete navigator.locks
      else
        Object.defineProperty(navigator, 'locks', {
          value: originalLocks,
          configurable: true
        })
    })
    const setLocks = locks =>
      Object.defineProperty(navigator, 'locks', {
        value: locks,
        configurable: true
      })

    it('runs work unconditionally when navigator.locks is unavailable', async () => {
      setupNotification('granted')
      setLocks(undefined)
      const { withDesktopNotificationLock } = await loadComposable()
      const work = vi.fn()
      await withDesktopNotificationLock('notification-1', work)
      expect(work).toHaveBeenCalledTimes(1)
    })

    it('runs work when the lock is granted (leader tab)', async () => {
      setupNotification('granted')
      setLocks({
        request: vi.fn((_name, _opts, cb) => cb({ name: 'lock-1' }))
      })
      const { withDesktopNotificationLock } = await loadComposable()
      const work = vi.fn()
      await withDesktopNotificationLock('notification-1', work)
      expect(work).toHaveBeenCalledTimes(1)
    })

    it('skips work when the lock is held by another tab', async () => {
      setupNotification('granted')
      setLocks({ request: vi.fn((_name, _opts, cb) => cb(null)) })
      const { withDesktopNotificationLock } = await loadComposable()
      const work = vi.fn()
      await withDesktopNotificationLock('notification-1', work)
      expect(work).not.toHaveBeenCalled()
    })
  })
})
