import { normalizeScene } from "./core/normalizeScene.js";
import { Renderer } from "./renderer/Renderer.js";
import { Scene } from "./models/Scene.js";

export function createPlayer({ container, scene, debug = false, enableAudio = true }) {
  if (!(container instanceof HTMLElement)) {
    throw new Error("createPlayer: container must be an HTMLElement");
  }

  const renderer = new Renderer({ container, debug, enableAudio });

  function run() {
    renderer.reset();
    const normalizedScene = scene instanceof Scene ? scene : normalizeScene(scene);

    if (debug) {
      console.log("[nabd] Parsed scene", normalizedScene);
    }

    const compileResult = renderer.renderScene(normalizedScene);

    if (debug) {
      console.log("[nabd] Compiled animations", compileResult.bindings);
      console.log("[nabd] Generated keyframes", compileResult.keyframes.map((k) => k.name));
    }
  }

  function stop() {
    renderer.reset();
  }

  return { run, stop, renderer, audioManager: renderer.audioManager };
}
