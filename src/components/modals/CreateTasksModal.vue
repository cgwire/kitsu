<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">

      <page-title
        :text="$t('tasks.create_tasks_shot')"
      >
      </page-title>

      <form v-on:submit.prevent>
        <combobox
          :label="$t('tasks.fields.task_type')"
          :options="getTaskTypeOptions"
          v-model="form.task_type_id"
        >
        </combobox>
      </form>

      <p>
        {{ text }}
      </p>

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
  name: 'edit-asset-modal',
  components: {
    PageTitle,
    Combobox
  },

  props: [
    'onConfirmClicked',
    'text',
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
      'getTaskTypeOptions'
    ])
  },

  methods: {
    ...mapActions([
    ]),
    confirmClicked () {
      this.$emit('confirm', this.form)
    }
  },

  mounted () {
    if (this.taskTypes.length > 0) {
      this.form.task_type_id = this.taskTypes[0].id
    }
  }
}
</script>

<style scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}

.info-message {
  margin-top: 1em;
}
</style>
