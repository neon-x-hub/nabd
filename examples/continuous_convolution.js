import { Scene, BoxLayer, TextLayer, GroupLayer } from "../index.js";

// Continuous Mathematical Signal Functions
// f(τ): Bimodal asymmetric Gaussian mixture with smoothly varying non-constant values
function f(tau) {
  const g1 = 0.95 * Math.exp(-Math.pow(tau + 70, 2) / (2 * 40 * 40));
  const g2 = 0.65 * Math.exp(-Math.pow(tau - 70, 2) / (2 * 35 * 35));
  return g1 + g2;
}

// g(τ): Continuous Gaussian kernel (smoothing impulse response)
function g(tau) {
  return Math.exp(-Math.pow(tau, 2) / (2 * 35 * 35));
}

// Exact numerical integration of convolution integral (f * g)(t)
function convolve(t) {
  let sum = 0;
  const dTau = 1;
  for (let tau = -300; tau <= 300; tau += dTau) {
    sum += f(tau) * g(t - tau) * dTau;
  }
  return sum;
}

const maxConvolveVal = 63.51;

// Generate SVG-compatible CSS polygon for stationary bimodal curve f(τ) over [-250, 250]
function generateStationaryPolygon() {
  const pts = [];
  for (let i = 0; i <= 50; i++) {
    const u = i / 50;
    const tau = -250 + 500 * u;
    const val = f(tau);
    const xPct = (u * 100).toFixed(1);
    const yPct = (100 - val * 95).toFixed(1);
    pts.push(`${xPct}% ${yPct}%`);
  }
  return `polygon(0% 100%, ${pts.join(", ")}, 100% 100%)`;
}

// Generate SVG-compatible CSS polygon for sliding Gaussian kernel g(τ) over [-100, 100]
function generateKernelPolygon() {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const tau = -100 + 200 * u;
    const val = g(tau);
    const xPct = (u * 100).toFixed(1);
    const yPct = (100 - val * 95).toFixed(1);
    pts.push(`${xPct}% ${yPct}%`);
  }
  return `polygon(0% 100%, ${pts.join(", ")}, 100% 100%)`;
}

// Generate SVG-compatible CSS polygon for convolved output curve y(t) over [-250, 250]
function generateOutputPolygon() {
  const pts = [];
  for (let i = 0; i <= 50; i++) {
    const u = i / 50;
    const t = -250 + 500 * u;
    const val = convolve(t) / maxConvolveVal;
    const xPct = (u * 100).toFixed(1);
    const yPct = (100 - val * 95).toFixed(1);
    pts.push(`${xPct}% ${yPct}%`);
  }
  return `polygon(0% 100%, ${pts.join(", ")}, 100% 100%)`;
}

async function main() {
  const scene = new Scene({
    id: "continuous_signal_convolution",
    name: "Continuous Signal Convolution (Gaussian Filtering)",
    dimensions: [1280, 720]
  });

  // Total scene timeline: 6000ms (6.0 seconds)
  // Scanner sweep runs from t = -300px (timeMs = 600) to t = +300px (timeMs = 5400)
  // Linear mapping: timeMs = 3000 + 8 * t
  const totalDuration = 6000;

  // 1. Deep Space Atmospheric Canvas & Grid Background
  const bg = new BoxLayer({
    id: "bg",
    style: {
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
      background: "radial-gradient(ellipse at 50% 50%, #0d1527 0%, #030712 100%)"
    }
  });
  scene.add(bg);

  const gridOverlay = new BoxLayer({
    id: "grid_overlay",
    style: {
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      pointerEvents: "none"
    }
  });
  scene.add(gridOverlay);

  // Ambient glows behind upper and lower graph domains
  const ambientTop = new BoxLayer({
    id: "ambient_top",
    style: {
      left: "380px",
      top: "160px",
      width: "520px",
      height: "180px",
      background: "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.12) 0%, transparent 70%)",
      filter: "blur(40px)",
      pointerEvents: "none"
    }
  });
  const ambientBottom = new BoxLayer({
    id: "ambient_bottom",
    style: {
      left: "380px",
      top: "430px",
      width: "520px",
      height: "180px",
      background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
      filter: "blur(40px)",
      pointerEvents: "none"
    }
  });
  scene.add(ambientTop, ambientBottom);

  // 2. Header HUD: Category Pill, Main Title, Subtitle
  const categoryPill = new TextLayer({
    id: "category_pill",
    content: "CONTINUOUS DSP // GAUSSIAN KERNEL CONVOLUTION",
    style: {
      left: "60px",
      top: "22px",
      padding: "4px 14px",
      backgroundColor: "rgba(56, 189, 248, 0.12)",
      border: "1px solid rgba(56, 189, 248, 0.3)",
      borderRadius: "9999px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "1.5px",
      color: "#38bdf8",
      fontFamily: "monospace"
    }
  });
  categoryPill.animate({
    delay: 50,
    duration: 600,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-10px)" },
    to: { opacity: 1, transform: "translateY(0px)" }
  });
  scene.add(categoryPill);

  const mainTitle = new TextLayer({
    id: "main_title",
    content: "Continuous Signal Convolution & Filtering",
    style: {
      left: "60px",
      top: "54px",
      fontSize: "26px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
      color: "#f8fafc",
      fontFamily: "Inter, sans-serif"
    }
  });
  mainTitle.animate({
    delay: 150,
    duration: 700,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-15px)" },
    to: { opacity: 1, transform: "translateY(0px)" }
  });
  scene.add(mainTitle);

  const subtitle = new TextLayer({
    id: "subtitle",
    content: "Non-constant continuous signals: Bimodal Waveform f(τ) convolved with Gaussian smoothing kernel g(t − τ)",
    style: {
      left: "60px",
      top: "92px",
      fontSize: "13px",
      color: "#94a3b8",
      fontFamily: "Inter, monospace, sans-serif"
    }
  });
  subtitle.animate({
    delay: 250,
    duration: 700,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-10px)" },
    to: { opacity: 1, transform: "translateY(0px)" }
  });
  scene.add(subtitle);

  // 3. Telemetry HUD Card (Top Right)
  const telemetryCard = new GroupLayer({
    id: "telemetry_card",
    style: {
      left: "860px",
      top: "20px",
      width: "360px",
      height: "115px",
      backgroundColor: "rgba(15, 23, 42, 0.8)",
      backdropFilter: "blur(12px)",
      borderRadius: "10px",
      border: "1px solid rgba(56, 189, 248, 0.22)",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
    }
  });
  telemetryCard.animate({
    delay: 200,
    duration: 750,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-15px)" },
    to: { opacity: 1, transform: "translateY(0px)" }
  });

  const telemHeader = new TextLayer({
    id: "telem_header",
    content: "● LIVE CONTINUOUS INTEGRAL TELEMETRY",
    style: {
      left: "14px",
      top: "10px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "1.2px",
      color: "#38bdf8",
      fontFamily: "monospace"
    }
  });
  const telemRow1 = new TextLayer({
    id: "telem_row1",
    content: "SIGNAL f(τ):   Bimodal Double-Gaussian",
    style: { left: "14px", top: "32px", fontSize: "11px", color: "#38bdf8", fontFamily: "monospace" }
  });
  const telemRow2 = new TextLayer({
    id: "telem_row2",
    content: "KERNEL g(t−τ): Sliding Gaussian exp(−τ²/2σ²)",
    style: { left: "14px", top: "52px", fontSize: "11px", color: "#f59e0b", fontFamily: "monospace" }
  });
  const telemRow3 = new TextLayer({
    id: "telem_row3",
    content: "INTEGRAL:      y(t) = ∫ f(τ) · g(t − τ) dτ",
    style: { left: "14px", top: "72px", fontSize: "11px", color: "#4ade80", fontFamily: "monospace" }
  });
  const telemRow4 = new TextLayer({
    id: "telem_row4",
    content: "SMOOTHING:     Low-pass filtered continuous response",
    style: { left: "14px", top: "92px", fontSize: "11px", color: "#e2e8f0", fontFamily: "monospace" }
  });
  telemetryCard.add(telemHeader, telemRow1, telemRow2, telemRow3, telemRow4);
  scene.add(telemetryCard);

  // 4. TOP GRAPH PANEL: Integration Domain (τ-axis)
  // Panel dimensions: 1160px wide, 215px high (y = 145px to 360px)
  // Centerline at x = 640px (τ = 0). Baseline at y = 325px.
  const panelTop = new BoxLayer({
    id: "panel_top",
    style: {
      left: "60px",
      top: "145px",
      width: "1160px",
      height: "215px",
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(8px)",
      borderRadius: "12px",
      border: "1px solid rgba(56, 189, 248, 0.2)",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)"
    }
  });
  panelTop.animate({
    delay: 150,
    duration: 700,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scale(0.98)" },
    to: { opacity: 1, transform: "scale(1.0)" }
  });
  scene.add(panelTop);

  const panelTopBadge = new TextLayer({
    id: "panel_top_badge",
    content: "1. INTEGRATION DOMAIN // τ-AXIS (CONTINUOUS CURVES f(τ) & g(t−τ))",
    style: {
      left: "80px",
      top: "160px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "1.2px",
      color: "#38bdf8",
      fontFamily: "monospace"
    }
  });
  scene.add(panelTopBadge);

  // Horizontal τ-axis line
  const tauAxis = new BoxLayer({
    id: "tau_axis",
    style: {
      left: "100px",
      top: "325px",
      width: "1080px",
      height: "2px",
      backgroundColor: "rgba(148, 163, 184, 0.35)"
    }
  });
  scene.add(tauAxis);

  // τ-Axis Tick Marks and Labels
  const tauTicks = [
    { x: 440, label: "−200" },
    { x: 540, label: "−100" },
    { x: 640, label: "0 (τ)", isCenter: true },
    { x: 740, label: "+100" },
    { x: 840, label: "+200" }
  ];

  tauTicks.forEach((tick, idx) => {
    const tickMark = new BoxLayer({
      id: `tau_tick_${idx}`,
      style: {
        left: `${tick.x}px`,
        top: "323px",
        width: "2px",
        height: "8px",
        backgroundColor: tick.isCenter ? "#38bdf8" : "rgba(148, 163, 184, 0.5)"
      }
    });
    const tickLabel = new TextLayer({
      id: `tau_label_${idx}`,
      content: tick.label,
      style: {
        left: `${tick.x - 25}px`,
        top: "335px",
        width: "50px",
        textAlign: "center",
        fontSize: "11px",
        fontFamily: "monospace",
        fontWeight: tick.isCenter ? "700" : "500",
        color: tick.isCenter ? "#38bdf8" : "#94a3b8"
      }
    });
    scene.add(tickMark, tickLabel);
  });

  // Stationary Signal f(τ): Continuous Bimodal Curve
  // Spans x = 390px to 890px (width = 500px, centered at x = 640px). Height = 120px (top = 205px to 325px).
  const stationaryCurve = new BoxLayer({
    id: "stationary_curve",
    style: {
      left: "390px",
      top: "205px",
      width: "500px",
      height: "120px",
      background: "linear-gradient(to top, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.55))",
      clipPath: generateStationaryPolygon(),
      borderBottom: "2px solid #06b6d4"
    }
  });
  stationaryCurve.animate({
    delay: 300,
    duration: 800,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scaleY(0)" },
    to: { opacity: 1, transform: "scaleY(1)" }
  });
  scene.add(stationaryCurve);

  // Peak Annotations on Stationary Curve
  const peak1Label = new TextLayer({
    id: "peak1_label",
    content: "Peak 1 (A = 0.95)",
    style: {
      left: "520px",
      top: "185px",
      width: "100px",
      textAlign: "center",
      fontSize: "10px",
      fontWeight: "700",
      color: "#06b6d4",
      fontFamily: "monospace"
    }
  });
  const peak2Label = new TextLayer({
    id: "peak2_label",
    content: "Peak 2 (A = 0.65)",
    style: {
      left: "660px",
      top: "215px",
      width: "100px",
      textAlign: "center",
      fontSize: "10px",
      fontWeight: "700",
      color: "#06b6d4",
      fontFamily: "monospace"
    }
  });
  scene.add(peak1Label, peak2Label);

  // Sliding Continuous Gaussian Kernel g(t − τ)
  // Width = 200px, Height = 120px. Centered at sliding position x(t).
  // At t = -300px, center is at x = 340px (left = 240px).
  // At t = +300px, center is at x = 940px (left = 840px).
  const slidingKernel = new BoxLayer({
    id: "sliding_kernel",
    style: {
      left: "240px",
      top: "205px",
      width: "200px",
      height: "120px",
      background: "linear-gradient(to top, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.7))",
      clipPath: generateKernelPolygon(),
      borderBottom: "2px solid #f59e0b"
    }
  });

  slidingKernel.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: [
      { progress: 0.0, css: { transform: "translateX(0px)", opacity: 0 } },
      { progress: 550 / 6000, css: { transform: "translateX(0px)", opacity: 0 } },
      { progress: 600 / 6000, css: { transform: "translateX(0px)", opacity: 1 } },
      { progress: 5400 / 6000, css: { transform: "translateX(600px)", opacity: 1 } },
      { progress: 1.0, css: { transform: "translateX(600px)", opacity: 1 } }
    ]
  });
  scene.add(slidingKernel);

  const slidingLabel = new TextLayer({
    id: "sliding_label",
    content: "g(t − τ) [GAUSSIAN KERNEL]",
    style: {
      left: "240px",
      top: "185px",
      width: "200px",
      textAlign: "center",
      fontSize: "11px",
      fontWeight: "700",
      color: "#f59e0b",
      fontFamily: "Inter, monospace, sans-serif",
      textShadow: "0 0 10px rgba(245, 158, 11, 0.6)"
    }
  });
  slidingLabel.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: [
      { progress: 0.0, css: { transform: "translateX(0px)", opacity: 0 } },
      { progress: 550 / 6000, css: { transform: "translateX(0px)", opacity: 0 } },
      { progress: 600 / 6000, css: { transform: "translateX(0px)", opacity: 1 } },
      { progress: 5400 / 6000, css: { transform: "translateX(600px)", opacity: 1 } },
      { progress: 1.0, css: { transform: "translateX(600px)", opacity: 1 } }
    ]
  });
  scene.add(slidingLabel);

  // Dynamic Multiplicative Overlap Product: f(τ) · g(t − τ)
  // Width: 180px, Height: 120px. Centered at sliding position x(t).
  // Dynamically scales in height with the instantaneous convolution value y(t)
  const productKeyframes = [];
  for (let t = -300; t <= 300; t += 20) {
    const timeMs = 3000 + 8 * t;
    const shiftX = t + 300; // 0 to 600px
    const val = convolve(t) / maxConvolveVal;
    const scaleY = Math.max(0.01, val).toFixed(3);
    const opacity = (val > 0.04 ? 0.9 : 0).toFixed(2);
    productKeyframes.push({
      progress: Math.min(1, Math.max(0, timeMs / totalDuration)),
      css: {
        transform: `translateX(${shiftX}px) scaleY(${scaleY})`,
        opacity
      }
    });
  }

  const overlapProduct = new BoxLayer({
    id: "overlap_product",
    style: {
      left: "250px",
      top: "205px",
      width: "180px",
      height: "120px",
      background: "linear-gradient(to top, rgba(16, 185, 129, 0.25), rgba(74, 222, 128, 0.85))",
      clipPath: generateKernelPolygon(),
      transformOrigin: "bottom center",
      opacity: 0,
      pointerEvents: "none"
    }
  });

  overlapProduct.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: productKeyframes
  });
  scene.add(overlapProduct);

  // Floating tag above overlap product
  const productTag = new TextLayer({
    id: "product_tag",
    content: "Area = ∫ f·g dτ",
    style: {
      left: "270px",
      top: "250px",
      width: "140px",
      textAlign: "center",
      fontSize: "11px",
      fontWeight: "800",
      fontFamily: "monospace",
      color: "#ffffff",
      textShadow: "0 0 10px rgba(16, 185, 129, 0.9)",
      opacity: 0
    }
  });
  productTag.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: [
      { progress: 0.0, css: { transform: "translateX(0px)", opacity: 0 } },
      { progress: 1400 / 6000, css: { transform: "translateX(100px)", opacity: 0 } },
      { progress: 1800 / 6000, css: { transform: "translateX(150px)", opacity: 1 } },
      { progress: 4400 / 6000, css: { transform: "translateX(475px)", opacity: 1 } },
      { progress: 4800 / 6000, css: { transform: "translateX(525px)", opacity: 0 } },
      { progress: 1.0, css: { transform: "translateX(600px)", opacity: 0 } }
    ]
  });
  scene.add(productTag);

  // 5. VERTICAL PROJECTION LASER BEAM (Linking t-shift to convolved output)
  // Spans from y = 160px down to y = 590px (height = 430px).
  // Follows the center of the sliding kernel: x = 340px to x = 940px.
  const laserBeam = new BoxLayer({
    id: "laser_beam",
    style: {
      left: "340px",
      top: "160px",
      width: "2px",
      height: "430px",
      background: "linear-gradient(to bottom, rgba(245, 158, 11, 0.8), rgba(56, 189, 248, 0.5) 40%, rgba(16, 185, 129, 0.9) 100%)",
      boxShadow: "0 0 12px rgba(56, 189, 248, 0.7)",
      opacity: 0,
      pointerEvents: "none"
    }
  });
  laserBeam.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: [
      { progress: 0.0, css: { transform: "translateX(0px)", opacity: 0 } },
      { progress: 550 / 6000, css: { transform: "translateX(0px)", opacity: 0 } },
      { progress: 600 / 6000, css: { transform: "translateX(0px)", opacity: 0.85 } },
      { progress: 5400 / 6000, css: { transform: "translateX(600px)", opacity: 0.85 } },
      { progress: 1.0, css: { transform: "translateX(600px)", opacity: 0.85 } }
    ]
  });
  scene.add(laserBeam);

  const laserBadge = new TextLayer({
    id: "laser_badge",
    content: "t (shift)",
    style: {
      left: "316px",
      top: "594px",
      width: "50px",
      textAlign: "center",
      fontSize: "10px",
      fontWeight: "700",
      fontFamily: "monospace",
      color: "#fde047",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      padding: "1px 4px",
      borderRadius: "4px",
      border: "1px solid rgba(253, 224, 71, 0.4)",
      opacity: 0
    }
  });
  laserBadge.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: [
      { progress: 0.0, css: { transform: "translateX(0px)", opacity: 0 } },
      { progress: 550 / 6000, css: { transform: "translateX(0px)", opacity: 0 } },
      { progress: 600 / 6000, css: { transform: "translateX(0px)", opacity: 1 } },
      { progress: 5400 / 6000, css: { transform: "translateX(600px)", opacity: 1 } },
      { progress: 1.0, css: { transform: "translateX(600px)", opacity: 1 } }
    ]
  });
  scene.add(laserBadge);

  // 6. BOTTOM GRAPH PANEL: Convolution Output Domain (t-axis)
  // Panel dimensions: 1160px wide, 240px high (y = 380px to 620px).
  // Baseline at y = 590px. Peak at y = 475px (height = 115px).
  const panelBottom = new BoxLayer({
    id: "panel_bottom",
    style: {
      left: "60px",
      top: "380px",
      width: "1160px",
      height: "240px",
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(8px)",
      borderRadius: "12px",
      border: "1px solid rgba(16, 185, 129, 0.22)",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)"
    }
  });
  panelBottom.animate({
    delay: 200,
    duration: 700,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scale(0.98)" },
    to: { opacity: 1, transform: "scale(1.0)" }
  });
  scene.add(panelBottom);

  const panelBottomBadge = new TextLayer({
    id: "panel_bottom_badge",
    content: "2. CONVOLUTION OUTPUT DOMAIN // t-AXIS (SMOOTHED CONTINUOUS WAVEFORM y(t))",
    style: {
      left: "80px",
      top: "395px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "1.2px",
      color: "#34d399",
      fontFamily: "monospace"
    }
  });
  scene.add(panelBottomBadge);

  const outputFormulaLabel = new TextLayer({
    id: "output_formula_label",
    content: "y(t) = (f ∗ g)(t) = ∫ f(τ) · g(t − τ) dτ  [Filtered Continuous Waveform]",
    style: {
      left: "80px",
      top: "418px",
      fontSize: "13px",
      fontWeight: "700",
      letterSpacing: "0.5px",
      color: "#4ade80",
      fontFamily: "Inter, monospace, sans-serif"
    }
  });
  scene.add(outputFormulaLabel);

  // Horizontal t-axis line
  const tAxis = new BoxLayer({
    id: "t_axis",
    style: {
      left: "100px",
      top: "590px",
      width: "1080px",
      height: "2px",
      backgroundColor: "rgba(148, 163, 184, 0.35)"
    }
  });
  scene.add(tAxis);

  // t-Axis Tick Marks and Labels
  const tTicks = [
    { x: 440, label: "−200" },
    { x: 540, label: "−100" },
    { x: 640, label: "0 (t)", isCenter: true },
    { x: 740, label: "+100" },
    { x: 840, label: "+200" }
  ];

  tTicks.forEach((tick, idx) => {
    const tickMark = new BoxLayer({
      id: `t_tick_${idx}`,
      style: {
        left: `${tick.x}px`,
        top: "588px",
        width: "2px",
        height: "8px",
        backgroundColor: tick.isCenter ? "#34d399" : "rgba(148, 163, 184, 0.5)"
      }
    });
    const tickLabel = new TextLayer({
      id: `t_label_${idx}`,
      content: tick.label,
      style: {
        left: `${tick.x - 25}px`,
        top: "600px",
        width: "50px",
        textAlign: "center",
        fontSize: "11px",
        fontFamily: "monospace",
        fontWeight: tick.isCenter ? "700" : "500",
        color: tick.isCenter ? "#34d399" : "#94a3b8"
      }
    });
    scene.add(tickMark, tickLabel);
  });

  // Theoretical Continuous Convolved Envelope Backdrop
  // Spans x = 390px to 890px (width = 500px), height = 120px (top = 475px to 590px)
  const convolvedBackdrop = new BoxLayer({
    id: "convolved_backdrop",
    style: {
      left: "390px",
      top: "475px",
      width: "500px",
      height: "115px",
      background: "linear-gradient(to top, rgba(16, 185, 129, 0.12), rgba(74, 222, 128, 0.32))",
      clipPath: generateOutputPolygon(),
      opacity: 0.85
    }
  });
  scene.add(convolvedBackdrop);

  // 7. REAL-TIME DISCRETE SAMPLING PILLARS
  // 26 vertical harmonic sample pillars across the continuous convolution support [390px, 890px]
  // As the laser cursor reaches each x_k at triggerTime, pillar k rises up from the baseline!
  const pillarCount = 26;
  const pillarSpacing = 20;

  for (let k = 0; k < pillarCount; k++) {
    const xPos = 390 + k * pillarSpacing;
    const tVal = xPos - 640; // t in [-250, 250]
    const normHeight = convolve(tVal) / maxConvolveVal;
    const pillarHeight = Math.max(3, Math.round(115 * normHeight));
    const yTop = 590 - pillarHeight;

    // Progressive hue based on convolution amplitude
    const hue = Math.round(175 - normHeight * 80);

    const pillar = new BoxLayer({
      id: `pillar_${k}`,
      style: {
        left: `${xPos - 7}px`,
        top: `${yTop}px`,
        width: "14px",
        height: `${pillarHeight}px`,
        background: `linear-gradient(to top, hsla(${hue}, 85%, 45%, 0.55), hsla(${hue}, 90%, 65%, 0.95))`,
        borderRadius: "2px 2px 0 0",
        boxShadow: `0 0 10px hsla(${hue}, 85%, 55%, 0.4)`,
        transformOrigin: "bottom center",
        opacity: 0
      }
    });

    const triggerTime = Math.round(3000 + 8 * tVal);

    pillar.animate({
      delay: Math.max(0, triggerTime),
      duration: 260,
      ease: [0.16, 1, 0.3, 1],
      from: { transform: "scaleY(0)", opacity: 0 },
      to: { transform: "scaleY(1)", opacity: 0.85 }
    });

    scene.add(pillar);
  }

  // 8. DYNAMIC CONTINUOUS WAVEFORM TRACER CURSOR
  // Follows the exact mathematical trajectory of the convolved curve
  const tracerGroup = new GroupLayer({
    id: "tracer_group",
    style: {
      left: "0px",
      top: "0px",
      width: "0px",
      height: "0px",
      pointerEvents: "none"
    }
  });

  function calculateContinuousTracerPath() {
    const pts = [];
    pts.push({ progress: 0.0, css: { transform: "translate(340px, 590px)", opacity: 0 } });
    pts.push({ progress: 550 / 6000, css: { transform: "translate(340px, 590px)", opacity: 0 } });
    pts.push({ progress: 600 / 6000, css: { transform: "translate(340px, 590px)", opacity: 1 } });

    for (let t = -300; t <= 300; t += 15) {
      const timeMs = 3000 + 8 * t;
      const x = 640 + t;
      const val = convolve(t) / maxConvolveVal;
      const y = 590 - 115 * val;
      pts.push({
        progress: Math.min(1, Math.max(0, timeMs / totalDuration)),
        css: {
          transform: `translate(${Math.round(x)}px, ${Math.round(y)}px)`,
          opacity: 1
        }
      });
    }

    pts.push({ progress: 5400 / 6000, css: { transform: "translate(940px, 590px)", opacity: 1 } });
    pts.push({ progress: 1.0, css: { transform: "translate(940px, 590px)", opacity: 1 } });
    return pts;
  }

  tracerGroup.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: calculateContinuousTracerPath()
  });

  const tracerOrb = new BoxLayer({
    id: "tracer_orb",
    style: {
      left: "-8px",
      top: "-8px",
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      backgroundColor: "#ffffff",
      boxShadow: "0 0 15px #4ade80, 0 0 30px #10b981",
      border: "2px solid #22c55e"
    }
  });

  const tracerLabel = new TextLayer({
    id: "tracer_label",
    content: "y(t)",
    style: {
      left: "-20px",
      top: "-26px",
      width: "40px",
      textAlign: "center",
      fontSize: "12px",
      fontWeight: "800",
      color: "#4ade80",
      fontFamily: "Inter, monospace, sans-serif",
      textShadow: "0 0 8px rgba(0, 0, 0, 0.9)"
    }
  });

  tracerGroup.add(tracerOrb, tracerLabel);
  scene.add(tracerGroup);

  // 9. FIVE CONVOLUTION PHASES STATUS BAR
  const phases = [
    { id: "phase_1", text: "1. TAIL APPROACH (t < −150)", start: 600, end: 1800 },
    { id: "phase_2", text: "2. PRIMARY CREST (−150 ≤ t ≤ −30)", start: 1800, end: 2760 },
    { id: "phase_3", text: "3. VALLEY SADDLE (−30 < t < +30)", start: 2760, end: 3240 },
    { id: "phase_4", text: "4. SECONDARY CREST (+30 ≤ t ≤ +150)", start: 3240, end: 4200 },
    { id: "phase_5", text: "5. TAIL DEPARTURE (t > +150)", start: 4200, end: 5400 }
  ];

  const phaseBarWidth = 220;
  const phaseGap = 12;
  const phaseStartX = 60;

  phases.forEach((p, idx) => {
    const pX = phaseStartX + idx * (phaseBarWidth + phaseGap);
    const phasePill = new TextLayer({
      id: `pill_${p.id}`,
      content: p.text,
      style: {
        left: `${pX}px`,
        top: "632px",
        width: `${phaseBarWidth}px`,
        textAlign: "center",
        fontSize: "10px",
        fontWeight: "700",
        fontFamily: "monospace",
        padding: "5px 0px",
        borderRadius: "6px",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        color: "#64748b"
      }
    });

    const pStartFrac = p.start / totalDuration;
    const pEndFrac = p.end / totalDuration;

    phasePill.animate({
      delay: 0,
      duration: totalDuration,
      ease: "linear",
      points: [
        { progress: 0.0, css: { opacity: 0.4, borderColor: "rgba(148, 163, 184, 0.2)", color: "#64748b" } },
        { progress: Math.max(0, pStartFrac - 0.01), css: { opacity: 0.4, borderColor: "rgba(148, 163, 184, 0.2)", color: "#64748b" } },
        { progress: pStartFrac, css: { opacity: 1.0, borderColor: "#38bdf8", color: "#38bdf8", backgroundColor: "rgba(56, 189, 248, 0.15)" } },
        { progress: pEndFrac, css: { opacity: 1.0, borderColor: "#38bdf8", color: "#38bdf8", backgroundColor: "rgba(56, 189, 248, 0.15)" } },
        { progress: Math.min(1, pEndFrac + 0.01), css: { opacity: 0.4, borderColor: "rgba(148, 163, 184, 0.2)", color: "#64748b", backgroundColor: "rgba(15, 23, 42, 0.6)" } },
        { progress: 1.0, css: { opacity: 0.4, borderColor: "rgba(148, 163, 184, 0.2)", color: "#64748b" } }
      ]
    });

    scene.add(phasePill);
  });

  // 10. Bottom Mathematical Theory Bar
  const theoryBar = new TextLayer({
    id: "theory_bar",
    content: "LTI SYSTEM PROPERTY: Continuous convolution smooths sharp signal variations · Output variance: σ_out² = σ_in² + σ_kernel²",
    style: {
      left: "60px",
      bottom: "22px",
      fontSize: "11px",
      color: "rgba(148, 163, 184, 0.7)",
      letterSpacing: "0.8px",
      fontFamily: "monospace"
    }
  });
  theoryBar.animate({
    delay: 500,
    duration: 700,
    from: { opacity: 0 },
    to: { opacity: 0.85 }
  });
  scene.add(theoryBar);

  // 11. Bake the scene to disk
  const outputPath = process.argv[2] || "examples/continuous_convolution.json";
  const savedPath = await scene.save(outputPath);
  console.log(`[Keyflow] Successfully baked continuous convolution scene to: ${savedPath}`);
}

main().catch((err) => {
  console.error("[Keyflow] Error generating continuous convolution scene:", err);
  process.exit(1);
});
