import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type CircuitMode = "series" | "parallel" | "mixed";

const MODES: { id: CircuitMode; name: string; desc: string }[] = [
  { id: "series", name: "直列", desc: "Series" },
  { id: "parallel", name: "並列", desc: "Parallel" },
  { id: "mixed", name: "直列+並列", desc: "Series & Parallel" },
];

function calcCircuit(
  mode: CircuitMode,
  V: number,
  R1: number,
  R2: number,
  R3: number,
) {
  if (mode === "series") {
    const Rt = R1 + R2;
    const I = V / Rt;
    return {
      Rt,
      I_total: I,
      I1: I,
      I2: I,
      I3: 0,
      V1: I * R1,
      V2: I * R2,
      V3: 0,
    };
  } else if (mode === "parallel") {
    const Rt = 1 / (1 / R1 + 1 / R2);
    const I = V / Rt;
    return {
      Rt,
      I_total: I,
      I1: V / R1,
      I2: V / R2,
      I3: 0,
      V1: V,
      V2: V,
      V3: 0,
    };
  } else {
    // mixed: R1 in series with (R2 || R3)
    const Rp = 1 / (1 / R2 + 1 / R3);
    const Rt = R1 + Rp;
    const I = V / Rt;
    const Vp = I * Rp;
    return {
      Rt,
      I_total: I,
      I1: I,
      I2: Vp / R2,
      I3: Vp / R3,
      V1: I * R1,
      V2: Vp,
      V3: Vp,
    };
  }
}

// Draw a zigzag resistor symbol
function drawResistor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  horizontal: boolean,
  label: string,
  color: string,
  valueLabel: string,
) {
  const zigW = 7;
  const zigH = 5;
  const zigCount = 4;
  const totalLen = zigCount * zigH * 2;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  if (horizontal) {
    const startX = x - totalLen / 2;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    for (let i = 0; i < zigCount; i++) {
      const xOff = startX + i * zigH * 2;
      ctx.lineTo(xOff + zigH / 2, y - zigW);
      ctx.lineTo(xOff + zigH * 1.5, y + zigW);
      ctx.lineTo(xOff + zigH * 2, y);
    }
    ctx.stroke();

    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(label, x, y - zigW - 6);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px sans-serif";
    ctx.fillText(valueLabel, x, y + zigW + 14);
  } else {
    const startY = y - totalLen / 2;
    ctx.beginPath();
    ctx.moveTo(x, startY);
    for (let i = 0; i < zigCount; i++) {
      const yOff = startY + i * zigH * 2;
      ctx.lineTo(x + zigW, yOff + zigH / 2);
      ctx.lineTo(x - zigW, yOff + zigH * 1.5);
      ctx.lineTo(x, yOff + zigH * 2);
    }
    ctx.stroke();

    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + zigW + 6, y);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px sans-serif";
    ctx.fillText(valueLabel, x + zigW + 6, y + 14);
  }
  ctx.restore();
}

// Draw battery symbol
function drawBattery(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  voltage: number,
) {
  const gap = 6;
  const longLen = 16;
  const shortLen = 9;

  ctx.save();
  ctx.strokeStyle = "#ef5350";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - longLen, y - gap);
  ctx.lineTo(x + longLen, y - gap);
  ctx.stroke();

  ctx.strokeStyle = "#42a5f5";
  ctx.beginPath();
  ctx.moveTo(x - shortLen, y + gap);
  ctx.lineTo(x + shortLen, y + gap);
  ctx.stroke();

  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ef5350";
  ctx.fillText("+", x, y - gap - 8);
  ctx.fillStyle = "#42a5f5";
  ctx.fillText("−", x, y + gap + 16);

  ctx.fillStyle = "#ffca28";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`${voltage}V`, x - longLen - 6, y + 4);
  ctx.restore();
}

// Draw electrons along a path
function drawElectrons(
  ctx: CanvasRenderingContext2D,
  path: { x: number; y: number }[],
  current: number,
  time: number,
  offset: number,
) {
  if (path.length < 2 || current < 0.01) return;

  // Calculate total path length
  let totalLen = 0;
  const segments: number[] = [0];
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    totalLen += Math.sqrt(dx * dx + dy * dy);
    segments.push(totalLen);
  }

  const speed = current * 0.4;
  const numE = Math.max(3, Math.min(12, Math.round(current * 2.5)));

  for (let i = 0; i < numE; i++) {
    const frac =
      (((time * speed * 0.015 + i / numE + offset) % 1) + 1) % 1;
    const targetDist = frac * totalLen;

    // Find segment
    let ex = path[0].x;
    let ey = path[0].y;
    for (let s = 1; s < segments.length; s++) {
      if (targetDist <= segments[s]) {
        const segLen = segments[s] - segments[s - 1];
        const t = segLen > 0 ? (targetDist - segments[s - 1]) / segLen : 0;
        ex = path[s - 1].x + (path[s].x - path[s - 1].x) * t;
        ey = path[s - 1].y + (path[s].y - path[s - 1].y) * t;
        break;
      }
    }

    ctx.beginPath();
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#4fc3f7";
    ctx.fill();

    const grad = ctx.createRadialGradient(ex, ey, 1.5, ex, ey, 7);
    grad.addColorStop(0, "rgba(79, 195, 247, 0.35)");
    grad.addColorStop(1, "rgba(79, 195, 247, 0)");
    ctx.beginPath();
    ctx.arc(ex, ey, 7, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

// Draw a wire path
function drawWire(
  ctx: CanvasRenderingContext2D,
  path: { x: number; y: number }[],
) {
  if (path.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function CircuitVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [mode, setMode] = useState<CircuitMode>("series");
  const [voltage, setVoltage] = useState(12);
  const [r1, setR1] = useState(4);
  const [r2, setR2] = useState(6);
  const [r3, setR3] = useState(3);

  const circuit = calcCircuit(mode, voltage, r1, r2, r3);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const t = timeRef.current;

    // Resistor half-length (must match drawResistor zigzag: zigCount * zigH * 2 / 2)
    const resHalf = 20;
    // Battery half-height (gap between + and - lines)
    const batHalf = 6;

    if (mode === "series") {
      const cW = Math.min(w * 0.7, 300);
      const cH = Math.min(h * 0.5, 200);
      const l = cx - cW / 2;
      const r = cx + cW / 2;
      const tp = cy - cH / 2;
      const bt = cy + cH / 2;

      // Wires (split left vertical around battery)
      drawWire(ctx, [{ x: l, y: tp }, { x: cx - resHalf, y: tp }]);
      drawWire(ctx, [{ x: cx + resHalf, y: tp }, { x: r, y: tp }, { x: r, y: bt }, { x: cx + resHalf, y: bt }]);
      drawWire(ctx, [{ x: cx - resHalf, y: bt }, { x: l, y: bt }]);
      drawWire(ctx, [{ x: l, y: bt }, { x: l, y: cy + batHalf }]);
      drawWire(ctx, [{ x: l, y: cy - batHalf }, { x: l, y: tp }]);

      drawBattery(ctx, l, cy, voltage);

      drawResistor(ctx, cx, tp, true, "R₁", "#ff9800", `${r1}Ω`);
      drawResistor(ctx, cx, bt, true, "R₂", "#ab47bc", `${r2}Ω`);

      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#69f0ae";
      ctx.textAlign = "left";
      ctx.fillText(`I = ${circuit.I_total.toFixed(2)}A`, r + 8, cy);

      ctx.fillStyle = "#ffca28";
      ctx.textAlign = "center";
      ctx.fillText(`${circuit.V1.toFixed(1)}V`, cx, tp + 32);
      ctx.fillText(`${circuit.V2.toFixed(1)}V`, cx, bt + 32);

      const fullPath = [
        { x: l, y: tp }, { x: r, y: tp }, { x: r, y: bt }, { x: l, y: bt }, { x: l, y: tp },
      ];
      drawElectrons(ctx, fullPath, circuit.I_total, t, 0);

    } else if (mode === "parallel") {
      // Parallel: main wire splits into two branches then rejoins
      //
      //                 splitX         joinX
      //  ┌──bat──────────┬──── R1 ────┬──────────┐
      //  │               │            │          │
      //  │               └──── R2 ────┘          │
      //  └───────────────────────────────────────┘
      //
      const cW = Math.min(w * 0.8, 340);
      const cH = Math.min(h * 0.5, 200);
      const l = cx - cW / 2;
      const r = cx + cW / 2;
      const mainY = cy - cH / 3;
      const branchY = cy + cH * 0.15;
      const bottomY = cy + cH / 2;

      // Split/join points
      const splitX = cx - cW * 0.15;
      const joinX = cx + cW * 0.25;
      const resX = (splitX + joinX) / 2;

      // Main top wire: left -> battery gap -> split
      drawWire(ctx, [{ x: l, y: mainY }, { x: l + 30 - batHalf, y: mainY }]);
      // We place battery horizontally on the top wire
      // Actually let's place battery on the left vertical
      // Top wire from battery area to split
      drawWire(ctx, [{ x: l + 30 + batHalf, y: mainY }, { x: splitX, y: mainY }]);

      // Upper branch: split -> R1 -> join (straight through on main wire)
      drawWire(ctx, [{ x: splitX, y: mainY }, { x: resX - resHalf, y: mainY }]);
      drawWire(ctx, [{ x: resX + resHalf, y: mainY }, { x: joinX, y: mainY }]);

      // Lower branch: split -> down -> R2 -> up -> join
      drawWire(ctx, [{ x: splitX, y: mainY }, { x: splitX, y: branchY }, { x: resX - resHalf, y: branchY }]);
      drawWire(ctx, [{ x: resX + resHalf, y: branchY }, { x: joinX, y: branchY }, { x: joinX, y: mainY }]);

      // Main wire continues: join -> right -> bottom -> left -> back to start
      drawWire(ctx, [{ x: joinX, y: mainY }, { x: r, y: mainY }, { x: r, y: bottomY }, { x: l, y: bottomY }, { x: l, y: mainY }]);

      // Battery (horizontal on top wire, near left)
      const batCx = l + 30;
      // Draw battery rotated 90° (horizontal orientation)
      ctx.save();
      // + line (right side = towards circuit)
      ctx.strokeStyle = "#ef5350";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(batCx + batHalf, mainY - 16);
      ctx.lineTo(batCx + batHalf, mainY + 16);
      ctx.stroke();
      // - line (left side = towards return)
      ctx.strokeStyle = "#42a5f5";
      ctx.beginPath();
      ctx.moveTo(batCx - batHalf, mainY - 9);
      ctx.lineTo(batCx - batHalf, mainY + 9);
      ctx.stroke();
      // Labels
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#ef5350";
      ctx.fillText("+", batCx + batHalf + 10, mainY + 4);
      ctx.fillStyle = "#42a5f5";
      ctx.fillText("−", batCx - batHalf - 10, mainY + 4);
      ctx.fillStyle = "#ffca28";
      ctx.fillText(`${voltage}V`, batCx, mainY - 22);
      ctx.restore();

      // Resistors
      drawResistor(ctx, resX, mainY, true, "R₁", "#ff9800", `${r1}Ω`);
      drawResistor(ctx, resX, branchY, true, "R₂", "#ab47bc", `${r2}Ω`);

      // Split/join dots to show junction
      for (const jx of [splitX, joinX]) {
        ctx.beginPath();
        ctx.arc(jx, mainY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }

      // Current labels
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#69f0ae";
      ctx.textAlign = "left";
      ctx.fillText(`I₁ = ${circuit.I1.toFixed(2)}A`, resX + resHalf + 8, mainY - 10);
      ctx.fillText(`I₂ = ${circuit.I2.toFixed(2)}A`, resX + resHalf + 8, branchY - 10);
      ctx.textAlign = "center";
      ctx.fillText(`I = ${circuit.I_total.toFixed(2)}A`, (l + l + 30) / 2, bottomY + 16);

      // Electrons: top branch (main line loop)
      const topLoop = [
        { x: l, y: mainY }, { x: splitX, y: mainY },
        { x: joinX, y: mainY }, { x: r, y: mainY },
        { x: r, y: bottomY }, { x: l, y: bottomY }, { x: l, y: mainY },
      ];
      drawElectrons(ctx, topLoop, circuit.I1, t, 0);

      // Electrons: bottom branch (detour through branchY)
      const botLoop = [
        { x: l, y: mainY }, { x: splitX, y: mainY },
        { x: splitX, y: branchY }, { x: joinX, y: branchY },
        { x: joinX, y: mainY }, { x: r, y: mainY },
        { x: r, y: bottomY }, { x: l, y: bottomY }, { x: l, y: mainY },
      ];
      drawElectrons(ctx, botLoop, circuit.I2, t, 0.15);

    } else {
      // Mixed: R1 in series with (R2 || R3)
      const cW = Math.min(w * 0.8, 360);
      const cH = Math.min(h * 0.55, 220);
      const l = cx - cW / 2;
      const r = cx + cW / 2;
      const tp = cy - cH / 2;
      const bt = cy + cH / 2;

      // R1 position on top wire
      const r1x = l + cW * 0.25;

      // Split/join points for parallel section
      const splitX = cx + cW * 0.05;
      const joinX = r;
      const gap = cH * 0.4;
      const branchTop = cy - gap / 2;
      const branchBot = cy + gap / 2;
      const parX = (splitX + joinX) / 2;

      // Top wire: left -> R1 -> split
      drawWire(ctx, [{ x: l, y: tp }, { x: r1x - resHalf, y: tp }]);
      drawWire(ctx, [{ x: r1x + resHalf, y: tp }, { x: splitX, y: tp }]);

      // Split down to branches
      drawWire(ctx, [{ x: splitX, y: tp }, { x: splitX, y: branchTop }, { x: parX - resHalf, y: branchTop }]);
      drawWire(ctx, [{ x: splitX, y: tp }, { x: splitX, y: branchBot }, { x: parX - resHalf, y: branchBot }]);

      // Branches to join
      drawWire(ctx, [{ x: parX + resHalf, y: branchTop }, { x: joinX, y: branchTop }, { x: joinX, y: branchBot }, { x: parX + resHalf, y: branchBot }]);

      // Bottom return wire (split left vertical around battery)
      drawWire(ctx, [{ x: joinX, y: branchBot }, { x: joinX, y: bt }, { x: l, y: bt }]);
      drawWire(ctx, [{ x: l, y: bt }, { x: l, y: cy + batHalf }]);
      drawWire(ctx, [{ x: l, y: cy - batHalf }, { x: l, y: tp }]);

      drawBattery(ctx, l, cy, voltage);

      // Resistors
      drawResistor(ctx, r1x, tp, true, "R₁", "#ff9800", `${r1}Ω`);
      drawResistor(ctx, parX, branchTop, true, "R₂", "#ab47bc", `${r2}Ω`);
      drawResistor(ctx, parX, branchBot, true, "R₃", "#26c6da", `${r3}Ω`);

      // Current labels
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#69f0ae";
      ctx.textAlign = "center";
      ctx.fillText(`I = ${circuit.I_total.toFixed(2)}A`, (l + r1x) / 2, tp - 12);
      ctx.textAlign = "left";
      ctx.fillText(`I₂ = ${circuit.I2.toFixed(2)}A`, parX + resHalf + 8, branchTop - 6);
      ctx.fillText(`I₃ = ${circuit.I3.toFixed(2)}A`, parX + resHalf + 8, branchBot - 6);

      // Voltage labels
      ctx.fillStyle = "#ffca28";
      ctx.textAlign = "center";
      ctx.fillText(`${circuit.V1.toFixed(1)}V`, r1x, tp + 32);
      ctx.fillText(`${circuit.V2.toFixed(1)}V`, parX, branchTop + 32);

      // Top branch electrons
      const topPath = [
        { x: l, y: tp }, { x: splitX, y: tp },
        { x: splitX, y: branchTop }, { x: joinX, y: branchTop },
        { x: joinX, y: bt }, { x: l, y: bt }, { x: l, y: tp },
      ];
      drawElectrons(ctx, topPath, circuit.I2, t, 0);

      // Bottom branch electrons
      const botPath = [
        { x: l, y: tp }, { x: splitX, y: tp },
        { x: splitX, y: branchBot }, { x: joinX, y: branchBot },
        { x: joinX, y: bt }, { x: l, y: bt }, { x: l, y: tp },
      ];
      drawElectrons(ctx, botPath, circuit.I3, t, 0.25);
    }
  }, [mode, voltage, r1, r2, r3, circuit]);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      timeRef.current += 1;
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>オームの法則</h2>
        <p className="algo-subtitle">V = IR</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={mode === m.id ? "btn-step" : "btn-reset"}
            onClick={() => setMode(m.id)}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="formula">
        {mode === "series" && `R = R₁ + R₂ = ${r1} + ${r2} = ${circuit.Rt.toFixed(1)}Ω`}
        {mode === "parallel" &&
          `1/R = 1/R₁ + 1/R₂ → R = ${circuit.Rt.toFixed(2)}Ω`}
        {mode === "mixed" &&
          `R = R₁ + (R₂∥R₃) = ${r1} + ${(circuit.Rt - r1).toFixed(2)} = ${circuit.Rt.toFixed(2)}Ω`}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ffca28" }}>
              {voltage}V
            </span>
            <span className="stat-label">電圧</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">=</span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>
              {circuit.I_total.toFixed(2)}A
            </span>
            <span className="stat-label">電流</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">×</span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ff9800" }}>
              {circuit.Rt.toFixed(1)}&Omega;
            </span>
            <span className="stat-label">合成抵抗</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>電圧</label>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
          />
          <span className="value">{voltage}V</span>
        </div>
        <div className="slider-group">
          <label>R₁</label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={r1}
            onChange={(e) => setR1(Number(e.target.value))}
          />
          <span className="value">{r1}&Omega;</span>
        </div>
        <div className="slider-group">
          <label>R₂</label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={r2}
            onChange={(e) => setR2(Number(e.target.value))}
          />
          <span className="value">{r2}&Omega;</span>
        </div>
        {mode === "mixed" && (
          <div className="slider-group">
            <label>R₃</label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={r3}
              onChange={(e) => setR3(Number(e.target.value))}
            />
            <span className="value">{r3}&Omega;</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CircuitVisualizer;
