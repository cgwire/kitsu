import { annotationMixin } from '@/components/mixins/annotation'

const {
  resolveActionObject,
  undoLastAction,
  redoLastAction,
  deleteObject,
  addObject,
  getObjectById
} = annotationMixin.methods

// Build a fake fabric.Object identified by id. _objects marks it as a group.
const makeObj = (id, extras = {}) => ({ id, ...extras })

// Mocked instance with just enough surface for the stack logic to run.
// We provide real implementations of methods under test, and stubs for
// everything else they reach into.
const makeInstance = ({ canvasObjects = [] } = {}) => {
  const instance = {
    doneActionStack: [],
    undoneActionStack: [],
    fabricCanvas: {
      _objects: canvasObjects,
      getObjects: () => canvasObjects,
      add: vi.fn(obj => {
        // Mirror real fabric: 'object:added' fires synchronously and our
        // onObjectAdded calls addToAdditions then stackAddAction.
        instance.addToAdditions(obj)
        instance.doneActionStack.push({ type: 'add', obj })
      }),
      remove: vi.fn(obj => {
        const idx = canvasObjects.indexOf(obj)
        if (idx >= 0) canvasObjects.splice(idx, 1)
      }),
      discardActiveObject: vi.fn()
    },
    addToDeletions: vi.fn(),
    addToAdditions: vi.fn(),
    removeFromDeletions: vi.fn(),
    removeFromAdditions: vi.fn(),
    saveAnnotations: vi.fn(),
    getObjectById,
    resolveActionObject,
    undoLastAction,
    redoLastAction,
    deleteObject,
    addObject
  }
  return instance
}

describe('annotationMixin', () => {
  describe('resolveActionObject', () => {
    it('returns the live canvas instance when the id matches', () => {
      const stored = makeObj('a')
      const live = makeObj('a', { canvasOwned: true })
      const instance = makeInstance({ canvasObjects: [live] })
      const resolved = instance.resolveActionObject({ obj: stored })
      expect(resolved).toBe(live)
    })

    it('falls back to action.obj when the id is absent from the canvas', () => {
      const stored = makeObj('ghost')
      const instance = makeInstance({ canvasObjects: [] })
      const resolved = instance.resolveActionObject({ obj: stored })
      expect(resolved).toBe(stored)
    })

    it('returns the stored object directly for groups (_objects)', () => {
      const group = { _objects: [makeObj('a'), makeObj('b')] }
      // Even with a same-id object on the canvas, groups skip the lookup.
      const instance = makeInstance({ canvasObjects: [makeObj('a')] })
      const resolved = instance.resolveActionObject({ obj: group })
      expect(resolved).toBe(group)
    })
  })

  describe('undoLastAction', () => {
    it('returns early on an empty done stack', () => {
      const instance = makeInstance()
      instance.undoLastAction()
      expect(instance.doneActionStack).toEqual([])
      expect(instance.undoneActionStack).toEqual([])
    })

    it("undoes an 'add' by removing the live object and moving the action to undone", () => {
      const live = makeObj('a')
      const instance = makeInstance({ canvasObjects: [live] })
      const action = { type: 'add', obj: live }
      instance.doneActionStack.push(action)

      instance.undoLastAction()

      expect(instance.fabricCanvas.remove).toHaveBeenCalledWith(live)
      expect(instance.removeFromAdditions).toHaveBeenCalledWith(live)
      expect(instance.doneActionStack).toEqual([]) // side-effect pushes from deleteObject dropped by snapshot
      expect(instance.undoneActionStack).toEqual([action])
    })

    it("undoes a 'remove' by re-adding the object, even when it's no longer on the canvas (stale obj)", () => {
      const stale = makeObj('a')
      const instance = makeInstance({ canvasObjects: [] })
      const action = { type: 'remove', obj: stale }
      instance.doneActionStack.push(action)

      instance.undoLastAction()

      expect(instance.fabricCanvas.add).toHaveBeenCalledWith(stale)
      // addToAdditions must fire exactly once — via 'object:added' — not
      // also via an explicit call (regression on the double-call bug).
      expect(instance.addToAdditions).toHaveBeenCalledTimes(1)
      expect(instance.addToAdditions).toHaveBeenCalledWith(stale)
      expect(instance.removeFromDeletions).toHaveBeenCalledWith(stale)
      // The 'object:added' side-effect push is dropped by the snapshot.
      expect(instance.doneActionStack).toEqual([])
      expect(instance.undoneActionStack).toEqual([action])
    })

    it('resolves the live canvas instance even when the stack holds a stale ref', () => {
      const stale = makeObj('a')
      const live = makeObj('a', { fresh: true })
      const instance = makeInstance({ canvasObjects: [live] })
      const action = { type: 'add', obj: stale }
      instance.doneActionStack.push(action)

      instance.undoLastAction()

      // remove is called with the live instance, not the stale one.
      expect(instance.fabricCanvas.remove).toHaveBeenCalledWith(live)
    })

    it("undoes an 'add' on a group, dropping the N 'remove' side-effect pushes", () => {
      const child1 = makeObj('a')
      const child2 = makeObj('b')
      const group = { _objects: [child1, child2] }
      const instance = makeInstance({ canvasObjects: [child1, child2] })
      const action = { type: 'add', obj: group }
      instance.doneActionStack.push(action)

      instance.undoLastAction()

      expect(instance.fabricCanvas.discardActiveObject).toHaveBeenCalled()
      expect(instance.fabricCanvas.remove).toHaveBeenCalledTimes(2)
      expect(instance.doneActionStack).toEqual([])
      expect(instance.undoneActionStack).toEqual([action])
    })
  })

  describe('redoLastAction', () => {
    it('returns early on an empty undone stack', () => {
      const instance = makeInstance()
      instance.redoLastAction()
      expect(instance.doneActionStack).toEqual([])
      expect(instance.undoneActionStack).toEqual([])
    })

    it("redoes an 'add' by re-adding the object, leaving exactly one entry on done (drops the double-push)", () => {
      // Regression: addObject for single object causes two pushes (the
      // 'object:added' event + the persist branch). The snapshot pattern
      // must drop both before pushing the action back onto done.
      const obj = makeObj('a')
      const instance = makeInstance({ canvasObjects: [] })
      const action = { type: 'add', obj }
      instance.undoneActionStack.push(action)

      instance.redoLastAction()

      expect(instance.fabricCanvas.add).toHaveBeenCalledWith(obj)
      expect(instance.doneActionStack).toEqual([action]) // exactly one
      expect(instance.undoneActionStack).toEqual([])
    })

    it("redoes a 'remove' by removing the object", () => {
      const obj = makeObj('a')
      const instance = makeInstance({ canvasObjects: [obj] })
      const action = { type: 'remove', obj }
      instance.undoneActionStack.push(action)

      instance.redoLastAction()

      expect(instance.fabricCanvas.remove).toHaveBeenCalledWith(obj)
      expect(instance.doneActionStack).toEqual([action])
    })

    it("redoes a 'remove' on a group, dropping the N 'remove' side-effect pushes", () => {
      const child1 = makeObj('a')
      const child2 = makeObj('b')
      const group = { _objects: [child1, child2] }
      const instance = makeInstance({ canvasObjects: [child1, child2] })
      const action = { type: 'remove', obj: group }
      instance.undoneActionStack.push(action)

      instance.redoLastAction()

      expect(instance.fabricCanvas.discardActiveObject).toHaveBeenCalled()
      expect(instance.fabricCanvas.remove).toHaveBeenCalledTimes(2)
      expect(instance.doneActionStack).toEqual([action])
      expect(instance.undoneActionStack).toEqual([])
    })
  })

  describe('deleteObject', () => {
    it('removes a single object and pushes a remove action', () => {
      const obj = makeObj('a')
      const instance = makeInstance({ canvasObjects: [obj] })

      instance.deleteObject(obj)

      expect(instance.fabricCanvas.remove).toHaveBeenCalledWith(obj)
      expect(instance.addToDeletions).toHaveBeenCalledWith(obj)
      expect(instance.doneActionStack).toEqual([{ type: 'remove', obj }])
      expect(instance.saveAnnotations).toHaveBeenCalled()
    })

    it("discards the ActiveSelection before iterating, and clones _objects so it doesn't get emptied", () => {
      // Regression: ActiveSelection children carry coords relative to the
      // selection's center. discardActiveObject() restores them to absolute
      // before we remove them.
      const child1 = makeObj('a')
      const child2 = makeObj('b')
      const selection = { _objects: [child1, child2] }
      const instance = makeInstance({ canvasObjects: [child1, child2] })

      // Simulate fabric clearing the _objects on discardActiveObject(),
      // proving the deleteObject implementation cloned the array up-front.
      instance.fabricCanvas.discardActiveObject = vi.fn(() => {
        selection._objects.length = 0
      })

      instance.deleteObject(selection)

      expect(instance.fabricCanvas.discardActiveObject).toHaveBeenCalled()
      expect(instance.fabricCanvas.remove).toHaveBeenCalledTimes(2)
      expect(instance.fabricCanvas.remove).toHaveBeenNthCalledWith(1, child1)
      expect(instance.fabricCanvas.remove).toHaveBeenNthCalledWith(2, child2)
      expect(instance.doneActionStack).toEqual([
        { type: 'remove', obj: child1 },
        { type: 'remove', obj: child2 }
      ])
    })
  })
})
