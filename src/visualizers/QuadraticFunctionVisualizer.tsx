import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function QuadraticFunctionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [a, setA] = useState(1);

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
    const cy = h * 0.7;
    const range = 5;
    const unitX = (w - 40) / (range * 2);
    const unitY = (h - 60) / (range * 2);

    // グリッド
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let i = -range; i <= range; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * unitX, 20);
      ctx.lineTo(cx + i * unitX, h - 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(20, cy + i * unitY);
      ctx.lineTo(w - 20, cy + i * unitY);
      ctx.stroke();
    }

    // 軸
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, cy);
    ctx.lineTo(w - 20, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    ctx.lineTo(cx, h - 20);
    ctx.stroke();

    // 目盛り
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "center";
    for (let i = -range; i <= range; i++) {
      if (i === 0) continue;
      ctx.fillText(`${i}`, cx + i * unitX, cy + 16);
    }
    for (let i = 1; i <= range * 2; i++) {
      ctx.fillText(`${i}`, cx - 16, cy - i * unitY + 4);
    }
    ctx.fillText("O", cx - 10, cy + 16);

    // 放物線 y = ax²
    ctx.beginPath();
    let first = true;
    for (let px = -range; px <= range; px += 0.05) {
      const py = a * px * px;
      if (Math.abs(py) > range * 2) continue;
      const sx = cx + px * unitX;
      const sy = cy - py * unitY;
      if (first) { ctx.moveTo(sx, sy); first = false; }
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 頂点
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ff9800";
    ctx.fill();
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#ff9800";
    ctx.textAlign = "left";
    ctx.fillText("頂点(0,0)", cx + 10, cy - 8);

    // 対称軸
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    ctx.lineTo(cx, h - 20);
    ctx.strokeStyle = "rgba(255, 152, 0, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // x=1のときのyの値を表示
    if (Math.abs(a) > 0.01) {
      const pxVal = 1;
      const pyVal = a * pxVal * pxVal;
      const sx = cx + pxVal * unitX;
      const sy = cy - pyVal * unitY;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#69f0ae";
      ctx.fill();
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#69f0ae";
      ctx.textAlign = "left";
      ctx.fillText(`(1, ${a})`, sx + 8, sy - 6);

      // 対称点
      const sx2 = cx - pxVal * unitX;
      ctx.beginPath();
      ctx.arc(sx2, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#69f0ae";
      ctx.fill();
      ctx.textAlign = "right";
      ctx.fillText(`(-1, ${a})`, sx2 - 8, sy - 6);
    }
  }, [a]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>二次関数</h2>
        <p className="algo-subtitle">Quadratic Function</p>
      </div>

      <div className="formula">y = {a === 1 ? "" : a === -1 ? "−" : a}x²</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>{a}</span>
            <span className="stat-label">a の値</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{a > 0 ? "上" : a < 0 ? "下" : "—"}</span>
            <span className="stat-label">開く向き</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>a</label>
          <input type="range" min="-3" max="3" step="0.25" value={a} onChange={(e) => setA(Number(e.target.value))} />
          <span className="value">{a}</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          aの値を変えて、放物線の向きと幅がどう変わるか確認しよう
        </p>
      </div>
    </div>
  );
}

export default QuadraticFunctionVisualizer;
