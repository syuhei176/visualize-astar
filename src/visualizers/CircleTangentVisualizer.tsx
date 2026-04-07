import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function CircleTangentVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pointAngle, setPointAngle] = useState(0.6);
  const [externalDist, setExternalDist] = useState(2.2);
  const draggingRef = useRef<string | null>(null);
  const centerRef = useRef({ x: 0, y: 0, r: 0 });

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
      const { x: cx, y: cy, r } = centerRef.current;

      // 外部点のチェック
      const px = cx + r * externalDist * Math.cos(pointAngle);
      const py = cy + r * externalDist * Math.sin(pointAngle);
      if (Math.sqrt((x - px) ** 2 + (y - py) ** 2) < 24) {
        draggingRef.current = "P";
        e.preventDefault();
      }
    },
    [getCanvasCoords, pointAngle, externalDist],
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      const { x: cx, y: cy, r } = centerRef.current;
      const angle = Math.atan2(y - cy, x - cx);
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / r;
      setPointAngle(angle);
      setExternalDist(Math.max(1.2, Math.min(3.5, dist)));
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
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.4;
    const cy = h * 0.5;
    const r = Math.min(w, h) * 0.28;
    centerRef.current = { x: cx, y: cy, r };

    // 円を描画
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 中心点
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fill();
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "left";
    ctx.fillText("O", cx + 6, cy - 6);

    // 外部点P
    const px = cx + r * externalDist * Math.cos(pointAngle);
    const py = cy + r * externalDist * Math.sin(pointAngle);

    // 接線の接点を計算
    // OP = d, OT = r, PT = sqrt(d^2 - r^2)
    const d = r * externalDist;
    const tangentLen = Math.sqrt(d * d - r * r);
    const halfAngle = Math.acos(r / d);

    // 2つの接点
    const t1Angle = pointAngle + Math.PI + halfAngle;
    const t2Angle = pointAngle + Math.PI - halfAngle;
    const t1x = cx + r * Math.cos(t1Angle);
    const t1y = cy + r * Math.sin(t1Angle);
    const t2x = cx + r * Math.cos(t2Angle);
    const t2y = cy + r * Math.sin(t2Angle);

    // 半径 OT1, OT2 を描画
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(t1x, t1y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(t2x, t2y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 接線 PT1, PT2 を描画
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(t1x, t1y);
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(t2x, t2y);
    ctx.strokeStyle = "#69f0ae";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 直角マーク at T1
    const drawRightAngle = (tx: number, ty: number, color: string) => {
      const toO = { x: cx - tx, y: cy - ty };
      const toP = { x: px - tx, y: py - ty };
      const lenO = Math.sqrt(toO.x ** 2 + toO.y ** 2);
      const lenP = Math.sqrt(toP.x ** 2 + toP.y ** 2);
      const m = 12;
      const ux = (toO.x / lenO) * m;
      const uy = (toO.y / lenO) * m;
      const vx = (toP.x / lenP) * m;
      const vy = (toP.y / lenP) * m;

      ctx.beginPath();
      ctx.moveTo(tx + ux, ty + uy);
      ctx.lineTo(tx + ux + vx, ty + uy + vy);
      ctx.lineTo(tx + vx, ty + vy);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    drawRightAngle(t1x, t1y, "#42a5f5");
    drawRightAngle(t2x, t2y, "#69f0ae");

    // 接線の長さラベル
    const mid1x = (px + t1x) / 2;
    const mid1y = (py + t1y) / 2;
    const mid2x = (px + t2x) / 2;
    const mid2y = (py + t2y) / 2;

    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#42a5f5";
    ctx.fillText(tangentLen.toFixed(1), mid1x - 12, mid1y - 10);
    ctx.fillStyle = "#69f0ae";
    ctx.fillText(tangentLen.toFixed(1), mid2x + 12, mid2y + 10);

    // 点の描画
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#ff9800";
    ctx.fill();
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#ff9800";
    ctx.fillText("P", px + 12, py - 8);

    ctx.beginPath();
    ctx.arc(t1x, t1y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#42a5f5";
    ctx.fill();
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#42a5f5";
    const t1lx = cx + (r + 18) * Math.cos(t1Angle);
    const t1ly = cy + (r + 18) * Math.sin(t1Angle);
    ctx.fillText("T₁", t1lx, t1ly);

    ctx.beginPath();
    ctx.arc(t2x, t2y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#69f0ae";
    ctx.fill();
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#69f0ae";
    const t2lx = cx + (r + 18) * Math.cos(t2Angle);
    const t2ly = cy + (r + 18) * Math.sin(t2Angle);
    ctx.fillText("T₂", t2lx, t2ly);
  }, [pointAngle, externalDist]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const d = externalDist;
  const tangentLen = Math.sqrt(d * d - 1);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>円と接線の性質</h2>
        <p className="algo-subtitle">Circle &amp; Tangent Lines</p>
      </div>

      <div className="formula">PT₁ = PT₂, OT ⊥ 接線</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>{tangentLen.toFixed(2)}</span>
            <span className="stat-label">PT₁</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">=</span>
            <span className="stat-label">&nbsp;</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>{tangentLen.toFixed(2)}</span>
            <span className="stat-label">PT₂</span>
          </div>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          点Pをドラッグして、2本の接線の長さが常に等しく、接点で直角になることを確認しよう
        </p>
      </div>
    </div>
  );
}

export default CircleTangentVisualizer;
