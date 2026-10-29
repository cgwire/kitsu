<template>
  <div class="client-access-settings">
    <div class="box section isolation-section">
      <h2 class="subtitle">{{ $t('productions.clients.isolation_title') }}</h2>
      <p class="description">
        {{ $t('productions.clients.isolation_description') }}
      </p>
      <checkbox
        class="isolation"
        :toggle="true"
        :label="$t('productions.fields.is_clients_isolated')"
        :model-value="!!settings.is_clients_isolated"
        @change="value => emit('update-setting', 'is_clients_isolated', value)"
      />
    </div>

    <div class="box section access-section">
      <h2 class="subtitle">{{ $t('productions.clients.access_title') }}</h2>
      <p class="description">
        {{ $t(copyKey('access_description')) }}
      </p>
      <div
        class="access-option"
        v-for="option in accessOptions"
        :key="option.flag"
      >
        <checkbox
          :class="`access-${option.name}`"
          :toggle="true"
          :label="$t(`productions.clients.access_${option.label}`)"
          :model-value="settings[option.flag] !== false"
          @change="value => emit('update-setting', option.flag, value)"
        />
        <p class="hint">
          {{ $t(copyKey(`access_${option.label}_description`)) }}
        </p>
      </div>
    </div>

    <div class="box section access-task-types">
      <h2 class="subtitle">
        {{ $t('productions.clients.access_task_types_title') }}
      </h2>
      <p class="description">
        {{ $t('productions.clients.access_task_types_description') }}
      </p>
      <p
        class="hint access-task-list-hint mb1"
        v-if="settings.is_client_task_list_visible === false"
      >
        {{ $t('productions.clients.access_task_list_hint') }}
      </p>
      <div
        class="task-type-group"
        v-for="group in taskTypeGroups"
        :key="group.entity"
      >
        <h3 class="task-type-group-title">{{ $t(group.label) }}</h3>
        <div
          class="flexrow access-task-type-row"
          v-for="taskType in group.taskTypes"
          :key="taskType.id"
        >
          <checkbox
            class="flexrow-item access-task-type"
            :toggle="true"
            :model-value="taskType.is_client_visible !== false"
            @change="value => emit('set-task-type-visible', taskType.id, value)"
          />
          <task-type-name
            class="flexrow-item"
            :task-type="taskType"
            :is-link="false"
          />
        </div>
      </div>
    </div>

    <div class="box section statuses">
      <h2 class="subtitle">{{ $t('productions.clients.statuses_title') }}</h2>
      <p class="description">
        {{ $t('productions.clients.statuses_description') }}
      </p>
      <button
        class="button is-link statuses-reset"
        type="button"
        :disabled="isSaving"
        @click="resetStatusesToStudio"
        v-if="overriddenStatuses.length"
      >
        {{ $t('productions.clients.statuses_use_studio_default') }}
      </button>
      <p class="empty" v-if="!taskStatuses.length">
        {{ $t(copyKey('statuses_empty')) }}
      </p>
      <div class="status-list" v-else>
        <div
          class="status-item"
          :class="{ 'is-overridden': !isStudioDefault(status) }"
          v-for="status in taskStatuses"
          :key="status.id"
        >
          <checkbox
            class="status-client-allowed"
            :toggle="true"
            :model-value="isClientAllowed(status)"
            @change="value => setStatusClientAllowed(status, value)"
          />
          <validation-tag
            class="status-tag"
            :is-static="true"
            :task="{ task_status_id: status.id }"
          />
          <span class="status-origin">
            {{
              isStudioDefault(status)
                ? $t('productions.clients.statuses_studio_default')
                : $t(copyKey('statuses_overridden'))
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import Checkbox from '@/components/widgets/Checkbox.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  // is_clients_isolated and the three is_client_*_visible flags
  settings: { type: Object, default: () => ({}) },
  // Task types in display order, each with its raw is_client_visible
  taskTypes: { type: Array, default: () => [] },
  // Studio statuses in display order, each with its link_is_client_allowed
  // override (null or missing: follows the studio value)
  taskStatuses: { type: Array, default: () => [] },
  isSaving: { type: Boolean, default: false },
  // Template pages swap the texts that name the production.
  isTemplate: { type: Boolean, default: false }
})
const emit = defineEmits([
  'set-status-client-allowed',
  'set-task-type-visible',
  'update-setting'
])

// State
// --------------------------------------------------------------------------
const TEMPLATE_KEYS = [
  'access_description',
  'access_stats_description',
  'statuses_empty',
  'statuses_overridden'
]

const accessOptions = [
  { name: 'stats', label: 'stats', flag: 'is_client_stats_visible' },
  {
    name: 'task-list',
    label: 'task_list',
    flag: 'is_client_task_list_visible'
  },
  {
    name: 'task-panel',
    label: 'task_panel',
    flag: 'is_client_task_panel_visible'
  }
]

// Computed
// --------------------------------------------------------------------------
// Clients never get the concept pages, so concept task types are left out
const taskTypeGroups = computed(() => {
  const groups = new Map()
  props.taskTypes
    .filter(taskType => taskType.for_entity !== 'Concept')
    .forEach(taskType => {
      const entity = taskType.for_entity
      if (!groups.has(entity)) {
        groups.set(entity, {
          entity,
          label: `${entity.toLowerCase()}s.title`,
          taskTypes: []
        })
      }
      groups.get(entity).taskTypes.push(taskType)
    })
  return [...groups.values()]
})

const overriddenStatuses = computed(() =>
  props.taskStatuses.filter(status => !isStudioDefault(status))
)

// Functions
// --------------------------------------------------------------------------
const copyKey = key =>
  props.isTemplate && TEMPLATE_KEYS.includes(key)
    ? `project_templates.clients.${key}`
    : `productions.clients.${key}`

const isClientAllowed = status =>
  typeof status.link_is_client_allowed === 'boolean'
    ? status.link_is_client_allowed
    : status.is_client_allowed

// An override equal to the studio value reads as the studio default
const isStudioDefault = status =>
  typeof status.link_is_client_allowed !== 'boolean' ||
  status.link_is_client_allowed === status.is_client_allowed

// null drops the override and follows the studio setting again
const resetStatusesToStudio = () =>
  overriddenStatuses.value.forEach(status =>
    emit('set-status-client-allowed', status.id, null)
  )

// Going back to the studio value clears the override, so the setting
// follows later studio changes again
const setStatusClientAllowed = (status, value) =>
  emit(
    'set-status-client-allowed',
    status.id,
    value === status.is_client_allowed ? null : value
  )
</script>

<style lang="scss" scoped>
.description {
  color: var(--text-alt);
  margin-bottom: 1em;
}

// One grid for every row: a long status name widens its column for all the
// rows, so the origin text starts at the same place on each line
.status-list {
  align-items: center;
  column-gap: 1em;
  display: grid;
  grid-template-columns: auto max-content 1fr;
  grid-auto-rows: minmax(2.5em, auto);
  margin-top: 1em;
  row-gap: 0.4em;
}

.status-item {
  display: contents;

  // The field, tag and button margins push each cell off the row centre
  > * {
    margin: 0;
  }

  .status-client-allowed {
    align-items: center;
    display: flex;
  }
}

.status-tag {
  justify-self: start;
}

.status-origin {
  color: var(--text-alt);
  font-size: 0.9em;

  .is-overridden & {
    color: var(--text);
    font-weight: 500;
  }
}

.statuses-reset {
  font-size: 0.9em;
  height: auto;
  margin-top: 0.5em;
  padding: 0.4em 0.8em;
}

// The explanation sits right under its toggle, the option keeps the
// common spacing below it
.access-option {
  margin-bottom: 0.4em;

  > .field {
    margin-bottom: 0;
  }

  .hint {
    margin: 0;
  }
}

.hint {
  color: var(--text-alt);
  font-size: 0.9em;
  margin: 0.3em 0 0;
}

.task-type-group + .task-type-group {
  margin-top: 1.5em;
}

.task-type-group-title {
  color: var(--text-strong);
  font-weight: bold;
  margin-bottom: 0.5em;
}

// Every toggle line of the clients settings shares one height and spacing
.isolation,
.access-task-type-row {
  align-items: center;
  display: flex;
  margin: 0 0 0.4em;
  min-height: 2.5em;

  // The field and tag margins break the vertical centring
  > * {
    margin-bottom: 0;
    margin-top: 0;
  }
}

.access-option > .field,
.access-task-type {
  align-items: center;
  display: flex;
  min-height: 2.5em;
}

.empty {
  color: var(--text-alt);
}

@media screen and (max-width: 768px) {
  .status-list {
    grid-template-columns: auto 1fr;
  }

  .status-origin {
    grid-column: 1 / -1;
  }
}
</style>
