<template>
  <div class="day-off-list data-list">
    <div class="flexrow header">
      <span class="day-off-total" v-if="!isLoading && !isError">
        {{ sortedDaysOff.length }}
        {{ $t('days_off.nb_days_off', { count: sortedDaysOff.length }) }}
      </span>
      <div class="filler"></div>
      <button-simple
        class="flexrow-item"
        :text="$t('days_off.add')"
        icon="plus"
        @click="openSetDayOffModal()"
      />
    </div>
    <section
      :class="`day-off-group day-off-group--${group.key}`"
      :key="group.key"
      v-for="group in groups"
    >
      <h3 class="day-off-group-title">
        {{ $t(`days_off.${group.key}`) }}
        <span class="day-off-group-count">{{ group.daysOff.length }}</span>
      </h3>
      <ul class="day-off-cards">
        <li
          class="day-off-card"
          :data-id="dayOff.id"
          :key="dayOff.id"
          v-for="dayOff in group.daysOff"
        >
          <div class="day-off-tile">
            <span class="day-off-tile-month">{{ dayOff.month }}</span>
            <span class="day-off-tile-day">{{ dayOff.day }}</span>
          </div>
          <div class="day-off-main">
            <p class="day-off-period">{{ dayOff.period }}</p>
            <p class="day-off-description" v-if="dayOff.description">
              {{ dayOff.description }}
            </p>
          </div>
          <span class="day-off-count">
            {{ $t('days_off.nb_days', { count: dayOff.nbDays }) }}
          </span>
          <div class="actions">
            <button-simple
              @click="openSetDayOffModal(dayOff)"
              :title="$t('days_off.edit')"
              icon="edit"
            />
            <button-simple
              @click="openUnsetDayOffModal(dayOff)"
              :title="$t('days_off.delete')"
              icon="trash"
            />
          </div>
        </li>
      </ul>
    </section>

    <div
      class="has-text-centered mt2 mb1 strong"
      v-if="sortedDaysOff.length === 0 && !isLoading && !isError"
    >
      <p>{{ $t('days_off.no_days_off') }}</p>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :cells="1"
      :with-thumbnail="false"
    />

    <day-off-modal
      :active="modals.setDayOff"
      :day-off-to-edit="dayOffToEdit"
      :is-error="isDayOffError"
      :error-text="dayOffTextError"
      @confirm="
        dayOff => {
          $emit('set-day-off', dayOff)
        }
      "
      @cancel="closeSetDayOffModal"
    />

    <delete-modal
      :active="modals.unsetDayOff"
      :text="
        $t('days_off.confirm_unset_day_offs', {
          start: formatUtcDay(dayOffToEdit?.date),
          end: formatUtcDay(dayOffToEdit?.end_date)
        })
      "
      :is-error="isDayOffError"
      :error-text="dayOffTextError"
      @confirm="$emit('unset-day-off', dayOffToEdit)"
      @cancel="closeUnsetDayOffModal"
    />
  </div>
</template>

<script setup>
import moment from 'moment-timezone'
import { computed, reactive, ref } from 'vue'

import { getBusinessDays, getUserDay } from '@/lib/time'

import DayOffModal from '@/components/modals/DayOffModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  daysOff: {
    default: () => [],
    type: Array
  },
  isLoading: {
    default: false,
    type: Boolean
  },
  isError: {
    default: false,
    type: Boolean
  },
  dayOffError: {
    default: false,
    type: [String, Boolean]
  }
})

const emit = defineEmits([
  'set-day-off',
  'unset-day-off',
  'update:day-off-error'
])

// State
// --------------------------------------------------------------------------
const dayOffToEdit = ref(null)
const modals = reactive({
  setDayOff: false,
  unsetDayOff: false
})

// Computed
// --------------------------------------------------------------------------
const isDayOffError = computed(() => Boolean(props.dayOffError))

const dayOffTextError = computed(() =>
  props.dayOffError?.length ? props.dayOffError : null
)

const sortedDaysOff = computed(() =>
  [...props.daysOff]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(dayOff => {
      const start = moment.utc(dayOff.date)
      const end = moment.utc(dayOff.end_date || dayOff.date)
      return {
        ...dayOff,
        date: start.toDate(),
        end_date: end.toDate()
      }
    })
)

const formatCardDay = date => {
  const day = moment.utc(date)
  return day.format(day.year() === moment().year() ? 'ddd D MMM' : 'll')
}

const groups = computed(() => {
  const today = getUserDay().toDate()
  const cards = sortedDaysOff.value.map(dayOff => ({
    ...dayOff,
    day: moment.utc(dayOff.date).format('D'),
    month: moment.utc(dayOff.date).format('MMM'),
    nbDays: getBusinessDays(
      moment.utc(dayOff.date),
      moment.utc(dayOff.end_date)
    ),
    period:
      dayOff.date.getTime() === dayOff.end_date.getTime()
        ? formatCardDay(dayOff.date)
        : `${formatCardDay(dayOff.date)} → ${formatCardDay(dayOff.end_date)}`
  }))
  return [
    {
      key: 'upcoming',
      daysOff: cards.filter(dayOff => dayOff.end_date >= today).reverse()
    },
    { key: 'past', daysOff: cards.filter(dayOff => dayOff.end_date < today) }
  ].filter(group => group.daysOff.length > 0)
})

// Functions
// --------------------------------------------------------------------------
// The rows hold their days at UTC midnight, as the utc date fields of the
// form do: the user time zone would name the day before west of UTC.
const formatUtcDay = date => (date ? moment.utc(date).format('YYYY-MM-DD') : '')

// The page keeps the error of a refused confirm: each form opens without it.
const openSetDayOffModal = (dayOff = null) => {
  emit('update:day-off-error', false)
  dayOffToEdit.value = dayOff || { date: getUserDay().toDate() }
  modals.setDayOff = true
}

const openUnsetDayOffModal = dayOff => {
  emit('update:day-off-error', false)
  dayOffToEdit.value = dayOff
  modals.unsetDayOff = true
}

const closeSetDayOffModal = () => {
  modals.setDayOff = false
}

const closeUnsetDayOffModal = () => {
  modals.unsetDayOff = false
}

// The parent pages close the modals from their day-off event handlers.
defineExpose({ closeSetDayOffModal, closeUnsetDayOffModal })
</script>

<style lang="scss" scoped>
.header {
  align-items: center;
  background: var(--background-panel);
  border-radius: 12px;
  margin: 0.5em 0 1em;
  padding: 1em;
}

.day-off-total {
  color: var(--text-strong);
  font-weight: 600;
}

.day-off-group {
  background: var(--background-panel);
  border-radius: 12px;
  margin-bottom: 1em;
  padding: 1em;
}

.day-off-group-title {
  align-items: center;
  color: var(--text-strong);
  display: flex;
  font-size: 0.9rem;
  font-weight: 600;
  gap: 0.5em;
  padding: 0 0 0.75em;
}

.day-off-group-count {
  color: var(--text);
  font-size: 0.75rem;
  opacity: 0.6;
}

.day-off-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  // the global list margin pushed the cards right of their title
  margin: 0;
}

.day-off-card {
  align-items: center;
  // background-alt-2 is white in light theme: the cards must stand out
  // from the panel, which sits close to background-alt there
  background: var(--background-alt-2);
  border: 1px solid transparent;
  border-radius: 10px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 1em;
  padding: 0.75em 1em;

  .day-off-group--past & {
    opacity: 0.6;
  }

  .actions {
    opacity: 0;
    transition: opacity 150ms ease-out;
  }

  &:hover .actions,
  &:focus-within .actions {
    opacity: 1;
  }
}

// background-alt-2 is a flat light grey in dark theme: one step above the
// panel reads better
.dark .day-off-card {
  background: var(--background);
}

.day-off-tile {
  align-items: center;
  background: rgba($purple-strong, 0.15);
  border-radius: 8px;
  color: var(--text-strong);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  justify-content: center;
  height: 52px;
  line-height: 1.1;
  width: 52px;
}

.day-off-tile-month {
  font-size: 0.7rem;
  font-weight: 600;
  opacity: 0.7;
  text-transform: uppercase;
}

.day-off-tile-day {
  font-size: 1.3rem;
  font-weight: 700;
}

.day-off-main {
  flex: 1;
  min-width: 0;
}

.day-off-period {
  color: var(--text-strong);
  font-weight: 600;
}

.day-off-description {
  color: var(--text);
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-off-count {
  background: rgba(var(--skeleton-rgb), 0.25);
  border-radius: 999px;
  color: var(--text-strong);
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.15em 0.75em;
}

.actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.5em;
}

@media (hover: none) {
  .day-off-card .actions {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .day-off-card .actions {
    transition: none;
  }
}

@media (max-width: 768px) {
  // no hover on a phone: the actions show at once
  .day-off-card .actions {
    opacity: 1;
  }

  .header,
  .day-off-group {
    padding: 0.5em;
  }

  .day-off-card {
    gap: 0.75em;
    padding: 0.6em 0.75em;
  }
}
</style>
