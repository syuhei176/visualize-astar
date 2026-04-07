import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type CongruenceMode = "sss" | "sas" | "asa";

const MODES: { id: CongruenceMode; name: string; formula: string }[] = [
  { id: "sss", name: "SSS（3辺）", formula: "3辺がそれぞれ等しい" },
  { id: "sas", name: "SAS（2辺夾角）", formula: "2辺とその間の角が等しい" },
  { id: "asa", name: "ASA（2角夾辺）", formula: "2角とその間の辺が等しい" },
];

function TriangleCongruenceVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<CongruenceMode>("sss");

  // SSS: 3辺の長さ
  const [sideA, setSideA] = useState(4);
  const [sideB, setSideB] = useState(3);
  const [sideC, setSideC] = useState(5);

  // SAS: 2辺と挟角
  const [sasSideA, setSasSideA] = useState(4);
  const [sasSideB, setSasSideB] = useState(3);
  const [sasAngle, setSasAngle] = useState(60);

  // ASA: 2角と挟辺
  const [asaAngleA, setAsaAngleA] = useState(50);
  const [asaAngleB, setAsaAngleB] = useState(60);
  const [asaSide, setAsaSide] = useState(5);

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

    const drawTriangle = (
      pts: { x: number; y: number }[],
      color: string,
      offsetX: number,
      offsetY: number,
      scale: number,
      sideLabels: string[],
      angleLabels: string[],
      highlightSides: boolean[],
      highlightAngles: boolean[],
    ) => {
      const scaled = pts.map((p) => ({
        x: p.x * scale + offsetX,
        y: -p.y * scale + offsetY,
      }));

      // 三角形の塗りつぶし
      ctx.beginPath();
      ctx.moveTo(scaled[0].x, scaled[0].y);
      ctx.lineTo(scaled[1].x, scaled[1].y);
      ctx.lineTo(scaled[2].x, scaled[2].y);
      ctx.closePath();
      ctx.fillStyle = color.replace("1)", "0.08)");
      ctx.fill();

      // 辺を描画
      for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3;
        ctx.beginPath();
        ctx.moveTo(scaled[i].x, scaled[i].y);
        ctx.lineTo(scaled[j].x, scaled[j].y);
        ctx.strokeStyle = highlightSides[i] ? color : "rgba(255,255,255,0.3)";
        ctx.lineWidth = highlightSides[i] ? 3 : 1.5;
        ctx.stroke();

        // 辺ラベル
        if (sideLabels[i]) {
          const mx = (scaled[i].x + scaled[j].x) / 2;
          const my = (scaled[i].y + scaled[j].y) / 2;
          const dx = scaled[j].y - scaled[i].y;
          const dy = -(scaled[j].x - scaled[i].x);
          const len = Math.sqrt(dx * dx + dy * dy);
          const off = 14;
          ctx.font = "bold 12px sans-serif";
          ctx.fillStyle = highlightSides[i] ? color : "rgba(255,255,255,0.5)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(sideLabels[i], mx + (dx / len) * off, my + (dy / len) * off);
        }
      }

      // 角度アーク
      for (let i = 0; i < 3; i++) {
        if (!highlightAngles[i] || !angleLabels[i]) continue;
        const prev = scaled[(i + 2) % 3];
        const curr = scaled[i];
        const next = scaled[(i + 1) % 3];
        const a1 = Math.atan2(prev.y - curr.y, prev.x - curr.x);
        const a2 = Math.atan2(next.y - curr.y, next.x - curr.x);
        let start = ((a1 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        let end = ((a2 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        let sweep = ((end - start) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        if (sweep > Math.PI) {
          const tmp = start;
          start = end;
          end = tmp;
          sweep = 2 * Math.PI - sweep;
        }

        const arcR = 20;
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, arcR, start, start + sweep);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        const midA = start + sweep / 2;
        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          angleLabels[i],
          curr.x + (arcR + 14) * Math.cos(midA),
          curr.y + (arcR + 14) * Math.sin(midA),
        );
      }

      // 頂点ポイント
      for (const p of scaled) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
      }
    };

    // 三角形の頂点を計算
    let pts1: { x: number; y: number }[];
    let sideLabels: string[];
    let angleLabels: string[];
    let highlightSides: boolean[];
    let highlightAngles: boolean[];

    if (mode === "sss") {
      // SSS: 辺a(BC), b(CA), c(AB)
      // A at origin, B at (c, 0)
      const a = sideA, b = sideB, c = sideC;
      // 三角不等式チェック
      if (a + b <= c || a + c <= b || b + c <= a) {
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#ef5350";
        ctx.textAlign = "center";
        ctx.fillText("三角不等式を満たしません", w / 2, h / 2);
        return;
      }
      const cosA = (b * b + c * c - a * a) / (2 * b * c);
      const sinA = Math.sqrt(1 - cosA * cosA);
      pts1 = [
        { x: 0, y: 0 },
        { x: c, y: 0 },
        { x: b * cosA, y: b * sinA },
      ];
      sideLabels = [`c=${c}`, `a=${a}`, `b=${b}`];
      angleLabels = ["", "", ""];
      highlightSides = [true, true, true];
      highlightAngles = [false, false, false];
    } else if (mode === "sas") {
      const a = sasSideA, b = sasSideB, angleC = (sasAngle * Math.PI) / 180;
      pts1 = [
        { x: 0, y: 0 },
        { x: a, y: 0 },
        { x: b * Math.cos(angleC), y: b * Math.sin(angleC) },
      ];
      sideLabels = [`a=${a}`, "", `b=${b}`];
      angleLabels = [`${sasAngle}°`, "", ""];
      highlightSides = [true, false, true];
      highlightAngles = [true, false, false];
    } else {
      const angA = (asaAngleA * Math.PI) / 180;
      const angB = (asaAngleB * Math.PI) / 180;
      const angC = Math.PI - angA - angB;
      if (angC <= 0) {
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#ef5350";
        ctx.textAlign = "center";
        ctx.fillText("角度の合計が180°を超えています", w / 2, h / 2);
        return;
      }
      const c = asaSide;
      const a = c * Math.sin(angA) / Math.sin(angC);
      const b = c * Math.sin(angB) / Math.sin(angC);
      pts1 = [
        { x: 0, y: 0 },
        { x: c, y: 0 },
        { x: b * Math.cos(angA), y: b * Math.sin(angA) },
      ];
      sideLabels = [`c=${c}`, "", ""];
      angleLabels = [`${asaAngleA}°`, `${asaAngleB}°`, ""];
      highlightSides = [true, false, false];
      highlightAngles = [true, true, false];
      void a;
    }

    // 三角形のバウンディングボックスを計算
    const minX = Math.min(...pts1.map((p) => p.x));
    const maxX = Math.max(...pts1.map((p) => p.x));
    const minY = Math.min(...pts1.map((p) => p.y));
    const maxY = Math.max(...pts1.map((p) => p.y));
    const triW = maxX - minX;
    const triH = maxY - minY;

    const halfW = w / 2 - 20;
    const availH = h - 40;
    const scale = Math.min(halfW * 0.7 / triW, availH * 0.6 / triH);

    // 左の三角形
    const leftCenterX = w * 0.25;
    const centerY = h * 0.5;
    const leftOffX = leftCenterX - ((minX + maxX) / 2) * scale;
    const leftOffY = centerY + ((minY + maxY) / 2) * scale;

    // ラベル
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(66, 165, 245, 0.8)";
    ctx.fillText("△ABC", w * 0.25, 20);
    ctx.fillStyle = "rgba(105, 240, 174, 0.8)";
    ctx.fillText("△A'B'C'", w * 0.75, 20);

    drawTriangle(pts1, "rgba(66, 165, 245, 1)", leftOffX, leftOffY, scale, sideLabels, angleLabels, highlightSides, highlightAngles);

    // 右の三角形（同じ三角形を少し回転）
    const rotation = 0.3;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const pts2 = pts1.map((p) => ({
      x: p.x * cos - p.y * sin,
      y: p.x * sin + p.y * cos,
    }));
    const minX2 = Math.min(...pts2.map((p) => p.x));
    const maxX2 = Math.max(...pts2.map((p) => p.x));
    const minY2 = Math.min(...pts2.map((p) => p.y));
    const maxY2 = Math.max(...pts2.map((p) => p.y));

    const rightCenterX = w * 0.75;
    const rightOffX = rightCenterX - ((minX2 + maxX2) / 2) * scale;
    const rightOffY = centerY + ((minY2 + maxY2) / 2) * scale;

    drawTriangle(pts2, "rgba(105, 240, 174, 1)", rightOffX, rightOffY, scale, sideLabels, angleLabels, highlightSides, highlightAngles);

    // 等号マーク
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("≅", w / 2, centerY);
  }, [mode, sideA, sideB, sideC, sasSideA, sasSideB, sasAngle, asaAngleA, asaAngleB, asaSide]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const currentMode = MODES.find((m) => m.id === mode)!;

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>三角形の合同条件</h2>
        <p className="algo-subtitle">Triangle Congruence</p>
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

      <div className="formula">{currentMode.formula}</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        {mode === "sss" && (
          <>
            <div className="slider-group">
              <label>a</label>
              <input type="range" min="1" max="8" step="0.5" value={sideA} onChange={(e) => setSideA(Number(e.target.value))} />
              <span className="value">{sideA}</span>
            </div>
            <div className="slider-group">
              <label>b</label>
              <input type="range" min="1" max="8" step="0.5" value={sideB} onChange={(e) => setSideB(Number(e.target.value))} />
              <span className="value">{sideB}</span>
            </div>
            <div className="slider-group">
              <label>c</label>
              <input type="range" min="1" max="8" step="0.5" value={sideC} onChange={(e) => setSideC(Number(e.target.value))} />
              <span className="value">{sideC}</span>
            </div>
          </>
        )}
        {mode === "sas" && (
          <>
            <div className="slider-group">
              <label>a</label>
              <input type="range" min="1" max="8" step="0.5" value={sasSideA} onChange={(e) => setSasSideA(Number(e.target.value))} />
              <span className="value">{sasSideA}</span>
            </div>
            <div className="slider-group">
              <label>b</label>
              <input type="range" min="1" max="8" step="0.5" value={sasSideB} onChange={(e) => setSasSideB(Number(e.target.value))} />
              <span className="value">{sasSideB}</span>
            </div>
            <div className="slider-group">
              <label>∠</label>
              <input type="range" min="10" max="160" step="5" value={sasAngle} onChange={(e) => setSasAngle(Number(e.target.value))} />
              <span className="value">{sasAngle}°</span>
            </div>
          </>
        )}
        {mode === "asa" && (
          <>
            <div className="slider-group">
              <label>∠A</label>
              <input type="range" min="10" max="80" step="5" value={asaAngleA} onChange={(e) => setAsaAngleA(Number(e.target.value))} />
              <span className="value">{asaAngleA}°</span>
            </div>
            <div className="slider-group">
              <label>∠B</label>
              <input type="range" min="10" max="80" step="5" value={asaAngleB} onChange={(e) => setAsaAngleB(Number(e.target.value))} />
              <span className="value">{asaAngleB}°</span>
            </div>
            <div className="slider-group">
              <label>c</label>
              <input type="range" min="1" max="8" step="0.5" value={asaSide} onChange={(e) => setAsaSide(Number(e.target.value))} />
              <span className="value">{asaSide}</span>
            </div>
          </>
        )}
      </div>

      <div className="step-info">
        <p className="step-description">
          スライダーで条件を変えて、同じ条件の三角形が合同になることを確認しよう
        </p>
      </div>
    </div>
  );
}

export default TriangleCongruenceVisualizer;
