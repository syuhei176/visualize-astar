import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function SolutionConcentrationVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [solute, setSolute] = useState(20); // grams
  const [water, setWater] = useState(180); // grams

  const concentration = (solute / (solute + water)) * 100;

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

    // Beaker
    const beakerX = w * 0.3;
    const beakerY = h * 0.2;
    const beakerW = w * 0.4;
    const beakerH = h * 0.5;
    const beakerBottom = beakerY + beakerH;

    // Beaker outline
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY);
    ctx.lineTo(beakerX, beakerBottom);
    ctx.lineTo(beakerX + beakerW, beakerBottom);
    ctx.lineTo(beakerX + beakerW, beakerY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Beaker bottom
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerBottom);
    ctx.lineTo(beakerX + beakerW, beakerBottom);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Solution level based on total volume
    const totalMass = solute + water;
    const maxMass = 300;
    const fillRatio = Math.min(totalMass / maxMass, 0.95);
    const fillH = beakerH * fillRatio;
    const fillTop = beakerBottom - fillH;

    // Solution color based on concentration
    const concRatio = concentration / 100;
    const r = Math.round(66 + concRatio * 180);
    const g = Math.round(165 - concRatio * 100);
    const b = Math.round(245 - concRatio * 200);
    const alpha = 0.3 + concRatio * 0.5;

    // Solution fill
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.fillRect(beakerX + 2, fillTop, beakerW - 4, fillH - 1);

    // Surface highlight
    ctx.beginPath();
    ctx.moveTo(beakerX + 2, fillTop);
    ctx.lineTo(beakerX + beakerW - 2, fillTop);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dissolved particles (more visible at higher concentration)
    const particleCount = Math.floor(concRatio * 50) + 5;
    let seed = 42;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    for (let i = 0; i < particleCount; i++) {
      const px = beakerX + 10 + rand() * (beakerW - 20);
      const py = fillTop + 5 + rand() * (fillH - 10);
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 100, ${0.3 + concRatio * 0.5})`;
      ctx.fill();
    }

    // Measurement lines on beaker
    for (let i = 1; i <= 4; i++) {
      const my = beakerBottom - (beakerH * i) / 5;
      ctx.beginPath();
      ctx.moveTo(beakerX + beakerW - 8, my);
      ctx.lineTo(beakerX + beakerW, my);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Beaker spout
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY);
    ctx.lineTo(beakerX - 8, beakerY - 4);
    ctx.moveTo(beakerX + beakerW, beakerY);
    ctx.lineTo(beakerX + beakerW + 8, beakerY - 4);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Formula display
    const formulaY = h * 0.78;
    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "center";
    ctx.fillText(
      `濃度 = 溶質 / (溶質 + 溶媒) × 100`,
      w / 2,
      formulaY,
    );

    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.fillStyle = "#42a5f5";
    ctx.fillText(
      `= ${solute} / (${solute} + ${water}) × 100`,
      w / 2,
      formulaY + 26,
    );

    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillStyle = "#ff9800";
    ctx.fillText(
      `= ${concentration.toFixed(1)}%`,
      w / 2,
      formulaY + 54,
    );

    // Labels
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ff9800";
    ctx.fillText(`溶質: ${solute}g`, beakerX + beakerW + 16, beakerBottom - fillH / 2 - 10);
    ctx.fillStyle = "#42a5f5";
    ctx.fillText(`溶媒(水): ${water}g`, beakerX + beakerW + 16, beakerBottom - fillH / 2 + 10);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText(`水溶液: ${totalMass}g`, beakerX + beakerW + 16, beakerBottom - fillH / 2 + 30);

    // Concentration bar
    const barX = w * 0.1;
    const barW = w * 0.8;
    const barY = h * 0.14;
    const barH = 16;

    // Background
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(barX, barY, barW, barH);

    // Gradient bar
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, "rgba(66, 165, 245, 0.5)");
    grad.addColorStop(0.5, "rgba(255, 152, 0, 0.7)");
    grad.addColorStop(1, "rgba(239, 83, 80, 0.8)");
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW * (concentration / 50), barH);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Percentage markers
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "center";
    for (let p = 0; p <= 50; p += 10) {
      const mx = barX + (p / 50) * barW;
      ctx.fillText(`${p}%`, mx, barY - 4);
    }

    // Current concentration indicator
    const indicatorX = barX + (concentration / 50) * barW;
    ctx.beginPath();
    ctx.moveTo(indicatorX, barY + barH);
    ctx.lineTo(indicatorX - 5, barY + barH + 8);
    ctx.lineTo(indicatorX + 5, barY + barH + 8);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
  }, [solute, water, concentration]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>水溶液の濃度</h2>
        <p className="algo-subtitle">Solution Concentration</p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>溶質</label>
          <input
            type="range"
            min="1"
            max="100"
            value={solute}
            onChange={(e) => setSolute(Number(e.target.value))}
          />
          <span className="value">{solute}g</span>
        </div>
        <div className="slider-group">
          <label>溶媒</label>
          <input
            type="range"
            min="10"
            max="300"
            value={water}
            onChange={(e) => setWater(Number(e.target.value))}
          />
          <span className="value">{water}g</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          溶質と溶媒の量を変えて、水溶液の濃度がどう変わるか観察しよう
        </p>
      </div>
    </div>
  );
}

export default SolutionConcentrationVisualizer;
