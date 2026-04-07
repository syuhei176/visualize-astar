import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

interface Particle {
  x: number;
  y: number;
  charge: 1 | -1;
  vx: number;
  vy: number;
}

function StaticElectricityVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const dragRef = useRef<{ index: number; offsetX: number; offsetY: number } | null>(null);
  const [chargeToPlace, setChargeToPlace] = useState<1 | -1>(1);
  const [showForceArrows, setShowForceArrows] = useState(true);
  const sizeRef = useRef({ w: 0, h: 0 });

  const initParticles = useCallback(() => {
    const w = sizeRef.current.w || 400;
    const h = sizeRef.current.h || 400;
    particlesRef.current = [
      { x: w * 0.35, y: h * 0.5, charge: 1, vx: 0, vy: 0 },
      { x: w * 0.65, y: h * 0.5, charge: -1, vx: 0, vy: 0 },
      { x: w * 0.5, y: h * 0.3, charge: 1, vx: 0, vy: 0 },
      { x: w * 0.5, y: h * 0.7, charge: -1, vx: 0, vy: 0 },
    ];
  }, []);

  const getCanvasPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const pos = getCanvasPos(e);
    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const dx = pos.x - particles[i].x;
      const dy = pos.y - particles[i].y;
      if (dx * dx + dy * dy < 30 * 30) {
        dragRef.current = { index: i, offsetX: dx, offsetY: dy };
        return;
      }
    }
    // Tap to add new particle
    particles.push({ x: pos.x, y: pos.y, charge: chargeToPlace, vx: 0, vy: 0 });
  }, [chargeToPlace, getCanvasPos]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    const p = particlesRef.current[dragRef.current.index];
    if (p) {
      p.x = pos.x - dragRef.current.offsetX;
      p.y = pos.y - dragRef.current.offsetY;
      p.vx = 0;
      p.vy = 0;
    }
  }, [getCanvasPos]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

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
    sizeRef.current = { w, h };
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    const k = 5000; // Coulomb constant (visual)

    // Compute forces
    const forces: { fx: number; fy: number }[] = particles.map(() => ({ fx: 0, fy: 0 }));
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[j].x - particles[i].x;
        const dy = particles[j].y - particles[i].y;
        const distSq = Math.max(dx * dx + dy * dy, 400);
        const dist = Math.sqrt(distSq);
        const forceMag = k * particles[i].charge * particles[j].charge / distSq;
        const fx = (forceMag * dx) / dist;
        const fy = (forceMag * dy) / dist;
        // Like charges: positive force = repel (push away)
        // Opposite charges: negative force = attract (pull toward)
        forces[i].fx -= fx;
        forces[i].fy -= fy;
        forces[j].fx += fx;
        forces[j].fy += fy;
      }
    }

    // Update non-dragged particles
    for (let i = 0; i < particles.length; i++) {
      if (dragRef.current && dragRef.current.index === i) continue;
      const p = particles[i];
      p.vx = (p.vx + forces[i].fx * 0.02) * 0.95;
      p.vy = (p.vy + forces[i].fy * 0.02) * 0.95;
      p.x += p.vx;
      p.y += p.vy;
      // Boundary
      if (p.x < 25) { p.x = 25; p.vx *= -0.5; }
      if (p.x > w - 25) { p.x = w - 25; p.vx *= -0.5; }
      if (p.y < 25) { p.y = 25; p.vy *= -0.5; }
      if (p.y > h - 25) { p.y = h - 25; p.vy *= -0.5; }
    }

    // Draw force arrows
    if (showForceArrows) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const fMag = Math.sqrt(forces[i].fx * forces[i].fx + forces[i].fy * forces[i].fy);
        if (fMag < 0.01) continue;
        const arrowLen = Math.min(fMag * 80, 120);
        const angle = Math.atan2(forces[i].fy, forces[i].fx);
        const ex = p.x + Math.cos(angle) * arrowLen;
        const ey = p.y + Math.sin(angle) * arrowLen;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = "#ffca28";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Arrowhead
        const headLen = 10;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headLen * Math.cos(angle - 0.4), ey - headLen * Math.sin(angle - 0.4));
        ctx.lineTo(ex - headLen * Math.cos(angle + 0.4), ey - headLen * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = "#ffca28";
        ctx.fill();
      }
    }

    // Draw force lines between particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[j].x - particles[i].x;
        const dy = particles[j].y - particles[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const attract = particles[i].charge !== particles[j].charge;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = attract
          ? `rgba(105, 240, 174, ${Math.min(0.4, 80 / dist)})`
          : `rgba(239, 83, 80, ${Math.min(0.4, 80 / dist)})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw particles
    for (const p of particles) {
      const radius = 22;
      const color = p.charge === 1 ? "#ef5350" : "#42a5f5";
      const glow = p.charge === 1 ? "rgba(239, 83, 80, 0.3)" : "rgba(66, 165, 245, 0.3)";

      // Glow
      const grad = ctx.createRadialGradient(p.x, p.y, radius * 0.5, p.x, p.y, radius * 2);
      grad.addColorStop(0, glow);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.charge === 1 ? "+" : "\u2212", p.x, p.y);
    }

    // Legend
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`Particles: ${particles.length}`, 12, 12);
  }, [showForceArrows]);

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
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

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>静電気</h2>
        <p className="algo-subtitle">Static Electricity &mdash; Coulomb&apos;s Law</p>
      </div>

      <div className="step-info">
        <p className="step-description">
          粒子をドラッグして距離を変えよう。タップで新しい電荷を追加できます
        </p>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%" }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      <div className="controls-bar" style={{ borderTop: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          className={chargeToPlace === 1 ? "btn-step" : "btn-reset"}
          onClick={() => setChargeToPlace(1)}
          style={chargeToPlace === 1 ? { background: "linear-gradient(135deg, #d32f2f, #ef5350)" } : undefined}
        >
          + 正電荷
        </button>
        <button
          className={chargeToPlace === -1 ? "btn-step" : "btn-reset"}
          onClick={() => setChargeToPlace(-1)}
          style={chargeToPlace === -1 ? { background: "linear-gradient(135deg, #1565c0, #42a5f5)" } : undefined}
        >
          &minus; 負電荷
        </button>
        <button
          className={showForceArrows ? "btn-step" : "btn-reset"}
          onClick={() => setShowForceArrows(!showForceArrows)}
        >
          力の矢印
        </button>
        <button
          className="btn-reset"
          onClick={initParticles}
        >
          リセット
        </button>
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ef5350" }}>+</span>
            <span className="stat-label">同符号 → 反発</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>&harr;</span>
            <span className="stat-label">異符号 → 引力</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#ffca28" }}>&rarr;</span>
            <span className="stat-label">近い → 力大</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaticElectricityVisualizer;
