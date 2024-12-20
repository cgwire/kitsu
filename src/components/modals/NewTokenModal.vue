<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('bots.new_token_title', { name: person.full_name }) }}
        </h1>

        <form class="form" @submit.prevent v-if="!person.access_token">
          <p class="mb2 warning-text">
            <alert-triangle-icon class="icon mr05 warning" />
            {{ $t('bots.new_token_warning') }}
          </p>
          <date-field
            :invalid="!isValidExpirationDate"
            :label="$t('bots.fields.expiration_date')"
            :min-date="today"
            v-model="form.expiration_date"
          />
          <div class="flexrow right">
            <button
              class="button flexrow-item is-primary"
              :disabled="!isValidExpirationDate"
              @click="generateToken"
            >
              {{ $t('bots.generate') }}
            </button>
            <button
              class="button flexrow-item is-link"
              @click="$emit('cancel')"
            >
              {{ $t('main.cancel') }}
            </button>
          </div>
        </form>

        <template v-else>
          <p class="mb2 warning-text">
            <alert-triangle-icon class="icon mr05 warning" />
            {{ $t('bots.copy_token_warning') }}
          </p>
          <div class="token">
            <text-field
              ref="token"
              :disabled="!visible"
              input-class=" token-input"
              :readonly="true"
              :type="visible ? 'text' : 'password'"
              :model-value="person.access_token"
            />
            <eye-off-icon
              v-if="visible"
              class="icon"
              @click="visible = false"
            />
            <eye-icon v-else class="icon" @click="visible = true" />
          </div>
          <div class="flexrow right">
            <Transition name="fade">
              <p class="success has-text-right mr05" v-if="message">
                {{ message }}
              </p>
            </Transition>
            <button
              class="button flexrow-item is-primary"
              @click="copyClicked"
              :disabled="!person.access_token"
            >
              {{ $t('main.copy') }}
            </button>
            <button class="button flexrow-item is-link" @click="$emit('close')">
              {{ $t('main.close') }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { AlertTriangleIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'

import { modalMixin } from '@/components/modals/base_modal'
import { timeMixin } from '@/components/mixins/time'

import DateField from '@/components/widgets/DateField.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'new-token-modal',

  mixins: [modalMixin, timeMixin],

  components: {
    AlertTriangleIcon,
    DateField,
    EyeIcon,
    EyeOffIcon,
    TextField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    person: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'close', 'generate-token'],

  data() {
    return {
      form: {
        expiration_date: null
      },
      message: null,
      visible: false
    }
  },

  computed: {
    isValidExpirationDate() {
      return (
        !this.form.expiration_date ||
        new Date(this.form.expiration_date) > new Date()
      )
    }
  },

  methods: {
    generateToken() {
      this.$emit('generate-token', {
        id: this.person.id,
        expiration_date: this.form.expiration_date
      })
    },

    async copyClicked() {
      this.message = null
      await navigator.clipboard.writeText(this.person.access_token)
      this.message = this.$t('bots.token_copied')
      setTimeout(() => {
        this.message = null
      }, 5000)
    },

    resetForm() {
      this.form = {
        expiration_date: this.person.expiration_date
      }
      this.message = null
      this.visible = false
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
.warning {
  color: $orange;
}

.token {
  position: relative;

  :deep(.token-input) {
    padding-right: 50px;

    &[type='text'] {
      text-overflow: ellipsis;
    }
  }

  .icon {
    cursor: pointer;
    opacity: 0.5;
    position: absolute;
    right: 15px;
    top: 15px;

    &:hover {
      opacity: 1;
    }
  }
}

.right {
  justify-content: flex-end;
}

.fade-enter-active {
  transition: all 0.3s ease;
}
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter {
  transform: translateX(20px);
  opacity: 0;
}
.fade-leave-to {
  opacity: 0;
}
</style>
