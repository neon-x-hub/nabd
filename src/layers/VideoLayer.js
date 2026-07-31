import { Layer } from "./Layer.js";

export class VideoLayer extends Layer {
  render(debug) {
    const el = document.createElement("video");
    if (this.src) {
      el.src = this.src;
    }
    if(this.playbackRate){
        el.playbackRate = this.playbackRate;
    }
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.autoplay = true;
    el.loop = true;
    el.preload = "auto";
    this.applyBaseStyles(el, debug);
    return el;
  }
}
