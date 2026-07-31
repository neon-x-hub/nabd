import { Layer } from "./Layer.js";

export class ImageLayer extends Layer {
  render(debug) {
    const el = document.createElement("img");
    el.alt = this.name || this.id;
    if (this.src) {
      el.src = this.src;
    }
    this.applyBaseStyles(el, debug);
    return el;
  }
}