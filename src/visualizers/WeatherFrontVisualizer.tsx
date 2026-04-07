import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type FrontType = "warm" | "cold" | "stationary" | "occluded";

const FRONTS: { id: FrontType; name: string; color: string }[] = [
  { id: "warm", name: "温暖前線", color: "#ef5350" },
  { id: "cold", name: "寒冷前線", color: "#42a5f5" },
  { id: "stationary", name: "停滞前線", color: "#ab47bc" },
  { id: "occluded", name: "閉塞前線", color: "#ff9800" },
];

function WeatherFrontVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frontType, setFrontType] = useState<FrontType>("warm");
  const [position, setPosition] = useState(0.5);

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

    const groundY = h * 0.75;
    const frontX = w * position;

    // 地面
    ctx.fillStyle = "rgba(139, 119, 101, 0.3)";
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();

    if (frontType === "warm") {
      // 温暖前線: 暖気が寒気の上にゆっくり這い上がる
      // 暖気（赤）
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(frontX, groundY);
      ctx.lineTo(frontX - w * 0.5, h * 0.3);
      ctx.lineTo(0, h * 0.2);
      ctx.closePath();
      ctx.fillStyle = "rgba(239, 83, 80, 0.12)";
      ctx.fill();

      // 寒気（青）
      ctx.beginPath();
      ctx.moveTo(frontX, groundY);
      ctx.lineTo(w, groundY);
      ctx.lineTo(w, h * 0.3);
      ctx.lineTo(frontX, h * 0.4);
      ctx.closePath();
      ctx.fillStyle = "rgba(66, 165, 245, 0.12)";
      ctx.fill();

      // 前線面（緩やかな傾斜）
      ctx.beginPath();
      ctx.moveTo(frontX, groundY);
      ctx.quadraticCurveTo(frontX - w * 0.2, h * 0.5, frontX - w * 0.5, h * 0.25);
      ctx.strokeStyle = "#ef5350";
      ctx.lineWidth = 3;
      ctx.stroke();

      // 雲（前線の前方に広い範囲）
      drawCloud(ctx, frontX - w * 0.3, h * 0.2, 50, 0.4);
      drawCloud(ctx, frontX - w * 0.15, h * 0.25, 40, 0.3);
      drawCloud(ctx, frontX - w * 0.05, h * 0.32, 35, 0.2);

      // 雨
      drawRain(ctx, frontX - w * 0.3, h * 0.3, frontX - w * 0.05, groundY, 0.3);

      // 前線記号（半円）
      for (let x = frontX - 10; x > 30; x -= 30) {
        ctx.beginPath();
        ctx.arc(x, groundY, 6, Math.PI, 0);
        ctx.fillStyle = "#ef5350";
        ctx.fill();
      }

      // ラベル
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#ef5350";
      ctx.textAlign = "center";
      ctx.fillText("暖気", frontX * 0.3, groundY - 20);
      ctx.fillStyle = "#42a5f5";
      ctx.fillText("寒気", frontX + (w - frontX) * 0.5, groundY - 20);

      // 矢印
      drawWindArrow(ctx, frontX * 0.3, groundY - 40, 1, "#ef5350");

    } else if (frontType === "cold") {
      // 寒冷前線: 寒気が暖気の下にもぐり込む（急な傾斜）
      // 暖気
      ctx.beginPath();
      ctx.moveTo(frontX, groundY);
      ctx.lineTo(w, groundY);
      ctx.lineTo(w, h * 0.2);
      ctx.lineTo(frontX + w * 0.15, h * 0.15);
      ctx.closePath();
      ctx.fillStyle = "rgba(239, 83, 80, 0.12)";
      ctx.fill();

      // 寒気
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(frontX, groundY);
      ctx.lineTo(frontX, h * 0.4);
      ctx.lineTo(0, h * 0.3);
      ctx.closePath();
      ctx.fillStyle = "rgba(66, 165, 245, 0.12)";
      ctx.fill();

      // 前線面（急な傾斜）
      ctx.beginPath();
      ctx.moveTo(frontX, groundY);
      ctx.quadraticCurveTo(frontX + w * 0.05, h * 0.35, frontX + w * 0.15, h * 0.15);
      ctx.strokeStyle = "#42a5f5";
      ctx.lineWidth = 3;
      ctx.stroke();

      // 積乱雲（前線付近に集中）
      drawCloud(ctx, frontX + w * 0.03, h * 0.15, 45, 0.5);
      drawCloud(ctx, frontX + w * 0.08, h * 0.12, 35, 0.4);

      // 強い雨
      drawRain(ctx, frontX - 10, h * 0.25, frontX + w * 0.1, groundY, 0.6);

      // 前線記号（三角形）
      for (let x = frontX + 10; x < w - 30; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x - 6, groundY);
        ctx.lineTo(x, groundY - 10);
        ctx.lineTo(x + 6, groundY);
        ctx.closePath();
        ctx.fillStyle = "#42a5f5";
        ctx.fill();
      }

      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#42a5f5";
      ctx.textAlign = "center";
      ctx.fillText("寒気", frontX * 0.5, groundY - 20);
      ctx.fillStyle = "#ef5350";
      ctx.fillText("暖気", frontX + (w - frontX) * 0.5, groundY - 20);

      drawWindArrow(ctx, frontX * 0.5, groundY - 40, 1, "#42a5f5");

    } else if (frontType === "stationary") {
      // 停滞前線
      ctx.beginPath();
      ctx.moveTo(0, h * 0.3);
      ctx.lineTo(0, groundY);
      ctx.lineTo(frontX, groundY);
      ctx.lineTo(frontX, h * 0.35);
      ctx.closePath();
      ctx.fillStyle = "rgba(66, 165, 245, 0.1)";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(frontX, h * 0.35);
      ctx.lineTo(frontX, groundY);
      ctx.lineTo(w, groundY);
      ctx.lineTo(w, h * 0.3);
      ctx.closePath();
      ctx.fillStyle = "rgba(239, 83, 80, 0.1)";
      ctx.fill();

      // 前線記号（交互に半円と三角形）
      for (let x = 20; x < w - 20; x += 30) {
        if (Math.floor(x / 30) % 2 === 0) {
          ctx.beginPath();
          ctx.arc(x, groundY, 6, Math.PI, 0);
          ctx.fillStyle = "#ef5350";
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(x - 6, groundY);
          ctx.lineTo(x, groundY + 10);
          ctx.lineTo(x + 6, groundY);
          ctx.closePath();
          ctx.fillStyle = "#42a5f5";
          ctx.fill();
        }
      }

      drawCloud(ctx, frontX, h * 0.25, 50, 0.3);
      drawRain(ctx, frontX - 40, h * 0.35, frontX + 40, groundY, 0.2);

      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#42a5f5";
      ctx.textAlign = "center";
      ctx.fillText("寒気", frontX * 0.4, groundY - 20);
      ctx.fillStyle = "#ef5350";
      ctx.fillText("暖気", frontX + (w - frontX) * 0.6, groundY - 20);

    } else {
      // 閉塞前線
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.lineTo(w, h * 0.25);
      ctx.lineTo(0, h * 0.3);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 152, 0, 0.08)";
      ctx.fill();

      // 前線記号
      for (let x = 20; x < w - 20; x += 25) {
        if (x % 50 < 25) {
          ctx.beginPath();
          ctx.arc(x, groundY, 5, Math.PI, 0);
          ctx.fillStyle = "#ff9800";
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(x - 5, groundY);
          ctx.lineTo(x, groundY - 9);
          ctx.lineTo(x + 5, groundY);
          ctx.closePath();
          ctx.fillStyle = "#ff9800";
          ctx.fill();
        }
      }

      drawCloud(ctx, frontX, h * 0.2, 50, 0.4);
      drawRain(ctx, frontX - 30, h * 0.3, frontX + 30, groundY, 0.4);

      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#ff9800";
      ctx.textAlign = "center";
      ctx.fillText("閉塞前線", frontX, groundY - 20);
    }

    // 方位
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.textAlign = "left";
    ctx.fillText("西", 5, groundY + 15);
    ctx.textAlign = "right";
    ctx.fillText("東", w - 5, groundY + 15);
  }, [frontType, position]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const current = FRONTS.find((f) => f.id === frontType)!;

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>天気図と前線</h2>
        <p className="algo-subtitle">Weather Fronts</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {FRONTS.map((f) => (
          <button
            key={f.id}
            className={frontType === f.id ? "btn-step" : "btn-reset"}
            onClick={() => setFrontType(f.id)}
            style={{ fontSize: "12px", padding: "5px 10px" }}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="formula" style={{ color: current.color }}>
        {frontType === "warm" && "暖気が寒気の上に這い上がる → 広い範囲で弱い雨"}
        {frontType === "cold" && "寒気が暖気の下にもぐり込む → 狭い範囲で強い雨"}
        {frontType === "stationary" && "暖気と寒気がぶつかり動かない → 長雨"}
        {frontType === "occluded" && "寒冷前線が温暖前線に追いつく → 低気圧の終わり"}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>位置</label>
          <input type="range" min="0.2" max="0.8" step="0.02" value={position} onChange={(e) => setPosition(Number(e.target.value))} />
          <span className="value">{Math.round(position * 100)}%</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          前線の種類を切り替えて、暖気と寒気の動き方の違いを確認しよう
        </p>
      </div>
    </div>
  );
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) {
  ctx.fillStyle = `rgba(200, 200, 200, ${opacity})`;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.35, 0, Math.PI * 2);
  ctx.arc(x - size * 0.25, y + size * 0.05, size * 0.3, 0, Math.PI * 2);
  ctx.arc(x + size * 0.15, y + size * 0.1, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawRain(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, density: number) {
  ctx.strokeStyle = `rgba(100, 180, 255, ${density * 0.5})`;
  ctx.lineWidth = 1;
  const count = Math.floor(density * 20);
  for (let i = 0; i < count; i++) {
    const rx = x1 + Math.random() * (x2 - x1);
    const ry = y1 + Math.random() * (y2 - y1);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 2, ry + 8);
    ctx.stroke();
  }
}

function drawWindArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, color: string) {
  const len = 30;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + len * dir, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + len * dir, y);
  ctx.lineTo(x + (len - 8) * dir, y - 4);
  ctx.lineTo(x + (len - 8) * dir, y + 4);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export default WeatherFrontVisualizer;
