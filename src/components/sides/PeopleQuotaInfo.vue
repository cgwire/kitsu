<template>
  <div class="people-quota-info">
    <div class="close">
      <router-link class="close-button" :to="closeTarget">
        <x-icon />
      </router-link>
    </div>

    <div class="flexrow">
      <people-avatar class="flexrow-item" :person="person" :is-lazy="false" />
      <page-title class="flexrow-item" :text="person.full_name" />
    </div>

    <div class="info-date" v-if="isMonthInfo">{{ monthString }} {{ year }}</div>
    <div class="info-date" v-else-if="isWeekInfo">
      {{ $t('main.week') }}
      {{ week }}, {{ startDay }} - {{ endDay }} {{ weekMonth }} {{ year }}
    </div>
    <div class="info-date" v-else-if="isDayInfo">
      {{ day }} {{ monthString }} {{ year }}
    </div>

    <quota-shot-list
      class="time-spent-list"
      :count-mode="countMode"
      :shots="shots"
      :is-loading="isLoading"
      :is-error="isLoadingError"
    />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { XIcon } from 'lucide-vue-next'
import moment from 'moment-timezone'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { isFreeEscape } from '@/lib/keyboard'
import { monthToString } from '@/lib/time'

import QuotaShotList from '@/components/lists/QuotaShotList.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  person: { type: Object, default: () => ({}) },
  year: { type: Number, default: 0 },
  month: { type: Number, default: 0 },
  week: { type: Number, default: 0 },
  day: { type: Number, default: 0 },
  countMode: { type: String, default: 'frames' },
  isLoading: { type: Boolean, default: false },
  isLoadingError: { type: Boolean, default: false },
  shots: { type: Array, default: () => [] },
  level: { type: String, default: '' },
  closeRoute: { type: Object, default: null }
})

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)

// 4 January always falls in ISO week 1, unlike the locale week 1
const weekStart = computed(() =>
  moment({ year: props.year, month: 0, day: 4 })
    .isoWeek(props.week)
    .startOf('isoWeek')
)
const startDay = computed(() => weekStart.value.date())
const endDay = computed(() => weekStart.value.clone().add(6, 'days').date())
const weekMonth = computed(() => weekStart.value.format('MMM'))
const monthString = computed(() => monthToString(props.month))

const isLevel = name =>
  props.level ? props.level === name : route.path.includes(name)
const isMonthInfo = computed(() => isLevel('month'))
const isWeekInfo = computed(() => isLevel('week'))
const isDayInfo = computed(() => isLevel('day'))

const quotaCloseRoute = computed(() => {
  if (!currentProduction.value) return {}
  let target = {
    name: 'quota',
    params: { production_id: currentProduction.value.id }
  }
  if (isMonthInfo.value) {
    target = { name: 'quota-month', params: { year: props.year } }
  } else if (isWeekInfo.value) {
    target = { name: 'quota-week', params: { year: props.year } }
  } else if (isDayInfo.value) {
    target = {
      name: 'quota-day',
      params: { year: props.year, month: props.month }
    }
  }
  if (currentEpisode.value) {
    target.name = `episode-${target.name}`
    target.params.episode_id = currentEpisode.value.id
  }
  return { ...target, query: route.query }
})

const closeTarget = computed(() => props.closeRoute || quotaCloseRoute.value)

// Functions
// --------------------------------------------------------------------------
const onKeyDown = event => {
  if (isFreeEscape(event)) router.push(closeTarget.value)
}

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style lang="scss" scoped>
.dark .close-button:hover {
  background: $dark-grey-lightest;
}

.data-list {
  padding-bottom: 5em;
}

.people-quota-info {
  border-left: 1px solid var(--border);
  height: 100%;
  padding: 1em;
}

.info-date {
  font-size: 1.5em;
  margin-top: 1em;
  text-transform: capitalize;
}

.close {
  text-align: right;
}

.close-button {
  cursor: pointer;
  display: inline-block;
  text-align: center;
  padding-top: 3px;
  width: 30px;
  height: 30px;
}

.close-button:hover {
  background: $white-grey;
  border-radius: 50%;
}
</style>
