<!--
  Example component showing how to use the new annotation tool system
-->
<template>
  <div class="annotation-example">
    <div class="toolbar">
      <button
        @click="onAnnotateClicked"
        :class="{ active: currentTool === 'drawing' }"
        class="tool-button"
      >
        ✏️ Draw
      </button>

      <button
        @click="onTypeClicked"
        :class="{ active: currentTool === 'text' }"
        class="tool-button"
      >
        📝 Text
      </button>

      <button
        @click="onDrawShapeClicked"
        :class="{ active: currentTool === 'shape' }"
        class="tool-button"
      >
        🔷 Shape
      </button>

      <button
        @click="onSelectClicked"
        :class="{ active: currentTool === 'selection' }"
        class="tool-button"
      >
        👆 Select
      </button>

      <button
        @click="onEraseClicked"
        :class="{ active: currentTool === 'eraser' }"
        class="tool-button"
      >
        🗑️ Erase
      </button>

      <div class="separator"></div>

      <button @click="undoLastAction" class="tool-button">↶ Undo</button>
      <button @click="redoLastAction" class="tool-button">↷ Redo</button>
      <button @click="clearCanvas" class="tool-button">🗑️ Clear All</button>

      <div class="separator"></div>

      <!-- Color pickers -->
      <div class="color-section">
        <label>Draw Color:</label>
        <input
          type="color"
          :value="pencilColor"
          @input="onChangePencilColor($event.target.value)"
        />
      </div>

      <div class="color-section">
        <label>Text Color:</label>
        <input
          type="color"
          :value="textColor"
          @input="onChangeTextColor($event.target.value)"
        />
      </div>

      <div class="color-section">
        <label>Shape Color:</label>
        <input
          type="color"
          :value="shapeColor"
          @input="onChangeShapeColor($event.target.value)"
        />
      </div>

      <!-- Width selector -->
      <div class="width-section">
        <label>Line Width:</label>
        <select
          :value="pencilWidth"
          @change="onChangePencilWidth($event.target.value)"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="big">Big</option>
        </select>
      </div>

      <!-- Shape selector -->
      <div class="shape-section">
        <label>Shape:</label>
        <select :value="shape" @change="onChangeShape($event.target.value)">
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="ellipse">Ellipse</option>
          <option value="line">Line</option>
          <option value="arrow">Arrow</option>
        </select>
      </div>
    </div>

    <div class="canvas-container">
      <canvas
        ref="annotation-canvas"
        id="annotation-canvas"
        width="800"
        height="600"
      ></canvas>
    </div>

    <div class="status">Current Tool: {{ currentTool || 'None' }}</div>
  </div>
</template>

<script>
import { annotationMixinV2 } from '@/components/mixins/annotation_v2.js'

export default {
  name: 'annotation-example',
  mixins: [annotationMixinV2],

  mounted() {
    this.setupFabricCanvas()
  },

  methods: {
    // Override placeholder methods for demo
    getCurrentTime() {
      return Date.now() / 1000
    },

    getCurrentFrame() {
      return Math.floor(Date.now() / 1000) // Simple frame calculation
    },

    saveAnnotations() {
      console.log('Saving annotations...', {
        additions: this.additions,
        deletions: this.deletions,
        updates: this.updates
      })
    },

    showCanvas() {
      // Canvas is always visible in this example
    },

    // Demo-specific methods
    logCanvasState() {
      console.log('Canvas objects:', this.fabricCanvas.getObjects())
      console.log('Active tool:', this.currentTool)
      console.log('Tool manager:', this.toolManager)
    }
  }
}
</script>

<style scoped>
.annotation-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.tool-button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-button:hover {
  background: #e9e9e9;
}

.tool-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.separator {
  width: 1px;
  height: 30px;
  background: #ddd;
  margin: 0 5px;
}

.color-section,
.width-section,
.shape-section {
  display: flex;
  align-items: center;
  gap: 5px;
}

.color-section label,
.width-section label,
.shape-section label {
  font-size: 12px;
  font-weight: 500;
  min-width: 70px;
}

.color-section input[type='color'] {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.width-section select,
.shape-section select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.canvas-container {
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: inline-block;
  background: white;
}

.status {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

/* Canvas styles */
#annotation-canvas {
  display: block;
  cursor: crosshair;
}
</style>
