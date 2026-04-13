<template>
  <div class="board-canvas-wrapper" ref="canvasWrapper">
    <div class="board-toolbar">
      <div class="tool-group">
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'select' }"
          @click="setTool('select')"
          title="Select (V)"
        >
          <mouse-pointer-icon :size="18" />
        </button>
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'pan' }"
          @click="setTool('pan')"
          title="Pan (Space)"
        >
          <hand-icon :size="18" />
        </button>
      </div>

      <div class="tool-separator" />

      <div class="tool-group">
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'pencil' }"
          @click="setTool('pencil')"
          title="Draw (D)"
        >
          <edit2-icon :size="18" />
        </button>
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'line' }"
          @click="setTool('line')"
          title="Line (L)"
        >
          <minus-icon :size="18" />
        </button>
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'arrow' }"
          @click="setTool('arrow')"
          title="Arrow (A)"
        >
          <arrow-up-right-icon :size="18" />
        </button>
      </div>

      <div class="tool-separator" />

      <div class="tool-group">
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'rect' }"
          @click="setTool('rect')"
          title="Rectangle (R)"
        >
          <square-icon :size="18" />
        </button>
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'circle' }"
          @click="setTool('circle')"
          title="Circle (C)"
        >
          <circle-icon :size="18" />
        </button>
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'text' }"
          @click="setTool('text')"
          title="Text (T)"
        >
          <type-icon :size="18" />
        </button>
      </div>

      <div class="tool-separator" />

      <div class="tool-group">
        <button class="tool-btn" @click="addImage" title="Add Image (I)">
          <image-icon :size="18" />
        </button>
        <button class="tool-btn" @click="addStickyNote" title="Sticky Note (N)">
          <sticky-note-icon :size="18" />
        </button>
        <button class="tool-btn" @click="addLink" title="Add Link">
          <link-icon :size="18" />
        </button>
      </div>

      <div class="tool-separator" />

      <div class="tool-group">
        <input
          type="color"
          class="color-picker"
          v-model="strokeColor"
          title="Stroke Color"
        />
        <input
          type="color"
          class="color-picker"
          v-model="fillColor"
          title="Fill Color"
        />
        <select class="stroke-width-select" v-model="strokeWidth">
          <option :value="1">Thin</option>
          <option :value="2">Normal</option>
          <option :value="4">Thick</option>
          <option :value="8">Extra</option>
        </select>
        <select
          class="stroke-width-select"
          v-model="fontSize"
          title="Font Size"
        >
          <option :value="12">12</option>
          <option :value="14">14</option>
          <option :value="18">18</option>
          <option :value="24">24</option>
          <option :value="32">32</option>
          <option :value="48">48</option>
          <option :value="72">72</option>
        </select>
      </div>

      <div class="tool-separator" />

      <div class="tool-group">
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'connector' }"
          @click="setTool('connector')"
          title="Connector (K)"
        >
          <git-branch-icon :size="18" />
        </button>
        <button class="tool-btn" @click="addYouTubeEmbed" title="YouTube Embed">
          <youtube-icon :size="18" />
        </button>
        <button class="tool-btn" @click="addSticker" title="Sticker (S)">
          <smile-icon :size="18" />
        </button>
      </div>

      <div class="tool-separator" />

      <div class="tool-group">
        <button class="tool-btn" @click="groupSelected" title="Group (Ctrl+G)">
          <layers-icon :size="18" />
        </button>
        <button
          class="tool-btn"
          @click="ungroupSelected"
          title="Ungroup (Ctrl+Shift+G)"
        >
          <grid-icon :size="18" />
        </button>
        <button
          class="tool-btn"
          @click="toggleLockSelected"
          title="Lock/Unlock (Ctrl+L)"
        >
          <lock-icon :size="18" />
        </button>
        <button
          class="tool-btn"
          :class="{ active: snapToGrid }"
          @click="snapToGrid = !snapToGrid"
          title="Snap to Grid"
        >
          <grid-icon :size="18" />
        </button>
        <button class="tool-btn" @click="deleteSelected" title="Delete (Del)">
          <trash2-icon :size="18" />
        </button>
      </div>

      <div class="tool-separator" />

      <div class="tool-group">
        <button class="tool-btn" @click="undo" title="Undo (Ctrl+Z)">
          <undo2-icon :size="18" />
        </button>
        <button class="tool-btn" @click="redo" title="Redo (Ctrl+Y)">
          <redo2-icon :size="18" />
        </button>
        <button class="tool-btn" @click="zoomToFit" title="Zoom to Fit">
          <maximize-icon :size="18" />
        </button>
      </div>

      <div class="tool-separator" />

      <div class="tool-group zoom-controls">
        <button class="tool-btn" @click="zoomOut" title="Zoom Out">
          <zoom-out-icon :size="18" />
        </button>
        <span class="zoom-level">{{ zoomPercent }}%</span>
        <button class="tool-btn" @click="zoomIn" title="Zoom In">
          <zoom-in-icon :size="18" />
        </button>
      </div>
    </div>

    <div
      class="canvas-container"
      ref="canvasContainer"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <canvas ref="boardCanvas" />
    </div>

    <label class="hidden-file-input">
      <input
        type="file"
        ref="fileInput"
        accept="image/*"
        @change="onFileSelected"
        multiple
      />
    </label>
  </div>
</template>

<script>
import { fabric } from 'fabric'
import { v4 as uuidv4 } from 'uuid'
import { markRaw } from 'vue'

import {
  ArrowUpRightIcon,
  CircleIcon,
  Edit2Icon,
  GitBranchIcon,
  GridIcon,
  ImageIcon,
  LayersIcon,
  LinkIcon,
  LockIcon,
  MaximizeIcon,
  MinusIcon,
  MousePointerIcon,
  HandIcon,
  Redo2Icon,
  SmileIcon,
  SquareIcon,
  StickyNoteIcon,
  Trash2Icon,
  TypeIcon,
  Undo2Icon,
  YoutubeIcon,
  ZoomInIcon,
  ZoomOutIcon
} from 'lucide-vue-next'

export default {
  name: 'board-canvas',

  components: {
    ArrowUpRightIcon,
    CircleIcon,
    Edit2Icon,
    GitBranchIcon,
    GridIcon,
    ImageIcon,
    LayersIcon,
    LinkIcon,
    LockIcon,
    MaximizeIcon,
    MinusIcon,
    MousePointerIcon,
    HandIcon,
    Redo2Icon,
    SmileIcon,
    SquareIcon,
    StickyNoteIcon,
    Trash2Icon,
    TypeIcon,
    Undo2Icon,
    YoutubeIcon,
    ZoomInIcon,
    ZoomOutIcon
  },

  props: {
    board: { type: Object, default: null },
    entities: { type: Array, default: () => [] }
  },

  emits: ['canvas-changed'],

  data() {
    return {
      canvas: null,
      activeTool: 'select',
      strokeColor: '#333333',
      fillColor: '#ffffff',
      strokeWidth: 2,
      zoomLevel: 1,
      isPanning: false,
      panStartPoint: null,
      undoStack: [],
      redoStack: [],
      isDrawingShape: false,
      shapeStartPoint: null,
      currentShape: null,
      fontSize: 18,
      isSaving: false,
      isSpacePanning: false,
      toolBeforeSpace: 'select',
      snapToGrid: false,
      gridSize: 20,
      connectorStart: null
    }
  },

  computed: {
    zoomPercent() {
      return Math.round(this.zoomLevel * 100)
    }
  },

  mounted() {
    this.initCanvas()
    this.setupKeyboardShortcuts()
    window.addEventListener('resize', this.resizeCanvas)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.resizeCanvas)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    if (this.canvas) {
      this.canvas.dispose()
    }
  },

  watch: {
    board: {
      handler(newBoard, oldBoard) {
        if (newBoard && this.canvas && newBoard.id !== oldBoard?.id) {
          this.loadCanvasData(newBoard.canvas_data)
        }
      },
      immediate: false
    }
  },

  methods: {
    initCanvas() {
      const container = this.$refs.canvasContainer
      const width = container.clientWidth
      const height = container.clientHeight

      this.canvas = markRaw(
        new fabric.Canvas(this.$refs.boardCanvas, {
          width,
          height,
          backgroundColor: '#f5f5f5',
          selection: true,
          preserveObjectStacking: true,
          enableRetinaScaling: true
        })
      )

      this.canvas.on('object:modified', () => this.pushUndoState())
      this.canvas.on('object:added', () => {
        if (!this.isSaving) this.pushUndoState()
      })
      this.canvas.on('object:moving', e => {
        if (this.snapToGrid) {
          const obj = e.target
          obj.set({
            left: Math.round(obj.left / this.gridSize) * this.gridSize,
            top: Math.round(obj.top / this.gridSize) * this.gridSize
          })
        }
      })

      this.canvas.on('mouse:down', this.onMouseDown)
      this.canvas.on('mouse:move', this.onMouseMove)
      this.canvas.on('mouse:up', this.onMouseUp)
      this.canvas.on('mouse:wheel', this.onMouseWheel)

      console.log(
        '[Board] initCanvas — board:',
        !!this.board,
        'canvas_data:',
        !!this.board?.canvas_data,
        'objects:',
        this.board?.canvas_data?.objects?.length
      )
      if (this.board && this.board.canvas_data) {
        this.loadCanvasData(this.board.canvas_data)
      } else {
        this.pushUndoState()
      }
    },

    resizeCanvas() {
      if (!this.canvas || !this.$refs.canvasContainer) return
      const container = this.$refs.canvasContainer
      this.canvas.setWidth(container.clientWidth)
      this.canvas.setHeight(container.clientHeight)
      this.canvas.renderAll()
    },

    // --- Tools ---

    setTool(tool) {
      this.activeTool = tool
      this.canvas.isDrawingMode = tool === 'pencil'
      this.canvas.selection = tool === 'select'

      if (tool === 'pencil') {
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas)
        this.canvas.freeDrawingBrush.color = this.strokeColor
        this.canvas.freeDrawingBrush.width = this.strokeWidth * 2
      }

      if (tool === 'select') {
        this.canvas.defaultCursor = 'default'
        this.canvas.hoverCursor = 'move'
      } else if (tool === 'pan') {
        this.canvas.defaultCursor = 'grab'
        this.canvas.hoverCursor = 'grab'
      } else if (tool === 'text') {
        this.canvas.defaultCursor = 'text'
      } else {
        this.canvas.defaultCursor = 'crosshair'
        this.canvas.hoverCursor = 'crosshair'
      }
    },

    // --- Mouse Handlers ---

    onMouseDown(opt) {
      const e = opt.e
      const pointer = this.canvas.getPointer(e)

      if (this.activeTool === 'pan') {
        this.isPanning = true
        this.panStartPoint = { x: e.clientX, y: e.clientY }
        this.canvas.defaultCursor = 'grabbing'
        return
      }

      if (this.activeTool === 'text' && !opt.target) {
        const text = new fabric.IText('Type here', {
          left: pointer.x,
          top: pointer.y,
          fontSize: this.fontSize,
          fill: this.strokeColor,
          fontFamily: 'Inter, Arial, sans-serif',
          id: uuidv4()
        })
        this.canvas.add(text)
        this.canvas.setActiveObject(text)
        text.enterEditing()
        this.setTool('select')
        this.emitChange()
        return
      }

      if (this.activeTool === 'connector') {
        if (!this.connectorStart) {
          this.connectorStart = {
            x: pointer.x,
            y: pointer.y,
            target: opt.target
          }
        } else {
          this.drawConnector(
            this.connectorStart.x,
            this.connectorStart.y,
            pointer.x,
            pointer.y
          )
          this.connectorStart = null
          this.emitChange()
        }
        return
      }

      if (
        ['rect', 'circle', 'line', 'arrow'].includes(this.activeTool) &&
        !opt.target
      ) {
        this.isDrawingShape = true
        this.shapeStartPoint = pointer

        if (this.activeTool === 'rect') {
          this.currentShape = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: this.fillColor === '#ffffff' ? 'transparent' : this.fillColor,
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth,
            id: uuidv4()
          })
        } else if (this.activeTool === 'circle') {
          this.currentShape = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            fill: this.fillColor === '#ffffff' ? 'transparent' : this.fillColor,
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth,
            id: uuidv4()
          })
        } else if (this.activeTool === 'line' || this.activeTool === 'arrow') {
          this.currentShape = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: this.strokeColor,
              strokeWidth: this.strokeWidth,
              id: uuidv4()
            }
          )
        }

        if (this.currentShape) {
          this.canvas.add(this.currentShape)
        }
      }
    },

    onMouseMove(opt) {
      const e = opt.e

      if (this.isPanning && this.panStartPoint) {
        const vpt = this.canvas.viewportTransform
        vpt[4] += e.clientX - this.panStartPoint.x
        vpt[5] += e.clientY - this.panStartPoint.y
        this.panStartPoint = { x: e.clientX, y: e.clientY }
        this.canvas.requestRenderAll()
        return
      }

      if (this.isDrawingShape && this.currentShape) {
        const pointer = this.canvas.getPointer(e)

        if (this.activeTool === 'rect') {
          const left = Math.min(pointer.x, this.shapeStartPoint.x)
          const top = Math.min(pointer.y, this.shapeStartPoint.y)
          const width = Math.abs(pointer.x - this.shapeStartPoint.x)
          const height = Math.abs(pointer.y - this.shapeStartPoint.y)
          this.currentShape.set({ left, top, width, height })
        } else if (this.activeTool === 'circle') {
          const rx = Math.abs(pointer.x - this.shapeStartPoint.x) / 2
          const ry = Math.abs(pointer.y - this.shapeStartPoint.y) / 2
          const left = Math.min(pointer.x, this.shapeStartPoint.x)
          const top = Math.min(pointer.y, this.shapeStartPoint.y)
          this.currentShape.set({ left, top, rx, ry })
        } else if (this.activeTool === 'line' || this.activeTool === 'arrow') {
          this.currentShape.set({ x2: pointer.x, y2: pointer.y })
        }

        this.canvas.renderAll()
      }
    },

    onMouseUp() {
      if (this.isPanning) {
        this.isPanning = false
        this.canvas.defaultCursor = 'grab'
        return
      }

      if (this.isDrawingShape && this.currentShape) {
        if (this.activeTool === 'arrow') {
          this.addArrowHead(this.currentShape)
        }
        this.isDrawingShape = false
        this.currentShape = null
        this.emitChange()
      }
    },

    onMouseWheel(opt) {
      const e = opt.e
      e.preventDefault()
      e.stopPropagation()

      const delta = e.deltaY
      let zoom = this.canvas.getZoom()
      zoom *= 0.999 ** delta
      zoom = Math.min(Math.max(zoom, 0.1), 10)

      const point = new fabric.Point(e.offsetX, e.offsetY)
      this.canvas.zoomToPoint(point, zoom)
      this.zoomLevel = zoom
    },

    addArrowHead(line) {
      const x1 = line.x1
      const y1 = line.y1
      const x2 = line.x2
      const y2 = line.y2
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const headLen = 15

      const head = new fabric.Triangle({
        left: x2,
        top: y2,
        width: headLen,
        height: headLen,
        fill: this.strokeColor,
        angle: (angle * 180) / Math.PI + 90,
        originX: 'center',
        originY: 'center',
        id: uuidv4()
      })

      const group = new fabric.Group([line, head], { id: uuidv4() })
      this.canvas.remove(line)
      this.canvas.add(group)
    },

    // --- Add Elements ---

    addImage() {
      this.$refs.fileInput.click()
    },

    onFileSelected(e) {
      const files = e.target.files
      if (!files.length) return
      Array.from(files).forEach((file, idx) => {
        this.loadImageFile(file, idx * 220)
      })
      e.target.value = ''
    },

    loadImageFile(file, offsetX = 0) {
      const reader = new FileReader()
      reader.onload = event => {
        fabric.Image.fromURL(event.target.result).then(img => {
          const maxDim = 400
          const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
          img.set({
            left: 100 + offsetX,
            top: 100,
            scaleX: scale,
            scaleY: scale,
            id: uuidv4()
          })
          this.canvas.add(img)
          this.canvas.setActiveObject(img)
          this.canvas.renderAll()
          this.emitChange()
        })
      }
      reader.readAsDataURL(file)
    },

    onDrop(e) {
      const files = e.dataTransfer.files
      if (files.length) {
        Array.from(files).forEach((file, idx) => {
          if (file.type.startsWith('image/')) {
            this.loadImageFile(file, idx * 220)
          }
        })
        return
      }

      const entityData = e.dataTransfer.getData('application/json')
      if (entityData) {
        try {
          const entity = JSON.parse(entityData)
          this.addEntityToCanvas(entity, e)
        } catch (err) {
          console.error('Drop parse error:', err)
        }
      }
    },

    addEntityToCanvas(entity, dropEvent) {
      const pointer = this.canvas.getPointer(dropEvent)
      const previewUrl = entity.preview_file_id
        ? `/api/pictures/originals/preview-files/${entity.preview_file_id}.png`
        : null

      if (previewUrl) {
        fabric.Image.fromURL(previewUrl).then(img => {
          const maxDim = 300
          const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
          img.set({
            left: pointer.x,
            top: pointer.y,
            scaleX: scale,
            scaleY: scale,
            id: uuidv4()
          })

          const label = new fabric.Text(entity.name || 'Entity', {
            left: pointer.x,
            top: pointer.y + img.height * scale + 5,
            fontSize: 12,
            fill: '#666',
            fontFamily: 'Inter, Arial, sans-serif'
          })

          const group = new fabric.Group([img, label], {
            left: pointer.x,
            top: pointer.y,
            id: uuidv4(),
            entityId: entity.id,
            entityType: entity.type
          })
          this.canvas.add(group)
          this.canvas.renderAll()
          this.emitChange()
        })
      } else {
        this.addEntityCard(entity, pointer)
      }
    },

    addEntityCard(entity, pointer) {
      const rect = new fabric.Rect({
        width: 200,
        height: 120,
        fill: '#fff',
        stroke: '#ddd',
        strokeWidth: 1,
        rx: 6,
        ry: 6
      })
      const title = new fabric.Text(entity.name || 'Unknown', {
        left: 10,
        top: 10,
        fontSize: 14,
        fill: '#333',
        fontFamily: 'Inter, Arial, sans-serif',
        fontWeight: 'bold'
      })
      const typeLabel = new fabric.Text(entity.type || '', {
        left: 10,
        top: 30,
        fontSize: 11,
        fill: '#999',
        fontFamily: 'Inter, Arial, sans-serif'
      })

      const group = new fabric.Group([rect, title, typeLabel], {
        left: pointer.x,
        top: pointer.y,
        id: uuidv4(),
        entityId: entity.id,
        entityType: entity.type
      })
      this.canvas.add(group)
      this.canvas.renderAll()
      this.emitChange()
    },

    addStickyNote() {
      const colors = ['#fff9c4', '#f8bbd0', '#c8e6c9', '#bbdefb', '#d1c4e9']
      const color = colors[Math.floor(Math.random() * colors.length)]
      const center = this.canvas.getCenter()

      const rect = new fabric.Rect({
        width: 200,
        height: 150,
        fill: color,
        stroke: '#ccc',
        strokeWidth: 1,
        rx: 4,
        ry: 4,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.15)',
          blur: 8,
          offsetX: 2,
          offsetY: 2
        })
      })

      const text = new fabric.IText('Note...', {
        left: 10,
        top: 10,
        fontSize: 14,
        fill: '#333',
        fontFamily: 'Inter, Arial, sans-serif',
        width: 180
      })

      const group = new fabric.Group([rect, text], {
        left: center.left - 100,
        top: center.top - 75,
        id: uuidv4(),
        subTargetCheck: true
      })

      this.canvas.add(group)
      this.canvas.setActiveObject(group)
      this.canvas.renderAll()
      this.emitChange()
    },

    addLink() {
      const url = prompt('Enter URL:')
      if (!url) return

      const center = this.canvas.getCenter()
      const rect = new fabric.Rect({
        width: 240,
        height: 36,
        fill: '#e3f2fd',
        stroke: '#2196f3',
        strokeWidth: 1,
        rx: 4,
        ry: 4
      })

      let displayUrl
      try {
        const parsed = new URL(url)
        displayUrl = parsed.hostname + parsed.pathname.slice(0, 20)
      } catch {
        displayUrl = url.slice(0, 30)
      }

      const text = new fabric.Text(displayUrl, {
        left: 8,
        top: 8,
        fontSize: 13,
        fill: '#1565c0',
        fontFamily: 'Inter, Arial, sans-serif'
      })

      const group = new fabric.Group([rect, text], {
        left: center.left - 120,
        top: center.top - 18,
        id: uuidv4(),
        linkUrl: url
      })

      this.canvas.add(group)
      this.canvas.renderAll()
      this.emitChange()

      group.on('mousedblclick', () => {
        window.open(url, '_blank')
      })
    },

    // --- Grouping ---

    groupSelected() {
      const activeObj = this.canvas.getActiveObject()
      if (!activeObj || activeObj.type !== 'activeSelection') return

      activeObj.toGroup()
      activeObj.set('id', uuidv4())
      this.canvas.renderAll()
      this.emitChange()
    },

    ungroupSelected() {
      const activeObj = this.canvas.getActiveObject()
      if (!activeObj || activeObj.type !== 'group') return

      activeObj.toActiveSelection()
      this.canvas.renderAll()
      this.emitChange()
    },

    deleteSelected() {
      const activeObj = this.canvas.getActiveObject()
      if (!activeObj) return

      if (activeObj.type === 'activeSelection') {
        activeObj.forEachObject(obj => this.canvas.remove(obj))
        this.canvas.discardActiveObject()
      } else {
        this.canvas.remove(activeObj)
      }
      this.canvas.renderAll()
      this.pushUndoState()
      this.emitChange()
    },

    // --- Undo / Redo ---

    pushUndoState() {
      const json = this.canvas.toJSON([
        'id',
        'entityId',
        'entityType',
        'linkUrl'
      ])
      this.undoStack.push(JSON.stringify(json))
      if (this.undoStack.length > 50) this.undoStack.shift()
      this.redoStack = []
    },

    undo() {
      if (this.undoStack.length <= 1) return
      const current = this.undoStack.pop()
      this.redoStack.push(current)
      const prev = this.undoStack[this.undoStack.length - 1]
      this.isSaving = true
      this.canvas.loadFromJSON(JSON.parse(prev)).then(() => {
        this.canvas.renderAll()
        this.isSaving = false
        this.emitChange()
      })
    },

    redo() {
      if (!this.redoStack.length) return
      const next = this.redoStack.pop()
      this.undoStack.push(next)
      this.isSaving = true
      this.canvas.loadFromJSON(JSON.parse(next)).then(() => {
        this.canvas.renderAll()
        this.isSaving = false
        this.emitChange()
      })
    },

    // --- Zoom ---

    zoomIn() {
      const zoom = Math.min(this.zoomLevel * 1.2, 10)
      this.canvas.setZoom(zoom)
      this.zoomLevel = zoom
    },

    zoomOut() {
      const zoom = Math.max(this.zoomLevel / 1.2, 0.1)
      this.canvas.setZoom(zoom)
      this.zoomLevel = zoom
    },

    zoomToFit() {
      const objects = this.canvas.getObjects()
      if (!objects.length) {
        this.canvas.setZoom(1)
        this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0]
        this.zoomLevel = 1
        this.canvas.renderAll()
        return
      }

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity
      objects.forEach(obj => {
        const bound = obj.getBoundingRect()
        minX = Math.min(minX, bound.left)
        minY = Math.min(minY, bound.top)
        maxX = Math.max(maxX, bound.left + bound.width)
        maxY = Math.max(maxY, bound.top + bound.height)
      })

      const objWidth = maxX - minX
      const objHeight = maxY - minY
      const canvasWidth = this.canvas.getWidth()
      const canvasHeight = this.canvas.getHeight()

      const zoom = Math.min(
        (canvasWidth * 0.9) / objWidth,
        (canvasHeight * 0.9) / objHeight,
        2
      )

      this.canvas.setZoom(zoom)
      this.canvas.viewportTransform[4] =
        canvasWidth / 2 - (minX + objWidth / 2) * zoom
      this.canvas.viewportTransform[5] =
        canvasHeight / 2 - (minY + objHeight / 2) * zoom
      this.zoomLevel = zoom
      this.canvas.renderAll()
    },

    // --- Keyboard ---

    setupKeyboardShortcuts() {
      window.addEventListener('keydown', this.onKeyDown)
      window.addEventListener('keyup', this.onKeyUp)
    },

    onKeyUp(e) {
      if (e.key === ' ' && this.isSpacePanning) {
        this.isSpacePanning = false
        this.setTool(this.toolBeforeSpace)
      }
    },

    onKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
        return
      const active = this.canvas?.getActiveObject()
      if (active && active.isEditing) return

      const ctrl = e.ctrlKey || e.metaKey

      switch (e.key.toLowerCase()) {
        case 'v':
          if (!ctrl) this.setTool('select')
          break
        case ' ':
          if (!this.isSpacePanning) {
            this.toolBeforeSpace = this.activeTool
            this.isSpacePanning = true
            this.setTool('pan')
            e.preventDefault()
          }
          break
        case 'd':
          this.setTool('pencil')
          break
        case 'l':
          if (ctrl) {
            this.toggleLockSelected()
            e.preventDefault()
          } else {
            this.setTool('line')
          }
          break
        case 'a':
          if (!ctrl) this.setTool('arrow')
          break
        case 'r':
          this.setTool('rect')
          break
        case 'c':
          if (!ctrl) this.setTool('circle')
          break
        case 't':
          this.setTool('text')
          break
        case 'i':
          if (!ctrl) this.addImage()
          break
        case 'n':
          this.addStickyNote()
          break
        case 'delete':
        case 'backspace':
          this.deleteSelected()
          e.preventDefault()
          break
        case 'z':
          if (ctrl && e.shiftKey) {
            this.redo()
            e.preventDefault()
          } else if (ctrl) {
            this.undo()
            e.preventDefault()
          }
          break
        case 'y':
          if (ctrl) {
            this.redo()
            e.preventDefault()
          }
          break
        case 'g':
          if (ctrl && e.shiftKey) {
            this.ungroupSelected()
            e.preventDefault()
          } else if (ctrl) {
            this.groupSelected()
            e.preventDefault()
          }
          break
        case '=':
        case '+':
          if (ctrl) {
            this.zoomIn()
            e.preventDefault()
          }
          break
        case '-':
          if (ctrl) {
            this.zoomOut()
            e.preventDefault()
          }
          break
        case '0':
          if (ctrl) {
            this.zoomToFit()
            e.preventDefault()
          }
          break
        case 'k':
          if (!ctrl) this.setTool('connector')
          break
        case 's':
          if (!ctrl) this.addSticker()
          else {
            this.emitChange()
            e.preventDefault()
          }
          break
      }
    },

    // --- Connectors ---

    drawConnector(x1, y1, x2, y2) {
      const line = new fabric.Line([x1, y1, x2, y2], {
        stroke: this.strokeColor,
        strokeWidth: 2,
        strokeDashArray: [5, 3],
        id: uuidv4()
      })

      // Add dots at endpoints
      const dot1 = new fabric.Circle({
        left: x1 - 4,
        top: y1 - 4,
        radius: 4,
        fill: this.strokeColor
      })
      const dot2 = new fabric.Circle({
        left: x2 - 4,
        top: y2 - 4,
        radius: 4,
        fill: this.strokeColor
      })

      const group = new fabric.Group([line, dot1, dot2], {
        id: uuidv4(),
        isConnector: true
      })
      this.canvas.add(group)
      this.canvas.renderAll()
      this.emitChange()
    },

    // --- YouTube Embed ---

    addYouTubeEmbed() {
      const url = prompt('YouTube URL:')
      if (!url) return

      let videoId
      try {
        const parsed = new URL(url)
        videoId =
          parsed.searchParams.get('v') || parsed.pathname.split('/').pop() || ''
      } catch {
        videoId = url
      }
      if (!videoId) return

      const center = this.canvas.getCenter()
      const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

      // Create a card with the YouTube thumbnail
      const rect = new fabric.Rect({
        width: 320,
        height: 200,
        fill: '#000',
        stroke: '#ff0000',
        strokeWidth: 2,
        rx: 8,
        ry: 8
      })

      const playBtn = new fabric.Triangle({
        left: 140,
        top: 75,
        width: 40,
        height: 50,
        fill: '#ff0000',
        angle: 90,
        originX: 'center',
        originY: 'center'
      })

      const label = new fabric.Text('YouTube: ' + videoId, {
        left: 10,
        top: 175,
        fontSize: 11,
        fill: '#fff',
        fontFamily: 'Inter, Arial, sans-serif'
      })

      const group = new fabric.Group([rect, playBtn, label], {
        left: center.left - 160,
        top: center.top - 100,
        id: uuidv4(),
        linkUrl: url,
        isYouTube: true
      })

      this.canvas.add(group)
      this.canvas.renderAll()
      this.emitChange()

      // Load actual thumbnail
      fabric.Image.fromURL(thumbUrl, { crossOrigin: 'anonymous' }).then(img => {
        if (img) {
          img.set({
            scaleX: 320 / img.width,
            scaleY: 180 / img.height
          })
          group.remove(rect)
          group.addWithUpdate(img)
          group.sendToBack(img)
          this.canvas.renderAll()
        }
      })

      group.on('mousedblclick', () => {
        window.open(url, '_blank')
      })
    },

    // --- Lock ---

    toggleLockSelected() {
      const obj = this.canvas.getActiveObject()
      if (!obj) return

      const locked = !obj.lockMovementX
      obj.set({
        lockMovementX: locked,
        lockMovementY: locked,
        lockRotation: locked,
        lockScalingX: locked,
        lockScalingY: locked,
        hasControls: !locked,
        selectable: true,
        opacity: locked ? 0.85 : 1
      })
      this.canvas.renderAll()
      this.emitChange()
    },

    // --- Stickers ---

    addSticker() {
      const stickers = [
        '\u{1F44D}',
        '\u{1F44E}',
        '\u{2705}',
        '\u{274C}',
        '\u{2757}',
        '\u{2753}',
        '\u{1F525}',
        '\u{2B50}',
        '\u{1F3AF}',
        '\u{1F4A1}',
        '\u{1F6A7}',
        '\u{1F4AC}',
        '\u{1F4CB}',
        '\u{1F3A8}',
        '\u{1F3AC}',
        '\u{1F4F7}'
      ]
      const emoji = stickers[Math.floor(Math.random() * stickers.length)]
      const center = this.canvas.getCenter()

      const text = new fabric.Text(emoji, {
        left: center.left - 20 + (Math.random() - 0.5) * 100,
        top: center.top - 20 + (Math.random() - 0.5) * 100,
        fontSize: 48,
        id: uuidv4(),
        isSticker: true
      })
      this.canvas.add(text)
      this.canvas.setActiveObject(text)
      this.canvas.renderAll()
      this.emitChange()
    },

    // --- Serialization ---

    getCanvasData() {
      return this.canvas.toJSON([
        'id',
        'entityId',
        'entityType',
        'linkUrl',
        'isConnector',
        'isYouTube',
        'isSticker',
        'lockMovementX',
        'lockMovementY',
        'lockRotation',
        'lockScalingX',
        'lockScalingY'
      ])
    },

    loadCanvasData(data) {
      if (!data) return
      this.isSaving = true
      const canvasData = typeof data === 'string' ? JSON.parse(data) : data

      // Clear canvas first
      this.canvas.clear()
      if (canvasData.background) {
        this.canvas.backgroundColor = canvasData.background
      }

      // Manually enliven and add objects
      const objects = canvasData.objects || []
      if (!objects.length) {
        this.isSaving = false
        this.pushUndoState()
        return
      }

      fabric.util
        .enlivenObjects(objects)
        .then(enlivenedObjects => {
          enlivenedObjects.forEach(obj => {
            this.canvas.add(obj)
          })
          this.canvas.renderAll()
          this.isSaving = false
          this.undoStack = [JSON.stringify(canvasData)]
          this.redoStack = []
        })
        .catch(err => {
          console.error('[Board] Failed to load canvas objects:', err)
          this.isSaving = false
        })
    },

    emitChange() {
      this.$emit('canvas-changed', {
        data: this.getCanvasData(),
        thumbnail: this.getThumbnail()
      })
    },

    exportAsPNG() {
      const dataUrl = this.canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      })
      // Convert data URL to blob for proper .png download
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `board-${Date.now()}.png`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        })
    },

    getThumbnail() {
      return this.canvas.toDataURL({
        format: 'png',
        quality: 0.5,
        multiplier: 0.3
      })
    }
  }
}
</script>

<style scoped>
.board-canvas-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  flex: 1;
  position: relative;
}

.board-toolbar {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--background-alt, #fafafa);
  border-bottom: 1px solid var(--border, #eee);
  gap: 2px;
  flex-shrink: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
  z-index: 10;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.tool-separator {
  width: 1px;
  height: 24px;
  background: var(--border, #ddd);
  margin: 0 4px;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--text, #333);
  cursor: pointer;
  transition: all 0.15s;
}

.tool-btn:hover {
  background: var(--background-hover, #eee);
}

.tool-btn.active {
  background: var(--background-selected, #dbeafe);
  border-color: var(--border-active, #3b82f6);
  color: var(--text-active, #1d4ed8);
}

.color-picker {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  cursor: pointer;
  padding: 1px;
}

.stroke-width-select {
  height: 28px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  background: var(--background, #fff);
  color: var(--text, #333);
  font-size: 12px;
  padding: 0 4px;
}

.zoom-controls {
  gap: 4px;
}

.zoom-level {
  font-size: 12px;
  color: var(--text-secondary, #666);
  min-width: 40px;
  text-align: center;
}

.canvas-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.hidden-file-input {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.hidden-file-input input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}
</style>
