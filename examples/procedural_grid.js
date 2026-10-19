import { Scene, BoxLayer, TextLayer, GroupLayer } from "../index.js";

async function main() {
  const scene = new Scene({
    id: "procedural_grid",
    name: "Procedural Kinetic Grid",
    dimensions: [1280, 720]
  });

  // 1. Deep Space Background with radial gradient
  const bg = new BoxLayer({
    id: "bg",
    style: {
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
      background: "radial-gradient(circle at 50% 35%, #0d1527 0%, #030712 100%)"
    }
  });
  scene.add(bg);

  // 2. Ambient background decorative glow
  const ambientGlow = new BoxLayer({
    id: "ambient_glow",
    style: {
      left: "340px",
      top: "180px",
      width: "600px",
      height: "400px",
      background: "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 75%)",
      filter: "blur(50px)",
      pointerEvents: "none"
    }
  });
  scene.add(ambientGlow);

  // 3. Category Pill Badge (self-contained styled TextLayer)
  const badge = new TextLayer({
    id: "badge",
    content: "DYNAMIC FIELD SYNTHESIS",
    style: {
      left: "50%",
      top: "40px",
      transform: "translateX(-50%)",
      padding: "6px 20px",
      backgroundColor: "rgba(56, 189, 248, 0.1)",
      border: "1px solid rgba(56, 189, 248, 0.28)",
      borderRadius: "9999px",
      fontSize: "11px",
      fontFamily: "Inter, sans-serif",
      fontWeight: "700",
      letterSpacing: "1.5px",
      color: "#38bdf8",
      whiteSpace: "nowrap",
      textAlign: "center"
    }
  });
  badge.animate({
    delay: 100,
    duration: 600,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateX(-50%) scale(0.85)" },
    to: { opacity: 1, transform: "translateX(-50%) scale(1.0)" }
  });
  scene.add(badge);

  // 4. Staggered Kinetic Title Words (Separated & Equally Spaced with Flexbox)
  const titleWords = ["GENERATIVE", "MATRIX", "ENGINE"];
  const titleGroup = new GroupLayer({
    id: "title_group",
    style: {
      left: "0px",
      top: "88px",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "28px"
    }
  });

  titleWords.forEach((word, idx) => {
    const wordLayer = new TextLayer({
      id: `title_word_${idx}`,
      content: word,
      style: {
        position: "relative",
        display: "inline-block",
        whiteSpace: "nowrap",
        fontSize: "44px",
        fontFamily: "Inter, sans-serif",
        fontWeight: "800",
        letterSpacing: "-0.5px",
        color: idx === 1 ? "#38bdf8" : "#f8fafc",
        textShadow: idx === 1 ? "0 0 30px rgba(56, 189, 248, 0.6)" : "0 2px 10px rgba(0, 0, 0, 0.5)"
      }
    });

    wordLayer.animate({
      delay: 200 + idx * 130,
      duration: 850,
      ease: [0.16, 1, 0.3, 1],
      from: {
        opacity: 0,
        transform: "translateY(35px)",
        filter: "blur(10px)"
      },
      to: {
        opacity: 1,
        transform: "translateY(0px)",
        filter: "blur(0px)"
      }
    });

    titleGroup.add(wordLayer);
  });
  scene.add(titleGroup);

  // 5. Subtitle
  const subtitle = new TextLayer({
    id: "subtitle",
    content: "96 Procedural Nodes · Radial Distance Fields · Hardware Accelerated CSS",
    style: {
      left: "0px",
      top: "155px",
      width: "100%",
      textAlign: "center",
      fontSize: "15px",
      fontFamily: "Inter, sans-serif",
      color: "#94a3b8",
      letterSpacing: "0.2px"
    }
  });
  subtitle.animate({
    delay: 550,
    duration: 700,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(15px)" },
    to: { opacity: 1, transform: "translateY(0px)" }
  });
  scene.add(subtitle);

  // 6. Procedural Kinetic Grid
  const cols = 16;
  const rows = 6;
  const tileSize = 44;
  const gap = 10;
  const gridWidth = cols * (tileSize + gap) - gap;
  const gridHeight = rows * (tileSize + gap) - gap;
  const startX = Math.round((1280 - gridWidth) / 2);
  const startY = 215;

  const centerCol = (cols - 1) / 2;
  const centerRow = (rows - 1) / 2;
  const maxDist = Math.sqrt(centerCol * centerCol + centerRow * centerRow);

  const gridContainer = new GroupLayer({
    id: "grid_container",
    style: {
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${gridWidth}px`,
      height: `${gridHeight}px`
    }
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * (tileSize + gap);
      const y = r * (tileSize + gap);

      // Distance from center of grid for radial wave
      const dx = c - centerCol;
      const dy = r - centerRow;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normDist = dist / maxDist; // 0 (center) to 1 (outer corners)

      // Color gradation radiating outward (cyan to purple)
      const hue = Math.round(190 + normDist * 80);

      const tile = new BoxLayer({
        id: `tile_${r}_${c}`,
        style: {
          left: `${x}px`,
          top: `${y}px`,
          width: `${tileSize}px`,
          height: `${tileSize}px`,
          background: `linear-gradient(135deg, hsl(${hue}, 90%, 65%), hsl(${hue + 25}, 80%, 45%))`,
          borderRadius: "10px",
          boxShadow: `0 4px 15px hsla(${hue}, 90%, 50%, 0.25)`
        }
      });

      // Animation Wave 1: Expanding shockwave from center
      const entranceDelay = 600 + Math.round(dist * 75);
      tile.animate({
        delay: entranceDelay,
        duration: 900,
        ease: [0.34, 1.56, 0.64, 1], // Elastic overshoot pop
        from: {
          opacity: 0,
          transform: "scale(0) rotate(-45deg)"
        },
        to: {
          opacity: 1,
          transform: "scale(1) rotate(0deg)"
        }
      });

      // Animation Wave 2: Harmonic ripple pulse
      const rippleDelay = 2000 + Math.round((c * 0.7 + r) * 60);
      tile.animate({
        delay: rippleDelay,
        duration: 1200,
        ease: [0.42, 0, 0.58, 1],
        repeat: 2,
        points: [
          {
            progress: 0.0,
            css: {
              transform: "scale(1) translateY(0px)",
              borderRadius: "10px"
            }
          },
          {
            progress: 0.35,
            css: {
              transform: `scale(${1.15 + Math.sin(normDist * Math.PI) * 0.2}) translateY(-12px) rotate(8deg)`,
              borderRadius: "50%"
            }
          },
          {
            progress: 0.7,
            css: {
              transform: "scale(0.88) translateY(4px) rotate(-4deg)",
              borderRadius: "12px"
            }
          },
          {
            progress: 1.0,
            css: {
              transform: "scale(1) translateY(0px) rotate(0deg)",
              borderRadius: "10px"
            }
          }
        ]
      });

      gridContainer.add(tile);
    }
  }

  scene.add(gridContainer);

  // 7. Footer stats ticker
  const footerText = new TextLayer({
    id: "footer_stats",
    content: "TOTAL NODES: 96  |  KEYFRAMES: 384  |  RENDER TARGET: 60 FPS",
    style: {
      left: "0px",
      bottom: "35px",
      width: "100%",
      textAlign: "center",
      fontSize: "12px",
      fontFamily: "Inter, monospace, sans-serif",
      color: "rgba(148, 163, 184, 0.65)",
      letterSpacing: "2px"
    }
  });

  footerText.animate({
    delay: 1400,
    duration: 800,
    from: { opacity: 0 },
    to: { opacity: 0.8 }
  });
  scene.add(footerText);

  // 8. Bake scene to disk
  const outputPath = process.argv[2] || "examples/procedural_grid.json";
  const savedPath = await scene.save(outputPath);
  console.log(`[Keyflow] Successfully baked kinetic grid scene to: ${savedPath}`);
}

main().catch((err) => {
  console.error("[Keyflow] Error generating scene:", err);
  process.exit(1);
});
