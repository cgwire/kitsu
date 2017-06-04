<template>
  <div class="server-down page">
    <h1 class="title">{{ $t('server_down.title') }}</h1>
    <p>
      {{ $t('server_down.text') }}
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
  }
}
</script>

<style scoped>
</style>
