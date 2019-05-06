<template>
<button
  :class="{
    'level-item': true,
    button: true,
    'is-toggle': true,
    'is-on': isShowInfos
  }"
  :title="$t(isShowInfos ? 'tasks.hide_infos' : 'tasks.show_infos')"
  @click="toggleInfos"
>
  <database-icon class="icon is-small" />
</button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  DatabaseIcon
} from 'vue-feather-icons'

export default {
  name: 'show-infos-button',
  components: {
    DatabaseIcon
  },

  props: {
  },

  computed: {
    ...mapGetters([
      'isShowInfos'
    ])
  },

  methods: {
    ...mapActions([
      'showInfos',
      'hideInfos'
    ]),

    toggleInfos () {
      if (this.isShowInfos) {
        this.hideInfos()
      } else {
        this.showInfos()
      }
    }
  },

  mounted () {
    if (localStorage.getItem('show-infos') === 'false') {
      this.hideInfos()
    } else {
      this.showInfos()
    }
  },

  watch: {
    isShowInfos () {
      localStorage.setItem(
        'show-infos',
        this.isShowInfos,
        { expires: '1M' }
      )
    }
  }
}
</script>
