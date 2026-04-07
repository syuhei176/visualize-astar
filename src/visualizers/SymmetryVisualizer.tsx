import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type SymmetryMode = "line" | "point";

interface Point {
  x: number;
  y: number;
}

const COLORS = {
  original: "#42a5f5",
  reflected: "#69f0ae",
  axis: "#ff9800",
  dashed: "rgba(255, 255, 255, 0.3)",
  point: "#ef5350",
};

function reflectLine(p: Point, axis: "vertical" | "horizontal" | "diagonal", center: Point): Point {
  if (axis === "vertical") {
    return { x: 2 * center.x - p.x, y: p.y };
  } else if (axis === "horizontal") {
    return { x: p.x, y: 2 * center.y - p.y };
  } else {
    // diagonal y = x relative to center
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    return { x: center.x + dy, y: center.y + dx };
  }
}

function reflectPoint(p: Point, center: Point): Point {
  return { x: 2 * center.x - p.x, y: 2 * center.y - p.y };
}

function SymmetryVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<SymmetryMode>("line");
  const [axis, setAxis] = useState<"vertical" | "horizontal" | "diagonal">("vertical");
  const [vertices, setVertices] = useState<Point[]>([
    { x: 0.25, y: 0.25 },
    { x: 0.38, y: 0.2 },
    { x: 0.42, y: 0.35 },
    { x: 0.35, y: 0.5 },
    { x: 0.2, y: 0.45 },
  ]);
  const draggingRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

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
      for (let i = 0; i < vertices.length; i++) {
        const cx = vertices[i].x * w;
        const cy = vertices[i].y * h;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist < 24) {
          draggingRef.current = i;
          e.preventDefault();
          return;
        }
      }
    },
    [getCanvasCoords, vertices],
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (draggingRef.current === null) return;
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      const { w, h } = sizeRef.current;
      const clampedX = Math.max(10, Math.min(w - 10, x));
      const clampedY = Math.max(10, Math.min(h - 10, y));
      setVertices((prev) => {
        const next = [...prev];
        next[draggingRef.current!] = { x: clampedX / w, y: clampedY / h };
        return next;
      });
    },
    [getCanvasCoords],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
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

    const center: Point = { x: 0.5, y: 0.5 };
    const centerPx: Point = { x: center.x * w, y: center.y * h };

    // Draw axis / center point
    if (mode === "line") {
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = COLORS.axis;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (axis === "vertical") {
        ctx.moveTo(centerPx.x, 0);
        ctx.lineTo(centerPx.x, h);
      } else if (axis === "horizontal") {
        ctx.moveTo(0, centerPx.y);
        ctx.lineTo(w, centerPx.y);
      } else {
        // diagonal: y = x line through center
        const ext = Math.max(w, h);
        ctx.moveTo(centerPx.x - ext, centerPx.y - ext);
        ctx.lineTo(centerPx.x + ext, centerPx.y + ext);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Axis label
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = COLORS.axis;
      ctx.textAlign = "left";
      if (axis === "vertical") {
        ctx.fillText("対称軸", centerPx.x + 6, 20);
      } else if (axis === "horizontal") {
        ctx.fillText("対称軸", 8, centerPx.y - 8);
      } else {
        ctx.fillText("対称軸", centerPx.x + 20, centerPx.y - 20);
      }
    } else {
      // Point symmetry: draw center
      ctx.beginPath();
      ctx.arc(centerPx.x, centerPx.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.axis;
      ctx.fill();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = COLORS.axis;
      ctx.textAlign = "left";
      ctx.fillText("対称の中心 O", centerPx.x + 14, centerPx.y - 4);
    }

    const pts = vertices.map((v) => ({ x: v.x * w, y: v.y * h }));

    // Compute reflected points
    const reflected =
      mode === "line"
        ? vertices.map((v) => {
            const r = reflectLine(v, axis, center);
            return { x: r.x * w, y: r.y * h };
          })
        : vertices.map((v) => {
            const r = reflectPoint(v, center);
            return { x: r.x * w, y: r.y * h };
          });

    // Draw dashed lines connecting corresponding points
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = COLORS.dashed;
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(reflected[i].x, reflected[i].y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw original polygon
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(66, 165, 245, 0.1)";
    ctx.fill();
    ctx.strokeStyle = COLORS.original;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw reflected polygon
    ctx.beginPath();
    ctx.moveTo(reflected[0].x, reflected[0].y);
    for (let i = 1; i < reflected.length; i++) {
      ctx.lineTo(reflected[i].x, reflected[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(105, 240, 174, 0.1)";
    ctx.fill();
    ctx.strokeStyle = COLORS.reflected;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw vertices with labels
    const labels = ["A", "B", "C", "D", "E"];
    for (let i = 0; i < pts.length; i++) {
      // Original vertex
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, 7, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.original;
      ctx.fill();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = COLORS.original;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(labels[i], pts[i].x, pts[i].y - 10);

      // Reflected vertex
      ctx.beginPath();
      ctx.arc(reflected[i].x, reflected[i].y, 7, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.reflected;
      ctx.fill();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = COLORS.reflected;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${labels[i]}'`, reflected[i].x, reflected[i].y - 10);
    }
  }, [vertices, mode, axis]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const axisLabels: Record<string, string> = {
    vertical: "縦軸",
    horizontal: "横軸",
    diagonal: "斜め",
  };

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>対称（線対称・点対称）</h2>
        <p className="algo-subtitle">Line & Point Symmetry</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          className={mode === "line" ? "btn-step" : "btn-reset"}
          onClick={() => setMode("line")}
          style={{ fontSize: "13px", padding: "6px 12px" }}
        >
          線対称
        </button>
        <button
          className={mode === "point" ? "btn-step" : "btn-reset"}
          onClick={() => setMode("point")}
          style={{ fontSize: "13px", padding: "6px 12px" }}
        >
          点対称
        </button>
      </div>

      <div className="formula">
        {mode === "line"
          ? `線対称：対称軸（${axisLabels[axis]}）で折り返すと重なる`
          : "点対称：中心Oを基準に180°回転すると重なる"}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {mode === "line" && (
        <div className="controls-bar">
          {(["vertical", "horizontal", "diagonal"] as const).map((a) => (
            <button
              key={a}
              className={axis === a ? "btn-step" : "btn-reset"}
              onClick={() => setAxis(a)}
              style={{ fontSize: "13px", padding: "6px 12px" }}
            >
              {axisLabels[a]}
            </button>
          ))}
        </div>
      )}

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{vertices.length}</span>
            <span className="stat-label">頂点数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{mode === "line" ? "線対称" : "点対称"}</span>
            <span className="stat-label">モード</span>
          </div>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          頂点をドラッグして図形を変形し、対称な図形がどう変わるか観察しよう
        </p>
      </div>
    </div>
  );
}

export default SymmetryVisualizer;
