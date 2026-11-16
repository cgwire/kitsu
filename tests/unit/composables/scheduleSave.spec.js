// @vitest-environment node

import moment from 'moment'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { effectScope, reactive } from 'vue'
import { useRoute } from 'vue-router'

vi.mock('vue-router', () => ({ useRoute: vi.fn() }))

// The parameters of a message show in its text.
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key)
  })
}))

import { buildRefusal } from '../fixtures/refusal'

import {
  getBarDates,
  getBarOrigin,
  useScheduleSave
} from '@/composables/scheduleSave'

const fmt = date => date?.format('YYYY-MM-DD')
const datesOf = bar => [fmt(bar.startDate), fmt(bar.endDate), bar.estimation]

// A bar the widget moved by a week: it stamped where the drag found it.
const buildMovedBar = () => ({
  id: 'task-1',
  name: 'Characters / Cat / Modeling',
  startDate: moment.utc('2026-09-07'),
  endDate: moment.utc('2026-09-08'),
  estimation: 16 * 60,
  man_days: 16 * 60,
  _dragOrigStartDate: moment.utc('2026-08-31'),
  _dragOrigEndDate: moment.utc('2026-09-01'),
  _dragOrigEstimation: 8 * 60
})

describe('getBarOrigin', () => {
  test('reads the dates and the estimation the widget stamped', () => {
    const bar = buildMovedBar()

    const origin = getBarOrigin(bar)

    expect(datesOf(origin)).toEqual(['2026-08-31', '2026-09-01', 8 * 60])
    // copies: a later drag moves the stamps, not the origin read before it
    bar._dragOrigStartDate.add(3, 'days')
    expect(fmt(origin.startDate)).toBe('2026-08-31')
  })

  test('reads the bar itself when nothing stamped it', () => {
    const bar = {
      id: 'item-1',
      startDate: moment.utc('2026-08-03'),
      endDate: moment.utc('2026-08-14')
    }

    expect(getBarOrigin(bar)).toEqual(getBarDates(bar))
    expect(datesOf(getBarOrigin(bar))).toEqual([
      '2026-08-03',
      '2026-08-14',
      undefined
    ])
  })
})

describe('useScheduleSave', () => {
  let scope

  const setup = () => {
    scope = effectScope()
    return scope.run(() => useScheduleSave(bar => bar.name))
  }

  beforeEach(() => {
    const path = '/productions/production-1/schedule'
    useRoute.mockReturnValue(reactive({ path, fullPath: path, query: {} }))
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    scope.stop()
    vi.restoreAllMocks()
  })

  test('puts a refused bar back where the change found it, and says so', async () => {
    const { saveBar, scheduleSaveErrorText } = setup()
    const bar = buildMovedBar()
    const refusal = buildRefusal(403)

    const isSaved = await saveBar(bar, () => Promise.reject(refusal))

    expect(isSaved).toBe(false)
    expect(datesOf(bar)).toEqual(['2026-08-31', '2026-09-01', 8 * 60])
    // the man-days column of the row follows the estimation
    expect(bar.man_days).toBe(8 * 60)
    expect(scheduleSaveErrorText.value).toBe(
      'main.cell_save_error {"name":"Characters / Cat / Modeling"}'
    )
    expect(console.error).toHaveBeenCalledWith(refusal)
  })

  test('keeps a saved bar where it went, and clears an earlier refusal', async () => {
    const { saveBar, scheduleSaveErrorText } = setup()
    await saveBar(buildMovedBar(), () => Promise.reject(buildRefusal()))
    const bar = buildMovedBar()

    const isSaved = await saveBar(bar, () => Promise.resolve())

    expect(isSaved).toBe(true)
    expect(datesOf(bar)).toEqual(['2026-09-07', '2026-09-08', 16 * 60])
    expect(scheduleSaveErrorText.value).toBe('')
  })

  // The page can name dates to go back to: those of a bar it changed itself,
  // which the widget did not stamp.
  test('puts a bar back to the dates the page gives', async () => {
    const { saveBar } = setup()
    const parent = {
      id: 'item-1',
      name: 'Asset / Modeling',
      startDate: moment.utc('2026-08-03'),
      endDate: moment.utc('2026-08-14')
    }
    const dates = getBarDates(parent)
    parent.endDate = moment.utc('2026-08-21')

    await saveBar(parent, () => Promise.reject(buildRefusal()), {
      origin: dates
    })

    expect(datesOf(parent)).toEqual(['2026-08-03', '2026-08-14', undefined])
    expect('man_days' in parent).toBe(false)
  })

  // A row has no estimation of its own: its man-days sum those of its bars.
  test('leaves the man-days of a row it puts back', async () => {
    const { saveBar } = setup()
    const row = {
      ...buildMovedBar(),
      estimation: undefined,
      man_days: 24 * 60,
      _dragOrigEstimation: undefined
    }

    await saveBar(row, () => Promise.reject(buildRefusal()))

    expect(datesOf(row)).toEqual(['2026-08-31', '2026-09-01', undefined])
    expect(row.man_days).toBe(24 * 60)
  })

  // Saves of one bar that overlap: an estimation typed key by key, a drag
  // before the answer to the previous one, a row two moved bars widen.
  describe('saves of one bar that overlap', () => {
    // The bar the widget moved twice: a week, then another.
    const moveAgain = bar => {
      bar.startDate = moment.utc('2026-09-14')
      bar.endDate = moment.utc('2026-09-15')
    }
    const held = () => {
      let settle
      const promise = new Promise((resolve, reject) => {
        settle = { accept: resolve, refuse: () => reject(buildRefusal()) }
      })
      return { save: () => promise, settle: () => settle }
    }

    test.each([
      ['in order', [0, 1]],
      ['the last first', [1, 0]]
    ])(
      'puts back where the first found it when Zou refuses both, %s',
      async (_, order) => {
        const { saveBar } = setup()
        const onPutBack = vi.fn()
        const bar = buildMovedBar()
        const saves = [held(), held()]
        const pending = [saveBar(bar, saves[0].save, { onPutBack })]
        moveAgain(bar)
        pending.push(saveBar(bar, saves[1].save, { onPutBack }))

        order.forEach(index => saves[index].settle().refuse())
        await Promise.allSettled(pending)

        expect(datesOf(bar)).toEqual(['2026-08-31', '2026-09-01', 8 * 60])
        expect(onPutBack).toHaveBeenCalledTimes(1)
      }
    )

    test('puts back the dates of the first when Zou takes it only', async () => {
      const { saveBar } = setup()
      const bar = buildMovedBar()
      const saves = [held(), held()]
      const pending = [saveBar(bar, saves[0].save)]
      moveAgain(bar)
      pending.push(saveBar(bar, saves[1].save))

      saves[1].settle().refuse()
      saves[0].settle().accept()
      await Promise.allSettled(pending)

      expect(datesOf(bar)).toEqual(['2026-09-07', '2026-09-08', 16 * 60])
    })

    // The answer to a drag often comes during the next one, which the
    // widget stamped from where the first left the bar: refused again, the
    // bar goes back to the dates Zou holds.
    test('puts back where Zou holds it when a refusal comes during the next drag', async () => {
      const { saveBar } = setup()
      const bar = buildMovedBar()
      const first = held()
      const pending = saveBar(bar, first.save)
      // the next drag starts from where the first left the bar
      bar._dragOrigStartDate = bar.startDate.clone()
      bar._dragOrigEndDate = bar.endDate.clone()
      bar._dragOrigEstimation = bar.estimation
      first.settle().refuse()
      await pending
      const afterFirst = datesOf(bar)
      moveAgain(bar)

      await saveBar(bar, () => Promise.reject(buildRefusal()))

      expect(afterFirst).toEqual(['2026-08-31', '2026-09-01', 8 * 60])
      expect(datesOf(bar)).toEqual(['2026-08-31', '2026-09-01', 8 * 60])
    })

    // Another session moved the bar after a refusal: the next refused drag
    // started from there, and the bar goes back there.
    test('puts back where the next drag started when the bar moved since', async () => {
      const { saveBar } = setup()
      const bar = buildMovedBar()
      await saveBar(bar, () => Promise.reject(buildRefusal()))
      // moved by a reload, then dragged from there
      bar.startDate = moment.utc('2026-09-21')
      bar.endDate = moment.utc('2026-09-22')
      bar._dragOrigStartDate = bar.startDate.clone()
      bar._dragOrigEndDate = bar.endDate.clone()
      moveAgain(bar)

      await saveBar(bar, () => Promise.reject(buildRefusal()))

      expect(datesOf(bar)).toEqual(['2026-09-21', '2026-09-22', 8 * 60])
    })

    // A bug leaves the state unknown, whatever order the answers come in.
    test.each([
      ['the bug first', [0, 1]],
      ['the refusal first', [1, 0]]
    ])(
      'puts nothing back when a later save threw a bug, %s',
      async (_, order) => {
        const { saveBar } = setup()
        const onPutBack = vi.fn()
        const bar = buildMovedBar()
        let failBug
        const pending = [
          saveBar(
            bar,
            () =>
              new Promise((resolve, reject) => {
                failBug = () => reject(new TypeError('bug'))
              }),
            { onPutBack }
          )
        ]
        moveAgain(bar)
        const second = held()
        pending.push(saveBar(bar, second.save, { onPutBack }))
        const settles = [() => failBug(), () => second.settle().refuse()]

        order.forEach(index => settles[index]())
        await Promise.allSettled(pending)

        expect(datesOf(bar)).toEqual(['2026-09-14', '2026-09-15', 16 * 60])
        expect(onPutBack).not.toHaveBeenCalled()
      }
    )

    test('keeps the last change when Zou takes it', async () => {
      const { saveBar } = setup()
      const onPutBack = vi.fn()
      const bar = buildMovedBar()
      const saves = [held(), held()]
      const pending = [saveBar(bar, saves[0].save, { onPutBack })]
      moveAgain(bar)
      pending.push(saveBar(bar, saves[1].save, { onPutBack }))

      saves[0].settle().refuse()
      saves[1].settle().accept()
      await Promise.allSettled(pending)

      expect(datesOf(bar)).toEqual(['2026-09-14', '2026-09-15', 16 * 60])
      expect(onPutBack).not.toHaveBeenCalled()
    })
  })

  // A drag that starts while the refused save is pending stamps again: the
  // bar goes back to where the refused change found it.
  test('puts a bar back to the origin read when its save started', async () => {
    const { saveBar } = setup()
    const bar = buildMovedBar()
    let refuse
    const saved = saveBar(
      bar,
      () =>
        new Promise((resolve, reject) => {
          refuse = reject
        })
    )
    bar._dragOrigStartDate = moment.utc('2026-09-07')
    bar._dragOrigEndDate = moment.utc('2026-09-08')

    refuse(buildRefusal())
    await saved

    expect(datesOf(bar)).toEqual(['2026-08-31', '2026-09-01', 8 * 60])
  })

  // The drop of a reassigning drag saves the dates of the bar: that save
  // going through keeps the refusal of the reassignment.
  test('keeps a refused assignment past a bar saved after it', async () => {
    const { saveAssignment, saveBar, scheduleSaveErrorText } = setup()
    const bar = buildMovedBar()

    const isAssigned = await saveAssignment(bar, () =>
      Promise.reject(buildRefusal(403))
    )
    await saveBar(bar, () => Promise.resolve())

    expect(isAssigned).toBe(false)
    expect(datesOf(bar)).toEqual(['2026-09-07', '2026-09-08', 16 * 60])
    expect(scheduleSaveErrorText.value).toBe(
      'main.cell_save_error {"name":"Characters / Cat / Modeling"}'
    )
  })

  test('counts a refused assignment and a refused bar as several', async () => {
    const { saveAssignment, saveBar, scheduleSaveErrorText } = setup()

    await saveAssignment(buildMovedBar(), () => Promise.reject(buildRefusal()))
    await saveBar(buildMovedBar(), () => Promise.reject(buildRefusal()))

    expect(scheduleSaveErrorText.value).toBe('main.cells_save_error')
  })

  // A bug is no refusal: Zou may have taken the change before it, so the
  // bar stays as it is, and Sentry gets the error.
  test('leaves a bar as it is when its save throws a bug', async () => {
    const { saveBar, scheduleSaveErrorText } = setup()
    const onPutBack = vi.fn()
    const bar = buildMovedBar()

    await expect(
      saveBar(
        bar,
        () => {
          throw new TypeError('bug after the request')
        },
        { onPutBack }
      )
    ).rejects.toThrow('bug after the request')

    expect(datesOf(bar)).toEqual(['2026-09-07', '2026-09-08', 16 * 60])
    expect(onPutBack).not.toHaveBeenCalled()
    expect(scheduleSaveErrorText.value).toBe('')
  })

  // A date field saves each date picked, which can overlap: it shows the
  // date of the last one Zou took, or the one it had before them all.
  test('puts back a field to the value Zou took last', async () => {
    const { saveTracked } = setup()
    const field = { id: 'production-1', name: 'Wing It' }
    const putBack = vi.fn()
    const settles = []
    const save = () =>
      new Promise((resolve, reject) => {
        settles.push({ accept: resolve, refuse: () => reject(buildRefusal()) })
      })
    const track = sent =>
      saveTracked(field, field, { origin: '2026-03-09', sent, save, putBack })

    const pending = [track('2026-03-15'), track('2026-03-16')]
    settles[1].refuse()
    settles[0].accept()
    await Promise.all(pending)

    expect(putBack.mock.calls).toEqual([['2026-03-15']])
  })

  // The dates of the production: nothing to put back but the message.
  test('says that a change with no bar was refused', async () => {
    const { saveChange, scheduleSaveErrorText } = setup()
    const production = { id: 'production-1', name: 'Wing It' }

    const isSaved = await saveChange(production, () =>
      Promise.reject(buildRefusal(403))
    )

    expect(isSaved).toBe(false)
    expect(production).toEqual({ id: 'production-1', name: 'Wing It' })
    expect(scheduleSaveErrorText.value).toBe(
      'main.cell_save_error {"name":"Wing It"}'
    )
  })

  test('names several refused bars together', async () => {
    const { saveBar, scheduleSaveErrorText } = setup()
    const other = { ...buildMovedBar(), id: 'task-2', name: 'Props / Cup' }

    await Promise.all([
      saveBar(buildMovedBar(), () => Promise.reject(buildRefusal())),
      saveBar(other, () => Promise.reject(buildRefusal()))
    ])

    expect(scheduleSaveErrorText.value).toBe('main.cells_save_error')
  })
})
