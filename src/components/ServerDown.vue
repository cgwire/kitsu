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
import auth from '../lib/auth'

export default {
  name: 'server-down',
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'user'
    ])
  },
  methods: {
    ...mapActions([
    ])
  },
  mounted () {
    auth.isServerLoggedIn((err) => {
      const target = this.$store.state.route.query.redirect
      if (!err) {
        this.$router.push(target)
      }
    })
  }
}
</script>

<style lang="scss" scoped>
</style>
