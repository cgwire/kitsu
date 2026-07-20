import DefaultTheme from "vitepress/theme";
import "./custom.css";
// import Mermaid from "./Mermaid.vue";
import KitsuLayout from "./KitsuLayout.vue"
import CopyMarkdownButton from './CopyMarkdownButton.vue'

export default {
  extends: DefaultTheme,
  Layout: KitsuLayout,
  enhanceApp({ app, router }) {
    app.component('CopyMarkdownButton', CopyMarkdownButton)
    // app.component("Mermaid", Mermaid);
  },
};
