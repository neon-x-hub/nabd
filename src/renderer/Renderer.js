import { createLayer } from "../layers/createLayer.js";
import { AnimationCompiler } from "../core/AnimationCompiler.js";

export class Renderer {
  constructor({ container, debug = false }) {
    this.container = container;
    this.debug = debug;
    this.styleTag = null;
    this.animationCompiler = new AnimationCompiler({ policy: "midpoint", debug });
  }

  reset() {
    this.container.replaceChildren();
    if (this.styleTag?.isConnected) {
      this.styleTag.remove();
    }
    this.styleTag = null;
  }

  renderScene(scene) {
    this.applyContainerDimensions(scene.dimensions);

    const layerRegistry = new Map();
    this.buildLayerTree(scene.layers, this.container, layerRegistry);
    this.startMediaPlayback(layerRegistry);

    const compileResult = this.compileAnimations(scene, layerRegistry);
    this.styleTag = this.injectKeyframes(compileResult.keyframes, scene.variableDefs ?? {});
    this.attachAnimations(layerRegistry, compileResult.bindings);

    return compileResult;
  }

  buildLayerTree(layerConfigs, parentElement, layerRegistry) {
    for (const layerConfig of layerConfigs) {
      const layer = createLayer(layerConfig);
      const element = layer.render(this.debug);

      parentElement.appendChild(element);
      layerRegistry.set(layer.id, { layer, element });

      if (layer.children.length > 0) {
        this.buildLayerTree(layer.children, element, layerRegistry);
      }
    }
  }

  compileAnimations(scene, layerRegistry) {
    const keyframes = [];
    const bindings = [];

    for (const [layerId, record] of layerRegistry.entries()) {
      const compiled = this.animationCompiler.compileLayer({
        layerId,
        animationRefs: record.layer.animationRefs,
        sceneAnimations: scene.animations,
        variableDefs: scene.variableDefs ?? {}
      });
      if (!compiled) continue;
      keyframes.push(compiled.keyframe);
      bindings.push(compiled.binding);
    }

    return { keyframes, bindings };
  }

  startMediaPlayback(layerRegistry) {
    for (const [, record] of layerRegistry.entries()) {
      const { layer, element } = record;
      if (layer.type !== "video" || typeof element.play !== "function") {
        continue;
      }

      const playPromise = element.play();
      if (playPromise?.catch) {
        playPromise.catch((error) => {
          if (this.debug) {
            console.warn(`[nabd] Video playback failed for layer "${layer.id}"`, error);
          }
        });
      }

      element.addEventListener("loadedmetadata", () => {
        const retryPromise = element.play();
        if (retryPromise?.catch) {
          retryPromise.catch((error) => {
            if (this.debug) {
              console.warn(`[nabd] Video retry playback failed for layer "${layer.id}"`, error);
            }
          });
        }
      }, { once: true });
    }
  }

  injectKeyframes(keyframes, variableDefs) {
    const styleTag = document.createElement("style");
    styleTag.dataset.nabd = "player-style";

    const propertyBlocks = buildPropertyBlocks(variableDefs);
    const css = keyframes
      .map((frame) => {
        const stepsCss = frame.steps
          .map((step) => `  ${step.pct}% { ${cssBlock(step.styles)} }`)
          .join("\n");
        return `@keyframes ${frame.name} {\n${stepsCss}\n}`;
      })
      .join("\n\n");

    styleTag.textContent = [propertyBlocks, css].filter(Boolean).join("\n\n");
    document.head.appendChild(styleTag);
    return styleTag;
  }

  attachAnimations(layerRegistry, bindings) {
    const grouped = new Map();
    for (const binding of bindings) {
      const list = grouped.get(binding.layerId) ?? [];
      list.push(binding);
      grouped.set(binding.layerId, list);
    }

    for (const [layerId, layerBindings] of grouped.entries()) {
      const target = layerRegistry.get(layerId);
      if (!target) continue;

      for (const binding of layerBindings) {
        for (const [prop, value] of Object.entries(binding.initial)) {
          target.element.style[prop] = value;
        }
      }

      target.element.style.animation = layerBindings
        .map((b) => `${b.name} ${b.duration}ms ${b.easing} ${b.delay}ms ${b.repeat} normal both running`)
        .join(", ");
    }
  }

  applyContainerDimensions(dimensions) {
    const [width, height] = dimensions;
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
  }
}

function cssBlock(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${toKebabCase(key)}: ${value};`)
    .join(" ");
}

function toKebabCase(input) {
  return input.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function buildPropertyBlocks(variableDefs) {
  const blocks = [];
  for (const [name, def] of Object.entries(variableDefs ?? {})) {
    if (!name.startsWith("--")) continue;
    if (!def?.syntax || typeof def.inherits !== "boolean" || def.initialValue == null) continue;
    blocks.push(
      `@property ${name} {\n` +
      `  syntax: "${def.syntax}";\n` +
      `  inherits: ${def.inherits ? "true" : "false"};\n` +
      `  initial-value: ${def.initialValue};\n` +
      `}`
    );
  }
  return blocks.join("\n\n");
}
