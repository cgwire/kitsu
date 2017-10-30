<template>
<span class="avatar has-text-centered"
   :style="{
     background: getAvatarColor(person),
     width: (size || 40) +'px',
     height: (size || 40) + 'px',
     'font-size': (fontSize || 18) + 'px'
   }">
   <span>
     {{ generateAvatar(person) }}
   </span>
</span>
</template>

<script>
import colors from '../../lib/colors.js'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'person-avatar',
  props: [
    'font-size',
    'person',
    'size'
  ],
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    generateAvatar (person) {
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
.avatar {
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
}
.avatar span {
  flex: 1;
}
</style>
