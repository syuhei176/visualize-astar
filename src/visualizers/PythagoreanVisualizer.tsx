import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function PythagoreanVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const c = Math.sqrt(a * a + b * b);

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

    // Scale: fit triangle + largest square
    const totalWidth = a + b;
    const totalHeight = b + a;
    const scale = Math.min(w, h) * 0.55 / Math.max(totalWidth, totalHeight);
    const fontSize = Math.max(12, Math.min(scale * 0.7, 18));

    // Triangle vertices - right angle at bottom-left
    // A = bottom-left (right angle), B = bottom-right, C = top-left
    const offsetX = w / 2 - (a * scale) / 2 + (b * scale) / 4;
    const offsetY = h / 2 + (b * scale) / 4;

    const Ax = offsetX;
    const Ay = offsetY;
    const Bx = offsetX + a * scale;
    const By = offsetY;
    const Cx = offsetX;
    const Cy = offsetY - b * scale;

    // Square on side a (bottom side AB) - drawn BELOW
    ctx.fillStyle = "rgba(66, 165, 245, 0.25)";
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2;
    ctx.fillRect(Ax, Ay, a * scale, a * scale);
    ctx.strokeRect(Ax, Ay, a * scale, a * scale);
    ctx.fillStyle = "#42a5f5";
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`a² = ${a * a}`, Ax + (a * scale) / 2, Ay + (a * scale) / 2);

    // Square on side b (left side AC) - drawn to the LEFT
    ctx.fillStyle = "rgba(105, 240, 174, 0.25)";
    ctx.strokeStyle = "#69f0ae";
    ctx.fillRect(Ax - b * scale, Cy, b * scale, b * scale);
    ctx.strokeRect(Ax - b * scale, Cy, b * scale, b * scale);
    ctx.fillStyle = "#69f0ae";
    ctx.fillText(`b² = ${b * b}`, Ax - (b * scale) / 2, Cy + (b * scale) / 2);

    // Square on side c (hypotenuse BC) - drawn to the RIGHT/outside
    // Hypotenuse goes from C(top-left) to B(bottom-right)
    // Normal direction pointing outward (to the right of C→B)
    const dx = Bx - Cx;
    const dy = By - Cy;
    // Perpendicular outward: rotate (dx, dy) by -90°
    const nx = dy;
    const ny = -dx;

    // Four corners of the c-square
    const c1x = Cx;
    const c1y = Cy;
    const c2x = Bx;
    const c2y = By;
    const c3x = Bx + nx;
    const c3y = By + ny;
    const c4x = Cx + nx;
    const c4y = Cy + ny;

    ctx.beginPath();
    ctx.moveTo(c1x, c1y);
    ctx.lineTo(c2x, c2y);
    ctx.lineTo(c3x, c3y);
    ctx.lineTo(c4x, c4y);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 152, 0, 0.25)";
    ctx.fill();
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ff9800";
    ctx.fillText(
      `c² = ${(c * c).toFixed(0)}`,
      (c1x + c2x + c3x + c4x) / 4,
      (c1y + c2y + c3y + c4y) / 4,
    );

    // Draw triangle on top
    ctx.beginPath();
    ctx.moveTo(Ax, Ay);
    ctx.lineTo(Bx, By);
    ctx.lineTo(Cx, Cy);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Right angle marker at A
    const m = Math.min(14, scale * 0.6);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Ax + m, Ay);
    ctx.lineTo(Ax + m, Ay - m);
    ctx.lineTo(Ax, Ay - m);
    ctx.stroke();

    // Side labels
    ctx.font = `bold ${Math.max(14, fontSize)}px sans-serif`;
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "#42a5f5";
    ctx.textAlign = "center";
    ctx.fillText(`a = ${a}`, (Ax + Bx) / 2, Ay - 8);

    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "right";
    ctx.fillText(`b = ${b}`, Ax - 8, (Ay + Cy) / 2 + 5);

    ctx.fillStyle = "#ff9800";
    ctx.textAlign = "left";
    ctx.fillText(`c = ${c.toFixed(2)}`, (Bx + Cx) / 2 + 8, (By + Cy) / 2);
  }, [a, b, c]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>三平方の定理</h2>
        <p className="algo-subtitle">Pythagorean Theorem</p>
      </div>

      <div className="formula">a² + b² = c²</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{a * a}</span>
            <span className="stat-label">a²</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">+</span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{b * b}</span>
            <span className="stat-label">b²</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">=</span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{a * a + b * b}</span>
            <span className="stat-label">c²</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>a</label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
          />
          <span className="value">{a}</span>
        </div>
        <div className="slider-group">
          <label>b</label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
          />
          <span className="value">{b}</span>
        </div>
      </div>
    </div>
  );
}

export default PythagoreanVisualizer;
