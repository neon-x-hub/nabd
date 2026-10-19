let layerCounter = 0;

export class Layer {
  constructor({
    id,
    name = "",
    type = "box",
    style = {},
    variables = {},
    animations = []
  } = {}) {
    layerCounter += 1;
    this.id = id || `${type}_${layerCounter}`;
    this.name = name;
    this.type = type;
    this.style = { ...style };
    this.variables = { ...variables };
    this.animations = [];

    if (Array.isArray(animations)) {
      for (const anim of animations) {
        this.animate(anim);
      }
    }
  }

  setStyle(style) {
    this.style = { ...style };
    return this;
  }

  mergeStyle(partialStyle) {
    Object.assign(this.style, partialStyle);
    return this;
  }

  setVariables(variables) {
    this.variables = { ...variables };
    return this;
  }

  setVariable(name, value) {
    const key = name.startsWith("--") ? name : `--${name}`;
    this.variables[key] = String(value);
    return this;
  }

  animate(config) {
    if (!config || typeof config !== "object") {
      throw new Error(`[Layer:${this.id}] animate() requires a configuration object`);
    }

    const duration = Math.max(0, Number(config.duration) || 1000);
    const delay = Math.max(0, Number(config.delay) || 0);
    const ease = config.ease ?? config.easing ?? "linear";
    const repeat = config.repeat === "infinite" ? "infinite" : Math.max(1, Number(config.repeat) || 1);

    const animRecord = {
      delay,
      duration,
      ease,
      repeat
    };

    if (config.animationId) {
      animRecord.animationId = String(config.animationId);
    } else if (Array.isArray(config.points)) {
      animRecord.points = normalizePoints(config.points);
    } else if (config.from || config.to) {
      animRecord.points = normalizeFromTo(config.from, config.to);
    } else {
      throw new Error(`[Layer:${this.id}] animate() must provide 'animationId', 'points', or 'from'/'to'`);
    }

    this.animations.push(animRecord);
    return this;
  }

  toJSON() {
    const out = {
      id: this.id,
      name: this.name,
      type: this.type,
      style: { ...this.style },
      variables: { ...this.variables },
      animations: this.animations.map((anim) => ({ ...anim }))
    };

    return out;
  }
}

function normalizePoints(points) {
  return points.map((p) => {
    const progress = Math.max(0, Math.min(1, Number(p.progress) || 0));
    const css = {};
    const vars = {};

    const rawCss = p.css || {};
    for (const [key, value] of Object.entries(rawCss)) {
      if (key.startsWith("--")) {
        vars[key] = String(value);
      } else {
        css[key] = value;
      }
    }

    if (p.vars && typeof p.vars === "object") {
      for (const [key, value] of Object.entries(p.vars)) {
        const varKey = key.startsWith("--") ? key : `--${key}`;
        vars[varKey] = String(value);
      }
    }

    const point = { progress, css };
    if (Object.keys(vars).length > 0) {
      point.vars = vars;
    }
    return point;
  });
}

function normalizeFromTo(from = {}, to = {}) {
  return normalizePoints([
    { progress: 0, css: from },
    { progress: 1, css: to }
  ]);
}
