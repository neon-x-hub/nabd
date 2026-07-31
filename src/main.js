import { createPlayer } from "./player.js";

const container = document.getElementById("player-root");
const runButton = document.getElementById("run-btn");

if (!container || !runButton) {
  throw new Error("Missing required UI elements: #player-root and #run-btn");
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

  runButton.addEventListener("click", () => {
    player.run();
  });

  player.run();
}

bootstrap().catch((error) => {
  console.error("[nabd] Bootstrap failed", error);
});
