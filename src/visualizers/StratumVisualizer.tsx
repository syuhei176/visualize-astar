import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

interface Layer {
  name: string;
  color: string;
  pattern: string;
  thickness: number;
}

const BASE_LAYERS: Layer[] = [
  { name: "表土", color: "rgba(139, 119, 101, 0.8)", pattern: "dots", thickness: 0.08 },
  { name: "砂岩", color: "rgba(210, 180, 140, 0.8)", pattern: "dots", thickness: 0.12 },
  { name: "泥岩", color: "rgba(128, 128, 128, 0.8)", pattern: "horizontal", thickness: 0.15 },
  { name: "石灰�ite", color: "rgba(200, 200, 180, 0.8)", pattern: "cross", thickness: 0.1 },
  { name: "砂岩", color: "rgba(190, 160, 120, 0.8)", pattern: "dots", thickness: 0.13 },
  { name: "れき岩", color: "rgba(160, 140, 130, 0.8)", pattern: "circles", thickness: 0.12 },
  { name: "泥岩", color: "rgba(110, 110, 110, 0.8)", pattern: "horizontal", thickness: 0.14 },
  { name: "基盤岩", color: "rgba(80, 80, 80, 0.9)", pattern: "none", thickness: 0.16 },
];

function StratumVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [erosion, setErosion] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [showFossils, setShowFossils] = useState(true);

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

    const margin = 20;
    const drawW = w - margin * 2;
    const drawH = h - margin * 2;
    const startY = margin;

    // 地層を描画
    let currentY = startY;
    const tiltRad = (tilt * Math.PI) / 180;

    for (let i = 0; i < BASE_LAYERS.length; i++) {
      const layer = BASE_LAYERS[i];
      const layerH = layer.thickness * drawH;

      // 侵食: 上の層から削れる
      const erosionDepth = erosion * drawH * 0.4;
      const layerTop = currentY;
      const layerBot = currentY + layerH;

      if (layerTop > startY + erosionDepth || i >= 2) {
        // 傾斜を適用
        const tiltOffset = Math.tan(tiltRad) * drawW;
        const leftTop = layerTop + tiltOffset * 0.5 * (i / BASE_LAYERS.length);
        const rightTop = layerTop - tiltOffset * 0.5 * (i / BASE_LAYERS.length);
        const leftBot = layerBot + tiltOffset * 0.5 * (i / BASE_LAYERS.length);
        const rightBot = layerBot - tiltOffset * 0.5 * (i / BASE_LAYERS.length);

        ctx.beginPath();
        ctx.moveTo(margin, Math.max(startY, leftTop));
        ctx.lineTo(margin + drawW, Math.max(startY, rightTop));
        ctx.lineTo(margin + drawW, rightBot);
        ctx.lineTo(margin, leftBot);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();

        // パターン
        ctx.save();
        ctx.clip();
        drawPattern(ctx, margin, layerTop, drawW, layerH, layer.pattern);
        ctx.restore();

        // 境界線
        ctx.beginPath();
        ctx.moveTo(margin, leftBot);
        ctx.lineTo(margin + drawW, rightBot);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 層名ラベル
        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.textAlign = "left";
        const labelY = (leftTop + leftBot) / 2 + 4;
        if (labelY > startY + 10) {
          ctx.fillText(layer.name, margin + 8, labelY);
        }

        // 化石アイコン
        if (showFossils && (i === 2 || i === 4)) {
          const fossilX = margin + drawW * 0.6;
          const fossilY = (layerTop + layerBot) / 2;
          ctx.font = "16px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(i === 2 ? "🐚" : "🦴", fossilX, fossilY + 5);
        }
      }

      currentY += layerH;
    }

    // 侵食面の線
    if (erosion > 0) {
      const erosY = startY + erosion * drawH * 0.4;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(margin, erosY);
      ctx.lineTo(margin + drawW, erosY);
      ctx.strokeStyle = "#ef5350";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#ef5350";
      ctx.textAlign = "right";
      ctx.fillText("侵食面", margin + drawW - 5, erosY - 5);
    }

    // 深さスケール
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.textAlign = "right";
    for (let d = 0; d <= 5; d++) {
      const y = startY + (d / 5) * drawH;
      ctx.fillText(`${d * 10}m`, margin - 3, y + 4);
    }
  }, [erosion, tilt, showFossils]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>地層のでき方</h2>
        <p className="algo-subtitle">Geological Strata</p>
      </div>

      <div className="formula">堆積の法則: 下の地層ほど古い</div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>侵食</label>
          <input type="range" min="0" max="1" step="0.05" value={erosion} onChange={(e) => setErosion(Number(e.target.value))} />
          <span className="value">{Math.round(erosion * 100)}%</span>
        </div>
        <div className="slider-group">
          <label>傾斜</label>
          <input type="range" min="-20" max="20" step="2" value={tilt} onChange={(e) => setTilt(Number(e.target.value))} />
          <span className="value">{tilt}°</span>
        </div>
        <button
          className={showFossils ? "btn-step" : "btn-reset"}
          onClick={() => setShowFossils(!showFossils)}
          style={{ fontSize: "12px", padding: "4px 10px" }}
        >
          化石
        </button>
      </div>

      <div className="step-info">
        <p className="step-description">
          侵食と傾斜を変えて、地層の構造がどう変わるか観察しよう
        </p>
      </div>
    </div>
  );
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  pattern: string,
) {
  ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.lineWidth = 0.5;

  if (pattern === "dots") {
    for (let py = y; py < y + h; py += 8) {
      for (let px = x; px < x + w; px += 8) {
        ctx.beginPath();
        ctx.arc(px + Math.random() * 4, py + Math.random() * 4, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === "horizontal") {
    for (let py = y + 4; py < y + h; py += 6) {
      ctx.beginPath();
      ctx.moveTo(x, py);
      ctx.lineTo(x + w, py);
      ctx.stroke();
    }
  } else if (pattern === "cross") {
    for (let py = y; py < y + h; py += 10) {
      for (let px = x; px < x + w; px += 10) {
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + 5, py + 5);
        ctx.stroke();
      }
    }
  } else if (pattern === "circles") {
    for (let py = y + 5; py < y + h; py += 12) {
      for (let px = x + 5; px < x + w; px += 12) {
        ctx.beginPath();
        ctx.arc(px, py, 3 + Math.random() * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

export default StratumVisualizer;
