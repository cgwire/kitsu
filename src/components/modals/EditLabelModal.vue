<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>

  <div class="modal-content">
    <div class="box content">
      <h1 class="title">
        {{ $t('breakdown.edit_label') }}
      </h1>

      <form v-on:submit.prevent>
        <combobox
          ref="typeField"
          :label="$t('breakdown.label')"
          :options="typeOptions"
          @enter="confirm"
          v-model="form.label"
          v-focus
        />

        <modal-footer
          :is-loading="isLoading"
          @confirm="confirm"
          @cancel="$emit('cancel')"
        />
      </form>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'

import Combobox from '../widgets/Combobox'
import ModalFooter from './ModalFooter'

export default {
  name: 'edit-label-modal',
  mixins: [modalMixin],

  components: {
    Combobox,
    ModalFooter
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    label: {
      type: String
    }
  },

  mounted () {
    this.form.label = this.label
  },

  data () {
    return {
      asset: null,
      form: {
        label: 'animate'
      },
      typeOptions: [
        {
          label: this.$t('breakdown.options.fixed'),
          value: 'fixed'
        },
        {
          label: this.$t('breakdown.options.animate'),
          value: 'animate'
        }
      ]
    }
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ]),

    confirm () {
      return this.$emit('confirm', this.form)
    }
  },

  watch: {
    label () {
      this.form.label = this.label
    }
  }
}
</script>

<style lang="scss" scoped>

.error {
  margin-top: 1em;
}
</style>
