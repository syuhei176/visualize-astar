import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function primeFactorize(n: number): { factor: number; count: number }[] {
  const factors: { factor: number; count: number }[] = [];
  let d = 2;
  let num = n;
  while (d * d <= num) {
    let count = 0;
    while (num % d === 0) {
      num /= d;
      count++;
    }
    if (count > 0) factors.push({ factor: d, count });
    d++;
  }
  if (num > 1) factors.push({ factor: num, count: 1 });
  return factors;
}

const COLORS = ["#42a5f5", "#69f0ae", "#ff9800", "#ab47bc", "#ef5350", "#ffd740", "#26c6da"];

function PrimeFactorizationVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [number, setNumber] = useState(60);

  const factors = primeFactorize(number);
  const factorString = factors.map((f) => (f.count > 1 ? `${f.factor}^${f.count}` : `${f.factor}`)).join(" × ");

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

    if (number < 2) {
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.textAlign = "center";
      ctx.fillText("2以上の整数を入力してください", w / 2, h / 2);
      return;
    }

    // 因数分解ツリーを描画
    const treeNodes: { value: number; x: number; y: number; color: string; isPrime: boolean }[] = [];
    const treeEdges: { x1: number; y1: number; x2: number; y2: number }[] = [];

    const levelHeight = 50;
    const startY = 30;

    function buildTree(value: number, x: number, y: number, spread: number) {
      const isPrime = primeFactorize(value).length === 1 && primeFactorize(value)[0].count === 1;
      const colorIdx = factors.findIndex((f) => f.factor === value);
      const color = isPrime ? COLORS[colorIdx >= 0 ? colorIdx : 0] : "rgba(255, 255, 255, 0.7)";
      treeNodes.push({ value, x, y, color, isPrime });

      if (isPrime || value < 2) return;

      // 最小の素因数を見つける
      let d = 2;
      while (value % d !== 0) d++;
      const other = value / d;

      const leftX = x - spread;
      const rightX = x + spread;
      const childY = y + levelHeight;

      treeEdges.push({ x1: x, y1: y + 14, x2: leftX, y2: childY - 14 });
      treeEdges.push({ x1: x, y1: y + 14, x2: rightX, y2: childY - 14 });

      buildTree(d, leftX, childY, spread * 0.5);
      buildTree(other, rightX, childY, spread * 0.5);
    }

    const spread = Math.min(w * 0.2, 80);
    buildTree(number, w / 2, startY, spread);

    // エッジ描画
    for (const edge of treeEdges) {
      ctx.beginPath();
      ctx.moveTo(edge.x1, edge.y1);
      ctx.lineTo(edge.x2, edge.y2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // ノード描画
    for (const node of treeNodes) {
      const r = node.isPrime ? 18 : 16;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = node.isPrime ? node.color.replace(")", ", 0.2)").replace("rgb", "rgba") : "rgba(255, 255, 255, 0.05)";
      ctx.fill();
      ctx.strokeStyle = node.isPrime ? node.color : "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = node.isPrime ? 2.5 : 1.5;
      ctx.stroke();

      ctx.font = `bold ${node.isPrime ? 14 : 13}px sans-serif`;
      ctx.fillStyle = node.isPrime ? node.color : "rgba(255, 255, 255, 0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${node.value}`, node.x, node.y);
    }

    // 下部にブロック表現
    const blockY = h - 60;
    const blockSize = Math.min(20, (w - 40) / number);
    const totalW = blockSize * number;
    const startX = (w - totalW) / 2;

    let idx = 0;
    for (let fi = 0; fi < factors.length; fi++) {
      const { factor, count } = factors[fi];
      const total = Math.pow(factor, count);
      const groupSize = number / total;
      for (let g = 0; g < total; g++) {
        for (let j = 0; j < groupSize; j++) {
          ctx.fillStyle = COLORS[fi % COLORS.length].replace(")", ", 0.4)").replace("rgb", "rgba");
          ctx.fillRect(startX + idx * blockSize, blockY, blockSize - 1, 20);
          idx++;
        }
        idx = Math.round(idx); // safety
      }
      // Reset for next factor visual
      idx = 0;
    }
    // Just draw colored blocks per factor group
    idx = 0;
    for (let fi = 0; fi < factors.length; fi++) {
      const color = COLORS[fi % COLORS.length];
      ctx.fillStyle = color;
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${factors[fi].factor}`, startX + (fi * totalW) / factors.length + totalW / factors.length / 2, blockY + 34);
    }
  }, [number, factors]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>素因数分解</h2>
        <p className="algo-subtitle">Prime Factorization</p>
      </div>

      <div className="formula">{number} = {factorString || number}</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          {factors.map((f, i) => (
            <div className="stat-item" key={f.factor}>
              <span className="stat-value" style={{ color: COLORS[i % COLORS.length] }}>
                {f.factor}{f.count > 1 ? <sup>{f.count}</sup> : ""}
              </span>
              <span className="stat-label">素因数</span>
            </div>
          ))}
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>n</label>
          <input type="range" min="2" max="120" step="1" value={number} onChange={(e) => setNumber(Number(e.target.value))} />
          <span className="value">{number}</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          数を変えて、素因数分解のツリー構造を観察しよう
        </p>
      </div>
    </div>
  );
}

export default PrimeFactorizationVisualizer;
