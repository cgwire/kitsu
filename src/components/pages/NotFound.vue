<template>
  <div class="not-found page has-text-centered">
    <img src="@/assets/404.png">
    <h1 class="title">{{ $t('not_found.title') }}</h1>
    <p>
      {{ $t('not_found.text') }}
    </p>
    <p>
      <a href="/">{{ $t('main.home') }}</a>
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
img {
  max-width: 1000px;
}

p {
  font-size: 1.3em;
  padding-bottom: 1em;

  a {
    text-decoration: underline;
  }
}
</style>
