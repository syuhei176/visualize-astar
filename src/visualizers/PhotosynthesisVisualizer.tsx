import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function PhotosynthesisVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lightIntensity, setLightIntensity] = useState(70);
  const [isDay, setIsDay] = useState(true);

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
    const lightPct = lightIntensity / 100;

    // 背景（昼/夜）
    const bgAlpha = isDay ? 0.05 + lightPct * 0.1 : 0.02;
    ctx.fillStyle = isDay
      ? `rgba(135, 206, 250, ${bgAlpha})`
      : `rgba(20, 20, 60, 0.15)`;
    ctx.fillRect(0, 0, w, h);

    // 太陽
    if (isDay) {
      const sunX = w * 0.8;
      const sunY = h * 0.12;
      const sunR = 20 + lightPct * 15;
      const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 2);
      gradient.addColorStop(0, `rgba(255, 215, 0, ${0.3 + lightPct * 0.5})`);
      gradient.addColorStop(0.5, `rgba(255, 215, 0, ${lightPct * 0.2})`);
      gradient.addColorStop(1, "rgba(255, 215, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd740";
      ctx.fill();

      // 光線
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI * 0.3 + (i / 4) * Math.PI * 0.4;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        const rayLen = 60 + lightPct * 40;
        ctx.lineTo(sunX + Math.cos(angle) * rayLen, sunY + Math.sin(angle) * rayLen);
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.1 + lightPct * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // 葉（楕円）
    const leafCx = cx;
    const leafCy = h * 0.45;
    const leafW = 80;
    const leafH = 50;

    ctx.beginPath();
    ctx.ellipse(leafCx, leafCy, leafW, leafH, -0.2, 0, Math.PI * 2);
    const leafGreen = isDay ? 0.4 + lightPct * 0.4 : 0.2;
    ctx.fillStyle = `rgba(76, 175, 80, ${leafGreen})`;
    ctx.fill();
    ctx.strokeStyle = "#4caf50";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 葉脈
    ctx.beginPath();
    ctx.moveTo(leafCx - leafW * 0.8, leafCy + 5);
    ctx.lineTo(leafCx + leafW * 0.8, leafCy - 5);
    ctx.strokeStyle = "rgba(56, 142, 60, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    for (let i = -3; i <= 3; i++) {
      const bx = leafCx + i * leafW * 0.2;
      const by = leafCy - i * 1;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + 15, by - 20);
      ctx.stroke();
    }

    // フロー矢印とラベル
    const arrowY = leafCy;
    const fontSize = 13;
    ctx.font = `bold ${fontSize}px sans-serif`;

    // 光合成（昼間）
    if (isDay && lightPct > 0.1) {
      const photoRate = lightPct;

      // CO₂ → 葉（左から）
      drawArrow(ctx, cx - 140, arrowY + 30, cx - leafW - 5, arrowY + 10, "#42a5f5", photoRate);
      ctx.fillStyle = "#42a5f5";
      ctx.textAlign = "right";
      ctx.fillText("CO₂", cx - 145, arrowY + 35);

      // H₂O → 葉（下から）
      drawArrow(ctx, cx, leafCy + leafH + 40, cx, leafCy + leafH + 5, "#42a5f5", photoRate);
      ctx.fillStyle = "#42a5f5";
      ctx.textAlign = "center";
      ctx.fillText("H₂O", cx, leafCy + leafH + 55);

      // 葉 → O₂（右へ）
      drawArrow(ctx, cx + leafW + 5, arrowY - 10, cx + 140, arrowY - 30, "#69f0ae", photoRate);
      ctx.fillStyle = "#69f0ae";
      ctx.textAlign = "left";
      ctx.fillText("O₂", cx + 145, arrowY - 25);

      // 葉 → デンプン（上へ）
      drawArrow(ctx, cx, leafCy - leafH - 5, cx, leafCy - leafH - 35, "#ff9800", photoRate);
      ctx.fillStyle = "#ff9800";
      ctx.textAlign = "center";
      ctx.fillText("デンプン（糖）", cx, leafCy - leafH - 42);

      // 光エネルギー
      ctx.fillStyle = "#ffd740";
      ctx.textAlign = "center";
      ctx.fillText("☀ 光エネルギー", cx, leafCy - leafH - 60);
    }

    // 呼吸（常に起こる、夜は呼吸のみ）
    const breathRate = 0.4;
    const breathOffY = isDay ? 60 : 0;

    // O₂ → 葉（左から、呼吸）
    drawArrow(ctx, cx - 140, arrowY - 20 + breathOffY, cx - leafW - 5, arrowY - 5 + breathOffY * 0.3, "#ef5350", breathRate);
    ctx.fillStyle = "#ef5350";
    ctx.textAlign = "right";
    ctx.fillText(isDay ? "" : "O₂", cx - 145, arrowY - 15 + breathOffY);

    if (!isDay) {
      // CO₂ 排出
      drawArrow(ctx, cx + leafW + 5, arrowY + 5, cx + 140, arrowY + 20, "#ef5350", breathRate);
      ctx.fillStyle = "#ef5350";
      ctx.textAlign = "left";
      ctx.fillText("CO₂", cx + 145, arrowY + 25);

      // 呼吸ラベル
      ctx.fillStyle = "#ef5350";
      ctx.textAlign = "center";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("呼吸のみ", cx, h * 0.15);

      // O₂入力ラベル
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = "#ef5350";
      ctx.textAlign = "right";
      ctx.fillText("O₂", cx - 145, arrowY - 15 + breathOffY);
    }

    // プロセスラベル
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";

    if (isDay && lightPct > 0.1) {
      ctx.fillStyle = "rgba(76, 175, 80, 0.8)";
      ctx.fillText("光合成 + 呼吸", cx, leafCy + 4);
    } else {
      ctx.fillStyle = "rgba(239, 83, 80, 0.8)";
      ctx.fillText("呼吸のみ", cx, leafCy + 4);
    }
  }, [lightIntensity, isDay]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>光合成と呼吸</h2>
        <p className="algo-subtitle">Photosynthesis &amp; Respiration</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          className={isDay ? "btn-step" : "btn-reset"}
          onClick={() => setIsDay(true)}
          style={{ fontSize: "13px", padding: "6px 12px" }}
        >
          昼（光合成+呼吸）
        </button>
        <button
          className={!isDay ? "btn-step" : "btn-reset"}
          onClick={() => setIsDay(false)}
          style={{ fontSize: "13px", padding: "6px 12px" }}
        >
          夜（呼吸のみ）
        </button>
      </div>

      <div className="formula">
        {isDay
          ? "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂"
          : "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + エネルギー"}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {isDay && (
        <div className="controls-bar">
          <div className="slider-group">
            <label>光の強さ</label>
            <input type="range" min="0" max="100" step="5" value={lightIntensity} onChange={(e) => setLightIntensity(Number(e.target.value))} />
            <span className="value">{lightIntensity}%</span>
          </div>
        </div>
      )}

      <div className="step-info">
        <p className="step-description">
          昼と夜を切り替えて、光合成と呼吸の違いを確認しよう
        </p>
      </div>
    </div>
  );
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  alpha: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
  ctx.lineWidth = 2;
  ctx.stroke();

  const headLen = 8;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * ux + headLen * 0.4 * uy, y2 - headLen * uy - headLen * 0.4 * ux);
  ctx.lineTo(x2 - headLen * ux - headLen * 0.4 * uy, y2 - headLen * uy + headLen * 0.4 * ux);
  ctx.closePath();
  ctx.fillStyle = color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
  ctx.fill();
}

export default PhotosynthesisVisualizer;
