import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function AdditionTheoremVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [alpha, setAlpha] = useState(30);
  const [beta, setBeta] = useState(45);

  const alphaRad = (alpha * Math.PI) / 180;
  const betaRad = (beta * Math.PI) / 180;
  const sumRad = alphaRad + betaRad;

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
    const r = Math.min(w, h) * 0.35;

    // Unit circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.moveTo(cx - r - 20, cy);
    ctx.lineTo(cx + r + 20, cy);
    ctx.moveTo(cx, cy - r - 20);
    ctx.lineTo(cx, cy + r + 20);
    ctx.stroke();

    // Angle alpha arc
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.25, 0, -alphaRad, true);
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 3;
    ctx.stroke();
    // Label
    const aLabelAngle = -alphaRad / 2;
    ctx.fillStyle = "#42a5f5";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("α", cx + r * 0.32 * Math.cos(aLabelAngle), cy + r * 0.32 * Math.sin(aLabelAngle) + 5);

    // Angle beta arc
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.35, -alphaRad, -sumRad, true);
    ctx.strokeStyle = "#69f0ae";
    ctx.lineWidth = 3;
    ctx.stroke();
    const bLabelAngle = -(alphaRad + betaRad / 2);
    ctx.fillStyle = "#69f0ae";
    ctx.fillText("β", cx + r * 0.42 * Math.cos(bLabelAngle), cy + r * 0.42 * Math.sin(bLabelAngle) + 5);

    // Point for alpha
    const pAx = cx + r * Math.cos(-alphaRad);
    const pAy = cy + r * Math.sin(-alphaRad);

    // Point for alpha + beta
    const pABx = cx + r * Math.cos(-sumRad);
    const pABy = cy + r * Math.sin(-sumRad);

    // Point on x-axis (1, 0)
    const p1x = cx + r;
    const p1y = cy;

    // Line from center to P(α)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pAx, pAy);
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Line from center to P(α+β)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pABx, pABy);
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Line from center to (1,0)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p1x, p1y);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // sin(α+β) vertical line from P(α+β) to x-axis
    ctx.beginPath();
    ctx.moveTo(pABx, pABy);
    ctx.lineTo(pABx, cy);
    ctx.strokeStyle = "#f50057";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // cos(α+β) horizontal line from origin to projection
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pABx, cy);
    ctx.strokeStyle = "#ffc107";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Points
    const drawPoint = (x: number, y: number, color: string, label: string) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = color;
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, x + 10, y - 8);
    };

    drawPoint(pAx, pAy, "#42a5f5", `P(α) = (${Math.cos(alphaRad).toFixed(2)}, ${Math.sin(alphaRad).toFixed(2)})`);
    drawPoint(pABx, pABy, "#ff9800", `P(α+β)`);

    // sin/cos labels on axes
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#f50057";
    ctx.fillText(`sin(α+β)`, pABx - 40, (pABy + cy) / 2);
    ctx.fillStyle = "#ffc107";
    ctx.fillText(`cos(α+β)`, (cx + pABx) / 2, cy + 18);
  }, [alphaRad, betaRad, sumRad]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>加法定理</h2>
        <p className="algo-subtitle">Addition Theorem</p>
      </div>

      <div className="formula">
        sin(α+β) = sinα·cosβ + cosα·sinβ
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{Math.sin(sumRad).toFixed(4)}</span>
            <span className="stat-label">sin(α+β)</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Math.cos(sumRad).toFixed(4)}</span>
            <span className="stat-label">cos(α+β)</span>
          </div>
        </div>
        <div className="stats-row" style={{ marginTop: 8 }}>
          <div className="stat-item">
            <span className="stat-value" style={{ fontSize: 14 }}>
              {Math.sin(alphaRad).toFixed(2)}·{Math.cos(betaRad).toFixed(2)} + {Math.cos(alphaRad).toFixed(2)}·{Math.sin(betaRad).toFixed(2)} = {(Math.sin(alphaRad) * Math.cos(betaRad) + Math.cos(alphaRad) * Math.sin(betaRad)).toFixed(4)}
            </span>
            <span className="stat-label">sinα·cosβ + cosα·sinβ</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>α</label>
          <input
            type="range"
            min="0"
            max="360"
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
          />
          <span className="value">{alpha}°</span>
        </div>
        <div className="slider-group">
          <label>β</label>
          <input
            type="range"
            min="0"
            max="360"
            value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
          />
          <span className="value">{beta}°</span>
        </div>
      </div>
    </div>
  );
}

export default AdditionTheoremVisualizer;
