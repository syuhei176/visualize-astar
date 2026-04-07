import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function ConvexLensVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objectDist, setObjectDist] = useState(200);
  const focalLength = 80;
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
      const { x } = getCanvasCoords(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const lensCx = rect.width / 2;
      if (x < lensCx) {
        draggingRef.current = true;
        e.preventDefault();
      }
    },
    [getCanvasCoords],
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const { x } = getCanvasCoords(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const lensCx = rect.width / 2;
      const dist = Math.max(20, lensCx - x);
      setObjectDist(dist);
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

    const lensCx = w / 2;
    const axisY = h * 0.5;
    const f = focalLength;
    const objH = 50;

    // Optical axis
    ctx.beginPath();
    ctx.moveTo(20, axisY);
    ctx.lineTo(w - 20, axisY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Lens
    const lensH = Math.min(h * 0.7, 200);
    ctx.beginPath();
    ctx.ellipse(lensCx, axisY, 6, lensH / 2, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(100, 180, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(100, 180, 255, 0.1)";
    ctx.fill();

    // Lens arrows
    const arrSize = 10;
    ctx.beginPath();
    ctx.moveTo(lensCx - arrSize, axisY - lensH / 2 + arrSize);
    ctx.lineTo(lensCx, axisY - lensH / 2);
    ctx.lineTo(lensCx + arrSize, axisY - lensH / 2 + arrSize);
    ctx.moveTo(lensCx - arrSize, axisY + lensH / 2 - arrSize);
    ctx.lineTo(lensCx, axisY + lensH / 2);
    ctx.lineTo(lensCx + arrSize, axisY + lensH / 2 - arrSize);
    ctx.strokeStyle = "rgba(100, 180, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Focal points
    const drawFocalPoint = (x: number, label: string) => {
      ctx.beginPath();
      ctx.arc(x, axisY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ff9800";
      ctx.fill();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#ff9800";
      ctx.textAlign = "center";
      ctx.fillText(label, x, axisY + 18);
    };
    drawFocalPoint(lensCx - f, "F");
    drawFocalPoint(lensCx + f, "F'");
    drawFocalPoint(lensCx - 2 * f, "2F");
    drawFocalPoint(lensCx + 2 * f, "2F'");

    // Object (arrow)
    const objX = lensCx - objectDist;
    ctx.beginPath();
    ctx.moveTo(objX, axisY);
    ctx.lineTo(objX, axisY - objH);
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 3;
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(objX - 6, axisY - objH + 10);
    ctx.lineTo(objX, axisY - objH);
    ctx.lineTo(objX + 6, axisY - objH + 10);
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#42a5f5";
    ctx.textAlign = "center";
    ctx.fillText("物体", objX, axisY + 16);

    // Lens equation: 1/v = 1/f - 1/u => v = uf/(u-f)
    const u = objectDist;
    const isVirtual = u < f;
    const v = isVirtual ? (u * f) / (f - u) : (u * f) / (u - f);
    const mag = v / u;
    const imgH = objH * mag;

    // Ray tracing
    const objTopX = objX;
    const objTopY = axisY - objH;

    if (!isVirtual) {
      // Real image
      const imgX = lensCx + v;
      const imgY = axisY + imgH;

      // Ray 1: Parallel to axis, then through F'
      ctx.beginPath();
      ctx.moveTo(objTopX, objTopY);
      ctx.lineTo(lensCx, objTopY);
      ctx.lineTo(imgX, imgY);
      ctx.strokeStyle = "rgba(255, 152, 0, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ray 2: Through center of lens
      ctx.beginPath();
      ctx.moveTo(objTopX, objTopY);
      ctx.lineTo(imgX, imgY);
      ctx.strokeStyle = "rgba(105, 240, 174, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ray 3: Through F, then parallel
      ctx.beginPath();
      ctx.moveTo(objTopX, objTopY);
      const slopeToF = (axisY - objTopY) / (lensCx - f - objTopX);
      const yAtLens = objTopY + slopeToF * (lensCx - objTopX);
      ctx.lineTo(lensCx, yAtLens);
      ctx.lineTo(imgX, imgY);
      ctx.strokeStyle = "rgba(171, 71, 188, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Image (inverted arrow)
      ctx.beginPath();
      ctx.moveTo(imgX, axisY);
      ctx.lineTo(imgX, imgY);
      ctx.strokeStyle = "#ef5350";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(imgX - 6, imgY - 10);
      ctx.lineTo(imgX, imgY);
      ctx.lineTo(imgX + 6, imgY - 10);
      ctx.strokeStyle = "#ef5350";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#ef5350";
      ctx.textAlign = "center";
      ctx.fillText("実像", imgX, axisY + 16);
    } else {
      // Virtual image (same side as object, upright, magnified)
      const imgX = lensCx - v;
      const imgTopY = axisY - imgH;

      // Ray 1: Parallel to axis, refracts through F' (extend back)
      ctx.beginPath();
      ctx.moveTo(objTopX, objTopY);
      ctx.lineTo(lensCx, objTopY);
      ctx.strokeStyle = "rgba(255, 152, 0, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Refracted part going through F'
      const slope1 = (objTopY - axisY) / (lensCx - (lensCx + f));
      const farX1 = lensCx + 200;
      const farY1 = objTopY + slope1 * 200;
      ctx.beginPath();
      ctx.moveTo(lensCx, objTopY);
      ctx.lineTo(farX1, farY1);
      ctx.strokeStyle = "rgba(255, 152, 0, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Virtual extension (dashed)
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(lensCx, objTopY);
      ctx.lineTo(imgX, imgTopY);
      ctx.strokeStyle = "rgba(255, 152, 0, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // Ray 2: Through center
      ctx.beginPath();
      ctx.moveTo(objTopX, objTopY);
      const slope2 = (objTopY - axisY) / (objTopX - lensCx);
      const farX2 = lensCx + 200;
      const farY2 = axisY + slope2 * 200;
      ctx.lineTo(farX2, farY2);
      ctx.strokeStyle = "rgba(105, 240, 174, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Virtual extension
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(objTopX, objTopY);
      ctx.lineTo(imgX, imgTopY);
      ctx.strokeStyle = "rgba(105, 240, 174, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // Virtual image (upright arrow, dashed)
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(imgX, axisY);
      ctx.lineTo(imgX, imgTopY);
      ctx.strokeStyle = "#ef5350";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(imgX - 6, imgTopY + 10);
      ctx.lineTo(imgX, imgTopY);
      ctx.lineTo(imgX + 6, imgTopY + 10);
      ctx.strokeStyle = "#ef5350";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#ef5350";
      ctx.textAlign = "center";
      ctx.fillText("虚像", imgX, axisY + 16);
    }

    // Info
    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "center";
    const imageType = isVirtual ? "虚像 (Virtual)" : "実像 (Real)";
    ctx.fillText(
      `${imageType}  |  倍率: ${mag.toFixed(2)}x`,
      w / 2,
      30,
    );

    // Formula
    ctx.font = "13px 'Courier New', monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText(
      `1/f = 1/a + 1/b  =>  f=${f}, a=${u.toFixed(0)}, b=${(isVirtual ? -v : v).toFixed(0)}`,
      w / 2,
      50,
    );

  }, [objectDist, focalLength]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>凸レンズの結像</h2>
        <p className="algo-subtitle">Convex Lens Image Formation</p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>物体距離</label>
          <input
            type="range"
            min="20"
            max="300"
            value={objectDist}
            onChange={(e) => setObjectDist(Number(e.target.value))}
          />
          <span className="value">{objectDist.toFixed(0)}</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          物体をドラッグするか、スライダーで距離を変えて実像と虚像の切り替わりを観察しよう
        </p>
      </div>
    </div>
  );
}

export default ConvexLensVisualizer;
