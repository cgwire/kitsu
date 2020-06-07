// import * as en from '../src/locales/en'
require = require("esm")(module)
const en = require('../src/locales/en')
const fr = require('../src/locales/fr')
const es = require('../src/locales/es')
const de = require('../src/locales/de')
fr.name = 'fr'
es.name = 'es'
de.name = 'de'

const firstLevelKeysEn = Object.keys(en.default)

const locales = [fr, es, de]

  locales.forEach(locale => {
  const firstLevelKeysComp = Object.keys(locale.default)
  const difference = firstLevelKeysEn.filter(
    x => !firstLevelKeysComp.includes(x)
  )
  firstLevelKeysEn.forEach((key) => {
    if (locale.default[key]) {
      const firstLevelKeys1 = Object.keys(en.default[key])
      const firstLevelKeys2 = Object.keys(locale.default[key])
      const difference = firstLevelKeys1.filter(
        x => !firstLevelKeys2.includes(x)
      )
      if (difference.length > 0) {
        console.log('Missing keys for', locale.name, '/', key, ':', difference)
      }

      firstLevelKeys1.forEach((key2) => {
        if (typeof en.default[key][key2] === 'object'
            && locale.default[key][key2]
        ) {
          const secondLevelKeys1 = Object.keys(en.default[key][key2])
          const secondLevelKeys2 = Object.keys(locale.default[key][key2])
          const difference = secondLevelKeys1.filter(
            x => !secondLevelKeys2.includes(x)
          )
          if (difference.length > 0) {
            console.log(
              'Missing keys for', locale.name, '/', key, key2, ':', difference
            )
          }
        }
      })
    }
  })
  console.log('Missing main keys for', locale.name, ':', difference)
})
