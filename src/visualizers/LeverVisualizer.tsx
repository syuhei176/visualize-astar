import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

interface Weight {
  position: number; // -10 to +10 from fulcrum
  mass: number; // kg
}

function LeverVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [weights, setWeights] = useState<Weight[]>([
    { position: -4, mass: 3 },
    { position: 6, mass: 2 },
  ]);
  const [newPos, setNewPos] = useState(3);
  const [newMass, setNewMass] = useState(2);

  const leftMoment = weights
    .filter((w) => w.position < 0)
    .reduce((sum, w) => sum + Math.abs(w.position) * w.mass, 0);
  const rightMoment = weights
    .filter((w) => w.position > 0)
    .reduce((sum, w) => sum + Math.abs(w.position) * w.mass, 0);
  const balanced = Math.abs(leftMoment - rightMoment) < 0.5;
  const tiltAngle = Math.max(-15, Math.min(15, (rightMoment - leftMoment) * 1.5));

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
    const fulcrumY = h * 0.65;
    const beamLen = Math.min(w * 0.8, 400);
    const unitLen = beamLen / 20; // -10 to +10

    // Fulcrum (triangle)
    const triH = 30;
    const triW = 24;
    ctx.beginPath();
    ctx.moveTo(cx, fulcrumY);
    ctx.lineTo(cx - triW / 2, fulcrumY + triH);
    ctx.lineTo(cx + triW / 2, fulcrumY + triH);
    ctx.closePath();
    ctx.fillStyle = "#616161";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ground line
    ctx.beginPath();
    ctx.moveTo(cx - beamLen / 2 - 20, fulcrumY + triH);
    ctx.lineTo(cx + beamLen / 2 + 20, fulcrumY + triH);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("支点", cx, fulcrumY + triH + 16);

    // Beam (tilted)
    const tiltRad = (tiltAngle * Math.PI) / 180;
    const wobble = balanced ? 0 : Math.sin(timeRef.current * 0.03) * 0.5 * (Math.PI / 180);
    const effectiveTilt = tiltRad + wobble;

    ctx.save();
    ctx.translate(cx, fulcrumY);
    ctx.rotate(effectiveTilt);

    // Beam bar
    ctx.beginPath();
    ctx.moveTo(-beamLen / 2, -3);
    ctx.lineTo(beamLen / 2, -3);
    ctx.lineTo(beamLen / 2, 3);
    ctx.lineTo(-beamLen / 2, 3);
    ctx.closePath();
    ctx.fillStyle = balanced ? "#69f0ae" : "#ff9800";
    ctx.fill();

    // Tick marks
    for (let i = -10; i <= 10; i++) {
      const tx = i * unitLen;
      const tickH = i === 0 ? 8 : 5;
      ctx.beginPath();
      ctx.moveTo(tx, -tickH);
      ctx.lineTo(tx, tickH);
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (i % 2 === 0 && i !== 0) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(`${Math.abs(i)}`, tx, 6);
      }
    }

    // Weights
    for (const wt of weights) {
      const wx = wt.position * unitLen;
      const boxH = 16 + wt.mass * 6;
      const boxW = 28;

      ctx.fillStyle = wt.position < 0 ? "#42a5f5" : "#ef5350";
      ctx.beginPath();
      ctx.roundRect(wx - boxW / 2, -3 - boxH, boxW, boxH, 4);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${wt.mass}`, wx, -3 - boxH / 2);

      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "9px sans-serif";
      ctx.fillText("kg", wx, -3 - boxH / 2 + 12);

      // Gravity arrow
      ctx.beginPath();
      ctx.moveTo(wx, 5);
      ctx.lineTo(wx, 5 + wt.mass * 8);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wx, 5 + wt.mass * 8);
      ctx.lineTo(wx - 4, 5 + wt.mass * 8 - 5);
      ctx.moveTo(wx, 5 + wt.mass * 8);
      ctx.lineTo(wx + 4, 5 + wt.mass * 8 - 5);
      ctx.stroke();
    }

    ctx.restore();
  }, [weights, tiltAngle, balanced]);

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

  const addWeight = () => {
    if (newPos === 0) return;
    setWeights([...weights, { position: newPos, mass: newMass }]);
  };

  const removeLastWeight = () => {
    if (weights.length > 0) {
      setWeights(weights.slice(0, -1));
    }
  };

  const resetWeights = () => {
    setWeights([
      { position: -4, mass: 3 },
      { position: 6, mass: 2 },
    ]);
  };

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>てこの原理</h2>
        <p className="algo-subtitle">Lever Principle</p>
      </div>

      <div className="step-info">
        <p className="step-description">
          おもりを追加して、てこがつり合う条件を見つけよう（左のモーメント = 右のモーメント）
        </p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>
              {leftMoment.toFixed(1)}
            </span>
            <span className="stat-label">左モーメント</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: balanced ? "#69f0ae" : "#ff9800" }}>
              {balanced ? "=" : "\u2260"}
            </span>
            <span className="stat-label">{balanced ? "つり合い!" : "不均衡"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ef5350" }}>
              {rightMoment.toFixed(1)}
            </span>
            <span className="stat-label">右モーメント</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>位置</label>
          <input type="range" min="-10" max="10" step="1" value={newPos}
            onChange={(e) => setNewPos(Number(e.target.value))} />
          <span className="value">{newPos}</span>
        </div>
        <div className="slider-group">
          <label>質量</label>
          <input type="range" min="1" max="8" step="1" value={newMass}
            onChange={(e) => setNewMass(Number(e.target.value))} />
          <span className="value">{newMass}kg</span>
        </div>
      </div>

      <div className="controls-bar" style={{ borderTop: "none" }}>
        <button className="btn-step" onClick={addWeight} disabled={newPos === 0}>追加</button>
        <button className="btn-reset" onClick={removeLastWeight} disabled={weights.length === 0}>取り消し</button>
        <button className="btn-reset" onClick={resetWeights}>リセット</button>
      </div>
    </div>
  );
}

export default LeverVisualizer;
