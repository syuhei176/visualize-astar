import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function LightRefractionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [incidentAngle, setIncidentAngle] = useState(45);
  const n1 = 1.0; // air
  const n2 = 1.33; // water

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

    const boundaryY = h * 0.45;
    const cx = w / 2;
    const rayLen = Math.min(w, h) * 0.38;

    // Air region
    ctx.fillStyle = "rgba(135, 206, 250, 0.06)";
    ctx.fillRect(0, 0, w, boundaryY);

    // Water region
    ctx.fillStyle = "rgba(30, 100, 200, 0.15)";
    ctx.fillRect(0, boundaryY, w, h - boundaryY);

    // Labels
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "left";
    ctx.fillText("空気 (n = 1.00)", 12, 24);
    ctx.fillStyle = "rgba(100, 180, 255, 0.6)";
    ctx.fillText("水 (n = 1.33)", 12, boundaryY + 24);

    // Boundary line
    ctx.beginPath();
    ctx.moveTo(0, boundaryY);
    ctx.lineTo(w, boundaryY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wavy water surface
    ctx.beginPath();
    ctx.moveTo(0, boundaryY);
    for (let x = 0; x <= w; x += 2) {
      ctx.lineTo(x, boundaryY + Math.sin(x * 0.05) * 2);
    }
    ctx.strokeStyle = "rgba(100, 180, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Normal line (dashed)
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.moveTo(cx, boundaryY - rayLen * 0.95);
    ctx.lineTo(cx, boundaryY + rayLen * 0.95);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    const theta1 = (incidentAngle * Math.PI) / 180;
    // Snell's law: n1 sin(theta1) = n2 sin(theta2)
    const sinTheta2 = (n1 * Math.sin(theta1)) / n2;
    const totalReflection = Math.abs(sinTheta2) > 1;
    const theta2 = totalReflection ? Math.PI / 2 : Math.asin(sinTheta2);

    // Incident ray (from top-left to boundary center)
    const incX = cx - rayLen * Math.sin(theta1);
    const incY = boundaryY - rayLen * Math.cos(theta1);
    ctx.beginPath();
    ctx.moveTo(incX, incY);
    ctx.lineTo(cx, boundaryY);
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Arrow on incident ray
    const aMid = { x: (incX + cx) / 2, y: (incY + boundaryY) / 2 };
    const aAngle = Math.atan2(boundaryY - incY, cx - incX);
    ctx.beginPath();
    ctx.moveTo(aMid.x, aMid.y);
    ctx.lineTo(aMid.x - 10 * Math.cos(aAngle - 0.4), aMid.y - 10 * Math.sin(aAngle - 0.4));
    ctx.moveTo(aMid.x, aMid.y);
    ctx.lineTo(aMid.x - 10 * Math.cos(aAngle + 0.4), aMid.y - 10 * Math.sin(aAngle + 0.4));
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Refracted ray
    if (!totalReflection) {
      const refX = cx + rayLen * Math.sin(theta2);
      const refY = boundaryY + rayLen * Math.cos(theta2);
      ctx.beginPath();
      ctx.moveTo(cx, boundaryY);
      ctx.lineTo(refX, refY);
      ctx.strokeStyle = "#ff9800";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Arrow
      const rMid = { x: (cx + refX) / 2, y: (boundaryY + refY) / 2 };
      const rAngle = Math.atan2(refY - boundaryY, refX - cx);
      ctx.beginPath();
      ctx.moveTo(rMid.x, rMid.y);
      ctx.lineTo(rMid.x - 10 * Math.cos(rAngle - 0.4), rMid.y - 10 * Math.sin(rAngle - 0.4));
      ctx.moveTo(rMid.x, rMid.y);
      ctx.lineTo(rMid.x - 10 * Math.cos(rAngle + 0.4), rMid.y - 10 * Math.sin(rAngle + 0.4));
      ctx.strokeStyle = "#ff9800";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Refraction angle arc
      const arcR = 35;
      ctx.beginPath();
      ctx.arc(cx, boundaryY, arcR, Math.PI / 2 - theta2, Math.PI / 2);
      ctx.strokeStyle = "#ff9800";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#ff9800";
      ctx.textAlign = "center";
      const refAngleDeg = (theta2 * 180) / Math.PI;
      const rLabelAngle = Math.PI / 2 - theta2 / 2;
      ctx.fillText(
        `${refAngleDeg.toFixed(1)}°`,
        cx + (arcR + 18) * Math.cos(rLabelAngle),
        boundaryY + (arcR + 18) * Math.sin(rLabelAngle),
      );

      // Straw effect: draw a straight straw that appears bent
      const strawWidth = 6;
      // Straw in air (straight from top)
      ctx.beginPath();
      ctx.moveTo(cx - strawWidth / 2, boundaryY - rayLen * 0.6);
      ctx.lineTo(cx + strawWidth / 2, boundaryY - rayLen * 0.6);
      ctx.lineTo(cx + strawWidth / 2, boundaryY);
      ctx.lineTo(cx - strawWidth / 2, boundaryY);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 200, 100, 0.25)";
      ctx.fill();

      // Straw in water (shifted due to refraction)
      const shift = rayLen * 0.5 * Math.sin(theta1 - theta2) * 0.6;
      ctx.beginPath();
      ctx.moveTo(cx - strawWidth / 2, boundaryY);
      ctx.lineTo(cx + strawWidth / 2, boundaryY);
      ctx.lineTo(cx + strawWidth / 2 + shift, boundaryY + rayLen * 0.5);
      ctx.lineTo(cx - strawWidth / 2 + shift, boundaryY + rayLen * 0.5);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 200, 100, 0.2)";
      ctx.fill();
    }

    // Incident angle arc
    const arcR = 35;
    ctx.beginPath();
    ctx.arc(cx, boundaryY, arcR, -Math.PI / 2 - theta1, -Math.PI / 2);
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#42a5f5";
    ctx.textAlign = "center";
    const iLabelAngle = -Math.PI / 2 - theta1 / 2;
    ctx.fillText(
      `${incidentAngle}°`,
      cx + (arcR + 18) * Math.cos(iLabelAngle),
      boundaryY + (arcR + 18) * Math.sin(iLabelAngle),
    );

    // Snell's law display
    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "center";
    if (!totalReflection) {
      const theta2Deg = (theta2 * 180) / Math.PI;
      ctx.fillText(
        `n\u2081 sin\u03B8\u2081 = n\u2082 sin\u03B8\u2082`,
        cx,
        h * 0.06,
      );
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(
        `${n1.toFixed(2)} \u00D7 sin(${incidentAngle}°) = ${n2.toFixed(2)} \u00D7 sin(${theta2Deg.toFixed(1)}°)`,
        cx,
        h * 0.06 + 22,
      );
    } else {
      ctx.fillText("全反射 (Total Internal Reflection)", cx, h * 0.06);
    }

    // Ray labels
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#42a5f5";
    ctx.fillText("入射光", incX + 30, incY + 10);
    ctx.fillStyle = "#ff9800";
    if (!totalReflection) {
      ctx.fillText("屈折光", cx + rayLen * Math.sin(theta2) - 30, boundaryY + rayLen * Math.cos(theta2) - 10);
    }
  }, [incidentAngle]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>光の屈折</h2>
        <p className="algo-subtitle">Snell's Law of Refraction</p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>入射角</label>
          <input
            type="range"
            min="0"
            max="85"
            value={incidentAngle}
            onChange={(e) => setIncidentAngle(Number(e.target.value))}
          />
          <span className="value">{incidentAngle}°</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          スライダーで入射角を変えて、水中での光の屈折を観察しよう（ストローが曲がって見える現象）
        </p>
      </div>
    </div>
  );
}

export default LightRefractionVisualizer;
