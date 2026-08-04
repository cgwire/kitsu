import { descriptorMixin } from '@/components/mixins/descriptors'

const { onMetadataFieldChanged, getMetadataFieldValue } = descriptorMixin.methods

const DESCRIPTOR = { field_name: 'duration', data_type: 'string' }

const shot = (id, duration) => ({ id, data: { duration } })

const makeContext = (...selectedShots) => ({
  selectedShots: new Map(selectedShots.map(entry => [entry.id, entry])),
  selectedAssets: new Map(),
  selectedEdits: new Map(),
  selectedEpisodes: new Map(),
  getMetadataFieldValue,
  emitMetadataChanged: vi.fn()
})

// The browser rewrites the field itself and fires a plain input event; only
// inputType tells it apart from a keystroke.
const makeEvent = (value, inputType) => {
  const input = document.createElement('input')
  input.value = value
  return { target: input, inputType }
}

describe('metadata field edition', () => {
  test('a typed value is propagated to every selected entry', () => {
    const a = shot('shot-a', '120')
    const b = shot('shot-b', '48')
    const context = makeContext(a, b)

    onMetadataFieldChanged.call(
      context,
      a,
      DESCRIPTOR,
      makeEvent('96', 'insertText')
    )

    expect(context.emitMetadataChanged).toHaveBeenCalledTimes(2)
    expect(context.emitMetadataChanged).toHaveBeenCalledWith(a, DESCRIPTOR, '96')
    expect(context.emitMetadataChanged).toHaveBeenCalledWith(b, DESCRIPTOR, '96')
  })

  test.each(['historyUndo', 'historyRedo'])(
    'a %s input writes nothing and restores the stored value',
    inputType => {
      const a = shot('shot-a', '120')
      const b = shot('shot-b', '48')
      const context = makeContext(a, b)
      const event = makeEvent('96', inputType)

      onMetadataFieldChanged.call(context, a, DESCRIPTOR, event)

      expect(context.emitMetadataChanged).not.toHaveBeenCalled()
      expect(event.target.value).toBe('120')
    }
  )
})
