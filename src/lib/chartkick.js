import 'chartkick/chart.js'
import VueChartkick from 'vue-chartkick'

// vue-chartkick only exposes its charts through install(), which does nothing
// but call app.component(): hand it a collector to harvest the definitions
// without an app instance, so main.js can register them lazily.
const components = {}

VueChartkick.install({
  component: (name, definition) => {
    components[name] = definition
  }
})

export default components
