import { Keyframe } from "./Keyframe.js";

export class Animation {
  constructor({ id, keyframes }) {
    this.id = id;
    this.keyframes = keyframes;
  }

  static fromConfig(config, fallbackId) {
    const id = asString(config?.id, fallbackId);
    const points = Array.isArray(config?.points) ? config.points : [];

    const keyframes = points
      .map((point) => new Keyframe({ progress: point?.progress, css: point?.css, vars: point?.vars }))
      .sort((a, b) => a.progress - b.progress);

    return new Animation({ id, keyframes });
  }

  isEmpty() {
    return this.keyframes.length === 0;
  }

  toCssSteps() {
    return this.keyframes.map((k) => k.toCssStep());
  }

  getInitialStyles() {
    if (this.keyframes.length === 0) {
      return {};
    }
    return this.keyframes[0].toCssStep().styles;
  }

  toJSON() {
    return {
      id: this.id,
      points: this.keyframes.map((k) => k.toJSON())
    };
  }
}

function asString(value, fallback) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}
