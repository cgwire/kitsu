<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>

  <div class="modal-content">
    <div class="box content">
      <h1 class="title">
        {{ $t('productions.metadata.title') }}
      </h1>

      <text-field
        ref="nameField"
        :label="$t('assets.fields.name')"
        v-model="form.name"
        @enter="confirm"
        v-focus
      />

      <combobox
        ref="typeField"
        :label="$t('assets.fields.type')"
        v-model="type"
        :options="typeOptions"
        @enter="confirm"
        v-focus
      />

      <div v-if="type === 'choices'">
        <p class="strong">
          {{ $t('productions.metadata.available_values') }}
        </p>

        <div
          ref="valueList"
          class="choice-value-wrapper"
          v-if="form.values.length > 0"
        >
          <p
            class="choice-value"
            :key="value"
            v-for="value in form.values"
          >
            <span>
              {{ value }}
            </span>
            <span
              class="remove-button pull-right"
              @click="removeValue(value)"
            >
             x
            </span>
          </p>
        </div>
        <div v-else>
          {{ $t('productions.metadata.add_new_values') }}
        </div>

        <text-field
          ref="addChoiceField"
          v-model="valueToAdd"
          :button-label="$t('Add value')"
          @enter="addValue"
          v-focus
        />
      </div>

      <modal-footer
        :error-text="$t('productions.metadata.error')"
        :is-loading="isLoading"
        :is-disabled="!isFormFilled"
        @confirm="confirm"
        @cancel="console.log('otot') ; $emit('cancel')"
      />
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import { remove } from '../../lib/helpers'

import Combobox from '../widgets/Combobox'
import ModalFooter from './ModalFooter'
import TextField from '../widgets/TextField'

export default {
  name: 'add-metadata-modal',
  mixins: [modalMixin],

  components: {
    Combobox,
    ModalFooter,
    TextField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    descriptorToEdit: {
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
    }
  },

  data () {
    return {
      form: {
        name: '',
        values: []
      },
      valueToAdd: '',
      type: 'free',
      typeOptions: [
        {
          label: this.$t('productions.metadata.free'),
          value: 'free'
        },
        {
          label: this.$t('productions.metadata.choices'),
          value: 'choices'
        }
      ]
    }
  },

  mounted () {
    this.reset()
  },

  computed: {
    ...mapGetters([
    ]),

    isFormFilled () {
      return this.form.name.length > 0 &&
        (this.form.values.length > 0 || this.type === 'free')
    },

    valueList () {
      return this.$refs.valueList
    }
  },

  methods: {
    ...mapActions([
    ]),

    addValue () {
      const newValue = this.$refs.addChoiceField.value
      if (!this.form.values.find(v => v === newValue) && newValue) {
        this.form.values.push(newValue)
        this.valueToAdd = ''
        this.$nextTick(() => {
          this.valueList.scrollTop = this.valueList.scrollHeight
        })
      }
      return newValue
    },

    confirm () {
      if (this.type === 'free') this.form.values = []
      return this.$emit('confirm', this.form)
    },

    removeValue (valueToRemove) {
      this.form.values = remove(this.form.values, valueToRemove)
    },

    reset () {
      this.form = {
        name: '',
        values: []
      }
      this.valueToAdd = ''
      if (this.descriptorToEdit.name) {
        this.form = {
          id: this.descriptorToEdit.id,
          name: `${this.descriptorToEdit.name}`,
          values: [...this.descriptorToEdit.choices]
        }
      }
      this.type = this.form.values.length > 0 ? 'choices' : 'free'
    }
  },

  watch: {
    active () {
      if (this.active) {
        this.reset()
        this.$nextTick(() => { this.$refs.nameField.focus() })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark  .content .choice-value {
  border-color: $grey-strong;
}

.dark .remove-button:hover {
  background: $grey-strong;
}

.modal-content .box p.text {
  margin-bottom: 1em;
}

.error {
  margin-top: 1em;
}

.title {
  border-bottom: 2px solid #DDD;
  padding-bottom: 0.5em;
  margin-bottom: 1.2em;
}

.description {
  margin-bottom: 1em;
}

.choice-value-wrapper {
  max-height: 120px;
  overflow-y: auto;
}

.content .choice-value {
  border: 1px solid $light-grey;
  border-bottom: 0;
  margin: 0;
  padding: 0.5em;
}

.content .choice-value:last-child{
  border-bottom: 1px solid $light-grey;
}

.remove-button {
  color: $grey;
  width: 20px;
  text-align: center;
  padding: 0;
  cursor: pointer;
}

.remove-button:hover {
  background: $white-grey;
  border-radius: 50%;
}
</style>
