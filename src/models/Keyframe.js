export class Keyframe {
  constructor({ progress, css, vars }) {
    this.progress = clamp(Number(progress), 0, 1);
    this.vars = normalizeVars(vars);
    this.css = mergeCssAndVars(css, this.vars);
  }

  toCssStep() {
    return {
      pct: roundPct(this.progress * 100),
      styles: buildKeyframeStyles(this.css)
    };
  }

  toJSON() {
    const out = {
      progress: this.progress,
      css: extractNonVarCss(this.css)
    };
    if (Object.keys(this.vars).length > 0) {
      out.vars = { ...this.vars };
    }
    return out;
  }
}

const TRANSFORM_PROPS = ["x", "y", "scale", "rotate"];

function buildKeyframeStyles(css) {
  const styles = {};
  const transformTokens = {};

  for (const [prop, value] of Object.entries(css)) {
    if (TRANSFORM_PROPS.includes(prop)) {
      transformTokens[prop] = value;
      continue;
    }
    styles[prop] = String(value);
  }

  if (Object.keys(transformTokens).length > 0) {
    styles.transform = formatTransform(transformTokens);
  } else if (css.transform != null) {
    styles.transform = String(css.transform);
  }

  return styles;
}

function formatTransform(values) {
  const parts = [];
  if (isFiniteNumber(values.x)) parts.push(`translateX(${values.x}px)`);
  if (isFiniteNumber(values.y)) parts.push(`translateY(${values.y}px)`);
  if (isFiniteNumber(values.scale)) parts.push(`scale(${values.scale})`);
  if (isFiniteNumber(values.rotate)) parts.push(`rotate(${values.rotate}deg)`);
  return parts.length > 0 ? parts.join(" ") : "none";
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function roundPct(value) {
  return Math.round(value * 1000) / 1000;
}

function isRecord(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeVars(vars) {
  if (!isRecord(vars)) return {};
  const out = {};
  for (const [key, value] of Object.entries(vars)) {
    if (key.startsWith("--") && (typeof value === "string" || typeof value === "number")) {
      out[key] = value;
    }
  }
  return out;
}

function mergeCssAndVars(css, vars) {
  const merged = isRecord(css) ? { ...css } : {};
  for (const [key, value] of Object.entries(vars)) {
    merged[key] = value;
  }
  return merged;
}

function extractNonVarCss(css) {
  const out = {};
  for (const [key, value] of Object.entries(css)) {
    if (!key.startsWith("--")) {
      out[key] = value;
    }
  }
  return out;
}
