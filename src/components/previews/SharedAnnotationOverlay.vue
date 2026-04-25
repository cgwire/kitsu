<template>
  <div class="annotation-overlay" ref="wrapper" :style="overlayStyle">
    <canvas :id="canvasId" />
  </div>
</template>

<script setup>
import { computed, markRaw, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { fabric } from 'fabric'
import { PSStroke } from 'fabricjs-psbrush'

// Mirror the monkey patches applied by annotation.js so PSStrokes
// deserialised here render correctly even when the main player code
// has not been loaded yet.
if (PSStroke) {
  if (!PSStroke.prototype.getAncestors) {
    PSStroke.prototype.getAncestors = function () {
      return []
    }
  }
  if (!PSStroke.prototype.contextTop) {
    PSStroke.prototype.contextTop = function () {
      return null
    }
  }
  if (!PSStroke.prototype.dispose) {
    PSStroke.prototype.dispose = function () {}
  }
  if (!PSStroke.prototype.getRelativeCenterPoint) {
    PSStroke.prototype.getRelativeCenterPoint = function () {
      return new fabric.Point(0, 0)
    }
  }
}

const props = defineProps({
  annotations: { type: Array, default: () => [] },
  currentFrame: { type: Number, default: 0 },
  frameDuration: { type: Number, default: 1 / 25 },
  isPicture: { type: Boolean, default: false },
  isPlaying: { type: Boolean, default: false },
  movieDimensions: {
    type: Object,
    default: () => ({ width: 0, height: 0 })
  }
})

const canvasId = `shared-annotation-canvas-${Math.random()
  .toString(36)
  .slice(2, 9)}`

const wrapper = ref(null)
const containerSize = ref({ width: 0, height: 0 })

let fabricCanvas = null
let resizeObserver = null

const videoBounds = computed(() => {
  const cw = containerSize.value.width
  const ch = containerSize.value.height
  const mw = props.movieDimensions?.width || 0
  const mh = props.movieDimensions?.height || 0
  if (!cw || !ch) return { width: 0, height: 0, left: 0, top: 0 }
  if (!mw || !mh) {
    return { width: cw, height: ch, left: 0, top: 0 }
  }
  const containerRatio = cw / ch
  const movieRatio = mw / mh
  let displayedW
  let displayedH
  if (movieRatio > containerRatio) {
    displayedW = cw
    displayedH = cw / movieRatio
  } else {
    displayedH = ch
    displayedW = ch * movieRatio
  }
  return {
    width: displayedW,
    height: displayedH,
    left: (cw - displayedW) / 2,
    top: (ch - displayedH) / 2
  }
})

const overlayStyle = computed(() => {
  const bounds = videoBounds.value
  if (!bounds.width || !bounds.height) {
    return { display: 'none' }
  }
  return {
    height: `${bounds.height}px`,
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`
  }
})

const currentTime = computed(() => {
  if (props.isPicture) return 0
  return Math.round(props.currentFrame * props.frameDuration * 10000) / 10000
})

const findAnnotation = () => {
  if (!props.annotations?.length) return null
  if (props.isPicture) {
    return props.annotations.find(a => a.time === 0) || null
  }
  const t = currentTime.value
  const halfFrame = props.frameDuration / 2
  return (
    props.annotations.find(a => Math.abs((a.time || 0) - t) < halfFrame) || null
  )
}

const deserializePSStroke = obj =>
  new Promise(resolve => {
    PSStroke.fromObject(obj, stroke => resolve(stroke || null))
  })

const buildShape = async (obj, scaleX, scaleY) => {
  if (!obj || !obj.type) return null
  const base = {
    angle: obj.angle || 0,
    evented: false,
    fill: obj.fill || 'transparent',
    height: obj.height,
    hoverCursor: 'default',
    left: (obj.left || 0) * scaleX,
    radius: obj.radius,
    scaleX: (obj.scaleX || 1) * scaleX,
    scaleY: (obj.scaleY || 1) * scaleY,
    selectable: false,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth || 1,
    top: (obj.top || 0) * scaleY,
    width: obj.width
  }

  switch (obj.type) {
    case 'path':
      return new fabric.Path(obj.path, base)
    case 'PSStroke': {
      const stroke = await deserializePSStroke(obj)
      if (!stroke) return null
      stroke.set({
        angle: base.angle,
        evented: false,
        fill: base.fill,
        hoverCursor: 'default',
        left: base.left,
        scaleX: base.scaleX,
        scaleY: base.scaleY,
        selectable: false,
        stroke: base.stroke,
        strokeWidth: base.strokeWidth,
        top: base.top
      })
      return stroke
    }
    case 'i-text':
    case 'text':
    case 'textbox':
      return new fabric.Text(obj.text || '', {
        ...base,
        fontFamily: obj.fontFamily || 'Arial',
        fontSize: obj.fontSize || 16,
        fontWeight: obj.fontWeight,
        textAlign: obj.textAlign
      })
    case 'circle':
      return new fabric.Circle(base)
    case 'rect':
      return new fabric.Rect(base)
    case 'ellipse':
      return new fabric.Ellipse({ ...base, rx: obj.rx, ry: obj.ry })
    case 'line':
      return new fabric.Line(
        [obj.x1 || 0, obj.y1 || 0, obj.x2 || 0, obj.y2 || 0],
        base
      )
    case 'group': {
      if (!Array.isArray(obj.objects)) return null
      const children = (
        await Promise.all(obj.objects.map(child => buildShape(child, 1, 1)))
      ).filter(Boolean)
      return new fabric.Group(children, base)
    }
    default:
      return null
  }
}

let renderToken = 0

const render = async () => {
  if (!fabricCanvas) return
  const token = ++renderToken
  fabricCanvas.clear()
  if (props.isPlaying) return
  const annotation = findAnnotation()
  if (!annotation) return
  const objects = annotation.drawing?.objects || []
  const scaleX = annotation.width ? fabricCanvas.width / annotation.width : 1
  const scaleY = annotation.height
    ? fabricCanvas.height / annotation.height
    : scaleX
  const shapes = await Promise.all(
    objects.map(obj => buildShape(obj, scaleX, scaleY))
  )
  if (token !== renderToken || !fabricCanvas) return
  shapes.forEach(shape => {
    if (shape) fabricCanvas.add(shape)
  })
  fabricCanvas.requestRenderAll()
}

const measureContainer = () => {
  const parent = wrapper.value?.parentElement
  if (!parent) return
  const rect = parent.getBoundingClientRect()
  containerSize.value = { width: rect.width, height: rect.height }
}

const fitCanvasToBounds = () => {
  if (!fabricCanvas) return
  const bounds = videoBounds.value
  if (bounds.width <= 0 || bounds.height <= 0) return
  fabricCanvas.setDimensions({
    width: bounds.width,
    height: bounds.height
  })
  render()
}

onMounted(() => {
  fabricCanvas = markRaw(
    new fabric.StaticCanvas(canvasId, {
      selection: false,
      skipTargetFind: true
    })
  )
  measureContainer()
  fitCanvasToBounds()
  const target = wrapper.value?.parentElement
  if (typeof ResizeObserver !== 'undefined' && target) {
    resizeObserver = new ResizeObserver(() => {
      measureContainer()
      fitCanvasToBounds()
    })
    resizeObserver.observe(target)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  fabricCanvas?.dispose()
  fabricCanvas = null
})

watch(() => props.annotations, render, { deep: true })
watch(() => props.currentFrame, render)
watch(() => props.frameDuration, render)
watch(() => props.isPicture, render)
watch(() => props.isPlaying, render)
watch(() => props.movieDimensions, fitCanvasToBounds, { deep: true })
</script>

<style lang="scss" scoped>
.annotation-overlay {
  pointer-events: none;
  position: absolute;
  z-index: 5;

  canvas {
    display: block;
    height: 100%;
    width: 100%;
  }
}
</style>
