import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type Mode = "composition" | "decomposition";

function drawArrow(

  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, lineWidth: number, label: string,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return;
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.stroke();

  const headLen = 12;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - 0.35), y2 - headLen * Math.sin(angle - 0.35));
  ctx.lineTo(x2 - headLen * Math.cos(angle + 0.35), y2 - headLen * Math.sin(angle + 0.35));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  if (label) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const offsetX = -Math.sin(angle) * 16;
    const offsetY = Math.cos(angle) * 16;
    ctx.fillStyle = color;
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, midX + offsetX, midY + offsetY);
  }
}

function ForceCompositionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("composition");
  const [angle1, setAngle1] = useState(30);
  const [angle2, setAngle2] = useState(-45);
  const [mag1, setMag1] = useState(80);
  const [mag2, setMag2] = useState(60);
  const [decompAngle, setDecompAngle] = useState(40);
  const [decompMag, setDecompMag] = useState(100);

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

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Origin dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    if (mode === "composition") {
      const rad1 = (-angle1 * Math.PI) / 180;
      const rad2 = (-angle2 * Math.PI) / 180;

      const f1x = Math.cos(rad1) * mag1;
      const f1y = Math.sin(rad1) * mag1;
      const f2x = Math.cos(rad2) * mag2;
      const f2y = Math.sin(rad2) * mag2;

      // Parallelogram
      ctx.beginPath();
      ctx.moveTo(cx + f1x, cy + f1y);
      ctx.lineTo(cx + f1x + f2x, cy + f1y + f2y);
      ctx.lineTo(cx + f2x, cy + f2y);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill parallelogram
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + f1x, cy + f1y);
      ctx.lineTo(cx + f1x + f2x, cy + f1y + f2y);
      ctx.lineTo(cx + f2x, cy + f2y);
      ctx.closePath();
      ctx.fillStyle = "rgba(171, 71, 188, 0.1)";
      ctx.fill();

      // Force arrows
      drawArrow(ctx, cx, cy, cx + f1x, cy + f1y, "#42a5f5", 3, `F\u2081=${mag1.toFixed(0)}N`);
      drawArrow(ctx, cx, cy, cx + f2x, cy + f2y, "#69f0ae", 3, `F\u2082=${mag2.toFixed(0)}N`);

      // Resultant
      const rx = f1x + f2x;
      const ry = f1y + f2y;
      const rMag = Math.sqrt(rx * rx + ry * ry);
      drawArrow(ctx, cx, cy, cx + rx, cy + ry, "#ef5350", 3.5, `R=${rMag.toFixed(0)}N`);

      // Angle arc for F1
      ctx.beginPath();
      ctx.arc(cx, cy, 30, -Math.max(rad1, rad2), -Math.min(rad1, rad2));
      ctx.strokeStyle = "rgba(255,202,40,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const angleBetween = Math.abs(angle1 - angle2);
      ctx.fillStyle = "#ffca28";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      const arcMid = -(rad1 + rad2) / 2;
      ctx.fillText(`${angleBetween.toFixed(0)}\u00b0`, cx + 42 * Math.cos(arcMid), cy + 42 * Math.sin(arcMid));
    } else {
      // Decomposition mode
      const rad = (-decompAngle * Math.PI) / 180;
      const fx = Math.cos(rad) * decompMag;
      const fy = Math.sin(rad) * decompMag;

      // Original force
      drawArrow(ctx, cx, cy, cx + fx, cy + fy, "#ab47bc", 3.5, `F=${decompMag.toFixed(0)}N`);

      // Horizontal component
      drawArrow(ctx, cx, cy, cx + fx, cy, "#42a5f5", 2.5, `Fx=${Math.abs(fx).toFixed(0)}N`);
      // Vertical component
      drawArrow(ctx, cx, cy, cx, cy + fy, "#69f0ae", 2.5, `Fy=${Math.abs(fy).toFixed(0)}N`);

      // Dashed lines
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + fx, cy);
      ctx.lineTo(cx + fx, cy + fy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + fy);
      ctx.lineTo(cx + fx, cy + fy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Angle arc
      ctx.beginPath();
      ctx.arc(cx, cy, 30, Math.min(0, -rad), Math.max(0, -rad));
      ctx.strokeStyle = "rgba(255,202,40,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#ffca28";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${decompAngle}\u00b0`, cx + 35, cy - 5);

      // Right angle indicator
      const rSize = 8;
      ctx.beginPath();
      ctx.moveTo(cx + fx - rSize, cy);
      ctx.lineTo(cx + fx - rSize, cy + (fy > 0 ? rSize : -rSize));
      ctx.lineTo(cx + fx, cy + (fy > 0 ? rSize : -rSize));
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [mode, angle1, angle2, mag1, mag2, decompAngle, decompMag]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>力の合成・分解</h2>
        <p className="algo-subtitle">Force Composition &amp; Decomposition</p>
      </div>

      <div className="step-info">
        <p className="step-description">
          {mode === "composition"
            ? "2つの力の大きさと角度を変えて合力を確認しよう"
            : "1つの力を水平・垂直方向に分解して成分を確認しよう"}
        </p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          className={mode === "composition" ? "btn-step" : "btn-reset"}
          onClick={() => setMode("composition")}
        >
          合成
        </button>
        <button
          className={mode === "decomposition" ? "btn-step" : "btn-reset"}
          onClick={() => setMode("decomposition")}
        >
          分解
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        {mode === "composition" ? (
          <>
            <div className="slider-group">
              <label>F1角</label>
              <input type="range" min="-180" max="180" step="5" value={angle1}
                onChange={(e) => setAngle1(Number(e.target.value))} />
              <span className="value">{angle1}&deg;</span>
            </div>
            <div className="slider-group">
              <label>F1</label>
              <input type="range" min="10" max="150" step="5" value={mag1}
                onChange={(e) => setMag1(Number(e.target.value))} />
              <span className="value">{mag1}N</span>
            </div>
            <div className="slider-group">
              <label>F2角</label>
              <input type="range" min="-180" max="180" step="5" value={angle2}
                onChange={(e) => setAngle2(Number(e.target.value))} />
              <span className="value">{angle2}&deg;</span>
            </div>
            <div className="slider-group">
              <label>F2</label>
              <input type="range" min="10" max="150" step="5" value={mag2}
                onChange={(e) => setMag2(Number(e.target.value))} />
              <span className="value">{mag2}N</span>
            </div>
          </>
        ) : (
          <>
            <div className="slider-group">
              <label>角度</label>
              <input type="range" min="0" max="90" step="5" value={decompAngle}
                onChange={(e) => setDecompAngle(Number(e.target.value))} />
              <span className="value">{decompAngle}&deg;</span>
            </div>
            <div className="slider-group">
              <label>F</label>
              <input type="range" min="20" max="150" step="5" value={decompMag}
                onChange={(e) => setDecompMag(Number(e.target.value))} />
              <span className="value">{decompMag}N</span>
            </div>
          </>
        )}
      </div>

      <div className="info-panel">
        <div className="stats-row">
          {mode === "composition" ? (
            <>
              <div className="stat-item">
                <span className="stat-value" style={{ color: "#42a5f5" }}>{mag1}N</span>
                <span className="stat-label">F1</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">+</span>
                <span className="stat-label">&nbsp;</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: "#69f0ae" }}>{mag2}N</span>
                <span className="stat-label">F2</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">=</span>
                <span className="stat-label">&nbsp;</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: "#ef5350" }}>
                  {(() => {
                    const r1 = (-angle1 * Math.PI) / 180;
                    const r2 = (-angle2 * Math.PI) / 180;
                    const rx = Math.cos(r1) * mag1 + Math.cos(r2) * mag2;
                    const ry = Math.sin(r1) * mag1 + Math.sin(r2) * mag2;
                    return Math.sqrt(rx * rx + ry * ry).toFixed(1);
                  })()}N
                </span>
                <span className="stat-label">合力 R</span>
              </div>
            </>
          ) : (
            <>
              <div className="stat-item">
                <span className="stat-value" style={{ color: "#ab47bc" }}>{decompMag}N</span>
                <span className="stat-label">F</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">&rarr;</span>
                <span className="stat-label">&nbsp;</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: "#42a5f5" }}>
                  {(decompMag * Math.cos((decompAngle * Math.PI) / 180)).toFixed(1)}N
                </span>
                <span className="stat-label">Fx (水平)</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: "#69f0ae" }}>
                  {(decompMag * Math.sin((decompAngle * Math.PI) / 180)).toFixed(1)}N
                </span>
                <span className="stat-label">Fy (垂直)</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForceCompositionVisualizer;
