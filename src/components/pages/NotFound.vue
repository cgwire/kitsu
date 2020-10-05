<template>
  <div class="not-found page">
    <h1 class="title has-text-centered">{{ $t('not_found.title') }}</h1>
    <p class="has-text-centered">
      {{ $t('not_found.text') }}
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'not-found',
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style lang="scss" scoped>
</style>
