import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

interface City {
  name: string;
  nameJa: string;
  longitude: number; // degrees
  utcOffset: number; // hours
}

const CITIES: City[] = [
  { name: "Tokyo", nameJa: "東京", longitude: 139.7, utcOffset: 9 },
  { name: "Beijing", nameJa: "北京", longitude: 116.4, utcOffset: 8 },
  { name: "Delhi", nameJa: "デリー", longitude: 77.2, utcOffset: 5.5 },
  { name: "Moscow", nameJa: "モスクワ", longitude: 37.6, utcOffset: 3 },
  { name: "London", nameJa: "ロンドン", longitude: 0, utcOffset: 0 },
  { name: "New York", nameJa: "ニューヨーク", longitude: -74, utcOffset: -5 },
  { name: "Los Angeles", nameJa: "ロサンゼルス", longitude: -118.2, utcOffset: -8 },
  { name: "Sydney", nameJa: "シドニー", longitude: 151.2, utcOffset: 10 },
];

function TimezoneVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0); // 0-360, represents Earth rotation
  const [playing, setPlaying] = useState(true);
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

    const cx = w / 2;
    const cy = h * 0.42;
    const earthR = Math.min(w, h) * 0.28;

    // Sun direction indicator (from right)
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#ffca28";
    ctx.textAlign = "right";
    ctx.fillText("太陽光 \u2192", w - 12, cy - earthR - 10);

    // Sunlight arrows
    for (let i = -4; i <= 4; i++) {
      const ay = cy + i * 20;
      ctx.beginPath();
      ctx.moveTo(w - 8, ay);
      ctx.lineTo(cx + earthR + 20, ay);
      ctx.strokeStyle = "rgba(255, 200, 50, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Arrow head
      ctx.beginPath();
      ctx.moveTo(cx + earthR + 28, ay);
      ctx.lineTo(cx + earthR + 20, ay - 3);
      ctx.lineTo(cx + earthR + 20, ay + 3);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 200, 50, 0.15)";
      ctx.fill();
    }

    // Day/night on Earth (north pole view - top down)
    // Night half (left side when sun is from right)
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, Math.PI / 2, -Math.PI / 2);
    ctx.fillStyle = "rgba(20, 40, 80, 0.6)";
    ctx.fill();

    // Day half (right side)
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = "rgba(100, 180, 255, 0.15)";
    ctx.fill();

    // Earth outline
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Day/Night boundary
    ctx.beginPath();
    ctx.moveTo(cx, cy - earthR);
    ctx.lineTo(cx, cy + earthR);
    ctx.strokeStyle = "rgba(255, 200, 50, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "11px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "center";
    ctx.fillText("昼", cx + earthR * 0.5, cy - earthR - 4);
    ctx.fillText("夜", cx - earthR * 0.5, cy - earthR - 4);

    // North pole label
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#69f0ae";
    ctx.fill();
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "center";
    ctx.fillText("N", cx, cy - 8);

    // Draw cities
    const baseHour = (rotation / 360) * 24; // UTC time based on rotation

    for (const city of CITIES) {
      // Position on Earth circle based on longitude + rotation
      const cityAngle = ((city.longitude + rotation) * Math.PI) / 180 - Math.PI / 2;
      const px = cx + earthR * Math.cos(cityAngle);
      const py = cy + earthR * Math.sin(cityAngle);

      // Calculate local time
      const localHour = ((baseHour + city.utcOffset) % 24 + 24) % 24;
      const hours = Math.floor(localHour);
      const minutes = Math.floor((localHour - hours) * 60);
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

      // Is it day or night at this city?
      const isDay = px > cx;

      // City dot
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = isDay ? "#ffca28" : "#ab47bc";
      ctx.fill();

      // Label
      const labelR = earthR + 18;
      const lx = cx + labelR * Math.cos(cityAngle);
      const ly = cy + labelR * Math.sin(cityAngle);

      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = isDay ? "#ffca28" : "#ab47bc";
      ctx.textAlign = cityAngle > -Math.PI / 2 && cityAngle < Math.PI / 2 ? "left" : "right";
      ctx.fillText(`${city.nameJa}`, lx, ly - 6);
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText(timeStr, lx, ly + 8);
    }

    // Time zone table at bottom
    const tableY = h * 0.78;
    const colW = w / CITIES.length;
    ctx.font = "10px sans-serif";

    for (let i = 0; i < CITIES.length; i++) {
      const city = CITIES[i];
      const tx = colW * i + colW / 2;
      const localHour = ((baseHour + city.utcOffset) % 24 + 24) % 24;
      const hours = Math.floor(localHour);
      const minutes = Math.floor((localHour - hours) * 60);
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      const isDay = hours >= 6 && hours < 18;

      ctx.fillStyle = isDay ? "rgba(255, 200, 50, 0.15)" : "rgba(100, 50, 150, 0.15)";
      ctx.fillRect(colW * i + 1, tableY, colW - 2, 40);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.textAlign = "center";
      ctx.fillText(city.nameJa, tx, tableY + 14);
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.fillStyle = isDay ? "#ffca28" : "#ab47bc";
      ctx.fillText(timeStr, tx, tableY + 30);
      ctx.font = "10px sans-serif";
    }
  }, [rotation]);

  useEffect(() => {
    if (!playing) return;
    let running = true;
    const animate = () => {
      if (!running) return;
      setRotation((r) => (r + 0.15) % 360);
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
        <h2>地球の自転と時差</h2>
        <p className="algo-subtitle">Earth Rotation & Time Zones</p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>自転</label>
          <input
            type="range"
            min="0"
            max="359"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
          />
          <span className="value">{rotation.toFixed(0)}°</span>
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
          北極上空から見た地球の自転。経度の違いで各都市の時刻が異なることを確認しよう
        </p>
      </div>
    </div>
  );
}

export default TimezoneVisualizer;
