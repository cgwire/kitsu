<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">

    <div class="box">

      <h1 class="title" v-if="isEditing()">
        {{ $t("custom_actions.edit_title") }} {{ customActionToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("custom_actions.new_custom_action") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('custom_actions.fields.name')"
          v-model="form.name"
          v-focus
        >
        </text-field>

        <text-field
          ref="urlField"
          :label="$t('custom_actions.fields.url')"
          v-model="form.url"
          @enter="confirmClicked"
        >
        </text-field>

        <combobox
          :label="$t('custom_actions.fields.entity_type')"
          :options="entityTypeOptions"
          v-model="form.entityType"
          locale-key-prefix="custom_actions.entity_types."
          @enter="confirmClicked"
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
import Combobox from '../widgets/Combobox.vue'
import ColorField from '../widgets/ColorField'

export default {
  name: 'edit-custom-action-modal',
  components: {
    TextField,
    ColorField,
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
    'customActionToEdit'
  ],

  data () {
    return {
      form: {
        name: '',
        url: '',
        entityType: 'all'
      },
      entityTypeOptions: [
        {
          label: 'all',
          value: 'all'
        },
        {
          label: 'asset',
          value: 'asset'
        },
        {
          label: 'shot',
          value: 'shot'
        }
      ]
    }
  },

  computed: {
    ...mapGetters([
      'customActions',
      'customActionStatusOptions'
    ])
  },

  methods: {
    ...mapActions([
    ]),
    confirmClicked () {
      this.$emit('confirm', this.form)
    },
    isEditing: () => this.customActionToEdit && this.customActionToEdit.id
  },

  watch: {
    customActionToEdit () {
      if (this.customActionToEdit) {
        this.form = {
          name: this.customActionToEdit.name,
          url: this.customActionToEdit.url,
          entityType: this.customActionToEdit.entity_type
        }
      }
    },

    active () {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
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
