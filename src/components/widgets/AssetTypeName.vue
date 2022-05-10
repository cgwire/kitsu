<template>
<div
>
  <span class="asset-type-name">
    {{ assetType.name }}
  </span>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'asset-type-name',
  components: {
  },

  props: {
    assetType: {
      type: Object,
      default: null
    }
  },

  computed: {
    ...mapGetters([
    ]),

    color () {
      if (this.assetType.color.toUpperCase() === '#000000') {
        return '$grey-strong'
      } else return this.assetType.color
    }
  },

  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style lang="scss" scoped>
div {
  border-radius: 5px;
  display: inline-block;
  padding: 0.4em 0.6em;
}

.asset-type-name {
  border: 1px solid var(--text);
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
}
</style>
