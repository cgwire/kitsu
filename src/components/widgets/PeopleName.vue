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
    v-if="withLink"
  >
    {{ person.full_name }}
  </router-link>
  <span class="person-name" v-else>
    {{ person.full_name }}
  </span>
</template>

<script>
export default {
  name: 'people-name',
  props: {
    person: {
      type: Object,
      required: true
    },
    withLink: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.person-name {
  color: var(--text);
}
</style>
