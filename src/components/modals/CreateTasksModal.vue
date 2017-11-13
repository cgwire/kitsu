<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box content">

      <page-title :text="title"></page-title>

      <p>{{ text }}</p>

      <form v-on:submit.prevent>
        <combobox
          :label="$t('tasks.fields.task_type')"
          :options="isAssetTasks ? getAssetTaskTypeOptions : getShotTaskTypeOptions"
          v-model="form.task_type_id"
        >
        </combobox>
      </form>

      <p class="has-text-right">
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
        <router-link
          :to="cancelRoute"
          class="button is-link"
        >
          {{ $t("main.cancel") }}
        </router-link>
        <p class="error has-text-right info-message" v-if="isError">
          {{ errorText }}
        </p>
      </p>

    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Combobox from '../widgets/Combobox'
import PageTitle from '../widgets/PageTitle'

export default {
  name: 'create-task-modal',
  components: {
    PageTitle,
    Combobox
  },

  props: [
    'onConfirmClicked',
    'text',
    'title',
    'active',
    'cancelRoute',
    'isError',
    'isLoading',
    'isSuccess',
    'errorText'
  ],

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
      return this.cancelRoute.name.indexOf('assets') >= 0
    }
  },

  methods: {
    ...mapActions([
    ]),
    confirmClicked () {
      this.$emit('confirm', this.form)
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

<style scoped>
.info-message {
  margin-top: 1em;
}
</style>
