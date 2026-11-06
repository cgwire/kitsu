<template>
  <div class="public-page-settings">
    <label class="language" :title="$t('profile.language')">
      <select
        class="language-select"
        :aria-label="$t('profile.language')"
        :value="currentLanguage.value"
        @change="onLanguageChange"
      >
        <option
          :key="language.value"
          :value="language.value"
          v-for="language in languages"
        >
          {{ language.native }}
        </option>
      </select>
      <span class="setting">
        <languages-icon :size="16" />
        <chevron-down-icon :size="14" />
      </span>
    </label>
    <button
      class="theme-button"
      type="button"
      role="switch"
      :aria-checked="isDarkTheme"
      :aria-label="$t('main.dark_theme')"
      :title="$t('main.dark_theme')"
      @click="toggleDarkTheme"
    >
      <span class="theme-knob">
        <moon-icon :size="12" v-if="isDarkTheme" />
        <sun-icon :size="12" v-else />
      </span>
    </button>
  </div>
</template>

<script setup>
import {
  ChevronDownIcon,
  LanguagesIcon,
  MoonIcon,
  SunIcon
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useStore } from 'vuex'

import lang, { currentLanguage, languages } from '@/lib/lang'

// Composables
// --------------------------------------------------------------------------

const store = useStore()

// Computed
// --------------------------------------------------------------------------

const isDarkTheme = computed(() => store.getters.isDarkTheme)

// Functions
// --------------------------------------------------------------------------

const onLanguageChange = event => lang.pickLocale(event.target.value)

const toggleDarkTheme = () => store.dispatch('toggleDarkTheme')
</script>

<style lang="scss" scoped>
.public-page-settings {
  align-items: center;
  display: flex;
  gap: 0.5em;
  position: fixed;
  right: 0.75em;
  top: 0.75em;
  z-index: 10;
}

.setting {
  align-items: center;
  border-radius: 6px;
  color: var(--text-strong);
  cursor: pointer;
  display: flex;
  font-size: 0.85em;
  gap: 4px;
  height: 2.2em;
  padding: 0 0.6em;
}

.language:hover .setting {
  background: var(--background-hover);
}

.theme-button {
  background: var(--background-hover);
  border: 1px solid var(--border-alt);
  border-radius: 11px;
  cursor: pointer;
  height: 22px;
  padding: 0;
  position: relative;
  transition: border-color 0.25s;
  width: 40px;

  &:hover {
    border-color: $green;
  }

  &:focus-visible {
    outline: 2px solid var(--text-selected);
    outline-offset: 1px;
  }
}

.theme-knob {
  align-items: center;
  background: var(--background);
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  color: var(--text);
  display: flex;
  height: 18px;
  justify-content: center;
  left: 1px;
  position: absolute;
  top: 1px;
  transition: transform 0.25s;
  width: 18px;

  .dark & {
    transform: translateX(18px);
  }
}

.language {
  display: block;
  position: relative;
}

// The native list opens from the whole control, so it works with a keyboard,
// on a phone, and with a screen reader, in the colors of the theme. iOS zooms
// in on a focused field under 16px.
.language-select {
  cursor: pointer;
  font-size: 16px;
  height: 100%;
  inset: 0;
  opacity: 0;
  position: absolute;
  width: 100%;

  &:focus-visible + .setting {
    outline: 2px solid var(--text-selected);
    outline-offset: 1px;
  }
}
</style>
