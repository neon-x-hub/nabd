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
  }

  setSrc(src) {
    this.src = String(src ?? "");
    return this;
  }

  setPlaybackRate(rate) {
    this.playbackRate = Number(rate);
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
  group: GroupLayer
};

export function createLayer(config = {}) {
  const LayerClass = LAYER_CLASS_MAP[config.type] || BoxLayer;
  return new LayerClass(config);
}
