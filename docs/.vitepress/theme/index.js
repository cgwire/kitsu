import DefaultTheme from "vitepress/theme";
import "./custom.css";
// import Mermaid from "./Mermaid.vue";
import KitsuLayout from "./KitsuLayout.vue"

export default {
  extends: DefaultTheme,
  Layout: KitsuLayout,
  enhanceApp({ app, router }) {
    // app.component("Mermaid", Mermaid);
  },
};
