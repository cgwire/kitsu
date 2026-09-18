<template>
  <div class="columns">
    <div class="column is-one-third box">
      <form class="form" @submit.prevent="save">
        <p class="explanation mb1">
          {{ $t('productions.creation.explanation_video') }}
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
        <text-field
          type="number"
          :min="1"
          :max="200"
          :label="$t('productions.fields.hd_bitrate_compression')"
          placeholder="28"
          v-model="form.hd_bitrate_compression"
        />
        <text-field
          type="number"
          :min="1"
          :max="200"
          :label="$t('productions.fields.ld_bitrate_compression')"
          placeholder="6"
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
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { parseBitrate } from '@/lib/productions'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import TextField from '@/components/widgets/TextField.vue'

const store = useStore()

const form = ref({})
const isLoading = ref(false)
const isError = ref(false)

const currentProduction = computed(() => store.getters.currentProduction)

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
  try {
    await store.dispatch('editProduction', {
      ...form.value,
      id: currentProduction.value.id,
      hd_bitrate_compression: parseBitrate(form.value.hd_bitrate_compression),
      ld_bitrate_compression: parseBitrate(form.value.ld_bitrate_compression)
    })
  } catch {
    isError.value = true
  }
  isLoading.value = false
}

onMounted(resetForm)
watch(currentProduction, resetForm, { deep: true })
</script>

<style lang="scss" scoped>
.explanation {
  color: var(--text-alt);
}
</style>
