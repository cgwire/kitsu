<template>
  <div
    class="transfer-list-item"
    ref="root"
    role="button"
    tabindex="0"
    :title="
      action === 'remove' ? $t('main.click_to_remove') : $t('main.click_to_add')
    "
    @click="run(false)"
    @keydown.enter.prevent="onKey"
    @keydown.space.prevent="onKey"
  >
    <div class="item-line">
      <slot />
    </div>
    <x-icon
      class="action-icon remove-icon"
      :size="16"
      v-if="action === 'remove'"
    />
    <plus-icon class="action-icon add-icon" :size="16" v-else />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { PlusIcon, XIcon } from 'lucide-vue-next'
import { onBeforeUnmount, onUnmounted, useTemplateRef } from 'vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  // add: the item joins the other list, remove: it leaves this one.
  action: {
    type: String,
    default: 'add',
    validator: value => ['add', 'remove'].includes(value)
  }
})

const emit = defineEmits(['add', 'remove'])

// State
// --------------------------------------------------------------------------
const root = useTemplateRef('root')
let isKeyboardAction = false
let nextFocus = null

// Functions
// --------------------------------------------------------------------------
const run = fromKeyboard => {
  isKeyboardAction = fromKeyboard
  if (props.action === 'remove') emit('remove')
  else emit('add')
}

// A held key repeats: once this row has left, the next one has the focus
// and would take the repeats as its own presses.
const onKey = event => {
  if (!event.repeat) run(true)
}

const isRow = element => element?.classList.contains('transfer-list-item')

// Lifecycle
// --------------------------------------------------------------------------
// Once its action is done the row leaves the list. After a key press, the
// focus goes to the row that takes its place rather than to the top of the
// page. Not after a click: Space, which scrolls, would act on that row.
onBeforeUnmount(() => {
  const element = root.value
  if (isKeyboardAction && element && document.activeElement === element) {
    nextFocus =
      [element.nextElementSibling, element.previousElementSibling].find(
        isRow
      ) || null
  }
})

onUnmounted(() => {
  if (nextFocus?.isConnected) nextFocus.focus()
})
</script>

<style lang="scss" scoped>
.transfer-list-item {
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  gap: 0.5em;
  justify-content: space-between;
  padding: 0.3em 0.5em;

  & + & {
    margin-top: 2px;
  }

  .item-line {
    align-items: center;
    display: flex;
    min-width: 0;

    // The task type tags set a default cursor of their own.
    :deep(*) {
      cursor: pointer;
    }
  }

  // On the hover color, the gray text of the light theme would read 3.5:1.
  &:hover,
  &:focus-visible {
    background: var(--background-selectable);
    color: var(--text-strong);

    .action-icon {
      opacity: 1;
    }
  }
}

.action-icon {
  color: var(--text-strong);
  flex: 0 0 auto;
  opacity: 0;
}
</style>
