import { Layer } from "./Layer.js";

export class TextLayer extends Layer {
  render(debug) {
    const el = document.createElement("div");
    el.textContent = this.content;
    this.applyBaseStyles(el, debug);
    return el;
  }
}