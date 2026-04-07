import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type TheoremMode = "inscribed-angle" | "thales" | "inscribed-quad";

const MODES: { id: TheoremMode; name: string }[] = [
  { id: "inscribed-angle", name: "円周角の定理" },
  { id: "thales", name: "タレスの定理" },
  { id: "inscribed-quad", name: "円に内接する四角形" },
];

function angleDeg(rad: number) {
  return ((rad * 180) / Math.PI).toFixed(1);
}


// Normalize angle to [0, 2π)
function normAngle(a: number) {
  return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

// Compute inscribed angle at point P for arc BC (angle BPC)
function inscribedAngle(
  px: number,
  py: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
) {
  const abx = bx - px;
  const aby = by - py;
  const acx = cx - px;
  const acy = cy - py;
  const dot = abx * acx + aby * acy;
  const cross = abx * acy - aby * acx;
  return Math.abs(Math.atan2(cross, dot));
}

function CircleTheoremVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<TheoremMode>("inscribed-angle");

  // Point angles on circle (in radians)
  const [pointA, setPointA] = useState(Math.PI * 0.2);
  const [pointB, setPointB] = useState(Math.PI * 1.0);
  const [pointC, setPointC] = useState(Math.PI * 1.6);
  const [pointD, setPointD] = useState(Math.PI * 0.5); // extra point for inscribed-angle & quad

  const draggingRef = useRef<string | null>(null);
  const centerRef = useRef({ x: 0, y: 0, r: 0 });

  const getCanvasCoords = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCanvasCoords(e);
      const { x: cx, y: cy, r } = centerRef.current;

      const points: { key: string; angle: number }[] = [
        { key: "A", angle: pointA },
        { key: "B", angle: pointB },
        { key: "C", angle: pointC },
      ];
      if (mode === "inscribed-quad") {
        points.push({ key: "D", angle: pointD });
      }

      for (const p of points) {
        const px = cx + r * Math.cos(p.angle);
        const py = cy + r * Math.sin(p.angle);
        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (dist < 24) {
          draggingRef.current = p.key;
          e.preventDefault();
          return;
        }
      }
    },
    [getCanvasCoords, pointA, pointB, pointC, pointD, mode],
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      const { x: cx, y: cy } = centerRef.current;
      const angle = Math.atan2(y - cy, x - cx);

      const setters: Record<string, (a: number) => void> = {
        A: setPointA,
        B: setPointB,
        C: setPointC,
        D: setPointD,
      };
      setters[draggingRef.current]?.(angle);
    },
    [getCanvasCoords],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  // Attach pointer events
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

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.44;
    centerRef.current = { x: cx, y: cy, r: radius };

    // Draw circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("O", cx + 6, cy - 6);

    // Helper: point on circle
    const pt = (angle: number) => ({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });

    // Helper: draw labeled point
    const drawPoint = (
      angle: number,
      label: string,
      color: string,
    ) => {
      const p = pt(angle);
      // Label offset away from center
      const lx = cx + (radius + 20) * Math.cos(angle);
      const ly = cy + (radius + 20) * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, lx, ly);

      return p;
    };

    // Helper: draw angle arc
    const drawAngleArc = (
      vx: number,
      vy: number,
      fromAngle: number,
      toAngle: number,
      color: string,
      labelText: string,
    ) => {
      const arcR = 24;
      let start = normAngle(fromAngle);
      let end = normAngle(toAngle);
      // Always draw the smaller arc
      let sweep = normAngle(end - start);
      if (sweep > Math.PI) {
        const tmp = start;
        start = end;
        end = tmp;
        sweep = 2 * Math.PI - sweep;
      }

      ctx.beginPath();
      ctx.arc(vx, vy, arcR, start, start + sweep);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      const midAngle = start + sweep / 2;
      const labelR = arcR + 14;
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        labelText,
        vx + labelR * Math.cos(midAngle),
        vy + labelR * Math.sin(midAngle),
      );
    };

    if (mode === "inscribed-angle") {
      // Points: A, B on arc; P observing AB
      const pA = drawPoint(pointA, "A", "#42a5f5");
      const pB = drawPoint(pointB, "B", "#42a5f5");
      const pP = drawPoint(pointC, "P", "#ff9800");

      // Draw triangle APB
      ctx.beginPath();
      ctx.moveTo(pP.x, pP.y);
      ctx.lineTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.closePath();
      ctx.strokeStyle = "rgba(255, 152, 0, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 152, 0, 0.08)";
      ctx.fill();

      // Central angle lines
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(cx, cy);
      ctx.lineTo(pB.x, pB.y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inscribed angle at P
      const angleP = inscribedAngle(pP.x, pP.y, pA.x, pA.y, pB.x, pB.y);

      // Draw inscribed angle arc
      const anglePA = Math.atan2(pA.y - pP.y, pA.x - pP.x);
      const anglePB = Math.atan2(pB.y - pP.y, pB.x - pP.x);
      drawAngleArc(pP.x, pP.y, anglePA, anglePB, "#ff9800", `${angleDeg(angleP)}°`);

      // Central angle arc - display as exactly 2x inscribed angle
      const oA = Math.atan2(pA.y - cy, pA.x - cx);
      const oB = Math.atan2(pB.y - cy, pB.x - cx);
      const centralLabel = `${angleDeg(angleP * 2)}°`;
      drawAngleArc(cx, cy, oA, oB, "rgba(255,255,255,0.5)", centralLabel);

    } else if (mode === "thales") {
      // Thales: diameter AB, point P on circle → angle APB = 90°
      // Force A and B to be diametrically opposite
      const diamAngle = pointA;
      const pA = drawPoint(diamAngle, "A", "#42a5f5");
      const pB = drawPoint(diamAngle + Math.PI, "B", "#42a5f5");
      const pP = drawPoint(pointC, "P", "#ff9800");

      // Draw diameter
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.strokeStyle = "rgba(66, 165, 245, 0.6)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw triangle
      ctx.beginPath();
      ctx.moveTo(pP.x, pP.y);
      ctx.lineTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.closePath();
      ctx.strokeStyle = "rgba(255, 152, 0, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 152, 0, 0.1)";
      ctx.fill();

      // Angle at P
      const angleP = inscribedAngle(pP.x, pP.y, pA.x, pA.y, pB.x, pB.y);

      // Right angle marker at P
      const paDir = Math.atan2(pA.y - pP.y, pA.x - pP.x);
      const pbDir = Math.atan2(pB.y - pP.y, pB.x - pP.x);
      const m = 14;
      const rax = pP.x + m * Math.cos(paDir);
      const ray = pP.y + m * Math.sin(paDir);
      const rbx = pP.x + m * Math.cos(pbDir);
      const rby = pP.y + m * Math.sin(pbDir);
      const rcx = rax + m * Math.cos(pbDir);
      const rcy = ray + m * Math.sin(pbDir);

      ctx.beginPath();
      ctx.moveTo(rax, ray);
      ctx.lineTo(rcx, rcy);
      ctx.lineTo(rbx, rby);
      ctx.strokeStyle = "#ff9800";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const labelAngle = (paDir + pbDir) / 2;
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#ff9800";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${angleDeg(angleP)}°`,
        pP.x + 36 * Math.cos(labelAngle),
        pP.y + 36 * Math.sin(labelAngle),
      );

      // Angles at A and B
      const angleA = inscribedAngle(pA.x, pA.y, pP.x, pP.y, pB.x, pB.y);
      const angleB = inscribedAngle(pB.x, pB.y, pP.x, pP.y, pA.x, pA.y);
      const apDir = Math.atan2(pP.y - pA.y, pP.x - pA.x);
      const abDir = Math.atan2(pB.y - pA.y, pB.x - pA.x);
      drawAngleArc(pA.x, pA.y, apDir, abDir, "#42a5f5", `${angleDeg(angleA)}°`);
      const bpDir = Math.atan2(pP.y - pB.y, pP.x - pB.x);
      const baDir = Math.atan2(pA.y - pB.y, pA.x - pB.x);
      drawAngleArc(pB.x, pB.y, bpDir, baDir, "#69f0ae", `${angleDeg(angleB)}°`);

    } else if (mode === "inscribed-quad") {
      // Inscribed quadrilateral: opposite angles sum to 180°
      const pA = drawPoint(pointA, "A", "#42a5f5");
      const pB = drawPoint(pointB, "B", "#ff9800");
      const pC = drawPoint(pointC, "C", "#69f0ae");
      const pD = drawPoint(pointD, "D", "#ab47bc");

      // Draw quadrilateral
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.lineTo(pC.x, pC.y);
      ctx.lineTo(pD.x, pD.y);
      ctx.closePath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fill();

      // Compute angles
      const angA = inscribedAngle(pA.x, pA.y, pD.x, pD.y, pB.x, pB.y);
      const angB = inscribedAngle(pB.x, pB.y, pA.x, pA.y, pC.x, pC.y);
      const angC = inscribedAngle(pC.x, pC.y, pB.x, pB.y, pD.x, pD.y);
      const angD = inscribedAngle(pD.x, pD.y, pC.x, pC.y, pA.x, pA.y);

      // Draw angle arcs
      const adDir = Math.atan2(pD.y - pA.y, pD.x - pA.x);
      const abDir = Math.atan2(pB.y - pA.y, pB.x - pA.x);
      drawAngleArc(pA.x, pA.y, adDir, abDir, "#42a5f5", `${angleDeg(angA)}°`);

      const baDir2 = Math.atan2(pA.y - pB.y, pA.x - pB.x);
      const bcDir = Math.atan2(pC.y - pB.y, pC.x - pB.x);
      drawAngleArc(pB.x, pB.y, baDir2, bcDir, "#ff9800", `${angleDeg(angB)}°`);

      const cbDir = Math.atan2(pB.y - pC.y, pB.x - pC.x);
      const cdDir = Math.atan2(pD.y - pC.y, pD.x - pC.x);
      drawAngleArc(pC.x, pC.y, cbDir, cdDir, "#69f0ae", `${angleDeg(angC)}°`);

      const dcDir = Math.atan2(pC.y - pD.y, pC.x - pD.x);
      const daDir = Math.atan2(pA.y - pD.y, pA.x - pD.x);
      drawAngleArc(pD.x, pD.y, dcDir, daDir, "#ab47bc", `${angleDeg(angD)}°`);
    }
  }, [mode, pointA, pointB, pointC, pointD]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>円の定理</h2>
        <p className="algo-subtitle">Circle Theorems</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={mode === m.id ? "btn-step" : "btn-reset"}
            onClick={() => setMode(m.id)}
            style={{ fontSize: "13px", padding: "6px 12px" }}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="formula">
        {mode === "inscribed-angle" && "∠APB = ½ × ∠AOB"}
        {mode === "thales" && "AB が直径のとき ∠APB = 90°"}
        {mode === "inscribed-quad" && "∠A + ∠C = ∠B + ∠D = 180°"}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="step-info">
        <p className="step-description">
          {mode === "inscribed-angle" && "点A, B, Pをドラッグして、円周角が中心角の半分になることを確認しよう"}
          {mode === "thales" && "点Pをドラッグして、直径に対する円周角が常に90°になることを確認しよう"}
          {mode === "inscribed-quad" && "4つの頂点をドラッグして、対角の和が常に180°になることを確認しよう"}
        </p>
      </div>
    </div>
  );
}

export default CircleTheoremVisualizer;
