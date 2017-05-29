<template>
<td class="name">
  <div class="level">
    <div class="level-left">
      <people-avatar class="avatar" :person="entry"></people-avatar>
      <people-name :person="entry"></people-name>
    </div>
  </div>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleAvatar from '../widgets/PeopleAvatar'
import PeopleName from '../widgets/PeopleName'

export default {
  name: 'people-name-cell',
  components: {
    PeopleName,
    PeopleAvatar
  },
  props: [
    'entry'
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

<style scoped>
</style>
