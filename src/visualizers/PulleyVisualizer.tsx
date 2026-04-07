import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type PulleyMode = "fixed" | "movable";

function PulleyVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [mode, setMode] = useState<PulleyMode>("fixed");
  const [load, setLoad] = useState(60); // N
  const [pulling, setPulling] = useState(false);
  const pullPosRef = useRef(0);

  const appliedForce = mode === "fixed" ? load : load / 2;
  const ropeDistance = mode === "fixed" ? 1 : 2;

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
    const t = timeRef.current;

    if (pulling) {
      pullPosRef.current = Math.min(pullPosRef.current + 0.5, 80);
    }
    const pullAmt = pullPosRef.current;

    if (mode === "fixed") {
      // Fixed pulley: attached to ceiling, changes direction only
      const pulleyY = 60;
      const pulleyR = 25;

      // Ceiling
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(0, 0, w, 20);
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 20);
        ctx.lineTo(i + 10, 0);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Support
      ctx.beginPath();
      ctx.moveTo(cx, 20);
      ctx.lineTo(cx, pulleyY - pulleyR);
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pulley wheel
      ctx.beginPath();
      ctx.arc(cx, pulleyY, pulleyR, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff9800";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, pulleyY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ff9800";
      ctx.fill();

      // Rotation indicator
      const rotAngle = pulling ? t * 0.05 : 0;
      for (let i = 0; i < 4; i++) {
        const a = rotAngle + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 8, pulleyY + Math.sin(a) * 8);
        ctx.lineTo(cx + Math.cos(a) * (pulleyR - 4), pulleyY + Math.sin(a) * (pulleyR - 4));
        ctx.strokeStyle = "rgba(255,152,0,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Rope - left side (load)
      const loadY = pulleyY + pulleyR + 100 - pullAmt;
      ctx.beginPath();
      ctx.moveTo(cx - pulleyR, pulleyY);
      ctx.lineTo(cx - pulleyR, loadY);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Rope over pulley
      ctx.beginPath();
      ctx.arc(cx, pulleyY, pulleyR, Math.PI, 0, false);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Rope - right side (pull)
      const pullEndY = pulleyY + pulleyR + 100 + pullAmt;
      ctx.beginPath();
      ctx.moveTo(cx + pulleyR, pulleyY);
      ctx.lineTo(cx + pulleyR, pullEndY);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Load box
      const boxW = 50;
      const boxH = 40;
      ctx.fillStyle = "#42a5f5";
      ctx.beginPath();
      ctx.roundRect(cx - pulleyR - boxW / 2, loadY, boxW, boxH, 6);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${load}N`, cx - pulleyR, loadY + boxH / 2);

      // Force arrows
      // Load gravity
      drawForceArrow(ctx, cx - pulleyR, loadY + boxH + 5, 0, 40, "#ef5350", `W=${load}N`);
      // Applied force (pulling down on right side)
      drawForceArrow(ctx, cx + pulleyR, pullEndY - 5, 0, 40, "#69f0ae", `F=${appliedForce}N`);

      // Hand icon
      ctx.fillStyle = "#69f0ae";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("\u270b", cx + pulleyR, pullEndY + 50);

      // Direction note
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("向きが変わる", cx, h - 30);
      ctx.fillText(`F = W = ${load}N`, cx, h - 14);

    } else {
      // Movable pulley: pulley moves with load, halves force
      const ceilingY = 20;
      const topAnchorY = 50;
      const pulleyR = 25;
      const pulleyBaseY = 140;
      const pulleyY = pulleyBaseY - pullAmt / 2;

      // Ceiling
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(0, 0, w, ceilingY);
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, ceilingY);
        ctx.lineTo(i + 10, 0);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Left rope fixed to ceiling
      ctx.beginPath();
      ctx.moveTo(cx - pulleyR, ceilingY);
      ctx.lineTo(cx - pulleyR, pulleyY);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Anchor point
      ctx.beginPath();
      ctx.arc(cx - pulleyR, ceilingY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      // Rope under pulley
      ctx.beginPath();
      ctx.arc(cx, pulleyY, pulleyR, Math.PI, 0, true);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Right rope going up to person pulling
      const pullTopY = topAnchorY;
      ctx.beginPath();
      ctx.moveTo(cx + pulleyR, pulleyY);
      ctx.lineTo(cx + pulleyR, pullTopY);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pulley wheel
      ctx.beginPath();
      ctx.arc(cx, pulleyY, pulleyR, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff9800";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, pulleyY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ff9800";
      ctx.fill();

      // Rotation
      const rotAngle = pulling ? t * 0.05 : 0;
      for (let i = 0; i < 4; i++) {
        const a = rotAngle + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 8, pulleyY + Math.sin(a) * 8);
        ctx.lineTo(cx + Math.cos(a) * (pulleyR - 4), pulleyY + Math.sin(a) * (pulleyR - 4));
        ctx.strokeStyle = "rgba(255,152,0,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Load box
      const boxW = 50;
      const boxH = 40;
      const loadY = pulleyY + pulleyR + 10;
      ctx.fillStyle = "#42a5f5";
      ctx.beginPath();
      ctx.roundRect(cx - boxW / 2, loadY, boxW, boxH, 6);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${load}N`, cx, loadY + boxH / 2);

      // Gravity arrow
      drawForceArrow(ctx, cx, loadY + boxH + 5, 0, 40, "#ef5350", `W=${load}N`);
      // Applied force arrow (pulling up)
      drawForceArrow(ctx, cx + pulleyR + 20, pullTopY + 30, 0, -30, "#69f0ae", `F=${appliedForce}N`);

      // Hand
      ctx.fillStyle = "#69f0ae";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("\u270b", cx + pulleyR, pullTopY - 5);

      // Labels for tension in each rope
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`T=${appliedForce}N`, cx - pulleyR - 5, (ceilingY + pulleyY) / 2);
      ctx.textAlign = "left";
      ctx.fillText(`T=${appliedForce}N`, cx + pulleyR + 5, (pullTopY + pulleyY) / 2);

      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("力が半分になる", cx, h - 30);
      ctx.fillText(`F = W/2 = ${load}/2 = ${appliedForce}N`, cx, h - 14);
    }
  }, [mode, load, pulling, appliedForce]);

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

  const handlePull = () => {
    pullPosRef.current = 0;
    setPulling(true);
    setTimeout(() => setPulling(false), 3000);
  };

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>滑車と仕事</h2>
        <p className="algo-subtitle">Pulleys &amp; Work</p>
      </div>

      <div className="step-info">
        <p className="step-description">
          定滑車と動滑車の違いを比べよう。仕事の量(力x距離)は同じです
        </p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button className={mode === "fixed" ? "btn-step" : "btn-reset"} onClick={() => { setMode("fixed"); pullPosRef.current = 0; setPulling(false); }}>
          定滑車
        </button>
        <button className={mode === "movable" ? "btn-step" : "btn-reset"} onClick={() => { setMode("movable"); pullPosRef.current = 0; setPulling(false); }}>
          動滑車
        </button>
        <button className="btn-step" onClick={handlePull} disabled={pulling}
          style={{ background: "linear-gradient(135deg, #e65100, #ff9800)" }}>
          引く!
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>荷重</label>
          <input type="range" min="10" max="100" step="10" value={load}
            onChange={(e) => setLoad(Number(e.target.value))} />
          <span className="value">{load}N</span>
        </div>
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ef5350" }}>{load}N</span>
            <span className="stat-label">荷重 W</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>{appliedForce}N</span>
            <span className="stat-label">必要な力 F</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ffca28" }}>{ropeDistance}x</span>
            <span className="stat-label">引く距離</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ab47bc" }}>{load}J</span>
            <span className="stat-label">仕事(同じ)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function drawForceArrow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, dx: number, dy: number,
  color: string, label: string,
) {
  const ex = x + dx;
  const ey = y + dy;
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - headLen * Math.cos(angle - 0.35), ey - headLen * Math.sin(angle - 0.35));
  ctx.lineTo(ex - headLen * Math.cos(angle + 0.35), ey - headLen * Math.sin(angle + 0.35));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, ex + 6, ey);
}

export default PulleyVisualizer;
