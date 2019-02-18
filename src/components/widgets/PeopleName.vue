<template>
<span class="person-name">
  {{ person.first_name + ' ' + person.last_name }}
</span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'person-name',
  props: [
    'person'
  ],
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
.dark .person-name {
  color: $white-grey;
}
</style>
