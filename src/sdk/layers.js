import { Layer } from "./Layer.js";

export class BoxLayer extends Layer {
  constructor(options = {}) {
    super({ type: "box", ...options });
  }
}

export class TextLayer extends Layer {
  constructor(options = {}) {
    super({ type: "text", ...options });
    this.content = options.content != null ? String(options.content) : "";
  }

  setContent(content) {
    this.content = String(content ?? "");
    return this;
  }

  toJSON() {
    const json = super.toJSON();
    if (this.content) {
      json.content = this.content;
    }
    return json;
  }
}

export class ImageLayer extends Layer {
  constructor(options = {}) {
    super({ type: "image", ...options });
    this.src = options.src != null ? String(options.src) : "";
  }

  setSrc(src) {
    this.src = String(src ?? "");
    return this;
  }

  toJSON() {
    const json = super.toJSON();
    if (this.src) {
      json.src = this.src;
    }
    return json;
  }
}

export class VideoLayer extends Layer {
  constructor(options = {}) {
    super({ type: "video", ...options });
    this.src = options.src != null ? String(options.src) : "";
    this.playbackRate = options.playbackRate != null ? Number(options.playbackRate) : 1.0;
    this.muted = options.muted !== undefined ? Boolean(options.muted) : true;
    this.volume = options.volume != null ? Number(options.volume) : 1.0;
  }

  setSrc(src) {
    this.src = String(src ?? "");
    return this;
  }

  setPlaybackRate(rate) {
    this.playbackRate = Number(rate);
    return this;
  }

  setMuted(muted = true) {
    this.muted = Boolean(muted);
    return this;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, Number(vol)));
    return this;
  }

  toJSON() {
    const json = super.toJSON();
    if (this.src) {
      json.src = this.src;
    }
    if (this.playbackRate != null && Number.isFinite(this.playbackRate)) {
      json.playbackRate = this.playbackRate;
    }
    if (this.muted !== undefined && !this.muted) {
      json.muted = false;
    }
    if (this.volume != null && this.volume !== 1.0) {
      json.volume = this.volume;
    }
    return json;
  }
}

export class AudioLayer extends Layer {
  constructor(options = {}) {
    super({ type: "audio", ...options });
    this.src = options.src != null ? String(options.src) : "";
    this.start = Number(options.start ?? options.startTime ?? 0);
    this.duration = options.duration != null ? Number(options.duration) : undefined;
    this.volume = options.volume != null ? Math.max(0, Math.min(1, Number(options.volume))) : 1.0;
    this.loop = Boolean(options.loop);
    this.offset = Number(options.offset ?? 0);
    this.playbackRate = Number(options.playbackRate ?? 1.0);
  }

  setSrc(src) {
    this.src = String(src ?? "");
    return this;
  }

  setStart(ms) {
    this.start = Number(ms);
    return this;
  }

  setStartTime(ms) {
    this.start = Number(ms);
    return this;
  }

  setDuration(ms) {
    this.duration = Number(ms);
    return this;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, Number(volume)));
    return this;
  }

  setLoop(loop = true) {
    this.loop = Boolean(loop);
    return this;
  }

  setOffset(ms) {
    this.offset = Number(ms);
    return this;
  }

  setPlaybackRate(rate) {
    this.playbackRate = Number(rate);
    return this;
  }

  toJSON() {
    const json = super.toJSON();
    if (this.src) json.src = this.src;
    if (this.start != null && this.start !== 0) json.start = this.start;
    if (this.duration != null) json.duration = this.duration;
    if (this.volume !== 1.0) json.volume = this.volume;
    if (this.loop) json.loop = this.loop;
    if (this.offset != null && this.offset !== 0) json.offset = this.offset;
    if (this.playbackRate !== 1.0) json.playbackRate = this.playbackRate;
    return json;
  }
}

export class GroupLayer extends Layer {
  constructor(options = {}) {
    super({ type: "group", ...options });
    this.children = [];
    if (Array.isArray(options.children)) {
      this.add(...options.children);
    }
  }

  add(...children) {
    for (const child of children.flat(Infinity)) {
      if (child instanceof Layer) {
        this.children.push(child);
      } else if (child && typeof child === "object") {
        this.children.push(createLayer(child));
      }
    }
    return this;
  }

  toJSON() {
    const json = super.toJSON();
    json.children = this.children.map((c) => c.toJSON());
    return json;
  }
}

const LAYER_CLASS_MAP = {
  box: BoxLayer,
  text: TextLayer,
  image: ImageLayer,
  video: VideoLayer,
  group: GroupLayer,
  audio: AudioLayer
};

export function createLayer(config = {}) {
  const LayerClass = LAYER_CLASS_MAP[config.type] || BoxLayer;
  return new LayerClass(config);
}
