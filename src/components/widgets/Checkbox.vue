<template>
<div class="field">
  <div
    :class="{
      'checkbox-field': true,
      toggle: toggle
    }"
  >
    <input
      class="visuallyhidden"
      ref="checkbox"
      type="checkbox"
      :id="id"
      :checked="checked"
      :disabled="disabled"
      @change="updateStatus()"
    />
    <label :for="id"><span>{{ label }}</span></label>
  </div>
</div>
</template>

<script>

export default {
  name: 'checkbox',
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    disabled: {
      default: false,
      type: Boolean
    },
    label: {
      default: '',
      type: String,
      required: true
    },
    checked: {
      default: false,
      type: Boolean
    },
    toggle: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      id: null
    }
  },

  mounted () {
    this.id = this._uid
  },

  computed: {
  },

  methods: {
    updateStatus () {
      this.$emit('change', this.$refs.checkbox.checked)
    }
  }
}
</script>
<style lang="scss" scoped>
.dark {
  .checkbox-field label {
    &:before {
      border-color: $dark-grey-lightest;
    }
    &:after {
      color: $light-grey;
    }
  }
  .toggle label {
    &:before {
      background-color: $mid-grey;
    }
  }
}
.checkbox-field {
  display: inline-flex;
  align-items: center;

  label {
    position: relative;
    padding-left: 1.5rem;
    cursor: pointer;

    &:before,
    &:after {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      content: '';
      display: block;
      width: 1rem;
      height: 1rem;
      border: 1px solid $light-grey;
      border-radius: 2px;
      background-color: transparent;
    }
    &:after {
      border-color: transparent;
      color: $dark-grey-lightest;
      line-height: .8rem;
    }
  }
  input[type=checkbox] {
    &[disabled] + label {
      opacity: .5;
      cursor: default;
    }
    &:checked + label:after {
      content: '✔';
    }
  }
}
.toggle {
  label {
    padding-left: 3.5rem;

    &:before {
       border-radius: .75rem;
       width: 2.6rem;
       height: 1.5rem;
       background-color: $light-grey;
       transition: background-color 200ms ease-in;
    }
    &:after {
      width: 1.3rem;
      height: 1.3rem;
      background-color: $white;
      border-radius: 50%;
      transition: left 150ms ease-in;
    }
  }
  input[type=checkbox]:checked + label {
    &:before {
      background-color: $green;
    }
    &:after {
      content: '';
      left: 1.3rem;
    }
  }
}
</style>
