<template>
  <router-link
    class="person-name"
    :to="{
      name: 'person',
      params: {
        person_id: person.id
      }
    }"
    :title="displayName"
    v-if="person?.id && withLink"
  >
    {{ displayName }}
  </router-link>
  <span class="person-name" v-else-if="person">
    {{ displayName }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  person: {
    type: Object,
    required: true
  },
  withLink: {
    type: Boolean,
    default: false
  }
})

// full_name is embedded by the API; name is the client-computed fallback.
const displayName = computed(
  () => props.person?.full_name || props.person?.name || undefined
)
</script>

<style lang="scss" scoped>
.person-name {
  color: var(--text);
}
</style>
