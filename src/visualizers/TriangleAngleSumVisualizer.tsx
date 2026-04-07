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

function triangleAngle(vertex: Point, p1: Point, p2: Point): number {
  const v1x = p1.x - vertex.x;
  const v1y = p1.y - vertex.y;
  const v2x = p2.x - vertex.x;
  const v2y = p2.y - vertex.y;
  const dot = v1x * v2x + v1y * v2y;
  const cross = v1x * v2y - v1y * v2x;
  return Math.abs(Math.atan2(cross, dot));
}

function TriangleAngleSumVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 頂点の位置（0〜1の正規化座標）
  const [vertices, setVertices] = useState<[Point, Point, Point]>([
    { x: 0.5, y: 0.15 },
    { x: 0.15, y: 0.8 },
    { x: 0.85, y: 0.75 },
  ]);
  const draggingRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const toCanvas = useCallback((p: Point) => {
    const { w, h } = sizeRef.current;
    return { x: p.x * w, y: p.y * h };
  }, []);

  const fromCanvas = useCallback((x: number, y: number): Point => {
    const { w, h } = sizeRef.current;
    return { x: x / w, y: y / h };
  }, []);

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
      for (let i = 0; i < 3; i++) {
        const cp = toCanvas(vertices[i]);
        const dist = Math.sqrt((x - cp.x) ** 2 + (y - cp.y) ** 2);
        if (dist < 24) {
          draggingRef.current = i;
          e.preventDefault();
          return;
        }
      }
    },
    [getCanvasCoords, toCanvas, vertices],
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (draggingRef.current === null) return;
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      const { w, h } = sizeRef.current;
      const clampedX = Math.max(10, Math.min(w - 10, x));
      const clampedY = Math.max(10, Math.min(h - 10, y));
      const np = fromCanvas(clampedX, clampedY);
      setVertices((prev) => {
        const next = [...prev] as [Point, Point, Point];
        next[draggingRef.current!] = np;
        return next;
      });
    },
    [getCanvasCoords, fromCanvas],
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

    const [A, B, C] = vertices.map((v) => ({ x: v.x * w, y: v.y * h }));
    const colors = ["#42a5f5", "#69f0ae", "#ff9800"];
    const labels = ["A", "B", "C"];

    // 三角形を描画
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 各頂点の角度を計算
    const pts = [A, B, C];
    const angles = [
      triangleAngle(A, B, C),
      triangleAngle(B, C, A),
      triangleAngle(C, A, B),
    ];

    // 角度アークと頂点を描画
    for (let i = 0; i < 3; i++) {
      const vertex = pts[i];
      const p1 = pts[(i + 1) % 3];
      const p2 = pts[(i + 2) % 3];
      const color = colors[i];

      // 角度アーク
      const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
      const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
      let start = normAngle(angle1);
      let end = normAngle(angle2);
      let sweep = normAngle(end - start);
      if (sweep > Math.PI) {
        const tmp = start;
        start = end;
        end = tmp;
        sweep = 2 * Math.PI - sweep;
      }

      const arcR = 28;
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, arcR, start, start + sweep);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 角度の塗りつぶし
      ctx.beginPath();
      ctx.moveTo(vertex.x, vertex.y);
      ctx.arc(vertex.x, vertex.y, arcR, start, start + sweep);
      ctx.closePath();
      ctx.fillStyle = color.replace(")", ", 0.15)").replace("rgb", "rgba");
      ctx.fill();

      // 角度ラベル
      const midAngle = start + sweep / 2;
      const labelR = arcR + 16;
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${angleDeg(angles[i])}°`,
        vertex.x + labelR * Math.cos(midAngle),
        vertex.y + labelR * Math.sin(midAngle),
      );

      // 頂点ポイント
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // 頂点ラベル
      const cx = (A.x + B.x + C.x) / 3;
      const cy = (A.y + B.y + C.y) / 3;
      const awayX = vertex.x + (vertex.x - cx) * 0.15;
      const awayY = vertex.y + (vertex.y - cy) * 0.15;
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labels[i], awayX + (awayX - cx) * 0.08, awayY + (awayY - cy) * 0.08);
    }

    // 下部に「内角の和を並べて180°を示す」図を描画
    const barY = h - 40;
    const barW = w * 0.7;
    const barX = (w - barW) / 2;
    let currentX = barX;

    for (let i = 0; i < 3; i++) {
      const segW = (angles[i] / Math.PI) * barW;
      ctx.fillStyle = colors[i].replace(")", ", 0.3)").replace("rgb", "rgba");
      ctx.fillRect(currentX, barY, segW, 16);
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 1;
      ctx.strokeRect(currentX, barY, segW, 16);

      if (segW > 30) {
        ctx.font = "bold 10px sans-serif";
        ctx.fillStyle = colors[i];
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${angleDeg(angles[i])}°`, currentX + segW / 2, barY + 8);
      }
      currentX += segW;
    }

    // 180° ラベル
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("= 180°", barX + barW / 2, barY + 20);
  }, [vertices, toCanvas]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const angles = (() => {
    const [A, B, C] = vertices;
    return [
      triangleAngle(A, B, C),
      triangleAngle(B, C, A),
      triangleAngle(C, A, B),
    ];
  })();
  const sum = angles.reduce((s, a) => s + a, 0);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>三角形の内角の和</h2>
        <p className="algo-subtitle">Triangle Angle Sum</p>
      </div>

      <div className="formula">∠A + ∠B + ∠C = 180°</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>{angleDeg(angles[0])}°</span>
            <span className="stat-label">∠A</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">+</span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>{angleDeg(angles[1])}°</span>
            <span className="stat-label">∠B</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">+</span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ff9800" }}>{angleDeg(angles[2])}°</span>
            <span className="stat-label">∠C</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">=</span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{angleDeg(sum)}°</span>
            <span className="stat-label">合計</span>
          </div>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          頂点A, B, Cをドラッグして、内角の和が常に180°になることを確認しよう
        </p>
      </div>
    </div>
  );
}

export default TriangleAngleSumVisualizer;
