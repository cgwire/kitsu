<template>
  <div class="not-found page">
    <h1 class="title">{{ $t('not_found.title') }}</h1>
    <p>
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

<style scoped>
</style>
