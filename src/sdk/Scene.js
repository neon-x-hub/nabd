import fs from "node:fs";
import path from "node:path";
import { Layer } from "./Layer.js";
import { createLayer } from "./layers.js";
import { Scene as CoreScene } from "../models/Scene.js";

export class Scene {
  constructor({
    id = "scene",
    name = "Untitled Scene",
    version = "0.1",
    dimensions = [1280, 720],
    variableDefs = {},
    animations = [],
    layers = [],
    audio = []
  } = {}) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.dimensions = Array.isArray(dimensions) ? [Number(dimensions[0]) || 1280, Number(dimensions[1]) || 720] : [1280, 720];
    this.variableDefs = { ...variableDefs };
    this.animations = new Map();
    this.layers = [];
    this.audio = [];

    if (Array.isArray(audio)) {
      for (const track of audio) {
        this.addAudio(track);
      }
    }

    if (Array.isArray(animations)) {
      for (const anim of animations) {
        if (anim && anim.id) {
          this.defineAnimation(anim.id, anim.points ?? anim);
        }
      }
    } else if (animations && typeof animations === "object") {
      for (const [animId, anim] of Object.entries(animations)) {
        this.defineAnimation(animId, anim.points ?? anim);
      }
    }

    if (Array.isArray(layers)) {
      this.add(...layers);
    }
  }

  setDimensions(width, height) {
    this.dimensions = [Number(width), Number(height)];
    return this;
  }

  setName(name) {
    this.name = String(name);
    return this;
  }

  setId(id) {
    this.id = String(id);
    return this;
  }

  defineVariable(name, { syntax = "*", inherits = false, initialValue = "" } = {}) {
    const key = name.startsWith("--") ? name : `--${name}`;
    this.variableDefs[key] = {
      syntax: String(syntax),
      inherits: Boolean(inherits),
      initialValue: String(initialValue ?? "")
    };
    return this;
  }

  defineAnimation(id, pointsOrConfig) {
    if (!id) {
      throw new Error("defineAnimation requires a unique animation ID");
    }

    let points = [];
    if (Array.isArray(pointsOrConfig)) {
      points = pointsOrConfig;
    } else if (pointsOrConfig && Array.isArray(pointsOrConfig.points)) {
      points = pointsOrConfig.points;
    } else {
      throw new Error(`Animation "${id}" must provide an array of keyframe points`);
    }

    this.animations.set(id, {
      id: String(id),
      points: points.map((p) => {
        const progress = Math.max(0, Math.min(1, Number(p.progress) || 0));
        const outPoint = { progress, css: { ...(p.css || {}) } };
        if (p.vars && typeof p.vars === "object") {
          outPoint.vars = { ...p.vars };
        }
        return outPoint;
      })
    });

    return this;
  }

  add(...layers) {
    for (const layer of layers.flat(Infinity)) {
      if (layer instanceof Layer) {
        this.layers.push(layer);
      } else if (layer && typeof layer === "object") {
        this.layers.push(createLayer(layer));
      }
    }
    return this;
  }

  addAudio(track) {
    if (track instanceof Layer) {
      this.add(track);
    } else if (track && typeof track === "object") {
      this.audio.push({
        id: String(track.id || `audio_${this.audio.length}`),
        src: String(track.src || ""),
        start: Number(track.start ?? track.startTime ?? 0),
        duration: track.duration != null ? Number(track.duration) : undefined,
        volume: track.volume != null ? Math.max(0, Math.min(1, Number(track.volume))) : 1.0,
        loop: Boolean(track.loop),
        offset: Number(track.offset ?? 0),
        playbackRate: Number(track.playbackRate ?? 1.0)
      });
    }
    return this;
  }

  toJSON() {
    const out = {
      id: this.id,
      name: this.name,
      version: this.version,
      dimensions: [...this.dimensions],
      variableDefs: { ...this.variableDefs },
      animations: Array.from(this.animations.values()).map((anim) => ({
        id: anim.id,
        points: anim.points.map((pt) => ({ ...pt }))
      })),
      layers: this.layers.map((layer) => layer.toJSON())
    };
    if (this.audio && this.audio.length > 0) {
      out.audio = this.audio.map((a) => ({ ...a }));
    }
    return out;
  }

  exportJSON(space = 2) {
    return JSON.stringify(this.toJSON(), null, space);
  }

  async save(filePath, { space = 2, validate = true } = {}) {
    const rawJSON = this.toJSON();

    if (validate) {
      // Validate schema compliance against the engine's CoreScene model
      try {
        const coreScene = CoreScene.fromJSON(rawJSON);
        // Export via coreScene to ensure all normalizations pass
        var content = coreScene.exportJSON(space);
      } catch (validationErr) {
        throw new Error(`Scene validation failed before saving: ${validationErr.message}`);
      }
    } else {
      var content = JSON.stringify(rawJSON, null, space);
    }

    const resolvedPath = path.resolve(filePath);
    await fs.promises.mkdir(path.dirname(resolvedPath), { recursive: true });
    await fs.promises.writeFile(resolvedPath, content, "utf8");

    return resolvedPath;
  }
}
