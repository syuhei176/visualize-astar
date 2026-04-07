import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type MotionMode = "daily" | "annual";

const CONSTELLATIONS = [
  { name: "オリオン座", season: "冬", angle: 0 },
  { name: "しし座", season: "春", angle: 90 },
  { name: "さそり座", season: "夏", angle: 180 },
  { name: "ペガスス座", season: "秋", angle: 270 },
];

function StarMotionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<MotionMode>("daily");
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const animRef = useRef(0);

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

    // Dark sky background
    const skyGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    skyGrad.addColorStop(0, "#0a0a2a");
    skyGrad.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    if (mode === "daily") {
      // Daily motion: stars rotate around Polaris
      const polX = w / 2;
      const polY = h * 0.4;
      const maxR = Math.min(w, h) * 0.38;
      const rotAngle = (time * Math.PI) / 180;

      // Polaris
      ctx.beginPath();
      ctx.arc(polX, polY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffca28";
      ctx.fill();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#ffca28";
      ctx.textAlign = "center";
      ctx.fillText("北極星", polX, polY - 10);

      // Stars at various distances from Polaris with circular trails
      const starSeed = 17;
      let s = starSeed;
      const rand = () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
      };

      const numStars = 40;
      for (let i = 0; i < numStars; i++) {
        const dist = rand() * maxR * 0.9 + maxR * 0.08;
        const baseAngle = rand() * Math.PI * 2;
        const brightness = 0.3 + rand() * 0.7;
        const starR = 1 + rand() * 2;

        // Draw trail (arc showing past movement)
        const trailLen = Math.PI * 0.3;
        ctx.beginPath();
        ctx.arc(polX, polY, dist, baseAngle + rotAngle - trailLen, baseAngle + rotAngle);
        ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.15})`;
        ctx.lineWidth = starR * 0.8;
        ctx.stroke();

        // Current star position
        const sx = polX + dist * Math.cos(baseAngle + rotAngle);
        const sy = polY + dist * Math.sin(baseAngle + rotAngle);
        ctx.beginPath();
        ctx.arc(sx, sy, starR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.fill();
      }

      // Circular guide lines
      for (let r = maxR * 0.25; r <= maxR; r += maxR * 0.25) {
        ctx.beginPath();
        ctx.arc(polX, polY, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Horizon line
      ctx.beginPath();
      ctx.moveTo(0, h * 0.85);
      ctx.lineTo(w, h * 0.85);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.textAlign = "center";
      ctx.fillText("地平線", w / 2, h * 0.85 + 14);

      // Direction labels
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillText("北", w / 2, h * 0.85 - 6);
      ctx.fillText("東", w * 0.15, h * 0.85 - 6);
      ctx.fillText("西", w * 0.85, h * 0.85 - 6);

      // Time display
      const hours = ((time / 360) * 24 + 21) % 24;
      const hh = Math.floor(hours);
      const mm = Math.floor((hours - hh) * 60);
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillStyle = "#42a5f5";
      ctx.textAlign = "center";
      ctx.fillText(`${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`, w / 2, 28);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText("反時計回りに1日1回転（北を向いた場合）", w / 2, 46);
    } else {
      // Annual motion: constellations shift with seasons
      const cx = w / 2;
      const cy = h * 0.45;
      const skyR = Math.min(w, h) * 0.35;
      const annualAngle = (time * Math.PI) / 180;

      // Sky dome circle
      ctx.beginPath();
      ctx.arc(cx, cy, skyR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Direction labels around dome
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.textAlign = "center";
      ctx.fillText("南", cx, cy + skyR + 16);
      ctx.fillText("北", cx, cy - skyR - 6);
      ctx.textAlign = "left";
      ctx.fillText("東", cx + skyR + 6, cy + 4);
      ctx.textAlign = "right";
      ctx.fillText("西", cx - skyR - 6, cy + 4);

      // Draw constellations at positions that shift with time
      for (const constellation of CONSTELLATIONS) {
        const cAngle = ((constellation.angle * Math.PI) / 180 - annualAngle);
        const visible = Math.cos(cAngle);

        if (visible > -0.3) {
          const x = cx + skyR * 0.7 * Math.sin(cAngle);
          const y = cy - skyR * 0.5 * visible;
          const alpha = Math.max(0, Math.min(1, visible + 0.3));

          // Draw a simple constellation pattern
          const drawStar = (dx: number, dy: number, size: number) => {
            ctx.beginPath();
            ctx.arc(x + dx, y + dy, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            ctx.fill();
          };

          if (constellation.name === "オリオン座") {
            drawStar(-8, -10, 2); drawStar(8, -10, 2);
            drawStar(-4, 0, 1.5); drawStar(0, 0, 1.5); drawStar(4, 0, 1.5);
            drawStar(-8, 10, 2); drawStar(8, 10, 2);
          } else if (constellation.name === "しし座") {
            drawStar(-10, -5, 2.5); drawStar(-4, -10, 1.5);
            drawStar(4, -6, 1.5); drawStar(10, 0, 2);
            drawStar(6, 8, 1.5); drawStar(-2, 6, 1.5);
          } else if (constellation.name === "さそり座") {
            drawStar(-12, 0, 2.5); drawStar(-6, -2, 1.5);
            drawStar(0, 0, 1.5); drawStar(6, 3, 1.5);
            drawStar(10, 8, 1.5); drawStar(8, 14, 1.5);
          } else {
            drawStar(0, -10, 2); drawStar(-10, 0, 2);
            drawStar(10, 0, 2); drawStar(0, 10, 2);
          }

          ctx.font = `bold 12px sans-serif`;
          ctx.fillStyle = `rgba(255, 200, 100, ${alpha * 0.8})`;
          ctx.textAlign = "center";
          ctx.fillText(constellation.name, x, y + 24);
          ctx.font = "10px sans-serif";
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
          ctx.fillText(`(${constellation.season})`, x, y + 36);
        }
      }

      // Current season
      const seasonAngle = ((time % 360) + 360) % 360;
      let season = "春";
      if (seasonAngle >= 90 && seasonAngle < 180) season = "夏";
      else if (seasonAngle >= 180 && seasonAngle < 270) season = "秋";
      else if (seasonAngle >= 270) season = "冬";

      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#69f0ae";
      ctx.textAlign = "center";
      ctx.fillText(`現在の季節: ${season}`, cx, 28);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText("季節によって見える星座が変わる（南の空、21時頃）", cx, 46);

      // Sun position indicator
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "rgba(255, 200, 50, 0.4)";
      ctx.textAlign = "center";
      ctx.fillText(
        `太陽の方向: ${season}の星座の反対側`,
        cx,
        h * 0.88,
      );
    }
  }, [mode, time]);

  useEffect(() => {
    if (!playing) return;
    let running = true;
    const animate = () => {
      if (!running) return;
      setTime((t) => (t + (mode === "daily" ? 0.5 : 0.2)) % 360);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [playing, mode]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>星の日周運動・年周運動</h2>
        <p className="algo-subtitle">Daily & Annual Star Motion</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          className={mode === "daily" ? "btn-step" : "btn-reset"}
          onClick={() => { setMode("daily"); setTime(0); }}
        >
          日周運動
        </button>
        <button
          className={mode === "annual" ? "btn-step" : "btn-reset"}
          onClick={() => { setMode("annual"); setTime(0); }}
        >
          年周運動
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>{mode === "daily" ? "時刻" : "季節"}</label>
          <input
            type="range"
            min="0"
            max="359"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
          />
          <span className="value">{time.toFixed(0)}°</span>
        </div>
        <button
          className={playing ? "btn-reset" : "btn-step"}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? "停止" : "再生"}
        </button>
      </div>

      <div className="step-info">
        <p className="step-description">
          {mode === "daily"
            ? "北極星を中心に星が反時計回りに回る日周運動を観察しよう"
            : "季節によって南の空に見える星座が変わることを確認しよう"}
        </p>
      </div>
    </div>
  );
}

export default StarMotionVisualizer;
