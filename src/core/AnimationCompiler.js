export class AnimationCompiler {
  constructor({ policy = "midpoint", debug = false, weightedBias = 0.5 } = {}) {
    this.policy = policy;
    this.debug = debug;
    this.weightedBias = clamp(weightedBias, 0, 1);
  }

  compileLayer({ layerId, animationRefs, sceneAnimations, variableDefs = {} }) {
    const expanded = this.expandReferences(layerId, animationRefs, sceneAnimations);
    if (expanded.length === 0) {
      return null;
    }

    const totalDuration = Math.max(...expanded.map((item) => item.endMs));
    if (totalDuration <= 0) {
      return null;
    }

    const propertyTracks = this.buildPropertyTracks(expanded, totalDuration);
    if (this.debug) {
      this.warnOnUndefinedVariableDefs(layerId, propertyTracks, variableDefs);
    }
    const boundaries = collectBoundaries(propertyTracks, expanded, totalDuration);
    const trackMeta = buildTrackMeta(propertyTracks);

    const steps = [];
    const heldValues = new Map();
    for (let i = 0; i < boundaries.length; i += 1) {
      const t = boundaries[i];
      const styles = {};

      for (const [prop, track] of propertyTracks.entries()) {
        const meta = trackMeta.get(prop);
        let value = sampleTrackAtTime(track, t);
        if (value == null && t > 0) {
          value = sampleTrackAtTime(track, t - 0.001);
        }

        if (value == null) {
          // Before first ownership starts, lock to the first authored value to avoid pre-animation jumps.
          if (meta && t <= meta.firstStart) {
            value = meta.initialValue;
          } else {
            // After ownership gaps/end, hold last value to avoid implicit fallback interpolation.
            value = heldValues.get(prop) ?? meta?.initialValue ?? null;
          }
        }

        if (value != null) {
          styles[prop] = value;
          heldValues.set(prop, value);
        }
      }

      if (i < boundaries.length - 1) {
        const segmentMid = (boundaries[i] + boundaries[i + 1]) / 2;
        const easing = resolveSegmentEasing(propertyTracks, segmentMid);
        if (easing) {
          styles.animationTimingFunction = easing;
        }
      }

      steps.push({ pct: roundPct((t / totalDuration) * 100), styles });
    }

    const keyframeName = `anim_${layerId}_compiled`;

    return {
      keyframe: {
        name: keyframeName,
        steps
      },
      binding: {
        layerId,
        name: keyframeName,
        delay: 0,
        duration: totalDuration,
        easing: "linear",
        repeat: 1,
        initial: steps[0]?.styles ?? {}
      }
    };
  }

  warnOnUndefinedVariableDefs(layerId, propertyTracks, variableDefs) {
    for (const prop of propertyTracks.keys()) {
      if (prop.startsWith("--") && !variableDefs[prop]) {
        console.warn(`[nabd/compiler] Variable "${prop}" is animated on layer "${layerId}" without variableDefs registration.`);
      }
    }
  }

  expandReferences(layerId, animationRefs, sceneAnimations) {
    const expanded = [];

    for (let i = 0; i < animationRefs.length; i += 1) {
      const ref = animationRefs[i];
      const animation = ref.inline ?? sceneAnimations.get(ref.animationId);
      if (!animation || animation.isEmpty()) {
        if (this.debug) {
          console.warn(`[nabd/compiler] Missing or empty animation for layer "${layerId}"`, ref);
        }
        continue;
      }

      const duration = ref.duration > 0 ? ref.duration : 1000;
      if (ref.repeat === "infinite") {
        if (this.debug) {
          console.warn(`[nabd/compiler] Infinite repeats are skipped in v0.1 compiler`, ref);
        }
        continue;
      }

      const repeat = Math.max(1, Number(ref.repeat) || 1);
      for (let cycle = 0; cycle < repeat; cycle += 1) {
        const startMs = ref.delay + cycle * duration;
        const endMs = startMs + duration;
        expanded.push({
          refIndex: i,
          layerId,
          animation,
          easing: ref.easing,
          duration,
          cycle,
          startMs,
          endMs
        });
      }
    }

    return expanded;
  }

  buildPropertyTracks(expanded, totalDuration) {
    const byProperty = new Map();

    for (const item of expanded) {
      const properties = getAnimationProperties(item.animation);
      for (const prop of properties) {
        const list = byProperty.get(prop) ?? [];
        list.push({
          prop,
          startMs: item.startMs,
          endMs: item.endMs,
          center: (item.startMs + item.endMs) / 2,
          startOverride: null,
          item
        });
        byProperty.set(prop, list);
      }
    }

    const tracks = new Map();

    for (const [prop, intervals] of byProperty.entries()) {
      assignStartOverrides(intervals, prop);

      const boundaries = [0, totalDuration];
      for (const interval of intervals) {
        boundaries.push(interval.startMs, interval.endMs);
      }

      boundaries.sort((a, b) => a - b);
      const unique = dedupeSorted(boundaries);
      const spans = [];

      for (let i = 0; i < unique.length - 1; i += 1) {
        const start = unique[i];
        const end = unique[i + 1];
        if (end <= start) continue;

        const mid = (start + end) / 2;
        const active = intervals.filter((it) => it.startMs <= mid && it.endMs > mid);
        if (active.length === 0) {
          continue;
        }

        const owner = pickOwner(active, mid, this.policy, this.weightedBias);
        spans.push({ start, end, owner });
      }

      tracks.set(prop, mergeAdjacentSpans(spans));
    }

    return tracks;
  }
}

function sampleTrackAtTime(track, t) {
  const span = findSpanAtTime(track, t);
  if (!span) return null;

  const { owner, start, end } = span;
  const duration = owner.item.duration;
  if (duration <= 0) return null;

  const clamped = clamp(t, owner.startMs, owner.endMs);
  const localMs = clamped - owner.startMs;
  const localProgress = clamp(localMs / duration, 0, 1);

  return sampleAnimationProperty(owner.item.animation, owner.prop, localProgress, owner.startOverride);
}

function findSpanAtTime(track, t) {
  return track.find((s) => s.start <= t && t < s.end);
}

function buildTrackMeta(propertyTracks) {
  const out = new Map();
  for (const [prop, track] of propertyTracks.entries()) {
    if (track.length === 0) continue;
    const firstStart = track[0].start;
    const initialValue = sampleTrackAtTime(track, firstStart);
    out.set(prop, { firstStart, initialValue });
  }
  return out;
}

function sampleAnimationProperty(animation, prop, progress, startOverride) {
  const keyframes = animation.keyframes;
  if (keyframes.length === 0) return null;

  let prev = keyframes[0];
  let next = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length; i += 1) {
    const current = keyframes[i];
    if (current.progress <= progress) {
      prev = current;
    }
    if (current.progress >= progress) {
      next = current;
      break;
    }
  }

  const prevValue = prev.css[prop];
  const nextValue = next.css[prop];

  if (startOverride != null && nearlyEqual(progress, 0)) {
    return stringify(startOverride);
  }

  if (prevValue == null && nextValue == null) return null;
  if (prevValue == null) return stringify(nextValue);
  if (nextValue == null) return stringify(prevValue);

  if (prev === next || nearlyEqual(prev.progress, next.progress)) {
    return stringify(prevValue);
  }

  const t = clamp((progress - prev.progress) / (next.progress - prev.progress), 0, 1);

  let from = prevValue;
  if (startOverride != null && prev === keyframes[0] && nearlyEqual(prev.progress, 0)) {
    from = startOverride;
  }

  if (typeof from === "number" && typeof nextValue === "number") {
    return String(lerp(from, nextValue, t));
  }

  return t < 0.5 ? stringify(from) : stringify(nextValue);
}

function getAnimationProperties(animation) {
  const set = new Set();
  for (const kf of animation.keyframes) {
    for (const key of Object.keys(kf.css)) {
      set.add(key);
    }
  }
  return Array.from(set);
}

function pickOwner(active, mid, policy, weightedBias) {
  if (active.length === 1) return active[0];

  if (policy === "incoming") {
    return active.slice().sort((a, b) => b.startMs - a.startMs || b.item.refIndex - a.item.refIndex)[0];
  }

  if (policy === "outgoing") {
    return active.slice().sort((a, b) => a.startMs - b.startMs || a.item.refIndex - b.item.refIndex)[0];
  }

  if (policy === "weighted") {
    const overlapStart = Math.max(...active.map((a) => a.startMs));
    const overlapEnd = Math.min(...active.map((a) => a.endMs));
    const split = overlapStart + (overlapEnd - overlapStart) * weightedBias;
    const incoming = active.slice().sort((a, b) => b.startMs - a.startMs || b.item.refIndex - a.item.refIndex)[0];
    const outgoing = active.slice().sort((a, b) => a.startMs - b.startMs || a.item.refIndex - b.item.refIndex)[0];
    return mid >= split ? incoming : outgoing;
  }

  return active
    .slice()
    .sort((a, b) => {
      const da = Math.abs(mid - a.center);
      const db = Math.abs(mid - b.center);
      if (!nearlyEqual(da, db)) return da - db;
      if (!nearlyEqual(a.startMs, b.startMs)) return b.startMs - a.startMs;
      return b.item.refIndex - a.item.refIndex;
    })[0];
}

function collectBoundaries(propertyTracks, expanded, totalDuration) {
  const boundaries = [0, totalDuration];
  for (const [, spans] of propertyTracks.entries()) {
    for (const span of spans) {
      boundaries.push(span.start, span.end);
    }
  }
  for (const item of expanded) {
    boundaries.push(item.startMs, item.endMs);
    for (const keyframe of item.animation.keyframes) {
      boundaries.push(item.startMs + keyframe.progress * item.duration);
    }
  }
  boundaries.sort((a, b) => a - b);
  return dedupeSorted(boundaries.map((t) => clamp(t, 0, totalDuration)));
}

function mergeAdjacentSpans(spans) {
  if (spans.length <= 1) return spans;

  const out = [spans[0]];
  for (let i = 1; i < spans.length; i += 1) {
    const prev = out[out.length - 1];
    const next = spans[i];

    if (prev.owner === next.owner && nearlyEqual(prev.end, next.start)) {
      prev.end = next.end;
      continue;
    }

    out.push({ ...next });
  }

  return out;
}

function assignStartOverrides(intervals, prop) {
  const sorted = intervals
    .slice()
    .sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs || a.item.refIndex - b.item.refIndex);

  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i];
    let previous = null;
    for (let j = 0; j < i; j += 1) {
      const candidate = sorted[j];
      if (candidate.endMs <= current.startMs) {
        if (!previous || candidate.endMs > previous.endMs) {
          previous = candidate;
        }
      }
    }

    if (!previous) continue;

    current.startOverride = sampleAnimationProperty(previous.item.animation, prop, 1, null);
  }
}

function resolveSegmentEasing(propertyTracks, t) {
  const owners = [];
  for (const [, track] of propertyTracks.entries()) {
    const span = findSpanAtTime(track, t);
    if (span?.owner) {
      owners.push(span.owner);
    }
  }

  if (owners.length === 0) {
    return null;
  }

  owners.sort((a, b) => {
    if (!nearlyEqual(a.startMs, b.startMs)) return b.startMs - a.startMs;
    if (!nearlyEqual(a.endMs, b.endMs)) return b.endMs - a.endMs;
    return b.item.refIndex - a.item.refIndex;
  });

  return owners[0].item.easing ?? null;
}

function dedupeSorted(list) {
  const out = [];
  for (const value of list) {
    if (out.length === 0 || !nearlyEqual(out[out.length - 1], value)) {
      out.push(value);
    }
  }
  return out;
}

function roundPct(value) {
  return Math.round(value * 1000) / 1000;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function stringify(value) {
  return String(value);
}

function nearlyEqual(a, b) {
  return Math.abs(a - b) < 1e-6;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
