import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type CircuitMode = "series" | "parallel";

function BulbBrightnessVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<CircuitMode>("series");
  const [bulbCount, setBulbCount] = useState(2);
  const [voltage, setVoltage] = useState(6);

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

    const R = 3; // 各豆電球の抵抗(Ω)
    let currentPerBulb: number;
    let voltagePerBulb: number;

    if (mode === "series") {
      const totalR = R * bulbCount;
      const I = voltage / totalR;
      currentPerBulb = I;
      voltagePerBulb = voltage / bulbCount;
    } else {
      const I = voltage / R;
      currentPerBulb = I;
      voltagePerBulb = voltage;
    }

    const power = currentPerBulb * voltagePerBulb;
    const maxPower = 6 * 6 / 3; // 6V, 3Ω single bulb = 12W
    const brightness = Math.min(1, power / maxPower);

    // 電池を描画
    const battX = 60;
    const battY = h * 0.5;

    // 電池
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(battX - 12, battY - 20);
    ctx.lineTo(battX - 12, battY + 20);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(battX + 4, battY - 12);
    ctx.lineTo(battX + 4, battY + 12);
    ctx.stroke();

    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#ffd740";
    ctx.textAlign = "center";
    ctx.fillText(`${voltage}V`, battX - 4, battY - 30);
    ctx.fillText("+", battX + 16, battY - 6);
    ctx.fillText("−", battX - 24, battY - 6);

    // 豆電球を描画
    const drawBulb = (x: number, y: number, b: number, label: string) => {
      const glowR = 24;

      // 光のグロー
      if (b > 0.05) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowR * (0.5 + b));
        gradient.addColorStop(0, `rgba(255, 215, 0, ${b * 0.6})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${b * 0.2})`);
        gradient.addColorStop(1, "rgba(255, 215, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowR * (0.5 + b), 0, Math.PI * 2);
        ctx.fill();
      }

      // 豆電球の丸
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      const bulbColor = b > 0.05
        ? `rgba(255, ${Math.round(200 + 55 * b)}, ${Math.round(50 * b)}, ${0.3 + b * 0.7})`
        : "rgba(255, 255, 255, 0.1)";
      ctx.fillStyle = bulbColor;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ×マーク（フィラメント）
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 6);
      ctx.lineTo(x + 6, y + 6);
      ctx.moveTo(x + 6, y - 6);
      ctx.lineTo(x - 6, y + 6);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + b * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = "10px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.textAlign = "center";
      ctx.fillText(label, x, y + 28);
    };

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";

    if (mode === "series") {
      // 直列回路
      const startX = battX + 20;
      const endX = w - 40;
      const topY = h * 0.3;
      const botY = h * 0.7;
      const spacing = (endX - startX) / (bulbCount + 1);

      // 上の線
      ctx.beginPath();
      ctx.moveTo(battX + 4, battY - 12);
      ctx.lineTo(battX + 4, topY);
      ctx.lineTo(endX, topY);
      ctx.lineTo(endX, botY);
      ctx.lineTo(battX - 12, botY);
      ctx.lineTo(battX - 12, battY + 20);
      ctx.stroke();

      // 豆電球
      for (let i = 0; i < bulbCount; i++) {
        const bx = startX + spacing * (i + 1);
        drawBulb(bx, topY, brightness, `${voltagePerBulb.toFixed(1)}V`);
      }
    } else {
      // 並列回路
      const startX = battX + 40;
      const endX = w - 60;
      const centerX = (startX + endX) / 2;
      const topY = h * 0.2;
      const botY = h * 0.8;
      const spacing = (botY - topY) / (bulbCount + 1);

      // 左の配線
      ctx.beginPath();
      ctx.moveTo(battX + 4, battY - 12);
      ctx.lineTo(battX + 4, topY);
      ctx.lineTo(startX, topY);
      ctx.stroke();

      // 右の配線
      ctx.beginPath();
      ctx.moveTo(battX - 12, battY + 20);
      ctx.lineTo(battX - 12, botY);
      ctx.lineTo(startX, botY);
      ctx.stroke();

      // 左の縦線
      ctx.beginPath();
      ctx.moveTo(startX, topY);
      ctx.lineTo(startX, botY);
      ctx.stroke();

      // 右の縦線
      ctx.beginPath();
      ctx.moveTo(endX, topY);
      ctx.lineTo(endX, botY);
      ctx.stroke();

      // 上下の横線
      ctx.beginPath();
      ctx.moveTo(startX, topY);
      ctx.lineTo(endX, topY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(startX, botY);
      ctx.lineTo(endX, botY);
      ctx.stroke();

      // 各並列枝
      for (let i = 0; i < bulbCount; i++) {
        const by = topY + spacing * (i + 1);
        ctx.beginPath();
        ctx.moveTo(startX, by);
        ctx.lineTo(centerX - 20, by);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + 20, by);
        ctx.lineTo(endX, by);
        ctx.stroke();
        drawBulb(centerX, by, brightness, `${voltagePerBulb.toFixed(1)}V`);
      }
    }
  }, [mode, bulbCount, voltage]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const R = 3;
  let currentPerBulb: number;
  let voltagePerBulb: number;
  let totalCurrent: number;

  if (mode === "series") {
    totalCurrent = voltage / (R * bulbCount);
    currentPerBulb = totalCurrent;
    voltagePerBulb = voltage / bulbCount;
  } else {
    currentPerBulb = voltage / R;
    totalCurrent = currentPerBulb * bulbCount;
    voltagePerBulb = voltage;
  }

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>豆電球の明るさ</h2>
        <p className="algo-subtitle">Bulb Brightness: Series vs Parallel</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          className={mode === "series" ? "btn-step" : "btn-reset"}
          onClick={() => setMode("series")}
          style={{ fontSize: "13px", padding: "6px 12px" }}
        >
          直列
        </button>
        <button
          className={mode === "parallel" ? "btn-step" : "btn-reset"}
          onClick={() => setMode("parallel")}
          style={{ fontSize: "13px", padding: "6px 12px" }}
        >
          並列
        </button>
      </div>

      <div className="formula">
        {mode === "series"
          ? `直列: 各豆電球の電圧 = ${voltage}V ÷ ${bulbCount} = ${voltagePerBulb.toFixed(1)}V`
          : `並列: 各豆電球の電圧 = ${voltage}V`}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ffd740" }}>{(currentPerBulb * voltagePerBulb).toFixed(1)}W</span>
            <span className="stat-label">各電球の電力</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>{currentPerBulb.toFixed(2)}A</span>
            <span className="stat-label">各電球の電流</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>{totalCurrent.toFixed(2)}A</span>
            <span className="stat-label">合計電流</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>電圧</label>
          <input type="range" min="1" max="12" step="1" value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} />
          <span className="value">{voltage}V</span>
        </div>
        <div className="slider-group">
          <label>個数</label>
          <input type="range" min="1" max="4" step="1" value={bulbCount} onChange={(e) => setBulbCount(Number(e.target.value))} />
          <span className="value">{bulbCount}</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          直列と並列で豆電球の明るさ（電力）がどう変わるか比較しよう
        </p>
      </div>
    </div>
  );
}

export default BulbBrightnessVisualizer;
