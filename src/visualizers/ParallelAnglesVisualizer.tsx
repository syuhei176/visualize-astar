import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type AngleMode = "corresponding" | "alternate" | "cointerior";

const MODES: { id: AngleMode; name: string; nameEn: string }[] = [
  { id: "corresponding", name: "同位角", nameEn: "Corresponding Angles" },
  { id: "alternate", name: "錯角", nameEn: "Alternate Angles" },
  { id: "cointerior", name: "同側内角", nameEn: "Co-interior Angles" },
];

const COLORS = {
  line: "rgba(255, 255, 255, 0.5)",
  parallel: "#42a5f5",
  transversal: "#ff9800",
  angleA: "#69f0ae",
  angleB: "#ef5350",
  highlight: "#ffd740",
};

function ParallelAnglesVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<AngleMode>("corresponding");
  const [angle, setAngle] = useState(60);
  const draggingRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0 });

  const getCanvasCoords = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const handlePointerDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCanvasCoords(e);
      const { w, h } = sizeRef.current;
      // Check if near the transversal line endpoints area
      const topY = h * 0.15;
      const botY = h * 0.85;
      const midX = w * 0.5;
      const tanA = Math.tan((angle * Math.PI) / 180);
      const halfH = (botY - topY) / 2;
      const topX = midX - halfH / tanA;
      const botX = midX + halfH / tanA;
      // Check distance to the transversal line
      const dx = botX - topX;
      const dy = botY - topY;
      const len = Math.sqrt(dx * dx + dy * dy);
      const dist = Math.abs((x - topX) * dy - (y - topY) * dx) / len;
      if (dist < 30) {
        draggingRef.current = true;
        e.preventDefault();
      }
    },
    [getCanvasCoords, angle],
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const { x } = getCanvasCoords(e);
      const { w, h } = sizeRef.current;
      const midX = w * 0.5;
      const line2Y = h * 0.6;
      // Calculate angle from intersection point on line2
      const dy = h * 0.15 - line2Y; // pointing upward
      const dx = x - midX;
      let newAngle = Math.atan2(-dy, dx) * (180 / Math.PI);
      newAngle = Math.max(20, Math.min(160, newAngle));
      setAngle(Math.round(newAngle));
    },
    [getCanvasCoords],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("touchstart", handlePointerDown, { passive: false });
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

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
    sizeRef.current = { w, h };
    ctx.clearRect(0, 0, w, h);

    const margin = 30;
    const line1Y = h * 0.35;
    const line2Y = h * 0.65;

    // Draw parallel lines
    ctx.strokeStyle = COLORS.parallel;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(margin, line1Y);
    ctx.lineTo(w - margin, line1Y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(margin, line2Y);
    ctx.lineTo(w - margin, line2Y);
    ctx.stroke();

    // Parallel arrows
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = COLORS.parallel;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("ℓ₁", w - margin - 4, line1Y - 6);
    ctx.fillText("ℓ₂", w - margin - 4, line2Y - 6);

    // Parallel marks (arrows on right side)
    for (const ly of [line1Y, line2Y]) {
      const mx = w - margin - 30;
      ctx.beginPath();
      ctx.moveTo(mx - 6, ly - 5);
      ctx.lineTo(mx, ly);
      ctx.lineTo(mx - 6, ly + 5);
      ctx.strokeStyle = COLORS.parallel;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Calculate transversal line through both intersection points
    const angleRad = (angle * Math.PI) / 180;
    const inter1: { x: number; y: number } = { x: w * 0.45, y: line1Y };
    const inter2: { x: number; y: number } = {
      x: w * 0.45 + (line2Y - line1Y) / Math.tan(angleRad),
      y: line2Y,
    };

    // Extend transversal beyond both lines
    const dx = Math.cos(angleRad);
    const dy = -Math.sin(angleRad);
    const ext = Math.max(w, h);

    ctx.strokeStyle = COLORS.transversal;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(inter1.x - dx * ext, inter1.y + dy * ext);
    ctx.lineTo(inter1.x + dx * ext, inter1.y - dy * ext);
    ctx.stroke();

    // Draw angle arcs
    const arcR = 35;

    const drawArc = (
      cx: number,
      cy: number,
      startAngle: number,
      endAngle: number,
      color: string,
      label: string,
    ) => {
      // Normalize angles
      let start = startAngle;
      let end = endAngle;
      if (end < start) end += Math.PI * 2;
      let sweep = end - start;
      if (sweep > Math.PI) {
        sweep = 2 * Math.PI - sweep;
        const tmp = start;
        start = end;
        end = tmp;
        if (end < start) end += Math.PI * 2;
      }

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, arcR, start, end);
      ctx.closePath();
      ctx.fillStyle = color.replace(")", ", 0.15)").replace("rgb", "rgba").replace("#", "");
      // Convert hex to rgba for fill
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, arcR, start, end);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Label
      const midA = (start + end) / 2;
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, cx + (arcR + 18) * Math.cos(midA), cy + (arcR + 18) * Math.sin(midA));
    };

    // Transversal direction angle (going "up-right")
    const transAngle = Math.atan2(inter1.y - inter2.y, inter1.x - inter2.x);
    const transAngleOpp = transAngle + Math.PI;

    // Angles at intersection 1 (upper line)
    // Right side of line ℓ₁: angle between line going right and transversal going down
    const lineRight = 0; // angle of line going right
    const lineLeft = Math.PI; // angle of line going left

    if (mode === "corresponding") {
      // Corresponding angles: same position at each intersection
      // Angle between line-right and transversal-up at intersection 1
      drawArc(inter1.x, inter1.y, transAngle, lineRight, COLORS.angleA, `${angle}°`);
      drawArc(inter2.x, inter2.y, transAngle, lineRight, COLORS.angleB, `${angle}°`);
    } else if (mode === "alternate") {
      // Alternate interior angles: between the parallel lines, on opposite sides
      // At inter1: angle below the line (interior), right side of transversal
      drawArc(inter1.x, inter1.y, lineLeft, transAngleOpp, COLORS.angleA, `${angle}°`);
      // At inter2: angle above the line (interior), left side of transversal
      drawArc(inter2.x, inter2.y, transAngle, lineRight, COLORS.angleB, `${angle}°`);
    } else {
      // Co-interior angles: same side, between lines
      const supplementary = 180 - angle;
      drawArc(inter1.x, inter1.y, lineRight, transAngleOpp, COLORS.angleA, `${supplementary}°`);
      drawArc(inter2.x, inter2.y, transAngle, lineRight, COLORS.angleB, `${angle}°`);
    }

    // Intersection points
    for (const p of [inter1, inter2]) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }

    // "Parallel" indicator
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin + 8, (line1Y + line2Y) / 2 - 15);
    ctx.lineTo(margin + 8, (line1Y + line2Y) / 2 + 15);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "left";
    ctx.fillText("ℓ₁ // ℓ₂", margin + 14, (line1Y + line2Y) / 2 + 4);
  }, [angle, mode]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const currentMode = MODES.find((m) => m.id === mode)!;
  const supplementary = 180 - angle;

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>平行線と角</h2>
        <p className="algo-subtitle">Parallel Lines & Angles</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={mode === m.id ? "btn-step" : "btn-reset"}
            onClick={() => setMode(m.id)}
            style={{ fontSize: "13px", padding: "6px 12px" }}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="formula">
        {mode === "corresponding" && `同位角は等しい：∠a = ∠b = ${angle}°`}
        {mode === "alternate" && `錯角は等しい：∠a = ∠b = ${angle}°`}
        {mode === "cointerior" && `同側内角の和 = 180°：${supplementary}° + ${angle}° = 180°`}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{angle}°</span>
            <span className="stat-label">角度</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{currentMode.name}</span>
            <span className="stat-label">{currentMode.nameEn}</span>
          </div>
          {mode === "cointerior" && (
            <div className="stat-item">
              <span className="stat-value">180°</span>
              <span className="stat-label">和</span>
            </div>
          )}
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>∠</label>
          <input
            type="range"
            min="20"
            max="160"
            step="1"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
          />
          <span className="value">{angle}°</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          スライダーまたは斜線をドラッグして角度を変え、{currentMode.name}の性質を確認しよう
        </p>
      </div>
    </div>
  );
}

export default ParallelAnglesVisualizer;
