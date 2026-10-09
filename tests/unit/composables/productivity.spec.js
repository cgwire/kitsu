// @vitest-environment node
import { afterEach, describe, expect, test, vi } from 'vitest'
import { effectScope, reactive, ref } from 'vue'

import { useProductivity } from '@/composables/productivity'
import { today } from '@/lib/timesheet'

const route = reactive({ query: {} })
const router = {
  push: vi.fn(({ query }) => (route.query = query)),
  replace: vi.fn(({ query }) => (route.query = query))
}
const shotsProduction = { id: 'prod-1', production_type: 'short' }
const assetsProduction = { id: 'prod-2', production_type: 'assets' }
const paperProduction = {
  id: 'prod-3',
  production_type: 'tvshow',
  production_style: '2dpaper'
}
const productions = [shotsProduction, assetsProduction, paperProduction]
const actions = {}
const store = {
  getters: { productionMap: new Map(productions.map(p => [p.id, p])) },
  dispatch: vi.fn((name, payload) => actions[name](payload))
}

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => router
}))
vi.mock('vuex', () => ({ useStore: () => store }))

const flush = () => new Promise(resolve => setTimeout(resolve))

const deferred = () => {
  let resolve
  const promise = new Promise(_resolve => (resolve = _resolve))
  return { promise, resolve }
}

const setup = ({
  query = {},
  isActive = true,
  productionId,
  taskTypeId = '',
  openProductions = productions,
  sideColumn = ref(null),
  loadTimeSpents = vi.fn(() => [])
} = {}) => {
  route.query = query
  router.push.mockClear()
  router.replace.mockClear()
  store.dispatch.mockClear()
  Object.assign(actions, {
    getPersonQuotaShots: vi.fn(() => []),
    loadAggregatedPersonDaysOff: vi.fn(() => []),
    loadAggregatedPersonTimeSpents: vi.fn(() => []),
    loadPersonQuotas: vi.fn(({ productionId }) => ({ productionId }))
  })
  const refs = {
    isActive: ref(isActive),
    personId: ref('person-1'),
    productionId: ref(productionId),
    taskTypeId: ref(taskTypeId),
    openProductions: ref(openProductions)
  }
  const scope = effectScope()
  const productivity = scope.run(() =>
    useProductivity({ ...refs, loadTimeSpents, sideColumn })
  )
  return { productivity, scope, loadTimeSpents, ...refs }
}

const dispatched = name =>
  store.dispatch.mock.calls
    .filter(([action]) => action === name)
    .map(([, payload]) => payload)

describe('useProductivity', () => {
  let current
  const run = options => {
    current = setup(options)
    return current
  }
  afterEach(() => current?.scope.stop())

  describe('URL state', () => {
    test('defaults to the days of the current month, in time', () => {
      const { productivity } = run({ isActive: false })
      expect(productivity.productivityLevel.value).toBe('day')
      expect(productivity.productivityYear.value).toBe(today.year)
      expect(productivity.productivityMonth.value).toBe(today.month)
      expect(productivity.productivityPeriod.value).toBe(0)
      expect(productivity.productivityMetric.value).toBe('time')
      expect(productivity.isQuotasMetric.value).toBe(false)
      expect(productivity.productivityQuotaMode.value).toBe('weighted')
      expect(productivity.productivityCountMode.value).toBe('frames')
      expect(productivity.isPaper.value).toBe(false)
    })

    test('reads the valid values of the URL', () => {
      const { productivity } = run({
        isActive: false,
        query: {
          view: 'week',
          year: '2025',
          month: '3',
          period: '12',
          metric: 'quotas',
          quotaMode: 'done',
          countMode: 'seconds'
        }
      })
      expect(productivity.productivityLevel.value).toBe('week')
      expect(productivity.productivityYear.value).toBe(2025)
      expect(productivity.productivityMonth.value).toBe(3)
      expect(productivity.productivityPeriod.value).toBe(12)
      expect(productivity.isQuotasMetric.value).toBe(true)
      expect(productivity.productivityQuotaMode.value).toBe('done')
      expect(productivity.productivityCountMode.value).toBe('seconds')
    })

    test('falls back to the defaults on invalid values', () => {
      const { productivity } = run({
        isActive: false,
        query: {
          view: 'year',
          year: 'abc',
          month: '-2',
          period: '1.5',
          metric: 'money',
          quotaMode: 'fast',
          countMode: 'drawings'
        }
      })
      expect(productivity.productivityLevel.value).toBe('day')
      expect(productivity.productivityYear.value).toBe(today.year)
      expect(productivity.productivityMonth.value).toBe(today.month)
      expect(productivity.productivityPeriod.value).toBe(0)
      expect(productivity.productivityMetric.value).toBe('time')
      expect(productivity.productivityQuotaMode.value).toBe('weighted')
      expect(productivity.productivityCountMode.value).toBe('frames')
    })

    test('counts drawings on a paper production', () => {
      const { productivity } = run({
        isActive: false,
        productionId: 'prod-3',
        query: { countMode: 'seconds' }
      })
      expect(productivity.isPaper.value).toBe(true)
      expect(productivity.productivityCountMode.value).toBe('drawings')
    })

    test.each([
      ['day', { year: 2026, month: 2, day: 5 }],
      ['week', { year: 2026, week: 5 }],
      ['month', { year: 2026, month: 5 }]
    ])('gives the period params of a %s column', (view, expected) => {
      const { productivity } = run({
        isActive: false,
        query: { view, year: '2026', month: '2', period: '5' }
      })
      expect(productivity.productivityPeriodParams.value).toEqual(expected)
    })

    test('closes the panel by dropping the period', () => {
      const { productivity } = run({
        isActive: false,
        query: { section: 'productivity', view: 'month', period: '4' }
      })
      expect(productivity.productivityCloseRoute.value).toEqual({
        query: { section: 'productivity', view: 'month', period: undefined }
      })
    })
  })

  describe('chart handlers', () => {
    test('drop the selected period on a new view or metric', () => {
      const { productivity } = run({ isActive: false, query: { period: '5' } })
      productivity.onProductivityLevelChanged('week')
      expect(route.query).toEqual({ view: 'week', period: undefined })
      productivity.onProductivityMetricChanged('quotas')
      expect(route.query).toEqual({
        view: 'week',
        metric: 'quotas',
        period: undefined
      })
    })

    test('keep the month up to today in the current year', () => {
      const { productivity } = run({ isActive: false, query: { period: '3' } })
      productivity.onProductivityPeriodChanged({ year: today.year, month: 12 })
      expect(route.query).toEqual({
        year: `${today.year}`,
        month: `${today.month}`,
        period: undefined
      })
      productivity.onProductivityPeriodChanged({ year: 2020, month: 12 })
      expect(route.query).toMatchObject({ year: '2020', month: '12' })
    })

    test('write the modes and keep the period', () => {
      const { productivity } = run({ isActive: false, query: { period: '3' } })
      productivity.onProductivityQuotaModeChanged('done')
      productivity.onProductivityCountModeChanged('seconds')
      expect(route.query).toEqual({
        period: '3',
        quotaMode: 'done',
        countMode: 'seconds'
      })
    })

    test('push the selected column', () => {
      const { productivity } = run({ isActive: false })
      productivity.onProductivityColumnSelected(7)
      expect(router.push).toHaveBeenCalledWith({ query: { period: '7' } })
    })
  })

  describe('time spents', () => {
    test('loads nothing while inactive', async () => {
      const { loadTimeSpents } = run({ isActive: false })
      await flush()
      expect(loadTimeSpents).not.toHaveBeenCalled()
    })

    test('loads the range of the URL period once active', async () => {
      const loadTimeSpents = vi.fn(() => [{ duration: 60 }])
      const { productivity, isActive } = run({
        isActive: false,
        query: { view: 'day', year: '2026', month: '2' },
        loadTimeSpents
      })
      isActive.value = true
      await flush()
      expect(loadTimeSpents).toHaveBeenCalledWith({
        startDate: '2026-02-01',
        endDate: '2026-02-28'
      })
      expect(productivity.productivityTimeSpents.value).toEqual([
        { duration: 60 }
      ])
      expect(productivity.isProductivityLoading.value).toBe(false)
    })

    test('loads when already active', async () => {
      const { loadTimeSpents } = run({ query: { view: 'month', year: '2026' } })
      await flush()
      expect(loadTimeSpents).toHaveBeenCalledWith({
        startDate: '2026-01-01',
        endDate: '2026-12-31'
      })
    })

    test('keeps the rows of the latest load', async () => {
      const first = deferred()
      const loadTimeSpents = vi
        .fn()
        .mockImplementationOnce(() => first.promise)
        .mockResolvedValue([{ duration: 120 }])
      const { productivity } = run({ loadTimeSpents })
      await flush()
      productivity.onProductivityLevelChanged('week')
      await flush()
      first.resolve([{ duration: 60 }])
      await flush()
      expect(productivity.productivityTimeSpents.value).toEqual([
        { duration: 120 }
      ])
      expect(productivity.isProductivityLoading.value).toBe(false)
    })

    test('flags a failed load', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const loadTimeSpents = vi.fn(() => Promise.reject(new Error('down')))
      const { productivity } = run({ loadTimeSpents })
      await flush()
      expect(productivity.isProductivityLoadingError.value).toBe(true)
      expect(productivity.productivityTimeSpents.value).toEqual([])
      console.error.mockRestore()
    })
  })

  describe('quotas', () => {
    test('loads the quotas of the person for every production with shots', async () => {
      const { productivity, loadTimeSpents } = run({
        query: { metric: 'quotas', quotaMode: 'done' }
      })
      await flush()
      expect(dispatched('loadPersonQuotas')).toEqual([
        { productionId: 'prod-1', personId: 'person-1', computeMode: 'done' },
        { productionId: 'prod-3', personId: 'person-1', computeMode: 'done' }
      ])
      expect(productivity.productivityQuotas.value).toEqual([
        { productionId: 'prod-1' },
        { productionId: 'prod-3' }
      ])
      expect(loadTimeSpents).not.toHaveBeenCalled()
    })

    test('loads the quotas of the filtered production only', async () => {
      run({ query: { metric: 'quotas' }, productionId: 'prod-3' })
      await flush()
      expect(dispatched('loadPersonQuotas')).toEqual([
        {
          productionId: 'prod-3',
          personId: 'person-1',
          computeMode: 'weighted'
        }
      ])
    })

    test('reloads for another person', async () => {
      const { personId } = run({
        query: { metric: 'quotas' },
        productionId: 'prod-1'
      })
      await flush()
      personId.value = 'person-2'
      await flush()
      expect(
        dispatched('loadPersonQuotas').map(payload => payload.personId)
      ).toEqual(['person-1', 'person-2'])
    })

    test('keeps the quotas of the latest load', async () => {
      const { productivity } = run({
        query: { metric: 'quotas' },
        productionId: 'prod-1'
      })
      const first = deferred()
      actions.loadPersonQuotas = vi
        .fn()
        .mockImplementationOnce(() => first.promise)
        .mockResolvedValue({ mode: 'done' })
      productivity.onProductivityQuotaModeChanged('feedback')
      await flush()
      productivity.onProductivityQuotaModeChanged('done')
      await flush()
      first.resolve({ mode: 'feedback' })
      await flush()
      expect(productivity.productivityQuotas.value).toEqual([{ mode: 'done' }])
      expect(productivity.isProductivityLoading.value).toBe(false)
    })
  })

  describe('side panel', () => {
    test('loads the time spents and days off of the period', async () => {
      const { productivity } = run({
        query: { view: 'week', year: '2026', period: '12' },
        productionId: 'prod-1',
        taskTypeId: 'type-1'
      })
      actions.loadAggregatedPersonTimeSpents = vi.fn(() => [
        { id: 'task-1', duration: 60, task_type_id: 'type-1' },
        { id: 'task-2', duration: 0, task_type_id: 'type-1' },
        { id: 'task-3', duration: 30, task_type_id: 'type-2' }
      ])
      actions.loadAggregatedPersonDaysOff = vi.fn(() => [{ date: 'x' }])
      route.query = { ...route.query, period: '13' }
      await flush()
      const period = {
        personId: 'person-1',
        detailLevel: 'week',
        year: 2026,
        week: 13
      }
      expect(actions.loadAggregatedPersonTimeSpents).toHaveBeenCalledWith({
        ...period,
        productionId: 'prod-1'
      })
      expect(actions.loadAggregatedPersonDaysOff).toHaveBeenCalledWith(period)
      expect(productivity.productivityTasks.value).toEqual([
        { id: 'task-1', duration: 60, task_type_id: 'type-1' }
      ])
      expect(productivity.productivityDaysOff.value).toEqual([{ date: 'x' }])
      expect(productivity.isProductivityInfoLoading.value).toBe(false)
    })

    test('loads nothing without a selected period', async () => {
      run()
      await flush()
      expect(dispatched('loadAggregatedPersonTimeSpents')).toEqual([])
    })

    test('keeps the panel tasks of the latest period', async () => {
      const { productivity } = run({ query: { period: '3' } })
      const first = deferred()
      actions.loadAggregatedPersonTimeSpents = vi
        .fn()
        .mockImplementationOnce(() => first.promise)
        .mockResolvedValue([{ id: 'task-2', duration: 30 }])
      productivity.onProductivityColumnSelected(4)
      await flush()
      productivity.onProductivityColumnSelected(5)
      await flush()
      first.resolve([{ id: 'task-1', duration: 60 }])
      await flush()
      expect(productivity.productivityTasks.value).toEqual([
        { id: 'task-2', duration: 30 }
      ])
      expect(productivity.isProductivityInfoLoading.value).toBe(false)
    })

    test('loads the quota shots of each counted production', async () => {
      const { productivity } = run({
        query: {
          metric: 'quotas',
          quotaMode: 'feedback',
          view: 'day',
          year: '2026',
          month: '2'
        },
        taskTypeId: 'type-1'
      })
      actions.getPersonQuotaShots = vi.fn(({ productionId }) => [
        { id: `shot-${productionId}` }
      ])
      productivity.onProductivityColumnSelected(5)
      await flush()
      const params = {
        personId: 'person-1',
        taskTypeId: 'type-1',
        detailLevel: 'day',
        year: 2026,
        month: 2,
        day: 5,
        computeMode: 'feedback'
      }
      expect(dispatched('getPersonQuotaShots')).toEqual([
        { productionId: 'prod-1', ...params },
        { productionId: 'prod-3', ...params }
      ])
      expect(dispatched('loadAggregatedPersonTimeSpents')).toEqual([])
      expect(productivity.productivityQuotaShots.value).toEqual([
        { id: 'shot-prod-1' },
        { id: 'shot-prod-3' }
      ])
      expect(productivity.isProductivityInfoLoading.value).toBe(false)
    })
  })

  // the side column stacks under the chart on a phone
  describe('side column on a phone', () => {
    const mockPhone = matches =>
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches }))
      )

    afterEach(() => vi.unstubAllGlobals())

    test('scrolls the opened column into view', async () => {
      mockPhone(true)
      const scrollIntoView = vi.fn()
      const { productivity } = run({
        isActive: false,
        sideColumn: ref({ scrollIntoView })
      })
      await productivity.onProductivityColumnSelected(5)
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      })
    })

    test('leaves the page in place on a large screen', async () => {
      mockPhone(false)
      const scrollIntoView = vi.fn()
      const { productivity } = run({
        isActive: false,
        sideColumn: ref({ scrollIntoView })
      })
      await productivity.onProductivityColumnSelected(5)
      expect(scrollIntoView).not.toHaveBeenCalled()
    })
  })
})
