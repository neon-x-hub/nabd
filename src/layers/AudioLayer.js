import { Layer } from "./Layer.js";

export class AudioLayer extends Layer {
  constructor(config = {}) {
    super(config);
    this.type = "audio";
    this.src = config.src || "";
    this.start = Number(config.start ?? config.startTime ?? 0);
    this.duration = config.duration != null ? Number(config.duration) : undefined;
    this.volume = config.volume != null ? Math.max(0, Math.min(1, Number(config.volume))) : 1.0;
    this.loop = Boolean(config.loop);
    this.offset = Number(config.offset ?? 0);
    this.playbackRate = Number(config.playbackRate ?? 1.0);
  }

  render(debug) {
    const el = document.createElement("audio");
    if (this.src) {
      el.src = this.src;
    }
    el.preload = "auto";
    el.style.display = "none";
    el.dataset.layerId = this.id;
    return el;
  }
}
