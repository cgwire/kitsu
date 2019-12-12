<template>
<div
  :class="{
    asset: true,
    big: true,
    casted: true,
    active: active,
    tagged: tag
  }"
  :title="`${asset.name} (${nbOccurences})`"
>
  <div class="asset-wrapper">
    <div
      class="asset-add"
      @click="removeOneAsset"
    >
    - 1
    </div>
    <div
      class="asset-add-10"
      @click="removeTenAssets"
      >
    - 10
    </div>
    <div class="asset-picture" v-if="asset.preview_file_id">
      <img
        v-lazy="'/api/pictures/thumbnails-square/preview-files/' + asset.preview_file_id + '.png'"
        alt=""
      />
      <span class="nb-occurences" v-if="nbOccurences > 1">
        {{ nbOccurences }}
      </span>
    </div>
    <div class="asset-picture" v-else>
      <span class="empty-picture">
        {{ shortenName(asset.name) }} ({{ nbOccurences }})
      </span>
    </div>
  </div>
  <div class="asset-tag"
    v-if="tag"
    @click="onEditTagClicked"
  >
    {{tag}}
  </div>
  <edit-tag-modal
    :active="modals.isEditTagDisplayed"
    :is-loading="loading.EditTag"
    :is-loading-stay="loading.EditTag"
    :tag="tag"
    @cancel="modals.isEditTagDisplayed = false"
    @confirm="confirmEditTag"
  />
</div>
</template>

<script>
import stringHelpers from '../../../lib/string'
import EditTagModal from '../../modals/EditTagModal'

export default {
  name: 'asset-block',
  components: {
    EditTagModal
  },

  data () {
    return {
      initialLoading: true,
      modals: {
        isEditTagDisplayed: false
      },
      loading: {
        EditTag: false
      }
    }
  },
  props: {
    asset: {
      default: () => ({
        id: '',
        name: ''
      }),
      type: Object
    },
    nbOccurences: {
      default: 1,
      type: Number
    },
    active: {
      default: true,
      type: Boolean
    },
    tag: {
      default: 'fixed',
      type: String
    }
  },

  computed: {
  },

  methods: {
    removeOneAsset (event) {
      this.$emit('remove-one', this.asset.asset_id)
    },

    removeTenAssets (event) {
      this.$emit('remove-ten', this.asset.asset_id)
    },

    shortenName (name) {
      return stringHelpers.shortenText(name, 13)
    },

    confirmEditTag (form) {
      this.$emit('edit-tag', this.asset.tag)
      this.modals.isEditTagDisplayed = false
    },

    onEditTagClicked () {
      this.modals.isEditTagDisplayed = true
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .asset {
  background-color: $dark-grey-lightest;
}

.dark .asset.casted,
.dark .asset .asset-add,
.dark .asset .asset-add-10 {
  background-color: $purple-strong;
}

.asset {
  position: relative;
  display: flex;
  flex-direction: row;
  max-height: 60px;
  margin-right: 1em;
  background: $white-grey;
  font-size: 0.8em;
  word-wrap: break-word;
  border-radius: 5px;
}

.tagged {
  margin-right: 2em;
}

.casted {
  background: $purple;
}

.asset-wrapper {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 60px;
  border-radius: 5px;
  overflow: hidden;
}

.big {
  height: 40px;

  .asset-wrapper {
    width: 40px;
  }
}

.active {
  cursor: pointer;
}

.asset-add,
.asset-add-10 {
  flex: 0 0 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $light-purple;
  font-weight: bold;
  font-size: 0.9em;
  opacity: 0;
  z-index: 2;
}

.asset-add-10 {
  background: $purple;
}

.asset.active:hover .asset-add,
.asset.active:hover .asset-add-10 {
  opacity: 1;
}

.asset-picture {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  z-index: 1;
  width: 100%;
  height: 100%;
  word-break: break-all;
  font-size: 0.8em;

  img {
    border-radius: 5px;
  }
}

.asset-name {
  text-align: center;
  position: relative;
  word-break: break-all;
  top: -75px;
}

.asset-tag {
  font-size: .7em;
  text-align: center;
  transform: rotate(-90deg) translateX(-25%) translateY(calc(-50% - 5px));
  position: absolute;
  left: 100%;
  top: 0;
  background: $dark-green;
  width: 40px;
  height: 20px;
  padding-top: 5px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  color: $white;
}

.nb-occurences {
  background: rgba(160, 160, 180, 0.8);
  font-size: 0.8em;
  border-radius: 2px;
  color: white;
  position: absolute;
  padding: 2px;
  right: 2px;
  bottom: 2px;
}
</style>
