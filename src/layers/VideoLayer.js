import { Layer } from "./Layer.js";

export class VideoLayer extends Layer {
  render(debug) {
    const el = document.createElement("video");
    if (this.src) {
      el.src = this.src;
    }
    if (this.playbackRate) {
      el.playbackRate = this.playbackRate;
    }
    const isMuted = this.muted !== undefined ? Boolean(this.muted) : true;
    el.muted = isMuted;
    el.defaultMuted = isMuted;
    if (isMuted) {
      el.setAttribute("muted", "");
    }
    if (this.volume != null) {
      el.volume = Math.max(0, Math.min(1, Number(this.volume)));
    }
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.autoplay = true;
    el.loop = this.loop !== undefined ? Boolean(this.loop) : true;
    el.preload = "auto";
    this.applyBaseStyles(el, debug);
    return el;
  }
}
