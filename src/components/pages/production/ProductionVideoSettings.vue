<template>
  <div class="columns">
    <div class="column is-one-third box">
      <form class="form" @submit.prevent="save">
        <p class="explanation">
          {{ $t('productions.creation.explanation_video') }}
        </p>
        <p class="explanation mb1">
          {{ $t('productions.video.next_uploads_only') }}
        </p>
        <text-field
          type="number"
          :max="60"
          :step="0.001"
          :label="$t('productions.fields.fps')"
          placeholder="25"
          v-model="form.fps"
        />
        <text-field
          :label="$t('productions.fields.ratio')"
          placeholder="16:9"
          :maxlength="10"
          v-model.trim="form.ratio"
        />
        <text-field
          :label="$t('productions.fields.resolution')"
          placeholder="1920x1080"
          v-model.trim="form.resolution"
        />
        <h3 class="section-title">
          {{ $t('productions.video.bitrates') }}
        </h3>
        <p class="explanation mb1">
          {{ $t('productions.video.bitrate_explanation') }}
        </p>
        <movie-bitrate-field
          :default-value="bitrateDefaults.hd_bitrate_compression"
          :description="$t('productions.video.hd_bitrate_description')"
          :label="$t('productions.fields.hd_bitrate_compression')"
          :max="bitrateDefaults.hd_bitrate_compression"
          v-model="form.hd_bitrate_compression"
        />
        <movie-bitrate-field
          :default-value="bitrateDefaults.ld_bitrate_compression"
          :description="$t('productions.video.ld_bitrate_description')"
          :label="$t('productions.fields.ld_bitrate_compression')"
          :max="ldBitrateCeiling"
          v-model="form.ld_bitrate_compression"
        />
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
    </div>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { clampBitrate, clampBitrates } from '@/lib/productions'

import MovieBitrateField from '@/components/pages/production/MovieBitrateField.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import TextField from '@/components/widgets/TextField.vue'

// Composables
// --------------------------------------------------------------------------
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

const ldBitrateCeiling = computed(
  () =>
    clampBitrate(
      form.value.hd_bitrate_compression,
      bitrateDefaults.value.hd_bitrate_compression
    ) ?? bitrateDefaults.value.hd_bitrate_compression
)

// Functions
// --------------------------------------------------------------------------
const resetForm = () => {
  const production = currentProduction.value || {}
  form.value = {
    fps: production.fps ?? '',
    ratio: production.ratio ?? '',
    resolution: production.resolution ?? '',
    hd_bitrate_compression: production.hd_bitrate_compression ?? '',
    ld_bitrate_compression: production.ld_bitrate_compression ?? ''
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
.columns {
  margin-bottom: 2em;
}

.column {
  overflow-y: initial;
  padding: initial;
}

.box {
  padding: 2em;
}

.explanation {
  color: var(--text-alt);
}

.section-title {
  color: var(--text);
  font-size: 1.1em;
  font-weight: 500;
  margin: 1.5em 0 0.8em;
  text-transform: uppercase;
}
</style>
