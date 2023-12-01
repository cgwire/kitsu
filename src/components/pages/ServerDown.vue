<template>
  <div class="server-down page has-text-centered">
    <div class="illustration">
      <img src="@/assets/illustrations/500.png" />
    </div>
    <h1 class="title">{{ $t('server_down.title') }}</h1>
    <p>
      {{ $t('server_down.text') }}
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import auth from '@/lib/auth'

export default {
  name: 'server-down',
  computed: {
    ...mapGetters(['isAuthenticated', 'user'])
  },
  mounted() {
    auth.isServerLoggedIn(err => {
      if (!err) {
        const target = this.$store.state.route.query.redirect || '/'
        this.$router.push(target)
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.page {
}

.illustration {
  max-width: 1000px;
  margin: auto;
  img {
    border-radius: 3rem;
    margin-bottom: 2rem;
  }
}

p {
  font-size: 1.3em;
  padding-bottom: 1em;

  a {
    text-decoration: underline;
  }
}

.title {
  color: var(--text);
  font-weight: bold;
  font-size: 2.4em;
}
</style>
