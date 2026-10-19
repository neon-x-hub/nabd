# Keyflow SDK - LLM Agent Guide & Cheatsheet

This guide is designed for **AI coding agents** (Claude Code, Gemini, Copilot, etc.) working in the Keyflow (Nabd) repository. Follow this blueprint when asked to generate animations, create scenes, or modify motion graphics.

---

## 1. Quick Mental Model

- **Keyflow** compiles static `scene.json` files into native browser CSS `@keyframes` and renders them on DOM elements.
- **Never manually craft raw JSON files by hand.** Always write an executable Node.js script using the SDK and call `await scene.save("output.json")` to bake the scene.
- **Zero CSS Abstraction**: Keyflow uses raw browser CSS. There are NO custom helper methods like `.size()` or `.rounded()`. All styling goes into the `style: {}` object as standard CSS.

---

## 2. Standard Agent Workflow

When a user asks: *"Create an animation of [X]"*:

```
1. Write Script   -> Create scripts/create_scene.js using the SDK.
2. Bake Scene     -> Execute `node scripts/create_scene.js`.
3. Verify Output  -> Check that the JSON file was created and is valid.
4. Report to User -> Tell the user the scene is ready to preview in browser or render via recorder.js.
```

> [!IMPORTANT]
> **Do not run `recorder.js` automatically** unless the user explicitly requests recording to MP4. Headless video rendering can take significant time. Always bake first and let the user inspect or trigger recording manually.

---

## 3. Strict API Contract & Cheatsheet

### 3.1 Imports
Always import from root `./index.js` or `../index.js`:
```javascript
import {
  Scene,
  BoxLayer,
  TextLayer,
  ImageLayer,
  VideoLayer,
  GroupLayer
} from "./index.js";
```

### 3.2 Creating the Scene
```javascript
const scene = new Scene({
  id: "my_scene",
  dimensions: [1280, 720] // Width x Height in pixels
});
```

### 3.3 Creating Layers
| Layer | Specific Property | HTML Element |
| :--- | :--- | :--- |
| `BoxLayer` | None (just `style`) | `<div>` |
| `TextLayer` | `content: "Your Text"` | `<div>` |
| `ImageLayer` | `src: "assets/logo.png"` | `<img>` |
| `VideoLayer` | `src: "assets/video.mp4"`, `playbackRate: 1.0` | `<video>` |
| `GroupLayer` | `children: [...]` | `<div>` container |

### 3.4 Attaching Animations (`layer.animate(...)`)
All timings are in **milliseconds**.
```javascript
// Method A: from / to shorthand (Most common)
layer.animate({
  delay: 200,      // ms
  duration: 800,   // ms
  ease: [0.16, 1, 0.3, 1], // or "ease-out"
  repeat: 1,       // 1, 2, ... or "infinite"
  from: { opacity: 0, transform: "scale(0.8)" },
  to: { opacity: 1, transform: "scale(1.0)" }
});

// Method B: Multi-point keyframes
layer.animate({
  delay: 0,
  duration: 1500,
  ease: "linear",
  points: [
    { progress: 0.0, css: { opacity: 0 } },
    { progress: 0.5, css: { opacity: 0.5, transform: "rotate(180deg)" } },
    { progress: 1.0, css: { opacity: 1, transform: "rotate(360deg)" } }
  ]
});

// Method C: Reusable scene animation
scene.defineAnimation("fade_in", [
  { progress: 0, css: { opacity: 0 } },
  { progress: 1, css: { opacity: 1 } }
]);
layer.animate({ animationId: "fade_in", delay: 100, duration: 600 });
```

### 3.5 Grouping & Hierarchies
```javascript
const card = new GroupLayer({
  id: "card",
  style: {
    left: "200px",
    top: "200px",
    width: "400px",
    height: "200px",
    backgroundColor: "#1e293b"
  }
});

const title = new TextLayer({
  id: "card_title",
  content: "Inside Group",
  style: { left: "20px", top: "20px", color: "#fff", fontSize: "20px" }
});

card.add(title);
scene.add(card);
```

### 3.6 Baking to Disk
```javascript
const savedPath = await scene.save("scene.json");
console.log(`Bake completed: ${savedPath}`);
```

---

## 4. Agent Guardrails (Do's and Don'ts)

| Rule | Status | Correct Example | Incorrect Example |
| :--- | :---: | :--- | :--- |
| **CSS Properties** | ✅ DO | `style: { borderRadius: "12px", width: "100px" }` | ❌ `layer.rounded(12).size(100)` |
| **Timings** | ✅ DO | `duration: 1000, delay: 500` (numbers in ms) | ❌ `duration: "1s"`, `delay: "0.5s"` |
| **Transforms** | ✅ DO | `transform: "translateX(50px) scale(1.2)"` | ❌ `transform: { x: 50, scale: 1.2 }` |
| **Baking** | ✅ DO | `await scene.save("output.json")` | ❌ Manually formatting JSON strings with `fs.writeFile` |
| **Positioning** | ✅ DO | Layers default to `position: absolute`. Set `left`, `top`, `width`, `height`. | ❌ Relying on normal block flow without explicit layout styles |

---

## 5. Few-Shot Agent Templates

### Template 1: Minimal Animated Title
```javascript
import { Scene, BoxLayer, TextLayer } from "./index.js";

const scene = new Scene({ id: "title_scene", dimensions: [1280, 720] });

const bg = new BoxLayer({
  id: "bg",
  style: { left: "0px", top: "0px", width: "100%", height: "100%", backgroundColor: "#020617" }
});

const title = new TextLayer({
  id: "title",
  content: "Autonomous AI Animation",
  style: {
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "56px",
    fontFamily: "Inter, sans-serif",
    fontWeight: "bold",
    color: "#38bdf8"
  }
});

title.animate({
  delay: 200,
  duration: 1000,
  ease: [0.16, 1, 0.3, 1],
  from: { opacity: 0, transform: "translate(-50%, -30%)" },
  to: { opacity: 1, transform: "translate(-50%, -50%)" }
});

scene.add(bg, title);
await scene.save("scene.json");
```

### Template 2: Procedural Staggered Wave (Equalizer / Grid)
```javascript
import { Scene, BoxLayer } from "./index.js";

const scene = new Scene({ id: "wave_scene", dimensions: [1280, 720] });
const count = 20;

for (let i = 0; i < count; i++) {
  const box = new BoxLayer({
    id: `item_${i}`,
    style: {
      left: `${100 + i * 54}px`,
      bottom: "150px",
      width: "40px",
      height: `${60 + Math.sin(i * 0.4) * 120}px`,
      backgroundColor: `hsl(${i * 18}, 85%, 60%)`,
      borderRadius: "8px",
      transformOrigin: "bottom center"
    }
  });

  box.animate({
    delay: 200 + i * 40,
    duration: 800,
    ease: [0.34, 1.56, 0.64, 1],
    from: { opacity: 0, transform: "scaleY(0)" },
    to: { opacity: 1, transform: "scaleY(1)" }
  });

  scene.add(box);
}

await scene.save("scene.json");
```

---

## 6. How to Verify Baked Output

To verify that the baked JSON compiles properly without errors:
```powershell
node -e "
import { CoreScene, AnimationCompiler } from './index.js';
import fs from 'node:fs';
const json = JSON.parse(fs.readFileSync('scene.json', 'utf8'));
const scene = CoreScene.fromJSON(json);
const compiler = new AnimationCompiler();
for (const layer of scene.layers) {
  compiler.compileLayer({ layerId: layer.id, animationRefs: layer.animationRefs, sceneAnimations: scene.animations, variableDefs: scene.variableDefs });
}
console.log('Scene verified successfully!');
"
```
