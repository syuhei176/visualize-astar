import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function generateData(count: number, spread: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < count; i++) {
    // Box-Muller法で正規分布に近いデータ
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    data.push(50 + z * spread);
  }
  return data.map((v) => Math.max(0, Math.min(100, Math.round(v))));
}

function HistogramVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<number[]>(() => generateData(50, 15));
  const [binSize, setBinSize] = useState(10);
  const [dataCount, setDataCount] = useState(50);

  const regenerate = useCallback(() => {
    setData(generateData(dataCount, 15));
  }, [dataCount]);

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

    // 度数分布を計算
    const bins: { min: number; max: number; count: number }[] = [];
    for (let i = 0; i < 100; i += binSize) {
      bins.push({ min: i, max: i + binSize, count: 0 });
    }
    for (const v of data) {
      const idx = Math.min(Math.floor(v / binSize), bins.length - 1);
      bins[idx].count++;
    }

    const maxCount = Math.max(1, ...bins.map((b) => b.count));
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;
    const barW = plotW / bins.length;

    // 軸
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, h - margin.bottom);
    ctx.lineTo(w - margin.right, h - margin.bottom);
    ctx.stroke();

    // Y軸目盛り
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "right";
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const val = Math.round((maxCount / yTicks) * i);
      const y = h - margin.bottom - (val / maxCount) * plotH;
      ctx.fillText(`${val}`, margin.left - 6, y + 4);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(w - margin.right, y);
      ctx.stroke();
    }

    // X軸ラベル
    ctx.textAlign = "center";
    for (let i = 0; i < bins.length; i++) {
      const x = margin.left + i * barW + barW / 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText(`${bins[i].min}`, x, h - margin.bottom + 16);
    }
    ctx.fillText("(点)", w - margin.right, h - margin.bottom + 16);

    // ラベル
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "center";
    ctx.fillText("度数", margin.left - 6, margin.top - 6);

    // ヒストグラム
    for (let i = 0; i < bins.length; i++) {
      const barH = (bins[i].count / maxCount) * plotH;
      const x = margin.left + i * barW;
      const y = h - margin.bottom - barH;

      const gradient = ctx.createLinearGradient(x, y, x, h - margin.bottom);
      gradient.addColorStop(0, "rgba(66, 165, 245, 0.8)");
      gradient.addColorStop(1, "rgba(66, 165, 245, 0.3)");
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y, barW - 2, barH);

      ctx.strokeStyle = "#42a5f5";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y, barW - 2, barH);

      // 度数ラベル
      if (bins[i].count > 0) {
        ctx.font = "bold 10px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(`${bins[i].count}`, x + barW / 2, y - 4);
      }
    }
  }, [data, binSize]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const mean = data.length > 0 ? data.reduce((s, v) => s + v, 0) / data.length : 0;
  const median = (() => {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  })();

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>度数分布とヒストグラム</h2>
        <p className="algo-subtitle">Frequency Distribution &amp; Histogram</p>
      </div>

      <div className="formula">データ数: {data.length}</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>{mean.toFixed(1)}</span>
            <span className="stat-label">平均値</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>{median}</span>
            <span className="stat-label">中央値</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>データ数</label>
          <input type="range" min="10" max="200" step="10" value={dataCount} onChange={(e) => setDataCount(Number(e.target.value))} />
          <span className="value">{dataCount}</span>
        </div>
        <div className="slider-group">
          <label>階級幅</label>
          <input type="range" min="5" max="20" step="5" value={binSize} onChange={(e) => setBinSize(Number(e.target.value))} />
          <span className="value">{binSize}</span>
        </div>
        <button className="btn-step" onClick={regenerate} style={{ fontSize: 13, padding: "6px 12px" }}>
          再生成
        </button>
      </div>

      <div className="step-info">
        <p className="step-description">
          データ数と階級幅を変えて、分布の見え方がどう変わるか確認しよう
        </p>
      </div>
    </div>
  );
}

export default HistogramVisualizer;
