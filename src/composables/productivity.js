import { computed, nextTick, ref, toValue, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { getProductivityRange, today } from '@/lib/timesheet'

const productivityLevels = ['day', 'week', 'month']
const productivityMetrics = ['time', 'quotas']
const quotaModes = ['weighted', 'feedback', 'weighteddone', 'done']

/*
 * Productivity tab of a person: the chart state lives in the URL (view, year,
 * month, period, metric, quotaMode, countMode), and the chart and its side
 * panel load the time spents or the quotas of `personId`. `loadTimeSpents`
 * fetches the time spents of a { startDate, endDate } range, through the
 * route that fits the page. The other parameters are refs or getters.
 */
export const useProductivity = ({
  personId,
  productionId,
  taskTypeId,
  openProductions,
  isActive,
  loadTimeSpents,
  sideColumn
}) => {
  const route = useRoute()
  const router = useRouter()
  const store = useStore()

  // State
  // --------------------------------------------------------------------------
  const productivityTimeSpents = ref([])
  const isProductivityLoading = ref(false)
  const isProductivityLoadingError = ref(false)
  const productivityAggregatedTasks = ref([])
  const productivityDaysOff = ref([])
  const isProductivityInfoLoading = ref(false)
  const isProductivityInfoLoadingError = ref(false)
  const productivityQuotas = ref([])
  const productivityQuotaShots = ref([])

  // Computed
  // --------------------------------------------------------------------------
  const queryNumber = (key, defaultValue) => {
    const value = Number(route.query[key])
    return Number.isInteger(value) && value > 0 ? value : defaultValue
  }

  const queryOption = (key, options) =>
    options.includes(route.query[key]) ? route.query[key] : options[0]

  const productivityLevel = computed(() =>
    queryOption('view', productivityLevels)
  )
  const productivityYear = computed(() => queryNumber('year', today.year))
  const productivityMonth = computed(() => queryNumber('month', today.month))
  const productivityPeriod = computed(() => queryNumber('period', 0))

  const productivityMetric = computed(() =>
    queryOption('metric', productivityMetrics)
  )
  const isQuotasMetric = computed(() => productivityMetric.value === 'quotas')
  const productivityQuotaMode = computed(() =>
    queryOption('quotaMode', quotaModes)
  )

  const selectedProduction = computed(() =>
    store.getters.productionMap.get(toValue(productionId))
  )

  const isPaper = computed(
    () => selectedProduction.value?.production_style === '2dpaper'
  )

  // the count modes the chart offers for this kind of production
  const productivityCountMode = computed(() =>
    queryOption(
      'countMode',
      isPaper.value ? ['drawings', 'count'] : ['frames', 'seconds', 'count']
    )
  )

  // an assets only production has no shot to count
  const quotaProductionIds = computed(() =>
    selectedProduction.value
      ? [selectedProduction.value.id]
      : toValue(openProductions)
          .filter(production => production.production_type !== 'assets')
          .map(production => production.id)
  )

  // the column index is a day of the month, an ISO week or a month
  const productivityPeriodParams = computed(() => {
    const year = productivityYear.value
    const period = productivityPeriod.value
    return {
      day: { year, month: productivityMonth.value, day: period },
      week: { year, week: period },
      month: { year, month: period }
    }[productivityLevel.value]
  })

  const productivityTasks = computed(() =>
    productivityAggregatedTasks.value.filter(
      task => !toValue(taskTypeId) || task.task_type_id === toValue(taskTypeId)
    )
  )

  const productivityCloseRoute = computed(() => ({
    query: { ...route.query, period: undefined }
  }))

  // Functions
  // --------------------------------------------------------------------------

  // a new view, year or month shows other columns: the selected one goes
  const setProductivityQuery = query =>
    router.replace({ query: { ...route.query, ...query, period: undefined } })

  const onProductivityLevelChanged = level =>
    setProductivityQuery({ view: level })

  // the chart offers the months up to today in the current year only
  const onProductivityPeriodChanged = ({ year, month }) => {
    const isFuture = year === today.year && month > today.month
    setProductivityQuery({
      year: `${year}`,
      month: `${isFuture ? today.month : month}`
    })
  }

  const onProductivityMetricChanged = metric => setProductivityQuery({ metric })

  const onProductivityQuotaModeChanged = quotaMode =>
    router.replace({ query: { ...route.query, quotaMode } })

  const onProductivityCountModeChanged = countMode =>
    router.replace({ query: { ...route.query, countMode } })

  // the side column stacks under the chart on a phone, out of view
  // a second click on the selected column closes its period
  const onProductivityColumnSelected = async index => {
    if (index === productivityPeriod.value) {
      await router.push(productivityCloseRoute.value)
      return
    }
    await router.push({ query: { ...route.query, period: `${index}` } })
    if (globalThis.matchMedia?.('(max-width: 768px)').matches) {
      await nextTick()
      toValue(sideColumn)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const getProductivityKey = () =>
    JSON.stringify([
      toValue(personId),
      productivityMetric.value,
      productivityLevel.value,
      productivityYear.value,
      productivityMonth.value
    ])

  // A quicker answer for a later view or period may have landed first: the
  // loads drop an answer whose key no longer matches the current one.
  const loadProductivity = async () => {
    const key = getProductivityKey()
    isProductivityLoading.value = true
    isProductivityLoadingError.value = false
    let timeSpents = []
    let isError = false
    try {
      timeSpents = await loadTimeSpents(
        getProductivityRange(productivityLevel.value, {
          year: productivityYear.value,
          month: productivityMonth.value
        })
      )
    } catch (err) {
      console.error(err)
      isError = true
    }
    if (key !== getProductivityKey()) return
    productivityTimeSpents.value = timeSpents
    isProductivityLoadingError.value = isError
    isProductivityLoading.value = false
  }

  const getProductivityQuotasKey = () =>
    JSON.stringify([
      toValue(personId),
      productivityMetric.value,
      productivityQuotaMode.value,
      quotaProductionIds.value
    ])

  const loadProductivityQuotas = async () => {
    const key = getProductivityQuotasKey()
    isProductivityLoading.value = true
    isProductivityLoadingError.value = false
    let quotas = []
    let isError = false
    try {
      quotas = await Promise.all(
        quotaProductionIds.value.map(productionId =>
          store.dispatch('loadPersonQuotas', {
            productionId,
            personId: toValue(personId),
            computeMode: productivityQuotaMode.value
          })
        )
      )
    } catch (err) {
      console.error(err)
      isError = true
    }
    if (key !== getProductivityQuotasKey()) return
    productivityQuotas.value = quotas
    isProductivityLoadingError.value = isError
    isProductivityLoading.value = false
  }

  const getProductivityInfoKey = () =>
    JSON.stringify([
      toValue(personId),
      productivityMetric.value,
      productivityQuotaMode.value,
      toValue(taskTypeId),
      productivityLevel.value,
      productivityPeriodParams.value,
      toValue(productionId),
      quotaProductionIds.value
    ])

  // the shots of the productions the chart counts, not of every production
  const loadProductivityQuotaInfo = async () => {
    const key = getProductivityInfoKey()
    isProductivityInfoLoading.value = true
    isProductivityInfoLoadingError.value = false
    productivityQuotaShots.value = []
    const isStale = () => key !== getProductivityInfoKey()
    try {
      const shotLists = await Promise.all(
        quotaProductionIds.value.map(productionId =>
          store.dispatch('getPersonQuotaShots', {
            productionId,
            personId: toValue(personId),
            taskTypeId: toValue(taskTypeId) || undefined,
            detailLevel: productivityLevel.value,
            ...productivityPeriodParams.value,
            computeMode: productivityQuotaMode.value
          })
        )
      )
      if (isStale()) return
      productivityQuotaShots.value = shotLists.flat()
    } catch (err) {
      console.error(err)
      if (isStale()) return
      isProductivityInfoLoadingError.value = true
    }
    isProductivityInfoLoading.value = false
  }

  const loadProductivityInfo = async () => {
    const key = getProductivityInfoKey()
    isProductivityInfoLoading.value = true
    isProductivityInfoLoadingError.value = false
    productivityAggregatedTasks.value = []
    const period = {
      personId: toValue(personId),
      detailLevel: productivityLevel.value,
      ...productivityPeriodParams.value
    }
    const isStale = () => key !== getProductivityInfoKey()
    try {
      const tasks = await store.dispatch('loadAggregatedPersonTimeSpents', {
        ...period,
        productionId: toValue(productionId)
      })
      if (isStale()) return
      productivityAggregatedTasks.value = tasks.filter(
        task => task.duration > 0
      )
      const daysOff = await store.dispatch(
        'loadAggregatedPersonDaysOff',
        period
      )
      if (isStale()) return
      productivityDaysOff.value = daysOff
    } catch (err) {
      console.error(err)
      if (isStale()) return
      isProductivityInfoLoadingError.value = true
    }
    isProductivityInfoLoading.value = false
  }

  // Watchers
  // --------------------------------------------------------------------------
  // immediate: the Person page may mount with the tab already active
  watch(
    [
      () => toValue(isActive),
      () => toValue(personId),
      productivityMetric,
      productivityLevel,
      productivityYear,
      productivityMonth
    ],
    () => {
      if (toValue(isActive) && !isQuotasMetric.value) loadProductivity()
    },
    { immediate: true }
  )

  // The person quotas cover every period: the chart picks the columns of the
  // view, year and month from the loaded answers.
  watch(
    [
      () => toValue(isActive),
      () => toValue(personId),
      productivityMetric,
      productivityQuotaMode,
      () => quotaProductionIds.value.join()
    ],
    () => {
      if (toValue(isActive) && isQuotasMetric.value) loadProductivityQuotas()
    },
    { immediate: true }
  )

  watch(
    [
      () => toValue(isActive),
      () => toValue(personId),
      productivityLevel,
      productivityYear,
      productivityMonth,
      productivityPeriod,
      () => toValue(productionId),
      () => quotaProductionIds.value.join(),
      productivityMetric,
      productivityQuotaMode,
      () => toValue(taskTypeId)
    ],
    () => {
      if (toValue(isActive) && productivityPeriod.value) {
        if (isQuotasMetric.value) loadProductivityQuotaInfo()
        else loadProductivityInfo()
      }
    },
    { immediate: true }
  )

  return {
    isPaper,
    isProductivityInfoLoading,
    isProductivityInfoLoadingError,
    isProductivityLoading,
    isProductivityLoadingError,
    isQuotasMetric,
    onProductivityColumnSelected,
    onProductivityCountModeChanged,
    onProductivityLevelChanged,
    onProductivityMetricChanged,
    onProductivityPeriodChanged,
    onProductivityQuotaModeChanged,
    productivityCloseRoute,
    productivityCountMode,
    productivityDaysOff,
    productivityLevel,
    productivityMetric,
    productivityMonth,
    productivityPeriod,
    productivityPeriodParams,
    productivityQuotaMode,
    productivityQuotas,
    productivityQuotaShots,
    productivityTasks,
    productivityTimeSpents,
    productivityYear
  }
}
