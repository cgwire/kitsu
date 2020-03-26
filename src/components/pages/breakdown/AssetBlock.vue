<template>
<div
  :class="{
    asset: true,
    big: true,
    casted: true,
    active: active,
    labelled: true
  }"
  :title="`${asset.name} (${nbOccurences})`"
>
  <div class="asset-wrapper">
    <div
      class="asset-add"
      @click="removeOneAsset"
      v-if="!readOnly"
    >
    - 1
    </div>
    <div
      class="asset-add-10"
      @click="removeTenAssets"
      v-if="!readOnly"
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
  <div class="asset-label"
    @click="onEditLabelClicked"
  >
    {{ asset.label || $t('breakdown.options.animate') }}
  </div>
</div>
</template>

<script>
import stringHelpers from '../../../lib/string'

export default {
  name: 'asset-block',
  components: {},

  data () {
    return {
      initialLoading: true,
      loading: {
        EditLabel: false
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
    readOnly: {
      default: false,
      type: Boolean
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

    onEditLabelClicked () {
      if (!this.readOnly) {
        this.$emit('edit-label', this.asset, this.asset.label)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .asset-picture {
  background-color: $dark-grey-lightest;
}

.dark .asset.casted .asset-picture,
.dark .asset .asset-add,
.dark .asset .asset-add-10 {
  background-color: $purple-strong;
}

.asset {
  position: relative;
  display: flex;
  flex-direction: row;
  max-height: 60px;
  margin: 0 1em .5em 0;
  font-size: 0.8em;
  word-wrap: break-word;
  border-radius: 5px;
}

.labelled {
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
  background: $white-grey;
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

.asset-label {
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
