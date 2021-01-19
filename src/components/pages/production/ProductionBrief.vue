<template>
    <div>
      <div v-if="!isEditing" class="box" @dblclick="openEditing">
        <div v-if="isEmpty(currentProduction.description)">
          <p>{{$t('brief.empty')}}</p>
        </div>
        <div class="content" v-else v-html="compileMarkdown(currentProduction.description)">
        </div>
      </div>
      <div v-else class="box has-text-right">
        <TextareaField
          v-model="brief"
          inputClass="textarea"
          editable
        />

        <p v-if="errors.editBrief" class="error mt1 has-text-right">
          {{ $t('brief.edit.errorText') }}
        </p>
        <ButtonSimple
          class="is-primary"
          icon="save"
          :class="{'is-loading': isLoading}"
          :disabled="isLoading"
          :text="$t('brief.save.button')"
          @click="editBrief"
        >
        </ButtonSimple>

      </div>
    </div>
</template>

<script>
import marked from 'marked'
import { mapGetters, mapActions } from 'vuex'

import TextareaField from '@/components/widgets/TextareaField'
import ButtonSimple from '@/components/widgets/ButtonSimple'

export default {
  name: 'production-brief',
  components: {
    ButtonSimple,
    TextareaField
  },
  data () {
    return {
      brief: '',
      isEditing: false,
      isLoading: false,
      errors: {
        editBrief: false
      }
    }
  },
  computed: {
    ...mapGetters([
      'currentProduction'
    ])
  },
  mounted () {
    if (this.currentProduction) {
      this.brief = this.currentProduction.description
    }
  },
  methods: {
    ...mapActions([
      'editProduction',
      'setProduction'
    ]),

    isEmpty (str) {
      return (!str || str.length === 0)
    },

    openEditing () {
      this.isEditing = true
    },

    async editBrief () {
      this.isLoading = true
      try {
        await this.editProduction(
          {
            ...this.currentProduction,
            ...{ description: this.brief }
          }
        )
      } catch {
        this.errors.editBrief = true
        this.isLoading = false
        return
      }
      /*
        editProduction action doesn't refresh properly the currentProduction
        if the edited production is the currentProduction we set again the
        production, this can be automaticly in action / mutation
      */
      await this.setProduction(this.currentProduction.id)
      this.isEditing = false
      this.isLoading = false
    },

    compileMarkdown (input) {
      return marked(input || '')
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  max-width: 400px;
}
</style>
