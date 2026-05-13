<template>
  <td
    :class="{
      canceled,
      disabled,
      selected: selectable & selected,
      validation: selectable
    }"
    :style="cellStyle"
    @click="onClick"
  >
    <div class="wrapper full-wrapper" :style="wrapperStyle" v-if="!minimized">
      <div class="filler" v-if="contactSheet"></div>
      <div
        class="wrapper status-wrapper"
        :style="statusWrapperStyle"
        v-if="!minimized"
      >
        <template v-if="task">
          <span class="tag" :title="taskStatus.name" :style="tagStyle">
            {{ taskStatus.short_name }}
          </span>
          <span class="filler" v-if="contactSheet"></span>
          <span
            :class="{
              priority: true,
              high: task.priority === 1,
              veryhigh: task.priority === 2,
              emergency: task.priority === 3
            }"
            :title="formatPriority(task.priority)"
            v-if="!isCurrentUserClient && !disabled && task.priority > 0"
          >
            {{ priority }}
          </span>
          <span
            class="casting-status"
            :class="{ 'casting-status-not-ready': !isCastingReady }"
            :title="castingTitle"
            v-if="!isCurrentUserClient && castingTitle"
          >
            <img src="@/assets/icons/casting-ready.png" v-if="isCastingReady" />
            <img src="@/assets/icons/casting-not-ready.png" v-else />
          </span>
        </template>
        <template v-if="isAssignees && !isCurrentUserClient && !disabled">
          <span
            class="avatar has-text-centered"
            :title="person.full_name"
            :style="{
              backgroundColor: person.color,
              color: isDarkTheme ? '#333' : '#FFF',
              'font-weight': isDarkTheme ? 'bold' : 'normal'
            }"
            :key="`avatar-${person.id}`"
            v-for="person in assignees"
          >
            <img
              loading="lazy"
              alt=""
              :src="person.avatarPath"
              v-if="person.has_avatar"
            />
            <template v-else>{{ person.initials }}</template>
          </span>
        </template>
        <span class="subscribed" v-if="task?.is_subscribed">
          <eye-icon :size="12" />
        </span>
      </div>
    </div>
    <div class="wrapper" v-else>
      <span class="tag" :style="tagStyle"> &nbsp; </span>
    </div>
  </td>
</template>

<script setup>
import { EyeIcon } from 'lucide-vue-next'
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { useStore } from 'vuex'

import { useFormat } from '@/composables/format'
import colors from '@/lib/colors'
import { sortPeople } from '@/lib/sorting'

const store = useStore()
const { formatPriority, formatPrioritySymbol } = useFormat()

const props = defineProps({
  canceled: { type: Boolean, default: false },
  castingTitle: { type: String, default: '' },
  clickable: { type: Boolean, default: true },
  column: { type: Object, default: null },
  columnY: { type: Number, default: 0 },
  contactSheet: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  entity: { type: Object, default: null },
  isAssignees: { type: Boolean, default: true },
  isBorder: { type: Boolean, default: true },
  isCastingReady: { type: Boolean, default: false },
  left: { type: String, default: '0px' },
  minimized: { type: Boolean, default: false },
  rowX: { type: Number, default: 0 },
  selectable: { type: Boolean, default: true },
  selected: { type: Boolean, default: false },
  sticked: { type: Boolean, default: false },
  taskTest: { type: Object, default: null }
})

const emit = defineEmits(['select', 'unselect'])

const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isDarkTheme = computed(() => store.getters.isDarkTheme)
const personMap = computed(() => store.getters.personMap)
const taskMap = computed(() => store.getters.taskMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)

const task = ref(null)

const resolveTask = () => {
  if (props.taskTest) {
    task.value = props.taskTest
  } else if (props.column && props.entity?.validations) {
    task.value = taskMap.value.get(
      props.entity.validations.get(props.column.id)
    )
  }
}

const taskStatus = computed(
  () => taskStatusMap.value?.get(task.value?.task_status_id) || {}
)

const assignees = computed(() =>
  sortPeople(
    task.value?.assignees
      .map(personId => personMap.value.get(personId))
      .filter(Boolean) ?? []
  )
)

const priority = computed(() => formatPrioritySymbol(task.value.priority))

const cellStyle = computed(() => {
  let backgroundColor
  if (props.isBorder && !props.sticked) {
    const opacity = isDarkTheme.value ? 0.15 : 0.08
    backgroundColor = colors.hexToRGBa(props.column.color, opacity)
  }
  return {
    borderLeft: props.isBorder ? `1px solid ${props.column.color}` : 'none',
    backgroundColor,
    left: props.left
  }
})

const tagStyle = computed(() => {
  const isTodo = taskStatus.value.name === 'Todo'
  let backgroundColor
  if (isTodo) {
    backgroundColor = isDarkTheme.value ? '#5F626A' : '#ECECEC'
  } else if (taskStatus.value.color) {
    backgroundColor = isDarkTheme.value
      ? colors.darkenColor(taskStatus.value.color)
      : taskStatus.value.color
  } else {
    backgroundColor = 'transparent'
  }
  const color = !isTodo || isDarkTheme.value ? 'white' : '#333'
  return { backgroundColor, color }
})

const wrapperStyle = computed(() => {
  if (!task.value || !props.contactSheet) return {}
  const path =
    '/api/pictures/thumbnails/preview-files/' +
    task.value.last_preview_file_id +
    '.png'
  return {
    'background-image': 'url(' + path + ')',
    'background-color': taskStatus.value.color + '44',
    height: '100px',
    width: '150px',
    display: 'flex',
    'flex-direction': props.contactSheet ? 'column' : 'row'
  }
})

const statusWrapperStyle = computed(() => {
  if (!task.value || !props.contactSheet) return { padding: '6px' }
  return {
    width: '150px',
    padding: '6px',
    'text-align:': 'right'
  }
})

const select = event => {
  if (!props.selectable) return
  const payload = {
    entity: props.entity,
    column: props.column,
    task: task.value,
    x: props.rowX,
    y: props.columnY,
    isCtrlKey: event.ctrlKey || event.metaKey,
    isShiftKey: event.shiftKey,
    isUserClick: event.isUserClick !== false
  }
  if (props.selected) {
    emit('unselect', payload)
  } else {
    emit('select', payload)
  }
}

const onClick = event => {
  if (props.clickable) select(event)
}

watch(() => props.taskTest, resolveTask)

onMounted(resolveTask)

// Read via $refs by entity_list.js / selection.js for shift-click range selection.
// <script setup> hides everything by default.
defineExpose({
  task,
  selectable: toRef(props, 'selectable'),
  entity: toRef(props, 'entity'),
  column: toRef(props, 'column'),
  rowX: toRef(props, 'rowX'),
  columnY: toRef(props, 'columnY')
})
</script>

<style lang="scss" scoped>
.validation {
  cursor: pointer;
  margin-bottom: 3px;
  padding: 0;

  &.selected {
    background-color: #bfc1ff !important;

    .dark & {
      background-color: #5e60ba !important;
    }
  }

  &:not(.selected):hover {
    background-color: #cfd1ff !important;

    .dark & {
      background-color: #6e70ca !important;
    }
  }
}

.wrapper {
  display: flex;
  flex-wrap: wrap;
  position: relative;
  width: 100%;
}

.full-wrapper {
  flex: 1;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
  width: 21px;
  height: 21px;
  font-size: 10px;

  img {
    width: 21px;
    height: 21px;
  }
}

.tag {
  font-weight: 500;
  letter-spacing: 1px;
  margin-right: 0.1em;
  margin-bottom: 0.3em;
  text-transform: uppercase;
}

.disabled {
  background-color: rgba(0, 0, 0, 0.15) !important;

  .tag {
    opacity: 0;
  }
}

.casting-status {
  position: absolute;
  right: 4px;
  top: -2px;

  &.casting-status-not-ready {
    opacity: 0.5;
  }

  img {
    width: 12px;
  }
}

.subscribed {
  position: absolute;
  bottom: -4px;
  right: 4px;
  color: $grey;
}

.priority {
  border-radius: 5px;
  color: white;
  display: inline-block;
  font-weight: bold;
  height: 21px;
  margin-left: 5px;
  margin-right: 3px;
  min-width: 23px;
  text-align: center;

  &.high {
    background-color: $yellow;
  }

  &.veryhigh {
    background-color: $orange;
  }

  &.emergency {
    background-color: $red;
  }
}
</style>
