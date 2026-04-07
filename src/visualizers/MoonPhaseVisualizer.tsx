import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

const PHASES = [
  { name: "新月", english: "New Moon", angle: 0 },
  { name: "三日月", english: "Waxing Crescent", angle: 45 },
  { name: "上弦の月", english: "First Quarter", angle: 90 },
  { name: "十三夜月", english: "Waxing Gibbous", angle: 135 },
  { name: "満月", english: "Full Moon", angle: 180 },
  { name: "十六夜月", english: "Waning Gibbous", angle: 225 },
  { name: "下弦の月", english: "Last Quarter", angle: 270 },
  { name: "二十六夜月", english: "Waning Crescent", angle: 315 },
];

function MoonPhaseVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [moonAngle, setMoonAngle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const animRef = useRef(0);

  const getPhase = (angle: number) => {
    const normalized = ((angle % 360) + 360) % 360;
    let closest = PHASES[0];
    let minDist = 360;
    for (const p of PHASES) {
      let d = Math.abs(normalized - p.angle);
      if (d > 180) d = 360 - d;
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    }
    return closest;
  };

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
    const cy = h * 0.45;
    const orbitR = Math.min(w, h) * 0.3;
    const earthR = 18;
    const moonR = 10;
    // Sun is to the left

    // Sun rays from left
    const sunX = cx - orbitR * 1.8;
    const sunY = cy;
    // Draw rays
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(sunX + 18 * Math.cos(a), sunY + 18 * Math.sin(a));
      ctx.lineTo(sunX + 28 * Math.cos(a), sunY + 28 * Math.sin(a));
      ctx.strokeStyle = "rgba(255, 200, 50, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // Sun circle
    ctx.beginPath();
    ctx.arc(sunX, sunY, 16, 0, Math.PI * 2);
    ctx.fillStyle = "#ffca28";
    ctx.fill();
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#ffca28";
    ctx.textAlign = "center";
    ctx.fillText("太陽", sunX, sunY + 30);

    // Sunlight arrows
    for (let i = -2; i <= 2; i++) {
      const ay = cy + i * 25;
      ctx.beginPath();
      ctx.moveTo(sunX + 30, ay);
      ctx.lineTo(cx - orbitR - 20, ay);
      ctx.strokeStyle = "rgba(255, 200, 50, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Orbit circle
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Earth
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
    ctx.fillStyle = "#42a5f5";
    ctx.fill();
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#42a5f5";
    ctx.textAlign = "center";
    ctx.fillText("地球", cx, cy + earthR + 14);

    // Moon position
    const moonAngleRad = ((moonAngle - 90) * Math.PI) / 180; // 0 = top
    const moonX = cx + orbitR * Math.cos(moonAngleRad);
    const moonY = cy + orbitR * Math.sin(moonAngleRad);

    // Moon (full circle as base)
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();

    // Illuminated portion from sun direction
    const sunToMoon = Math.atan2(moonY - sunY, moonX - sunX);
    // The illuminated half faces the sun
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, sunToMoon - Math.PI / 2, sunToMoon + Math.PI / 2);
    ctx.fillStyle = "#e0e0e0";
    ctx.fill();

    ctx.font = "10px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "center";
    ctx.fillText("月", moonX, moonY + moonR + 12);

    // Moon phase as seen from Earth
    const phase = getPhase(moonAngle);
    const normalized = ((moonAngle % 360) + 360) % 360;

    // Draw phase view (bottom section)
    const viewCx = cx;
    const viewCy = h * 0.82;
    const viewR = 30;

    ctx.beginPath();
    ctx.arc(viewCx, viewCy, viewR, 0, Math.PI * 2);
    ctx.fillStyle = "#222";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw illuminated part based on angle
    // At 0 (new moon) = dark, at 180 (full moon) = full light
    const illum = (1 - Math.cos((normalized * Math.PI) / 180)) / 2;

    if (illum > 0.01) {
      ctx.beginPath();
      // Right half always visible during waxing (0-180), left during waning (180-360)
      if (normalized <= 180) {
        // Waxing: right side illuminated
        ctx.arc(viewCx, viewCy, viewR, -Math.PI / 2, Math.PI / 2);
        const bulge = viewR * (2 * illum - 1);
        ctx.ellipse(viewCx, viewCy, Math.abs(bulge), viewR, 0, Math.PI / 2, -Math.PI / 2, bulge < 0);
      } else {
        // Waning: left side illuminated
        ctx.arc(viewCx, viewCy, viewR, Math.PI / 2, -Math.PI / 2);
        const waneIllum = (1 - Math.cos(((360 - normalized) * Math.PI) / 180)) / 2;
        const bulge = viewR * (2 * waneIllum - 1);
        ctx.ellipse(viewCx, viewCy, Math.abs(bulge), viewR, 0, -Math.PI / 2, Math.PI / 2, bulge < 0);
      }
      ctx.fillStyle = "#e0e0e0";
      ctx.fill();
    }

    // Phase name
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#ffca28";
    ctx.textAlign = "center";
    ctx.fillText(phase.name, viewCx, viewCy - viewR - 16);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText(phase.english, viewCx, viewCy - viewR - 2);
    ctx.fillText("地球から見た月", viewCx, viewCy + viewR + 16);

    // 8 phase thumbnails
    const thumbR = 12;
    const thumbY = h * 0.82;
    const startX = 30;
    const spacing = (w - 60) / 8;
    if (spacing >= thumbR * 2 + 4) {
      for (let i = 0; i < PHASES.length; i++) {
        const tx = startX + spacing * i + spacing / 2;
        if (Math.abs(tx - viewCx) < viewR + thumbR + 8) continue;
        const pa = PHASES[i].angle;
        const pIllum = (1 - Math.cos((pa * Math.PI) / 180)) / 2;

        ctx.beginPath();
        ctx.arc(tx, thumbY, thumbR, 0, Math.PI * 2);
        ctx.fillStyle = "#222";
        ctx.fill();

        const isActive = phase.angle === pa;
        ctx.strokeStyle = isActive ? "#ffca28" : "rgba(255,255,255,0.1)";
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.stroke();

        if (pIllum > 0.01) {
          ctx.beginPath();
          if (pa <= 180) {
            ctx.arc(tx, thumbY, thumbR, -Math.PI / 2, Math.PI / 2);
            const b = thumbR * (2 * pIllum - 1);
            ctx.ellipse(tx, thumbY, Math.abs(b), thumbR, 0, Math.PI / 2, -Math.PI / 2, b < 0);
          } else {
            ctx.arc(tx, thumbY, thumbR, Math.PI / 2, -Math.PI / 2);
            const wI = (1 - Math.cos(((360 - pa) * Math.PI) / 180)) / 2;
            const b = thumbR * (2 * wI - 1);
            ctx.ellipse(tx, thumbY, Math.abs(b), thumbR, 0, -Math.PI / 2, Math.PI / 2, b < 0);
          }
          ctx.fillStyle = "#ccc";
          ctx.fill();
        }
      }
    }
  }, [moonAngle]);

  useEffect(() => {
    if (!playing) return;
    let running = true;
    const animate = () => {
      if (!running) return;
      setMoonAngle((a) => (a + 0.5) % 360);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [playing]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>月の満ち欠け</h2>
        <p className="algo-subtitle">Moon Phases</p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>月の位置</label>
          <input
            type="range"
            min="0"
            max="359"
            value={moonAngle}
            onChange={(e) => setMoonAngle(Number(e.target.value))}
          />
          <span className="value">{moonAngle.toFixed(0)}°</span>
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
          スライダーで月の公転位置を変えて、地球から見た月の形の変化を観察しよう
        </p>
      </div>
    </div>
  );
}

export default MoonPhaseVisualizer;
