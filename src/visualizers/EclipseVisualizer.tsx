import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

type EclipseType = "solar" | "lunar";

function EclipseVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [eclipseType, setEclipseType] = useState<EclipseType>("solar");
  const [alignment, setAlignment] = useState(50); // 0-100, 50 = perfect alignment
  const [playing, setPlaying] = useState(false);
  const animRef = useRef(0);
  const dirRef = useRef(1);

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

    const cy = h * 0.45;
    const offset = ((alignment - 50) / 50) * 60; // vertical offset for misalignment

    if (eclipseType === "solar") {
      // Solar eclipse: Sun - Moon - Earth (left to right)
      const sunX = w * 0.15;
      const earthX = w * 0.85;
      const moonX = w * 0.55;
      const sunR = 40;
      const moonR = 14;
      const earthR = 20;

      // Sun glow
      const sunGlow = ctx.createRadialGradient(sunX, cy, sunR * 0.5, sunX, cy, sunR * 2);
      sunGlow.addColorStop(0, "rgba(255, 200, 50, 0.3)");
      sunGlow.addColorStop(1, "rgba(255, 200, 50, 0)");
      ctx.beginPath();
      ctx.arc(sunX, cy, sunR * 2, 0, Math.PI * 2);
      ctx.fillStyle = sunGlow;
      ctx.fill();

      // Sun
      ctx.beginPath();
      ctx.arc(sunX, cy, sunR, 0, Math.PI * 2);
      ctx.fillStyle = "#ffca28";
      ctx.fill();

      // Shadow cone (umbra)
      const moonCy = cy + offset;
      if (Math.abs(offset) < moonR + sunR) {
        // Umbra cone
        ctx.beginPath();
        ctx.moveTo(moonX, moonCy - moonR);
        ctx.lineTo(earthX + 30, moonCy - moonR * 0.3);
        ctx.lineTo(earthX + 30, moonCy + moonR * 0.3);
        ctx.lineTo(moonX, moonCy + moonR);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();

        // Penumbra
        ctx.beginPath();
        ctx.moveTo(moonX, moonCy - moonR);
        ctx.lineTo(earthX + 30, moonCy - moonR * 1.5);
        ctx.lineTo(earthX + 30, moonCy - moonR * 0.3);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(moonX, moonCy + moonR);
        ctx.lineTo(earthX + 30, moonCy + moonR * 1.5);
        ctx.lineTo(earthX + 30, moonCy + moonR * 0.3);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fill();

        // Labels
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.textAlign = "center";
        ctx.fillText("本影 (umbra)", (moonX + earthX) / 2, moonCy - 4);
        ctx.fillText("半影 (penumbra)", (moonX + earthX) / 2, moonCy - moonR - 10);
      }

      // Moon
      ctx.beginPath();
      ctx.arc(moonX, moonCy, moonR, 0, Math.PI * 2);
      ctx.fillStyle = "#555";
      ctx.fill();

      // Earth
      ctx.beginPath();
      ctx.arc(earthX, cy, earthR, 0, Math.PI * 2);
      ctx.fillStyle = "#42a5f5";
      ctx.fill();

      // Labels
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffca28";
      ctx.fillText("太陽", sunX, cy + sunR + 18);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("月", moonX, moonCy + moonR + 18);
      ctx.fillStyle = "#42a5f5";
      ctx.fillText("地球", earthX, cy + earthR + 18);

      // Eclipse view from Earth
      const viewCx = w / 2;
      const viewCy = h * 0.82;
      const viewSunR = 28;
      const viewMoonR = 26;

      ctx.beginPath();
      ctx.arc(viewCx, viewCy, viewSunR, 0, Math.PI * 2);
      ctx.fillStyle = "#ffca28";
      ctx.fill();

      // Moon shadow over sun
      const moonViewOffset = offset * 0.8;
      ctx.beginPath();
      ctx.arc(viewCx, viewCy + moonViewOffset * 0.5, viewMoonR, 0, Math.PI * 2);
      ctx.fillStyle = "#111";
      ctx.fill();

      ctx.font = "12px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.textAlign = "center";
      ctx.fillText("地球から見た太陽", viewCx, viewCy + viewSunR + 16);
    } else {
      // Lunar eclipse: Sun - Earth - Moon (left to right)
      const sunX = w * 0.1;
      const earthX = w * 0.45;
      const moonX = w * 0.8;
      const sunR = 35;
      const earthR = 22;
      const moonR = 12;

      // Sun glow
      const sunGlow = ctx.createRadialGradient(sunX, cy, sunR * 0.5, sunX, cy, sunR * 2);
      sunGlow.addColorStop(0, "rgba(255, 200, 50, 0.3)");
      sunGlow.addColorStop(1, "rgba(255, 200, 50, 0)");
      ctx.beginPath();
      ctx.arc(sunX, cy, sunR * 2, 0, Math.PI * 2);
      ctx.fillStyle = sunGlow;
      ctx.fill();

      // Sun
      ctx.beginPath();
      ctx.arc(sunX, cy, sunR, 0, Math.PI * 2);
      ctx.fillStyle = "#ffca28";
      ctx.fill();

      // Earth's shadow cone
      const moonCy = cy + offset;
      ctx.beginPath();
      ctx.moveTo(earthX, cy - earthR);
      ctx.lineTo(moonX + 80, cy - earthR * 0.2);
      ctx.lineTo(moonX + 80, cy + earthR * 0.2);
      ctx.lineTo(earthX, cy + earthR);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fill();

      // Penumbra
      ctx.beginPath();
      ctx.moveTo(earthX, cy - earthR);
      ctx.lineTo(moonX + 80, cy - earthR * 1.2);
      ctx.lineTo(moonX + 80, cy - earthR * 0.2);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(earthX, cy + earthR);
      ctx.lineTo(moonX + 80, cy + earthR * 1.2);
      ctx.lineTo(moonX + 80, cy + earthR * 0.2);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fill();

      ctx.font = "11px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.textAlign = "center";
      ctx.fillText("本影", (earthX + moonX) / 2, cy - 4);
      ctx.fillText("半影", (earthX + moonX) / 2, cy - earthR - 6);

      // Earth
      ctx.beginPath();
      ctx.arc(earthX, cy, earthR, 0, Math.PI * 2);
      ctx.fillStyle = "#42a5f5";
      ctx.fill();

      // Moon
      ctx.beginPath();
      ctx.arc(moonX, moonCy, moonR, 0, Math.PI * 2);
      // Color depends on if in shadow
      const inShadow = Math.abs(offset) < earthR * 0.8;
      ctx.fillStyle = inShadow ? "#8b3a3a" : "#ccc";
      ctx.fill();

      // Labels
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffca28";
      ctx.fillText("太陽", sunX, cy + sunR + 18);
      ctx.fillStyle = "#42a5f5";
      ctx.fillText("地球", earthX, cy + earthR + 18);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("月", moonX, moonCy + moonR + 18);

      // Moon view
      const viewCx = w / 2;
      const viewCy = h * 0.82;
      const viewR = 25;

      ctx.beginPath();
      ctx.arc(viewCx, viewCy, viewR, 0, Math.PI * 2);
      ctx.fillStyle = inShadow ? "#8b3a3a" : "#ccc";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (inShadow) {
        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#ef5350";
        ctx.textAlign = "center";
        ctx.fillText("赤銅色", viewCx, viewCy + 4);
      }

      ctx.font = "12px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.textAlign = "center";
      ctx.fillText("月の見え方", viewCx, viewCy + viewR + 16);
    }

    // Title
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "center";
    ctx.fillText(
      eclipseType === "solar" ? "日食: 月が太陽を隠す" : "月食: 地球の影に月が入る",
      w / 2,
      24,
    );
  }, [eclipseType, alignment]);

  useEffect(() => {
    if (!playing) return;
    let running = true;
    const animate = () => {
      if (!running) return;
      setAlignment((a) => {
        const next = a + dirRef.current * 0.3;
        if (next >= 100) { dirRef.current = -1; return 100; }
        if (next <= 0) { dirRef.current = 1; return 0; }
        return next;
      });
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
        <h2>日食・月食</h2>
        <p className="algo-subtitle">Solar & Lunar Eclipses</p>
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          className={eclipseType === "solar" ? "btn-step" : "btn-reset"}
          onClick={() => setEclipseType("solar")}
        >
          日食
        </button>
        <button
          className={eclipseType === "lunar" ? "btn-step" : "btn-reset"}
          onClick={() => setEclipseType("lunar")}
        >
          月食
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>配置</label>
          <input
            type="range"
            min="0"
            max="100"
            value={alignment}
            onChange={(e) => setAlignment(Number(e.target.value))}
          />
          <span className="value">{alignment === 50 ? "一直線" : "ずれ"}</span>
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
          日食と月食を切り替えて、天体の配置と影の関係を観察しよう
        </p>
      </div>
    </div>
  );
}

export default EclipseVisualizer;
