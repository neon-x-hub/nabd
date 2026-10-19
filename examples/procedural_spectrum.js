import { Scene, BoxLayer, TextLayer } from "../index.js";

async function main() {
  const scene = new Scene({
    id: "procedural_spectrum",
    name: "Procedural Audio Spectrum",
    dimensions: [1280, 720]
  });

  // Background
  const bg = new BoxLayer({
    id: "bg",
    style: {
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
      background: "radial-gradient(ellipse at bottom, #1e1b4b 0%, #030712 100%)"
    }
  });
  scene.add(bg);

  // Title text
  const title = new TextLayer({
    id: "title",
    content: "Procedural Audio Spectrum",
    style: {
      left: "80px",
      top: "70px",
      fontSize: "38px",
      fontFamily: "Inter, system-ui, sans-serif",
      fontWeight: "700",
      color: "#f8fafc",
      letterSpacing: "-0.5px",
      textShadow: "0 0 30px rgba(56, 189, 248, 0.4)"
    }
  });

  title.animate({
    delay: 100,
    duration: 800,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-30px)" },
    to: { opacity: 1, transform: "translateY(0px)" }
  });
  scene.add(title);

  // Subtitle
  const subtitle = new TextLayer({
    id: "subtitle",
    content: "Generated dynamically with the Keyflow Code Engine",
    style: {
      left: "80px",
      top: "125px",
      fontSize: "18px",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#94a3b8"
    }
  });

  subtitle.animate({
    delay: 300,
    duration: 800,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-15px)" },
    to: { opacity: 1, transform: "translateY(0px)" }
  });
  scene.add(subtitle);

  // Procedural equalizer bars
  const barCount = 28;
  const barWidth = 32;
  const gap = 8;
  const startX = 80;

  for (let i = 0; i < barCount; i++) {
    // Generate height with harmonic waves
    const normalized = i / (barCount - 1);
    const wave = Math.sin(normalized * Math.PI) * 260 + Math.sin(i * 0.7) * 50 + 60;
    const targetHeight = Math.max(30, Math.min(360, Math.round(wave)));
    const hue = Math.round(180 + normalized * 130);

    const bar = new BoxLayer({
      id: `bar_${i}`,
      style: {
        left: `${startX + i * (barWidth + gap)}px`,
        bottom: "140px",
        width: `${barWidth}px`,
        height: `${targetHeight}px`,
        background: `linear-gradient(to top, hsl(${hue}, 85%, 55%), hsl(${hue + 30}, 95%, 70%))`,
        borderRadius: "6px 6px 0 0",
        boxShadow: `0 0 16px hsla(${hue}, 85%, 60%, 0.35)`,
        transformOrigin: "bottom center"
      }
    });

    // 1. Initial entrance animation: scale up from bottom
    bar.animate({
      delay: 400 + i * 35,
      duration: 750,
      ease: [0.34, 1.56, 0.64, 1],
      from: {
        opacity: 0,
        transform: "scaleY(0)"
      },
      to: {
        opacity: 1,
        transform: "scaleY(1)"
      }
    });

    // 2. Secondary bounce rhythm
    bar.animate({
      delay: 1500 + i * 40,
      duration: 1200,
      ease: [0.42, 0, 0.58, 1],
      repeat: 2,
      points: [
        { progress: 0.0, css: { transform: "scaleY(1)" } },
        { progress: 0.4, css: { transform: `scaleY(${0.4 + Math.sin(i * 0.9) * 0.3})` } },
        { progress: 0.7, css: { transform: `scaleY(${1.2 - Math.cos(i * 0.5) * 0.2})` } },
        { progress: 1.0, css: { transform: "scaleY(1)" } }
      ]
    });

    scene.add(bar);
  }

  // Base floor line
  const floor = new BoxLayer({
    id: "floor",
    style: {
      left: "80px",
      bottom: "138px",
      width: `${barCount * (barWidth + gap) - gap}px`,
      height: "2px",
      background: "rgba(255, 255, 255, 0.2)"
    }
  });
  scene.add(floor);

  // Bake to disk
  const outputPath = process.argv[2] || "examples/procedural_spectrum.json";
  const savedPath = await scene.save(outputPath);
  console.log(`[Keyflow] Successfully baked procedural scene to: ${savedPath}`);
}

main().catch((err) => {
  console.error("[Keyflow] Error generating scene:", err);
  process.exit(1);
});
