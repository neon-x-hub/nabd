import { Scene, BoxLayer, TextLayer, AudioLayer, GroupLayer } from "../index.js";

async function main() {
  const scene = new Scene({
    id: "audio_bounce_showcase",
    name: "Keyflow Audio Engine - Bouncing Orb with SFX",
    dimensions: [1280, 720]
  });

  // 1. Sleek dark background
  const bg = new BoxLayer({
    id: "bg",
    style: {
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
      background: "radial-gradient(circle at 50% 40%, #1e1b4b 0%, #09090b 80%)"
    }
  });
  scene.add(bg);

  // 2. Title & Subtitle (Individually positioned to guarantee clean, non-overlapping typography)
  const title = new TextLayer({
    id: "title",
    content: "KEYFLOW AUDIO ENGINE",
    style: {
      left: "0px",
      top: "65px",
      width: "100%",
      textAlign: "center",
      fontSize: "40px",
      fontFamily: "'Segoe UI', Inter, sans-serif",
      fontWeight: "800",
      letterSpacing: "4px",
      color: "#38bdf8",
      textShadow: "0 0 25px rgba(56, 189, 248, 0.6)"
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

  const subtitle = new TextLayer({
    id: "subtitle",
    content: "Hardware-Accelerated CSS + Multi-Track Native Audio Sync",
    style: {
      left: "0px",
      top: "125px",
      width: "100%",
      textAlign: "center",
      fontSize: "18px",
      fontFamily: "'Segoe UI', Inter, sans-serif",
      fontWeight: "500",
      color: "#94a3b8",
      letterSpacing: "1px"
    }
  });
  subtitle.animate({
    delay: 300,
    duration: 700,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" }
  });
  scene.add(subtitle);

  // 3. Platform Floor
  const platform = new BoxLayer({
    id: "platform",
    style: {
      left: "340px",
      top: "520px",
      width: "600px",
      height: "6px",
      borderRadius: "3px",
      background: "linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)",
      boxShadow: "0 0 30px rgba(56, 189, 248, 0.7)"
    }
  });
  platform.animate({
    delay: 200,
    duration: 600,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scaleX(0.2)" },
    to: { opacity: 1, transform: "scaleX(1)" }
  });
  scene.add(platform);

  // 4. Shockwave Ripple at Floor Impact
  const ripple = new BoxLayer({
    id: "ripple",
    style: {
      left: "590px",
      top: "515px",
      width: "100px",
      height: "16px",
      borderRadius: "50%",
      border: "2px solid #38bdf8",
      boxShadow: "0 0 20px #38bdf8",
      opacity: 0,
      pointerEvents: "none"
    }
  });
  // Triggers exactly on bounce #1 at 900ms
  ripple.animate({
    delay: 900,
    duration: 500,
    ease: "ease-out",
    from: { opacity: 0.9, transform: "scale(0.3)" },
    to: { opacity: 0, transform: "scale(3.2)" }
  });
  scene.add(ripple);

  // 5. Bouncing Neon Orb
  const orb = new BoxLayer({
    id: "orb",
    style: {
      left: "600px",
      top: "440px",
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "radial-gradient(circle at 35% 35%, #67e8f9 0%, #0284c7 70%, #0369a1 100%)",
      boxShadow: "0 0 40px rgba(14, 165, 233, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.5)"
    }
  });

  // Multistage bounce animation
  orb.animate({
    delay: 350,
    duration: 550, // falls from top to floor at 900ms
    ease: [0.55, 0.055, 0.675, 0.19], // accelerating drop
    from: { transform: "translateY(-260px) scale(0.9, 1.1)" },
    to: { transform: "translateY(0px) scale(1.3, 0.7)" } // squash on impact
  });

  // Rebound 1
  orb.animate({
    delay: 900,
    duration: 350,
    ease: [0.215, 0.61, 0.355, 1],
    from: { transform: "translateY(0px) scale(1.3, 0.7)" },
    to: { transform: "translateY(-130px) scale(0.95, 1.05)" }
  });

  // Fall 2 to second impact at 1600ms
  orb.animate({
    delay: 1250,
    duration: 350,
    ease: [0.55, 0.055, 0.675, 0.19],
    from: { transform: "translateY(-130px) scale(0.95, 1.05)" },
    to: { transform: "translateY(0px) scale(1.15, 0.85)" }
  });

  // Rebound 2
  orb.animate({
    delay: 1600,
    duration: 250,
    ease: [0.215, 0.61, 0.355, 1],
    from: { transform: "translateY(0px) scale(1.15, 0.85)" },
    to: { transform: "translateY(-40px) scale(1, 1)" }
  });

  // Final settle at 2100ms
  orb.animate({
    delay: 1850,
    duration: 250,
    ease: "ease-out",
    from: { transform: "translateY(-40px)" },
    to: { transform: "translateY(0px)" }
  });

  // Power Up expansion at 2300ms
  orb.animate({
    delay: 2300,
    duration: 600,
    ease: [0.175, 0.885, 0.32, 1.275],
    from: { transform: "scale(1)" },
    to: { transform: "scale(1.2)" }
  });
  scene.add(orb);

  // 6. Success Badge revealing on PowerUp
  const badge = new GroupLayer({
    id: "badge",
    style: {
      left: "520px",
      top: "560px",
      width: "240px",
      height: "44px",
      borderRadius: "22px",
      background: "rgba(16, 185, 129, 0.15)",
      border: "1px solid rgba(52, 211, 153, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)"
    }
  });

  const badgeText = new TextLayer({
    id: "badge_label",
    content: "AUDIO SYNC VERIFIED",
    style: {
      left: "0px",
      top: "13px",
      width: "100%",
      textAlign: "center",
      fontSize: "13px",
      fontFamily: "'Segoe UI', Inter, sans-serif",
      fontWeight: "700",
      letterSpacing: "2px",
      color: "#6ee7b7"
    }
  });
  badge.add(badgeText);

  badge.animate({
    delay: 2300,
    duration: 700,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scale(0.8) translateY(20px)" },
    to: { opacity: 1, transform: "scale(1.0) translateY(0px)" }
  });
  scene.add(badge);

  // -------------------------------------------------------------
  // 7. Synchronized Audio Tracks (SFX + Ambience)
  // -------------------------------------------------------------

  // Ambient synth hum starting at t = 0ms
  const ambientHum = new AudioLayer({
    id: "sfx_ambience",
    src: "assets/sfx/FreeSFX/GameSFX/Ambience/Retro Ambience Short 09.wav",
    start: 0,
    volume: 0.35,
    duration: 4000
  });
  scene.add(ambientHum);

  // Intro Swoosh as title slides in at t = 100ms
  const swoosh = new AudioLayer({
    id: "sfx_swoosh",
    src: "assets/sfx/FreeSFX/GameSFX/Swoosh/Retro Swooosh 02.wav",
    start: 100,
    volume: 0.65
  });
  scene.add(swoosh);

  // Bounce #1 Impact at exactly t = 900ms (synced with orb drop & floor ripple)
  const bounce1 = new AudioLayer({
    id: "sfx_bounce1",
    src: "assets/sfx/FreeSFX/GameSFX/Bounce Jump/Retro Jump 01.wav",
    start: 900,
    volume: 0.85
  });
  scene.add(bounce1);

  // Bounce #2 Secondary impact at t = 1600ms
  const bounce2 = new AudioLayer({
    id: "sfx_bounce2",
    src: "assets/sfx/FreeSFX/GameSFX/Blops/Retro Blop 07.wav",
    start: 1600,
    volume: 0.90
  });
  scene.add(bounce2);

  // Power-up celebration sound at t = 2300ms
  const powerUp = new AudioLayer({
    id: "sfx_powerup",
    src: "assets/sfx/FreeSFX/GameSFX/PowerUp/Retro PowerUP 09.wav",
    start: 2300,
    volume: 0.80
  });
  scene.add(powerUp);

  // 8. Bake to disk
  const outputPath = await scene.save("examples/audio_bounce.json");
  console.log(`[audio_bounce] Baked scene to: ${outputPath}`);
}

main().catch((err) => {
  console.error("[audio_bounce] Failed to create scene:", err);
  process.exit(1);
});
