<template>
  <form class="production-video form" @submit.prevent="save">
    <video-settings-form v-model="form" :default-bitrates="bitrateDefaults">
      <template #previews-extra>
        <text-field
          class="number-line"
          type="number"
          :step="1"
          :min="0"
          :max="8"
          :description="$t('productions.video.revision_padding_description')"
          :label="$t('productions.fields.revision_padding')"
          v-model="form.revision_padding"
        />
      </template>
    </video-settings-form>

    <p v-if="isError" class="error mt1">
      {{ $t('productions.edit_error') }}
    </p>
    <div class="has-text-right mt2">
      <button-simple
        :is-primary="true"
        :class="{ 'is-loading': isLoading }"
        :disabled="isLoading"
        :text="$t('main.save')"
        type="submit"
      />
    </div>
  </form>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { clampBitrates } from '@/lib/productions'

import VideoSettingsForm from '@/components/pages/production/VideoSettingsForm.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import TextField from '@/components/widgets/TextField.vue'

const store = useStore()

// State
// --------------------------------------------------------------------------
const form = ref({})
const isLoading = ref(false)
const isError = ref(false)

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const bitrateDefaults = computed(() => store.getters.movieBitrateDefaults)

// Functions
// --------------------------------------------------------------------------
const resetForm = () => {
  const production = currentProduction.value || {}
  form.value = {
    fps: production.fps ?? '',
    ratio: production.ratio ?? '',
    resolution: production.resolution ?? '',
    hd_bitrate_compression: production.hd_bitrate_compression ?? '',
    ld_bitrate_compression: production.ld_bitrate_compression ?? '',
    revision_padding: production.revision_padding ?? 0,
    is_frame_in_numbering: !!production.is_frame_in_numbering,
    is_preview_download_allowed: !!production.is_preview_download_allowed,
    is_set_preview_automated: !!production.is_set_preview_automated,
    is_single_preview_per_revision: !!production.is_single_preview_per_revision
  }
}

const save = async () => {
  isLoading.value = true
  isError.value = false
  const bitrates = clampBitrates(form.value, {
    max: bitrateDefaults.value.hd_bitrate_compression
  })
  Object.assign(form.value, bitrates)
  try {
    await store.dispatch('editProduction', {
      ...form.value,
      id: currentProduction.value.id,
      ...bitrates
    })
  } catch {
    isError.value = true
  }
  isLoading.value = false
}

// Watchers
// --------------------------------------------------------------------------
watch(currentProduction, resetForm, { deep: true })

// Lifecycle
// --------------------------------------------------------------------------
onMounted(resetForm)
</script>

<style lang="scss" scoped>
.production-video {
  margin-bottom: 2em;
}
</style>
