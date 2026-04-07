import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function SqrtNumberLineVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [n, setN] = useState(2);

  const sqrtN = Math.sqrt(n);

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

    // 数直線
    const margin = 40;
    const lineY = h * 0.35;
    const maxVal = Math.ceil(sqrtN) + 1;
    const unitLen = (w - 2 * margin) / maxVal;

    // 数直線の線
    ctx.beginPath();
    ctx.moveTo(margin, lineY);
    ctx.lineTo(w - margin, lineY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 目盛り
    for (let i = 0; i <= maxVal; i++) {
      const x = margin + i * unitLen;
      ctx.beginPath();
      ctx.moveTo(x, lineY - 8);
      ctx.lineTo(x, lineY + 8);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`${i}`, x, lineY + 14);
    }

    // √n の位置
    const sqrtX = margin + sqrtN * unitLen;

    // √n のマーカー
    ctx.beginPath();
    ctx.moveTo(sqrtX, lineY - 20);
    ctx.lineTo(sqrtX, lineY + 20);
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sqrtX, lineY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ff9800";
    ctx.fill();

    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#ff9800";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`√${n} ≈ ${sqrtN.toFixed(4)}`, sqrtX, lineY - 24);

    // 下半分: 幾何学的な構成（直角三角形）
    const geoY = h * 0.6;
    const geoScale = Math.min(unitLen, (h - geoY - 40) / 1.5);

    // √n を直角三角形で示す: 1² + (√(n-1))² = (√n)²...
    // もっとシンプルに: 一辺1の正方形の対角線 = √2
    // 一般的に: √n は一辺√(n-1)と1の直角三角形の斜辺

    // 原点から√nまでの長さを示す正方形
    const sqSide = geoScale;
    const sqStartX = w / 2 - sqSide * Math.sqrt(n) / 2;
    const sqStartY = geoY + 10;

    // 面積nの正方形（一辺√n）
    const side = sqrtN * geoScale * 0.4;
    const sqCenterX = w / 2;
    ctx.fillStyle = "rgba(255, 152, 0, 0.1)";
    ctx.fillRect(sqCenterX - side / 2, sqStartY, side, side);
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 2;
    ctx.strokeRect(sqCenterX - side / 2, sqStartY, side, side);

    // 辺のラベル
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#ff9800";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`√${n}`, sqCenterX, sqStartY + side + 6);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`√${n}`, sqCenterX - side / 2 - 6, sqStartY + side / 2);

    // 面積ラベル
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "rgba(255, 152, 0, 0.7)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`面積 = ${n}`, sqCenterX, sqStartY + side / 2);

    void sqStartX;
  }, [n, sqrtN]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const floor = Math.floor(sqrtN);
  const ceil = Math.ceil(sqrtN);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>平方根の大きさ</h2>
        <p className="algo-subtitle">Square Root on Number Line</p>
      </div>

      <div className="formula">√{n} ≈ {sqrtN.toFixed(4)}</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{floor}</span>
            <span className="stat-label">{floor}² = {floor * floor}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{'<'}</span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ff9800" }}>√{n}</span>
            <span className="stat-label">≈ {sqrtN.toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{'<'}</span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{ceil === floor ? ceil + 1 : ceil}</span>
            <span className="stat-label">{(ceil === floor ? ceil + 1 : ceil)}² = {(ceil === floor ? ceil + 1 : ceil) ** 2}</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>n</label>
          <input type="range" min="2" max="25" step="1" value={n} onChange={(e) => setN(Number(e.target.value))} />
          <span className="value">{n}</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          √nが数直線上のどこに位置するか、面積nの正方形の辺の長さとして確認しよう
        </p>
      </div>
    </div>
  );
}

export default SqrtNumberLineVisualizer;
