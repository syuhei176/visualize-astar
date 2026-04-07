import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

function GcdLcmVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [numA, setNumA] = useState(12);
  const [numB, setNumB] = useState(18);

  const g = gcd(numA, numB);
  const l = lcm(numA, numB);

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

    // 上半分: GCDの視覚化（ユークリッドの互除法）
    const stepsY = 20;
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "left";
    ctx.fillText("ユークリッドの互除法", 16, stepsY);

    let a = numA, b = numB;
    const steps: string[] = [];
    while (b !== 0) {
      const r = a % b;
      steps.push(`${a} ÷ ${b} = ${Math.floor(a / b)} ... ${r}`);
      [a, b] = [b, r];
    }
    steps.push(`GCD = ${g}`);

    for (let i = 0; i < steps.length; i++) {
      const y = stepsY + 24 + i * 22;
      ctx.font = "13px monospace";
      ctx.fillStyle = i === steps.length - 1 ? "#43a047" : "rgba(255, 255, 255, 0.5)";
      ctx.fillText(steps[i], 24, y);
    }

    // 下半分: ブロック表現
    const blockAreaY = h * 0.45;
    const maxBlocks = l;
    const blockW = Math.min(16, (w - 40) / maxBlocks);
    const startX = 20;

    // Aの倍数
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#42a5f5";
    ctx.textAlign = "left";
    ctx.fillText(`${numA}の倍数`, startX, blockAreaY);

    for (let i = 1; i <= l / numA; i++) {
      const x = startX + (i * numA - 1) * blockW;
      ctx.fillStyle = "rgba(66, 165, 245, 0.3)";
      for (let j = 0; j < numA; j++) {
        ctx.fillRect(startX + ((i - 1) * numA + j) * blockW, blockAreaY + 6, blockW - 1, 16);
      }
      if (blockW >= 6) {
        ctx.fillStyle = "#42a5f5";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${i * numA}`, x + blockW / 2, blockAreaY + 30);
      }
    }

    // Bの倍数
    const rowBY = blockAreaY + 50;
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "left";
    ctx.fillText(`${numB}の倍数`, startX, rowBY);

    for (let i = 1; i <= l / numB; i++) {
      const x = startX + (i * numB - 1) * blockW;
      ctx.fillStyle = "rgba(105, 240, 174, 0.3)";
      for (let j = 0; j < numB; j++) {
        ctx.fillRect(startX + ((i - 1) * numB + j) * blockW, rowBY + 6, blockW - 1, 16);
      }
      if (blockW >= 6) {
        ctx.fillStyle = "#69f0ae";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${i * numB}`, x + blockW / 2, rowBY + 30);
      }
    }

    // LCMの位置マーク
    const lcmX = startX + (l - 1) * blockW + blockW;
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lcmX, blockAreaY);
    ctx.lineTo(lcmX, rowBY + 30);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#ff9800";
    ctx.textAlign = "center";
    ctx.fillText(`LCM = ${l}`, lcmX, rowBY + 44);

    // GCDの図: 共通のブロックサイズ
    const gcdY = rowBY + 70;
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "left";
    ctx.fillText("GCDブロック", startX, gcdY);

    const gcdBlockW = Math.min(24, (w - 40) / Math.max(numA / g, numB / g));
    // A divided into GCD blocks
    for (let i = 0; i < numA / g; i++) {
      ctx.fillStyle = "rgba(66, 165, 245, 0.3)";
      ctx.fillRect(startX + i * gcdBlockW, gcdY + 6, gcdBlockW - 2, 14);
      ctx.strokeStyle = "#42a5f5";
      ctx.lineWidth = 1;
      ctx.strokeRect(startX + i * gcdBlockW, gcdY + 6, gcdBlockW - 2, 14);
    }
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#42a5f5";
    ctx.textAlign = "left";
    ctx.fillText(`${numA} = ${g} × ${numA / g}`, startX + (numA / g) * gcdBlockW + 6, gcdY + 16);

    for (let i = 0; i < numB / g; i++) {
      ctx.fillStyle = "rgba(105, 240, 174, 0.3)";
      ctx.fillRect(startX + i * gcdBlockW, gcdY + 26, gcdBlockW - 2, 14);
      ctx.strokeStyle = "#69f0ae";
      ctx.lineWidth = 1;
      ctx.strokeRect(startX + i * gcdBlockW, gcdY + 26, gcdBlockW - 2, 14);
    }
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "left";
    ctx.fillText(`${numB} = ${g} × ${numB / g}`, startX + (numB / g) * gcdBlockW + 6, gcdY + 36);
  }, [numA, numB, g, l]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>最大公約数・最小公倍数</h2>
        <p className="algo-subtitle">GCD &amp; LCM</p>
      </div>

      <div className="formula">GCD({numA}, {numB}) = {g}, LCM({numA}, {numB}) = {l}</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#43a047" }}>{g}</span>
            <span className="stat-label">GCD</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ff9800" }}>{l}</span>
            <span className="stat-label">LCM</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>a</label>
          <input type="range" min="2" max="30" step="1" value={numA} onChange={(e) => setNumA(Number(e.target.value))} />
          <span className="value">{numA}</span>
        </div>
        <div className="slider-group">
          <label>b</label>
          <input type="range" min="2" max="30" step="1" value={numB} onChange={(e) => setNumB(Number(e.target.value))} />
          <span className="value">{numB}</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          ユークリッドの互除法とブロック表現でGCDとLCMの関係を確認しよう
        </p>
      </div>
    </div>
  );
}

export default GcdLcmVisualizer;
