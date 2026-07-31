import { Layer } from "./Layer.js";

export class BoxLayer extends Layer {
  render(debug) {
    const el = document.createElement("div");
    this.applyBaseStyles(el, debug);
    return el;
  }
}