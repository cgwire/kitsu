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
  {{ person.first_name + ' ' + person.last_name }}
</router-link>
<span class="person-name" v-else>
  {{ person.first_name + ' ' + person.last_name }}
</span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'person-name',
  props: {
    person: {
      type: Object,
      required: true
    },
    withLink: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style lang="scss" scoped>
.person-name {
  color: var(--text);
}
</style>
