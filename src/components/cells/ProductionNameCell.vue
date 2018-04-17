<template>
<td class="production-name">
  <div class="level">
    <div class="level-left">
      <router-link :to="productionRoute">
        <span
           class="level-item avatar has-text-centered"
           v-if="withAvatar"
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
      </router-link>
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
    },
    withAvatar: {
      default: true,
      type: Boolean
    },
    lastProductionScreen: {
      default: 'assets',
      type: String
    }
  },

  computed: {
    ...mapGetters([
    ]),

    productionRoute () {
      return {
        name: this.lastProductionScreen,
        params: {
          production_id: this.entry.id
        }
      }
    }
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
.production-name a {
  color: inherit;
}
</style>
