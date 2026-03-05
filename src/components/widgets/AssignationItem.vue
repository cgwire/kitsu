<template>
  <div class="flexrow">
    <people-avatar
      :is-link="false"
      :person="item"
      :size="30"
      :font-size="14"
      class="flexrow-item"
    />
    <span class="flexrow-item" v-html="label"></span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  search: {
    type: String
  }
})

const regExpEscape = (string) => {
  return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
}

const label = computed(() => {
  const text = props.item.name.trim()
  const search = props.search.trim()
  return !search
    ? text
    : text.replace(RegExp(regExpEscape(search), 'gi'), '<b>$&</b>')
})
</script>
