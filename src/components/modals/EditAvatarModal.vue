<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('profile.avatar.title') }}
        </h1>
        <form>
          <input
            ref="input-file"
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
      </div>
    </div>
  </div>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'edit-avatar-modal',

  mixins: [modalMixin],

  components: {
    PeopleAvatar,
    Spinner
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    errorText: {
      type: String,
      default: ''
    },
    isDeleting: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isUpdating: {
      type: Boolean,
      default: false
    },
    person: {
      type: Object,
      required: true
    }
  },

  emits: ['close', 'delete', 'update'],

  methods: {
    selectFile() {
      this.$refs['input-file'].click()
    },

    updateAvatar(event) {
      const file = event.target.files[0]
      const formData = new FormData()
      formData.append('file', file, file.name)
      this.$emit('update', formData)
    },

    deleteAvatar() {
      this.$emit('delete')
    },

    close() {
      if (this.isUpdating || this.isDeleting) {
        return
      }
      this.$emit('close')
    },

    resetForm() {
      this.$refs['input-file'].value = null
    }
  },

  watch: {
    active() {
      if (this.active) {
        this.resetForm()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.right {
  justify-content: flex-end;
}
</style>
