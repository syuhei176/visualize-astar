import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type GraphMode = "proportion" | "inverse";

function ProportionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<GraphMode>("proportion");
  const [a, setA] = useState(2);

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
    const range = 6;
    const unitX = (w - 40) / (range * 2);
    const unitY = (h - 40) / (range * 2);

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

    // 軸ラベル
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "center";
    for (let i = -range; i <= range; i++) {
      if (i === 0) continue;
      ctx.fillText(`${i}`, cx + i * unitX, cy + 16);
      ctx.fillText(`${i}`, cx - 16, cy - i * unitY + 4);
    }
    ctx.fillText("x", w - 14, cy - 6);
    ctx.fillText("y", cx + 10, 16);
    ctx.fillText("O", cx - 10, cy + 16);

    // グラフ描画
    ctx.beginPath();
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 3;

    if (mode === "proportion") {
      // y = ax
      const x1 = -range;
      const x2 = range;
      const y1 = a * x1;
      const y2 = a * x2;
      ctx.moveTo(cx + x1 * unitX, cy - y1 * unitY);
      ctx.lineTo(cx + x2 * unitX, cy - y2 * unitY);
      ctx.stroke();

      // 原点を通ることを強調
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ff9800";
      ctx.fill();
    } else {
      // y = a/x
      let first = true;
      // 正のx
      for (let px = 0.2; px <= range; px += 0.05) {
        const py = a / px;
        if (Math.abs(py) > range) { first = true; continue; }
        const sx = cx + px * unitX;
        const sy = cy - py * unitY;
        if (first) { ctx.moveTo(sx, sy); first = false; }
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // 負のx
      ctx.beginPath();
      first = true;
      for (let px = -0.2; px >= -range; px -= 0.05) {
        const py = a / px;
        if (Math.abs(py) > range) { first = true; continue; }
        const sx = cx + px * unitX;
        const sy = cy - py * unitY;
        if (first) { ctx.moveTo(sx, sy); first = false; }
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
  }, [mode, a]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>比例・反比例</h2>
        <p className="algo-subtitle">Proportion &amp; Inverse Proportion</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          className={mode === "proportion" ? "btn-step" : "btn-reset"}
          onClick={() => setMode("proportion")}
          style={{ fontSize: "13px", padding: "6px 12px" }}
        >
          比例
        </button>
        <button
          className={mode === "inverse" ? "btn-step" : "btn-reset"}
          onClick={() => setMode("inverse")}
          style={{ fontSize: "13px", padding: "6px 12px" }}
        >
          反比例
        </button>
      </div>

      <div className="formula">
        {mode === "proportion" ? `y = ${a}x` : `y = ${a}/x`}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>a</label>
          <input type="range" min="-4" max="4" step="0.5" value={a} onChange={(e) => setA(Number(e.target.value))} />
          <span className="value">{a}</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          {mode === "proportion"
            ? "aを変えて、比例のグラフが原点を通る直線になることを確認しよう"
            : "aを変えて、反比例のグラフ（双曲線）の形を観察しよう"}
        </p>
      </div>
    </div>
  );
}

export default ProportionVisualizer;
