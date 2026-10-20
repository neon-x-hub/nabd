import { Scene, BoxLayer, TextLayer, GroupLayer } from "../index.js";

async function main() {
  const scene = new Scene({
    id: "electric_field_deflection",
    name: "Electric Field Deflection of Positive Charge",
    dimensions: [1280, 720]
  });

  // 1. Deep Space Atmospheric Canvas & Grid Background
  const bg = new BoxLayer({
    id: "bg",
    style: {
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
      background: "radial-gradient(ellipse at 50% 45%, #0d1527 0%, #030611 100%)"
    }
  });
  scene.add(bg);

  // Subtle coordinate grid texture
  const gridOverlay = new BoxLayer({
    id: "grid_overlay",
    style: {
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      pointerEvents: "none"
    }
  });
  scene.add(gridOverlay);

  // Ambient glows near electrodes
  const glowTop = new BoxLayer({
    id: "glow_top",
    style: {
      left: "300px",
      top: "140px",
      width: "660px",
      height: "100px",
      background: "radial-gradient(ellipse at center, rgba(239, 68, 68, 0.15) 0%, transparent 70%)",
      filter: "blur(30px)",
      pointerEvents: "none"
    }
  });
  const glowBottom = new BoxLayer({
    id: "glow_bottom",
    style: {
      left: "300px",
      top: "480px",
      width: "660px",
      height: "100px",
      background: "radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, transparent 70%)",
      filter: "blur(30px)",
      pointerEvents: "none"
    }
  });
  scene.add(glowTop, glowBottom);

  // 2. Top Header HUD: Category Pill, Title, Subtitle
  const pillBadge = new TextLayer({
    id: "pill_badge",
    content: "PHYSICS SIMULATION // ELECTROSTATICS",
    style: {
      left: "40px",
      top: "24px",
      padding: "4px 14px",
      backgroundColor: "rgba(56, 189, 248, 0.1)",
      border: "1px solid rgba(56, 189, 248, 0.3)",
      borderRadius: "9999px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "1.5px",
      color: "#38bdf8",
      fontFamily: "monospace"
    }
  });
  pillBadge.animate({
    delay: 50,
    duration: 600,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-10px)" },
    to: { opacity: 1, transform: "translateY(0px)" }
  });
  scene.add(pillBadge);

  const mainTitle = new TextLayer({
    id: "main_title",
    content: "Electric Field Deflection of a Positive Charge",
    style: {
      left: "40px",
      top: "58px",
      fontSize: "27px",
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
    content: "Positive charge (+q) accelerates in the direction of E⃗ toward the negative plate (Cathode)",
    style: {
      left: "40px",
      top: "95px",
      fontSize: "14px",
      color: "#94a3b8",
      fontFamily: "Inter, sans-serif"
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
      top: "22px",
      width: "380px",
      height: "126px",
      backgroundColor: "rgba(15, 23, 42, 0.8)",
      backdropFilter: "blur(12px)",
      borderRadius: "12px",
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
    content: "● LIVE SIMULATION TELEMETRY",
    style: {
      left: "16px",
      top: "12px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "1.5px",
      color: "#38bdf8",
      fontFamily: "monospace"
    }
  });
  const telemRow1 = new TextLayer({
    id: "telem_row1",
    content: "PARTICLE CHARGE:  +1.602 × 10⁻¹⁹ C (Positive)",
    style: { left: "16px", top: "35px", fontSize: "11px", color: "#f8fafc", fontFamily: "monospace" }
  });
  const telemRow2 = new TextLayer({
    id: "telem_row2",
    content: "ELECTRIC FIELD:   5.00 × 10⁴ V/m  [Downwards ↓]",
    style: { left: "16px", top: "55px", fontSize: "11px", color: "#38bdf8", fontFamily: "monospace" }
  });
  const telemRow3 = new TextLayer({
    id: "telem_row3",
    content: "COULOMB FORCE:    Fₑ = +q·E⃗      [Deflects Down]",
    style: { left: "16px", top: "75px", fontSize: "11px", color: "#facc15", fontFamily: "monospace" }
  });
  const telemRow4 = new TextLayer({
    id: "telem_row4",
    content: "TRAJECTORY CURVE: y(t) = ½(qE/m)t² (Parabola)",
    style: { left: "16px", top: "95px", fontSize: "11px", color: "#4ade80", fontFamily: "monospace" }
  });
  telemetryCard.add(telemHeader, telemRow1, telemRow2, telemRow3, telemRow4);
  scene.add(telemetryCard);

  // 4. Capacitor Deflection Plates (Electrodes)
  // Geometry:
  // Upper plate: top: 175px, height: 24px, left: 340px, width: 560px
  // Lower plate: top: 520px, height: 24px, left: 340px, width: 560px
  // Centerline: y = 360px.
  const plateWidth = 560;
  const plateLeft = 340;

  // Upper Plate (Anode +)
  const topPlate = new BoxLayer({
    id: "top_plate",
    style: {
      left: `${plateLeft}px`,
      top: "175px",
      width: `${plateWidth}px`,
      height: "24px",
      background: "linear-gradient(90deg, #991b1b, #ef4444 30%, #f97316 70%, #b91c1c 100%)",
      borderRadius: "6px",
      boxShadow: "0 0 25px rgba(239, 68, 68, 0.45)",
      border: "1px solid rgba(254, 202, 202, 0.3)"
    }
  });
  topPlate.animate({
    delay: 300,
    duration: 800,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scaleX(0.85)" },
    to: { opacity: 1, transform: "scaleX(1.0)" }
  });
  scene.add(topPlate);

  const topPlateLabel = new TextLayer({
    id: "top_plate_label",
    content: "▲ ANODE (+V₀) POSITIVE ELECTRODE ▲",
    style: {
      left: `${plateLeft}px`,
      top: "148px",
      width: `${plateWidth}px`,
      textAlign: "center",
      color: "#fca5a5",
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "2px",
      fontFamily: "Inter, sans-serif"
    }
  });
  topPlateLabel.animate({
    delay: 400,
    duration: 600,
    from: { opacity: 0 },
    to: { opacity: 1 }
  });
  scene.add(topPlateLabel);

  const topPlateSymbols = new TextLayer({
    id: "top_plate_symbols",
    content: "+    +    +    +    +    +    +    +    +    +    +    +    +    +    +",
    style: {
      left: `${plateLeft}px`,
      top: "178px",
      width: `${plateWidth}px`,
      textAlign: "center",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "900",
      fontFamily: "monospace",
      letterSpacing: "4px",
      pointerEvents: "none"
    }
  });
  topPlateSymbols.animate({
    delay: 450,
    duration: 600,
    from: { opacity: 0 },
    to: { opacity: 0.95 }
  });
  scene.add(topPlateSymbols);

  // Lower Plate (Cathode -)
  const bottomPlate = new BoxLayer({
    id: "bottom_plate",
    style: {
      left: `${plateLeft}px`,
      top: "520px",
      width: `${plateWidth}px`,
      height: "24px",
      background: "linear-gradient(90deg, #0369a1, #06b6d4 30%, #3b82f6 70%, #0284c7 100%)",
      borderRadius: "6px",
      boxShadow: "0 0 25px rgba(6, 182, 212, 0.45)",
      border: "1px solid rgba(186, 230, 253, 0.3)"
    }
  });
  bottomPlate.animate({
    delay: 300,
    duration: 800,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scaleX(0.85)" },
    to: { opacity: 1, transform: "scaleX(1.0)" }
  });
  scene.add(bottomPlate);

  const bottomPlateLabel = new TextLayer({
    id: "bottom_plate_label",
    content: "▼ CATHODE (−V₀) NEGATIVE ELECTRODE ▼",
    style: {
      left: `${plateLeft}px`,
      top: "550px",
      width: `${plateWidth}px`,
      textAlign: "center",
      color: "#7dd3fc",
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "2px",
      fontFamily: "Inter, sans-serif"
    }
  });
  bottomPlateLabel.animate({
    delay: 400,
    duration: 600,
    from: { opacity: 0 },
    to: { opacity: 1 }
  });
  scene.add(bottomPlateLabel);

  const bottomPlateSymbols = new TextLayer({
    id: "bottom_plate_symbols",
    content: "−    −    −    −    −    −    −    −    −    −    −    −    −    −    −",
    style: {
      left: `${plateLeft}px`,
      top: "522px",
      width: `${plateWidth}px`,
      textAlign: "center",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "900",
      fontFamily: "monospace",
      letterSpacing: "4px",
      pointerEvents: "none"
    }
  });
  bottomPlateSymbols.animate({
    delay: 450,
    duration: 600,
    from: { opacity: 0 },
    to: { opacity: 0.95 }
  });
  scene.add(bottomPlateSymbols);

  // 5. Electric Field Lines & Dynamic Downward Flux Arrows
  // Field gap spans from y = 199px to y = 520px (height = 321px).
  // Lines point from Positive (+) Anode downwards to Negative (-) Cathode.
  const fieldLineCount = 12;
  const fieldSpacing = Math.round((plateWidth - 60) / (fieldLineCount - 1));

  for (let k = 0; k < fieldLineCount; k++) {
    const xPos = plateLeft + 30 + k * fieldSpacing;

    // Static semi-transparent field line track
    const lineTrack = new BoxLayer({
      id: `field_track_${k}`,
      style: {
        left: `${xPos}px`,
        top: "199px",
        width: "1px",
        height: "321px",
        background: "linear-gradient(to bottom, rgba(239, 68, 68, 0.45) 0%, rgba(56, 189, 248, 0.25) 50%, rgba(6, 182, 212, 0.45) 100%)",
        opacity: 0.65
      }
    });
    scene.add(lineTrack);

    // Dynamic downward pulsing chevron / flux marker along field line
    const fluxArrow = new BoxLayer({
      id: `flux_arrow_${k}`,
      style: {
        left: `${xPos - 4}px`,
        top: "199px",
        width: "8px",
        height: "8px",
        borderRight: "2px solid #38bdf8",
        borderBottom: "2px solid #38bdf8",
        transform: "rotate(45deg)",
        opacity: 0
      }
    });

    fluxArrow.animate({
      delay: 350 + (k * 130) % 650,
      duration: 1600,
      repeat: 3,
      points: [
        { progress: 0.0, css: { opacity: 0, transform: "translateY(10px) rotate(45deg)" } },
        { progress: 0.2, css: { opacity: 0.85 } },
        { progress: 0.8, css: { opacity: 0.85 } },
        { progress: 1.0, css: { opacity: 0, transform: "translateY(280px) rotate(45deg)" } }
      ]
    });
    scene.add(fluxArrow);

    // Subtle Vector labels in the middle section
    if (k === 2 || k === 6 || k === 9) {
      const fieldLabel = new TextLayer({
        id: `field_vector_lbl_${k}`,
        content: "E⃗ ↓",
        style: {
          left: `${xPos + 8}px`,
          top: "260px",
          fontSize: "12px",
          fontWeight: "700",
          fontFamily: "Inter, sans-serif",
          color: "rgba(56, 189, 248, 0.55)",
          textShadow: "0 0 10px rgba(56, 189, 248, 0.3)"
        }
      });
      fieldLabel.animate({
        delay: 500,
        duration: 700,
        from: { opacity: 0 },
        to: { opacity: 0.7 }
      });
      scene.add(fieldLabel);
    }
  }

  // 6. Undeflected Reference Trajectory (Straight line when E = 0)
  const undeflectedLine = new BoxLayer({
    id: "undeflected_line",
    style: {
      left: "100px",
      top: "360px",
      width: "1030px",
      height: "1px",
      borderTop: "1px dashed rgba(148, 163, 184, 0.22)",
      pointerEvents: "none"
    }
  });
  scene.add(undeflectedLine);

  const undeflectedLabel = new TextLayer({
    id: "undeflected_label",
    content: "UNDEFLECTED AXIS (E = 0)",
    style: {
      left: "955px",
      top: "342px",
      fontSize: "10px",
      fontWeight: "700",
      letterSpacing: "1px",
      color: "rgba(148, 163, 184, 0.45)",
      fontFamily: "monospace"
    }
  });
  scene.add(undeflectedLabel);

  // 7. Particle Injector / Ion Gun (Left Assembly)
  const gunChassis = new BoxLayer({
    id: "gun_chassis",
    style: {
      left: "40px",
      top: "310px",
      width: "135px",
      height: "100px",
      background: "linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))",
      border: "1px solid rgba(56, 189, 248, 0.3)",
      borderRadius: "10px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)"
    }
  });
  gunChassis.animate({
    delay: 200,
    duration: 600,
    ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateX(-20px)" },
    to: { opacity: 1, transform: "translateX(0px)" }
  });
  scene.add(gunChassis);

  const gunNozzle = new BoxLayer({
    id: "gun_nozzle",
    style: {
      left: "175px",
      top: "345px",
      width: "30px",
      height: "30px",
      background: "linear-gradient(to right, #334155, #64748b)",
      borderTop: "2px solid #38bdf8",
      borderBottom: "2px solid #38bdf8",
      borderRadius: "0 4px 4px 0"
    }
  });
  scene.add(gunNozzle);

  const gunLed = new BoxLayer({
    id: "gun_led",
    style: {
      left: "55px",
      top: "324px",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "#10b981",
      boxShadow: "0 0 10px #10b981"
    }
  });
  scene.add(gunLed);

  const gunLabel = new TextLayer({
    id: "gun_label",
    content: "ION EMITTER",
    style: {
      left: "70px",
      top: "321px",
      fontSize: "10px",
      fontWeight: "700",
      color: "#38bdf8",
      fontFamily: "monospace"
    }
  });
  const gunVel = new TextLayer({
    id: "gun_vel",
    content: "v₀ = 300 km/s →",
    style: {
      left: "55px",
      top: "348px",
      fontSize: "12px",
      fontWeight: "700",
      color: "#f8fafc",
      fontFamily: "monospace"
    }
  });
  const gunCharge = new TextLayer({
    id: "gun_charge",
    content: "SPECIES: +q (ION)",
    style: {
      left: "55px",
      top: "374px",
      fontSize: "10px",
      fontWeight: "600",
      color: "#fb923c",
      fontFamily: "monospace"
    }
  });
  scene.add(gunLabel, gunVel, gunCharge);

  // 8. Phosphor Detector Screen (Right Target)
  const detectorScreen = new BoxLayer({
    id: "detector_screen",
    style: {
      left: "1135px",
      top: "220px",
      width: "14px",
      height: "340px",
      background: "linear-gradient(to bottom, #064e3b, #10b981 50%, #064e3b)",
      borderRadius: "7px",
      boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
      border: "1px solid rgba(52, 211, 153, 0.6)"
    }
  });
  detectorScreen.animate({
    delay: 300,
    duration: 700,
    from: { opacity: 0 },
    to: { opacity: 1 }
  });
  scene.add(detectorScreen);

  const detectorBacking = new BoxLayer({
    id: "detector_backing",
    style: {
      left: "1149px",
      top: "210px",
      width: "18px",
      height: "360px",
      backgroundColor: "#1e293b",
      borderRadius: "0 8px 8px 0"
    }
  });
  scene.add(detectorBacking);

  // Undeflected marker on screen (y = 360px)
  const markUndeflected = new BoxLayer({
    id: "mark_undeflected",
    style: {
      left: "1122px",
      top: "359px",
      width: "14px",
      height: "2px",
      backgroundColor: "rgba(148, 163, 184, 0.8)"
    }
  });
  const labelUndeflectedMark = new TextLayer({
    id: "lbl_undeflected_mark",
    content: "y₀ = 0",
    style: {
      left: "1074px",
      top: "352px",
      fontSize: "11px",
      color: "rgba(148, 163, 184, 0.8)",
      fontFamily: "monospace"
    }
  });
  scene.add(markUndeflected, labelUndeflectedMark);

  // Deflected marker on screen (y = 516px)
  const markDeflected = new BoxLayer({
    id: "mark_deflected",
    style: {
      left: "1122px",
      top: "515px",
      width: "14px",
      height: "2px",
      backgroundColor: "#f97316",
      boxShadow: "0 0 8px #f97316"
    }
  });
  const labelDeflectedMark = new TextLayer({
    id: "lbl_deflected_mark",
    content: "IMPACT",
    style: {
      left: "1072px",
      top: "508px",
      fontSize: "11px",
      fontWeight: "700",
      color: "#f97316",
      fontFamily: "monospace"
    }
  });
  scene.add(markDeflected, labelDeflectedMark);

  // Deflection dimension bracket on right
  const deflBracket = new BoxLayer({
    id: "defl_bracket",
    style: {
      left: "1176px",
      top: "360px",
      width: "8px",
      height: "156px",
      borderTop: "2px solid #38bdf8",
      borderRight: "2px solid #38bdf8",
      borderBottom: "2px solid #38bdf8"
    }
  });
  const deflBracketLabel = new TextLayer({
    id: "defl_bracket_label",
    content: "Δy = -54.2 mm",
    style: {
      left: "1190px",
      top: "430px",
      fontSize: "11px",
      fontWeight: "700",
      color: "#38bdf8",
      fontFamily: "monospace"
    }
  });
  scene.add(deflBracket, deflBracketLabel);

  // Impact scintillation wave on screen
  const impactBurst = new BoxLayer({
    id: "impact_burst",
    style: {
      left: "1123px",
      top: "501px",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      background: "radial-gradient(circle, #ffffff 0%, #f97316 40%, transparent 80%)",
      opacity: 0,
      transformOrigin: "center center"
    }
  });
  impactBurst.animate({
    delay: 4030,
    duration: 800,
    points: [
      { progress: 0, css: { opacity: 0, transform: "scale(0.2)" } },
      { progress: 0.15, css: { opacity: 1, transform: "scale(1.6)" } },
      { progress: 0.6, css: { opacity: 0.7, transform: "scale(3.2)" } },
      { progress: 1.0, css: { opacity: 0, transform: "scale(4.5)" } }
    ]
  });
  scene.add(impactBurst);

  // 9. Particle Motion Trajectory & Physics Timing Points
  // Total Scene Duration = 5500ms
  // Timeline:
  // tStart = 600ms: emerges from nozzle (x = 100, y = 360)
  // tEnter = 1433ms: enters field (x = 350, y = 360)
  // tExit = 3266ms: exits field (x = 900, y = 445)
  // tHit = 4033ms: hits detector (x = 1130, y = 516.1)
  const tStart = 600;
  const T1 = 833;
  const T2 = 1833;
  const T3 = 767;
  const tHit = 4033;
  const totalDuration = 5500;

  function calculateTrajectoryPoints() {
    const rawPoints = [];

    // Prior to start
    rawPoints.push({ t: 0, x: 100, y: 360, opacity: 0 });
    rawPoints.push({ t: tStart - 60, x: 100, y: 360, opacity: 0 });
    rawPoints.push({ t: tStart, x: 100, y: 360, opacity: 1 });

    // Phase 1: Constant horizontal velocity before field
    const p1Steps = 4;
    for (let i = 1; i <= p1Steps; i++) {
      const t = tStart + (T1 * i) / p1Steps;
      const frac = i / p1Steps;
      const x = 100 + 250 * frac;
      rawPoints.push({ t, x, y: 360, opacity: 1 });
    }

    // Phase 2: Parabolic acceleration inside the field (downward toward negative plate)
    const p2Steps = 14;
    for (let i = 1; i <= p2Steps; i++) {
      const t = tStart + T1 + (T2 * i) / p2Steps;
      const frac = i / p2Steps;
      const x = 350 + 550 * frac;
      const y = 360 + 85 * (frac * frac);
      rawPoints.push({ t, x, y, opacity: 1 });
    }

    // Phase 3: Straight tangential drift after leaving plates
    const p3Steps = 5;
    for (let i = 1; i <= p3Steps; i++) {
      const t = tStart + T1 + T2 + (T3 * i) / p3Steps;
      const frac = i / p3Steps;
      const x = 900 + 230 * frac;
      const y = 445 + 71.1 * frac;
      rawPoints.push({ t, x, y, opacity: 1 });
    }

    // Phase 4: Hold at detector impact
    rawPoints.push({ t: tHit + 100, x: 1130, y: 516.1, opacity: 1 });
    rawPoints.push({ t: totalDuration, x: 1130, y: 516.1, opacity: 1 });

    return rawPoints.map((pt) => ({
      t: pt.t,
      x: pt.x,
      y: pt.y,
      progress: Math.min(1, pt.t / totalDuration),
      css: {
        opacity: pt.opacity,
        transform: `translate(${Math.round(pt.x * 10) / 10}px, ${Math.round(pt.y * 10) / 10}px)`
      }
    }));
  }

  const trajectoryKeyframes = calculateTrajectoryPoints();

  // 10. Persistent Ionized Trajectory Trace Nodes
  // Nodes light up sequentially as the particle travels past, leaving an illuminated history
  const traceSamples = trajectoryKeyframes.filter((pt) => pt.t >= tStart && pt.t <= tHit);
  traceSamples.forEach((sample, idx) => {
    const traceNode = new BoxLayer({
      id: `trace_node_${idx}`,
      style: {
        left: `${Math.round(sample.x - 3)}px`,
        top: `${Math.round(sample.y - 3)}px`,
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: "#f97316",
        boxShadow: "0 0 8px #f97316, 0 0 16px rgba(249, 115, 22, 0.4)",
        opacity: 0,
        pointerEvents: "none"
      }
    });

    traceNode.animate({
      delay: Math.round(sample.t),
      duration: 350,
      from: { opacity: 0, transform: "scale(0.3)" },
      to: { opacity: 0.85, transform: "scale(1.0)" }
    });

    scene.add(traceNode);
  });

  // 11. The Positive Charged Particle Assembly (GroupLayer)
  // The group origin (0, 0) corresponds to the particle center via translate(x, y)
  const particleGroup = new GroupLayer({
    id: "particle_assembly",
    style: {
      left: "0px",
      top: "0px",
      width: "0px",
      height: "0px",
      pointerEvents: "none"
    }
  });

  // Particle Trajectory Animation
  particleGroup.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: trajectoryKeyframes.map((pt) => ({
      progress: pt.progress,
      css: pt.css
    }))
  });

  // Glowing Outer Energy Halo
  const particleHalo = new BoxLayer({
    id: "particle_halo",
    style: {
      left: "-25px",
      top: "-25px",
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(249, 115, 22, 0.5) 0%, rgba(220, 38, 38, 0.2) 50%, transparent 70%)"
    }
  });

  // Radiant Spherical Particle Core
  const particleCore = new BoxLayer({
    id: "particle_core",
    style: {
      left: "-18px",
      top: "-18px",
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #fed7aa 25%, #f97316 65%, #dc2626 100%)",
      boxShadow: "0 0 18px #f97316, 0 0 35px rgba(239, 68, 68, 0.8), inset 0 0 6px #ffffff"
    }
  });

  // Bold Positive Charge Symbol (+)
  const particlePlus = new TextLayer({
    id: "particle_plus",
    content: "+",
    style: {
      left: "-18px",
      top: "-19px",
      width: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      fontWeight: "900",
      fontFamily: "Inter, sans-serif",
      color: "#ffffff",
      textShadow: "0 1px 4px rgba(0, 0, 0, 0.8)",
      lineHeight: "1",
      userSelect: "none"
    }
  });

  // Charge Identifier Pill
  const particleBadge = new TextLayer({
    id: "particle_badge",
    content: "q+ (Ion)",
    style: {
      left: "-35px",
      top: "-44px",
      width: "70px",
      textAlign: "center",
      fontSize: "11px",
      fontWeight: "700",
      fontFamily: "monospace",
      color: "#fde047",
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      padding: "2px 4px",
      borderRadius: "4px",
      border: "1px solid rgba(253, 224, 71, 0.4)"
    }
  });

  // Velocity Vector Arrow (Tangential forward direction)
  const velGroup = new GroupLayer({
    id: "vel_group",
    style: {
      left: "0px",
      top: "0px",
      transformOrigin: "0px 0px"
    }
  });

  // Rotate velocity vector as downward deflection builds up
  velGroup.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: [
      { progress: 0.0, css: { transform: "rotate(0deg)" } },
      { progress: 0.2605, css: { transform: "rotate(0deg)" } },
      { progress: 0.4271, css: { transform: "rotate(8.8deg)" } },
      { progress: 0.5938, css: { transform: "rotate(17.2deg)" } },
      { progress: 1.0, css: { transform: "rotate(17.2deg)" } }
    ]
  });

  const velShaft = new BoxLayer({
    id: "vel_shaft",
    style: {
      left: "20px",
      top: "-2px",
      width: "44px",
      height: "4px",
      backgroundColor: "#38bdf8",
      borderRadius: "2px",
      boxShadow: "0 0 10px rgba(56, 189, 248, 0.6)"
    }
  });
  const velHead = new BoxLayer({
    id: "vel_head",
    style: {
      left: "58px",
      top: "-6px",
      width: "10px",
      height: "10px",
      borderTop: "3px solid #38bdf8",
      borderRight: "3px solid #38bdf8",
      transform: "rotate(45deg)"
    }
  });
  const velLabel = new TextLayer({
    id: "vel_label",
    content: "v⃗",
    style: {
      left: "36px",
      top: "-22px",
      fontSize: "13px",
      fontWeight: "800",
      color: "#38bdf8",
      fontFamily: "Inter, sans-serif",
      textShadow: "0 0 8px rgba(0, 0, 0, 0.9)"
    }
  });
  velGroup.add(velShaft, velHead, velLabel);

  // Electric Force Vector Fe = q·E (Appears only inside the field)
  const forceGroup = new GroupLayer({
    id: "force_group",
    style: {
      left: "0px",
      top: "0px",
      transformOrigin: "top center",
      opacity: 0
    }
  });

  forceGroup.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: [
      { progress: 0.0, css: { opacity: 0, transform: "scaleY(0)" } },
      { progress: 0.258, css: { opacity: 0, transform: "scaleY(0)" } },
      { progress: 0.265, css: { opacity: 1, transform: "scaleY(1)" } },
      { progress: 0.590, css: { opacity: 1, transform: "scaleY(1)" } },
      { progress: 0.598, css: { opacity: 0, transform: "scaleY(0)" } },
      { progress: 1.0, css: { opacity: 0, transform: "scaleY(0)" } }
    ]
  });

  const forceShaft = new BoxLayer({
    id: "force_shaft",
    style: {
      left: "-2px",
      top: "20px",
      width: "4px",
      height: "46px",
      backgroundColor: "#facc15",
      borderRadius: "2px",
      boxShadow: "0 0 10px rgba(250, 204, 21, 0.6)"
    }
  });
  const forceHead = new BoxLayer({
    id: "force_head",
    style: {
      left: "-6px",
      top: "58px",
      width: "12px",
      height: "12px",
      borderRight: "3px solid #facc15",
      borderBottom: "3px solid #facc15",
      transform: "rotate(45deg)"
    }
  });
  const forceLabel = new TextLayer({
    id: "force_label",
    content: "Fₑ = q·E ↓",
    style: {
      left: "14px",
      top: "40px",
      fontSize: "11px",
      fontWeight: "700",
      fontFamily: "Inter, monospace, sans-serif",
      color: "#facc15",
      whiteSpace: "nowrap",
      textShadow: "0 0 8px rgba(0, 0, 0, 0.9)"
    }
  });
  forceGroup.add(forceShaft, forceHead, forceLabel);

  // Add all components into the particle group
  particleGroup.add(
    particleHalo,
    particleCore,
    particlePlus,
    particleBadge,
    velGroup,
    forceGroup
  );
  scene.add(particleGroup);

  // 12. Bottom Scientific Equation & Status Bar
  const bottomStatusBar = new TextLayer({
    id: "bottom_status_bar",
    content: "PHYSICAL EQUATION: Fₑ = m·a = q·E  ⇒  aᵧ = qE/m = CONSTANT  ⇒  PARABOLIC PATH: y(x) = (qE / 2m·v₀²) · x²",
    style: {
      left: "40px",
      bottom: "22px",
      fontSize: "11px",
      color: "rgba(148, 163, 184, 0.75)",
      letterSpacing: "1px",
      fontFamily: "monospace"
    }
  });
  bottomStatusBar.animate({
    delay: 500,
    duration: 800,
    from: { opacity: 0 },
    to: { opacity: 0.85 }
  });
  scene.add(bottomStatusBar);

  // 13. Bake the scene to disk
  const outputPath = process.argv[2] || "examples/electric_field.json";
  const savedPath = await scene.save(outputPath);
  console.log(`[Keyflow] Successfully baked electric field scene to: ${savedPath}`);
}

main().catch((err) => {
  console.error("[Keyflow] Error generating electric field scene:", err);
  process.exit(1);
});
