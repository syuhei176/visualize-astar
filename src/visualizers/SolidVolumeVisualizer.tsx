import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type SolidType = "cylinder" | "cone" | "sphere" | "prism";

const SOLIDS: { id: SolidType; name: string }[] = [
  { id: "cylinder", name: "円柱" },
  { id: "cone", name: "円錐" },
  { id: "sphere", name: "球" },
  { id: "prism", name: "四角柱" },
];

function SolidVolumeVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [solidType, setSolidType] = useState<SolidType>("cylinder");
  const [radius, setRadius] = useState(3);
  const [height, setHeight] = useState(5);

  const volume = (() => {
    switch (solidType) {
      case "cylinder": return Math.PI * radius * radius * height;
      case "cone": return (Math.PI * radius * radius * height) / 3;
      case "sphere": return (4 * Math.PI * radius * radius * radius) / 3;
      case "prism": return radius * radius * height; // side × side × height
    }
  })();

  const surfaceArea = (() => {
    switch (solidType) {
      case "cylinder": return 2 * Math.PI * radius * (radius + height);
      case "cone": {
        const slant = Math.sqrt(radius * radius + height * height);
        return Math.PI * radius * (radius + slant);
      }
      case "sphere": return 4 * Math.PI * radius * radius;
      case "prism": return 2 * radius * radius + 4 * radius * height;
    }
  })();

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
    const scale = Math.min(w, h) * 0.04;
    const r = radius * scale;
    const ht = height * scale;

    ctx.lineWidth = 2;

    if (solidType === "cylinder") {
      // 3D的な円柱
      const topY = cy - ht / 2;
      const botY = cy + ht / 2;

      // 側面
      ctx.fillStyle = "rgba(66, 165, 245, 0.15)";
      ctx.fillRect(cx - r, topY, r * 2, ht);
      ctx.strokeStyle = "#42a5f5";
      ctx.beginPath();
      ctx.moveTo(cx - r, topY);
      ctx.lineTo(cx - r, botY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + r, topY);
      ctx.lineTo(cx + r, botY);
      ctx.stroke();

      // 下の楕円
      ctx.beginPath();
      ctx.ellipse(cx, botY, r, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(66, 165, 245, 0.2)";
      ctx.fill();
      ctx.strokeStyle = "#42a5f5";
      ctx.stroke();

      // 上の楕円
      ctx.beginPath();
      ctx.ellipse(cx, topY, r, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(105, 240, 174, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#69f0ae";
      ctx.stroke();

      // 寸法線
      drawDimension(ctx, cx + r + 15, topY, cx + r + 15, botY, `h=${height}`, "#ff9800");
      drawDimension(ctx, cx - r, botY + 20, cx + r, botY + 20, `r=${radius}`, "#69f0ae");

    } else if (solidType === "cone") {
      const topY = cy - ht / 2;
      const botY = cy + ht / 2;

      // 側面
      ctx.beginPath();
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx - r, botY);
      ctx.lineTo(cx + r, botY);
      ctx.closePath();
      ctx.fillStyle = "rgba(66, 165, 245, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#42a5f5";
      ctx.stroke();

      // 底面
      ctx.beginPath();
      ctx.ellipse(cx, botY, r, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(105, 240, 174, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#69f0ae";
      ctx.stroke();

      // 高さの点線
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx, botY);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.stroke();
      ctx.setLineDash([]);

      drawDimension(ctx, cx + r + 15, topY, cx + r + 15, botY, `h=${height}`, "#ff9800");
      drawDimension(ctx, cx, botY + 20, cx + r, botY + 20, `r=${radius}`, "#69f0ae");

    } else if (solidType === "sphere") {
      // 球
      const gradient = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
      gradient.addColorStop(0, "rgba(66, 165, 245, 0.3)");
      gradient.addColorStop(1, "rgba(66, 165, 245, 0.05)");

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "#42a5f5";
      ctx.stroke();

      // 赤道の楕円
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.stroke();
      ctx.setLineDash([]);

      // 半径
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r, cy);
      ctx.strokeStyle = "#69f0ae";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#69f0ae";
      ctx.textAlign = "center";
      ctx.fillText(`r=${radius}`, cx + r / 2, cy - 10);

    } else {
      // 四角柱（3Dっぽく）
      const side = r;
      const topY = cy - ht / 2;
      const botY = cy + ht / 2;
      const offset = side * 0.4;

      // 右側面
      ctx.beginPath();
      ctx.moveTo(cx + side, topY);
      ctx.lineTo(cx + side + offset, topY - offset);
      ctx.lineTo(cx + side + offset, botY - offset);
      ctx.lineTo(cx + side, botY);
      ctx.closePath();
      ctx.fillStyle = "rgba(66, 165, 245, 0.1)";
      ctx.fill();
      ctx.strokeStyle = "#42a5f5";
      ctx.stroke();

      // 上面
      ctx.beginPath();
      ctx.moveTo(cx - side, topY);
      ctx.lineTo(cx - side + offset, topY - offset);
      ctx.lineTo(cx + side + offset, topY - offset);
      ctx.lineTo(cx + side, topY);
      ctx.closePath();
      ctx.fillStyle = "rgba(105, 240, 174, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#69f0ae";
      ctx.stroke();

      // 前面
      ctx.fillStyle = "rgba(66, 165, 245, 0.15)";
      ctx.fillRect(cx - side, topY, side * 2, ht);
      ctx.strokeStyle = "#42a5f5";
      ctx.strokeRect(cx - side, topY, side * 2, ht);

      drawDimension(ctx, cx + side + offset + 10, topY - offset, cx + side + offset + 10, botY - offset, `h=${height}`, "#ff9800");
      drawDimension(ctx, cx - side, botY + 15, cx + side, botY + 15, `a=${radius}`, "#69f0ae");
    }
  }, [solidType, radius, height]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const formulaText = (() => {
    switch (solidType) {
      case "cylinder": return "V = πr²h, S = 2πr(r+h)";
      case "cone": return "V = πr²h/3, S = πr(r+l)";
      case "sphere": return "V = 4πr³/3, S = 4πr²";
      case "prism": return "V = a²h, S = 2a²+4ah";
    }
  })();

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>立体の体積と表面積</h2>
        <p className="algo-subtitle">Volume &amp; Surface Area</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {SOLIDS.map((s) => (
          <button
            key={s.id}
            className={solidType === s.id ? "btn-step" : "btn-reset"}
            onClick={() => setSolidType(s.id)}
            style={{ fontSize: "13px", padding: "6px 12px" }}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="formula">{formulaText}</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>{volume.toFixed(1)}</span>
            <span className="stat-label">体積</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>{surfaceArea.toFixed(1)}</span>
            <span className="stat-label">表面積</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>{solidType === "sphere" ? "r" : "r/a"}</label>
          <input type="range" min="1" max="6" step="0.5" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
          <span className="value">{radius}</span>
        </div>
        {solidType !== "sphere" && (
          <div className="slider-group">
            <label>h</label>
            <input type="range" min="1" max="8" step="0.5" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            <span className="value">{height}</span>
          </div>
        )}
      </div>

      <div className="step-info">
        <p className="step-description">
          サイズを変えて、体積と表面積の変化を確認しよう
        </p>
      </div>
    </div>
  );
}

function drawDimension(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  label: string,
  color: string,
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Arrow heads
  const len = 5;
  ctx.beginPath();
  ctx.moveTo(x1 - len, y1 + len);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x1 + len, y1 + len);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2 - len, y2 - len);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 + len, y2 - len);
  ctx.stroke();

  ctx.font = "bold 11px sans-serif";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, (x1 + x2) / 2 + 16, (y1 + y2) / 2);
}

export default SolidVolumeVisualizer;
