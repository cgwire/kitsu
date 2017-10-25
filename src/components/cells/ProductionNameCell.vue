<template>
<td class="production-name">
  <div class="level">
    <div class="level-left">
      <span
         class="level-item avatar has-text-centered"
         v-bind:style="{
         background: getAvatarColor(entry),
         width: size + 'px',
         height: size + 'px'
      }">
        {{ generateAvatar(entry) }}
      </span>
      <span class="level-item" v-if="!onlyAvatar">
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
    },
    onlyAvatar: {
      default: false,
      type: Boolean
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
      const firstLetter = entry.name.length > 0 ? entry.name[0] : 'P'
      return firstLetter.toUpperCase()
    },
    getAvatarColor (entry) {
      return colors.fromString(entry.name)
    }
  }
}
</script>

<style scoped>
</style>
