<template>
<td class="name">
  <div class="level">
    <div class="level-left">
      <!--span class="avatar level-item has-text-centered">
        <img :src="'/api/thumbnails/projects/' + entry.id + '.png'" />
      </span-->
      <span
         class="level-item avatar has-text-centered"
         v-bind:style="{
         background: getAvatarColor(entry),
         width: size + 'px',
         height: size + 'px'
      }">
        {{ generateAvatar(entry) }}
      </span>
      <span class="level-item">
        {{ entry.name }}
      </span>
    </div>
  </div>
</td>
</template>

<script>
import colors from '../../lib/colors.js'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'production-name-cell',
  props: {
    entry: {
      default: '',
      type: Object
    },
    size: {
      default: 40,
      type: Number
    }
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    generateAvatar (entry) {
      return entry.name[0].toUpperCase()
    },
    getAvatarColor (entry) {
      return colors.fromString(entry.name)
    }
  }
}
</script>

<style scoped>
</style>
