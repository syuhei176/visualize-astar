import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function SectorVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [radius, setRadius] = useState(5);
  const [angleDeg, setAngleDeg] = useState(120);

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
    const cy = h * 0.55;
    const maxR = Math.min(w, h) * 0.38;
    const scale = maxR / 8;
    const r = radius * scale;
    const angleRad = (angleDeg * Math.PI) / 180;

    // 完全な円を薄く
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // おうぎ形の塗りつぶし
    const startAngle = -angleRad / 2;
    const endAngle = angleRad / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = "rgba(66, 165, 245, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 弧を強調
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 4;
    ctx.stroke();

    // 半径の線
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle));
    ctx.strokeStyle = "#69f0ae";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(endAngle), cy + r * Math.sin(endAngle));
    ctx.strokeStyle = "#69f0ae";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 角度アーク
    const arcR = Math.min(30, r * 0.3);
    ctx.beginPath();
    ctx.arc(cx, cy, arcR, startAngle, endAngle);
    ctx.strokeStyle = "#ab47bc";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 角度ラベル
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#ab47bc";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${angleDeg}°`, cx + (arcR + 16) * Math.cos(0), cy + (arcR + 16) * Math.sin(0));

    // 半径ラベル
    const midAngle = endAngle;
    const rLabelX = cx + (r / 2) * Math.cos(midAngle);
    const rLabelY = cy + (r / 2) * Math.sin(midAngle);
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`r=${radius}`, rLabelX + 14, rLabelY - 4);

    // 弧の長さラベル
    const arcMidAngle = 0;
    const arcLabelX = cx + (r + 18) * Math.cos(arcMidAngle);
    const arcLabelY = cy + (r + 18) * Math.sin(arcMidAngle);
    const arcLength = (2 * Math.PI * radius * angleDeg) / 360;
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#ff9800";
    ctx.textAlign = "left";
    ctx.fillText(`弧 = ${arcLength.toFixed(2)}`, arcLabelX, arcLabelY);

    // 中心点
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fill();
  }, [radius, angleDeg]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const arcLength = (2 * Math.PI * radius * angleDeg) / 360;
  const area = (Math.PI * radius * radius * angleDeg) / 360;

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>おうぎ形</h2>
        <p className="algo-subtitle">Sector: Arc Length &amp; Area</p>
      </div>

      <div className="formula">弧 = 2πr × θ/360, 面積 = πr² × θ/360</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ff9800" }}>{arcLength.toFixed(2)}</span>
            <span className="stat-label">弧の長さ</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>{area.toFixed(2)}</span>
            <span className="stat-label">面積</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>r</label>
          <input type="range" min="1" max="8" step="0.5" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
          <span className="value">{radius}</span>
        </div>
        <div className="slider-group">
          <label>θ</label>
          <input type="range" min="10" max="350" step="5" value={angleDeg} onChange={(e) => setAngleDeg(Number(e.target.value))} />
          <span className="value">{angleDeg}°</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          半径と中心角を変えて、弧の長さと面積がどう変わるか確認しよう
        </p>
      </div>
    </div>
  );
}

export default SectorVisualizer;
