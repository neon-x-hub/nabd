# Nabd - نبض

![banner image](docs/banner.jpg)


Nabd (نبض - pulse in Arabic) is a high-performance, declarative **JSON → DOM → CSS animation player** with a native command-line video recorder. It compiles visual scenes described in JSON into hardware-accelerated CSS keyframes and renders them directly inside the browser.

*Shared as a slightly polished version of a personal animation and recording pipeline.*

## Key Features
* **Procedural Code Authoring & Baking (SDK)**: Build complex, algorithmic animations using clean JavaScript/Node.js classes (`Scene`, `BoxLayer`, `TextLayer`, etc.) with raw CSS pass-through, and bake them into static `scene.json` files on disk.
* **Declarative Scene Model**: Define your entire animation hierarchy, timing, and properties statically in JSON.
* **GPU-Accelerated Compositing**: Relies entirely on the browser's CSS Animation engine for smooth rendering.
* **CDP Screencast Recorder**: Includes a CLI tool powered by the **Chrome DevTools Protocol (CDP) Screencast API** that records real-time playback into MP4 video with high throughput and perfect timing synchronization.

---

## 🚀 Quickstart: Authoring Animations with Code

Instead of writing verbose JSON by hand, use the **Keyflow SDK**:

```javascript
import { Scene, BoxLayer, TextLayer } from "./index.js";

const scene = new Scene({ id: "my_scene", dimensions: [1280, 720] });

const title = new TextLayer({
  id: "title",
  content: "Hello Procedural Animation!",
  style: {
    left: "100px",
    top: "120px",
    fontSize: "52px",
    fontFamily: "Inter, sans-serif",
    fontWeight: "bold",
    color: "#38bdf8"
  }
});

title.animate({
  delay: 200,
  duration: 900,
  ease: [0.16, 1, 0.3, 1],
  from: { opacity: 0, transform: "translateY(-40px)" },
  to: { opacity: 1, transform: "translateY(0px)" }
});

scene.add(title);

// Bake to disk
await scene.save("scene.json");
console.log("Baked scene.json!");
```

Run with Node:
```powershell
node make_scene.js
```

📖 **Detailed Guides**:
- [Developer Guide & Full API Reference](docs/SDK.md)
- [LLM Agent Guide & Cheatsheet](docs/AGENTS.md)
- [Example: Procedural Audio Spectrum](examples/procedural_spectrum.js)
- [Example: Animated UI Card Notification](examples/card_animation.js)

---

## Project Directory Structure

```text
├── assets/                  # Public media files (images, videos)
├── docs/                    # Documentation & Agent guides (docs/SDK.md, docs/AGENTS.md)
├── examples/                # Example scenes and procedural scripts (.js & .json)
├── src/                     # Core engine source code
│   ├── core/                # Scene parser and Animation Compiler
│   ├── layers/              # DOM Element renderers (Box, Text, Image, Video)
│   ├── models/              # Schema validation models (Scene, Animation, Keyframe)
│   ├── renderer/            # DOM and style injector
│   ├── sdk/                 # 🚀 Programmatic Authoring & Baking SDK
│   ├── player.js            # Entry point for building players
│   └── main.js              # Application bootstrapper
├── index.html               # Main interactive preview environment
├── render.html              # Clean preview sandbox optimized for recording
├── recorder.js              # CDP-powered headless MP4 recorder CLI
└── scene.json               # Default scene configuration file
```

---

## Supported Layer Types

Every visual object in a Nabd scene is a **Layer**. Layers are defined inside the `layers` array. Below are the details and JSON schemas for all available layer types:

### 1. `text` Layer
Renders a text string wrapped in a `<div>`.
```json
{
  "id": "heading-text",
  "type": "text",
  "content": "Hello World",
  "style": {
    "left": "50px",
    "top": "80px",
    "fontSize": "48px",
    "color": "#ffffff",
    "fontFamily": "Inter, sans-serif"
  }
}
```

### 2. `box` Layer
Renders a styled block container `<div>`. Great for backgrounds, cards, dividers, or colored panels.
```json
{
  "id": "background-panel",
  "type": "box",
  "style": {
    "width": "400px",
    "height": "250px",
    "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "borderRadius": "12px",
    "boxShadow": "0 10px 20px rgba(0,0,0,0.3)"
  }
}
```

### 3. `image` Layer
Renders an `<img>` element. Requires a `src` attribute.
```json
{
  "id": "logo-image",
  "type": "image",
  "src": "assets/logo.png",
  "style": {
    "width": "120px",
    "height": "120px",
    "left": "100px",
    "top": "150px"
  }
}
```

### 4. `video` Layer
Renders a HTML5 `<video>` element. Automatically plays and handles metadata loads during recording.
```json
{
  "id": "ambient-video",
  "type": "video",
  "src": "assets/background-loop.mp4",
  "style": {
    "width": "1280px",
    "height": "720px",
    "objectFit": "cover"
  }
}
```

### 5. `group` Layer
A layout container that groups child elements inside a wrapper `<div>`. Children inherit layout boundaries relatively.
```json
{
  "id": "hero-section",
  "type": "group",
  "children": [
    {
      "id": "hero-title",
      "type": "text",
      "content": "Nabd Engine",
      "style": { "top": "10px", "left": "10px" }
    }
  ]
}
```

---

## Defining Animations

Animations in Nabd/Keyflow can be authored either programmatically via the **SDK** or declared in static **JSON**.

### 1. In Code (Using the SDK)

Layers expose a chainable `.animate()` method supporting three authoring styles:

#### A. `from` / `to` Shorthand (Most Common)
```javascript
layer.animate({
  delay: 200,                // in ms
  duration: 800,             // in ms
  ease: [0.16, 1, 0.3, 1],   // cubic-bezier curve or CSS keyword like "ease-out"
  repeat: 1,                 // iteration count or "infinite"
  from: {
    opacity: 0,
    transform: "translateY(40px) scale(0.9)"
  },
  to: {
    opacity: 1,
    transform: "translateY(0px) scale(1.0)"
  }
});
```

#### B. Multi-Point Custom Keyframes (`points`)
```javascript
layer.animate({
  delay: 0,
  duration: 1500,
  ease: "linear",
  points: [
    { progress: 0.0, css: { transform: "rotate(0deg)", opacity: 1 } },
    { progress: 0.5, css: { transform: "rotate(180deg)", opacity: 0.5 } },
    { progress: 1.0, css: { transform: "rotate(360deg)", opacity: 1 } }
  ]
});
```

#### C. Reusable Scene Animation Reference
```javascript
// Define once at the root scene
scene.defineAnimation("pulse", [
  { progress: 0, css: { transform: "scale(1)" } },
  { progress: 0.5, css: { transform: "scale(1.15)" } },
  { progress: 1, css: { transform: "scale(1)" } }
]);

// Reference by ID on any layer
layer.animate({
  animationId: "pulse",
  delay: 300,
  duration: 600,
  repeat: 2
});
```

---

### 2. In Raw JSON Schema

In JSON, animations attached to layers use explicit keyframe `points` (progress `0.0` to `1.0`) or reference scene-level animations:

#### Inline Keyframe Points
```json
{
  "delay": 200,
  "duration": 800,
  "ease": [0.16, 1, 0.3, 1],
  "repeat": 1,
  "points": [
    {
      "progress": 0,
      "css": {
        "opacity": 0,
        "transform": "translateY(40px) scale(0.9)"
      }
    },
    {
      "progress": 1,
      "css": {
        "opacity": 1,
        "transform": "translateY(0px) scale(1.0)"
      }
    }
  ]
}
```

#### Referencing a Scene Animation
```json
{
  "animationId": "pulse",
  "delay": 300,
  "duration": 600,
  "ease": "ease-in-out",
  "repeat": 2
}
```

---

### Animatable Properties & CSS Variable Support

* **Any Animatable CSS Property**: `opacity`, `filter` (blur, brightness), `transform`, `backgroundColor`, `color`, `left`, `top`, etc.
* **Transform Consolidation**: Keyflow automatically consolidates transform functions (`x`, `y`, `scale`, `rotate`, or unified `transform` strings) into single CSS keyframe rules to avoid override conflicts.
* **CSS Custom Variables (`@property`)**: Scenes can define registered CSS variables (e.g. `--reveal`, `--hue`) and interpolate them smoothly in keyframe points using `vars: { "--reveal": "100%" }`.

---

## Running the Player

To run the player locally, serve the root directory using any static file server:

```powershell
# Using Python
python -m http.server 5173

# Or using Node (if local-web-server is installed)
npx local-web-server -p 5173
```

Then open your browser and navigate to:
* **Interactive Player**: `http://localhost:5173/index.html` (Allows manual clicks/triggering)
* **Recording Sandbox**: `http://localhost:5173/render.html?autostart=0` (Ideal environment for headlessly capturing scenes)

---

## Running the Recorder

The `recorder.js` script launches a headless Chromium instance, uses the **Chrome DevTools Protocol (CDP) Screencast API** to capture frames at maximum performance with zero event-loop blocking, and compiles them into a synchronized `.mp4` video.

### Command Syntax
```powershell
node recorder.js [options]
```

### Options

| Flag | Default | Description |
| :--- | :--- | :--- |
| `--scene` | `scene.json` | Path to the input JSON scene file. |
| `--duration` | `5` | Length of the recording in seconds. |
| `--fps` | `30` | Desired output frames-per-second (e.g. `30` or `60`). |
| `--quality` | `80` | JPEG compression quality of captured frames (`1` to `100`). |
| `--headless` | `false` | Launch Chrome in headless mode (`true` or `false`). |
| `--fullViewport` | `false` | Capture the entire window viewport (`true`) or only the target selector (`false`). |
| `--captureSelector`| `#player-root` | Element selector to crop to when `fullViewport` is `false`. |
| `--output` | `recordings/output.mp4` | Path for the output MP4 file. |
| `--keepFrames` | `false` | Retain temporary JPEG frames on disk after compilation. |

### Example Command
```powershell
node recorder.js --scene scene.json --duration 3.5 --fps 60 --headless true --fullViewport false --captureSelector "#player-root" --output recordings/hero_animation.mp4
```

---

## Real-World Example

For a complete, real-world scene configuration demonstrating complex layers (text, boxes, layouts), easing points, and CSS variables, refer to the [`examples/scene.json`](examples/scene.json) file.
