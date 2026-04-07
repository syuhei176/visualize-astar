import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

interface Planet {
  name: string;
  nameJa: string;
  distance: number; // relative
  period: number; // relative orbital period
  radius: number;
  color: string;
  info: string;
}

const PLANETS: Planet[] = [
  { name: "Mercury", nameJa: "水星", distance: 0.39, period: 0.24, radius: 3, color: "#b0b0b0", info: "最も太陽に近い惑星" },
  { name: "Venus", nameJa: "金星", distance: 0.72, period: 0.62, radius: 5, color: "#ffcc80", info: "地球とほぼ同じ大きさ" },
  { name: "Earth", nameJa: "地球", distance: 1.0, period: 1.0, radius: 5, color: "#42a5f5", info: "私たちの住む惑星" },
  { name: "Mars", nameJa: "火星", distance: 1.52, period: 1.88, radius: 4, color: "#ef5350", info: "赤い惑星" },
  { name: "Jupiter", nameJa: "木星", distance: 2.2, period: 4.0, radius: 10, color: "#ffb74d", info: "最大の惑星" },
  { name: "Saturn", nameJa: "土星", distance: 2.8, period: 6.0, radius: 8, color: "#ffe082", info: "美しい環を持つ" },
  { name: "Uranus", nameJa: "天王星", distance: 3.3, period: 9.0, radius: 6, color: "#80deea", info: "横倒しで自転する" },
  { name: "Neptune", nameJa: "海王星", distance: 3.8, period: 12.0, radius: 6, color: "#5c6bc0", info: "最も遠い惑星" },
];

function SolarSystemVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [speed, setSpeed] = useState(1);
  const timeRef = useRef(0);
  const animRef = useRef(0);
  const planetPositionsRef = useRef<{ x: number; y: number; planet: Planet }[]>([]);

  const getCanvasCoords = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [],
  );

  const handleClick = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCanvasCoords(e);
      const positions = planetPositionsRef.current;
      for (const pos of positions) {
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist < pos.planet.radius + 12) {
          setSelectedPlanet(pos.planet);
          return;
        }
      }
      setSelectedPlanet(null);
    },
    [getCanvasCoords],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleClick, { passive: true });
    return () => {
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleClick);
    };
  }, [handleClick]);

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
    const maxOrbit = Math.min(w, h) * 0.45;
    const maxDist = PLANETS[PLANETS.length - 1].distance;

    // Stars background
    const starSeed = 42;
    let s = starSeed;
    const pseudoRandom = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    for (let i = 0; i < 80; i++) {
      const sx = pseudoRandom() * w;
      const sy = pseudoRandom() * h;
      const sr = pseudoRandom() * 1.2;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + pseudoRandom() * 0.4})`;
      ctx.fill();
    }

    // Sun
    const sunR = 16;
    const sunGlow = ctx.createRadialGradient(cx, cy, sunR * 0.5, cx, cy, sunR * 2.5);
    sunGlow.addColorStop(0, "rgba(255, 200, 50, 0.4)");
    sunGlow.addColorStop(1, "rgba(255, 200, 50, 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, sunR * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = sunGlow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
    ctx.fillStyle = "#ffca28";
    ctx.fill();

    const positions: { x: number; y: number; planet: Planet }[] = [];
    const t = timeRef.current;

    for (const planet of PLANETS) {
      const orbitR = (planet.distance / maxDist) * maxOrbit;

      // Orbit path
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Planet position
      const angle = (t / planet.period) * 0.5;
      const px = cx + orbitR * Math.cos(angle);
      const py = cy + orbitR * Math.sin(angle);

      positions.push({ x: px, y: py, planet });

      // Planet
      ctx.beginPath();
      ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
      ctx.fillStyle = planet.color;
      ctx.fill();

      // Saturn ring
      if (planet.name === "Saturn") {
        ctx.beginPath();
        ctx.ellipse(px, py, planet.radius * 1.8, planet.radius * 0.5, 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 224, 130, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Highlight selected
      if (selectedPlanet?.name === planet.name) {
        ctx.beginPath();
        ctx.arc(px, py, planet.radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#69f0ae";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Name label
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.textAlign = "center";
      ctx.fillText(planet.nameJa, px, py + planet.radius + 12);
    }

    planetPositionsRef.current = positions;

    // Selected planet info
    if (selectedPlanet) {
      const infoX = w / 2;
      const infoY = h - 20;
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = selectedPlanet.color;
      ctx.textAlign = "center";
      ctx.fillText(
        `${selectedPlanet.nameJa} (${selectedPlanet.name}) - ${selectedPlanet.info}`,
        infoX,
        infoY,
      );
    }
  }, [selectedPlanet]);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      if (playing) {
        timeRef.current += 0.016 * speed;
      }
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [draw, playing, speed]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>太陽系の公転</h2>
        <p className="algo-subtitle">Solar System Orbits</p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>速度</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span className="value">{speed.toFixed(1)}x</span>
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
          惑星をクリックして情報を表示しよう。内側の惑星ほど公転が速い
        </p>
      </div>
    </div>
  );
}

export default SolarSystemVisualizer;
