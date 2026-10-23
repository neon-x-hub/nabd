import { Scene, BoxLayer, TextLayer, AudioLayer, GroupLayer } from "../index.js";

// ──────────────────────────────────────────────────────────────
// Timeline  (all times in milliseconds from scene start)
// ──────────────────────────────────────────────────────────────
//   0 –  800  Scene panels fade + slide in
//   900       Req#1 appears, travels to gateway
//  1600       Token consumed (coin sfx) → Req#1 stamped 200 OK, races to backend
//  1700       Req#2 appears
//  2400       Token consumed                    → Req#2 stamped 200 OK
//  2500       Req#3 appears
//  3200       Last token consumed, gate turns RED → Req#3 stamped 200 OK
//  3600       Req#4 appears, hits depleted barrier → electric zap, 429 bounce
//  4200       Req#5 appears, hits barrier again  → electric zap, 429 bounce
//  4900       Token-refill animation (bucket restores 1 token)
//  7600       Fade-out of last elements
//  8000       End
// ──────────────────────────────────────────────────────────────

async function main() {
  const scene = new Scene({
    id: "rate_limiter_v2",
    name: "Token Bucket Rate Limiter — Enhanced",
    dimensions: [1280, 720]
  });

  // ─── 1. Background ────────────────────────────────────────────
  scene.add(new BoxLayer({
    id: "bg",
    style: {
      left: "0px", top: "0px", width: "100%", height: "100%",
      background: "radial-gradient(ellipse 120% 80% at 50% 15%, #0f1a35 0%, #060911 60%, #03060f 100%)"
    }
  }));

  // Subtle horizontal scan-line accent (purely decorative)
  scene.add(new BoxLayer({
    id: "scanline",
    style: {
      left: "0px", top: "0px", width: "100%", height: "100%",
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 4px)",
      pointerEvents: "none"
    }
  }));

  // ─── 2. Connection pipe between pillars (behind everything) ───
  // Left pipe: client → gateway
  const pipeLeft = new BoxLayer({
    id: "pipe_left",
    style: {
      left: "290px", top: "320px",
      width: "192px", height: "2px",
      background: "linear-gradient(90deg, rgba(56,189,248,0.08) 0%, rgba(56,189,248,0.25) 50%, rgba(99,102,241,0.25) 100%)"
    }
  });
  pipeLeft.animate({ delay: 600, duration: 700, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scaleX(0)" }, to: { opacity: 1, transform: "scaleX(1)" } });
  scene.add(pipeLeft);

  // Right pipe: gateway → server
  const pipeRight = new BoxLayer({
    id: "pipe_right",
    style: {
      left: "800px", top: "320px",
      width: "182px", height: "2px",
      background: "linear-gradient(90deg, rgba(99,102,241,0.25) 0%, rgba(56,189,248,0.25) 50%, rgba(52,211,153,0.08) 100%)"
    }
  });
  pipeRight.animate({ delay: 700, duration: 700, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scaleX(0)" }, to: { opacity: 1, transform: "scaleX(1)" } });
  scene.add(pipeRight);

  // ─── 3. Header ────────────────────────────────────────────────
  const pillBg = new BoxLayer({
    id: "cat_pill",
    style: {
      left: "490px", top: "36px", width: "300px", height: "28px",
      borderRadius: "14px",
      background: "rgba(99,102,241,0.10)",
      border: "1px solid rgba(99,102,241,0.32)"
    }
  });
  pillBg.animate({ delay: 100, duration: 700, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-14px)" }, to: { opacity: 1, transform: "translateY(0px)" } });
  scene.add(pillBg);

  scene.add(new TextLayer({
    id: "cat_text",
    content: "DISTRIBUTED SYSTEMS  •  TRAFFIC ENGINEERING",
    style: {
      left: "490px", top: "43px", width: "300px", textAlign: "center",
      fontSize: "10px", fontFamily: "'Segoe UI', Inter, sans-serif",
      fontWeight: "700", letterSpacing: "1.2px", color: "#a5b4fc"
    }
  }));

  const mainTitle = new TextLayer({
    id: "main_title",
    content: "Token Bucket Rate Limiter",
    style: {
      left: "0px", top: "78px", width: "100%", textAlign: "center",
      fontSize: "36px", fontFamily: "'Segoe UI', Inter, sans-serif",
      fontWeight: "800", letterSpacing: "1px", color: "#f1f5f9",
      textShadow: "0 0 40px rgba(99,102,241,0.4)"
    }
  });
  mainTitle.animate({ delay: 180, duration: 800, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-16px)" }, to: { opacity: 1, transform: "translateY(0px)" } });
  scene.add(mainTitle);

  const sub = new TextLayer({
    id: "sub",
    content: "Capacity: 3 tokens  •  Burst of 5 simultaneous requests  •  Refill: 1 token / sec",
    style: {
      left: "0px", top: "128px", width: "100%", textAlign: "center",
      fontSize: "14px", fontFamily: "'Segoe UI', Inter, sans-serif",
      fontWeight: "500", color: "#475569", letterSpacing: "0.3px"
    }
  });
  sub.animate({ delay: 300, duration: 700, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(-10px)" }, to: { opacity: 1, transform: "translateY(0px)" } });
  scene.add(sub);

  // ─── 4. Client Pillar ─────────────────────────────────────────
  const clientPillar = new GroupLayer({
    id: "client",
    style: {
      left: "68px", top: "178px", width: "222px", height: "310px",
      borderRadius: "18px",
      background: "rgba(10,17,35,0.8)",
      border: "1px solid rgba(56,189,248,0.18)",
      boxShadow: "0 24px 48px rgba(0,0,0,0.55)"
    }
  });
  clientPillar.animate({ delay: 220, duration: 900, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateX(-36px) scale(0.97)" }, to: { opacity: 1, transform: "translateX(0px) scale(1)" } });

  clientPillar.add(new TextLayer({
    id: "client_h",
    content: "CLIENT INGRESS",
    style: {
      left: "0px", top: "22px", width: "100%", textAlign: "center",
      fontSize: "11px", fontFamily: "Inter, sans-serif", fontWeight: "700",
      letterSpacing: "2.5px", color: "#38bdf8"
    }
  }));

  // Small icon-like circle for the client "node"
  const clientNode = new BoxLayer({
    id: "client_node",
    style: {
      left: "81px", top: "64px", width: "60px", height: "60px",
      borderRadius: "30px",
      background: "radial-gradient(circle at 38% 36%, #38bdf8 0%, #0369a1 80%)",
      boxShadow: "0 0 24px rgba(56,189,248,0.5)"
    }
  });
  clientNode.animate({ delay: 600, duration: 600, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scale(0.5)" }, to: { opacity: 1, transform: "scale(1)" } });
  // Gentle breathing pulse on client node
  clientNode.animate({ delay: 1200, duration: 2200, ease: "ease-in-out", repeat: "infinite",
    from: { boxShadow: "0 0 18px rgba(56,189,248,0.35)" },
    to:   { boxShadow: "0 0 38px rgba(56,189,248,0.7)" }
  });
  clientPillar.add(clientNode);

  clientPillar.add(new TextLayer({
    id: "client_sub",
    content: "HTTP Client Pool\nBurst Mode Active",
    style: {
      left: "0px", top: "142px", width: "100%", textAlign: "center",
      fontSize: "13px", fontFamily: "Inter, sans-serif", color: "#64748b", lineHeight: "22px"
    }
  }));

  // Requests-sent counter label
  clientPillar.add(new TextLayer({
    id: "client_sent_label",
    content: "REQUESTS SENT",
    style: {
      left: "0px", top: "208px", width: "100%", textAlign: "center",
      fontSize: "10px", fontFamily: "Inter, sans-serif", fontWeight: "700",
      letterSpacing: "1.5px", color: "#334155"
    }
  }));
  clientPillar.add(new TextLayer({
    id: "client_sent_val",
    content: "5",
    style: {
      left: "0px", top: "226px", width: "100%", textAlign: "center",
      fontSize: "30px", fontFamily: "'Segoe UI', Inter, sans-serif",
      fontWeight: "800", color: "#38bdf8"
    }
  }));
  scene.add(clientPillar);

  // ─── 5. Gateway Pillar ────────────────────────────────────────
  const gatewayPillar = new GroupLayer({
    id: "gateway",
    style: {
      left: "470px", top: "158px", width: "340px", height: "380px",
      borderRadius: "22px",
      background: "rgba(8,12,28,0.92)",
      border: "1px solid rgba(99,102,241,0.38)",
      boxShadow: "0 32px 64px rgba(0,0,0,0.7), 0 0 48px rgba(99,102,241,0.12)"
    }
  });
  gatewayPillar.animate({ delay: 280, duration: 900, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scale(0.90)" }, to: { opacity: 1, transform: "scale(1)" } });

  // Gentle glow-pulse on gateway border — breathes to signal activity
  gatewayPillar.animate({ delay: 1000, duration: 2600, ease: "ease-in-out", repeat: "infinite",
    from: { boxShadow: "0 32px 64px rgba(0,0,0,0.7), 0 0 30px rgba(99,102,241,0.08)" },
    to:   { boxShadow: "0 32px 64px rgba(0,0,0,0.7), 0 0 70px rgba(99,102,241,0.28)" }
  });

  gatewayPillar.add(new TextLayer({
    id: "gw_title",
    content: "TOKEN BUCKET GATEWAY",
    style: {
      left: "0px", top: "24px", width: "100%", textAlign: "center",
      fontSize: "12px", fontFamily: "Inter, sans-serif", fontWeight: "700",
      letterSpacing: "2.5px", color: "#818cf8"
    }
  }));
  gatewayPillar.add(new TextLayer({
    id: "gw_policy",
    content: "Policy: strict-drop on empty  |  algo: token-bucket",
    style: {
      left: "0px", top: "50px", width: "100%", textAlign: "center",
      fontSize: "11px", fontFamily: "Inter, sans-serif", color: "#334155"
    }
  }));

  // ── Token Reservoir ──────────────────────────────────────────
  const reservoir = new GroupLayer({
    id: "reservoir",
    style: {
      left: "24px", top: "84px", width: "292px", height: "122px",
      borderRadius: "16px",
      background: "rgba(2,4,18,0.75)",
      border: "1px solid rgba(255,255,255,0.07)"
    }
  });
  reservoir.add(new TextLayer({
    id: "res_label",
    content: "TOKEN INVENTORY",
    style: {
      left: "0px", top: "12px", width: "100%", textAlign: "center",
      fontSize: "10px", fontFamily: "Inter, sans-serif", fontWeight: "700",
      letterSpacing: "2px", color: "#334155"
    }
  }));

  function makeToken(id, leftPx, consumedAt) {
    const t = new BoxLayer({
      id,
      style: {
        left: `${leftPx}px`, top: "42px", width: "52px", height: "52px",
        borderRadius: "26px",
        background: "radial-gradient(circle at 35% 32%, #c7d2fe 0%, #6366f1 60%, #3730a3 100%)",
        boxShadow: "0 0 22px rgba(99,102,241,0.9), inset 0 0 8px rgba(255,255,255,0.25)"
      }
    });
    // Entrance shimmer
    t.animate({ delay: 480 + leftPx * 0.5, duration: 550, ease: [0.16, 1, 0.3, 1],
      from: { opacity: 0, transform: "scale(0.4) translateY(8px)" },
      to:   { opacity: 1, transform: "scale(1) translateY(0px)" }
    });
    // Gentle spin-shimmer — looks alive
    t.animate({ delay: 1200, duration: 3500, ease: "linear", repeat: "infinite",
      from: { boxShadow: "0 0 18px rgba(99,102,241,0.7), inset 0 0 8px rgba(255,255,255,0.18)" },
      to:   { boxShadow: "0 0 32px rgba(99,102,241,1.0), inset 0 0 8px rgba(255,255,255,0.35)" }
    });
    // Consumption: fly slightly upward then vanish
    t.animate({ delay: consumedAt, duration: 350, ease: [0.55, 0, 1, 0.45],
      from: { opacity: 1, transform: "scale(1) translateY(0px)" },
      to:   { opacity: 0, transform: "scale(0.15) translateY(-18px)" }
    });
    return t;
  }

  //                   id         left   consumed_at
  reservoir.add(makeToken("tok_1", 20,   1600));
  reservoir.add(makeToken("tok_2", 88,   2400));
  reservoir.add(makeToken("tok_3", 156,  3200));

  // Refilled token — slides in at 4900ms
  const tokRefill = new BoxLayer({
    id: "tok_refill",
    style: {
      left: "20px", top: "42px", width: "52px", height: "52px",
      borderRadius: "26px",
      background: "radial-gradient(circle at 35% 32%, #86efac 0%, #22c55e 60%, #15803d 100%)",
      boxShadow: "0 0 22px rgba(34,197,94,0.9), inset 0 0 8px rgba(255,255,255,0.25)",
      opacity: 0
    }
  });
  tokRefill.animate({ delay: 4900, duration: 600, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scale(0.3) translateY(14px)" },
    to:   { opacity: 1, transform: "scale(1) translateY(0px)" }
  });
  // Pulse to draw attention after refill
  tokRefill.animate({ delay: 5500, duration: 900, ease: "ease-in-out", repeat: "infinite",
    from: { boxShadow: "0 0 16px rgba(34,197,94,0.6)" },
    to:   { boxShadow: "0 0 38px rgba(34,197,94,1.0)" }
  });
  reservoir.add(tokRefill);
  gatewayPillar.add(reservoir);

  // ── Token level bar (drains as tokens are consumed) ──────────
  const barTrack = new BoxLayer({
    id: "bar_track",
    style: {
      left: "24px", top: "224px", width: "292px", height: "10px",
      borderRadius: "5px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.07)"
    }
  });
  gatewayPillar.add(barTrack);

  const barFill = new BoxLayer({
    id: "bar_fill",
    style: {
      left: "24px", top: "224px", width: "292px", height: "10px",
      borderRadius: "5px",
      background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
      boxShadow: "0 0 10px rgba(99,102,241,0.8)",
      transformOrigin: "left center"
    }
  });
  // Full → 2/3 at token1 consumption
  barFill.animate({ delay: 1600, duration: 500, ease: [0.16, 1, 0.3, 1],
    from: { transform: "scaleX(1)" }, to: { transform: "scaleX(0.667)" } });
  // 2/3 → 1/3 at token2 consumption
  barFill.animate({ delay: 2400, duration: 500, ease: [0.16, 1, 0.3, 1],
    from: { transform: "scaleX(0.667)" }, to: { transform: "scaleX(0.333)" } });
  // 1/3 → 0 at last token consumption + color shifts red
  barFill.animate({ delay: 3200, duration: 500, ease: [0.16, 1, 0.3, 1],
    from: { transform: "scaleX(0.333)", background: "linear-gradient(90deg,#6366f1 0%,#818cf8 100%)" },
    to:   { transform: "scaleX(0)",     background: "linear-gradient(90deg,#ef4444 0%,#f87171 100%)" }
  });
  // Refill bar creeps back to 1/3 at 4900ms
  barFill.animate({ delay: 4900, duration: 700, ease: [0.16, 1, 0.3, 1],
    from: { transform: "scaleX(0)",     background: "linear-gradient(90deg,#22c55e 0%,#4ade80 100%)" },
    to:   { transform: "scaleX(0.333)", background: "linear-gradient(90deg,#22c55e 0%,#4ade80 100%)" }
  });
  gatewayPillar.add(barFill);

  const barLabel = new TextLayer({
    id: "bar_label",
    content: "CAPACITY",
    style: {
      left: "24px", top: "240px", width: "50px",
      fontSize: "9px", fontFamily: "Inter, sans-serif", fontWeight: "700",
      letterSpacing: "1.5px", color: "#334155"
    }
  });
  gatewayPillar.add(barLabel);

  // ── Status badge ─────────────────────────────────────────────
  const statusBadge = new GroupLayer({
    id: "status_badge",
    style: {
      left: "36px", top: "262px", width: "268px", height: "38px",
      borderRadius: "19px",
      background: "rgba(16,185,129,0.12)",
      border: "1px solid rgba(16,185,129,0.38)",
      boxShadow: "0 0 18px rgba(16,185,129,0.18)"
    }
  });
  // Switch to 429-state at 3200ms
  statusBadge.animate({ delay: 3200, duration: 450, ease: "ease-out",
    from: { background: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.38)", boxShadow: "0 0 18px rgba(16,185,129,0.18)" },
    to:   { background: "rgba(239,68,68,0.18)",  borderColor: "rgba(239,68,68,0.55)",  boxShadow: "0 0 32px rgba(239,68,68,0.45)" }
  });
  // Pulse while in 429-state (dramatic!)
  statusBadge.animate({ delay: 3700, duration: 700, ease: "ease-in-out", repeat: "infinite",
    from: { boxShadow: "0 0 22px rgba(239,68,68,0.3)" },
    to:   { boxShadow: "0 0 44px rgba(239,68,68,0.7)" }
  });
  // Calm back on refill
  statusBadge.animate({ delay: 4900, duration: 600, ease: [0.16, 1, 0.3, 1],
    from: { background: "rgba(239,68,68,0.18)", borderColor: "rgba(239,68,68,0.55)", boxShadow: "0 0 32px rgba(239,68,68,0.45)" },
    to:   { background: "rgba(34,197,94,0.12)",  borderColor: "rgba(34,197,94,0.38)",  boxShadow: "0 0 20px rgba(34,197,94,0.3)" }
  });
  gatewayPillar.add(statusBadge);

  const statusText = new TextLayer({
    id: "status_text",
    content: "● TOKENS AVAILABLE  —  ACCEPTING",
    style: {
      left: "0px", top: "11px", width: "100%", textAlign: "center",
      fontSize: "11px", fontFamily: "Inter, sans-serif", fontWeight: "700",
      letterSpacing: "1px", color: "#10b981"
    }
  });
  statusText.animate({ delay: 3200, duration: 450, ease: "ease-out",
    from: { color: "#10b981" }, to: { color: "#ef4444" } });
  statusText.animate({ delay: 4900, duration: 500, ease: "ease-out",
    from: { color: "#ef4444" }, to: { color: "#22c55e" } });
  statusBadge.add(statusText);

  // Refill label
  const refillLabel = new TextLayer({
    id: "refill_label",
    content: "↑ Token Refill  (+1 / sec)",
    style: {
      left: "0px", top: "320px", width: "100%", textAlign: "center",
      fontSize: "11px", fontFamily: "Inter, sans-serif", fontWeight: "600",
      letterSpacing: "0.5px", color: "#22c55e", opacity: 0
    }
  });
  refillLabel.animate({ delay: 4900, duration: 500, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0px)" } });
  gatewayPillar.add(refillLabel);

  scene.add(gatewayPillar);

  // ─── 6. Shield barrier (vertical line on left edge of gateway) ─
  const shield = new BoxLayer({
    id: "shield",
    style: {
      left: "470px", top: "196px", width: "3px", height: "306px",
      borderRadius: "2px",
      background: "linear-gradient(180deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.55) 40%, rgba(99,102,241,0.55) 60%, rgba(99,102,241,0.1) 100%)",
      boxShadow: "0 0 12px rgba(99,102,241,0.5)"
    }
  });
  shield.animate({ delay: 700, duration: 600, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0 }, to: { opacity: 1 } });
  // Flash #1 at 3600ms (Req#4 hits)
  shield.animate({ delay: 3600, duration: 200, ease: "ease-out",
    from: { background: "#ef4444", boxShadow: "0 0 40px #ef4444" },
    to:   { background: "rgba(99,102,241,0.55)", boxShadow: "0 0 12px rgba(99,102,241,0.5)" }
  });
  // Flash #2 at 4300ms (Req#5 hits)
  shield.animate({ delay: 4300, duration: 200, ease: "ease-out",
    from: { background: "#ef4444", boxShadow: "0 0 40px #ef4444" },
    to:   { background: "rgba(239,68,68,0.55)", boxShadow: "0 0 18px rgba(239,68,68,0.6)" }
  });
  scene.add(shield);

  // ─── 7. Server Pillar ─────────────────────────────────────────
  const serverPillar = new GroupLayer({
    id: "server",
    style: {
      left: "990px", top: "178px", width: "222px", height: "310px",
      borderRadius: "18px",
      background: "rgba(10,17,35,0.8)",
      border: "1px solid rgba(52,211,153,0.18)",
      boxShadow: "0 24px 48px rgba(0,0,0,0.55), 0 0 28px rgba(34,197,94,0.06)"
    }
  });
  serverPillar.animate({ delay: 350, duration: 900, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "translateX(36px) scale(0.97)" }, to: { opacity: 1, transform: "translateX(0px) scale(1)" } });

  serverPillar.add(new TextLayer({
    id: "srv_title",
    content: "UPSTREAM BACKEND",
    style: {
      left: "0px", top: "22px", width: "100%", textAlign: "center",
      fontSize: "11px", fontFamily: "Inter, sans-serif", fontWeight: "700",
      letterSpacing: "2.5px", color: "#34d399"
    }
  }));

  const serverNode = new BoxLayer({
    id: "server_node",
    style: {
      left: "81px", top: "64px", width: "60px", height: "60px",
      borderRadius: "14px",
      background: "radial-gradient(circle at 38% 36%, #34d399 0%, #059669 80%)",
      boxShadow: "0 0 24px rgba(52,211,153,0.45)"
    }
  });
  serverNode.animate({ delay: 650, duration: 600, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scale(0.5)" }, to: { opacity: 1, transform: "scale(1)" } });
  serverNode.animate({ delay: 1400, duration: 2800, ease: "ease-in-out", repeat: "infinite",
    from: { boxShadow: "0 0 18px rgba(52,211,153,0.3)" },
    to:   { boxShadow: "0 0 36px rgba(52,211,153,0.65)" }
  });
  serverPillar.add(serverNode);

  serverPillar.add(new TextLayer({
    id: "srv_sub",
    content: "Application Cluster\nLoad: Protected",
    style: {
      left: "0px", top: "142px", width: "100%", textAlign: "center",
      fontSize: "13px", fontFamily: "Inter, sans-serif", color: "#64748b", lineHeight: "22px"
    }
  }));

  serverPillar.add(new TextLayer({
    id: "srv_recv_label",
    content: "REQUESTS SERVED",
    style: {
      left: "0px", top: "208px", width: "100%", textAlign: "center",
      fontSize: "10px", fontFamily: "Inter, sans-serif", fontWeight: "700",
      letterSpacing: "1.5px", color: "#334155"
    }
  }));
  serverPillar.add(new TextLayer({
    id: "srv_recv_val",
    content: "3",
    style: {
      left: "0px", top: "226px", width: "100%", textAlign: "center",
      fontSize: "30px", fontFamily: "'Segoe UI', Inter, sans-serif",
      fontWeight: "800", color: "#34d399"
    }
  }));
  scene.add(serverPillar);

  // ─── 8. Request Packets ────────────────────────────────────────
  // Travel: client left-edge is at x≈290, gateway left-edge at x≈470, server left-edge at x≈990
  // Pills are positioned relative to scene. They start at x≈215 (right of client pillar) and travel ~780px.
  // Gateway entry is at ~x=480 → pill needs to translate ~265px to reach it from start.
  // After acceptance → pill continues ~+515px more to reach server right side.

  function makePill(id, yPx) {
    return new GroupLayer({
      id,
      style: {
        left: "220px", top: `${yPx}px`,
        width: "148px", height: "36px",
        borderRadius: "18px",
        background: "rgba(56,189,248,0.12)",
        border: "1.5px solid rgba(56,189,248,0.7)",
        boxShadow: "0 0 14px rgba(56,189,248,0.25)",
        opacity: 0
      }
    });
  }

  function makePillLabel(id, text) {
    return new TextLayer({
      id: `${id}_txt`,
      content: text,
      style: {
        left: "0px", top: "10px", width: "100%", textAlign: "center",
        fontSize: "11px", fontFamily: "'SF Mono', Consolas, monospace",
        fontWeight: "700", letterSpacing: "0.8px", color: "#f1f5f9"
      }
    });
  }

  // ── Accepted request travel path (multi-point) ─────────────
  function animateAccepted(pill, { start, tokenAt }) {
    // Total travel: 1600ms travel from start-pos to server fade
    const travelDur = 2800;
    // progress when pill reaches gateway left edge (at +265px):  265/780 ≈ 0.34
    // tokenAt is ms since scene start; "gatewayProgress" = (tokenAt - start) / travelDur
    const gwP = (tokenAt - start) / travelDur;
    pill.animate({
      delay: start, duration: travelDur,
      points: [
        { progress: 0,        css: { opacity: 0,   transform: "translateX(0px)",    boxShadow: "0 0 12px rgba(56,189,248,0.2)" } },
        { progress: 0.08,     css: { opacity: 1,   transform: "translateX(30px)",   boxShadow: "0 0 18px rgba(56,189,248,0.4)" } },
        { progress: gwP,      css: { opacity: 1,   transform: "translateX(260px)",  boxShadow: "0 0 22px rgba(56,189,248,0.5)" } },
        { progress: gwP+0.04, css: { opacity: 1,   transform: "translateX(268px) scale(1.07)", boxShadow: "0 0 30px rgba(99,102,241,0.8)",
                                     background: "rgba(99,102,241,0.3)", borderColor: "rgba(99,102,241,0.9)" } },
        { progress: gwP+0.12, css: { transform: "translateX(275px) scale(1.04)", background: "rgba(16,185,129,0.25)", borderColor: "rgba(16,185,129,0.9)",
                                     boxShadow: "0 0 28px rgba(16,185,129,0.6)" } },
        { progress: 0.88,     css: { transform: "translateX(770px) scale(1.0)", opacity: 1, borderColor: "rgba(52,211,153,0.7)",
                                     background: "rgba(52,211,153,0.2)", boxShadow: "0 0 20px rgba(52,211,153,0.5)" } },
        { progress: 1.0,      css: { transform: "translateX(800px)", opacity: 0 } }
      ]
    });
  }

  // ── Rejected request travel path (bounces off shield) ───────
  function animateRejected(pill, { start, hitAt }) {
    const travelDur = 2000;
    const hitP = (hitAt - start) / travelDur;
    pill.animate({
      delay: start, duration: travelDur,
      points: [
        { progress: 0,        css: { opacity: 0,   transform: "translateX(0px)",    boxShadow: "0 0 12px rgba(56,189,248,0.2)" } },
        { progress: 0.1,      css: { opacity: 1,   transform: "translateX(30px)",   boxShadow: "0 0 18px rgba(56,189,248,0.4)" } },
        { progress: hitP-0.01,css: { opacity: 1,   transform: "translateX(240px)",  boxShadow: "0 0 20px rgba(56,189,248,0.4)" } },
        // Impact flash
        { progress: hitP,     css: { opacity: 1,   transform: "translateX(248px) scale(1.18)",
                                     background: "rgba(239,68,68,0.45)", borderColor: "#ef4444",
                                     boxShadow: "0 0 40px rgba(239,68,68,1)" } },
        // Bounce-shatter: reverse + spread downward
        { progress: hitP+0.10,css: { opacity: 0.8, transform: "translateX(200px) translateY(16px) scale(0.9)",
                                     background: "rgba(239,68,68,0.3)", borderColor: "#ef4444",
                                     boxShadow: "0 0 20px rgba(239,68,68,0.5)" } },
        { progress: hitP+0.25,css: { opacity: 0.45,transform: "translateX(150px) translateY(42px) scale(0.65) rotate(-4deg)" } },
        { progress: 1.0,      css: { opacity: 0,   transform: "translateX(100px) translateY(80px) scale(0.25) rotate(-8deg)" } }
      ]
    });
  }

  //                     id        y    label
  const p1 = makePill("req1", 216); p1.add(makePillLabel("req1", "REQ #1  →  GET /api")); scene.add(p1);
  const p2 = makePill("req2", 258); p2.add(makePillLabel("req2", "REQ #2  →  GET /api")); scene.add(p2);
  const p3 = makePill("req3", 300); p3.add(makePillLabel("req3", "REQ #3  →  GET /api")); scene.add(p3);
  const p4 = makePill("req4", 344); p4.add(makePillLabel("req4", "REQ #4  →  429 ⚡")); scene.add(p4);
  const p5 = makePill("req5", 386); p5.add(makePillLabel("req5", "REQ #5  →  429 ⚡")); scene.add(p5);

  animateAccepted(p1, { start: 700,  tokenAt: 1600 });
  animateAccepted(p2, { start: 1450, tokenAt: 2400 });
  animateAccepted(p3, { start: 2200, tokenAt: 3200 });
  animateRejected(p4, { start: 3200, hitAt:   3600 });
  animateRejected(p5, { start: 3850, hitAt:   4300 });

  // ── Status labels that appear over each pill at key moments ──
  function makeStatusFlash(id, text, color, yPx, showAt) {
    const lbl = new TextLayer({
      id,
      content: text,
      style: {
        left: "420px", top: `${yPx}px`, width: "100px", textAlign: "center",
        fontSize: "11px", fontFamily: "Inter, sans-serif", fontWeight: "700",
        letterSpacing: "1px", color, opacity: 0
      }
    });
    lbl.animate({ delay: showAt, duration: 250, ease: "ease-out",
      from: { opacity: 0, transform: "translateY(4px) scale(0.8)" },
      to:   { opacity: 1, transform: "translateY(0px) scale(1)" }
    });
    lbl.animate({ delay: showAt + 900, duration: 400, ease: "ease-in",
      from: { opacity: 1 }, to: { opacity: 0 }
    });
    return lbl;
  }
  scene.add(makeStatusFlash("lbl_ok1",  "200 OK ✓",  "#34d399", 208, 1680));
  scene.add(makeStatusFlash("lbl_ok2",  "200 OK ✓",  "#34d399", 250, 2480));
  scene.add(makeStatusFlash("lbl_ok3",  "200 OK ✓",  "#34d399", 292, 3280));
  scene.add(makeStatusFlash("lbl_429a", "429 ✗",     "#ef4444", 336, 3650));
  scene.add(makeStatusFlash("lbl_429b", "429 ✗",     "#ef4444", 378, 4350));

  // ─── 9. Bottom Metrics Strip ──────────────────────────────────
  const metricsY = 558;
  const metricsDefs = [
    { id: "m_total",   title: "TOTAL REQUESTS", val: "5",           color: "#94a3b8", x: 68  },
    { id: "m_ok",      title: "200 OK ACCEPTED", val: "3",          color: "#34d399", x: 358 },
    { id: "m_drop",    title: "429 THROTTLED",   val: "2",          color: "#ef4444", x: 648 },
    { id: "m_protect", title: "UPSTREAM SAVED",  val: "100% clean", color: "#38bdf8", x: 938 }
  ];

  metricsDefs.forEach((m, i) => {
    const card = new GroupLayer({
      id: m.id,
      style: {
        left: `${m.x}px`, top: `${metricsY}px`, width: "254px", height: "88px",
        borderRadius: "14px",
        background: "rgba(8,14,30,0.72)",
        border: "1px solid rgba(255,255,255,0.07)"
      }
    });
    card.animate({ delay: 400 + i * 90, duration: 650, ease: [0.16, 1, 0.3, 1],
      from: { opacity: 0, transform: "translateY(22px)" }, to: { opacity: 1, transform: "translateY(0px)" } });

    card.add(new TextLayer({ id: `${m.id}_t`, content: m.title, style: {
      left: "20px", top: "18px", width: "214px",
      fontSize: "10px", fontFamily: "Inter, sans-serif", fontWeight: "700",
      letterSpacing: "1.5px", color: "#334155"
    }}));
    card.add(new TextLayer({ id: `${m.id}_v`, content: m.val, style: {
      left: "20px", top: "40px", width: "214px",
      fontSize: "22px", fontFamily: "'Segoe UI', Inter, sans-serif",
      fontWeight: "800", letterSpacing: "0.5px", color: m.color
    }}));
    scene.add(card);
  });

  // Thin separator above metrics
  const metricsLine = new BoxLayer({
    id: "metrics_sep",
    style: {
      left: "68px", top: `${metricsY - 12}px`, width: "1144px", height: "1px",
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 20%, rgba(255,255,255,0.07) 80%, transparent)"
    }
  });
  metricsLine.animate({ delay: 380, duration: 600, ease: [0.16, 1, 0.3, 1],
    from: { opacity: 0, transform: "scaleX(0.6)" }, to: { opacity: 1, transform: "scaleX(1)" } });
  scene.add(metricsLine);

  // ─── 10. Audio Cues ──────────────────────────────────────────
  // Soft intro whoosh as panels arrive
  scene.add(new AudioLayer({ id: "sfx_whoosh",    src: "assets/sfx/FreeSFX/GameSFX/Swoosh/Retro Swooosh 02.wav", start: 150,  volume: 0.20 }));
  // Token 1 consumed
  scene.add(new AudioLayer({ id: "sfx_coin1",     src: "assets/sfx/FreeSFX/GameSFX/PickUp/Retro PickUp Coin 04.wav",         start: 1600, volume: 0.65 }));
  // Token 2 consumed
  scene.add(new AudioLayer({ id: "sfx_coin2",     src: "assets/sfx/FreeSFX/GameSFX/PickUp/Retro PickUp Coin 04.wav",         start: 2400, volume: 0.65 }));
  // Last token consumed (same pitch – final coin)
  scene.add(new AudioLayer({ id: "sfx_coin3",     src: "assets/sfx/FreeSFX/GameSFX/PickUp/Retro PickUp Coin 04.wav",         start: 3200, volume: 0.75 }));
  // Rejection #1 electric zap
  scene.add(new AudioLayer({ id: "sfx_zap1",      src: "assets/sfx/FreeSFX/GameSFX/Electric/Retro Electric Short 03.wav",    start: 3600, volume: 0.85 }));
  // Rejection #2 electric zap
  scene.add(new AudioLayer({ id: "sfx_zap2",      src: "assets/sfx/FreeSFX/GameSFX/Electric/Retro Electric Short 03.wav",    start: 4300, volume: 0.85 }));
  // Refill chime
  scene.add(new AudioLayer({ id: "sfx_refill",    src: "assets/sfx/FreeSFX/GameSFX/Ascending/Retro Ascending Short 20.wav",  start: 4900, volume: 0.55 }));

  // ─── Bake ─────────────────────────────────────────────────────
  const saved = await scene.save("examples/rate_limiter.json");
  console.log(`[rate_limiter] Baked → ${saved}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
