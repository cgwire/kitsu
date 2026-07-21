import DefaultTheme from "vitepress/theme";
import "./custom.css";

import mediumZoom from 'medium-zoom';
import { onMounted, watch, nextTick } from 'vue'

// import { useRoute } from 'vitepress'
// import Mermaid from "./Mermaid.vue";
import KitsuLayout from "./KitsuLayout.vue"
import CopyMarkdownButton from './CopyMarkdownButton.vue'
import {useMediumZoomProvider} from './useMediumZoom.js'

export default {
  extends: DefaultTheme,
  Layout: KitsuLayout,
  setup() {
    const initZoom = () => {
      mediumZoom('.main img', { background: 'rgba(0,0,0,0.5)' })
    }
    onMounted(() => {
      initZoom()
    })
  },
  enhanceApp({ app, router }) {
    app.component('CopyMarkdownButton', CopyMarkdownButton)
    // app.component("Mermaid", Mermaid);
    useMediumZoomProvider(app, router)
  },
};
