import { Layer } from "./Layer.js";

export class GroupLayer extends Layer {
  render(debug) {
    const el = document.createElement("div");
    this.applyBaseStyles(el, debug);
    return el;
  }
}