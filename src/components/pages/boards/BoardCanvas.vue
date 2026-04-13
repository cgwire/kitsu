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
          :class="{ active: activeTool === 'triangle' }"
          @click="setTool('triangle')"
          title="Triangle"
        >
          <triangle-icon :size="18" />
        </button>
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'diamond' }"
          @click="setTool('diamond')"
          title="Diamond"
        >
          <diamond-icon :size="18" />
        </button>
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'star' }"
          @click="setTool('star')"
          title="Star"
        >
          <star-icon :size="18" />
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
        <div class="sticker-picker-wrapper">
          <button
            class="tool-btn"
            @click="showStickyColors = !showStickyColors"
            title="Sticky Note (N)"
          >
            <sticky-note-icon :size="18" />
          </button>
          <div class="sticky-color-picker" v-if="showStickyColors">
            <button
              class="sticky-color-btn"
              :key="c"
              :style="{ background: c }"
              @click="addStickyNote(c)"
              v-for="c in stickyColors"
            />
          </div>
        </div>
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
        <button
          class="tool-btn swap-btn"
          @click="swapColors"
          title="Swap Stroke/Fill (X)"
        >
          <rotate-cw-icon :size="14" />
        </button>
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
        <select class="stroke-width-select" v-model="fontFamily" title="Font">
          <option value="Inter, Arial, sans-serif">Inter</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Courier New, monospace">Courier</option>
          <option value="Comic Sans MS, cursive">Comic Sans</option>
          <option value="Times New Roman, serif">Times</option>
          <option value="Verdana, sans-serif">Verdana</option>
        </select>
        <button
          class="tool-btn text-format-btn"
          :class="{ active: isSelectionBold }"
          @click="toggleBold"
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          class="tool-btn text-format-btn"
          :class="{ active: isSelectionItalic }"
          @click="toggleItalic"
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          class="tool-btn text-format-btn"
          :class="{ active: isSelectionUnderline }"
          @click="toggleUnderline"
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <select
          class="stroke-width-select"
          v-model="textAlign"
          title="Align"
          @change="applyTextAlign"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div class="tool-separator" />

      <div class="tool-group">
        <!-- Connector hidden until dynamic wiring is implemented
        <button
          class="tool-btn"
          :class="{ active: activeTool === 'connector' }"
          @click="setTool('connector')"
          title="Connector (K)"
        >
          <git-branch-icon :size="18" />
        </button>
        -->
        <button class="tool-btn" @click="addYouTubeEmbed" title="YouTube Embed">
          <youtube-icon :size="18" />
        </button>
        <div class="sticker-picker-wrapper">
          <button
            class="tool-btn"
            @click="showStickerPicker = !showStickerPicker"
            title="Sticker (S)"
          >
            <smile-icon :size="18" />
          </button>
          <div class="sticker-picker" v-if="showStickerPicker">
            <button
              class="sticker-btn"
              :key="s"
              @click="placeSticker(s)"
              v-for="s in stickerList"
            >
              {{ s }}
            </button>
          </div>
        </div>
      </div>

      <div class="tool-separator" />

      <div class="tool-group">
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

      <div class="tool-separator" />

      <div class="tool-group bg-color-group">
        <span class="bg-label">BG</span>
        <input
          type="color"
          class="color-picker"
          v-model="bgColor"
          title="Board Background"
          @input="onBgColorChange"
        />
      </div>
    </div>

    <div
      class="canvas-container"
      ref="canvasContainer"
      @dragover.prevent
      @drop.prevent="onDrop"
      @contextmenu.prevent="onContextMenu"
    >
      <canvas ref="boardCanvas" />
    </div>

    <div
      class="context-menu"
      ref="contextMenu"
      v-if="contextMenu.visible"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <button
        class="ctx-item"
        @click="ctxGroup"
        v-if="contextMenu.hasSelection"
      >
        Group (Ctrl+G)
      </button>
      <button class="ctx-item" @click="ctxUngroup" v-if="contextMenu.isGroup">
        Ungroup (Ctrl+Shift+G)
      </button>
      <button class="ctx-item" @click="ctxLock" v-if="contextMenu.hasTarget">
        {{ contextMenu.isLocked ? 'Unlock' : 'Lock' }}
      </button>
      <button
        class="ctx-item"
        @click="ctxDuplicate"
        v-if="contextMenu.hasTarget"
      >
        Duplicate
      </button>
      <button
        class="ctx-item"
        @click="ctxBringFront"
        v-if="contextMenu.hasTarget"
      >
        Bring to Front
      </button>
      <button
        class="ctx-item"
        @click="ctxSendBack"
        v-if="contextMenu.hasTarget"
      >
        Send to Back
      </button>
      <div class="ctx-separator" v-if="contextMenu.hasTarget" />
      <button
        class="ctx-item ctx-danger"
        @click="ctxDelete"
        v-if="contextMenu.hasTarget"
      >
        Delete
      </button>
    </div>

    <div class="shortcuts-panel" :class="{ collapsed: !showShortcuts }">
      <button class="shortcuts-arrow" @click="showShortcuts = !showShortcuts">
        <span class="arrow-icon">{{
          showShortcuts ? '&#9660;' : '&#9650;'
        }}</span>
        <span class="arrow-label">Shortcuts</span>
      </button>
      <div class="shortcuts-grid" v-if="showShortcuts">
        <span class="sc-key">V</span><span class="sc-label">Select</span>
        <span class="sc-key">Space</span
        ><span class="sc-label">Pan (hold)</span> <span class="sc-key">D</span
        ><span class="sc-label">Draw</span> <span class="sc-key">L</span
        ><span class="sc-label">Line</span> <span class="sc-key">A</span
        ><span class="sc-label">Arrow</span> <span class="sc-key">R</span
        ><span class="sc-label">Rectangle</span> <span class="sc-key">C</span
        ><span class="sc-label">Circle</span> <span class="sc-key">T</span
        ><span class="sc-label">Text</span> <span class="sc-key">I</span
        ><span class="sc-label">Image</span> <span class="sc-key">N</span
        ><span class="sc-label">Sticky Note</span> <span class="sc-key">S</span
        ><span class="sc-label">Sticker</span> <span class="sc-key">X</span
        ><span class="sc-label">Swap Colors</span>
        <span class="sc-key">Del</span><span class="sc-label">Delete</span>
        <span class="sc-key">Shift</span><span class="sc-label">Constrain</span>
        <span class="sc-key">Ctrl Z</span><span class="sc-label">Undo</span>
        <span class="sc-key">Ctrl Y</span><span class="sc-label">Redo</span>
        <span class="sc-key">Ctrl G</span><span class="sc-label">Group</span>
        <span class="sc-key">Ctrl L</span><span class="sc-label">Lock</span>
        <span class="sc-key">Ctrl 0</span><span class="sc-label">Zoom Fit</span>
        <span class="sc-key">Scroll</span><span class="sc-label">Zoom</span>
      </div>
    </div>

    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      class="hidden-file-input"
      @change="onFileSelected"
      multiple
    />
  </div>
</template>

<script>
import { fabric } from 'fabric'
import { v4 as uuidv4 } from 'uuid'
import { markRaw } from 'vue'

import {
  ArrowUpRightIcon,
  CircleIcon,
  DiamondIcon,
  Edit2Icon,
  GridIcon,
  ImageIcon,
  LinkIcon,
  MaximizeIcon,
  MinusIcon,
  MousePointerIcon,
  HandIcon,
  Redo2Icon,
  RotateCwIcon,
  SmileIcon,
  SquareIcon,
  StarIcon,
  StickyNoteIcon,
  Trash2Icon,
  TriangleIcon,
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
    DiamondIcon,
    Edit2Icon,
    GridIcon,
    ImageIcon,
    LinkIcon,
    MaximizeIcon,
    MinusIcon,
    MousePointerIcon,
    HandIcon,
    Redo2Icon,
    RotateCwIcon,
    SmileIcon,
    SquareIcon,
    StarIcon,
    StickyNoteIcon,
    Trash2Icon,
    TriangleIcon,
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
      bgColor: '#ffffff',
      fontFamily: 'Inter, Arial, sans-serif',
      textAlign: 'left',
      isSelectionBold: false,
      isSelectionItalic: false,
      isSelectionUnderline: false,
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
      showShortcuts: false,
      showStickerPicker: false,
      showStickyColors: false,
      stickyColors: [
        '#fff9c4',
        '#f8bbd0',
        '#c8e6c9',
        '#bbdefb',
        '#d1c4e9',
        '#ffe0b2',
        '#b2dfdb',
        '#f0f4c3',
        '#ffccbc',
        '#e1bee7',
        '#b3e5fc',
        '#dcedc8'
      ],
      toolBeforeSpace: 'select',
      stickerList: [
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
        '\u{1F4F7}',
        '\u{1F4CC}',
        '\u{1F4CE}',
        '\u{270F}\u{FE0F}',
        '\u{1F50D}',
        '\u{1F512}',
        '\u{1F513}',
        '\u{1F4A5}',
        '\u{1F389}',
        '\u{1F680}',
        '\u{23F0}',
        '\u{26A0}\u{FE0F}',
        '\u{1F6D1}',
        '\u{1F7E2}',
        '\u{1F7E1}',
        '\u{1F534}',
        '\u{1F535}',
        '\u{2764}\u{FE0F}',
        '\u{1F499}',
        '\u{1F49A}',
        '\u{1F4AF}'
      ],
      snapToGrid: false,
      gridSize: 20,
      connectorStart: null,
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        hasTarget: false,
        hasSelection: false,
        isGroup: false,
        isLocked: false
      }
    }
  },

  computed: {
    zoomPercent() {
      return Math.round(this.zoomLevel * 100)
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
    },
    fontFamily(val) {
      const obj = this.canvas?.getActiveObject()
      if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
        obj.set('fontFamily', val)
        this.canvas.renderAll()
        this.emitChange()
      }
    },
    fontSize(val) {
      const obj = this.canvas?.getActiveObject()
      if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
        obj.set('fontSize', val)
        this.canvas.renderAll()
        this.emitChange()
      }
    },
    strokeColor(val) {
      if (this.canvas?.isDrawingMode && this.canvas.freeDrawingBrush) {
        this.canvas.freeDrawingBrush.color = val
      }
      const obj = this.canvas?.getActiveObject()
      if (obj && obj.type !== 'i-text' && obj.type !== 'text') {
        obj.set('stroke', val)
        this.canvas.renderAll()
        this.emitChange()
      }
    },
    fillColor(val) {
      const obj = this.canvas?.getActiveObject()
      if (obj && obj.type !== 'i-text' && obj.type !== 'text') {
        obj.set('fill', val)
        this.canvas.renderAll()
        this.emitChange()
      }
    },
    strokeWidth(val) {
      const obj = this.canvas?.getActiveObject()
      if (obj && obj.type !== 'i-text' && obj.type !== 'text') {
        obj.set('strokeWidth', val)
        this.canvas.renderAll()
        this.emitChange()
      }
    },
    snapToGrid(enabled) {
      const container = this.$refs.canvasContainer
      if (!container || !this.canvas) return
      if (enabled) {
        const size = this.gridSize
        container.style.backgroundImage = `radial-gradient(circle, #ccc 1px, transparent 1px)`
        container.style.backgroundSize = `${size}px ${size}px`
        container.style.backgroundColor = this.bgColor
        // Make fabric canvas transparent so CSS dots show through
        this.canvas.backgroundColor = 'transparent'
        this.canvas.renderAll()
      } else {
        container.style.backgroundImage = ''
        container.style.backgroundSize = ''
        container.style.backgroundColor = ''
        this.canvas.backgroundColor = this.bgColor
        this.canvas.renderAll()
      }
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

  methods: {
    initCanvas() {
      const container = this.$refs.canvasContainer
      const width = container.clientWidth
      const height = container.clientHeight

      this.canvas = markRaw(
        new fabric.Canvas(this.$refs.boardCanvas, {
          width,
          height,
          backgroundColor: this.bgColor,
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
        this.updateConnectors()
      })

      // Update text format buttons when selecting objects
      this.canvas.on('selection:created', () => this.updateTextFormatState())
      this.canvas.on('selection:updated', () => this.updateTextFormatState())

      this.canvas.on('mouse:down', this.onMouseDown)
      this.canvas.on('mouse:move', this.onMouseMove)
      this.canvas.on('mouse:up', this.onMouseUp)
      this.canvas.on('mouse:wheel', this.onMouseWheel)

      // Double-click on shape = add centered editable text
      // Double-click on sticky note group = edit text inside
      this.canvas.on('mouse:dblclick', opt => {
        const target = opt.target
        if (!target || target.isEditing) return

        // Sticky note group — enter text editing
        if (target.type === 'group' && target.isSticky) {
          const items = target._objects || []
          const origText = items.find(
            o => o.type === 'i-text' || o.type === 'textbox'
          )
          if (!origText) return

          const bound = target.getBoundingRect()

          // Create temporary editable overlay
          const tmpText = new fabric.Textbox(origText.text, {
            left: bound.left + 12,
            top: bound.top + 12,
            fontSize: origText.fontSize,
            fill: origText.fill,
            fontFamily: origText.fontFamily,
            width: bound.width - 24,
            splitByGrapheme: true
          })

          // Hide group while editing
          target.set('opacity', 0.3)
          this.canvas.add(tmpText)
          this.canvas.setActiveObject(tmpText)
          tmpText.enterEditing()
          if (tmpText.text === 'Note...') tmpText.selectAll()

          const finish = () => {
            tmpText.off('editing:exited', finish)
            // Copy text back into group and restore
            origText.set('text', tmpText.text)
            target.set('opacity', 1)
            this.canvas.remove(tmpText)
            this.canvas.renderAll()
            this.emitChange()
          }
          tmpText.on('editing:exited', finish)
          return
        }

        // Regular shape — add centered text (any non-text, non-group shape)
        if (
          ['i-text', 'text', 'textbox', 'group', 'image'].includes(target.type)
        )
          return
        {
          const bound = target.getBoundingRect()
          const itext = new fabric.IText('', {
            left: bound.left + bound.width / 2,
            top: bound.top + bound.height / 2,
            fontSize: this.fontSize,
            fill: this.strokeColor,
            fontFamily: this.fontFamily,
            originX: 'center',
            originY: 'center',
            textAlign: 'center',
            id: uuidv4()
          })
          this.canvas.add(itext)
          this.canvas.setActiveObject(itext)
          itext.enterEditing()
          this.emitChange()
        }
      })

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

    swapColors() {
      const tmp = this.strokeColor
      this.strokeColor = this.fillColor
      this.fillColor = tmp

      // Apply to selected object
      const obj = this.canvas?.getActiveObject()
      if (obj) {
        if (obj.type === 'i-text' || obj.type === 'text') {
          obj.set('fill', this.strokeColor)
        } else {
          obj.set({ stroke: this.strokeColor, fill: this.fillColor })
        }
        this.canvas.renderAll()
        this.emitChange()
      }
    },

    updateTextFormatState() {
      const obj = this.canvas?.getActiveObject()
      if (obj && (obj.type === 'textbox' || obj.type === 'i-text')) {
        this.isSelectionBold = obj.fontWeight === 'bold'
        this.isSelectionItalic = obj.fontStyle === 'italic'
        this.isSelectionUnderline = !!obj.underline
        this.textAlign = obj.textAlign || 'left'
      }
    },

    toggleBold() {
      const obj = this.canvas?.getActiveObject()
      if (!obj || (obj.type !== 'textbox' && obj.type !== 'i-text')) return
      const isBold = obj.fontWeight === 'bold'
      obj.set('fontWeight', isBold ? 'normal' : 'bold')
      this.isSelectionBold = !isBold
      this.canvas.renderAll()
      this.emitChange()
    },

    toggleItalic() {
      const obj = this.canvas?.getActiveObject()
      if (!obj || (obj.type !== 'textbox' && obj.type !== 'i-text')) return
      const isItalic = obj.fontStyle === 'italic'
      obj.set('fontStyle', isItalic ? 'normal' : 'italic')
      this.isSelectionItalic = !isItalic
      this.canvas.renderAll()
      this.emitChange()
    },

    toggleUnderline() {
      const obj = this.canvas?.getActiveObject()
      if (!obj || (obj.type !== 'textbox' && obj.type !== 'i-text')) return
      const isUnder = obj.underline
      obj.set('underline', !isUnder)
      this.isSelectionUnderline = !isUnder
      this.canvas.renderAll()
      this.emitChange()
    },

    applyTextAlign() {
      const obj = this.canvas?.getActiveObject()
      if (!obj || (obj.type !== 'textbox' && obj.type !== 'i-text')) return
      obj.set('textAlign', this.textAlign)
      this.canvas.renderAll()
      this.emitChange()
    },

    snapPoint(p) {
      if (!this.snapToGrid) return p
      return {
        x: Math.round(p.x / this.gridSize) * this.gridSize,
        y: Math.round(p.y / this.gridSize) * this.gridSize
      }
    },

    onBgColorChange() {
      this.canvas.backgroundColor = this.bgColor
      this.canvas.renderAll()
      this.emitChange()
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
      // Reset connector state when switching tools
      if (tool !== 'connector') {
        this.connectorStart = null
      }
      this.showStickerPicker = false
      this.showStickyColors = false

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
        const text = new fabric.Textbox('', {
          left: pointer.x,
          top: pointer.y,
          width: 200,
          fontSize: this.fontSize,
          fill: this.strokeColor,
          fontFamily: this.fontFamily,
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
          // First click — store start
          this.connectorStart = {
            x: pointer.x,
            y: pointer.y,
            target: opt.target || null
          }
          this.canvas.defaultCursor = 'crosshair'
        } else {
          // Second click — draw and reset
          this.drawConnector(
            this.connectorStart.target,
            opt.target || null,
            this.connectorStart.x,
            this.connectorStart.y,
            pointer.x,
            pointer.y
          )
          this.connectorStart = null
          // Stay in connector mode but ready for next pair
          this.emitChange()
        }
        return
      }

      if (['diamond', 'star'].includes(this.activeTool) && !opt.target) {
        const p = this.snapPoint(pointer)
        const size = 60
        if (this.activeTool === 'diamond') {
          const diamond = new fabric.Polygon(
            [
              { x: p.x, y: p.y - size },
              { x: p.x + size, y: p.y },
              { x: p.x, y: p.y + size },
              { x: p.x - size, y: p.y }
            ],
            {
              fill:
                this.fillColor === '#ffffff'
                  ? 'rgba(255,255,255,0.01)'
                  : this.fillColor,
              stroke: this.strokeColor,
              strokeWidth: this.strokeWidth,
              strokeUniform: true,
              id: uuidv4()
            }
          )
          this.canvas.add(diamond)
          this.canvas.setActiveObject(diamond)
        } else {
          const points = []
          for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? size : size / 2.2
            const angle = (Math.PI / 5) * i - Math.PI / 2
            points.push({
              x: p.x + r * Math.cos(angle),
              y: p.y + r * Math.sin(angle)
            })
          }
          const star = new fabric.Polygon(points, {
            fill:
              this.fillColor === '#ffffff'
                ? 'rgba(255,255,255,0.01)'
                : this.fillColor,
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth,
            strokeUniform: true,
            id: uuidv4()
          })
          this.canvas.add(star)
          this.canvas.setActiveObject(star)
        }
        this.canvas.renderAll()
        this.setTool('select')
        this.emitChange()
        return
      }

      if (
        ['rect', 'circle', 'triangle', 'line', 'arrow'].includes(
          this.activeTool
        ) &&
        !opt.target
      ) {
        this.isDrawingShape = true
        this.shapeStartPoint = this.snapPoint(pointer)

        if (this.activeTool === 'rect') {
          this.currentShape = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill:
              this.fillColor === '#ffffff'
                ? 'rgba(255,255,255,0.01)'
                : this.fillColor,
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth,
            strokeUniform: true,
            id: uuidv4()
          })
        } else if (this.activeTool === 'circle') {
          this.currentShape = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            fill:
              this.fillColor === '#ffffff'
                ? 'rgba(255,255,255,0.01)'
                : this.fillColor,
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth,
            strokeUniform: true,
            id: uuidv4()
          })
        } else if (this.activeTool === 'triangle') {
          this.currentShape = new fabric.Triangle({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill:
              this.fillColor === '#ffffff'
                ? 'rgba(255,255,255,0.01)'
                : this.fillColor,
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth,
            strokeUniform: true,
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
        const pointer = this.snapPoint(this.canvas.getPointer(e))

        if (this.activeTool === 'rect') {
          let width = Math.abs(pointer.x - this.shapeStartPoint.x)
          let height = Math.abs(pointer.y - this.shapeStartPoint.y)
          if (e.shiftKey) {
            const size = Math.max(width, height)
            width = size
            height = size
          }
          const left =
            pointer.x < this.shapeStartPoint.x
              ? this.shapeStartPoint.x - width
              : this.shapeStartPoint.x
          const top =
            pointer.y < this.shapeStartPoint.y
              ? this.shapeStartPoint.y - height
              : this.shapeStartPoint.y
          this.currentShape.set({ left, top, width, height })
        } else if (this.activeTool === 'circle') {
          let rx = Math.abs(pointer.x - this.shapeStartPoint.x) / 2
          let ry = Math.abs(pointer.y - this.shapeStartPoint.y) / 2
          if (e.shiftKey) {
            const r = Math.max(rx, ry)
            rx = r
            ry = r
          }
          const left = Math.min(pointer.x, this.shapeStartPoint.x)
          const top = Math.min(pointer.y, this.shapeStartPoint.y)
          this.currentShape.set({ left, top, rx, ry })
        } else if (this.activeTool === 'triangle') {
          const left = Math.min(pointer.x, this.shapeStartPoint.x)
          const top = Math.min(pointer.y, this.shapeStartPoint.y)
          let width = Math.abs(pointer.x - this.shapeStartPoint.x)
          let height = Math.abs(pointer.y - this.shapeStartPoint.y)
          if (e.shiftKey) {
            const size = Math.max(width, height)
            width = size
            height = size
          }
          this.currentShape.set({ left, top, width, height })
        } else if (this.activeTool === 'line' || this.activeTool === 'arrow') {
          let x2 = pointer.x
          let y2 = pointer.y
          if (e.shiftKey) {
            // Snap to 45-degree angles
            const dx = x2 - this.shapeStartPoint.x
            const dy = y2 - this.shapeStartPoint.y
            const angle =
              Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4)
            const dist = Math.sqrt(dx * dx + dy * dy)
            x2 = this.shapeStartPoint.x + Math.cos(angle) * dist
            y2 = this.shapeStartPoint.y + Math.sin(angle) * dist
          }
          this.currentShape.set({ x2, y2 })
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
      const center = this.canvas.getCenter()
      this.loadImageFileAt(file, center.left + offsetX, center.top)
    },

    loadImageFileAt(file, x, y) {
      const reader = new FileReader()
      reader.onload = event => {
        fabric.Image.fromURL(event.target.result).then(img => {
          const maxDim = 400
          const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
          img.set({
            left: x,
            top: y,
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
      const canvasEl = this.$refs.canvasContainer
      const rect = canvasEl.getBoundingClientRect()
      const vpt = this.canvas.viewportTransform
      const zoom = this.canvas.getZoom()
      const dropX = (e.clientX - rect.left - vpt[4]) / zoom
      const dropY = (e.clientY - rect.top - vpt[5]) / zoom

      const files = e.dataTransfer.files
      if (files.length) {
        Array.from(files).forEach((file, idx) => {
          if (file.type.startsWith('image/')) {
            this.loadImageFileAt(file, dropX + idx * 220, dropY)
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
      // Convert drop coordinates to canvas coordinates
      const canvasEl = this.$refs.canvasContainer
      const rect = canvasEl.getBoundingClientRect()
      const vpt = this.canvas.viewportTransform
      const zoom = this.canvas.getZoom()
      const pointer = {
        x: (dropEvent.clientX - rect.left - vpt[4]) / zoom,
        y: (dropEvent.clientY - rect.top - vpt[5]) / zoom
      }
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

    addStickyNote(chosenColor) {
      this.showStickyColors = false
      const color = chosenColor || '#fff9c4'
      const vpt = this.canvas.viewportTransform
      const zoom = this.canvas.getZoom()
      const cx = (this.canvas.width / 2 - vpt[4]) / zoom
      const cy = (this.canvas.height / 2 - vpt[5]) / zoom

      const rect = new fabric.Rect({
        width: 220,
        height: 180,
        fill: color,
        rx: 4,
        ry: 4,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.15)',
          blur: 8,
          offsetX: 2,
          offsetY: 2
        })
      })

      const text = new fabric.Textbox('Note...', {
        left: 12,
        top: 12,
        fontSize: 15,
        fill: '#333',
        fontFamily: this.fontFamily,
        width: 196,
        splitByGrapheme: true
      })

      const group = new fabric.Group([rect, text], {
        left: cx - 110,
        top: cy - 90,
        id: uuidv4(),
        isSticky: true,
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
      if (!activeObj) return

      if (
        activeObj.type !== 'activeSelection' &&
        activeObj.type !== 'activeselection'
      ) {
        return
      }
      const objects = activeObj.getObjects()
      if (!objects.length) {
        return
      }

      // Remove objects from canvas
      objects.forEach(obj => this.canvas.remove(obj))
      this.canvas.discardActiveObject()

      // Create group
      const group = new fabric.Group(objects, { id: uuidv4() })
      this.canvas.add(group)
      this.canvas.setActiveObject(group)
      this.canvas.renderAll()
      this.emitChange()
    },

    ungroupSelected() {
      const activeObj = this.canvas.getActiveObject()
      if (!activeObj || activeObj.type !== 'group') return

      const items = activeObj._objects || []
      const left = activeObj.left
      const top = activeObj.top

      // Remove group, add individual items back
      this.canvas.remove(activeObj)
      items.forEach(obj => {
        obj.set({
          left: left + obj.left + activeObj.width / 2,
          top: top + obj.top + activeObj.height / 2
        })
        obj.setCoords()
        this.canvas.add(obj)
      })
      this.canvas.discardActiveObject()
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

    // --- Context Menu ---

    onContextMenu(e) {
      const target = this.canvas.findTarget(e)
      const active = this.canvas.getActiveObject()

      this.contextMenu = {
        visible: true,
        x: e.clientX,
        y: e.clientY,
        hasTarget: !!target || !!active,
        hasSelection: active?.type === 'activeSelection',
        isGroup: active?.type === 'group',
        isLocked: !!target?.lockMovementX
      }

      // Click anywhere closes menu
      const close = () => {
        this.contextMenu.visible = false
        window.removeEventListener('click', close)
      }
      setTimeout(() => window.addEventListener('click', close), 50)
    },

    ctxGroup() {
      this.contextMenu.visible = false
      this.groupSelected()
    },

    ctxUngroup() {
      this.contextMenu.visible = false
      this.ungroupSelected()
    },

    ctxLock() {
      this.contextMenu.visible = false
      this.toggleLockSelected()
    },

    ctxDuplicate() {
      this.contextMenu.visible = false
      const active = this.canvas.getActiveObject()
      if (!active) return
      active.clone().then(cloned => {
        cloned.set({
          left: active.left + 30,
          top: active.top + 30,
          id: uuidv4(),
          isSticky: active.isSticky || false,
          isYouTube: active.isYouTube || false,
          linkUrl: active.linkUrl || null
        })
        this.canvas.add(cloned)
        this.canvas.setActiveObject(cloned)
        this.canvas.renderAll()
        this.emitChange()
      })
    },

    ctxBringFront() {
      this.contextMenu.visible = false
      const active = this.canvas.getActiveObject()
      if (active) {
        this.canvas.bringObjectToFront(active)
        this.canvas.renderAll()
        this.emitChange()
      }
    },

    ctxSendBack() {
      this.contextMenu.visible = false
      const active = this.canvas.getActiveObject()
      if (active) {
        this.canvas.sendObjectToBack(active)
        this.canvas.renderAll()
        this.emitChange()
      }
    },

    ctxDelete() {
      this.contextMenu.visible = false
      this.deleteSelected()
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
        case 'x':
          if (!ctrl) this.swapColors()
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

    drawConnector(startObj, endObj, x1, y1, x2, y2) {
      // Get center points of connected objects
      const getCenter = obj => {
        if (!obj) return null
        const bound = obj.getBoundingRect()
        return {
          x: bound.left + bound.width / 2,
          y: bound.top + bound.height / 2
        }
      }

      const p1 = startObj ? getCenter(startObj) : { x: x1, y: y1 }
      const p2 = endObj ? getCenter(endObj) : { x: x2, y: y2 }

      const line = new fabric.Line([p1.x, p1.y, p2.x, p2.y], {
        stroke: this.strokeColor,
        strokeWidth: 2,
        strokeDashArray: [6, 4],
        selectable: true,
        evented: true,
        id: uuidv4(),
        isConnector: true,
        connectorStartId: startObj?.id || null,
        connectorEndId: endObj?.id || null
      })

      // Add dots at endpoints
      const dot1 = new fabric.Circle({
        left: p1.x - 5,
        top: p1.y - 5,
        radius: 5,
        fill: this.strokeColor,
        selectable: false,
        evented: false
      })
      const dot2 = new fabric.Circle({
        left: p2.x - 5,
        top: p2.y - 5,
        radius: 5,
        fill: this.strokeColor,
        selectable: false,
        evented: false
      })

      this.canvas.add(line)
      this.canvas.add(dot1)
      this.canvas.add(dot2)

      // Store reference for live updates
      line._connectorDots = { dot1, dot2 }
      line._connectorTargets = { start: startObj, end: endObj }

      // Send line to back so it's behind objects
      this.canvas.sendToBack(line)
      this.canvas.sendToBack(dot1)
      this.canvas.sendToBack(dot2)
      this.canvas.renderAll()
      this.emitChange()
    },

    updateConnectors() {
      const objects = this.canvas.getObjects()
      objects.forEach(obj => {
        if (!obj.isConnector || !obj._connectorTargets) return

        const { start, end } = obj._connectorTargets
        const getCenter = target => {
          if (!target) return null
          // Check target still exists on canvas
          if (!this.canvas.contains(target)) return null
          const bound = target.getBoundingRect()
          return {
            x: bound.left + bound.width / 2,
            y: bound.top + bound.height / 2
          }
        }

        const p1 = getCenter(start)
        const p2 = getCenter(end)

        if (p1) {
          obj.set({ x1: p1.x, y1: p1.y })
          if (obj._connectorDots?.dot1) {
            obj._connectorDots.dot1.set({
              left: p1.x - 5,
              top: p1.y - 5
            })
          }
        }
        if (p2) {
          obj.set({ x2: p2.x, y2: p2.y })
          if (obj._connectorDots?.dot2) {
            obj._connectorDots.dot2.set({
              left: p2.x - 5,
              top: p2.y - 5
            })
          }
        }
      })
      this.canvas.renderAll()
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

      // Load thumbnail via HTML Image to bypass CORS, convert to dataURL
      const htmlImg = new Image()
      htmlImg.crossOrigin = 'anonymous'
      htmlImg.onload = () => {
        // Draw to temp canvas to get dataURL
        const tmpCanvas = document.createElement('canvas')
        tmpCanvas.width = htmlImg.width
        tmpCanvas.height = htmlImg.height
        const ctx = tmpCanvas.getContext('2d')
        ctx.drawImage(htmlImg, 0, 0)

        // Dark overlay
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height)

        // Play button
        ctx.fillStyle = '#ff0000'
        ctx.beginPath()
        const cx = tmpCanvas.width / 2
        const cy = tmpCanvas.height / 2
        ctx.moveTo(cx - 25, cy - 30)
        ctx.lineTo(cx - 25, cy + 30)
        ctx.lineTo(cx + 30, cy)
        ctx.closePath()
        ctx.fill()

        // Label
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 14px Inter, Arial, sans-serif'
        ctx.fillText('YouTube: ' + videoId, 10, tmpCanvas.height - 10)

        const dataUrl = tmpCanvas.toDataURL('image/png')
        fabric.Image.fromURL(dataUrl).then(img => {
          const scale = Math.min(320 / img.width, 200 / img.height, 1)
          img.set({
            left: center.left - (img.width * scale) / 2,
            top: center.top - (img.height * scale) / 2,
            scaleX: scale,
            scaleY: scale,
            id: uuidv4(),
            linkUrl: url,
            isYouTube: true
          })
          this.canvas.add(img)
          this.canvas.setActiveObject(img)
          this.canvas.renderAll()
          this.emitChange()

          img.on('mousedblclick', () => {
            window.open(url, '_blank')
          })
        })
      }

      htmlImg.onerror = () => {
        // Fallback: create a placeholder card
        const rect = new fabric.Rect({
          width: 320,
          height: 200,
          fill: '#1a1a1a',
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
          fontSize: 12,
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

        group.on('mousedblclick', () => {
          window.open(url, '_blank')
        })
      }

      htmlImg.src = thumbUrl
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
        opacity: locked ? 0.7 : 1,
        borderColor: locked ? '#999' : '#2196f3',
        borderDashArray: locked ? [4, 4] : null
      })
      this.canvas.renderAll()
      this.emitChange()
    },

    // --- Stickers ---

    addSticker() {
      this.showStickerPicker = !this.showStickerPicker
    },

    placeSticker(emoji) {
      this.showStickerPicker = false
      const vpt = this.canvas.viewportTransform
      const zoom = this.canvas.getZoom()
      const cx = (this.canvas.width / 2 - vpt[4]) / zoom
      const cy = (this.canvas.height / 2 - vpt[5]) / zoom

      const text = new fabric.Text(emoji, {
        left: cx - 20,
        top: cy - 20,
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
        this.bgColor = canvasData.background
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
  height: 100vh;
  flex: 1;
  position: relative;
  overflow: hidden;
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
  background: #ffffff;
}

.sticker-picker-wrapper {
  position: relative;
}

.sticker-picker {
  position: fixed;
  top: auto;
  left: auto;
  background: var(--background, #fff);
  border: 1px solid var(--border, #ddd);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2px;
  z-index: 200;
  width: 240px;
}

.sticker-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 22px;
  cursor: pointer;
  transition: background 0.1s;
}

.sticker-btn:hover {
  background: var(--background-hover, #f0f0f0);
}

.context-menu {
  position: fixed;
  background: var(--background, #2a2a2a);
  border: 1px solid var(--border, #444);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 4px 0;
  z-index: 500;
  min-width: 180px;
}

.ctx-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--text, #eee);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.ctx-item:hover {
  background: var(--background-hover, #3a3a3a);
}

.ctx-danger {
  color: #e53e3e;
}

.ctx-danger:hover {
  background: #3a2020;
}

.ctx-separator {
  height: 1px;
  background: var(--border, #444);
  margin: 4px 0;
}

.shortcuts-panel {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px 12px;
  z-index: 300;
  color: #eee;
  font-size: 11px;
  min-width: 180px;
  transition: all 0.2s;
}

.shortcuts-panel.collapsed {
  padding: 4px 10px;
  min-width: auto;
}

.shortcuts-arrow {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 11px;
  padding: 2px 0;
  width: 100%;
}

.shortcuts-arrow:hover {
  color: #fff;
}

.arrow-icon {
  font-size: 8px;
}

.arrow-label {
  font-weight: 500;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 10px;
  margin-top: 8px;
}

.sc-key {
  background: rgba(255, 255, 255, 0.12);
  padding: 1px 5px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 10px;
  color: #ddd;
  text-align: center;
}

.sc-label {
  color: #999;
}

.text-format-btn {
  font-size: 13px;
  font-family: serif;
  width: 24px;
  height: 24px;
}

.bg-color-group {
  gap: 4px;
}

.bg-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary, #999);
  text-transform: uppercase;
}

.sticky-color-picker {
  position: fixed;
  top: auto;
  left: auto;
  background: var(--background, #fff);
  border: 1px solid var(--border, #ddd);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  z-index: 200;
}

.sticky-color-btn {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;
}

.sticky-color-btn:hover {
  transform: scale(1.2);
  border-color: rgba(0, 0, 0, 0.3);
}

.hidden-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
