<template>
<div
  :class="{
    asset: true,
    big: true,
    'big-asset': bigMode,
    casted: true,
    active: active,
    labelled: true
  }"
  :title="`${asset.name} (${nbOccurences})`"
  v-if="!textMode"
>
  <div class="asset-wrapper">
    <div
      class="asset-add-1"
      @click="addOneAsset"
      v-if="!readOnly"
    >
      + 1
    </div>
    <div
      class="asset-add"
      @click="removeOneAsset"
      v-if="!readOnly"
    >
      - 1
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
  <div
    class="asset-label"
    :label="asset.label"
    @click="onEditLabelClicked"
  >
    {{ asset.label || $t('breakdown.options.animate') }}
  </div>
</div>
<div class="asset-text flexrow-item flexrow" v-else>
  <span class="asset-text-name flexrow-item">
    {{ asset.name }} ({{ nbOccurences }})
  </span>
  <span class="filler"></span>
  <span
    class="modify-asset flexrow-item"
    @click="removeOneAsset"
    v-if="!readOnly"
  >
  - 1
  </span>
</div>
</template>

<script>
import stringHelpers from '@/lib/string'

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
    },
    textMode: {
      default: false,
      type: Boolean
    },
    bigMode: {
      default: false,
      type: Boolean
    }
  },

  computed: {
  },

  methods: {
    removeOneAsset (event) {
      this.$emit('remove-one', this.asset.asset_id, this.nbOccurences)
    },

    addOneAsset (event) {
      this.$emit('add-one', this.asset.asset_id, this.nbOccurences)
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
  margin: 0 1em .5em 0;
  font-size: 0.8em;
  word-wrap: break-word;
  border-radius: 5px;
  height: 40px;

  .asset-wrapper {
    width: 40px;
  }

  &.big-asset {
    width: 100px;
    height: 100px;

    .asset-picture {
      top: -10px;
      left: -10px;
      width: 120px;
      height: 120px;
    }

    .asset-wrapper {
      width: 100px;
    }

    .nb-occurences {
      font-size: 1.2em;
      padding: 2px;
      right: 15px;
      bottom: 15px;
    }
  }
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

.active {
  cursor: pointer;
}

.asset-add,
.asset-add-1 {
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

.asset-add-1 {
  background: $purple;
}

.asset.active:hover .asset-add,
.asset.active:hover .asset-add-1 {
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
  background: $dark-green;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  color: $white;
  font-size: .7em;
  height: 20px;
  left: 100%;
  padding-top: 5px;
  position: absolute;
  text-align: center;
  top: 0;
  transform: rotate(-90deg) translateX(-25%) translateY(calc(-50% - 5px));
  width: 40px;
}

.asset-label[label=fixed] {
  background: $orange-carrot;
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

.asset-text {
  width: 120px;
  margin-right: 0;
}

.modify-asset {
  min-width: 20px;
}
</style>
