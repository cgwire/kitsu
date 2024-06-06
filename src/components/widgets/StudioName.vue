<template>
  <div>
    <span class="square" :style="{ backgroundColor: studio.color }"></span>
    {{ studio.name }}
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'studio-name',
  components: {},

  props: {
    studioId: {
      type: String,
      default: null
    }
  },

  computed: {
    ...mapGetters(['studioMap']),

    studio() {
      return this.studioMap.get(this.studioId)
    }
  },

  methods: {
    ...mapActions([])
  }
}
</script>

<style lang="scss" scoped>
.square {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
}
</style>
