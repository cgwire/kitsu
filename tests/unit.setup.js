// Node specs never mount: they skip loading Vue Test Utils.
if (typeof document !== 'undefined') {
  const { config } = await import('@vue/test-utils')
  config.global.mocks = {
    $t: tKey => tKey // just return translation key
  }

  // v-focus only exists on the real app built by main.js, which the specs
  // never load: mirror it here so mounted components resolve it instead of
  // logging a warning.
  config.global.directives = {
    focus: {
      mounted(el, binding) {
        el.focus(binding.value)
      }
    }
  }
}
