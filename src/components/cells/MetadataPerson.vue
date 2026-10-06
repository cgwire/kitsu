<template>
  <div class="metadata-person-cell">
    <span
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
        <div class="metadata-person-popup" :style="popupStyle">
          <people-field
            ref="fieldRef"
            wide
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

import { getPopupStyle } from '@/lib/popup'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'

const props = defineProps({
  person: { type: Object, default: null },
  people: { type: Array, default: () => [] },
  editable: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])

const isOpen = ref(false)
const fieldRef = ref(null)
const popupStyle = ref({})

const WIDTH = 280
// The people field input only: its option list opens on the side with room.
const HEIGHT = 42

const onOpen = event => {
  if (!props.editable) return
  popupStyle.value = getPopupStyle(
    event.currentTarget.getBoundingClientRect(),
    { width: WIDTH, height: HEIGHT },
    { width: window.innerWidth, height: window.innerHeight }
  )
  isOpen.value = true
  nextTick(() => fieldRef.value?.focus())
}

const onSelect = person => {
  emit('select', person?.id ?? '')
  isOpen.value = false
}

const onClose = () => {
  isOpen.value = false
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
