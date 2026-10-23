import { BoxLayer } from "./BoxLayer.js";
import { TextLayer } from "./TextLayer.js";
import { ImageLayer } from "./ImageLayer.js";
import { VideoLayer } from "./VideoLayer.js";
import { GroupLayer } from "./GroupLayer.js";
import { AudioLayer } from "./AudioLayer.js";

const LAYER_MAP = {
  box: BoxLayer,
  text: TextLayer,
  image: ImageLayer,
  video: VideoLayer,
  group: GroupLayer,
  audio: AudioLayer
};

export function createLayer(config) {
  const LayerType = LAYER_MAP[config.type] ?? BoxLayer;
  return new LayerType(config);
}