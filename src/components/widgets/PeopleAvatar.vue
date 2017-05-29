<template>
<span class="avatar level-item has-text-centered">
  <img :src="'/api/thumbnails/persons/' + person.id + '.png'" />
</span>
</template>

<script>
import colors from '../../lib/colors.js'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'person-avatar',
  props: [
    'person'
  ],
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    generateAvatar (person) {
      console.log(person)
      if (person !== null) {
        return (person.first_name[0] + person.last_name[0]).toUpperCase()
      } else {
        return 'No user logged'
      }
    },
    getAvatarColor (person) {
      if (person !== null) {
        return colors.fromString(person.first_name + person.last_name)
      } else {
        return '#CCC'
      }
    }
  }
}
</script>

<style scoped>
.avatar img {
  max-height: 100%;
}
</style>
