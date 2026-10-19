# Keyflow SDK - Developer Guide

Keyflow (Nabd) allows you to author high-performance, deterministic animations directly in JavaScript/Node.js and **bake** them into static `scene.json` files on disk. The baked scenes can be previewed in the browser or recorded into synchronized MP4 videos via the headless CDP screencast recorder.

---

## 1. Core Architecture & Mental Model

Keyflow separates animation **authoring** from animation **execution**:

1. **Authoring (Code / Node.js)**:
   You instantiate layers (`BoxLayer`, `TextLayer`, etc.), apply standard CSS styling, attach keyframes via `.animate()`, and run procedural loops or math calculations.
2. **Baking (Disk Export)**:
   Calling `await scene.save("scene.json")` validates the scene against the engine's schema and serializes the complete scene graph to disk.
3. **Execution (Browser DOM & CSS)**:
   The browser loads `scene.json`. Keyflow's `AnimationCompiler` translates layer animations into conflict-free CSS `@keyframes` and runs them with GPU acceleration.
4. **Recording (CDP Headless Chrome & FFmpeg)**:
   The `recorder.js` script launches headless Chrome, samples frames using the Chrome DevTools Protocol Screencast API, and stitches them into a 60fps MP4 video.

---

## 2. Quickstart

Create a file named `make_scene.js`:

```javascript
import { Scene, BoxLayer, TextLayer } from "./index.js";

const scene = new Scene({
  id: "quickstart",
  name: "Quickstart Scene",
  dimensions: [1280, 720] // [width, height] in px
});

// 1. Add background
const bg = new BoxLayer({
  id: "bg",
  style: {
    left: "0px",
    top: "0px",
    width: "100%",
    height: "100%",
    backgroundColor: "#0f172a"
  }
});
scene.add(bg);

// 2. Add animated text
const title = new TextLayer({
  id: "title",
  content: "Hello from Keyflow Code!",
  style: {
    left: "100px",
    top: "100px",
    fontSize: "48px",
    fontFamily: "Inter, sans-serif",
    fontWeight: "bold",
    color: "#38bdf8"
  }
});

title.animate({
  delay: 200,      // in milliseconds
  duration: 800,   // in milliseconds
  ease: [0.16, 1, 0.3, 1],
  from: {
    opacity: 0,
    transform: "translateY(-40px)"
  },
  to: {
    opacity: 1,
    transform: "translateY(0px)"
  }
});
scene.add(title);

// 3. Bake to disk
await scene.save("scene.json");
console.log("Baked scene.json successfully!");
```

### Run and Preview:
```powershell
# 1. Bake the scene
node make_scene.js

# 2. Preview interactively in browser
# (Serve folder with e.g. python -m http.server 5173, then open)
http://localhost:5173/index.html?scene=scene.json

# 3. Render directly to MP4
node recorder.js --scene scene.json --duration 4 --output recordings/quickstart.mp4
```

---

## 3. Zero CSS Abstraction

Keyflow does **not** create wrapper methods for CSS properties. The `style` property accepts raw CSS property objects in camelCase or standard CSS keys:

```javascript
const box = new BoxLayer({
  id: "card",
  style: {
    position: "absolute",
    left: "200px",
    top: "150px",
    width: "400px",
    height: "220px",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
});
```

Any valid browser CSS property works out of the box: gradients, filters, calc, flexbox, grid, clip-path, shadows, and transform strings.

---

## 4. API Reference

### 4.1 `Scene`
Top-level composition builder.

```javascript
import { Scene } from "./index.js";

const scene = new Scene({
  id: "scene_id",             // Optional (default: "scene")
  name: "Display Name",       // Optional (default: "Untitled Scene")
  dimensions: [1280, 720],    // [width, height] in px
  variableDefs: {},           // Optional CSS @property definitions
  animations: [],             // Optional reusable animation configs
  layers: []                  // Optional initial root layers
});
```

#### Methods:
- `scene.add(...layers)`: Adds one or more layers (supports flat or nested arrays). Returns `this`.
- `scene.defineAnimation(id, points)`: Registers a reusable animation template. Returns `this`.
- `scene.defineVariable(name, { syntax, inherits, initialValue })`: Registers a CSS `@property` custom variable for interpolation. Returns `this`.
- `scene.setDimensions(width, height)`: Sets canvas width and height. Returns `this`.
- `scene.toJSON()`: Returns the plain JSON representation.
- `scene.exportJSON(space = 2)`: Returns the formatted JSON string.
- `await scene.save(filePath, { space = 2, validate = true })`: Validates against the engine's schema and writes the file to disk. Returns the absolute file path.

---

### 4.2 Layer Classes

All layers inherit from base `Layer` and provide:
- `layer.setStyle(styleObject)`: Replaces the layer's `style`.
- `layer.mergeStyle(partialObject)`: Merges properties into `this.style`.
- `layer.setVariables(varsObject)`: Replaces layer CSS custom properties.
- `layer.setVariable(name, value)`: Sets a single CSS custom property.
- `layer.animate(animationConfig)`: Attaches an animation. Returns `this`.

#### Concrete Layer Classes:
1. `BoxLayer({ id, name, style, variables, animations })`
   - Generates a `<div>`. Perfect for backgrounds, containers, cards, geometric shapes, and panels.
2. `TextLayer({ id, name, content, style, variables, animations })`
   - Generates a text container `<div>`.
   - `setContent(text)`: Updates text content.
3. `ImageLayer({ id, name, src, style, variables, animations })`
   - Generates an `<img>`.
   - `setSrc(url)`: Updates the image source path.
4. `VideoLayer({ id, name, src, playbackRate, style, variables, animations })`
   - Generates an auto-playing `<video>`.
   - `setSrc(url)`: Updates the video source path.
   - `setPlaybackRate(rate)`: Sets video playback speed (e.g. `0.5`, `1.0`, `2.0`).
5. `GroupLayer({ id, name, children, style, variables, animations })`
   - Generates a wrapper container `<div>` holding child layers.
   - `group.add(...children)`: Appends child layers.

---

## 5. Animation Formats (`layer.animate(...)`)

Animations are configured with `delay` (ms), `duration` (ms), `ease` (timing curve), and `repeat` (`1`, `2`, ..., or `"infinite"`).

### 1. `from` / `to` Shorthand (Most Common)
For smooth transitions between two states:
```javascript
layer.animate({
  delay: 300,
  duration: 1000,
  ease: [0.16, 1, 0.3, 1], // Cubic-bezier curve
  from: {
    opacity: 0,
    transform: "translateY(50px) scale(0.9)"
  },
  to: {
    opacity: 1,
    transform: "translateY(0px) scale(1)"
  }
});
```

### 2. Multi-Point Custom Keyframes (`points`)
For complex, multi-stage choreography:
```javascript
layer.animate({
  delay: 0,
  duration: 2000,
  ease: "linear",
  points: [
    { progress: 0.0, css: { transform: "rotate(0deg)", opacity: 1 } },
    { progress: 0.5, css: { transform: "rotate(180deg)", opacity: 0.5 } },
    { progress: 1.0, css: { transform: "rotate(360deg)", opacity: 1 } }
  ]
});
```

### 3. Reusable Scene Animations (`animationId`)
Define once at the scene level and reuse across multiple layers:
```javascript
scene.defineAnimation("pulse", [
  { progress: 0, css: { transform: "scale(1)" } },
  { progress: 0.5, css: { transform: "scale(1.15)" } },
  { progress: 1, css: { transform: "scale(1)" } }
]);

layer1.animate({ animationId: "pulse", delay: 200, duration: 600, repeat: 2 });
layer2.animate({ animationId: "pulse", delay: 400, duration: 600, repeat: 2 });
```

---

## 6. Procedural Recipes

### Recipe 1: Staggered Equalizer / Bar Chart
```javascript
const barCount = 20;
for (let i = 0; i < barCount; i++) {
  const bar = new BoxLayer({
    id: `bar_${i}`,
    style: {
      left: `${60 + i * 40}px`,
      bottom: "100px",
      width: "30px",
      height: `${80 + Math.sin(i * 0.5) * 150}px`,
      backgroundColor: `hsl(${i * 15}, 80%, 60%)`,
      borderRadius: "4px 4px 0 0",
      transformOrigin: "bottom center"
    }
  });

  bar.animate({
    delay: i * 50, // Staggered entrance
    duration: 600,
    ease: [0.34, 1.56, 0.64, 1],
    from: { opacity: 0, transform: "scaleY(0)" },
    to: { opacity: 1, transform: "scaleY(1)" }
  });

  scene.add(bar);
}
```

### Recipe 2: Animated CSS Variables (`@property`)
Smoothly animate properties that standard CSS cannot interpolate natively (such as gradient stops or angles):

```javascript
// 1. Register CSS @property
scene.defineVariable("--reveal", {
  syntax: "<percentage>",
  inherits: false,
  initialValue: "0%"
});

// 2. Apply to layer
const text = new TextLayer({
  id: "reveal_text",
  content: "Gradient Wipe Effect",
  style: {
    left: "100px",
    top: "200px",
    fontSize: "64px",
    color: "#fff"
  },
  variables: {
    "--reveal": "0%"
  }
});

// 3. Animate the variable
text.animate({
  delay: 200,
  duration: 1500,
  points: [
    { progress: 0, vars: { "--reveal": "0%" } },
    { progress: 1, vars: { "--reveal": "100%" } }
  ]
});
```

---

## 7. Preview & Video Recording

### Interactive Sandbox Preview:
Pass any baked scene file to `index.html` or `render.html` via the `?scene=` query parameter:
- `http://localhost:5173/index.html?scene=examples/procedural_spectrum.json`
- `http://localhost:5173/render.html?scene=examples/procedural_spectrum.json&autostart=1`

### Headless CDP MP4 Recording:
Render any baked scene file with exact timing synchronization:
```powershell
node recorder.js --scene examples/procedural_spectrum.json --duration 5 --fps 60 --output recordings/spectrum.mp4
```
