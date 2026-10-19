import { Scene, BoxLayer, TextLayer, GroupLayer } from "../index.js";

async function main() {
  const scene = new Scene({
    id: "card_notification",
    name: "Animated UI Card",
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
      background: "#090d16"
    }
  });
  scene.add(bg);

  // Card Container (GroupLayer)
  const card = new GroupLayer({
    id: "card",
    style: {
      left: "380px",
      top: "220px",
      width: "520px",
      height: "280px",
      backgroundColor: "rgba(30, 41, 59, 0.7)",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(16px)",
      overflow: "hidden"
    }
  });

  // Card entrance
  card.animate({
    delay: 200,
    duration: 900,
    ease: [0.16, 1, 0.3, 1],
    from: {
      opacity: 0,
      transform: "translateY(50px) scale(0.92)"
    },
    to: {
      opacity: 1,
      transform: "translateY(0px) scale(1.0)"
    }
  });

  // Header pill badge
  const badge = new BoxLayer({
    id: "card_badge",
    style: {
      left: "36px",
      top: "36px",
      width: "100px",
      height: "28px",
      backgroundColor: "rgba(56, 189, 248, 0.15)",
      borderRadius: "14px",
      border: "1px solid rgba(56, 189, 248, 0.3)"
    }
  });

  const badgeText = new TextLayer({
    id: "badge_text",
    content: "RELEASE v1.0",
    style: {
      left: "36px",
      top: "42px",
      width: "100px",
      textAlign: "center",
      fontSize: "11px",
      fontFamily: "Inter, sans-serif",
      fontWeight: "700",
      letterSpacing: "1px",
      color: "#38bdf8"
    }
  });

  // Card title
  const cardTitle = new TextLayer({
    id: "card_title",
    content: "Keyflow Animation Engine",
    style: {
      left: "36px",
      top: "84px",
      fontSize: "28px",
      fontFamily: "Inter, sans-serif",
      fontWeight: "700",
      color: "#ffffff",
      letterSpacing: "-0.5px"
    }
  });

  cardTitle.animate({
    delay: 450,
    duration: 700,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateX(-20px)" },
    to: { opacity: 1, transform: "translateX(0px)" }
  });

  // Card description
  const cardDesc = new TextLayer({
    id: "card_desc",
    content: "Procedural CSS animations baked directly from code.\nPure performance. Zero runtime simulation lag.",
    style: {
      left: "36px",
      top: "134px",
      fontSize: "16px",
      fontFamily: "Inter, sans-serif",
      color: "#94a3b8",
      lineHeight: "1.6",
      whiteSpace: "pre-line"
    }
  });

  cardDesc.animate({
    delay: 600,
    duration: 700,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(15px)" },
    to: { opacity: 1, transform: "translateY(0px)" }
  });

  // Action Button
  const button = new BoxLayer({
    id: "btn",
    style: {
      left: "36px",
      bottom: "36px",
      width: "160px",
      height: "44px",
      background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
      borderRadius: "10px",
      boxShadow: "0 10px 20px -5px rgba(14, 165, 233, 0.4)"
    }
  });

  const buttonText = new TextLayer({
    id: "btn_text",
    content: "Explore Engine",
    style: {
      left: "36px",
      bottom: "48px",
      width: "160px",
      textAlign: "center",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
      fontWeight: "600",
      color: "#ffffff"
    }
  });

  button.animate({
    delay: 750,
    duration: 600,
    ease: [0.34, 1.56, 0.64, 1],
    from: { opacity: 0, transform: "scale(0.8)" },
    to: { opacity: 1, transform: "scale(1.0)" }
  });

  buttonText.animate({
    delay: 750,
    duration: 600,
    from: { opacity: 0 },
    to: { opacity: 1 }
  });

  card.add(badge, badgeText, cardTitle, cardDesc, button, buttonText);
  scene.add(card);

  // Bake to disk
  const outputPath = process.argv[2] || "examples/card_animation.json";
  const savedPath = await scene.save(outputPath);
  console.log(`[Keyflow] Successfully baked card scene to: ${savedPath}`);
}

main().catch((err) => {
  console.error("[Keyflow] Error generating scene:", err);
  process.exit(1);
});
