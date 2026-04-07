import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type SimilarityMode = "aa" | "sss-ratio" | "sas-ratio";

const MODES: { id: SimilarityMode; name: string; formula: string }[] = [
  { id: "aa", name: "AA（2角）", formula: "2組の角がそれぞれ等しい" },
  { id: "sss-ratio", name: "SSS（3辺比）", formula: "3辺の比がすべて等しい" },
  { id: "sas-ratio", name: "SAS（2辺比+夾角）", formula: "2辺の比とその間の角が等しい" },
];

function TriangleSimilarityVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<SimilarityMode>("aa");
  const [ratio, setRatio] = useState(1.8);

  // AA: 2つの角
  const [angleA, setAngleA] = useState(50);
  const [angleB, setAngleB] = useState(60);

  // SSS-ratio / SAS-ratio: 基本三角形の辺
  const [baseSideA, setBaseSideA] = useState(3);
  const [baseSideB, setBaseSideB] = useState(4);
  const [baseSideC, setBaseSideC] = useState(5);

  // SAS-ratio: 挟角
  const [sasAngle, setSasAngle] = useState(60);

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

    let pts1: { x: number; y: number }[];
    let pts2: { x: number; y: number }[];
    let sideLabels1: string[];
    let sideLabels2: string[];
    let angleLabels1: string[];
    let angleLabels2: string[];
    let highlightSides: boolean[];
    let highlightAngles: boolean[];

    if (mode === "aa") {
      const angA = (angleA * Math.PI) / 180;
      const angB = (angleB * Math.PI) / 180;
      const angC = Math.PI - angA - angB;
      if (angC <= 0) {
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#ef5350";
        ctx.textAlign = "center";
        ctx.fillText("角度の合計が180°を超えています", w / 2, h / 2);
        return;
      }
      const c1 = 4;
      const a1 = c1 * Math.sin(angA) / Math.sin(angC);
      const b1 = c1 * Math.sin(angB) / Math.sin(angC);
      pts1 = [
        { x: 0, y: 0 },
        { x: c1, y: 0 },
        { x: b1 * Math.cos(angA), y: b1 * Math.sin(angA) },
      ];
      const c2 = c1 * ratio;
      const b2 = b1 * ratio;
      pts2 = [
        { x: 0, y: 0 },
        { x: c2, y: 0 },
        { x: b2 * Math.cos(angA), y: b2 * Math.sin(angA) },
      ];
      sideLabels1 = ["", "", ""];
      sideLabels2 = ["", "", ""];
      angleLabels1 = [`${angleA}°`, `${angleB}°`, ""];
      angleLabels2 = [`${angleA}°`, `${angleB}°`, ""];
      highlightSides = [false, false, false];
      highlightAngles = [true, true, false];
      void a1;
    } else if (mode === "sss-ratio") {
      const a = baseSideA, b = baseSideB, c = baseSideC;
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
      pts2 = pts1.map((p) => ({ x: p.x * ratio, y: p.y * ratio }));
      sideLabels1 = [`${c}`, `${a}`, `${b}`];
      sideLabels2 = [`${(c * ratio).toFixed(1)}`, `${(a * ratio).toFixed(1)}`, `${(b * ratio).toFixed(1)}`];
      angleLabels1 = ["", "", ""];
      angleLabels2 = ["", "", ""];
      highlightSides = [true, true, true];
      highlightAngles = [false, false, false];
    } else {
      const a = baseSideA, b = baseSideB;
      const angC = (sasAngle * Math.PI) / 180;
      pts1 = [
        { x: 0, y: 0 },
        { x: a, y: 0 },
        { x: b * Math.cos(angC), y: b * Math.sin(angC) },
      ];
      pts2 = pts1.map((p) => ({ x: p.x * ratio, y: p.y * ratio }));
      sideLabels1 = [`${a}`, "", `${b}`];
      sideLabels2 = [`${(a * ratio).toFixed(1)}`, "", `${(b * ratio).toFixed(1)}`];
      angleLabels1 = [`${sasAngle}°`, "", ""];
      angleLabels2 = [`${sasAngle}°`, "", ""];
      highlightSides = [true, false, true];
      highlightAngles = [true, false, false];
    }

    const drawTriangle = (
      pts: { x: number; y: number }[],
      color: string,
      offsetX: number,
      offsetY: number,
      scale: number,
      sLabels: string[],
      aLabels: string[],
    ) => {
      const scaled = pts.map((p) => ({
        x: p.x * scale + offsetX,
        y: -p.y * scale + offsetY,
      }));

      ctx.beginPath();
      ctx.moveTo(scaled[0].x, scaled[0].y);
      ctx.lineTo(scaled[1].x, scaled[1].y);
      ctx.lineTo(scaled[2].x, scaled[2].y);
      ctx.closePath();
      ctx.fillStyle = color.replace("1)", "0.08)");
      ctx.fill();

      for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3;
        ctx.beginPath();
        ctx.moveTo(scaled[i].x, scaled[i].y);
        ctx.lineTo(scaled[j].x, scaled[j].y);
        ctx.strokeStyle = highlightSides[i] ? color : "rgba(255,255,255,0.3)";
        ctx.lineWidth = highlightSides[i] ? 3 : 1.5;
        ctx.stroke();

        if (sLabels[i]) {
          const mx = (scaled[i].x + scaled[j].x) / 2;
          const my = (scaled[i].y + scaled[j].y) / 2;
          const dx = scaled[j].y - scaled[i].y;
          const dy = -(scaled[j].x - scaled[i].x);
          const len = Math.sqrt(dx * dx + dy * dy);
          ctx.font = "bold 11px sans-serif";
          ctx.fillStyle = highlightSides[i] ? color : "rgba(255,255,255,0.5)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(sLabels[i], mx + (dx / len) * 14, my + (dy / len) * 14);
        }
      }

      for (let i = 0; i < 3; i++) {
        if (!highlightAngles[i] || !aLabels[i]) continue;
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
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, 18, start, start + sweep);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        const midA = start + sweep / 2;
        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(aLabels[i], curr.x + 32 * Math.cos(midA), curr.y + 32 * Math.sin(midA));
      }

      for (const p of scaled) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
      }
    };

    // バウンディングボックス計算
    const allPts = [...pts1, ...pts2];
    const maxDim = Math.max(
      Math.max(...allPts.map((p) => p.x)) - Math.min(...allPts.map((p) => p.x)),
      Math.max(...allPts.map((p) => p.y)) - Math.min(...allPts.map((p) => p.y)),
    );

    const scale1 = Math.min(w * 0.3, h * 0.5) / Math.max(...pts1.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y))), 1);
    const scale2 = Math.min(w * 0.3, h * 0.5) / Math.max(...pts2.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y))), 1);
    const scale = Math.min(scale1, scale2) * 0.8;

    void maxDim;

    const bb1 = {
      minX: Math.min(...pts1.map((p) => p.x)),
      maxX: Math.max(...pts1.map((p) => p.x)),
      minY: Math.min(...pts1.map((p) => p.y)),
      maxY: Math.max(...pts1.map((p) => p.y)),
    };
    const bb2 = {
      minX: Math.min(...pts2.map((p) => p.x)),
      maxX: Math.max(...pts2.map((p) => p.x)),
      minY: Math.min(...pts2.map((p) => p.y)),
      maxY: Math.max(...pts2.map((p) => p.y)),
    };

    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(66, 165, 245, 0.8)";
    ctx.fillText("△ABC", w * 0.25, 20);
    ctx.fillStyle = "rgba(105, 240, 174, 0.8)";
    ctx.fillText("△A'B'C'", w * 0.75, 20);

    const leftX = w * 0.25 - ((bb1.minX + bb1.maxX) / 2) * scale;
    const leftY = h * 0.5 + ((bb1.minY + bb1.maxY) / 2) * scale;
    drawTriangle(pts1, "rgba(66, 165, 245, 1)", leftX, leftY, scale, sideLabels1, angleLabels1);

    const rightX = w * 0.75 - ((bb2.minX + bb2.maxX) / 2) * scale;
    const rightY = h * 0.5 + ((bb2.minY + bb2.maxY) / 2) * scale;
    drawTriangle(pts2, "rgba(105, 240, 174, 1)", rightX, rightY, scale, sideLabels2, angleLabels2);

    // 相似記号
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("∼", w / 2, h * 0.5);
  }, [mode, ratio, angleA, angleB, baseSideA, baseSideB, baseSideC, sasAngle]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const currentMode = MODES.find((m) => m.id === mode)!;

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>三角形の相似条件</h2>
        <p className="algo-subtitle">Triangle Similarity</p>
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
        <div className="slider-group">
          <label>倍率</label>
          <input type="range" min="0.5" max="2.5" step="0.1" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} />
          <span className="value">×{ratio}</span>
        </div>
        {mode === "aa" && (
          <>
            <div className="slider-group">
              <label>∠A</label>
              <input type="range" min="10" max="80" step="5" value={angleA} onChange={(e) => setAngleA(Number(e.target.value))} />
              <span className="value">{angleA}°</span>
            </div>
            <div className="slider-group">
              <label>∠B</label>
              <input type="range" min="10" max="80" step="5" value={angleB} onChange={(e) => setAngleB(Number(e.target.value))} />
              <span className="value">{angleB}°</span>
            </div>
          </>
        )}
        {mode === "sss-ratio" && (
          <>
            <div className="slider-group">
              <label>a</label>
              <input type="range" min="1" max="6" step="0.5" value={baseSideA} onChange={(e) => setBaseSideA(Number(e.target.value))} />
              <span className="value">{baseSideA}</span>
            </div>
            <div className="slider-group">
              <label>b</label>
              <input type="range" min="1" max="6" step="0.5" value={baseSideB} onChange={(e) => setBaseSideB(Number(e.target.value))} />
              <span className="value">{baseSideB}</span>
            </div>
            <div className="slider-group">
              <label>c</label>
              <input type="range" min="1" max="6" step="0.5" value={baseSideC} onChange={(e) => setBaseSideC(Number(e.target.value))} />
              <span className="value">{baseSideC}</span>
            </div>
          </>
        )}
        {mode === "sas-ratio" && (
          <>
            <div className="slider-group">
              <label>a</label>
              <input type="range" min="1" max="6" step="0.5" value={baseSideA} onChange={(e) => setBaseSideA(Number(e.target.value))} />
              <span className="value">{baseSideA}</span>
            </div>
            <div className="slider-group">
              <label>b</label>
              <input type="range" min="1" max="6" step="0.5" value={baseSideB} onChange={(e) => setBaseSideB(Number(e.target.value))} />
              <span className="value">{baseSideB}</span>
            </div>
            <div className="slider-group">
              <label>∠</label>
              <input type="range" min="10" max="160" step="5" value={sasAngle} onChange={(e) => setSasAngle(Number(e.target.value))} />
              <span className="value">{sasAngle}°</span>
            </div>
          </>
        )}
      </div>

      <div className="step-info">
        <p className="step-description">
          倍率を変えて、相似条件を満たす三角形は常に相似になることを確認しよう
        </p>
      </div>
    </div>
  );
}

export default TriangleSimilarityVisualizer;
