>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">

    <div class="box content">
      <h1 class="title">
        {{ $t("main.csv.import_title") }}
      </h1>

      <p class="description" v-on:submit.prevent>
        {{ $t("main.csv.required_fields") }}
        <ul>
          <li v-for="column in columns">
            {{ column }}
          </li>
        </ul>
      </p>

      <p>
        {{ $t("main.csv.select_file") }}
      </p>

      <file-upload @fileselected="onFileSelected"></file-upload>

      <p class="error" v-if="isError">
        {{ $t("main.csv.error_upload") }}
      </p>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading,
            'is-disabled': formData == undefined
          }"
          @click="onConfirmClicked">
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
import FileUpload from '../widgets/FileUpload.vue'

export default {
  name: 'import-people-modal',
  props: [
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'columns'
  ],
  watch: {
  },
  data () {
    return {
      formData: null
    }
  },
  components: {
    FileUpload
  },
  computed: {
    ...mapGetters([
    ])
  },
  mounted () {
    this.formData = null
  },
  methods: {
    ...mapActions([
    ]),
    onFileSelected (formData) {
      this.formData = formData
      this.$emit('fileselected', formData)
    },
    onConfirmClicked () {
      this.$emit('confirm')
    }
  }
}
</script>

<style scoped>
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
</style>
