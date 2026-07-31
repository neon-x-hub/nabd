import { Animation } from "./Animation.js";

const NODE_TYPES = new Set(["box", "text", "image", "video", "group"]);

export class Scene {
  constructor({ id, name, version, dimensions, variableDefs, animations, layers }) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.dimensions = dimensions;
    this.variableDefs = variableDefs;
    this.animations = animations;
    this.layers = layers;
  }

  static fromJSON(input) {
    if (!input || typeof input !== "object") {
      throw new Error("Scene must be an object");
    }

    const dimensions = Array.isArray(input.dimensions) ? input.dimensions : [960, 540];
    const [width, height] = dimensions;

    return new Scene({
      id: asString(input.id, "scene"),
      name: asString(input.name, "Untitled"),
      version: asString(input.version, "0.1"),
      dimensions: [numberOr(width, 960), numberOr(height, 540)],
      variableDefs: normalizeVariableDefs(input.variableDefs),
      animations: normalizeAnimationsBlob(input.animations),
      layers: normalizeLayers(Array.isArray(input.layers) ? input.layers : [], "layer")
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      dimensions: [...this.dimensions],
      variableDefs: { ...this.variableDefs },
      animations: Array.from(this.animations.values()).map((animation) => animation.toJSON()),
      layers: this.layers.map((layer) => serializeLayer(layer))
    };
  }

  exportJSON(space = 2) {
    return JSON.stringify(this.toJSON(), null, space);
  }
}

function normalizeAnimationsBlob(rawAnimations) {
  const list = Array.isArray(rawAnimations) ? rawAnimations : [];
  const byId = new Map();

  for (let i = 0; i < list.length; i += 1) {
    const animation = Animation.fromConfig(list[i], `anim_${i}`);
    byId.set(animation.id, animation);
  }

  return byId;
}

function normalizeLayers(layers, pathKey) {
  return layers.map((layer, index) => {
    const fallbackId = `${pathKey}_${index}`;
    const id = asString(layer?.id, fallbackId);
    const type = NODE_TYPES.has(layer?.type) ? layer.type : "box";

    const children = type === "group"
      ? normalizeLayers(Array.isArray(layer.children) ? layer.children : [], id)
      : [];

    return {
      id,
      name: asString(layer?.name, ""),
      type,
      content: asString(layer?.content, ""),
      src: asString(layer?.src, ""),
      style: isRecord(layer?.style) ? layer.style : {},
      variables: normalizeLayerVariables(layer?.variables),
      children,
      animationRefs: normalizeAnimationRefs(Array.isArray(layer?.animations) ? layer.animations : [])
    };
  });
}

function normalizeAnimationRefs(animations) {
  return animations
    .map((entry, index) => {
      const animationId = asString(entry?.animationId, "");
      const inline = entry?.points ? Animation.fromConfig(entry, `inline_${index}`) : null;

      return {
        animationId,
        inline,
        delay: numberOr(entry?.delay, 0),
        duration: Math.max(0, numberOr(entry?.duration, 0)),
        easing: normalizeEasing(entry?.easing ?? entry?.ease),
        repeat: entry?.repeat === "infinite" ? "infinite" : Math.max(1, numberOr(entry?.repeat, 1))
      };
    })
    .filter((a) => a.animationId || a.inline);
}

function serializeLayer(layer) {
  const base = {
    id: layer.id,
    name: layer.name,
    type: layer.type,
    style: { ...layer.style },
    variables: { ...layer.variables },
    animations: layer.animationRefs.map((ref) => serializeAnimationRef(ref))
  };

  if (layer.content) {
    base.content = layer.content;
  }

  if (layer.src) {
    base.src = layer.src;
  }

  if (layer.children.length > 0) {
    base.children = layer.children.map((child) => serializeLayer(child));
  }

  return base;
}

function serializeAnimationRef(ref) {
  const out = {
    delay: ref.delay,
    duration: ref.duration,
    ease: serializeEasing(ref.easing),
    repeat: ref.repeat
  };

  if (ref.animationId) {
    out.animationId = ref.animationId;
  }

  if (ref.inline) {
    out.id = ref.inline.id;
    out.points = ref.inline.keyframes.map((k) => k.toJSON());
  }

  return out;
}

function serializeEasing(easing) {
  const match = typeof easing === "string"
    ? easing.match(/^cubic-bezier\(([^)]+)\)$/)
    : null;

  if (!match) {
    return easing;
  }

  const parts = match[1].split(",").map((p) => Number(p.trim()));
  if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
    return parts;
  }

  return easing;
}

function normalizeEasing(easing) {
  if (Array.isArray(easing) && easing.length === 4) {
    return `cubic-bezier(${easing.join(",")})`;
  }
  if (typeof easing === "string" && easing.trim().length > 0) {
    return easing;
  }
  return "linear";
}

function normalizeVariableDefs(input) {
  if (!isRecord(input)) return {};
  const out = {};
  for (const [name, def] of Object.entries(input)) {
    if (!name.startsWith("--") || !isRecord(def)) continue;
    const syntax = asString(def.syntax, "");
    const inherits = typeof def.inherits === "boolean" ? def.inherits : false;
    const initialValue = def.initialValue;
    if (!syntax || (typeof initialValue !== "string" && typeof initialValue !== "number")) {
      continue;
    }
    out[name] = { syntax, inherits, initialValue: String(initialValue) };
  }
  return out;
}

function normalizeLayerVariables(input) {
  if (!isRecord(input)) return {};
  const out = {};
  for (const [name, value] of Object.entries(input)) {
    if (!name.startsWith("--")) continue;
    if (typeof value === "string" || typeof value === "number") {
      out[name] = String(value);
    }
  }
  return out;
}

function numberOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function asString(value, fallback) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function isRecord(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
