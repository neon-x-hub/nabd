import { createPlayer } from "./player.js";

const container = document.getElementById("player-root");

if (!container) {
  throw new Error("Missing required UI element: #player-root");
}

async function bootstrap() {
  const scene = await fetch("./scene.json").then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load scene.json (${response.status})`);
    }
    return response.json();
  });

  const player = createPlayer({
    container,
    scene,
    debug: false
  });

  window.__nabdRun = () => {
    player.run();
  };
  window.__nabdRenderReady = true;

  const params = new URLSearchParams(window.location.search);
  const autostart = params.get("autostart");
  if (autostart !== "0") {
    window.__nabdRun();
  }
}

bootstrap().catch((error) => {
  console.error("[nabd/render] Bootstrap failed", error);
});
