import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

interface Element {
  symbol: string;
  name: string;
  nameJa: string;
  z: number; // atomic number
  shells: number[]; // electrons per shell
}

const ELEMENTS: Element[] = [
  { symbol: "H", name: "Hydrogen", nameJa: "水素", z: 1, shells: [1] },
  { symbol: "He", name: "Helium", nameJa: "ヘリウム", z: 2, shells: [2] },
  { symbol: "Li", name: "Lithium", nameJa: "リチウム", z: 3, shells: [2, 1] },
  { symbol: "Be", name: "Beryllium", nameJa: "ベリリウム", z: 4, shells: [2, 2] },
  { symbol: "B", name: "Boron", nameJa: "ホウ素", z: 5, shells: [2, 3] },
  { symbol: "C", name: "Carbon", nameJa: "炭素", z: 6, shells: [2, 4] },
  { symbol: "N", name: "Nitrogen", nameJa: "窒素", z: 7, shells: [2, 5] },
  { symbol: "O", name: "Oxygen", nameJa: "酸素", z: 8, shells: [2, 6] },
  { symbol: "F", name: "Fluorine", nameJa: "フッ素", z: 9, shells: [2, 7] },
  { symbol: "Ne", name: "Neon", nameJa: "ネオン", z: 10, shells: [2, 8] },
  { symbol: "Na", name: "Sodium", nameJa: "ナトリウム", z: 11, shells: [2, 8, 1] },
  { symbol: "Mg", name: "Magnesium", nameJa: "マグネシウム", z: 12, shells: [2, 8, 2] },
  { symbol: "Al", name: "Aluminium", nameJa: "アルミニウム", z: 13, shells: [2, 8, 3] },
  { symbol: "Si", name: "Silicon", nameJa: "ケイ素", z: 14, shells: [2, 8, 4] },
  { symbol: "P", name: "Phosphorus", nameJa: "リン", z: 15, shells: [2, 8, 5] },
  { symbol: "S", name: "Sulfur", nameJa: "硫黄", z: 16, shells: [2, 8, 6] },
  { symbol: "Cl", name: "Chlorine", nameJa: "塩素", z: 17, shells: [2, 8, 7] },
  { symbol: "Ar", name: "Argon", nameJa: "アルゴン", z: 18, shells: [2, 8, 8] },
  { symbol: "K", name: "Potassium", nameJa: "カリウム", z: 19, shells: [2, 8, 8, 1] },
  { symbol: "Ca", name: "Calcium", nameJa: "カルシウム", z: 20, shells: [2, 8, 8, 2] },
];

const SHELL_NAMES = ["K", "L", "M", "N"];

function AtomStructureVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(5); // Carbon
  const animRef = useRef(0);
  const timeRef = useRef(0);

  const element = ELEMENTS[selectedIndex];

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
    const maxShellR = Math.min(w, h) * 0.35;
    const shellCount = element.shells.length;
    const t = timeRef.current;

    // Nucleus
    const nucleusR = 16 + element.z * 0.3;
    const protons = element.z;
    const neutrons = Math.round(element.z * 1.1); // approximate

    // Nucleus glow
    const glow = ctx.createRadialGradient(cx, cy, nucleusR * 0.3, cx, cy, nucleusR * 1.5);
    glow.addColorStop(0, "rgba(239, 83, 80, 0.2)");
    glow.addColorStop(1, "rgba(239, 83, 80, 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, nucleusR * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Nucleus particles
    const particleSeed = element.z * 7;
    let s = particleSeed;
    const rand = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };

    for (let i = 0; i < Math.min(protons + neutrons, 30); i++) {
      const angle = rand() * Math.PI * 2;
      const dist = rand() * nucleusR * 0.7;
      const px = cx + dist * Math.cos(angle);
      const py = cy + dist * Math.sin(angle);
      const isProton = i < protons;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = isProton ? "#ef5350" : "#78909c";
      ctx.fill();
    }

    // Nucleus label
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(element.symbol, cx, cy);

    // Electron shells
    const shellColors = ["#42a5f5", "#69f0ae", "#ff9800", "#ab47bc"];

    for (let si = 0; si < shellCount; si++) {
      const shellR = nucleusR + 20 + (si / Math.max(shellCount - 1, 1)) * (maxShellR - nucleusR - 20);
      const actualR = shellCount === 1 ? maxShellR * 0.4 : shellR;

      // Shell orbit
      ctx.beginPath();
      ctx.arc(cx, cy, actualR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Shell label
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`${SHELL_NAMES[si]}殻`, cx + actualR + 20, cy);

      // Electrons
      const electronCount = element.shells[si];
      const speed = (3 - si) * 0.8 + 0.5;
      const color = shellColors[si % shellColors.length];

      for (let ei = 0; ei < electronCount; ei++) {
        const baseAngle = (ei / electronCount) * Math.PI * 2;
        const angle = baseAngle + t * speed;
        const ex = cx + actualR * Math.cos(angle);
        const ey = cy + actualR * Math.sin(angle);

        // Electron glow
        ctx.beginPath();
        ctx.arc(ex, ey, 6, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(")", ", 0.2)").replace("rgb", "rgba");
        ctx.fill();

        // Electron
        ctx.beginPath();
        ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    // Element info
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`${element.z} ${element.symbol}`, cx, 12);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText(`${element.nameJa} (${element.name})`, cx, 36);

    // Electron configuration notation
    const configStr = element.shells
      .map((count, i) => `${SHELL_NAMES[i]}:${count}`)
      .join("  ");
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "center";
    ctx.fillText(`電子配置: ${configStr}`, cx, h * 0.78);

    // Legend
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ef5350";
    ctx.fillText("\u25CF 陽子 (proton)", 12, h * 0.88);
    ctx.fillStyle = "#78909c";
    ctx.fillText("\u25CF 中性子 (neutron)", 12, h * 0.88 + 16);
    ctx.fillStyle = "#42a5f5";
    ctx.fillText("\u25CF 電子 (electron)", 12, h * 0.88 + 32);
  }, [element]);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      timeRef.current += 0.02;
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>原子の構造</h2>
        <p className="algo-subtitle">Atomic Structure & Electron Configuration</p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>元素</label>
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              padding: "4px 8px",
            }}
          >
            {ELEMENTS.map((el, i) => (
              <option key={el.symbol} value={i}>
                {el.z}. {el.symbol} ({el.nameJa})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          元素を選んで、原子核の周りを回る電子の配置を観察しよう
        </p>
      </div>
    </div>
  );
}

export default AtomStructureVisualizer;
