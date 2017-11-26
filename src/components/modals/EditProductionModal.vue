<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <h1 class="title" v-if="productionToEdit">
        {{ $t("productions.edit_title") }} {{ productionToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("productions.new_production") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('productions.fields.name')"
          v-model="form.name"
          @enter="confirmClicked"
          v-focus
        >
        </text-field>
        <combobox
          :label="$t('productions.fields.status')"
          :options="getProductionStatusOptions"
          localeKeyPrefix="productions.status."
          v-model="form.project_status_id"
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
          @click="confirmClicked">
          {{ $t("main.confirmation") }}
        </a>
        <router-link
          :to="cancelRoute"
          class="button is-link">
          {{ $t("main.cancel") }}
        </router-link>
      </p>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TextField from '../widgets/TextField'
import Combobox from '../widgets/Combobox'

export default {
  name: 'edit-production-modal',
  components: {
    TextField,
    Combobox
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'errorText',
    'productionToEdit'
  ],

  watch: {
    productionToEdit () {
      if (this.productionToEdit) {
        this.form.name = this.productionToEdit.name
        this.form.project_status_id = this.productionToEdit.project_status_id
      }
    },

    active () {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    }
  },

  data () {
    if (this.productionToEdit) {
      return {
        form: {
          name: '',
          project_status_id: this.productionToEdit.project_status_id
        }
      }
    } else {
      return {
        form: {
          name: '',
          project_status_id: ''
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'productions',
      'productionStatus',
      'getProductionStatusOptions'
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
    if (this.productionStatus.length > 0) {
      this.form.project_status_id = this.productionStatus[0].id
    }
  }
}
</script>

<style scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}
.is-danger {
  color: #ff3860;
  font-style: italic;
}
.title {
  border-bottom: 2px solid #DDD;
  padding-bottom: 0.5em;
  margin-bottom: 1.2em;
}
</style>
