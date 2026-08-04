<template>
  <div class="server-down page">
    <h1 class="title">{{ $t('wrong_browser.title') }}</h1>
    <p>{{ outdatedText }}</p>
  </div>
</template>

<script setup>
// Imports
import Bowser from 'bowser'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Composables
const { t } = useI18n()

// State
const { name, version } = Bowser.getParser(
  window.navigator.userAgent
).getBrowser()
const detected = [name, version?.split('.')[0]].filter(Boolean).join(' ')

// Computed
// Keep t() in a computed: the legacy vue-i18n bridge returns '' during setup.
const outdatedText = computed(() =>
  t('wrong_browser.outdated', {
    browser: detected || t('main.unknown')
  })
)
</script>
