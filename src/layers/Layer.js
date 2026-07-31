export class Layer {
  constructor(config) {
    if (new.target === Layer) {
      throw new Error("Layer is abstract and must be subclassed");
    }

    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.content = config.content;
    this.src = config.src;
    this.playbackRate = config.playbackRate;
    this.style = config.style;
    this.variables = config.variables;
    this.children = config.children;
    this.animationRefs = config.animationRefs;
  }

  render() {
    throw new Error("render() must be implemented by subclasses");
  }

  applyBaseStyles(element, debug) {
    element.dataset.layerId = this.id;
    element.style.position = "absolute";
    element.style.boxSizing = "border-box";

    for (const [key, value] of Object.entries(this.style)) {
      if (value != null) {
        element.style[key] = String(value);
      }
    }

    for (const [name, value] of Object.entries(this.variables ?? {})) {
      element.style.setProperty(name, String(value));
    }

    if (debug) {
      element.style.outline = "1px dashed red";
      element.title = `${this.id} (${this.type})`;
    }
  }
}
