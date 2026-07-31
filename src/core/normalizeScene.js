import { Scene } from "../models/Scene.js";

export function normalizeScene(scene) {
  return Scene.fromJSON(scene);
}