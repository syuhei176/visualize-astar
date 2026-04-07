import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function LightReflectionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);
  const draggingRef = useRef(false);

  const getCanvasCoords = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      draggingRef.current = true;
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mirrorY = rect.height * 0.65;
      const cx = rect.width / 2;
      const dx = x - cx;
      const dy = y - mirrorY;
      if (dy < 0) {
        const a = Math.atan2(-dy, Math.abs(dx)) * (180 / Math.PI);
        setAngle(Math.max(5, Math.min(85, 90 - a)));
      }
    },
    [getCanvasCoords],
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mirrorY = rect.height * 0.65;
      const cx = rect.width / 2;
      const dx = x - cx;
      const dy = y - mirrorY;
      if (dy < 0) {
        const a = Math.atan2(-dy, Math.abs(dx)) * (180 / Math.PI);
        setAngle(Math.max(5, Math.min(85, 90 - a)));
      }
    },
    [getCanvasCoords],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("touchstart", handlePointerDown, { passive: false });
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

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

    const mirrorY = h * 0.65;
    const cx = w / 2;
    const rayLen = Math.min(w, h) * 0.5;
    const angleRad = (angle * Math.PI) / 180;

    // Mirror surface
    ctx.beginPath();
    ctx.moveTo(w * 0.1, mirrorY);
    ctx.lineTo(w * 0.9, mirrorY);
    ctx.strokeStyle = "#69f0ae";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Mirror hash marks
    for (let mx = w * 0.1; mx <= w * 0.9; mx += 15) {
      ctx.beginPath();
      ctx.moveTo(mx, mirrorY);
      ctx.lineTo(mx - 6, mirrorY + 10);
      ctx.strokeStyle = "rgba(105, 240, 174, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Normal line (dashed)
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.moveTo(cx, mirrorY - rayLen * 0.95);
    ctx.lineTo(cx, mirrorY + rayLen * 0.3);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Label normal
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "left";
    ctx.fillText("法線 (Normal)", cx + 6, mirrorY - rayLen * 0.85);

    // Incident ray
    const incX = cx - rayLen * Math.sin(angleRad);
    const incY = mirrorY - rayLen * Math.cos(angleRad);
    ctx.beginPath();
    ctx.moveTo(incX, incY);
    ctx.lineTo(cx, mirrorY);
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Arrow on incident ray
    const arrowAngle = Math.atan2(mirrorY - incY, cx - incX);
    const arrowMidX = (incX + cx) / 2;
    const arrowMidY = (incY + mirrorY) / 2;
    ctx.beginPath();
    ctx.moveTo(arrowMidX, arrowMidY);
    ctx.lineTo(
      arrowMidX - 10 * Math.cos(arrowAngle - 0.4),
      arrowMidY - 10 * Math.sin(arrowAngle - 0.4),
    );
    ctx.moveTo(arrowMidX, arrowMidY);
    ctx.lineTo(
      arrowMidX - 10 * Math.cos(arrowAngle + 0.4),
      arrowMidY - 10 * Math.sin(arrowAngle + 0.4),
    );
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reflected ray
    const refX = cx + rayLen * Math.sin(angleRad);
    const refY = mirrorY - rayLen * Math.cos(angleRad);
    ctx.beginPath();
    ctx.moveTo(cx, mirrorY);
    ctx.lineTo(refX, refY);
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Arrow on reflected ray
    const refArrowAngle = Math.atan2(refY - mirrorY, refX - cx);
    const refArrowMidX = (cx + refX) / 2;
    const refArrowMidY = (mirrorY + refY) / 2;
    ctx.beginPath();
    ctx.moveTo(refArrowMidX, refArrowMidY);
    ctx.lineTo(
      refArrowMidX - 10 * Math.cos(refArrowAngle - 0.4),
      refArrowMidY - 10 * Math.sin(refArrowAngle - 0.4),
    );
    ctx.moveTo(refArrowMidX, refArrowMidY);
    ctx.lineTo(
      refArrowMidX - 10 * Math.cos(refArrowAngle + 0.4),
      refArrowMidY - 10 * Math.sin(refArrowAngle + 0.4),
    );
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Angle arcs
    const arcR = 40;

    // Incident angle arc
    ctx.beginPath();
    ctx.arc(cx, mirrorY, arcR, -Math.PI / 2 - angleRad, -Math.PI / 2);
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reflection angle arc
    ctx.beginPath();
    ctx.arc(cx, mirrorY, arcR, -Math.PI / 2, -Math.PI / 2 + angleRad);
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Angle labels
    const labelR = arcR + 16;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#42a5f5";
    const incLabelAngle = -Math.PI / 2 - angleRad / 2;
    ctx.fillText(
      `${angle.toFixed(0)}°`,
      cx + labelR * Math.cos(incLabelAngle),
      mirrorY + labelR * Math.sin(incLabelAngle),
    );

    ctx.fillStyle = "#ff9800";
    const refLabelAngle = -Math.PI / 2 + angleRad / 2;
    ctx.fillText(
      `${angle.toFixed(0)}°`,
      cx + labelR * Math.cos(refLabelAngle),
      mirrorY + labelR * Math.sin(refLabelAngle),
    );

    // Labels
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#42a5f5";
    ctx.textAlign = "center";
    ctx.fillText("入射光", incX + 20, incY + 16);
    ctx.fillStyle = "#ff9800";
    ctx.fillText("反射光", refX - 20, refY + 16);

    // Equality highlight
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "center";
    ctx.fillText(`入射角 = 反射角 = ${angle.toFixed(0)}°`, cx, h * 0.12);
  }, [angle]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>光の反射</h2>
        <p className="algo-subtitle">Law of Reflection</p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>入射角</label>
          <input
            type="range"
            min="5"
            max="85"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
          />
          <span className="value">{angle.toFixed(0)}°</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          キャンバスをドラッグするか、スライダーで入射角を変えて反射の法則を確認しよう
        </p>
      </div>
    </div>
  );
}

export default LightReflectionVisualizer;
