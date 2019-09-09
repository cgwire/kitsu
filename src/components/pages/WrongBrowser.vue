<template>
  <div class="server-down page">
    <h1 class="title">{{ $t('wrong_browser.title') }}</h1>
    <p>
      {{ $t('wrong_browser.text') }}
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'server-down',
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ])
  },
  mounted () {
  }
}
</script>

<style lang="scss" scoped>
</style>
