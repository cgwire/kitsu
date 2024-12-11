<template>
  <div class="modal day-off-modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="$emit('cancel')"></div>
    <div class="modal-content">
      <form class="box" @submit.prevent="confirm">
        <h1 class="title">
          {{ isEditing ? $t('days_off.edit') : $t('days_off.add') }}
        </h1>
        <div class="flexrow field">
          <div class="flexrow-item ml2">
            <label class="label">
              {{ $t('main.start_date') }}
            </label>
            <date-field
              utc
              week-days-disabled
              @update:model-value="validateDates"
              v-model="form.startDate"
            />
          </div>
          <div class="flexrow-item">
            <label class="label">
              {{ $t('main.end_date') }}
            </label>
            <date-field
              utc
              week-days-disabled
              @update:model-value="validateDates"
              v-model="form.endDate"
            />
          </div>
        </div>
        <text-field
          class="mt2"
          :label="`${$t('main.description')} (${$t('main.optional')})`"
          :required="false"
          v-model.trim="form.description"
        />
        <p class="mb2 warning-text">
          <alert-triangle-icon class="icon mr05 warning" />{{
            $t('days_off.confirm_day_offs')
          }}
        </p>
        <p class="is-danger has-text-right" v-if="isError">
          {{ errorText || $t('days_off.error_days_off') }}
        </p>
        <p class="has-text-right mt1 mb2">
          <button
            type="submit"
            class="button is-primary"
            :class="{ 'is-loading': isLoading }"
          >
            {{ $t('main.confirmation') }}
          </button>
          <button type="button" class="button is-link" @click="$emit('cancel')">
            {{ $t('main.cancel') }}
          </button>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { AlertTriangleIcon } from 'lucide-vue-next'
import moment from 'moment-timezone'

import { modalMixin } from '@/components/modals/base_modal'

import DateField from '@/components/widgets/DateField.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'day-off-modal',

  mixins: [modalMixin],

  components: {
    AlertTriangleIcon,
    DateField,
    TextField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    dayOffToEdit: {
      type: Object,
      default: () => {}
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    errorText: {
      type: String,
      default: ''
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        startDate: null,
        endDate: null,
        description: null
      }
    }
  },

  computed: {
    ...mapGetters(['user']),

    isEditing() {
      return Boolean(this.dayOffToEdit?.id)
    }
  },

  methods: {
    confirm() {
      const dayOff = {
        ...this.dayOffToEdit,
        date: this.form.startDate,
        end_date: this.form.endDate,
        description: this.form.description
      }
      this.$emit('confirm', dayOff)
    },

    resetForm() {
      const today = moment().utc().toDate()
      this.form = {
        startDate: this.dayOffToEdit?.date || today,
        endDate:
          this.dayOffToEdit?.end_date || this.dayOffToEdit?.date || today,
        description: this.dayOffToEdit?.description || null
      }
    },

    validateDates() {
      if (
        this.form.startDate &&
        this.form.endDate &&
        this.form.startDate > this.form.endDate
      ) {
        this.form.endDate = this.form.startDate
      }
    }
  },

  watch: {
    dayOffToEdit: {
      immediate: true,
      handler() {
        this.resetForm()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box {
  padding: 2em;
}
.modal-content .box p.text {
  margin-bottom: 1em;
}
.ml2 {
  margin-left: 2.5em;
}
</style>
