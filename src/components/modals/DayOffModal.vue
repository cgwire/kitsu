<template>
  <div class="modal day-off-modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="$emit('cancel')"></div>
    <div class="modal-content">
      <form class="box" @submit.prevent="confirm">
        <h1 class="title">
          {{ isEditing ? $t('days_off.edit') : $t('days_off.add') }}
        </h1>
        <div class="flexrow field">
          <div class="flexrow-item">
            <label class="label">
              {{ $t('main.start_date') }}
            </label>
            <datepicker
              wrapper-class="datepicker"
              input-class="date-input input short"
              :language="locale"
              :disabled-dates="{ days: [6, 0] }"
              :monday-first="true"
              format="yyyy-MM-dd"
              v-model="form.startDate"
              @input="validateDates"
            />
          </div>
          <div class="flexrow-item">
            <label class="label">
              {{ $t('main.end_date') }}
            </label>
            <datepicker
              wrapper-class="datepicker"
              input-class="date-input input short"
              :language="locale"
              :disabled-dates="{
                days: [6, 0],
                to: form.startDate
              }"
              :monday-first="true"
              format="yyyy-MM-dd"
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
import Datepicker from 'vuejs-datepicker'
import { en, fr } from 'vuejs-datepicker/dist/locale'
import { AlertTriangleIcon } from 'lucide-vue'

import { modalMixin } from '@/components/modals/base_modal'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'day-off-modal',

  mixins: [modalMixin],

  components: {
    AlertTriangleIcon,
    Datepicker,
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
    },

    locale() {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
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
      this.form = {
        startDate: this.dayOffToEdit?.date || new Date(),
        endDate:
          this.dayOffToEdit?.end_date || this.dayOffToEdit?.date || new Date(),
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
</style>
