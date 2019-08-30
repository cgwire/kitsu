<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">

    <div class="box">

      <h1 class="title" v-if="assetTypeToEdit && assetTypeToEdit.id">
        {{ $t("asset_types.edit_title") }} {{ assetTypeToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("asset_types.new_asset_type") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('asset_types.fields.name')"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        >
        </text-field>
      </form>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="runConfirmation"
        >
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

export default {
  name: 'edit-asset-type-modal',
  components: {
    TextField
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'errorText',
    'assetTypeToEdit'
  ],

  data () {
    return {}
  },

  computed: {
    ...mapGetters([
      'assetTypes',
      'assetTypeStatusOptions'
    ]),
    form () {
      return {
        name: ''
      }
    }
  },

  methods: {
    ...mapActions([
    ]),

    runConfirmation () {
      this.$emit('confirm', this.form)
    }
  },

  watch: {
    active () {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    assetTypeToEdit () {
      if (this.assetTypeToEdit) {
        this.form.name = this.assetTypeToEdit.name
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}

.is-danger {
  color: #ff3860;
  font-style: italic;
}
</style>
