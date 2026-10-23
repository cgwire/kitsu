// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/store', () => ({ default: {} }))

import mainStore from '@/store/modules/main'

describe('main store', () => {
  describe('movieBitrateDefaults', () => {
    it('reads the instance movie bitrates from the server config', () => {
      const state = {
        mainConfig: { movie_highdef_bitrate: 40, movie_lowdef_bitrate: 8 }
      }
      expect(mainStore.getters.movieBitrateDefaults(state)).toEqual({
        hd_bitrate_compression: 40,
        ld_bitrate_compression: 8
      })
    })

    it('falls back on the bitrates Zou ships with before the config loads', () => {
      expect(mainStore.getters.movieBitrateDefaults({ mainConfig: {} })).toEqual(
        { hd_bitrate_compression: 28, ld_bitrate_compression: 6 }
      )
    })
  })
})
