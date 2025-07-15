<template>
  <button
    :class="{
      'level-item': true,
      button: true,
      'is-toggle': true,
      'is-on': buttonIsOn
    }"
    :title="$t(buttonIsOn ? 'tasks.hide_infos' : 'tasks.show_infos')"
    @click="toggleInfos"
  >
    <kitsu-icon
      class="icon is-small"
      name="infos"
      :title="$t(buttonIsOn ? 'tasks.hide_infos' : 'tasks.show_infos')"
    />
  </button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import KitsuIcon from '@/components/widgets/KitsuIcon.vue'

export default {
  name: 'show-infos-button',

  components: {
    KitsuIcon
  },

  computed: {
    ...mapGetters(['isShowInfosBreakdown']),

    buttonIsOn() {
      return this.isShowInfosBreakdown
    }
  },

  methods: {
    ...mapActions(['hideInfosBreakdown', 'showInfosBreakdown']),

    toggleInfos() {
      if (this.isShowInfosBreakdown) {
        this.hideInfosBreakdown()
      } else {
        this.showInfosBreakdown()
      }
    }
  },

  mounted() {
    if (localStorage.getItem('show-infos-breakdown') === 'false') {
      this.hideInfosBreakdown()
    } else {
      this.showInfosBreakdown()
    }
  },

  watch: {
    isShowInfosBreakdown() {
      const value = this.isShowInfosBreakdown.toString()
      localStorage.setItem('show-infos-breakdown', value, {
        expires: '1M'
      })
    }
  }
}
</script>

<style scoped>
.button {
  border-radius: 10px;
  padding: 0 10px;
}

.button .icon {
  height: 18px;
  width: 18px;
}
</style>
