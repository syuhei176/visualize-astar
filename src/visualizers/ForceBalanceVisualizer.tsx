import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

interface Force {
  angle: number; // degrees
  magnitude: number; // N
  color: string;
}

const COLORS = ["#42a5f5", "#69f0ae", "#ff9800", "#ab47bc", "#ef5350", "#ffca28"];

function ForceBalanceVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [forces, setForces] = useState<Force[]>([
    { angle: 0, magnitude: 50, color: COLORS[0] },
    { angle: 120, magnitude: 50, color: COLORS[1] },
    { angle: 240, magnitude: 50, color: COLORS[2] },
  ]);

  const netFx = forces.reduce((s, f) => s + f.magnitude * Math.cos((f.angle * Math.PI) / 180), 0);
  const netFy = forces.reduce((s, f) => s + f.magnitude * Math.sin((f.angle * Math.PI) / 180), 0);
  const netForce = Math.sqrt(netFx * netFx + netFy * netFy);
  const isBalanced = netForce < 2;

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
    const t = timeRef.current;

    // Grid circles
    for (let r = 30; r <= 150; r += 30) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Cross lines
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy);
    ctx.lineTo(cx + 160, cy);
    ctx.moveTo(cx, cy - 160);
    ctx.lineTo(cx, cy + 160);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Object
    const objR = isBalanced ? 20 : 20 + Math.sin(t * 0.1) * 3;
    const objGlow = isBalanced ? "rgba(105, 240, 174, 0.2)" : "rgba(239, 83, 80, 0.2)";
    const glowGrad = ctx.createRadialGradient(cx, cy, objR * 0.5, cx, cy, objR * 2.5);
    glowGrad.addColorStop(0, objGlow);
    glowGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, objR * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, objR, 0, Math.PI * 2);
    ctx.fillStyle = isBalanced ? "#69f0ae" : "#ef5350";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isBalanced ? "\u2713" : "!", cx, cy);

    // Force arrows
    for (let i = 0; i < forces.length; i++) {
      const f = forces[i];
      const rad = (f.angle * Math.PI) / 180;
      const len = f.magnitude * 1.5;
      const ex = cx + Math.cos(rad) * len;
      const ey = cy - Math.sin(rad) * len; // canvas Y is inverted

      // Arrow line
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * (objR + 2), cy - Math.sin(rad) * (objR + 2));
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Arrowhead
      const headLen = 12;
      const angle = Math.atan2(ey - cy, ex - cx);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - headLen * Math.cos(angle - 0.35), ey - headLen * Math.sin(angle - 0.35));
      ctx.lineTo(ex - headLen * Math.cos(angle + 0.35), ey - headLen * Math.sin(angle + 0.35));
      ctx.closePath();
      ctx.fillStyle = f.color;
      ctx.fill();

      // Label
      const labelDist = len + 20;
      const lx = cx + Math.cos(rad) * labelDist;
      const ly = cy - Math.sin(rad) * labelDist;
      ctx.fillStyle = f.color;
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`F${i + 1}=${f.magnitude}N`, lx, ly);
    }

    // Net force arrow (if not balanced)
    if (!isBalanced) {
      const netLen = netForce * 1.5;
      const netAngle = Math.atan2(-netFy, netFx); // canvas Y inverted
      const nex = cx + Math.cos(netAngle) * netLen;
      const ney = cy + Math.sin(netAngle) * netLen;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nex, ney);
      ctx.strokeStyle = "#ffca28";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      const headLen = 12;
      ctx.beginPath();
      ctx.moveTo(nex, ney);
      ctx.lineTo(nex - headLen * Math.cos(netAngle - 0.35), ney - headLen * Math.sin(netAngle - 0.35));
      ctx.lineTo(nex - headLen * Math.cos(netAngle + 0.35), ney - headLen * Math.sin(netAngle + 0.35));
      ctx.closePath();
      ctx.fillStyle = "#ffca28";
      ctx.fill();

      ctx.fillStyle = "#ffca28";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`\u5408\u529b=${netForce.toFixed(1)}N`, nex + 15, ney + 15);
    }
  }, [forces, isBalanced, netFx, netFy, netForce]);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      timeRef.current += 1;
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [draw]);

  const updateForce = (index: number, field: "angle" | "magnitude", value: number) => {
    setForces(forces.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  const addForce = () => {
    if (forces.length >= 6) return;
    setForces([...forces, { angle: 0, magnitude: 30, color: COLORS[forces.length % COLORS.length] }]);
  };

  const removeForce = () => {
    if (forces.length <= 2) return;
    setForces(forces.slice(0, -1));
  };

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>力のつり合い</h2>
        <p className="algo-subtitle">Force Balance &mdash; Equilibrium</p>
      </div>

      <div className="step-info">
        <p className="step-description">
          {isBalanced
            ? "\u2705 つり合っています! 合力 = 0"
            : "力の大きさと角度を調整して、つり合いの条件を見つけよう"}
        </p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button className="btn-step" onClick={addForce} disabled={forces.length >= 6}>
          力を追加
        </button>
        <button className="btn-reset" onClick={removeForce} disabled={forces.length <= 2}>
          力を削除
        </button>
      </div>

      {forces.map((f, i) => (
        <div className="controls-bar" key={i} style={{ borderTop: i === 0 ? undefined : "none" }}>
          <span style={{ color: f.color, fontWeight: 700, fontSize: 13, minWidth: 24 }}>F{i + 1}</span>
          <div className="slider-group">
            <label>角度</label>
            <input type="range" min="0" max="360" step="5" value={f.angle}
              onChange={(e) => updateForce(i, "angle", Number(e.target.value))} />
            <span className="value">{f.angle}&deg;</span>
          </div>
          <div className="slider-group">
            <label>大きさ</label>
            <input type="range" min="10" max="100" step="5" value={f.magnitude}
              onChange={(e) => updateForce(i, "magnitude", Number(e.target.value))} />
            <span className="value">{f.magnitude}N</span>
          </div>
        </div>
      ))}

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>{netFx.toFixed(1)}N</span>
            <span className="stat-label">&Sigma;Fx</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>{netFy.toFixed(1)}N</span>
            <span className="stat-label">&Sigma;Fy</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: isBalanced ? "#69f0ae" : "#ffca28" }}>
              {netForce.toFixed(1)}N
            </span>
            <span className="stat-label">合力</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: isBalanced ? "#69f0ae" : "#ef5350" }}>
              {isBalanced ? "YES" : "NO"}
            </span>
            <span className="stat-label">つり合い</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForceBalanceVisualizer;
