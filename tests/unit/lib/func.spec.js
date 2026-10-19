// @vitest-environment node

import func from '@/lib/func'

describe('func', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('runPromiseMapAsSeries starts a call only after the previous one', async () => {
    const order = []
    await func.runPromiseMapAsSeries([1, 2], item => {
      order.push(`start-${item}`)
      return Promise.resolve().then(() => order.push(`end-${item}`))
    })
    expect(order).toEqual(['start-1', 'end-1', 'start-2', 'end-2'])
  })

  test('debounce runs nothing once cancelled', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = func.debounce(fn, 100)

    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(100)

    expect(fn).not.toHaveBeenCalled()
  })

  test('debounce flush runs the pending call once, at once', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = func.debounce(fn, 100)

    debounced('first')
    debounced('last')
    debounced.flush()
    expect(fn.mock.calls).toEqual([['last']])
    vi.advanceTimersByTime(100)
    debounced.flush()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  describe('queueLatest', () => {
    // A send that settles when the test says so.
    const recordSends = () => {
      const sends = []
      const send = value =>
        new Promise((resolve, reject) => {
          sends.push({ value, resolve, reject })
        })
      return { send, sends, values: () => sends.map(({ value }) => value) }
    }
    const tick = () => new Promise(resolve => setTimeout(resolve, 0))

    test('sends one value at a time, then only the last one waiting', async () => {
      const { send, sends, values } = recordSends()
      const save = func.queueLatest(send)

      save('a')
      save('b')
      save('c')
      expect(values()).toEqual(['a'])

      sends[0].resolve()
      await tick()
      expect(values()).toEqual(['a', 'c'])

      sends[1].resolve()
      await tick()
      expect(values()).toEqual(['a', 'c'])
    })

    test('settles every call once nothing is left to send', async () => {
      const { send, sends } = recordSends()
      const save = func.queueLatest(send)
      const settled = []
      const track = async (name, call) => {
        await call
        settled.push(name)
      }

      const calls = [track('a', save('a')), track('b', save('b'))]
      sends[0].resolve()
      await tick()
      expect(settled).toEqual([])

      sends[1].resolve()
      await Promise.all(calls)
      expect(settled).toEqual(['a', 'b'])
    })

    test('rejects the calls of a failed send, then sends the next value', async () => {
      const { send, sends, values } = recordSends()
      const save = func.queueLatest(send)

      const failed = save('a')
      sends[0].reject(new Error('Internal Server Error'))
      await expect(failed).rejects.toThrow('Internal Server Error')

      const next = save('b')
      expect(values()).toEqual(['a', 'b'])
      sends[1].resolve()
      await expect(next).resolves.toBeUndefined()
    })

    test('sends the value waiting behind a failed send', async () => {
      const { send, sends, values } = recordSends()
      const save = func.queueLatest(send)

      const calls = Promise.allSettled([save('a'), save('b')])
      sends[0].reject(new Error('Bad Gateway'))
      await tick()
      expect(values()).toEqual(['a', 'b'])

      sends[1].resolve()
      const results = await calls
      expect(results.map(({ reason }) => reason?.message)).toEqual([
        'Bad Gateway',
        'Bad Gateway'
      ])
    })

    test('keeps sending after a send that throws at once', async () => {
      const sent = []
      const save = func.queueLatest(value => {
        if (value === 'a') throw new Error('No production')
        sent.push(value)
        return Promise.resolve()
      })

      await expect(save('a')).rejects.toThrow('No production')
      await save('b')

      expect(sent).toEqual(['b'])
    })
  })
})
