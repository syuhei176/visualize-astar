import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function BuoyancyVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [objectDensity, setObjectDensity] = useState(0.5); // g/cm^3
  const [objectSize, setObjectSize] = useState(50); // side length visual

  const waterDensity = 1.0; // g/cm^3
  const g = 9.8;
  const volume = (objectSize / 100) ** 3; // m^3 (scaled)
  const mass = objectDensity * volume * 1000; // kg
  const weight = mass * g; // N

  // Submerged fraction
  const submergedFrac = objectDensity >= waterDensity
    ? 1.0
    : objectDensity / waterDensity;

  const buoyancy = waterDensity * 1000 * g * volume * submergedFrac; // N
  const floats = objectDensity < waterDensity;

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

    const t = timeRef.current;
    const cx = w / 2;

    // Container
    const containerW = Math.min(w * 0.7, 300);
    const containerH = h * 0.6;
    const containerX = cx - containerW / 2;
    const containerY = h * 0.15;
    const waterTop = containerY + containerH * 0.2;
    const waterBottom = containerY + containerH;

    // Water with depth pressure gradient
    const waterH = waterBottom - waterTop;
    for (let row = 0; row < waterH; row++) {
      const frac = row / waterH;
      const r = Math.round(10 + frac * 5);
      const gv = Math.round(60 + frac * 20);
      const b = Math.round(120 + frac * 40);
      const alpha = 0.4 + frac * 0.3;
      ctx.fillStyle = `rgba(${r}, ${gv}, ${b}, ${alpha})`;
      ctx.fillRect(containerX, waterTop + row, containerW, 1);
    }

    // Depth pressure arrows (right side)
    const arrowCount = 5;
    for (let i = 0; i < arrowCount; i++) {
      const frac = (i + 1) / (arrowCount + 1);
      const ay = waterTop + frac * waterH;
      const arrowLen = 10 + frac * 30;

      ctx.beginPath();
      ctx.moveTo(containerX + containerW + 5, ay);
      ctx.lineTo(containerX + containerW + 5 + arrowLen, ay);
      ctx.strokeStyle = `rgba(66, 165, 245, ${0.3 + frac * 0.4})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(containerX + containerW + 5 + arrowLen, ay);
      ctx.lineTo(containerX + containerW + arrowLen - 2, ay - 3);
      ctx.lineTo(containerX + containerW + arrowLen - 2, ay + 3);
      ctx.closePath();
      ctx.fillStyle = `rgba(66, 165, 245, ${0.3 + frac * 0.4})`;
      ctx.fill();
    }
    ctx.fillStyle = "rgba(66, 165, 245, 0.5)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("水圧", containerX + containerW + 8, waterTop + 10);
    ctx.fillText("(深さに比例)", containerX + containerW + 8, waterTop + 22);

    // Water surface waves
    ctx.beginPath();
    ctx.moveTo(containerX, waterTop);
    for (let x = containerX; x <= containerX + containerW; x += 2) {
      const wave = Math.sin((x - containerX) * 0.05 + t * 0.04) * 2;
      ctx.lineTo(x, waterTop + wave);
    }
    ctx.strokeStyle = "rgba(100, 181, 246, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Container walls
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(containerX, containerY);
    ctx.lineTo(containerX, waterBottom);
    ctx.lineTo(containerX + containerW, waterBottom);
    ctx.lineTo(containerX + containerW, containerY);
    ctx.stroke();

    // Object
    const objW = objectSize;
    const objH = objectSize;
    const objX = cx - objW / 2;

    // Object Y position based on buoyancy
    let objY: number;
    if (floats) {
      // Floating: submergedFrac of object below water surface
      const bob = Math.sin(t * 0.04) * 2;
      objY = waterTop - objH * (1 - submergedFrac) + bob;
    } else {
      // Sinking: sits at bottom
      const sinkProgress = Math.min(1, t * 0.01);
      const targetY = waterBottom - objH;
      const startY = waterTop - objH * 0.3;
      objY = startY + (targetY - startY) * sinkProgress;
    }

    // Object shadow in water
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(objX + 4, objY + 4, objW, objH);

    // Object body
    const objColor = floats ? "#69f0ae" : "#ef5350";
    const objColorDark = floats ? "#2e7d32" : "#b71c1c";
    const objGrad = ctx.createLinearGradient(objX, objY, objX, objY + objH);
    objGrad.addColorStop(0, objColor);
    objGrad.addColorStop(1, objColorDark);
    ctx.fillStyle = objGrad;
    ctx.beginPath();
    ctx.roundRect(objX, objY, objW, objH, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Object label
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${objectDensity}`, cx, objY + objH / 2 - 6);
    ctx.font = "10px sans-serif";
    ctx.fillText("g/cm\u00b3", cx, objY + objH / 2 + 8);

    // Force arrows
    const arrowScale = 2;
    // Gravity (down)
    const wArrowLen = weight * arrowScale;
    drawForceArrow(ctx, cx - 20, objY + objH, 0, Math.min(wArrowLen, 80), "#ef5350", `W=${weight.toFixed(1)}N`);

    // Buoyancy (up)
    const bArrowLen = buoyancy * arrowScale;
    drawForceArrow(ctx, cx + 20, objY, 0, -Math.min(bArrowLen, 80), "#42a5f5", `F\u6d6e=${buoyancy.toFixed(1)}N`);

    // Status label
    ctx.fillStyle = floats ? "#69f0ae" : "#ef5350";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(floats ? "\u6d6e\u304f" : "\u6c88\u3080", cx, containerY - 10);

    // Water level label
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("\u6c34\u9762", containerX - 5, waterTop + 4);
  }, [objectDensity, objectSize, submergedFrac, floats, weight, buoyancy]);

  useEffect(() => {
    timeRef.current = 0;
  }, [objectDensity]);

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
        <h2>水圧と浮力</h2>
        <p className="algo-subtitle">Water Pressure &amp; Buoyancy</p>
      </div>

      <div className="step-info">
        <p className="step-description">
          物体の密度を変えて浮き沈みを観察しよう。浮力 = 排水した水の重さ
        </p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>密度</label>
          <input type="range" min="0.1" max="3.0" step="0.1" value={objectDensity}
            onChange={(e) => setObjectDensity(Number(e.target.value))} />
          <span className="value">{objectDensity.toFixed(1)}</span>
        </div>
        <div className="slider-group">
          <label>大きさ</label>
          <input type="range" min="30" max="80" step="5" value={objectSize}
            onChange={(e) => setObjectSize(Number(e.target.value))} />
          <span className="value">{objectSize}</span>
        </div>
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ef5350" }}>{weight.toFixed(1)}N</span>
            <span className="stat-label">重力 W</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: floats ? "#69f0ae" : "#ef5350" }}>
              {floats ? "\u2265" : "<"}
            </span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>{buoyancy.toFixed(1)}N</span>
            <span className="stat-label">浮力 F</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ffca28" }}>
              {objectDensity.toFixed(1)}
            </span>
            <span className="stat-label">密度 (g/cm&sup3;)</span>
          </div>
        </div>
      </div>

      <div className="formula">
        浮力 = &rho;水 &times; g &times; V排水 = {buoyancy.toFixed(2)} N
      </div>
    </div>
  );
}

function drawForceArrow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, dx: number, dy: number,
  color: string, label: string,
) {
  const ex = x + dx;
  const ey = y + dy;
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();

  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - headLen * Math.cos(angle - 0.4), ey - headLen * Math.sin(angle - 0.4));
  ctx.lineTo(ex - headLen * Math.cos(angle + 0.4), ey - headLen * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = dx >= 0 ? "left" : "right";
  ctx.textBaseline = "middle";
  const labelOffX = dy === 0 ? 0 : (dx >= 0 ? 8 : -8);
  ctx.fillText(label, ex + labelOffX + (dy > 0 ? 12 : dy < 0 ? -12 : 0), ey);
}

export default BuoyancyVisualizer;
