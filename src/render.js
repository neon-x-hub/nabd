import { createPlayer } from "./player.js";

const container = document.getElementById("player-root");

if (!container) {
  throw new Error("Missing required UI element: #player-root");
}

async function bootstrap() {
  const params = new URLSearchParams(window.location.search);
  const scenePath = params.get("scene") || "./scene.json";
  const scene = await fetch(scenePath).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${scenePath} (${response.status})`);
    }
    return response.json();
  });

  const enableAudio = params.get("audio") === "1";
  const player = createPlayer({
    container,
    scene,
    debug: false,
    enableAudio
  });

  window.__nabdRun = () => {
    player.run();
  };
  window.__nabdRenderReady = true;

  const autostart = params.get("autostart");
  if (autostart !== "0") {
    window.__nabdRun();
  }
}

bootstrap().catch((error) => {
  console.error("[nabd/render] Bootstrap failed", error);
});
