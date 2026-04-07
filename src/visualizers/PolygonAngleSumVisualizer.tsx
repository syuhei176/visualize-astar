import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

interface Point {
  x: number;
  y: number;
}

function angleDeg(rad: number) {
  return ((rad * 180) / Math.PI).toFixed(1);
}

function normAngle(a: number) {
  return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

function interiorAngle(vertex: Point, p1: Point, p2: Point): number {
  const v1x = p1.x - vertex.x;
  const v1y = p1.y - vertex.y;
  const v2x = p2.x - vertex.x;
  const v2y = p2.y - vertex.y;
  const dot = v1x * v2x + v1y * v2y;
  const cross = v1x * v2y - v1y * v2x;
  return Math.abs(Math.atan2(cross, dot));
}

const COLORS = ["#42a5f5", "#69f0ae", "#ff9800", "#ab47bc", "#ef5350", "#ffd740", "#26c6da", "#ec407a"];

function generateRegularPolygon(n: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    pts.push({
      x: 0.5 + 0.32 * Math.cos(angle),
      y: 0.45 + 0.32 * Math.sin(angle),
    });
  }
  return pts;
}

function PolygonAngleSumVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [n, setN] = useState(4);
  const [vertices, setVertices] = useState<Point[]>(() => generateRegularPolygon(4));
  const draggingRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    setVertices(generateRegularPolygon(n));
  }, [n]);

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

    const pts = vertices.map((v) => ({ x: v.x * w, y: v.y * h }));
    const numVerts = pts.length;

    // 多角形を描画
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < numVerts; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 対角線（三角形分割）を描画
    if (numVerts > 3) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      for (let i = 2; i < numVerts - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 各頂点の角度を計算して描画
    const angles: number[] = [];
    for (let i = 0; i < numVerts; i++) {
      const prev = pts[(i - 1 + numVerts) % numVerts];
      const curr = pts[i];
      const next = pts[(i + 1) % numVerts];
      const angle = interiorAngle(curr, prev, next);
      angles.push(angle);
      const color = COLORS[i % COLORS.length];

      // 角度アーク
      const a1 = Math.atan2(prev.y - curr.y, prev.x - curr.x);
      const a2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      let start = normAngle(a1);
      let end = normAngle(a2);
      let sweep = normAngle(end - start);
      if (sweep > Math.PI) {
        const tmp = start;
        start = end;
        end = tmp;
        sweep = 2 * Math.PI - sweep;
      }

      const arcR = 22;
      ctx.beginPath();
      ctx.moveTo(curr.x, curr.y);
      ctx.arc(curr.x, curr.y, arcR, start, start + sweep);
      ctx.closePath();
      ctx.fillStyle = color.replace(")", ", 0.15)").replace("rgb", "rgba");
      ctx.fill();
      ctx.beginPath();
      ctx.arc(curr.x, curr.y, arcR, start, start + sweep);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 角度ラベル
      const midAngle = start + sweep / 2;
      const labelR = arcR + 14;
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${angleDeg(angle)}°`,
        curr.x + labelR * Math.cos(midAngle),
        curr.y + labelR * Math.sin(midAngle),
      );

      // 頂点ポイント
      ctx.beginPath();
      ctx.arc(curr.x, curr.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // 下部のバー表示
    const barY = h - 40;
    const barW = w * 0.7;
    const barX = (w - barW) / 2;
    const totalAngle = angles.reduce((s, a) => s + a, 0);
    let currentX = barX;

    for (let i = 0; i < numVerts; i++) {
      const segW = (angles[i] / totalAngle) * barW;
      const color = COLORS[i % COLORS.length];
      ctx.fillStyle = color.replace(")", ", 0.3)").replace("rgb", "rgba");
      ctx.fillRect(currentX, barY, segW, 14);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(currentX, barY, segW, 14);
      currentX += segW;
    }

    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`= ${(n - 2) * 180}°`, barX + barW / 2, barY + 18);
  }, [vertices, n]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const angles = vertices.map((_, i) => {
    const prev = vertices[(i - 1 + n) % n];
    const curr = vertices[i];
    const next = vertices[(i + 1) % n];
    return interiorAngle(curr, prev, next);
  });
  const sum = angles.reduce((s, a) => s + a, 0);

  const polygonNames: Record<number, string> = {
    3: "三角形",
    4: "四角形",
    5: "五角形",
    6: "六角形",
    7: "七角形",
    8: "八角形",
  };

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>多角形の内角の和</h2>
        <p className="algo-subtitle">Polygon Angle Sum</p>
      </div>

      <div className="formula">{polygonNames[n]}の内角の和 = (n−2) × 180° = {(n - 2) * 180}°</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{n}</span>
            <span className="stat-label">頂点数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{n - 2}</span>
            <span className="stat-label">三角形数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{angleDeg(sum)}°</span>
            <span className="stat-label">内角の和</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>n</label>
          <input
            type="range"
            min="3"
            max="8"
            step="1"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
          />
          <span className="value">{n}</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          頂点をドラッグして形を変えても、内角の和は変わらないことを確認しよう
        </p>
      </div>
    </div>
  );
}

export default PolygonAngleSumVisualizer;
