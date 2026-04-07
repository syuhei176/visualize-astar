import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function ElectromagnetVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [currentOn, setCurrentOn] = useState(true);
  const [currentStrength, setCurrentStrength] = useState(5);
  const [reversed, setReversed] = useState(false);

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
    const t = timeRef.current;
    const strength = currentOn ? currentStrength / 10 : 0;
    const dir = reversed ? -1 : 1;

    // Iron core
    const coreW = 120;
    const coreH = 40;
    ctx.fillStyle = "#616161";
    ctx.beginPath();
    ctx.roundRect(cx - coreW / 2, cy - coreH / 2, coreW, coreH, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("鉄芯", cx, cy);

    // Coil wraps
    const coilCount = 8;
    const coilSpacing = coreW / (coilCount + 1);
    const coilRadius = coreH / 2 + 14;
    for (let i = 0; i < coilCount; i++) {
      const x = cx - coreW / 2 + coilSpacing * (i + 1);
      ctx.beginPath();
      ctx.ellipse(x, cy, 6, coilRadius, 0, 0, Math.PI * 2);
      ctx.strokeStyle = currentOn ? "#ff9800" : "rgba(255,152,0,0.3)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Current direction indicator (dots/crosses)
      if (currentOn) {
        const topY = cy - coilRadius;
        const botY = cy + coilRadius;
        ctx.fillStyle = "#ffca28";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Top: current going into page (X) or out (dot) based on direction
        ctx.fillText(dir > 0 ? "\u00d7" : "\u2022", x, topY);
        ctx.fillText(dir > 0 ? "\u2022" : "\u00d7", x, botY);
      }
    }

    // Wire connections
    const wireY1 = cy - coilRadius - 20;
    const wireY2 = cy + coilRadius + 20;
    ctx.strokeStyle = currentOn ? "#ff9800" : "rgba(255,152,0,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - coreW / 2 - 30, wireY1);
    ctx.lineTo(cx + coreW / 2 + 30, wireY1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - coreW / 2 - 30, wireY2);
    ctx.lineTo(cx + coreW / 2 + 30, wireY2);
    ctx.stroke();
    // Vertical wires to coils
    ctx.beginPath();
    ctx.moveTo(cx - coreW / 2 - 30, wireY1);
    ctx.lineTo(cx - coreW / 2 - 30, wireY2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + coreW / 2 + 30, wireY1);
    ctx.lineTo(cx + coreW / 2 + 30, wireY2);
    ctx.stroke();

    // Battery symbol
    const batX = cx - coreW / 2 - 30;
    const batY = cy;
    ctx.strokeStyle = "#ef5350";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(batX - 12, batY - 6);
    ctx.lineTo(batX + 12, batY - 6);
    ctx.stroke();
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(batX - 7, batY + 6);
    ctx.lineTo(batX + 7, batY + 6);
    ctx.stroke();

    // Electron flow animation on wires
    if (currentOn) {
      const speed = strength * 3 * dir;
      const electronCount = 6;
      ctx.fillStyle = "#4fc3f7";
      // Top wire
      for (let i = 0; i < electronCount; i++) {
        const frac = ((t * speed * 0.01 + i / electronCount) % 1 + 1) % 1;
        const ex = (cx - coreW / 2 - 30) + frac * (coreW + 60);
        ctx.beginPath();
        ctx.arc(ex, wireY1, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Bottom wire
      for (let i = 0; i < electronCount; i++) {
        const frac = ((t * speed * 0.01 + i / electronCount + 0.5) % 1 + 1) % 1;
        const ex = (cx + coreW / 2 + 30) - frac * (coreW + 60);
        ctx.beginPath();
        ctx.arc(ex, wireY2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Magnetic field lines
    if (currentOn && strength > 0) {
      const numLines = 5;
      const maxExtend = 60 + strength * 80;
      const nPole = dir > 0 ? 1 : -1; // +1 = right is N

      for (let i = 0; i < numLines; i++) {
        const yOff = (i - (numLines - 1) / 2) * 18;
        const alpha = 0.15 + strength * 0.5;

        // Internal field (inside core, left to right for N on right)
        ctx.beginPath();
        ctx.moveTo(cx - coreW / 2 - 10, cy + yOff);
        ctx.lineTo(cx + coreW / 2 + 10, cy + yOff);
        ctx.strokeStyle = `rgba(66, 165, 245, ${alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // External field lines (curves from N to S)
        const extend = maxExtend * (1 - Math.abs(yOff) / 50);
        if (extend < 20) continue;

        ctx.beginPath();
        const startX = cx + nPole * (coreW / 2 + 10);
        const endX = cx - nPole * (coreW / 2 + 10);
        ctx.moveTo(startX, cy + yOff);

        // Animate: pulse outward
        const pulse = 1 + 0.1 * Math.sin(t * 0.05 + i);
        const extR = extend * pulse;

        ctx.bezierCurveTo(
          startX + nPole * extR * 0.5, cy + yOff - extR * 0.6,
          endX - nPole * extR * 0.5, cy + yOff - extR * 0.6,
          endX, cy + yOff,
        );
        ctx.strokeStyle = `rgba(66, 165, 245, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bottom mirror
        ctx.beginPath();
        ctx.moveTo(startX, cy + yOff);
        ctx.bezierCurveTo(
          startX + nPole * extR * 0.5, cy + yOff + extR * 0.6,
          endX - nPole * extR * 0.5, cy + yOff + extR * 0.6,
          endX, cy + yOff,
        );
        ctx.strokeStyle = `rgba(66, 165, 245, ${alpha})`;
        ctx.stroke();

        // Arrowheads on top curves
        const midTopX = (startX + endX) / 2;
        const midTopY = cy + yOff - extR * 0.6;
        ctx.beginPath();
        ctx.moveTo(midTopX + nPole * 6, midTopY - 4);
        ctx.lineTo(midTopX, midTopY);
        ctx.lineTo(midTopX + nPole * 6, midTopY + 4);
        ctx.strokeStyle = `rgba(66, 165, 245, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // N / S pole labels
      const nX = cx + nPole * (coreW / 2 + 25);
      const sX = cx - nPole * (coreW / 2 + 25);
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ef5350";
      ctx.fillText("N", nX, cy);
      ctx.fillStyle = "#42a5f5";
      ctx.fillText("S", sX, cy);
    }
  }, [currentOn, currentStrength, reversed]);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      timeRef.current += 1;
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>電磁石の仕組み</h2>
        <p className="algo-subtitle">Electromagnet</p>
      </div>

      <div className="step-info">
        <p className="step-description">
          電流をON/OFFして磁場の変化を観察しよう。電流の向きを反転するとN/S極が入れ替わります
        </p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          className={currentOn ? "btn-step" : "btn-reset"}
          onClick={() => setCurrentOn(!currentOn)}
        >
          {currentOn ? "ON" : "OFF"}
        </button>
        <button
          className="btn-reset"
          onClick={() => setReversed(!reversed)}
          disabled={!currentOn}
        >
          電流反転
        </button>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>電流</label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={currentStrength}
            onChange={(e) => setCurrentStrength(Number(e.target.value))}
          />
          <span className="value">{currentStrength}A</span>
        </div>
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: currentOn ? "#69f0ae" : "#ef5350" }}>
              {currentOn ? "ON" : "OFF"}
            </span>
            <span className="stat-label">電流</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ff9800" }}>
              {currentStrength}A
            </span>
            <span className="stat-label">電流の強さ</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>
              {reversed ? "左←右" : "左→右"}
            </span>
            <span className="stat-label">電流の向き</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ElectromagnetVisualizer;
