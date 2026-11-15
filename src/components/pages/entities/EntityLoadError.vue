<template>
  <div>
    <template v-if="error === 'missing'">
      <p>{{ $t('not_found.text') }}</p>
      <p>
        <router-link :to="{ name: 'home' }">
          {{ $t('main.home') }}
        </router-link>
      </p>
    </template>
    <button-simple
      class="reload-button"
      :text="$t('main.reload')"
      @click="emit('reload')"
      v-else
    />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

// Props / Emits
// --------------------------------------------------------------------------
defineProps({
  // Why the page shows no entity: 'missing' (deleted, out of the user's
  // reach, or a broken link) or 'failed' (a server error, or no answer).
  error: { type: String, default: 'failed' }
})
const emit = defineEmits(['reload'])
</script>

<style lang="scss" scoped>
// The pages lay it out as a flex column, which would stretch the button.
.reload-button {
  align-self: flex-start;
}
</style>
