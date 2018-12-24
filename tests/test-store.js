import expect from 'chai'

global.localStorage = require('localStorage')

import './store/assets.spec.js'
import './store/assettypes.spec.js'
import './store/breakdown.spec.js'
import './store/customactions.spec.js'
import './store/episodes.spec.js'
import './store/main.spec'
import './store/notifications.spec.js'
import './store/people.spec'
import './store/playlists.spec.js'
import './store/productions.spec.js'
import './store/sequences.spec.js'
import './store/taskstatus.spec.js'
import './store/tasktypes.spec.js'
import './store/user.spec'

import './store/lib/filtering.spec.js'
import './store/lib/indexing.spec.js'
import './store/lib/helpers.spec.js'
import './store/lib/sorting.spec.js'
import './store/lib/string.spec.js'
