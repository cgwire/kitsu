<template>
  <router-link
    class="person-name"
    :to="{
      name: 'person',
      params: {
        person_id: person.id
      }
    }"
    :title="person.full_name"
    v-if="person?.id && withLink"
  >
    {{ person.full_name }}
  </router-link>
  <span class="person-name" v-else-if="person">
    {{ person.full_name }}
  </span>
</template>

<script setup>
defineProps({
  person: {
    type: Object,
    required: true
  },
  withLink: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.person-name {
  color: var(--text);
}
</style>
