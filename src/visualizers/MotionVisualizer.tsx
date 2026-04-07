import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type MotionMode = "uniform" | "accelerated";

function MotionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [mode, setMode] = useState<MotionMode>("uniform");
  const [initialVelocity, setInitialVelocity] = useState(3);
  const [acceleration, setAcceleration] = useState(2);
  const [running, setRunning] = useState(false);
  const posHistoryRef = useRef<{ t: number; x: number; v: number }[]>([]);

  const reset = useCallback(() => {
    timeRef.current = 0;
    posHistoryRef.current = [{ t: 0, x: 0, v: initialVelocity }];
    setRunning(false);
  }, [initialVelocity]);

  useEffect(() => {
    reset();
  }, [mode, initialVelocity, acceleration, reset]);

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

    // Layout: top half = ball animation, bottom half = graphs
    const animH = h * 0.35;
    const graphH = (h - animH) / 2;
    const graphY1 = animH;
    const graphY2 = animH + graphH;
    const margin = 50;
    const graphW = w - margin * 2;

    const t = timeRef.current;
    const maxT = 8;
    const v0 = initialVelocity;
    const a = mode === "accelerated" ? acceleration : 0;

    // Current values
    const currentV = v0 + a * t;
    const currentX = v0 * t + 0.5 * a * t * t;

    // Record history
    if (running && t <= maxT) {
      posHistoryRef.current.push({ t, x: currentX, v: currentV });
    }

    // Max position for scaling
    const maxX = v0 * maxT + 0.5 * a * maxT * maxT;
    const maxV = v0 + a * maxT;
    const scaleX = (w - 80) / Math.max(maxX, 1);

    // --- Ball animation ---
    const groundY = animH - 20;
    const ballR = 14;

    // Ground line
    ctx.beginPath();
    ctx.moveTo(20, groundY);
    ctx.lineTo(w - 20, groundY);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Distance markers
    for (let d = 0; d <= maxX; d += Math.max(5, Math.round(maxX / 8))) {
      const mx = 40 + d * scaleX;
      if (mx > w - 20) break;
      ctx.beginPath();
      ctx.moveTo(mx, groundY - 4);
      ctx.lineTo(mx, groundY + 4);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${d}m`, mx, groundY + 14);
    }

    // Ball
    const ballX = Math.min(40 + currentX * scaleX, w - 30);
    const ballY = groundY - ballR;

    // Trail
    const history = posHistoryRef.current;
    if (history.length > 1) {
      ctx.beginPath();
      ctx.moveTo(40 + history[0].x * scaleX, ballY);
      for (const pt of history) {
        ctx.lineTo(Math.min(40 + pt.x * scaleX, w - 30), ballY);
      }
      ctx.strokeStyle = "rgba(66, 165, 245, 0.3)";
      ctx.lineWidth = ballR * 2;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Ball circle
    const grad = ctx.createRadialGradient(ballX - 3, ballY - 3, 2, ballX, ballY, ballR);
    grad.addColorStop(0, "#64b5f6");
    grad.addColorStop(1, "#1565c0");
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Velocity arrow
    const arrowLen = currentV * 10;
    if (Math.abs(arrowLen) > 2) {
      ctx.beginPath();
      ctx.moveTo(ballX, ballY);
      ctx.lineTo(ballX + arrowLen, ballY);
      ctx.strokeStyle = "#69f0ae";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      const dir = arrowLen > 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(ballX + arrowLen, ballY);
      ctx.lineTo(ballX + arrowLen - dir * 8, ballY - 5);
      ctx.lineTo(ballX + arrowLen - dir * 8, ballY + 5);
      ctx.closePath();
      ctx.fillStyle = "#69f0ae";
      ctx.fill();
    }

    // --- Position-time graph ---
    drawGraph(ctx, margin, graphY1 + 10, graphW, graphH - 20, "x-t \u30b0\u30e9\u30d5", "#42a5f5", maxT, Math.max(maxX, 1), (gt: number) => v0 * gt + 0.5 * a * gt * gt, history.map((p) => ({ t: p.t, val: p.x })), t);

    // --- Velocity-time graph ---
    drawGraph(ctx, margin, graphY2 + 10, graphW, graphH - 20, "v-t \u30b0\u30e9\u30d5", "#69f0ae", maxT, Math.max(maxV, v0, 1), (gt: number) => v0 + a * gt, history.map((p) => ({ t: p.t, val: p.v })), t);
  }, [mode, initialVelocity, acceleration, running]);

  useEffect(() => {
    let r = true;
    const animate = () => {
      if (!r) return;
      if (running && timeRef.current <= 8) {
        timeRef.current += 0.03;
      }
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => {
      r = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [draw, running]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>等速・等加速度運動</h2>
        <p className="algo-subtitle">Uniform &amp; Accelerated Motion</p>
      </div>

      <div className="step-info">
        <p className="step-description">
          {mode === "uniform"
            ? "等速直線運動: 速度が一定、位置は時間に比例"
            : "等加速度運動: 速度が増加、位置は時間の二乗に比例"}
        </p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button className={mode === "uniform" ? "btn-step" : "btn-reset"} onClick={() => setMode("uniform")}>
          等速直線
        </button>
        <button className={mode === "accelerated" ? "btn-step" : "btn-reset"} onClick={() => setMode("accelerated")}>
          等加速度
        </button>
        <button className="btn-step" onClick={() => setRunning(true)} disabled={running}
          style={{ background: "linear-gradient(135deg, #e65100, #ff9800)" }}>
          スタート
        </button>
        <button className="btn-reset" onClick={reset}>リセット</button>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>v0</label>
          <input type="range" min="0" max="8" step="0.5" value={initialVelocity}
            onChange={(e) => setInitialVelocity(Number(e.target.value))} />
          <span className="value">{initialVelocity}m/s</span>
        </div>
        {mode === "accelerated" && (
          <div className="slider-group">
            <label>a</label>
            <input type="range" min="0" max="5" step="0.5" value={acceleration}
              onChange={(e) => setAcceleration(Number(e.target.value))} />
            <span className="value">{acceleration}m/s&sup2;</span>
          </div>
        )}
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ffca28" }}>{timeRef.current.toFixed(1)}s</span>
            <span className="stat-label">時間 t</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>
              {(initialVelocity * timeRef.current + 0.5 * (mode === "accelerated" ? acceleration : 0) * timeRef.current * timeRef.current).toFixed(1)}m
            </span>
            <span className="stat-label">位置 x</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>
              {(initialVelocity + (mode === "accelerated" ? acceleration : 0) * timeRef.current).toFixed(1)}m/s
            </span>
            <span className="stat-label">速度 v</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function drawGraph(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  title: string, color: string,
  maxT: number, maxVal: number,
  fn: (t: number) => number,
  data: { t: number; val: number }[],
  currentT: number,
) {
  // Background
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(x, y, w, h);

  // Axes
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();

  // Title
  ctx.fillStyle = color;
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(title, x + 4, y + 12);

  // Axis labels
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("t", x + w + 10, y + h + 4);
  ctx.fillText(`${maxT}s`, x + w, y + h + 12);
  ctx.textAlign = "right";
  ctx.fillText(`${maxVal.toFixed(0)}`, x - 4, y + 8);

  // Grid
  for (let i = 1; i <= 4; i++) {
    const gx = x + (w * i) / 4;
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.stroke();
    const gy = y + (h * i) / 4;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }

  // Theoretical curve
  ctx.beginPath();
  ctx.strokeStyle = `${color}40`;
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= 100; i++) {
    const gt = (i / 100) * maxT;
    const gv = fn(gt);
    const px = x + (gt / maxT) * w;
    const py = y + h - (gv / maxVal) * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Data points
  if (data.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < data.length; i++) {
      const px = x + (data[i].t / maxT) * w;
      const py = y + h - (data[i].val / maxVal) * h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Current point
  if (currentT > 0) {
    const px = x + (currentT / maxT) * w;
    const py = y + h - (fn(currentT) / maxVal) * h;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

export default MotionVisualizer;
