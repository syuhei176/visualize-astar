import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function LinearFunctionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [slope, setSlope] = useState(2);
  const [intercept, setIntercept] = useState(1);

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

    // 目盛りラベル
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "center";
    for (let i = -range; i <= range; i++) {
      if (i === 0) continue;
      ctx.fillText(`${i}`, cx + i * unitX, cy + 16);
      ctx.fillText(`${i}`, cx - 16, cy - i * unitY + 4);
    }
    ctx.fillText("O", cx - 10, cy + 16);

    // グラフ y = slope * x + intercept
    ctx.beginPath();
    const x1 = -range;
    const x2 = range;
    const y1 = slope * x1 + intercept;
    const y2 = slope * x2 + intercept;
    ctx.moveTo(cx + x1 * unitX, cy - y1 * unitY);
    ctx.lineTo(cx + x2 * unitX, cy - y2 * unitY);
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 3;
    ctx.stroke();

    // y切片
    ctx.beginPath();
    ctx.arc(cx, cy - intercept * unitY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ff9800";
    ctx.fill();
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#ff9800";
    ctx.textAlign = "left";
    ctx.fillText(`(0, ${intercept})`, cx + 10, cy - intercept * unitY - 8);

    // 傾きの三角形（x=1のとき）
    if (Math.abs(slope) > 0.1) {
      const triX = 1;
      const triY0 = slope * 0 + intercept;
      const triY1 = slope * triX + intercept;

      // 水平線（Δx = 1）
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - triY0 * unitY);
      ctx.lineTo(cx + triX * unitX, cy - triY0 * unitY);
      ctx.strokeStyle = "#69f0ae";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 垂直線（Δy = slope）
      ctx.beginPath();
      ctx.moveTo(cx + triX * unitX, cy - triY0 * unitY);
      ctx.lineTo(cx + triX * unitX, cy - triY1 * unitY);
      ctx.strokeStyle = "#ef5350";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // ラベル
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#69f0ae";
      ctx.textAlign = "center";
      ctx.fillText("1", cx + triX * unitX / 2, cy - triY0 * unitY + 14);
      ctx.fillStyle = "#ef5350";
      ctx.textAlign = "left";
      ctx.fillText(`${slope}`, cx + triX * unitX + 6, cy - (triY0 + triY1) / 2 * unitY);
    }
  }, [slope, intercept]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>一次関数</h2>
        <p className="algo-subtitle">Linear Function</p>
      </div>

      <div className="formula">y = {slope}x {intercept >= 0 ? "+" : "−"} {Math.abs(intercept)}</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ef5350" }}>{slope}</span>
            <span className="stat-label">傾き</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ff9800" }}>{intercept}</span>
            <span className="stat-label">切片</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>傾き</label>
          <input type="range" min="-4" max="4" step="0.5" value={slope} onChange={(e) => setSlope(Number(e.target.value))} />
          <span className="value">{slope}</span>
        </div>
        <div className="slider-group">
          <label>切片</label>
          <input type="range" min="-4" max="4" step="0.5" value={intercept} onChange={(e) => setIntercept(Number(e.target.value))} />
          <span className="value">{intercept}</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          傾きと切片を変えて、一次関数のグラフがどう変化するか確認しよう
        </p>
      </div>
    </div>
  );
}

export default LinearFunctionVisualizer;
