import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type ShapeMode = "triangle" | "parallelogram";

interface Point {
  x: number;
  y: number;
}

const COLORS = {
  shape: "#42a5f5",
  base: "#69f0ae",
  height: "#ff9800",
  parallel: "rgba(255, 255, 255, 0.2)",
  vertex: "#ef5350",
  ghost: "rgba(66, 165, 245, 0.15)",
};

function AreaTransformVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<ShapeMode>("triangle");
  // Normalized coordinates (0-1)
  const [apexX, setApexX] = useState(0.5);
  const draggingRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0 });

  const baseLeft: Point = { x: 0.2, y: 0.75 };
  const baseRight: Point = { x: 0.8, y: 0.75 };
  const apexY = 0.25;

  const getCanvasCoords = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const handlePointerDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCanvasCoords(e);
      const { w, h } = sizeRef.current;
      const apexPxX = apexX * w;
      const apexPxY = apexY * h;
      const dist = Math.sqrt((x - apexPxX) ** 2 + (y - apexPxY) ** 2);
      if (dist < 30) {
        draggingRef.current = true;
        e.preventDefault();
        return;
      }
      // For parallelogram, also check top-right vertex
      if (mode === "parallelogram") {
        const topRightX = (apexX + (baseRight.x - baseLeft.x)) * w;
        const topRightY = apexY * h;
        const dist2 = Math.sqrt((x - topRightX) ** 2 + (y - topRightY) ** 2);
        if (dist2 < 30) {
          draggingRef.current = true;
          e.preventDefault();
        }
      }
    },
    [getCanvasCoords, apexX, mode, baseLeft.x, baseRight.x],
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const { x } = getCanvasCoords(e);
      const { w } = sizeRef.current;
      const newX = Math.max(0.05, Math.min(0.95, x / w));
      setApexX(newX);
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
    sizeRef.current = { w, h };
    ctx.clearRect(0, 0, w, h);

    const blPx: Point = { x: baseLeft.x * w, y: baseLeft.y * h };
    const brPx: Point = { x: baseRight.x * w, y: baseRight.y * h };
    const apexPx: Point = { x: apexX * w, y: apexY * h };

    // Draw the parallel line (dashed) at apex height
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = COLORS.parallel;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, apexPx.y);
    ctx.lineTo(w - 10, apexPx.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label the parallel line
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("底辺に平行な直線", w - 14, apexPx.y - 4);

    // Draw ghost shapes showing previous positions
    const ghostPositions = [0.2, 0.35, 0.5, 0.65, 0.8];
    for (const gx of ghostPositions) {
      if (Math.abs(gx - apexX) < 0.08) continue;
      const gPx: Point = { x: gx * w, y: apexY * h };

      ctx.beginPath();
      if (mode === "triangle") {
        ctx.moveTo(blPx.x, blPx.y);
        ctx.lineTo(brPx.x, brPx.y);
        ctx.lineTo(gPx.x, gPx.y);
      } else {
        const topRight: Point = { x: gPx.x + (brPx.x - blPx.x), y: gPx.y };
        ctx.moveTo(blPx.x, blPx.y);
        ctx.lineTo(brPx.x, brPx.y);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.lineTo(gPx.x, gPx.y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(66, 165, 245, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (mode === "triangle") {
      // Draw filled triangle
      ctx.beginPath();
      ctx.moveTo(blPx.x, blPx.y);
      ctx.lineTo(brPx.x, brPx.y);
      ctx.lineTo(apexPx.x, apexPx.y);
      ctx.closePath();
      ctx.fillStyle = "rgba(66, 165, 245, 0.12)";
      ctx.fill();
      ctx.strokeStyle = COLORS.shape;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      // Draw filled parallelogram
      const topRight: Point = { x: apexPx.x + (brPx.x - blPx.x), y: apexPx.y };
      ctx.beginPath();
      ctx.moveTo(blPx.x, blPx.y);
      ctx.lineTo(brPx.x, brPx.y);
      ctx.lineTo(topRight.x, topRight.y);
      ctx.lineTo(apexPx.x, apexPx.y);
      ctx.closePath();
      ctx.fillStyle = "rgba(66, 165, 245, 0.12)";
      ctx.fill();
      ctx.strokeStyle = COLORS.shape;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Top-right vertex
      ctx.beginPath();
      ctx.arc(topRight.x, topRight.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.shape;
      ctx.fill();
    }

    // Draw base (highlighted)
    ctx.beginPath();
    ctx.moveTo(blPx.x, blPx.y);
    ctx.lineTo(brPx.x, brPx.y);
    ctx.strokeStyle = COLORS.base;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Base label
    const baseMidX = (blPx.x + brPx.x) / 2;
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = COLORS.base;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("底辺 (base)", baseMidX, blPx.y + 8);

    // Draw height (dashed, from apex perpendicular to base)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = COLORS.height;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(apexPx.x, apexPx.y);
    ctx.lineTo(apexPx.x, blPx.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right angle mark at foot
    const markSize = 10;
    ctx.strokeStyle = COLORS.height;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(apexPx.x + markSize, blPx.y - markSize);
    ctx.lineTo(apexPx.x + markSize, blPx.y);
    ctx.lineTo(apexPx.x, blPx.y);
    ctx.stroke();

    // Height label
    const heightMidY = (apexPx.y + blPx.y) / 2;
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = COLORS.height;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("高さ (h)", apexPx.x + 14, heightMidY);

    // Draw vertices
    const vertices = [blPx, brPx, apexPx];
    const labels = ["A", "B", "C"];
    for (let i = 0; i < vertices.length; i++) {
      const isApex = i === 2;
      ctx.beginPath();
      ctx.arc(vertices[i].x, vertices[i].y, isApex ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isApex ? COLORS.vertex : COLORS.shape;
      ctx.fill();

      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = isApex ? COLORS.vertex : "rgba(255, 255, 255, 0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = isApex ? "top" : "bottom";
      const yOff = isApex ? -18 : 0;
      ctx.fillText(labels[i], vertices[i].x, vertices[i].y + yOff - (isApex ? 0 : 10));
    }

    // Drag hint on apex
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("← ドラッグ →", apexPx.x, apexPx.y - 22);
  }, [apexX, mode, baseLeft.x, baseLeft.y, baseRight.x, baseRight.y]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  // Calculate actual values for display
  const baseLen = baseRight.x - baseLeft.x;
  const heightVal = baseLeft.y - apexY;
  const basePx = Math.round(baseLen * 400); // arbitrary scale for display
  const heightPx = Math.round(heightVal * 400);
  const area =
    mode === "triangle"
      ? ((basePx * heightPx) / 2).toFixed(0)
      : (basePx * heightPx).toFixed(0);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>面積の等積変形</h2>
        <p className="algo-subtitle">Area-Preserving Transformation</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          className={mode === "triangle" ? "btn-step" : "btn-reset"}
          onClick={() => setMode("triangle")}
          style={{ fontSize: "13px", padding: "6px 12px" }}
        >
          三角形
        </button>
        <button
          className={mode === "parallelogram" ? "btn-step" : "btn-reset"}
          onClick={() => setMode("parallelogram")}
          style={{ fontSize: "13px", padding: "6px 12px" }}
        >
          平行四辺形
        </button>
      </div>

      <div className="formula">
        {mode === "triangle"
          ? `面積 = 底辺 × 高さ ÷ 2 = ${basePx} × ${heightPx} ÷ 2 = ${area}`
          : `面積 = 底辺 × 高さ = ${basePx} × ${heightPx} = ${area}`}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{basePx}</span>
            <span className="stat-label">底辺</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{heightPx}</span>
            <span className="stat-label">高さ</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>{area}</span>
            <span className="stat-label">面積（一定）</span>
          </div>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          頂点Cを左右にドラッグしても、底辺と高さが変わらないので面積は一定です
        </p>
      </div>
    </div>
  );
}

export default AreaTransformVisualizer;
