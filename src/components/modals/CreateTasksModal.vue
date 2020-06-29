<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box content">

      <page-title :text="title" />

      <p>{{ text }}</p>

      <form v-on:submit.prevent>
        <combobox
          :label="$t('tasks.fields.task_type')"
          :options="isAssetTasks ? getAssetTaskTypeOptions : getShotTaskTypeOptions"
          v-model="form.task_type_id"
        />
      </form>

      <div class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoadingStay
          }"
          @click="confirmAndStayClicked"
        >
          {{ $t("main.confirmation_and_stay") }}
        </a>
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="confirmClicked"
        >
          {{ $t("main.confirmation") }}
        </a>
        <button
          @click="$emit('cancel')"
          class="button is-link"
        >
          {{ $t("main.cancel") }}
        </button>
        <p class="error has-text-right info-message" v-if="isError">
          {{ errorText }}
        </p>
      </div>

    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import Combobox from '../widgets/Combobox'
import PageTitle from '../widgets/PageTitle'

export default {
  name: 'create-task-modal',
  mixins: [modalMixin],

  components: {
    PageTitle,
    Combobox
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
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isLoadingStay: {
      type: Boolean,
      default: false
    },
    isSuccess: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      form: {
        task_type_id: ''
      }
    }
  },

  computed: {
    ...mapGetters([
      'taskTypes',
      'getAssetTaskTypeOptions',
      'getShotTaskTypeOptions'
    ]),
    isAssetTasks () {
      return this.$route.path.indexOf('assets') >= 0
    }
  },

  methods: {
    ...mapActions([
    ]),

    confirmClicked () {
      this.$emit('confirm', this.form)
    },

    confirmAndStayClicked () {
      this.$emit('confirm-and-stay', this.form)
    }
  },

  mounted () {
    if (this.isAssetTasks) {
      if (this.getAssetTaskTypeOptions.length > 0) {
        this.form.task_type_id = this.getAssetTaskTypeOptions[0].value
      }
    } else {
      if (this.getShotTaskTypeOptions.length > 0) {
        this.form.task_type_id = this.getShotTaskTypeOptions[0].value
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.info-message {
  margin-top: 1em;
}
</style>
