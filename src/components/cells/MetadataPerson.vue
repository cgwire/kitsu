<template>
  <div class="metadata-person-cell">
    <span
      ref="displayRef"
      class="display"
      :class="{ clickable: editable }"
      role="button"
      tabindex="0"
      @click.stop="onOpen"
      @keydown.enter.stop.prevent="onOpen"
    >
      <template v-if="person">
        <people-avatar
          :person="person"
          :size="22"
          :font-size="11"
          :is-link="false"
        />
        <span class="ml05 ellipsis">{{ person.name }}</span>
      </template>
    </span>
    <teleport to=".theme">
      <template v-if="isOpen">
        <div class="metadata-person-mask" @click="onClose"></div>
        <!-- Tab leaves it like a click outside. Captured: the people field
             stops the propagation of Tab. -->
        <div
          class="metadata-person-popup"
          :style="popupStyle"
          @keydown.esc="onClose"
          @keydown.tab.capture="onClose"
        >
          <people-field
            ref="fieldRef"
            wide
            :list-max-height="listMaxHeight"
            :open-direction="listDirection"
            :people="people"
            :model-value="person"
            @update:model-value="onSelect"
          />
        </div>
      </template>
    </teleport>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'

import { getPopupPlacement } from '@/lib/popup'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'

const props = defineProps({
  person: { type: Object, default: null },
  people: { type: Array, default: () => [] },
  editable: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])

const WIDTH = 280
// The people field and its list, at the PeopleField default max height.
const FIELD_HEIGHT = 42
const LIST_HEIGHT = 300

const isOpen = ref(false)
const displayRef = ref(null)
const fieldRef = ref(null)
const popupStyle = ref({})
const listDirection = ref('')
const listMaxHeight = ref(LIST_HEIGHT)

const onOpen = event => {
  if (!props.editable) return
  const { isBelow, room, style } = getPopupPlacement(
    event.currentTarget.getBoundingClientRect(),
    { width: WIDTH, height: FIELD_HEIGHT + LIST_HEIGHT },
    { width: window.innerWidth, height: window.innerHeight }
  )
  popupStyle.value = style
  // Away from the cell: the second click of a double click then lands on the
  // mask, not on an option that would replace or clear the person.
  listDirection.value = isBelow ? 'below' : 'above'
  listMaxHeight.value = Math.min(LIST_HEIGHT, room - FIELD_HEIGHT)
  isOpen.value = true
  nextTick(() => fieldRef.value?.focus())
}

const onSelect = person => {
  emit('select', person?.id ?? '')
  onClose()
}

const onClose = () => {
  isOpen.value = false
  // Before Tab moves the focus, so it goes on from the cell. A clipped cell
  // stays where it is.
  displayRef.value?.focus({ preventScroll: true })
}
</script>

<style lang="scss" scoped>
.metadata-person-cell {
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
}

.display {
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding: 0 0.5rem;
  width: 100%;

  &.clickable {
    cursor: pointer;
  }
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metadata-person-mask {
  inset: 0;
  position: fixed;
  z-index: 1200;
}

.metadata-person-popup {
  position: fixed;
  z-index: 1201;
}
</style>
