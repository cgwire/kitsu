// @vitest-environment node

import { describe, it, expect } from 'vitest'

import {
  clampBitrate,
  clampBitrates,
  getMovieBitrateDefaults,
  getMovieMegabytesPerMinute,
  getTaskTypePriorityOfProd,
  getTaskStatusPriorityOfProd,
  parseBitrate
} from '@/lib/productions'

describe('productions', () => {
  describe('clampBitrates', () => {
    it('caps the high definition at 28 and the low one at the high one', () => {
      expect(
        clampBitrates({ hd_bitrate_compression: '40', ld_bitrate_compression: 30 })
      ).toEqual({ hd_bitrate_compression: 28, ld_bitrate_compression: 28 })
      expect(
        clampBitrates({ hd_bitrate_compression: 10, ld_bitrate_compression: 12 })
      ).toEqual({ hd_bitrate_compression: 10, ld_bitrate_compression: 10 })
    })

    it('caps both at the instance high definition bitrate given as max', () => {
      expect(
        clampBitrates(
          { hd_bitrate_compression: 40, ld_bitrate_compression: 30 },
          { max: 35 }
        )
      ).toEqual({ hd_bitrate_compression: 35, ld_bitrate_compression: 30 })
      expect(
        clampBitrates(
          { hd_bitrate_compression: '', ld_bitrate_compression: 40 },
          { max: 35 }
        )
      ).toEqual({ hd_bitrate_compression: null, ld_bitrate_compression: 35 })
    })

    it('uses the inherited high definition when the own one is unset', () => {
      expect(
        clampBitrates(
          { hd_bitrate_compression: '', ld_bitrate_compression: 12 },
          { inheritedHd: 8 }
        )
      ).toEqual({ hd_bitrate_compression: null, ld_bitrate_compression: 8 })
      expect(
        clampBitrates({ hd_bitrate_compression: null, ld_bitrate_compression: null })
      ).toEqual({ hd_bitrate_compression: null, ld_bitrate_compression: null })
    })

    // A production set before the instance lowered its ceiling keeps a
    // higher bitrate: its task types still get the ceiling.
    it('keeps the low definition under max when the inherited one is above', () => {
      expect(
        clampBitrates(
          { hd_bitrate_compression: '', ld_bitrate_compression: 30 },
          { inheritedHd: 28, max: 20 }
        )
      ).toEqual({ hd_bitrate_compression: null, ld_bitrate_compression: 20 })
    })

    // The API refuses a decimal or a bitrate under 1 Mbit/s.
    it('sends whole bitrates of at least 1 Mbit/s', () => {
      expect(
        clampBitrates({ hd_bitrate_compression: '12.5', ld_bitrate_compression: 6.4 })
      ).toEqual({ hd_bitrate_compression: 13, ld_bitrate_compression: 6 })
      expect(
        clampBitrates({ hd_bitrate_compression: 0, ld_bitrate_compression: '0.2' })
      ).toEqual({ hd_bitrate_compression: 1, ld_bitrate_compression: 1 })
    })
  })

  describe('clampBitrate', () => {
    it('brings one typed bitrate between 1 and the ceiling', () => {
      expect(clampBitrate('', 28)).toBeNull()
      expect(clampBitrate('40', 28)).toBe(28)
      expect(clampBitrate(0, 28)).toBe(1)
      expect(clampBitrate(12.5, 28)).toBe(13)
      expect(clampBitrate(12, 28)).toBe(12)
    })
  })

  describe('parseBitrate', () => {
    it('sends an empty field as null and a typed value as a number', () => {
      expect(parseBitrate('')).toBeNull()
      expect(parseBitrate(null)).toBeNull()
      expect(parseBitrate('20')).toBe(20)
      expect(parseBitrate(6)).toBe(6)
    })

    it('rounds a decimal to the whole Mbit/s the API takes', () => {
      expect(parseBitrate('12.5')).toBe(13)
      expect(parseBitrate(12.4)).toBe(12)
    })
  })

  describe('getMovieBitrateDefaults', () => {
    it('reads the instance bitrates from the server config', () => {
      expect(
        getMovieBitrateDefaults({
          movie_highdef_bitrate: 40,
          movie_lowdef_bitrate: 8
        })
      ).toEqual({ hd_bitrate_compression: 40, ld_bitrate_compression: 8 })
    })

    // setMainConfig keeps an empty config when /api/config fails.
    it('falls back on the bitrates Zou ships with', () => {
      expect(getMovieBitrateDefaults({})).toEqual({
        hd_bitrate_compression: 28,
        ld_bitrate_compression: 6
      })
      expect(getMovieBitrateDefaults(undefined)).toEqual({
        hd_bitrate_compression: 28,
        ld_bitrate_compression: 6
      })
    })
  })

  describe('getMovieMegabytesPerMinute', () => {
    it('gives the weight of a minute of movie at a bitrate in Mbit/s', () => {
      expect(getMovieMegabytesPerMinute(28)).toBe(210)
      expect(getMovieMegabytesPerMinute(6)).toBe(45)
      expect(getMovieMegabytesPerMinute(1)).toBe(8)
    })
  })

  describe('getTaskTypePriorityOfProd', () => {
    it('returns 1 when taskType is null', () => {
      expect(getTaskTypePriorityOfProd(null, {})).toBe(1)
    })

    it('returns production-level priority when set', () => {
      const taskType = { id: 'tt-1', priority: 5 }
      const production = { task_types_priority: { 'tt-1': 3 } }
      expect(getTaskTypePriorityOfProd(taskType, production)).toBe(3)
    })

    it('falls back to taskType priority when production has no override', () => {
      const taskType = { id: 'tt-2', priority: 7 }
      const production = { task_types_priority: {} }
      expect(getTaskTypePriorityOfProd(taskType, production)).toBe(7)
    })

    it('falls back to taskType priority when production is null', () => {
      const taskType = { id: 'tt-3', priority: 4 }
      expect(getTaskTypePriorityOfProd(taskType, null)).toBe(4)
    })
  })

  describe('getTaskStatusPriorityOfProd', () => {
    it('returns 1 when taskStatus is null', () => {
      expect(getTaskStatusPriorityOfProd(null, {})).toBe(1)
    })

    it('returns production-level priority when set', () => {
      const taskStatus = { id: 'ts-1', priority: 5 }
      const production = {
        task_statuses_link: { 'ts-1': { priority: 2 } }
      }
      expect(getTaskStatusPriorityOfProd(taskStatus, production)).toBe(2)
    })

    it('falls back to taskStatus priority when production has no override', () => {
      const taskStatus = { id: 'ts-2', priority: 8 }
      const production = { task_statuses_link: {} }
      expect(getTaskStatusPriorityOfProd(taskStatus, production)).toBe(8)
    })

    it('falls back to taskStatus priority when production is null', () => {
      const taskStatus = { id: 'ts-3', priority: 6 }
      expect(getTaskStatusPriorityOfProd(taskStatus, null)).toBe(6)
    })
  })
})
