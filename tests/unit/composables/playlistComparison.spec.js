import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { usePlaylistComparison } from '@/composables/players/playlistComparison'

const makeInputs = ({
  entityList = [],
  playingEntityIndex = 0,
  taskTypeMap = new Map()
} = {}) => {
  const entityListRef = ref(entityList)
  const playingEntityIndexRef = ref(playingEntityIndex)
  const currentEntity = computed(
    () => entityListRef.value[playingEntityIndexRef.value] || null
  )
  return {
    entityList: entityListRef,
    playingEntityIndex: playingEntityIndexRef,
    currentEntity,
    taskTypeMap: ref(taskTypeMap),
    t: key => key
  }
}

describe('composables/playlistComparison', () => {
  describe('initial state', () => {
    it('starts not comparing, with empty option lists', () => {
      const c = usePlaylistComparison(makeInputs())
      expect(c.isComparing.value).toBe(false)
      expect(c.taskTypeOptions.value).toEqual([])
      expect(c.revisionOptions.value).toEqual([])
      expect(c.entityListToCompare.value).toEqual([])
      expect(c.comparisonEntityMissing.value).toBe(false)
      expect(c.revisionToCompare.value).toBe(null)
      expect(c.taskTypeId.value).toBe('')
      expect(c.comparisonMode.value).toBe('sidebyside')
    })
  })

  describe('taskTypeOptions', () => {
    it('lists task types from currentEntity.preview_files sorted by name desc', () => {
      const ttMap = new Map([
        ['tt-anim', { id: 'tt-anim', name: 'Animation' }],
        ['tt-lay', { id: 'tt-lay', name: 'Layout' }],
        ['tt-comp', { id: 'tt-comp', name: 'Compositing' }]
      ])
      const entity = {
        preview_files: {
          'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }],
          'tt-lay': [{ id: 'p2', revision: 1, extension: 'mp4' }],
          'tt-comp': [{ id: 'p3', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({ entityList: [entity], taskTypeMap: ttMap })
      )
      expect(c.taskTypeOptions.value).toEqual([
        { label: 'Layout', value: 'tt-lay' },
        { label: 'Compositing', value: 'tt-comp' },
        { label: 'Animation', value: 'tt-anim' }
      ])
    })

    it('returns [] when currentEntity is null', () => {
      const c = usePlaylistComparison(makeInputs())
      expect(c.taskTypeOptions.value).toEqual([])
    })

    it('skips task types absent from taskTypeMap', () => {
      const entity = {
        preview_files: {
          'tt-known': [{ id: 'p1', revision: 1, extension: 'mp4' }],
          'tt-unknown': [{ id: 'p2', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-known', { id: 'tt-known', name: 'Anim' }]])
        })
      )
      expect(c.taskTypeOptions.value).toEqual([
        { label: 'Anim', value: 'tt-known' }
      ])
    })
  })

  describe('revisionOptions', () => {
    it('lists revisions for the selected task type, descending, with Last prepended', () => {
      const entity = {
        preview_files: {
          'tt-anim': [
            { id: 'p1', revision: 1, extension: 'mp4' },
            { id: 'p3', revision: 3, extension: 'mp4' },
            { id: 'p2', revision: 2, extension: 'mp4' }
          ]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      expect(c.revisionOptions.value).toEqual([
        { label: 'Last', value: null },
        { label: 'v3', value: '3' },
        { label: 'v2', value: '2' },
        { label: 'v1', value: '1' }
      ])
    })

    it('returns [] when the selected task type has no preview files for the current entity', () => {
      const entity = { preview_files: {} }
      const c = usePlaylistComparison(
        makeInputs({ entityList: [entity], taskTypeMap: new Map() })
      )
      c.taskTypeId.value = 'tt-missing'
      expect(c.revisionOptions.value).toEqual([])
    })
  })

  describe('entityListToCompare', () => {
    it('maps each playlist entity to its matching preview for the selected revision', () => {
      const entityA = {
        preview_files: {
          'tt-anim': [
            { id: 'a1', revision: 1, extension: 'mp4' },
            { id: 'a2', revision: 2, extension: 'mp4' }
          ]
        }
      }
      const entityB = {
        preview_files: {
          'tt-anim': [{ id: 'b1', revision: 1, extension: 'png' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entityA, entityB],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      c.revisionToCompare.value = '2'
      expect(c.entityListToCompare.value).toEqual([
        { preview_file_id: 'a2', preview_file_extension: 'mp4' },
        // entity B has no revision 2 → fall back to its first preview
        { preview_file_id: 'b1', preview_file_extension: 'png' }
      ])
    })

    it('returns a "none" placeholder for entities without any preview files', () => {
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [{ preview_files: {} }],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      expect(c.entityListToCompare.value).toEqual([
        { preview_file_id: '', preview_file_extension: 'none' }
      ])
    })

    it('falls back to the first task-type when the selected one is missing on that entity', () => {
      const entity = {
        preview_files: {
          'tt-other': [{ id: 'o1', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      expect(c.entityListToCompare.value).toEqual([
        { preview_file_id: 'o1', preview_file_extension: 'mp4' }
      ])
    })

    it('returns [] when no task type is selected', () => {
      const c = usePlaylistComparison(makeInputs({ entityList: [{}, {}] }))
      expect(c.entityListToCompare.value).toEqual([])
    })

    it('returns the "none" placeholder when the fallback task-type has an empty array', () => {
      const entity = {
        preview_files: {
          'tt-other': []
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      expect(c.entityListToCompare.value).toEqual([
        { preview_file_id: '', preview_file_extension: 'none' }
      ])
    })
  })

  describe('current revision / preview / length / annotations', () => {
    const setup = ({ revision = null, index = 0 } = {}) => {
      const entity = {
        preview_files: {
          'tt-anim': [
            {
              id: 'p1',
              revision: 1,
              extension: 'mp4',
              annotations: [{ id: 'ann-1' }],
              previews: [{ id: 'p1-prev' }]
            },
            { id: 'p2', revision: 2, extension: 'mp4', annotations: [] }
          ]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      c.revisionToCompare.value = revision
      c.currentComparisonPreviewIndex.value = index
      return c
    }

    it('resolves currentRevisionToCompare to the matching preview', () => {
      const c = setup({ revision: '2' })
      expect(c.currentRevisionToCompare.value.id).toBe('p2')
    })

    it('falls back to the first preview when the revision is not found', () => {
      const c = setup({ revision: '99' })
      expect(c.currentRevisionToCompare.value.id).toBe('p1')
    })

    it('currentPreviewToCompare returns the indexed sub-preview when index > 0', () => {
      const c = setup({ revision: '1', index: 1 })
      expect(c.currentPreviewToCompare.value.id).toBe('p1-prev')
    })

    it('currentPreviewToCompare returns the revision itself when index = 0', () => {
      const c = setup({ revision: '1', index: 0 })
      expect(c.currentPreviewToCompare.value.id).toBe('p1')
    })

    it('currentComparisonPreviewLength counts sub-previews + 1', () => {
      const c = setup({ revision: '1' })
      expect(c.currentComparisonPreviewLength.value).toBe(2)
    })

    it('currentComparisonPreviewLength is 0 when there are no sub-previews', () => {
      const c = setup({ revision: '2' })
      expect(c.currentComparisonPreviewLength.value).toBe(0)
    })

    it('comparisonAnnotations is [] when not comparing', () => {
      const c = setup({ revision: '1' })
      expect(c.comparisonAnnotations.value).toEqual([])
    })

    it('comparisonAnnotations returns the revision annotations when comparing', () => {
      const c = setup({ revision: '1' })
      c.isComparing.value = true
      expect(c.comparisonAnnotations.value).toEqual([{ id: 'ann-1' }])
    })
  })

  describe('toggleComparison', () => {
    const entity = {
      preview_files: {
        'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }],
        'tt-comp': [{ id: 'p2', revision: 1, extension: 'mp4' }]
      }
    }

    it('turns comparison on and picks the saved task-type when available', () => {
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([
            ['tt-anim', { id: 'tt-anim', name: 'Anim' }],
            ['tt-comp', { id: 'tt-comp', name: 'Compositing' }]
          ])
        })
      )
      c.savedTaskTypeToCompare.value = 'tt-anim'
      c.toggleComparison()
      expect(c.isComparing.value).toBe(true)
      expect(c.taskTypeId.value).toBe('tt-anim')
      expect(c.revisionToCompare.value).toBe(null)
    })

    it('falls back to the first option and flags missing when saved is unavailable', () => {
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([
            ['tt-anim', { id: 'tt-anim', name: 'Anim' }],
            ['tt-comp', { id: 'tt-comp', name: 'Compositing' }]
          ])
        })
      )
      c.savedTaskTypeToCompare.value = 'tt-lay' // not available
      c.toggleComparison()
      expect(c.isComparing.value).toBe(true)
      // Sort is descending, so first option is "Compositing"
      expect(c.taskTypeId.value).toBe('tt-comp')
      expect(c.comparisonEntityMissing.value).toBe(true)
    })

    it('turns comparison off and clears the missing flag', () => {
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([
            ['tt-anim', { id: 'tt-anim', name: 'Anim' }]
          ])
        })
      )
      c.toggleComparison()
      c.toggleComparison()
      expect(c.isComparing.value).toBe(false)
    })
  })

  describe('comparison picture navigation', () => {
    const setup = () => {
      const entity = {
        preview_files: {
          'tt-anim': [
            {
              id: 'p1',
              revision: 1,
              extension: 'png',
              previews: [{ id: 'sub-1' }, { id: 'sub-2' }]
            }
          ]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      return c
    }

    it('next: 0 -> 1 -> 2 -> 0', () => {
      const c = setup()
      c.goToNextComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(1)
      c.goToNextComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(2)
      c.goToNextComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(0)
    })

    it('previous: 0 -> 2 -> 1 -> 0', () => {
      const c = setup()
      c.goToPreviousComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(2)
      c.goToPreviousComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(1)
      c.goToPreviousComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(0)
    })
  })

  describe('overlayOpacity', () => {
    const setup = () => {
      const entity = {
        preview_files: {
          'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      c.isComparing.value = true
      return c
    }

    it('returns 1 when comparison is off', () => {
      const c = setup()
      c.isComparing.value = false
      expect(c.overlayOpacity.value).toBe(1)
    })

    it('returns 1 in sidebyside mode', () => {
      const c = setup()
      c.comparisonMode.value = 'sidebyside'
      expect(c.overlayOpacity.value).toBe(1)
    })

    it('returns 1 for overlay0 (main fully visible)', () => {
      const c = setup()
      c.comparisonMode.value = 'overlay0'
      expect(c.overlayOpacity.value).toBe(1)
    })

    it('returns 0.25 for overlay25', () => {
      const c = setup()
      c.comparisonMode.value = 'overlay25'
      expect(c.overlayOpacity.value).toBe(0.25)
    })

    it('returns 0.5 for overlay50', () => {
      const c = setup()
      c.comparisonMode.value = 'overlay50'
      expect(c.overlayOpacity.value).toBe(0.5)
    })

    it('returns 0.75 for overlay75', () => {
      const c = setup()
      c.comparisonMode.value = 'overlay75'
      expect(c.overlayOpacity.value).toBe(0.75)
    })

    it('returns 0 for overlay100 (main fully hidden)', () => {
      const c = setup()
      c.comparisonMode.value = 'overlay100'
      expect(c.overlayOpacity.value).toBe(0)
    })
  })

  describe('comparisonEntityMissing', () => {
    it('is true when the saved task-type is not available on the current entity', () => {
      const entity = {
        preview_files: {
          'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.savedTaskTypeToCompare.value = 'tt-comp' // not available
      expect(c.comparisonEntityMissing.value).toBe(true)
    })

    it('is false when the saved task-type is available', () => {
      const entity = {
        preview_files: {
          'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.savedTaskTypeToCompare.value = 'tt-anim'
      expect(c.comparisonEntityMissing.value).toBe(false)
    })

    it('is false when no saved task-type has been set yet', () => {
      const entity = {
        preview_files: {
          'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      expect(c.comparisonEntityMissing.value).toBe(false)
    })
  })
})
