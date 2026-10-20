import { Scene, BoxLayer, TextLayer, GroupLayer } from "../index.js";

// Kinematics and Simulation Parameters
const yPivot = 490; // Y coordinate of cart pivot on canvas
const L1 = 150;     // Lower link length (pixels)
const L2 = 130;     // Upper link length (pixels)
const totalDuration = 6000; // 6.0 seconds

// Dynamic closed-loop LQR response of inverted double pendulum to disturbance tap
function getSimulationState(t) {
  let cartX = 640;
  let theta1 = 0; // deg
  let theta2 = 0; // deg
  let controlForce = 0; // -1 to +1 normalized

  if (t < 800) {
    // Phase 1: Micro-balancing jitter around vertical
    theta1 = 0.35 * Math.sin(t * 0.01);
    theta2 = -0.55 * Math.sin(t * 0.015);
    cartX = 640 + 3.5 * Math.sin(t * 0.008);
    controlForce = -0.05 * Math.sin(t * 0.01);
  } else if (t < 1100) {
    // Phase 2: Disturbance impulse tap knocking tip to the right
    const tau = (t - 800) / 300;
    theta2 = 18 * Math.sin(tau * Math.PI * 0.5);
    theta1 = -7 * Math.sin(tau * Math.PI * 0.5);
    cartX = 640 + 10 * tau;
    controlForce = 0.8 * tau;
  } else if (t < 4800) {
    // Phases 3 & 4: Active LQR counter-maneuver and damped stabilization
    const tau = (t - 1100) / 3700;
    const decay = Math.exp(-3.2 * tau);
    const freq = 12 * Math.PI * tau;
    theta2 = 18 * decay * Math.cos(freq);
    theta1 = -9 * decay * Math.cos(freq + 0.6);
    cartX = 640 + 110 * decay * Math.sin(freq * 0.8);
    controlForce = -1.0 * decay * Math.sin(freq * 0.8 + 0.3);
  } else {
    // Phase 5: Restabilized upright equilibrium
    theta1 = 0;
    theta2 = 0;
    cartX = 640;
    controlForce = 0;
  }

  const r1 = (theta1 * Math.PI) / 180;
  const r2 = (theta2 * Math.PI) / 180;
  const x1 = cartX + L1 * Math.sin(r1);
  const y1 = yPivot - L1 * Math.cos(r1);
  const x2 = x1 + L2 * Math.sin(r2);
  const y2 = y1 - L2 * Math.cos(r2);

  return { t, cartX, theta1, theta2, controlForce, x1, y1, x2, y2 };
}

async function main() {
  const scene = new Scene({
    id: "inverted_double_pendulum_balancing",
    name: "Inverted Double Pendulum Balancing & LQR Control",
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
      background: "radial-gradient(ellipse at 50% 50%, #0b1329 0%, #030712 100%)"
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

  // Ambient backlights behind balancing envelope and rail
  const ambientGlowTop = new BoxLayer({
    id: "ambient_glow_top",
    style: {
      left: "440px",
      top: "160px",
      width: "400px",
      height: "220px",
      background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.14) 0%, transparent 70%)",
      filter: "blur(40px)",
      pointerEvents: "none"
    }
  });
  const ambientGlowCart = new BoxLayer({
    id: "ambient_glow_cart",
    style: {
      left: "440px",
      top: "440px",
      width: "400px",
      height: "140px",
      background: "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.15) 0%, transparent 70%)",
      filter: "blur(35px)",
      pointerEvents: "none"
    }
  });
  scene.add(ambientGlowTop, ambientGlowCart);

  // 2. Header HUD: Category Pill, Main Title, Subtitle
  const categoryPill = new TextLayer({
    id: "category_pill",
    content: "NONLINEAR ROBOTICS // LQR OPTIMAL CONTROL",
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
    content: "Inverted Double Pendulum Balancing & Recovery",
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
    content: "Underactuated dynamic balancing on a motorized cart · Real-time stabilization: u(t) = −K·x",
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
      height: "120px",
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
    content: "● LIVE LQR CONTROLLER TELEMETRY",
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
    content: "STATE:    x = [x, ẋ, θ₁, θ̇₁, θ₂, θ̇₂]ᵀ (6-DOF)",
    style: { left: "14px", top: "32px", fontSize: "11px", color: "#38bdf8", fontFamily: "monospace" }
  });
  const telemRow2 = new TextLayer({
    id: "telem_row2",
    content: "CONTROL:  u(t) = −K·x  [Linear Motor Force]",
    style: { left: "14px", top: "52px", fontSize: "11px", color: "#facc15", fontFamily: "monospace" }
  });
  const telemRow3 = new TextLayer({
    id: "telem_row3",
    content: "POLES:    Closed-loop Hurwitz (Stable)",
    style: { left: "14px", top: "72px", fontSize: "11px", color: "#4ade80", fontFamily: "monospace" }
  });
  const telemRow4 = new TextLayer({
    id: "telem_row4",
    content: "BASIN:    Lyapunov Attractor Region: Active",
    style: { left: "14px", top: "92px", fontSize: "11px", color: "#e2e8f0", fontFamily: "monospace" }
  });
  telemetryCard.add(telemHeader, telemRow1, telemRow2, telemRow3, telemRow4);
  scene.add(telemetryCard);

  // 4. Linear Guide Rail / Track Assembly (Base at y = 520px)
  const trackRail = new BoxLayer({
    id: "track_rail",
    style: {
      left: "140px",
      top: "520px",
      width: "1000px",
      height: "8px",
      background: "linear-gradient(to bottom, #64748b, #1e293b)",
      borderRadius: "4px",
      boxShadow: "0 4px 18px rgba(0, 0, 0, 0.7)"
    }
  });
  scene.add(trackRail);

  // Track Mounts and End Stops
  const mountLeft = new BoxLayer({
    id: "mount_left",
    style: {
      left: "128px",
      top: "512px",
      width: "16px",
      height: "24px",
      backgroundColor: "#334155",
      borderRadius: "4px 0 0 4px",
      border: "1px solid #475569"
    }
  });
  const mountRight = new BoxLayer({
    id: "mount_right",
    style: {
      left: "1136px",
      top: "512px",
      width: "16px",
      height: "24px",
      backgroundColor: "#334155",
      borderRadius: "0 4px 4px 0",
      border: "1px solid #475569"
    }
  });
  scene.add(mountLeft, mountRight);

  // Millimeter Graduations along the track
  const trackTicks = [
    { x: 340, label: "−0.3m" },
    { x: 440, label: "−0.2m" },
    { x: 540, label: "−0.1m" },
    { x: 640, label: "0.0m (Origin)", isCenter: true },
    { x: 740, label: "+0.1m" },
    { x: 840, label: "+0.2m" },
    { x: 940, label: "+0.3m" }
  ];

  trackTicks.forEach((tick, idx) => {
    const tickMark = new BoxLayer({
      id: `track_tick_${idx}`,
      style: {
        left: `${tick.x}px`,
        top: "528px",
        width: "2px",
        height: "8px",
        backgroundColor: tick.isCenter ? "#38bdf8" : "rgba(148, 163, 184, 0.4)"
      }
    });
    const tickLabel = new TextLayer({
      id: `track_label_${idx}`,
      content: tick.label,
      style: {
        left: `${tick.x - 40}px`,
        top: "540px",
        width: "80px",
        textAlign: "center",
        fontSize: "10px",
        fontFamily: "monospace",
        color: tick.isCenter ? "#38bdf8" : "#94a3b8"
      }
    });
    scene.add(tickMark, tickLabel);
  });

  // Vertical Center Reference Axis (Zero line x = 640px)
  const zeroRefAxis = new BoxLayer({
    id: "zero_ref_axis",
    style: {
      left: "640px",
      top: "190px",
      width: "1px",
      height: "330px",
      borderLeft: "1px dashed rgba(56, 189, 248, 0.25)",
      pointerEvents: "none"
    }
  });
  scene.add(zeroRefAxis);

  // 5. Precompute 60 Physical Simulation Steps across 6000ms
  const steps = 60;
  const simFrames = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * totalDuration;
    simFrames.push(getSimulationState(t));
  }

  // 6. Motorized Cart Assembly
  // Cart body width = 110px, height = 36px. Center of cart is cartX.
  const cartGroup = new GroupLayer({
    id: "cart_assembly",
    style: {
      left: "0px",
      top: "0px",
      width: "0px",
      height: "0px"
    }
  });

  cartGroup.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: simFrames.map((f) => ({
      progress: f.t / totalDuration,
      css: {
        transform: `translate(${Math.round(f.cartX)}px, 492px)`
      }
    }))
  });

  // Cart main chassis
  const cartChassis = new BoxLayer({
    id: "cart_chassis",
    style: {
      left: "-55px",
      top: "-10px",
      width: "110px",
      height: "36px",
      background: "linear-gradient(135deg, #1e293b, #0f172a)",
      border: "1px solid rgba(56, 189, 248, 0.45)",
      borderRadius: "6px",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.6)"
    }
  });

  // Cart linear servo text
  const cartLabel = new TextLayer({
    id: "cart_label",
    content: "LQR SERVO CART",
    style: {
      left: "-50px",
      top: "5px",
      width: "100px",
      textAlign: "center",
      fontSize: "9px",
      fontWeight: "800",
      letterSpacing: "1px",
      color: "#38bdf8",
      fontFamily: "monospace"
    }
  });

  // Cart Wheels riding on rail
  const wheelLeft = new BoxLayer({
    id: "wheel_left",
    style: {
      left: "-42px",
      top: "22px",
      width: "14px",
      height: "14px",
      borderRadius: "50%",
      backgroundColor: "#475569",
      border: "2px solid #94a3b8",
      boxShadow: "0 2px 6px rgba(0,0,0,0.8)"
    }
  });
  const wheelRight = new BoxLayer({
    id: "wheel_right",
    style: {
      left: "28px",
      top: "22px",
      width: "14px",
      height: "14px",
      borderRadius: "50%",
      backgroundColor: "#475569",
      border: "2px solid #94a3b8",
      boxShadow: "0 2px 6px rgba(0,0,0,0.8)"
    }
  });

  // Cart Pivot Bearing (Pivot point where Link 1 attaches: x = 0, y = -2px relative to cart origin)
  const pivotBearing = new BoxLayer({
    id: "pivot_bearing",
    style: {
      left: "-11px",
      top: "-13px",
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      background: "radial-gradient(circle, #38bdf8 0%, #0284c7 100%)",
      boxShadow: "0 0 12px rgba(56, 189, 248, 0.8)",
      border: "2px solid #ffffff"
    }
  });

  // Cart Active Control Force Arrow Vector
  // Animates horizontal scale and color based on u(t) = -Kx
  const forceArrow = new BoxLayer({
    id: "force_arrow",
    style: {
      left: "-50px",
      top: "28px",
      width: "100px",
      height: "4px",
      background: "linear-gradient(90deg, #f59e0b, #38bdf8)",
      borderRadius: "2px",
      transformOrigin: "center center",
      boxShadow: "0 0 8px rgba(56, 189, 248, 0.5)"
    }
  });

  forceArrow.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: simFrames.map((f) => ({
      progress: f.t / totalDuration,
      css: {
        transform: `scaleX(${Math.max(0.05, Math.abs(f.controlForce)).toFixed(3)})`,
        opacity: Math.abs(f.controlForce) > 0.08 ? 1 : 0.3
      }
    }))
  });

  cartGroup.add(cartChassis, cartLabel, wheelLeft, wheelRight, pivotBearing, forceArrow);
  scene.add(cartGroup);

  // 7. Link 1 (Lower Arm)
  // Length L1 = 150px. Mounted at (cartX, yPivot = 490px)
  // Rotates by theta1 around bottom center
  const link1 = new BoxLayer({
    id: "link1_arm",
    style: {
      left: "-3px",
      top: "-150px",
      width: "6px",
      height: "150px",
      background: "linear-gradient(90deg, #94a3b8, #ffffff 50%, #64748b)",
      borderRadius: "3px",
      boxShadow: "0 0 10px rgba(255, 255, 255, 0.25)",
      transformOrigin: "bottom center"
    }
  });

  link1.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: simFrames.map((f) => ({
      progress: f.t / totalDuration,
      css: {
        transform: `translate(${Math.round(f.cartX)}px, ${yPivot}px) rotate(${f.theta1.toFixed(2)}deg)`
      }
    }))
  });
  scene.add(link1);

  // 8. Joint 1 (Elbow Bob between Link 1 and Link 2)
  // Positioned at (x1, y1)
  const joint1Bob = new BoxLayer({
    id: "joint1_bob",
    style: {
      left: "-10px",
      top: "-10px",
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      background: "radial-gradient(circle at 35% 35%, #fed7aa 0%, #f97316 65%, #c2410c 100%)",
      boxShadow: "0 0 16px rgba(249, 115, 22, 0.7)",
      border: "2px solid #ffffff"
    }
  });

  joint1Bob.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: simFrames.map((f) => ({
      progress: f.t / totalDuration,
      css: {
        transform: `translate(${Math.round(f.x1)}px, ${Math.round(f.y1)}px)`
      }
    }))
  });
  scene.add(joint1Bob);

  // 9. Link 2 (Upper Arm)
  // Length L2 = 130px. Mounted at (x1, y1). Rotates by theta2 around bottom center.
  const link2 = new BoxLayer({
    id: "link2_arm",
    style: {
      left: "-2.5px",
      top: "-130px",
      width: "5px",
      height: "130px",
      background: "linear-gradient(90deg, #38bdf8, #e0f2fe 50%, #0284c7)",
      borderRadius: "3px",
      boxShadow: "0 0 10px rgba(56, 189, 248, 0.35)",
      transformOrigin: "bottom center"
    }
  });

  link2.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: simFrames.map((f) => ({
      progress: f.t / totalDuration,
      css: {
        transform: `translate(${Math.round(f.x1)}px, ${Math.round(f.y1)}px) rotate(${f.theta2.toFixed(2)}deg)`
      }
    }))
  });
  scene.add(link2);

  // 10. Top Tip Bob (Hero Node at (x2, y2))
  const tipGroup = new GroupLayer({
    id: "tip_bob_assembly",
    style: {
      left: "0px",
      top: "0px",
      width: "0px",
      height: "0px"
    }
  });

  tipGroup.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: simFrames.map((f) => ({
      progress: f.t / totalDuration,
      css: {
        transform: `translate(${Math.round(f.x2)}px, ${Math.round(f.y2)}px)`
      }
    }))
  });

  const tipHalo = new BoxLayer({
    id: "tip_halo",
    style: {
      left: "-20px",
      top: "-20px",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, rgba(74, 222, 128, 0.15) 50%, transparent 70%)"
    }
  });

  const tipCore = new BoxLayer({
    id: "tip_core",
    style: {
      left: "-13px",
      top: "-13px",
      width: "26px",
      height: "26px",
      borderRadius: "50%",
      background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #a7f3d0 30%, #10b981 70%, #047857 100%)",
      boxShadow: "0 0 18px #10b981, 0 0 35px rgba(16, 185, 129, 0.7), inset 0 0 5px #ffffff",
      border: "2px solid #ffffff"
    }
  });

  const tipLabel = new TextLayer({
    id: "tip_label",
    content: "m₂ (TIP)",
    style: {
      left: "-30px",
      top: "-30px",
      width: "60px",
      textAlign: "center",
      fontSize: "10px",
      fontWeight: "800",
      fontFamily: "monospace",
      color: "#4ade80",
      textShadow: "0 0 8px rgba(0, 0, 0, 0.9)"
    }
  });

  tipGroup.add(tipHalo, tipCore, tipLabel);
  scene.add(tipGroup);

  // 11. Historical Trajectory Trail of Upper Tip (30 Trail Nodes)
  // Traces out the acrobatic counter-oscillation and stabilization in space
  const trailStep = 2;
  for (let i = 0; i <= steps; i += trailStep) {
    const f = simFrames[i];
    const trailNode = new BoxLayer({
      id: `trail_node_${i}`,
      style: {
        left: `${Math.round(f.x2 - 3)}px`,
        top: `${Math.round(f.y2 - 3)}px`,
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: "#4ade80",
        boxShadow: "0 0 8px #4ade80, 0 0 16px rgba(74, 222, 128, 0.4)",
        opacity: 0,
        pointerEvents: "none"
      }
    });

    trailNode.animate({
      delay: Math.round(f.t),
      duration: 350,
      from: { opacity: 0, transform: "scale(0.3)" },
      to: { opacity: 0.8, transform: "scale(1.0)" }
    });

    scene.add(trailNode);
  }

  // 12. External Perturbation Impulse Tap (Visual Event at t = 800ms)
  const distPulse = new BoxLayer({
    id: "dist_pulse",
    style: {
      left: "570px",
      top: "206px",
      width: "50px",
      height: "8px",
      background: "linear-gradient(90deg, #f43f5e, #fb7185)",
      borderRadius: "4px",
      boxShadow: "0 0 15px #f43f5e",
      opacity: 0
    }
  });

  distPulse.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: [
      { progress: 0.0, css: { opacity: 0, transform: "translateX(0px)" } },
      { progress: 750 / 6000, css: { opacity: 0, transform: "translateX(0px)" } },
      { progress: 800 / 6000, css: { opacity: 1, transform: "translateX(15px)" } },
      { progress: 1050 / 6000, css: { opacity: 0.8, transform: "translateX(30px)" } },
      { progress: 1150 / 6000, css: { opacity: 0, transform: "translateX(40px)" } },
      { progress: 1.0, css: { opacity: 0 } }
    ]
  });
  scene.add(distPulse);

  const distLabel = new TextLayer({
    id: "dist_label",
    content: "⚡ PERTURBATION IMPULSE (+15 N·s)",
    style: {
      left: "480px",
      top: "180px",
      fontSize: "11px",
      fontWeight: "800",
      fontFamily: "monospace",
      color: "#f43f5e",
      textShadow: "0 0 10px rgba(244, 63, 94, 0.8)",
      opacity: 0
    }
  });

  distLabel.animate({
    delay: 0,
    duration: totalDuration,
    ease: "linear",
    points: [
      { progress: 0.0, css: { opacity: 0 } },
      { progress: 750 / 6000, css: { opacity: 0 } },
      { progress: 800 / 6000, css: { opacity: 1 } },
      { progress: 1200 / 6000, css: { opacity: 1 } },
      { progress: 1400 / 6000, css: { opacity: 0 } },
      { progress: 1.0, css: { opacity: 0 } }
    ]
  });
  scene.add(distLabel);

  // 13. Lower-Left State Readout Card
  const stateCard = new GroupLayer({
    id: "state_card",
    style: {
      left: "60px",
      top: "390px",
      width: "280px",
      height: "105px",
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(8px)",
      borderRadius: "8px",
      border: "1px solid rgba(56, 189, 248, 0.2)"
    }
  });

  const stateHeader = new TextLayer({
    id: "state_header",
    content: "DYNAMIC ENCODER READINGS",
    style: {
      left: "12px",
      top: "8px",
      fontSize: "10px",
      fontWeight: "700",
      letterSpacing: "1px",
      color: "#38bdf8",
      fontFamily: "monospace"
    }
  });
  const stateRow1 = new TextLayer({
    id: "state_row1",
    content: "CART POSITION:    x(t)  [±0.09 m span]",
    style: { left: "12px", top: "28px", fontSize: "10px", color: "#f8fafc", fontFamily: "monospace" }
  });
  const stateRow2 = new TextLayer({
    id: "state_row2",
    content: "LOWER ARM ANGLE:  θ₁(t) [Elbow Joint]",
    style: { left: "12px", top: "46px", fontSize: "10px", color: "#f97316", fontFamily: "monospace" }
  });
  const stateRow3 = new TextLayer({
    id: "state_row3",
    content: "UPPER ARM ANGLE:  θ₂(t) [Tip Joint]",
    style: { left: "12px", top: "64px", fontSize: "10px", color: "#4ade80", fontFamily: "monospace" }
  });
  const stateRow4 = new TextLayer({
    id: "state_row4",
    content: "CONTROL FORCE:    u(t) = −K x [Linear Motor]",
    style: { left: "12px", top: "82px", fontSize: "10px", color: "#facc15", fontFamily: "monospace" }
  });

  stateCard.add(stateHeader, stateRow1, stateRow2, stateRow3, stateRow4);
  scene.add(stateCard);

  // 14. FIVE STABILIZATION PHASES STATUS BAR
  const phases = [
    { id: "phase_1", text: "1. EQUILIBRIUM HOLD", start: 0, end: 800 },
    { id: "phase_2", text: "2. DISTURBANCE TAP", start: 800, end: 1100 },
    { id: "phase_3", text: "3. LQR COUNTER-STEER", start: 1100, end: 2800 },
    { id: "phase_4", text: "4. DAMPED RECOVERY", start: 2800, end: 4800 },
    { id: "phase_5", text: "5. RESTABILIZED (0 ERR)", start: 4800, end: 6000 }
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
        { progress: Math.max(0, pStartFrac - 0.005), css: { opacity: 0.4, borderColor: "rgba(148, 163, 184, 0.2)", color: "#64748b" } },
        { progress: pStartFrac, css: { opacity: 1.0, borderColor: "#38bdf8", color: "#38bdf8", backgroundColor: "rgba(56, 189, 248, 0.15)" } },
        { progress: pEndFrac, css: { opacity: 1.0, borderColor: "#38bdf8", color: "#38bdf8", backgroundColor: "rgba(56, 189, 248, 0.15)" } },
        { progress: Math.min(1, pEndFrac + 0.005), css: { opacity: 0.4, borderColor: "rgba(148, 163, 184, 0.2)", color: "#64748b", backgroundColor: "rgba(15, 23, 42, 0.6)" } },
        { progress: 1.0, css: { opacity: 0.4, borderColor: "rgba(148, 163, 184, 0.2)", color: "#64748b" } }
      ]
    });

    scene.add(phasePill);
  });

  // 15. Bottom Mathematical Theory Bar
  const theoryBar = new TextLayer({
    id: "theory_bar",
    content: "EULER-LAGRANGE DYNAMICS: M(q)q̈ + C(q,q̇)q̇ + G(q) = B·u  |  RICCATI EQUATION: AᵀP + PA − PBR⁻¹BᵀP + Q = 0  ⇒  K = R⁻¹BᵀP",
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

  // 16. Bake the scene to disk
  const outputPath = process.argv[2] || "examples/double_pendulum.json";
  const savedPath = await scene.save(outputPath);
  console.log(`[Keyflow] Successfully baked double pendulum scene to: ${savedPath}`);
}

main().catch((err) => {
  console.error("[Keyflow] Error generating double pendulum scene:", err);
  process.exit(1);
});
