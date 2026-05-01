<template>
  <base-modal
    :active="active"
    :title="$t('profile.avatar.title')"
    @cancel="close"
  >
    <form>
      <input
        ref="inputFile"
        class="hidden"
        type="file"
        accept=".png,.jpg,.jpeg"
        @change="updateAvatar"
      />
      <people-avatar
        :is-lazy="false"
        :person="person"
        :size="150"
        :font-size="60"
      />
      <div class="flexrow right mt2">
        <button
          class="button flexrow-item is-primary"
          :disabled="isUpdating || isDeleting"
          type="button"
          @click="selectFile"
        >
          <template v-if="isUpdating">
            <spinner class="mr05 mt05" :size="20" is-white />
            {{ $t('profile.avatar.updating') }}
          </template>
          <template v-else>{{ $t('profile.change_avatar') }}</template>
        </button>
        <button
          class="button flexrow-item"
          :disabled="isUpdating || isDeleting"
          type="button"
          @click="deleteAvatar"
        >
          <template v-if="isDeleting">
            <spinner class="mr05 mt05" :size="20" />
            {{ $t('profile.avatar.removing') }}
          </template>
          <template v-else>{{ $t('profile.clear_avatar') }}</template>
        </button>
        <button
          class="button flexrow-item is-link"
          :disabled="isUpdating || isDeleting"
          type="button"
          @click="close"
        >
          {{ $t('main.close') }}
        </button>
      </div>
    </form>
    <p class="error mt1 has-text-right" v-if="isError">
      {{ errorText }}
    </p>
  </base-modal>
</template>

<script setup>
import { ref, watch } from 'vue'

import BaseModal from '@/components/modals/BaseModal.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  errorText: { type: String, default: '' },
  isDeleting: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isUpdating: { type: Boolean, default: false },
  person: { type: Object, required: true }
})

const emit = defineEmits(['close', 'delete', 'update'])

const inputFile = ref(null)

const selectFile = () => {
  inputFile.value.click()
}

const updateAvatar = event => {
  const file = event.target.files[0]
  const formData = new FormData()
  formData.append('file', file, file.name)
  emit('update', formData)
}

const deleteAvatar = () => {
  emit('delete')
}

const close = () => {
  if (props.isUpdating || props.isDeleting) return
  emit('close')
}

const resetForm = () => {
  if (inputFile.value) inputFile.value.value = null
}

watch(
  () => props.active,
  active => {
    if (active) resetForm()
  }
)
</script>

<style lang="scss" scoped>
.right {
  justify-content: flex-end;
}
</style>
