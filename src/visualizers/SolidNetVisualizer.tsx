import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type SolidType = "cylinder" | "cone" | "prism";

const SOLIDS: { id: SolidType; name: string }[] = [
  { id: "cylinder", name: "円柱" },
  { id: "cone", name: "円錐" },
  { id: "prism", name: "三角柱" },
];

function SolidNetVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [solidType, setSolidType] = useState<SolidType>("cylinder");
  const [unfold, setUnfold] = useState(0); // 0 = folded, 1 = unfolded

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
    const t = unfold; // 0 to 1

    if (solidType === "cylinder") {
      const r = 40;
      const bodyH = 100;

      // 展開時: 2つの円 + 長方形(2πr × h)
      const rectW = 2 * Math.PI * r;
      const scale = Math.min(1, (w - 40) / (rectW + 20));

      // 側面（長方形/曲面）
      const sideW = rectW * scale * t + (1 - t) * 2 * r;
      const sideH = bodyH;
      const sideX = cx - sideW / 2;
      const sideY = cy - sideH / 2;

      ctx.fillStyle = "rgba(66, 165, 245, 0.15)";
      ctx.strokeStyle = "#42a5f5";
      ctx.lineWidth = 2;
      ctx.fillRect(sideX, sideY, sideW, sideH);
      ctx.strokeRect(sideX, sideY, sideW, sideH);

      // 上の円
      const topCy = sideY - r * t - (1 - t) * 5;
      ctx.beginPath();
      if (t > 0.5) {
        ctx.ellipse(cx, topCy, r, r, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(cx, topCy, r, r * (1 - t * 0.7), 0, 0, Math.PI * 2);
      }
      ctx.fillStyle = "rgba(105, 240, 174, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#69f0ae";
      ctx.stroke();

      // 下の円
      const botCy = sideY + sideH + r * t + (1 - t) * 5;
      ctx.beginPath();
      if (t > 0.5) {
        ctx.ellipse(cx, botCy, r, r, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(cx, botCy, r, r * (1 - t * 0.7), 0, 0, Math.PI * 2);
      }
      ctx.fillStyle = "rgba(105, 240, 174, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#69f0ae";
      ctx.stroke();

      // ラベル
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#42a5f5";
      ctx.textAlign = "center";
      ctx.fillText("側面", cx, cy);
      ctx.fillStyle = "#69f0ae";
      ctx.fillText("底面", cx, topCy);
      ctx.fillText("底面", cx, botCy);

    } else if (solidType === "cone") {
      const r = 40;
      const slantH = 120;

      // 展開: 底面の円 + おうぎ形（半径=母線長、弧=底面の円周）
      // おうぎ形の中心角 = 2π × r / slantH

      // 底面の円
      const baseY = cy + 60 * t + (1 - t) * 40;
      ctx.beginPath();
      if (t > 0.5) {
        ctx.ellipse(cx, baseY, r, r, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(cx, baseY, r, r * (1 - t * 0.7), 0, 0, Math.PI * 2);
      }
      ctx.fillStyle = "rgba(105, 240, 174, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#69f0ae";
      ctx.lineWidth = 2;
      ctx.stroke();

      // おうぎ形（側面）
      const sectorAngle = (2 * Math.PI * r) / slantH;
      const foldedAngle = Math.PI * 0.3; // 折りたたんだ時の見た目
      const angle = foldedAngle + (sectorAngle - foldedAngle) * t;
      const sectorCy = baseY - r * t * 2 - (1 - t) * slantH * 0.7;
      const sectorR = slantH * (0.5 + t * 0.5);

      ctx.beginPath();
      ctx.moveTo(cx, sectorCy);
      ctx.arc(cx, sectorCy, sectorR, Math.PI / 2 - angle / 2, Math.PI / 2 + angle / 2);
      ctx.closePath();
      ctx.fillStyle = "rgba(66, 165, 245, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#42a5f5";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#42a5f5";
      ctx.textAlign = "center";
      ctx.fillText("側面", cx, sectorCy + sectorR * 0.5);
      ctx.fillStyle = "#69f0ae";
      ctx.fillText("底面", cx, baseY);

    } else {
      // 三角柱
      const triH = 50;
      const triW = 60;
      const bodyH = 100;

      // 三角形の底辺
      const sideW = triW * (1 + t * 0.5);
      const sideX = cx - sideW / 2;
      const sideY = cy - bodyH / 2;

      // 側面の3つの長方形
      ctx.fillStyle = "rgba(66, 165, 245, 0.1)";
      ctx.strokeStyle = "#42a5f5";
      ctx.lineWidth = 2;

      // 中央の長方形
      ctx.fillRect(sideX, sideY, sideW, bodyH);
      ctx.strokeRect(sideX, sideY, sideW, bodyH);

      // 左の長方形（展開時のみ）
      if (t > 0.2) {
        const lw = triW * 0.8 * t;
        ctx.fillStyle = "rgba(66, 165, 245, 0.08)";
        ctx.fillRect(sideX - lw, sideY, lw, bodyH);
        ctx.strokeRect(sideX - lw, sideY, lw, bodyH);
      }

      // 右の長方形（展開時のみ）
      if (t > 0.2) {
        const rw = triW * 0.6 * t;
        ctx.fillStyle = "rgba(66, 165, 245, 0.08)";
        ctx.fillRect(sideX + sideW, sideY, rw, bodyH);
        ctx.strokeRect(sideX + sideW, sideY, rw, bodyH);
      }

      // 上の三角形
      const topTriY = sideY - triH * t;
      ctx.beginPath();
      ctx.moveTo(sideX, sideY - (sideY - topTriY) * 0.01);
      ctx.lineTo(sideX + sideW, sideY - (sideY - topTriY) * 0.01);
      ctx.lineTo(sideX + sideW / 2, topTriY);
      ctx.closePath();
      ctx.fillStyle = "rgba(105, 240, 174, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#69f0ae";
      ctx.stroke();

      // 下の三角形
      const botTriY = sideY + bodyH + triH * t;
      ctx.beginPath();
      ctx.moveTo(sideX, sideY + bodyH + (botTriY - sideY - bodyH) * 0.01);
      ctx.lineTo(sideX + sideW, sideY + bodyH + (botTriY - sideY - bodyH) * 0.01);
      ctx.lineTo(sideX + sideW / 2, botTriY);
      ctx.closePath();
      ctx.fillStyle = "rgba(105, 240, 174, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#69f0ae";
      ctx.stroke();

      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#42a5f5";
      ctx.textAlign = "center";
      ctx.fillText("側面", cx, cy);
      ctx.fillStyle = "#69f0ae";
      ctx.fillText("底面", cx, topTriY + triH * t * 0.3);
    }
  }, [solidType, unfold]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>立体の展開図</h2>
        <p className="algo-subtitle">Solid Nets</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {SOLIDS.map((s) => (
          <button
            key={s.id}
            className={solidType === s.id ? "btn-step" : "btn-reset"}
            onClick={() => setSolidType(s.id)}
            style={{ fontSize: "13px", padding: "6px 12px" }}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="formula">
        {solidType === "cylinder" && "円柱 = 2つの円 + 長方形"}
        {solidType === "cone" && "円錐 = 1つの円 + おうぎ形"}
        {solidType === "prism" && "三角柱 = 2つの三角形 + 3つの長方形"}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>展開</label>
          <input type="range" min="0" max="1" step="0.02" value={unfold} onChange={(e) => setUnfold(Number(e.target.value))} />
          <span className="value">{Math.round(unfold * 100)}%</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          スライダーを動かして、立体がどう展開されるか確認しよう
        </p>
      </div>
    </div>
  );
}

export default SolidNetVisualizer;
